# Paystack Payment vs. Student Registration Architecture & Root-Cause Analysis

> **Executive Summary:**  
> In production, guardians/students make payments successfully through Paystack, and money is debited from their cards. However, in certain cases, student accounts fail to activate, courses are not enrolled, or student records are not created. This document details the exact technical root causes across the frontend and backend, explains why server-to-server webhook verification alone did not resolve the issue, and provides an end-to-end remediation blueprint.

---

## 1. System Payment & Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend Client                       │
│ 1. Student / Guardian enters registration details.          │
│ 2. Selects Courses, Durations, and Subjects.                │
│ 3. Paystack Popup opens with public key & metadata.         │
│ 4. Card is charged -> Paystack returns reference.           │
│ 5. Frontend calls POST /api/payments/verify-paystack.        │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               │ (Direct Verification)         │ (Payment Authorization)
               ▼                               ▼
┌───────────────────────────────┐     ┌────────────────────────────────┐
│   TutorialCenter Backend      │     │       Paystack Payment Gateway │
│   PaymentController           │     │       api.paystack.co          │
│   verifyPaystackPayment()     │     │                                │
└──────────────┬────────────────┘     └────────────────┬───────────────┘
               │                                       │
               │ 6. Verify reference with Paystack     │
               ├───────────────────────────────────────┤
               │                                       │
               │ 7. Server-to-Server Webhook           │
               │    POST /api/paystack/webhook         │
               │    (charge.success)                   │
               │<──────────────────────────────────────┘
               ▼
┌─────────────────────────────────────────────────────────────┐
│         PaystackService::processSuccessfulPayment()          │
│                                                             │
│ 8. Resolve Student:                                         │
│    - Try metadata['student_id'] -> Student::find(...)       │
│    - Fallback: Student::where('email', $customerEmail)      │
│                                                             │
│ 9. Enroll in Courses & Attach Subjects                      │
│    - CoursesEnrollment::updateOrCreate(...)                 │
│    - SubjectsEnrollment::updateOrCreate(...)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Root Causes: Why Payment Succeeds but Registration Fails

### Root Cause 1: Student Identity Resolution Mismatch (Primary Breakdown)
In `PaystackService.php`, student resolution relies on two steps:
```php
// Step 1: Look up student by metadata ID
$studentId = $metadata['student_id'] ?? ($fallbackContext['student_id'] ?? null);
$student = $studentId ? Student::find($studentId) : null;

// Step 2: Fallback to customer email from Paystack
if (!$student && $customerEmail) {
    $student = Student::where('email', $customerEmail)
        ->orWhere('tel', explode('@', $customerEmail)[0])
        ->first();
}

// Step 3: Hard Crash if student not found
if (!$student) {
    throw new \RuntimeException("Student could not be resolved for payment reference {$reference}");
}
```

#### Why it fails in production:
1. **Missing `student_id` in Metadata:** If a student registers on one device/tab and completes payment after storage loss, `studentData.id` in `localStorage` is `null` or `undefined`.
2. **Payer Email vs. Student Email Divergence:** When a **parent or guardian** pays on behalf of their ward, Paystack records the cardholder's email (e.g., `parent@gmail.com`).
3. The backend then queries: `Student::where('email', 'parent@gmail.com')`.
4. Because the student is registered under their own email (`student@example.com`), the lookup returns **`null`**.
5. The backend throws a `RuntimeException`, aborting the database transaction and rolling back course enrollment. Paystack debited the card, but the student remains un-enrolled.

---

### Root Cause 2: Integrity Constraint Crash on `subject_id = 0`
In `storage/logs/laravel.log`:
```text
SQLSTATE[23000]: Integrity constraint violation: 19 FOREIGN KEY constraint failed:
insert into "subjects_enrollments" ("course_enrollment_id", "student_id", "subject_id", ...) 
values (19, 24, 0, ...)
```

#### Why it fails:
When subjects are sent as string names (e.g. `["English Language", "Mathematics"]`) instead of numerical IDs, or if subject names do not match the database records exactly:
```php
$subObj = \App\Models\Subject::where('name', trim($subjectItem))->first();
$subId = $subObj ? $subObj->id : 0;
```
If `$subId` resolves to `0`, inserting into `subjects_enrollments` violates the foreign key constraint on the `subjects` table. The entire transaction rolls back.

---

### Root Cause 3: Webhook HMAC Signature Mismatch (`400 Invalid Signature`)
In `PaystackWebhookController.php`:
```php
$signature = $request->header('x-paystack-signature');
if (!$this->paystackService->validateWebhookSignature($rawPayload, $signature)) {
    Log::warning('Paystack webhook received with invalid signature');
    return response()->json(['message' => 'Invalid signature.'], 400);
}
```
If the live server's `PAYSTACK_SECRET_KEY` does not match the secret key of the Paystack dashboard where the webhook was registered, or if `.env` has trailing whitespace, every webhook attempt is rejected with HTTP 400.

---

### Root Cause 4: Secret Key Formatting Error (`401 secret_key_invalid`)
In `storage/logs/laravel.log`:
```text
Paystack verification HTTP error: {"status":401, "body":{"status":false,"message":"Format is Authorization Bearer [secret key]","code":"secret_key_invalid"}}
```
If `PAYSTACK_SECRET_KEY` in the live `.env` contains surrounding quotation marks, extra whitespace, or an invalid prefix, calls to `https://api.paystack.co/transaction/verify/{ref}` fail with HTTP 401.

---

## 3. Actionable Remediation Blueprint

### A. Frontend Enhancements (`StudentTrainingPayment.jsx`)
Always include explicit student identifiers in `paystackMetadata`:
```javascript
const paystackMetadata = useMemo(() => {
  return {
    type: "student_enrollment",
    student_id: studentData?.id || studentData?.data?.id || null,
    student_email: studentData?.email || studentData?.data?.email || null,
    student_tel: studentData?.tel || studentData?.data?.tel || null,
    courses: formattedCourses,
    referral_code: studentData?.referral_code || null,
  };
}, [studentData, selectedDurations]);
```

### B. Backend Robustness (`PaystackService.php`)
1. **Multi-Field Student Resolution:**
   Check `student_id`, then `metadata['student_email']`, then `metadata['student_tel']`, and only lastly fall back to `$customerEmail`.
2. **Safe Subject Attachment:**
   Check `if ($subId > 0 && Subject::where('id', $subId)->exists())` before inserting into `subjects_enrollments`. If an invalid subject name is supplied, log a warning instead of aborting the entire payment enrollment.
3. **Webhook Whitelist:**
   Ensure `api/paystack/webhook` is excluded from CSRF middleware and verify that `PAYSTACK_SECRET_KEY` matches the Paystack dashboard secret key without trailing spaces.
