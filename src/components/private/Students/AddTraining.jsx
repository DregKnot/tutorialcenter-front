import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import {  
  ChevronLeftIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import SubjectSelectionModal from "./SubjectSelectionModal";
import ReviewSelectionModal from "./ReviewSelectionModal";
import TrainingDurationModal from "./TrainingDurationModal";
import PaymentMethodModal from "./PaymentMethodModal";
import { clearDashboardCache } from "../../../utils/dashboardCache.js";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

export default function AddTraining({ onBack, onSuccess, onRenewCourse }) {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentStep, setCurrentStep] = useState("selection"); // selection, subjects, review, duration, payment
  
  // Modal Data
  const [subjectsByCourse, setSubjectsByCourse] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedDurations, setSelectedDurations] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [enrollments, setEnrollments] = useState({});
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const enrollLock = useRef(false);
  
  const token = localStorage.getItem("student_token");

  // Student Context
  const student = useMemo(() => {
    try {
      const storedData = JSON.parse(localStorage.getItem("studentdata"));
      const storedInfo = JSON.parse(localStorage.getItem("student_info"));
      return storedInfo || storedData?.data || storedInfo?.data || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allCoursesRes, activeRes, paymentsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/courses`),
          axios.get(`${API_BASE_URL}/api/students/courses`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { courses: [] } })),
          axios.get(`${API_BASE_URL}/api/students/payments`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { payments: [] } }))
        ]);

        const allCourses = allCoursesRes.data.data || allCoursesRes.data.courses || [];
        const enrolled = activeRes.data?.courses || activeRes.data?.data || [];
        const paymentsList = paymentsRes.data?.payments || paymentsRes.data?.courses || paymentsRes.data?.data || [];

        setCourses(allCourses);
        setEnrolledCourses(Array.isArray(enrolled) ? enrolled : []);
        setPaymentsHistory(Array.isArray(paymentsList) ? paymentsList : []);
      } catch (err) {
        console.error("Failed to fetch courses and payment history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const toggleCourseSelection = (course) => {
    setSelectedCourses(prev => {
      const isSelected = prev.find(c => c.id === course.id);
      if (isSelected) {
        return prev.filter(c => c.id !== course.id);
      }
      return [...prev, course];
    });
  };

  const subjectIdsFor = useCallback(
    (courseId) =>
      selectedSubjects[courseId] ||
      selectedSubjects[String(courseId)] ||
      selectedSubjects[Number(courseId)] ||
      [],
    [selectedSubjects]
  );

  // Step 1 (must happen before payment): create a pending enrollment per course
  // and keep the server-computed price so the amount charged matches the enrollment.
  const prepareEnrollments = async (durationsOverride) => {
    if (!student || !selectedCourses.length || enrollLock.current) return;
    const durations = durationsOverride || selectedDurations;
    const studentId = Number(student.id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      setEnrollError("Your student profile could not be found. Please sign in again before continuing.");
      return;
    }

    enrollLock.current = true;
    setEnrolling(true);
    setEnrollError("");
    let currentTitle = "";

    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      };
      const next = { ...enrollments };
      let total = 0;

      for (const course of selectedCourses) {
        currentTitle = course.title || `Course #${course.id}`;
        const billingCycle = durations[course.id]?.duration || "monthly";

        const response = await axios.post(`${API_BASE_URL}/api/course/enrollment`, {
          student_id: studentId,
          course_id: Number(course.id),
          billing_cycle: billingCycle
        }, { headers, timeout: 30000 });

        const enrollment = response.data?.enrollment;
        const cost = Number(enrollment?.cost);
        if (
          ![200, 201].includes(response.status) ||
          response.data?.success !== true ||
          !Number.isInteger(Number(enrollment?.id)) || Number(enrollment.id) <= 0 ||
          Number(enrollment.student_id) !== studentId ||
          Number(enrollment.course_id) !== Number(course.id) ||
          enrollment.billing_cycle !== billingCycle ||
          enrollment.status !== "pending" ||
          enrollment.cost == null || enrollment.cost === "" ||
          !Number.isFinite(cost) || cost <= 0
        ) {
          throw new Error(
            response.data?.success !== true && response.data?.message
              ? response.data.message
              : "The server did not return a valid pending enrollment and price. Please retry."
          );
        }

        next[course.id] = {
          course_enrollment_id: Number(enrollment.id),
          billing_cycle: enrollment.billing_cycle,
          cost
        };
        total += cost;
        setEnrollments({ ...next });
      }

      setTotalAmount(total);
      setCurrentStep("payment");
    } catch (err) {
      const validation = Object.values(err.response?.data?.errors || {}).flat().join(" ");
      const message = validation || err.response?.data?.message || err.message ||
        "Unable to prepare your enrollment. Please retry.";
      setEnrollError(
        err.response?.status === 409
          ? `${currentTitle}: You have previously registered for this course. Please renew it directly instead of creating a new enrollment.`
          : `${currentTitle ? `${currentTitle}: ` : ""}${message}`
      );
    } finally {
      enrollLock.current = false;
      setEnrolling(false);
    }
  };

  // Metadata handed to Paystack so the backend can resolve the courses (registration parity).
  const paystackMetadata = useMemo(() => ({
    type: "student_enrollment",
    student_id: student?.id,
    courses: selectedCourses.map((course) => {
      const enrollment = enrollments[course.id];
      const duration = selectedDurations[course.id];
      return {
        course_id: Number(course.id),
        billing_cycle: enrollment?.billing_cycle || duration?.duration || "monthly",
        price: Number(enrollment?.cost ?? duration?.price ?? 0),
        subjects: subjectIdsFor(course.id)
      };
    })
  }), [student, selectedCourses, enrollments, selectedDurations, subjectIdsFor]);

  // Lane A: the client only supplies the Paystack reference; the server decides "paid".
  const finishSuccess = (message) => {
    if (student?.id) {
      clearDashboardCache(student.id);
    }
    if (onSuccess) {
      onSuccess(message);
    } else {
      onBack(); // Return to main view
    }
  };

  const bankEnrollments = useMemo(
    () =>
      selectedCourses
        .map((course) => {
          const enrollment = enrollments[course.id];
          if (!enrollment?.course_enrollment_id) return null;
          return {
            enrollmentId: enrollment.course_enrollment_id,
            courseName: course.title || `Course #${course.id}`,
            amount: enrollment.cost,
          };
        })
        .filter(Boolean),
    [selectedCourses, enrollments]
  );

  const handlePaymentSuccess = async (response) => {
    if (!student || !selectedCourses.length || processing) return;
    const reference = response?.reference;
    if (!reference) {
      alert("No payment reference was returned. Contact support before making another payment.");
      return;
    }

    setProcessing(true);
    try {
      const result = await axios.post(`${API_BASE_URL}/api/payments/verify-paystack`, {
        reference,
        fallback_metadata: paystackMetadata
      }, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        timeout: 30000
      });

      if (result.status !== 200 || result.data?.success !== true) {
        throw new Error(result.data?.message || "Payment has not been confirmed.");
      }

      finishSuccess("Training and subjects registered successfully!");
    } catch (err) {
      console.error("Payment verification failed", err);
      alert(
        `${err.response?.data?.message || err.message || "Unable to verify payment."} ` +
        `If you were charged, do not pay again. Contact support with reference ${reference}.`
      );
    } finally {
      setProcessing(false);
    }
  };

  // Lane B: bank transfer is confirmed by an admin; the enrollment becomes active on approval.
  const handleBankSettled = () => {
    finishSuccess("Bank transfer approved. Your training is now active!");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden pt-4">

      {enrollError && (
        <div role="alert" className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[92%] max-w-md rounded-2xl bg-red-600 px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <span>{enrollError}</span>
            <button type="button" onClick={() => setEnrollError("")} className="shrink-0 text-white/80 hover:text-white" aria-label="Dismiss error">✕</button>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 group w-fit"
      >
        <ChevronLeftIcon className="w-4 h-4 text-gray-500 group-hover:text-[#0F2843] transition-colors" />
        <span className="text-sm text-gray-500 group-hover:text-[#0F2843] transition-colors">
          Back / <span className="font-bold text-[#0F2843]">Add Training</span>
        </span>
      </button>

      <div className="flex-1 bg-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-black text-[#0F2843]">Select Examinations</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-lg">
              Select the examinations you want to enroll in. If you've previously registered or paid for a course (e.g. WAEC, JAMB), click <span className="font-bold text-amber-700">Renew</span> to extend or reactivate your subscription at once.
            </p>
          </div>

          {/* Quick Status Legend */}
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider shrink-0 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" /> Available to Add
            </span>
            <span className="flex items-center gap-1.5 text-green-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#76D287] inline-block" /> Selected
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Paid Before (Renew)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#09314F]/10 border-t-[#09314F] rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading available courses & payment history...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {courses.map((course) => {
              const courseTitleLower = course.title?.trim().toLowerCase();
              const courseIdNum = Number(course.id);

              // 1. Check in enrolled courses
              const enrolledRecord = enrolledCourses.find(
                e => Number(e.course_id) === courseIdNum || 
                     Number(e.course?.id) === courseIdNum ||
                     (e.course?.title && e.course.title.trim().toLowerCase() === courseTitleLower) ||
                     (e.course_name && e.course_name.trim().toLowerCase() === courseTitleLower)
              );

              // 2. Check in payment history (has paid for this course before)
              const paymentRecord = paymentsHistory.find(
                p => Number(p.course_id) === courseIdNum || 
                     Number(p.course?.id) === courseIdNum ||
                     (p.course?.title && p.course.title.trim().toLowerCase() === courseTitleLower) ||
                     (p.course_name && p.course_name.trim().toLowerCase() === courseTitleLower) ||
                     (p.course_title && p.course_title.trim().toLowerCase() === courseTitleLower)
              );

              const isPaidBeforeOrEnrolled = !!enrolledRecord || !!paymentRecord;
              const isSelected = selectedCourses.find(c => c.id === course.id);

              const status = (enrolledRecord?.status || paymentRecord?.status || 'active').toLowerCase();
              const isExpired = status === 'cancelled' || status === 'removed' || status === 'expired' || status === 'inactive' || status === 'unpaid';

              // Build unified renew target record
              const renewTarget = enrolledRecord || {
                ...paymentRecord,
                course_id: course.id,
                enrollment_id: paymentRecord?.course_enrollment_id || paymentRecord?.enrollment_id || paymentRecord?.id,
                course: course,
                course_name: course.title,
                title: course.title
              };

              // ── Previously Paid / Registered Course (Yellow / Amber State) ──
              if (isPaidBeforeOrEnrolled) {
                return (
                  <button
                    key={course.id}
                    onClick={() => {
                      if (onRenewCourse) {
                        onRenewCourse(renewTarget);
                      }
                    }}
                    title={`You have previously registered for ${course.title}. Click to renew.`}
                    className="relative min-h-[96px] py-4 px-3 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100/90 text-center flex flex-col items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <span className="text-sm font-black uppercase tracking-wider text-amber-950">
                      {course.title}
                    </span>
                    <span className="mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 transition-colors">
                      <ArrowPathIcon className="w-3 h-3 stroke-[2.5]" />
                      {isExpired ? "Expired • Renew" : "Registered • Renew"}
                    </span>
                  </button>
                );
              }

              // ── Never Registered Course (Normal / Selected State) ──
              return (
                <button
                  key={course.id}
                  onClick={() => toggleCourseSelection(course)}
                  className={`relative min-h-[96px] py-4 px-3 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col items-center justify-center group ${
                    isSelected 
                      ? "bg-[#76D287] border-green-500 shadow-lg scale-[1.02]" 
                      : "bg-[#D1D5DB] border-transparent hover:bg-gray-300 hover:scale-[1.01]"
                  }`}
                >
                  <span className="text-sm font-black uppercase tracking-wider text-[#0F2843]">
                    {course.title}
                  </span>
                  {isSelected && (
                    <span className="mt-2 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-[#0F2843] text-white">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedCourses.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setCurrentStep("subjects")}
              className="w-full py-5 px-10 rounded-xl font-black text-lg text-white bg-[#0F2843] shadow-xl hover:shadow-[#0F284344] transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Continue with ({selectedCourses.length}) Selected {selectedCourses.length === 1 ? 'Course' : 'Courses'}
            </button>
          </div>
        )}
      </div>

      {/* Shared Modals */}
      <SubjectSelectionModal
        isOpen={currentStep === "subjects"}
        onClose={() => setCurrentStep("selection")}
        selectedCourses={selectedCourses}
        department={student?.department || "science"}
        onContinue={(subs, allSubs) => {
          setSelectedSubjects(subs);
          setSubjectsByCourse(allSubs);
          setCurrentStep("review");
        }}
      />

      <ReviewSelectionModal
        isOpen={currentStep === "review"}
        onClose={() => setCurrentStep("selection")}
        selectedCourses={selectedCourses}
        selectedSubjects={selectedSubjects}
        subjectsByCourse={subjectsByCourse}
        onEdit={() => setCurrentStep("subjects")}
        onContinue={() => setCurrentStep("duration")}
      />

      <TrainingDurationModal
        isOpen={currentStep === "duration"}
        onClose={() => setCurrentStep("selection")}
        selectedCourses={selectedCourses}
        loading={enrolling}
        onContinue={(durs, total) => {
          setSelectedDurations(durs);
          setTotalAmount(total);
          prepareEnrollments(durs);
        }}
      />

      <PaymentMethodModal
        isOpen={currentStep === "payment"}
        onClose={() => setCurrentStep("selection")}
        amount={totalAmount}
        email={student?.email}
        metadata={paystackMetadata}
        bankEnrollments={bankEnrollments}
        studentId={student?.id}
        onBankSettled={handleBankSettled}
        selectedMethod={selectedPaymentMethod}
        setSelectedMethod={setSelectedPaymentMethod}
        loading={processing || enrolling}
        onContinue={handlePaymentSuccess}
      />
    </div>
  );
}
