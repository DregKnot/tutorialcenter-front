import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import axios from "axios";
import { location as locationList } from "../../../data/locations";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  ArrowPathIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  LockClosedIcon,
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowPathRoundedSquareIcon,
  SparklesIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  ClockIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://tutorialcenter-back.test" ||
  "http://localhost:8000";

/* ======================================================
   PASSWORD GENERATOR UTILITY
====================================================== */
function generateStrongPassword(length = 14) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%&*?";
  const all = upper + lower + digits + symbols;
  let pw =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digits[Math.floor(Math.random() * digits.length)] +
    symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = pw.length; i < length; i++)
    pw += all[Math.floor(Math.random() * all.length)];
  return pw
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/* ======================================================
   TOAST COMPONENT
====================================================== */
function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div
      className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-bold animate-in slide-in-from-right-8 fade-in duration-300 ${
        isSuccess
          ? "bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
          : "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
      }`}
    >
      {isSuccess ? (
        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
      <span className="max-w-xs">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ======================================================
   VERIFICATION MODAL (Post-creation email/phone verify)
====================================================== */
function VerificationModal({ student, onClose, onVerified }) {
  const [verifyMode, setVerifyMode] = useState("email"); // "email" | "phone"
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const token = localStorage.getItem("staff_token");

  const handleVerify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    try {
      if (verifyMode === "email") {
        const endpoint = `${API_BASE_URL}/api/students/verify-email`;
        const payload = { token: code.trim() };
        console.log(`[AdminCreateStudent] [POST] Verifying Email -> ${endpoint}`, payload);

        const res = await axios.post(endpoint, payload, { headers });
        console.log("[AdminCreateStudent] Email Verification Response:", res.data);
      } else {
        const endpoint = `${API_BASE_URL}/api/students/verify-phone`;
        const payload = { tel: student.tel, otp: code.trim() };
        console.log(`[AdminCreateStudent] [POST] Verifying Phone OTP -> ${endpoint}`, payload);

        const res = await axios.post(endpoint, payload, { headers });
        console.log("[AdminCreateStudent] Phone Verification Response:", res.data);
      }
      setResult({
        type: "success",
        message: `${verifyMode === "email" ? "Email" : "Phone"} verified successfully!`,
      });
      if (onVerified) onVerified();
    } catch (err) {
      console.error(`[AdminCreateStudent] [${verifyMode.toUpperCase()}] Verification Error:`, err.response?.data || err);
      setResult({
        type: "error",
        message:
          err.response?.data?.message ||
          "Verification failed. Please check the code.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B2740] rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[#09314F] to-[#0F4068]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-[#C5A97A]" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm">
                  Verify Student Contact
                </h3>
                <p className="text-white/60 text-xs font-medium mt-0.5">
                  {student?.firstname} {student?.surname}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Toggle: Email / Phone */}
          <div className="flex bg-gray-100 dark:bg-[#06243A] rounded-2xl p-1 gap-1">
            {["email", "phone"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setVerifyMode(m);
                  setCode("");
                  setResult(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  verifyMode === m
                    ? "bg-white dark:bg-[#09314F] text-[#09314F] dark:text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {m === "email" ? "📧 Email Token" : "📱 Phone OTP"}
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 leading-relaxed">
              {verifyMode === "email"
                ? `A verification token was sent to ${student?.email || "the student's email"}. Enter it below or skip to let them verify independently.`
                : `An OTP was sent to ${student?.tel || "the student's phone"}. Enter it below or skip to let them verify independently.`}
            </p>
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
              {verifyMode === "email"
                ? "Email Verification Token"
                : "Phone OTP Code"}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={
                verifyMode === "email"
                  ? "Paste the email token..."
                  : "Enter 6-digit OTP..."
              }
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all tracking-widest text-center"
            />
          </div>

          {/* Result */}
          {result && (
            <div
              className={`rounded-2xl p-3 text-xs font-bold text-center ${
                result.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800"
              }`}
            >
              {result.message}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Skip for Now
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || !code.trim()}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                loading || !code.trim()
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#09314F] to-[#C5A97A] text-white hover:opacity-90 active:scale-[0.98] shadow-lg"
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   RECOVERY CONFIRMATION MODAL
====================================================== */
function RecoveryModal({ payment, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  const [gwRef, setGwRef] = useState(payment?.gateway_reference || "");

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B2740] rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[#09314F] to-[#0F4068]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <ArrowPathRoundedSquareIcon className="w-5 h-5 text-[#C5A97A]" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm">
                  Confirm Registration Recovery
                </h3>
                <p className="text-white/60 text-xs font-medium mt-0.5">
                  Payment #{payment?.id} —{" "}
                  {payment?.student?.firstname} {payment?.student?.surname}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/40 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 leading-relaxed">
              This action will mark the payment as <strong>successful</strong>{" "}
              and activate the student's enrollment. Ensure payment was confirmed
              on the gateway dashboard before proceeding.
            </p>
          </div>

          {/* Gateway Ref */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
              Gateway Reference
            </label>
            <input
              type="text"
              value={gwRef}
              onChange={(e) => setGwRef(e.target.value)}
              placeholder="e.g. PAYSTACK-REF-12345"
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
              Recovery Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Student reported a failed registration and the payment was confirmed on the Paystack dashboard."
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onConfirm({
                  payment_id: payment.id,
                  gateway_reference: gwRef.trim(),
                  reason: reason.trim(),
                })
              }
              disabled={loading || !reason.trim()}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                loading || !reason.trim()
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#09314F] to-[#E83831] text-white hover:opacity-90 active:scale-[0.98] shadow-lg"
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Recovering..." : "Recover Registration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   EXTEND ACCESS MODAL (For Active Courses)
====================================================== */
function ExtendAccessModal({ student, enrollment, onClose, onConfirm, loading }) {
  const [extensionType, setExtensionType] = useState("preset"); // "preset" | "custom"
  const [months, setMonths] = useState(1);
  const [customEndDate, setCustomEndDate] = useState("");
  const [reason, setReason] = useState("");

  const currentEndDate = useMemo(() => {
    return enrollment?.end_date ? new Date(enrollment.end_date) : null;
  }, [enrollment?.end_date]);

  const isFuture = useMemo(() => {
    return Boolean(currentEndDate && currentEndDate > new Date());
  }, [currentEndDate]);

  const previewEndDate = useMemo(() => {
    if (extensionType === "custom") {
      if (!customEndDate) return "Select target date";
      return new Date(customEndDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    const base = isFuture ? new Date(currentEndDate) : new Date();
    base.setMonth(base.getMonth() + Number(months));
    return base.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [extensionType, months, customEndDate, currentEndDate, isFuture]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm({
      enrollmentId: enrollment.id,
      months: extensionType === "preset" ? months : undefined,
      customEndDate: extensionType === "custom" ? customEndDate : undefined,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-[#0B2740] rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[#09314F] to-[#0F4068]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                <ClockIcon className="w-5 h-5 text-[#C5A97A]" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm">
                  Extend Course Registration Access
                </h3>
                <p className="text-white/70 text-xs font-medium mt-0.5">
                  {student?.firstname} {student?.surname} • {enrollment?.course?.title || "Active Course"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Expiry Banner */}
          <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                Current Expiration Date
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">
                {currentEndDate
                  ? currentEndDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "No Expiration Recorded"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                New Preview Expiry
              </span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                {previewEndDate}
              </span>
            </div>
          </div>

          {/* Extension Mode Toggle */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
              Extension Method
            </label>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-[#06243A] p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setExtensionType("preset")}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  extensionType === "preset"
                    ? "bg-[#09314F] text-white shadow"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Standard Presets
              </button>
              <button
                type="button"
                onClick={() => setExtensionType("custom")}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  extensionType === "custom"
                    ? "bg-[#09314F] text-white shadow"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Custom Date
              </button>
            </div>
          </div>

          {/* Presets or Custom Date Input */}
          {extensionType === "preset" ? (
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                Select Additional Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "+1 Month", value: 1 },
                  { label: "+3 Months", value: 3 },
                  { label: "+6 Months", value: 6 },
                  { label: "+1 Year", value: 12 },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMonths(item.value)}
                    className={`py-3 px-3 rounded-2xl border text-xs font-black transition-all ${
                      months === item.value
                        ? "border-[#C5A97A] bg-[#C5A97A]/10 text-[#C5A97A] dark:text-[#E8D4B0] shadow-sm"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] text-gray-600 dark:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                Target Expiration Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all cursor-pointer"
                required
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
              Extension Reason & Audit Note <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Granted 30-day exam preparation extension per academic advisor approval."
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim() || (extensionType === "custom" && !customEndDate)}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                loading || !reason.trim() || (extensionType === "custom" && !customEndDate)
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#09314F] to-[#0F4068] text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[#09314F]/20"
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Extending..." : "Confirm Extension"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ======================================================
   RENEW COURSE MODAL (For Expired Courses)
====================================================== */
function RenewCourseModal({ student, enrollment, onClose, onConfirm, loading }) {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [amount, setAmount] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [reason, setReason] = useState("");

  const course = enrollment?.course || {};
  const baseCoursePrice = Number(course?.price || 0);

  // Compute default price when billing cycle changes
  const computedFee = useMemo(() => {
    if (!baseCoursePrice) return 0;
    const months =
      billingCycle === "monthly"
        ? 1
        : billingCycle === "quarterly"
        ? 3
        : billingCycle === "semi_annual"
        ? 6
        : 12;
    let fee = baseCoursePrice * months;
    if (months > 1) fee *= 0.95; // 5% discount
    return Math.round(fee);
  }, [baseCoursePrice, billingCycle]);

  // Sync amount when billingCycle changes
  useEffect(() => {
    if (computedFee > 0) {
      setAmount(computedFee.toString());
    }
  }, [computedFee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!referenceCode.trim() || !reason.trim() || isNaN(amount) || Number(amount) < 0) {
      return;
    }
    onConfirm({
      enrollmentId: enrollment.id,
      billing_cycle: billingCycle,
      amount: parseFloat(amount),
      reference_code: referenceCode.trim(),
      payment_method: paymentMethod,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-[#0B2740] rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[#C5A97A] to-[#D4B98C]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                <ArrowPathIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm">
                  Renew Expired Course Registration
                </h3>
                <p className="text-white/80 text-xs font-medium mt-0.5">
                  {student?.firstname} {student?.surname} • {course?.title || "Expired Course"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/40 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
              This course is currently <strong>expired</strong>. Renewing will reset the registration start/end dates from today and <strong>record a new payment</strong> with the provided reference code.
            </p>
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
              Renewal Duration / Billing Cycle <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-10 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all"
              >
                <option value="monthly">Monthly (1 Month)</option>
                <option value="quarterly">Quarterly (3 Months)</option>
                <option value="semi_annual">Semi-Annual (6 Months)</option>
                <option value="annual">Annual (12 Months)</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Renewal Fee Paid (₦) <span className="text-red-400">*</span>
              </label>
              {computedFee > 0 && Number(amount) !== computedFee && (
                <button
                  type="button"
                  onClick={() => setAmount(computedFee.toString())}
                  className="text-[10px] font-black text-[#C5A97A] hover:underline"
                >
                  Reset to Standard (₦{computedFee.toLocaleString()})
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#C5A97A]">
                ₦
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 pl-9 pr-4 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all"
                required
              />
            </div>
          </div>

          {/* Payment Reference Code */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
              Payment Reference Code <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="Paste Bank Session ID / Teller # / POS RRN / Paystack Ref"
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all font-mono"
              required
            />
            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
              Paste the bank transaction reference. Must be unique in the system.
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
              Payment Channel
            </label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-10 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all"
              >
                <option value="bank_transfer">Direct Bank Transfer</option>
                <option value="pos">POS / Terminal Card</option>
                <option value="cash">Cash Deposit</option>
                <option value="card">Online Card</option>
                <option value="manual">Manual Admin Entry</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
              Renewal Note & Audit Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. Student renewed tuition for next quarter; payment confirmed on bank portal."
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !referenceCode.trim() || !reason.trim() || !amount}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                loading || !referenceCode.trim() || !reason.trim() || !amount
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#C5A97A] to-[#D4B98C] text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[#C5A97A]/20"
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Renewing..." : "Confirm Renewal & Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ======================================================
   MAIN COMPONENT: AdminCreateStudent
====================================================== */
export default function AdminCreateStudent() {
  const dateInputRef = useRef(null);
  const token = localStorage.getItem("staff_token");
  const config = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }),
    [token]
  );

  /* ---- SHARED STATE ---- */
  const [mode, setMode] = useState("recover"); // "recover" | "create"
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  /* =========================================
     MODE 1: STUDENT RECOVER STATE
  ========================================= */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recoveryModal, setRecoveryModal] = useState(null);
  const [recovering, setRecovering] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "incomplete" | "pending" | "missing_enrollment"

  const loadRecoveryRecords = useCallback(
    async (searchTerm = "") => {
      setSearching(true);
      const endpoint = `${API_BASE_URL}/api/admin/payments/registration-recovery/search`;
      console.log(`[AdminCreateStudent] [GET] Loading Registration Recovery -> ${endpoint}`, { search: searchTerm });

      try {
        const res = await axios.get(endpoint, {
          ...config,
          params: searchTerm ? { search: searchTerm } : {},
        });
        console.log("[AdminCreateStudent] Recovery Response:", res.data);
        const payments = res.data?.payments || [];
        const incompleteStudentsFromApi = res.data?.incomplete_students || [];

        // Normalize results into tagged items
        let results = [
          ...payments.map((p) => {
            const hasCompleteEnrollment =
              p.enrollment &&
              p.enrollment.course &&
              Array.isArray(p.enrollment.subjects) &&
              p.enrollment.subjects.length > 0;

            return {
              recordType: hasCompleteEnrollment ? "recoverable_payment" : "payment_missing_enrollment",
              id: `pay-${p.id}`,
              student: p.student,
              enrollment: p.enrollment,
              amount: p.amount,
              status: p.status,
              gateway_reference: p.gateway_reference,
              created_at: p.created_at,
              rawPayment: p,
            };
          }),
          ...incompleteStudentsFromApi.map((s) => ({
            recordType: "incomplete_registration",
            id: `stud-${s.id}`,
            student: s,
            enrollment: s.courseEnrollments?.[0] || s.course_enrollments?.[0] || null,
            created_at: s.created_at,
            rawStudent: s,
          })),
        ];

        // Fallback search against /api/admin/students/all if searching specifically and empty
        if (searchTerm && incompleteStudentsFromApi.length === 0) {
          try {
            const studentsRes = await axios.get(`${API_BASE_URL}/api/admin/students/all`, config);
            const allStudents = studentsRes.data?.students || studentsRes.data?.data || [];
            const queryLower = searchTerm.toLowerCase();
            const matchedStudents = allStudents.filter((s) => {
              const emailMatch = s.email?.toLowerCase().includes(queryLower);
              const telMatch = s.tel?.includes(searchTerm);
              const nameMatch = `${s.firstname || ''} ${s.surname || ''}`.toLowerCase().includes(queryLower);
              const idMatch = String(s.id) === searchTerm;
              
              // Incomplete: no active course enrollment or active enrollment with 0 subjects
              const hasActiveEnrollment = (s.courseEnrollments || s.course_enrollments || []).some(
                (ce) => ce.status === 'active' && ce.subjects && ce.subjects.length > 0
              );
              return (emailMatch || telMatch || nameMatch || idMatch) && !hasActiveEnrollment;
            });

            // Avoid duplicating any student already in payments
            const paymentStudentIds = new Set(payments.map(p => p.student_id || p.student?.id));
            matchedStudents.forEach((s) => {
              if (!paymentStudentIds.has(s.id)) {
                results.push({
                  recordType: "incomplete_registration",
                  id: `stud-${s.id}`,
                  student: s,
                  enrollment: s.courseEnrollments?.[0] || s.course_enrollments?.[0] || null,
                  created_at: s.created_at,
                  rawStudent: s,
                });
              }
            });
          } catch (fallbackErr) {
            console.warn("[AdminCreateStudent] Optional student fallback search failed:", fallbackErr);
          }
        }

        setSearchResults(results);
      } catch (err) {
        console.error("[AdminCreateStudent] Recovery Load Error:", err.response?.data || err);
        setToast({
          type: "error",
          message:
            err.response?.data?.message || "Failed to load recovery records.",
        });
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    [config]
  );

  // Auto-fetch on mount or mode switch to "recover"
  useEffect(() => {
    if (mode === "recover") {
      loadRecoveryRecords(searchQuery.trim());
    }
  }, [mode, loadRecoveryRecords]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    loadRecoveryRecords(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    loadRecoveryRecords("");
  };

  const displayedResults = useMemo(() => {
    if (activeFilter === "incomplete") {
      return searchResults.filter((r) => r.recordType === "incomplete_registration");
    }
    if (activeFilter === "pending") {
      return searchResults.filter((r) => r.recordType === "recoverable_payment");
    }
    if (activeFilter === "missing_enrollment") {
      return searchResults.filter((r) => r.recordType === "payment_missing_enrollment");
    }
    return searchResults;
  }, [searchResults, activeFilter]);

  const filterCounts = useMemo(() => {
    return {
      all: searchResults.length,
      incomplete: searchResults.filter((r) => r.recordType === "incomplete_registration").length,
      pending: searchResults.filter((r) => r.recordType === "recoverable_payment").length,
      missing_enrollment: searchResults.filter((r) => r.recordType === "payment_missing_enrollment").length,
    };
  }, [searchResults]);

  const handleRecoveryConfirm = async ({ payment_id, gateway_reference, reason }) => {
    setRecovering(true);
    const endpoint = `${API_BASE_URL}/api/admin/payments/${payment_id}/registration-recovery`;
    const payload = { gateway_reference, reason };
    console.log(`[AdminCreateStudent] [POST] Executing Registration Recovery -> ${endpoint}`, payload);

    try {
      const res = await axios.post(endpoint, payload, config);
      console.log("[AdminCreateStudent] Registration Recovery Response:", res.data);
      setToast({
        type: "success",
        message: "Registration recovered successfully! Student enrollment is now active.",
      });
      setRecoveryModal(null);
      // Refresh recovery list
      loadRecoveryRecords(searchQuery.trim());
    } catch (err) {
      console.error("[AdminCreateStudent] Registration Recovery Error:", err.response?.data || err);
      setToast({
        type: "error",
        message:
          err.response?.data?.message || "Recovery failed. Please try again.",
      });
    } finally {
      setRecovering(false);
    }
  };

  /* =========================================
     MODE 2: STUDENT CREATE STATE
  ========================================= */
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationModal, setVerificationModal] = useState(null);
  const [autofillSource, setAutofillSource] = useState(null);

  const [formData, setFormData] = useState({
    student_id: null,
    payment_id: null,
    payment_type: "paid", // "paid" | "free"
    amount_paid: "",
    reference_code: "",
    payment_method: "bank_transfer",
    firstname: "",
    surname: "",
    email: "",
    tel: "",
    password: "",
    confirmPassword: "",
    gender: "",
    date_of_birth: "",
    location: "",
    address: "",
    department: "",
    course_id: "",
    subject_ids: [],
    billing_cycle: "",
    reason: "",
  });

  /* =========================================
     MODE 3: EXTEND & RENEW ACCESS STATE
  ========================================= */
  const [accessSearchQuery, setAccessSearchQuery] = useState("");
  const [accessStudents, setAccessStudents] = useState([]);
  const [loadingAccessStudents, setLoadingAccessStudents] = useState(false);
  const [extendModal, setExtendModal] = useState(null); // { student, enrollment }
  const [renewModal, setRenewModal] = useState(null); // { student, enrollment }
  const [submittingExtension, setSubmittingExtension] = useState(false);
  const [submittingRenewal, setSubmittingRenewal] = useState(false);

  // Fetch students for Extend & Renew mode
  const fetchAccessStudents = useCallback(
    async (query = "") => {
      setLoadingAccessStudents(true);
      try {
        const endpoint = `${API_BASE_URL}/api/admin/students/all`;
        const res = await axios.get(endpoint, config);
        const all = res.data?.students || res.data?.data || [];
        const q = query.toLowerCase().trim();
        if (!q) {
          setAccessStudents(all.slice(0, 30));
        } else {
          const filtered = all.filter((s) => {
            const nameMatch = `${s.firstname || ""} ${s.surname || ""}`.toLowerCase().includes(q);
            const emailMatch = (s.email || "").toLowerCase().includes(q);
            const telMatch = (s.tel || "").includes(q);
            const idMatch = String(s.id) === q;
            return nameMatch || emailMatch || telMatch || idMatch;
          });
          setAccessStudents(filtered);
        }
      } catch (err) {
        console.error("[AdminCreateStudent] Fetch Access Students Error:", err.response?.data || err);
        setToast({
          type: "error",
          message: err.response?.data?.message || "Failed to load students for access management.",
        });
      } finally {
        setLoadingAccessStudents(false);
      }
    },
    [config]
  );

  useEffect(() => {
    if (mode === "extend") {
      fetchAccessStudents(accessSearchQuery.trim());
    }
  }, [mode, fetchAccessStudents]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccessSearch = (e) => {
    if (e) e.preventDefault();
    fetchAccessStudents(accessSearchQuery.trim());
  };

  const handleExtendSubmit = async ({ enrollmentId, months, days, customEndDate, reason }) => {
    setSubmittingExtension(true);
    try {
      const endpoint = `${API_BASE_URL}/api/admin/enrollments/${enrollmentId}/extend`;
      const payload = {
        months: months || undefined,
        days: days || undefined,
        custom_end_date: customEndDate || undefined,
        reason: reason.trim(),
      };
      const res = await axios.post(endpoint, payload, config);
      setToast({
        type: "success",
        message: res.data?.message || "Course access extended successfully!",
      });
      setExtendModal(null);
      fetchAccessStudents(accessSearchQuery.trim());
      if (mode === "recover") {
        loadRecoveryRecords(searchQuery.trim());
      }
    } catch (err) {
      console.error("[AdminCreateStudent] Extend Access Error:", err.response?.data || err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to extend course access.",
      });
    } finally {
      setSubmittingExtension(false);
    }
  };

  const handleRenewSubmit = async ({ enrollmentId, billing_cycle, amount, reference_code, payment_method, reason }) => {
    setSubmittingRenewal(true);
    try {
      const endpoint = `${API_BASE_URL}/api/admin/enrollments/${enrollmentId}/renew`;
      const payload = {
        billing_cycle,
        amount: parseFloat(amount),
        reference_code: reference_code.trim(),
        payment_method: payment_method || "bank_transfer",
        reason: reason.trim(),
      };
      const res = await axios.post(endpoint, payload, config);
      setToast({
        type: "success",
        message: res.data?.message || "Course renewed and payment initialized successfully!",
      });
      setRenewModal(null);
      fetchAccessStudents(accessSearchQuery.trim());
      if (mode === "recover") {
        loadRecoveryRecords(searchQuery.trim());
      }
    } catch (err) {
      console.error("[AdminCreateStudent] Renew Course Error:", err.response?.data || err);
      const backendErrors = err.response?.data?.errors;
      let msg = err.response?.data?.message || "Failed to renew course.";
      if (backendErrors && backendErrors.reference_code) {
        msg = backendErrors.reference_code[0];
      }
      setToast({
        type: "error",
        message: msg,
      });
    } finally {
      setSubmittingRenewal(false);
    }
  };

  // Fetch courses on mount / mode switch
  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    const endpoint = `${API_BASE_URL}/api/courses`;
    console.log(`[AdminCreateStudent] [GET] Fetching Active Courses -> ${endpoint}`);

    try {
      const res = await axios.get(endpoint);
      console.log("[AdminCreateStudent] Courses API Response:", res.data);
      const fetched = res.data?.data || res.data?.courses || [];
      console.log(`[AdminCreateStudent] Loaded ${fetched.length} courses:`, fetched);
      setCourses(fetched);
    } catch (err) {
      console.error("[AdminCreateStudent] Fetch Courses Error:", err.response?.data || err);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // Fetch all subjects for course once and cache in state (department filtering is memoized in-memory)
  const fetchSubjectsForCourse = useCallback(
    async (courseId) => {
      if (!courseId) {
        setSubjects([]);
        return;
      }
      setLoadingSubjects(true);

      const endpoint = `${API_BASE_URL}/api/courses/${courseId}/subjects`;
      console.log(`[AdminCreateStudent] [GET] Fetching Subjects -> ${endpoint} (Course ID: ${courseId})`);

      try {
        const res = await axios.get(endpoint, config);
        console.log("[AdminCreateStudent] Subjects API Response:", res.data);

        const fetchedSubjects =
          res.data?.subjects ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);

        console.log(`[AdminCreateStudent] Formatted ${fetchedSubjects.length} subjects:`, fetchedSubjects);
        setSubjects(fetchedSubjects);
      } catch (err) {
        console.error("[AdminCreateStudent] Fetch Subjects Error via /api/courses/{id}/subjects, attempting fallback:", err.response?.data || err);

        try {
          const fallbackEndpoint = `${API_BASE_URL}/api/admin/subjects/all`;
          console.log(`[AdminCreateStudent] [GET] Fallback -> ${fallbackEndpoint}`);
          const fallbackRes = await axios.get(fallbackEndpoint, config);
          const allSubjects = fallbackRes.data?.subjects || fallbackRes.data?.data || [];
          const filtered = allSubjects.filter((s) => {
            return (
              s.courses?.some((c) => c.id === parseInt(courseId) || c.id === courseId) ||
              s.course_id === parseInt(courseId) ||
              s.course_id === courseId
            );
          });

          console.log(`[AdminCreateStudent] Fallback filtered ${filtered.length} subjects:`, filtered);
          setSubjects(filtered);
        } catch (fallbackErr) {
          console.error("[AdminCreateStudent] Fallback Fetch Subjects Error:", fallbackErr.response?.data || fallbackErr);
          setSubjects([]);
        }
      } finally {
        setLoadingSubjects(false);
      }
    },
    [config]
  );

  // In-memory filtered subjects by department and search query
  const filteredSubjects = useMemo(() => {
    if (!subjects || subjects.length === 0) return [];
    let list = subjects;

    // Fuzzy department filtering (matches "art" with "arts", "science", "commercial")
    if (formData.department) {
      const targetDept = formData.department.toLowerCase().trim();
      list = list.filter((s) => {
        if (!s.departments || !Array.isArray(s.departments) || s.departments.length === 0) return true;
        return s.departments.some((d) => {
          const dNorm = (d || "").toLowerCase().trim();
          if (dNorm === targetDept) return true;
          if (targetDept.startsWith("art") && dNorm.startsWith("art")) return true;
          if (targetDept.startsWith("sci") && dNorm.startsWith("sci")) return true;
          if (targetDept.startsWith("com") && dNorm.startsWith("com")) return true;
          return false;
        });
      });
    }

    // Search query filtering
    if (subjectSearch.trim()) {
      const q = subjectSearch.toLowerCase().trim();
      list = list.filter((s) => {
        const name = (s.name || s.title || "").toLowerCase();
        return name.includes(q);
      });
    }

    return list;
  }, [subjects, formData.department, subjectSearch]);

  const selectedCourse = useMemo(() => {
    if (!formData.course_id) return null;
    return courses.find((c) => String(c.id) === String(formData.course_id));
  }, [courses, formData.course_id]);

  const standardCourseFee = useMemo(() => {
    if (!selectedCourse) return 0;
    const base = Number(selectedCourse.price || selectedCourse.cost || 0);
    if (!base) return 0;
    const cycle = formData.billing_cycle || "monthly";
    const months =
      cycle === "monthly"
        ? 1
        : cycle === "quarterly"
        ? 3
        : cycle === "semi_annual"
        ? 6
        : 12;
    let fee = base * months;
    if (months > 1) fee *= 0.95;
    return Math.round(fee);
  }, [selectedCourse, formData.billing_cycle]);

  useEffect(() => {
    if (mode === "create") fetchCourses();
  }, [mode, fetchCourses]);

  // Fetch subjects only when course_id changes; NEVER wipes on subject selection
  useEffect(() => {
    if (formData.course_id) {
      fetchSubjectsForCourse(formData.course_id);
    } else {
      setSubjects([]);
    }
  }, [formData.course_id, fetchSubjectsForCourse]);

  // Auto-fill amount_paid with standard course fee when standard fee becomes available or changes
  useEffect(() => {
    if (formData.payment_type === "paid" && standardCourseFee > 0) {
      if (!formData.amount_paid || formData.amount_paid === "0") {
        setFormData((prev) => ({ ...prev, amount_paid: standardCourseFee.toString() }));
        if (errors.amount_paid) setErrors((prev) => ({ ...prev, amount_paid: null }));
      }
    }
  }, [formData.payment_type, standardCourseFee]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-update amount_paid when billing_cycle changes
    if (name === "billing_cycle") {
      let updatedAmount = formData.amount_paid;
      if (formData.payment_type === "paid" && selectedCourse) {
        const base = Number(selectedCourse.price || selectedCourse.cost || 0);
        if (base > 0) {
          const months =
            value === "monthly"
              ? 1
              : value === "quarterly"
              ? 3
              : value === "semi_annual"
              ? 6
              : 12;
          let fee = base * months;
          if (months > 1) fee *= 0.95;
          updatedAmount = Math.round(fee).toString();
        }
      }
      setFormData((prev) => ({ ...prev, [name]: value, amount_paid: updatedAmount }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
      if (errors.amount_paid) setErrors((prev) => ({ ...prev, amount_paid: null }));
      return;
    }

    // Auto-update amount_paid and reset subjects when course_id changes
    if (name === "course_id") {
      const course = courses.find((c) => String(c.id) === String(value));
      const base = Number(course?.price || course?.cost || 0);
      let updatedAmount = formData.amount_paid;
      if (formData.payment_type === "paid" && base > 0) {
        const cycle = formData.billing_cycle || "monthly";
        const months =
          cycle === "monthly"
            ? 1
            : cycle === "quarterly"
            ? 3
            : cycle === "semi_annual"
            ? 6
            : 12;
        let fee = base * months;
        if (months > 1) fee *= 0.95;
        updatedAmount = Math.round(fee).toString();
      }
      setFormData((prev) => ({
        ...prev,
        course_id: value,
        subject_ids: [],
        amount_paid: updatedAmount,
      }));
      setSubjectSearch("");
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
      if (errors.amount_paid) setErrors((prev) => ({ ...prev, amount_paid: null }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubjectToggle = (subjectId) => {
    const numericId = parseInt(subjectId);
    setFormData((prev) => {
      const exists = prev.subject_ids.some((id) => parseInt(id) === numericId);
      const updated = exists
        ? prev.subject_ids.filter((id) => parseInt(id) !== numericId)
        : [...prev.subject_ids, numericId];
      return { ...prev, subject_ids: updated };
    });
    if (errors.subject_ids) setErrors((prev) => ({ ...prev, subject_ids: null }));
  };

  const handleSelectAllSubjects = () => {
    const visibleIds = filteredSubjects.map((s) => s.id);
    setFormData((prev) => {
      const merged = Array.from(new Set([...prev.subject_ids, ...visibleIds]));
      return { ...prev, subject_ids: merged };
    });
    if (errors.subject_ids) setErrors((prev) => ({ ...prev, subject_ids: null }));
  };

  const handleClearSubjects = () => {
    setFormData((prev) => ({ ...prev, subject_ids: [] }));
  };

  const handleGeneratePassword = () => {
    const pw = generateStrongPassword();
    setFormData((prev) => ({ ...prev, password: pw, confirmPassword: pw }));
    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
    if (errors.confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: null }));
  };

  const handleCopyPassword = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      setToast({ type: "success", message: "Password copied to clipboard!" });
    }
  };

  const handleCompleteIncompleteRegistration = (student, payment = null) => {
    console.log("[AdminCreateStudent] Completing registration for student:", student, "Payment:", payment);

    const existingEnrollment = payment?.enrollment || student.courseEnrollments?.[0] || student.course_enrollments?.[0] || null;
    const prefilledCourseId = existingEnrollment?.course_id 
      ? String(existingEnrollment.course_id) 
      : (student.course_id ? String(student.course_id) : "");
    const prefilledSubjectIds = (existingEnrollment?.subjects || student.subjects || []).map(
      (s) => s.subject_id || s.id || s
    );
    const prefilledBillingCycle = payment?.billing_cycle || existingEnrollment?.billing_cycle || student.billing_cycle || "";

    const defaultReason = payment 
      ? `Completing enrollment for payment #${payment.id}${payment.gateway_reference ? ` (${payment.gateway_reference})` : ''}`
      : "Completing incomplete student registration";

    setFormData({
      student_id: student.id,
      payment_id: payment?.id || null,
      firstname: student.firstname || "",
      surname: student.surname || "",
      email: student.email || "",
      tel: student.tel || "",
      password: "",
      confirmPassword: "",
      gender: student.gender || "",
      date_of_birth: student.date_of_birth ? student.date_of_birth.split("T")[0] : "",
      location: student.location || "",
      address: student.address || "",
      department: student.department || "",
      course_id: prefilledCourseId,
      subject_ids: prefilledSubjectIds,
      billing_cycle: prefilledBillingCycle,
      reason: defaultReason,
    });

    setAutofillSource({ ...student, attachedPayment: payment });
    setErrors({});
    setMode("create");

    if (prefilledCourseId) {
      fetchSubjectsForCourse(prefilledCourseId);
    }

    setToast({
      type: "success",
      message: payment 
        ? `Autofilled details for ${student.firstname} ${student.surname} (Payment #${payment.id}). Select course/subjects to link enrollment.`
        : `Autofilled signup details for ${student.firstname} ${student.surname}. Complete the remaining details to finalize enrollment.`,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAutofill = () => {
    setAutofillSource(null);
    setFormData({
      student_id: null,
      payment_id: null,
      payment_type: "paid",
      amount_paid: "",
      reference_code: "",
      payment_method: "bank_transfer",
      firstname: "",
      surname: "",
      email: "",
      tel: "",
      password: "",
      confirmPassword: "",
      gender: "",
      date_of_birth: "",
      location: "",
      address: "",
      department: "",
      course_id: "",
      subject_ids: [],
      billing_cycle: "",
      reason: "",
    });
    setErrors({});
    setToast({
      type: "info",
      message: "Form cleared to standard new student registration.",
    });
  };

  const validateCreateForm = () => {
    const errs = {};
    const phoneRegex = /^(\+234|234|0)(70|80|81|90|91)\d{8}$/;

    if (!formData.firstname.trim()) errs.firstname = "First name is required";
    if (!formData.surname.trim()) errs.surname = "Surname is required";

    // At least one of email or phone
    if (!formData.email.trim() && !formData.tel.trim()) {
      errs.email = "Email or phone is required";
      errs.tel = "Email or phone is required";
    }
    if (formData.tel.trim() && !phoneRegex.test(formData.tel.trim())) {
      errs.tel = "Invalid Nigerian phone number format";
    }

    // Payment fields validation
    if (formData.payment_type === "paid") {
      if (
        formData.amount_paid === "" ||
        formData.amount_paid === null ||
        isNaN(formData.amount_paid) ||
        Number(formData.amount_paid) < 0
      ) {
        errs.amount_paid = "Please enter a valid amount paid";
      }
      if (!formData.reference_code || !formData.reference_code.trim()) {
        errs.reference_code = "Payment reference code is required for paid registrations";
      }
    }

    // Password validation: required for new accounts; optional if completing existing student
    if (!formData.student_id) {
      if (!formData.password || formData.password.length < 8)
        errs.password = "Password must be at least 8 characters";
      if (formData.password !== formData.confirmPassword)
        errs.confirmPassword = "Passwords do not match";
    } else {
      if (formData.password) {
        if (formData.password.length < 8)
          errs.password = "Password must be at least 8 characters";
        if (formData.password !== formData.confirmPassword)
          errs.confirmPassword = "Passwords do not match";
      }
    }

    if (!formData.gender) errs.gender = "Gender is required";
    if (!formData.date_of_birth) errs.date_of_birth = "Date of birth is required";
    if (!formData.location.trim()) errs.location = "Location is required";
    if (!formData.department) errs.department = "Department is required";
    if (!formData.course_id) errs.course_id = "Course selection is required";
    if (formData.subject_ids.length === 0)
      errs.subject_ids = "At least one subject is required";
    if (!formData.billing_cycle) errs.billing_cycle = "Billing cycle is required";
    if (!formData.reason.trim())
      errs.reason = "Approval reason is required for audit";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    setCreating(true);
    const endpoint = `${API_BASE_URL}/api/admin/students/complimentary-registration`;

    try {
      const payload = {
        student_id: formData.student_id || undefined,
        payment_id: formData.payment_id || undefined,
        payment_type: formData.payment_type || "paid",
        amount_paid:
          formData.payment_type === "paid" ? parseFloat(formData.amount_paid) : 0,
        reference_code:
          formData.payment_type === "paid" ? formData.reference_code.trim() : undefined,
        payment_method:
          formData.payment_type === "paid"
            ? formData.payment_method || "bank_transfer"
            : "manual",
        firstname: formData.firstname.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim() || undefined,
        tel: formData.tel.trim() || undefined,
        password: formData.password || undefined,
        confirmPassword: formData.confirmPassword || undefined,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        location: formData.location.trim() || undefined,
        address: formData.address.trim() || undefined,
        department: formData.department,
        course_id: parseInt(formData.course_id),
        subject_ids: formData.subject_ids.map((id) => parseInt(id)),
        billing_cycle: formData.billing_cycle,
        reason: formData.reason.trim(),
      };

      // Remove undefined keys
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      console.log(`[AdminCreateStudent] [POST] Submitting Registration -> ${endpoint}`, payload);

      const res = await axios.post(endpoint, payload, config);
      console.log("[AdminCreateStudent] Registration Response:", res.data);

      setToast({
        type: "success",
        message:
          res.data?.message ||
          (formData.student_id
            ? "Student registration completed successfully!"
            : formData.payment_type === "paid"
            ? "Paid student registration successful!"
            : "Complimentary student registration successful!"),
      });

      // Open verification modal if applicable
      setVerificationModal({
        firstname: formData.firstname,
        surname: formData.surname,
        email: formData.email,
        tel: formData.tel,
      });

      // Reset form
      setAutofillSource(null);
      setFormData({
        student_id: null,
        payment_id: null,
        payment_type: "paid",
        amount_paid: "",
        reference_code: "",
        payment_method: "bank_transfer",
        firstname: "",
        surname: "",
        email: "",
        tel: "",
        password: "",
        confirmPassword: "",
        gender: "",
        date_of_birth: "",
        location: "",
        address: "",
        department: "",
        course_id: "",
        subject_ids: [],
        billing_cycle: "",
        reason: "",
      });
      setErrors({});

      // Reload recovery list
      loadRecoveryRecords(searchQuery.trim());
    } catch (err) {
      console.error("[AdminCreateStudent] Registration Error:", err.response?.data || err);
      const backendErrors = err.response?.data?.errors;
      let msg =
        err.response?.data?.message ||
        "Registration failed. Please try again.";

      if (backendErrors) {
        const formatted = {};
        Object.keys(backendErrors).forEach((key) => {
          formatted[key] = backendErrors[key][0];
        });
        setErrors(formatted);
        if (Object.keys(backendErrors).length > 0) {
          msg = backendErrors[Object.keys(backendErrors)[0]][0];
        }
      }
      setToast({ type: "error", message: msg });
    } finally {
      setCreating(false);
    }
  };

  const formatAccessDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? "N/A"
        : d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
    } catch {
      return "N/A";
    }
  };

  /* =========================================
     RENDER
  ========================================= */
  return (
    <StaffDashboardLayout
      pagetitle="CREATE STUDENT"
      backPath="/staffs/manage-students"
      backLabel="Student Management"
    >
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="w-full relative space-y-6">
        {/* ========================================
            MODE TOGGLE HEADER
        ======================================== */}
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
          <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left info */}
            <div>
              <h2 className="text-lg font-black text-[#09314F] dark:text-white tracking-tight">
                {mode === "recover"
                  ? "Student Recovery & Incomplete Registrations"
                  : mode === "extend"
                  ? "Course Access & Validity Management"
                  : autofillSource
                  ? "Complete Student Registration"
                  : "Student Enrollment & Creation"}
              </h2>
              <p className="text-xs font-medium text-gray-400 mt-1 leading-relaxed max-w-md">
                {mode === "recover"
                  ? "Search recoverable gateway payments or complete signups for students who registered without paying."
                  : mode === "extend"
                  ? "Search students, view enrolled courses, extend active validity, or renew expired registrations."
                  : autofillSource
                  ? "Review prefilled details and select course/subjects to complete this student's enrollment."
                  : "Register a student with verified payment reference or complimentary management approval."}
              </p>
            </div>

            {/* Toggle Pill */}
            <div className="flex bg-gray-100 dark:bg-[#06243A] rounded-2xl p-1.5 gap-1 flex-shrink-0 shadow-inner">
              <button
                onClick={() => setMode("create")}
                className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  mode === "create"
                    ? "bg-gradient-to-r from-[#C5A97A] to-[#D4B98C] text-white shadow-lg shadow-[#C5A97A]/20"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <UserPlusIcon className="w-4 h-4" />
                Create
              </button>
              <button
                onClick={() => {
                  setMode("extend");
                  fetchAccessStudents();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  mode === "extend"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <ClockIcon className="w-4 h-4" />
                Extend / Renew
              </button>
              <button
                onClick={() => setMode("recover")}
                className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  mode === "recover"
                    ? "bg-gradient-to-r from-[#09314F] to-[#0F4068] text-white shadow-lg shadow-[#09314F]/20"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Recover
              </button>
            </div>
          </div>
        </div>

        {/* ========================================
            MODE 1: STUDENT RECOVER
        ======================================== */}
        {mode === "recover" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-400">
            {/* Search and Action Bar */}
            <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-4 h-4 text-[#C5A97A]" />
                  Active Recovery Triage & Incomplete Registrations
                </h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by Email, Phone, Name, Gateway Reference, or Payment ID..."
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-4 pl-12 pr-10 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center text-xs font-bold transition-all"
                        title="Clear filter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={searching}
                      className="px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#09314F] to-[#0F4068] text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-lg flex items-center gap-2"
                    >
                      {searching ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <MagnifyingGlassIcon className="w-4 h-4" />
                      )}
                      {searching ? "Searching..." : "Search"}
                    </button>
                    <button
                      type="button"
                      onClick={() => loadRecoveryRecords(searchQuery.trim())}
                      disabled={searching}
                      className="px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#06243A] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center"
                      title="Refresh records"
                    >
                      <ArrowPathIcon className={`w-4 h-4 ${searching ? "animate-spin text-[#C5A97A]" : ""}`} />
                    </button>
                  </div>
                </form>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">
                    Filter:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      activeFilter === "all"
                        ? "bg-[#09314F] text-white shadow-md shadow-[#09314F]/20"
                        : "bg-gray-100 dark:bg-[#06243A] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <span>All Records</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      activeFilter === "all" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}>
                      {filterCounts.all}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter("incomplete")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      activeFilter === "incomplete"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                        : "bg-gray-100 dark:bg-[#06243A] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <span>Incomplete Signups</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      activeFilter === "incomplete" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}>
                      {filterCounts.incomplete}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter("pending")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      activeFilter === "pending"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "bg-gray-100 dark:bg-[#06243A] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <span>Pending Payments</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      activeFilter === "pending" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}>
                      {filterCounts.pending}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter("missing_enrollment")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      activeFilter === "missing_enrollment"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : "bg-gray-100 dark:bg-[#06243A] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <span>Payments Missing Courses</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      activeFilter === "missing_enrollment" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}>
                      {filterCounts.missing_enrollment}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Records List */}
            <div className="space-y-4">
              {searching && searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 p-12">
                  <div className="w-10 h-10 border-4 border-[#C5A97A]/30 border-t-[#C5A97A] rounded-full animate-spin mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading records needing attention...</p>
                </div>
              ) : displayedResults.length > 0 ? (
                displayedResults.map((item) => {
                  const isRecoverablePayment = item.recordType === "recoverable_payment";
                  const isMissingEnrollment = item.recordType === "payment_missing_enrollment";
                  const student = item.student || {};
                  const enrollment = item.enrollment || {};
                  const courseTitle = enrollment.course?.title || student.course_title;

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden hover:shadow-xl transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          {/* Student Info */}
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg ${
                                isRecoverablePayment
                                  ? "bg-gradient-to-br from-[#09314F] to-[#0F4068]"
                                  : isMissingEnrollment
                                  ? "bg-gradient-to-br from-purple-800 to-indigo-700"
                                  : "bg-gradient-to-br from-[#BB9E7F] to-[#8C6D4F]"
                              }`}
                            >
                              {student?.firstname?.[0]?.toUpperCase() || "S"}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="font-black text-[#09314F] dark:text-white text-base truncate">
                                  {student?.firstname} {student?.surname}
                                </h4>
                                {/* TAG / BADGE */}
                                {isRecoverablePayment && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                    <ArrowPathIcon className="w-3.5 h-3.5 text-emerald-500" />
                                    Recoverable Student
                                  </span>
                                )}
                                {isMissingEnrollment && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm">
                                    <ExclamationTriangleIcon className="w-3.5 h-3.5 text-purple-500" />
                                    Payment Without Course/Subjects
                                  </span>
                                )}
                                {!isRecoverablePayment && !isMissingEnrollment && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm">
                                    <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
                                    Incomplete Registration
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-4 mt-2">
                                {student?.email && (
                                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                                    {student.email}
                                  </span>
                                )}
                                {student?.tel && (
                                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                                    {student.tel}
                                  </span>
                                )}
                                {student?.department && (
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#BB9E7F] bg-[#BB9E7F]/10 px-2.5 py-0.5 rounded-lg border border-[#BB9E7F]/20">
                                    {student.department}
                                  </span>
                                )}
                                {student?.location && (
                                  <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                    <MapPinIcon className="w-3.5 h-3.5" />
                                    {student.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Details (Payment status or Incomplete status) */}
                          <div className="flex flex-wrap items-center gap-3">
                            {isRecoverablePayment || isMissingEnrollment ? (
                              <>
                                {/* Amount Badge */}
                                <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800">
                                  <span className="text-xs font-black text-green-700 dark:text-green-300">
                                    {Number(item.amount || 0) === 0
                                      ? "FREE"
                                      : `₦${parseFloat(item.amount || 0).toLocaleString()}`}
                                  </span>
                                </div>

                                {/* Status Chip */}
                                <div
                                  className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider ${
                                    item.status === "pending"
                                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                                      : item.status === "successful"
                                      ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-700 dark:text-green-300"
                                      : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-300"
                                  }`}
                                >
                                  {item.status}
                                </div>
                              </>
                            ) : (
                              <div className="bg-amber-50/70 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-800">
                                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-200">
                                  Signed up • Unpaid
                                </span>
                              </div>
                            )}

                            {/* Course (if available) */}
                            {courseTitle ? (
                              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800">
                                <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                  <AcademicCapIcon className="w-3 h-3" />
                                  {courseTitle}
                                </span>
                              </div>
                            ) : isMissingEnrollment ? (
                              <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl border border-purple-100 dark:border-purple-800">
                                <span className="text-[10px] font-black text-purple-700 dark:text-purple-300">
                                  No Course/Subjects Linked
                                </span>
                              </div>
                            ) : null}
                          </div>

                          {/* Action Button */}
                          {isRecoverablePayment ? (
                            <button
                              onClick={() => setRecoveryModal(item.rawPayment || item)}
                              className="px-6 py-3.5 bg-gradient-to-r from-[#09314F] to-[#E83831] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                              Recover
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleCompleteIncompleteRegistration(
                                  item.rawStudent || item.student,
                                  item.rawPayment || null
                                )
                              }
                              className="px-6 py-3.5 bg-gradient-to-r from-[#09314F] to-[#BB9E7F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                              Complete
                            </button>
                          )}
                        </div>

                        {/* Additional Reference/Payment details */}
                        {(item.gateway_reference || item.rawPayment?.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-4 text-xs">
                            {item.rawPayment?.id && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                  Payment ID:
                                </span>
                                <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                                  #{item.rawPayment.id}
                                </span>
                              </div>
                            )}
                            {item.gateway_reference && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                  Gateway Reference:
                                </span>
                                <code className="text-xs font-bold text-[#C5A97A] bg-gray-50 dark:bg-[#06243A] px-3 py-1 rounded-lg">
                                  {item.gateway_reference}
                                </code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center bg-white/40 dark:bg-gray-800/40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    {searchQuery.trim() ? (
                      <MagnifyingGlassIcon className="w-8 h-8 text-gray-300" />
                    ) : (
                      <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-black text-gray-600 dark:text-gray-300 mb-1">
                    {searchQuery.trim() ? "No Matching Records Found" : "All Caught Up!"}
                  </h3>
                  <p className="text-gray-400 text-xs font-medium text-center max-w-sm">
                    {searchQuery.trim()
                      ? `No payments or incomplete registrations matched "${searchQuery.trim()}". Try another keyword or clear the filter.`
                      : activeFilter !== "all"
                      ? "No records match the current filter selection."
                      : "There are currently no pending payments, incomplete registrations, or orphaned enrollments requiring administrative action."}
                  </p>
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-[#09314F] dark:text-[#C5A97A] bg-gray-100 dark:bg-[#06243A] hover:opacity-80 transition-all"
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================
            MODE 3: EXTEND & RENEW COURSE ACCESS
        ======================================== */}
        {mode === "extend" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
            {/* Search and Action Bar */}
            <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-emerald-500" />
                  Student Course Validity & Access Management
                </h3>
                <span className="text-[10px] font-bold text-gray-400">
                  {accessStudents.length} student{accessStudents.length === 1 ? "" : "s"} shown
                </span>
              </div>
              <div className="p-6">
                <form onSubmit={handleAccessSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={accessSearchQuery}
                      onChange={(e) => setAccessSearchQuery(e.target.value)}
                      placeholder="Search by student Name, Phone, Email, or Student ID..."
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-4 pl-12 pr-10 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                    {accessSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setAccessSearchQuery("");
                          fetchAccessStudents("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center text-xs font-bold transition-all"
                        title="Clear filter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loadingAccessStudents}
                      className="px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                    >
                      {loadingAccessStudents ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <MagnifyingGlassIcon className="w-4 h-4" />
                      )}
                      {loadingAccessStudents ? "Searching..." : "Search"}
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchAccessStudents(accessSearchQuery.trim())}
                      className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#06243A] transition-all flex items-center justify-center"
                      title="Refresh student list"
                    >
                      <ArrowPathIcon className={`w-5 h-5 ${loadingAccessStudents ? "animate-spin text-emerald-500" : ""}`} />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-4">
              {loadingAccessStudents ? (
                <div className="flex flex-col items-center justify-center bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 p-12">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                  <p className="text-xs font-bold text-gray-400">Loading student records...</p>
                </div>
              ) : accessStudents.length > 0 ? (
                accessStudents.map((student) => {
                  const enrollments =
                    student.course_enrollments ||
                    student.courseEnrollments ||
                    student.courses ||
                    [];

                  const displayName =
                    student.firstname && student.surname
                      ? `${student.firstname} ${student.surname}`.trim()
                      : student.username || "Student";

                  return (
                    <div
                      key={`access-student-${student.id}`}
                      className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* Student Top Bar */}
                      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-900/10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#09314F] to-[#0F4068] text-white flex items-center justify-center font-black text-sm shadow-md flex-shrink-0">
                            {displayName?.[0]?.toUpperCase() || "S"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-black text-[#09314F] dark:text-white">
                                {displayName}
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-[#06243A] text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                                #{student.id}
                              </span>
                              {student.department && (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                                  {student.department}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400 font-medium">
                              {student.email && (
                                <span className="flex items-center gap-1">
                                  <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                                  {student.email}
                                </span>
                              )}
                              {student.tel && (
                                <span className="flex items-center gap-1">
                                  <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                                  {student.tel}
                                </span>
                              )}
                              {student.location && (
                                <span className="flex items-center gap-1">
                                  <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                                  {student.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick action: Enroll if no enrollments */}
                        {enrollments.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleCompleteIncompleteRegistration(student)}
                            className="px-4 py-2.5 bg-gradient-to-r from-[#09314F] to-[#C5A97A] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
                          >
                            <UserPlusIcon className="w-4 h-4" />
                            Enroll Student
                          </button>
                        )}
                      </div>

                      {/* Course Enrollments Section */}
                      <div className="p-6">
                        {enrollments.length > 0 ? (
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                              <AcademicCapIcon className="w-3.5 h-3.5 text-[#C5A97A]" />
                              Enrolled Courses & Expiry Status ({enrollments.length})
                            </h5>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {enrollments.map((enr) => {
                                const course = enr.course || {};
                                const isExpired = !enr.end_date || new Date(enr.end_date) <= new Date();
                                const now = new Date();
                                const endDate = enr.end_date ? new Date(enr.end_date) : null;
                                const diffDays = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 0;

                                return (
                                  <div
                                    key={`enr-card-${enr.id}`}
                                    className={`p-4 rounded-2xl border transition-all ${
                                      isExpired
                                        ? "bg-rose-50/30 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40"
                                        : "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h6 className="font-bold text-sm text-[#09314F] dark:text-white truncate">
                                            {course.title || "Course Enrollment"}
                                          </h6>
                                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-[#06243A] text-gray-600 dark:text-gray-300">
                                            {enr.billing_cycle || "Monthly"}
                                          </span>
                                        </div>

                                        {/* Dates */}
                                        <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                          <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                            <span>
                                              Validity: <strong>{formatAccessDate(enr.start_date)}</strong> → <strong>{formatAccessDate(enr.end_date)}</strong>
                                            </span>
                                          </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mt-2.5">
                                          {isExpired ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                              <ExclamationTriangleIcon className="w-3.5 h-3.5 text-rose-500" />
                                              Expired • Renewal Required
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                                              Active • {diffDays} day{diffDays === 1 ? "" : "s"} left
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Action Button */}
                                      <div className="flex-shrink-0 self-center">
                                        {isExpired ? (
                                          <button
                                            type="button"
                                            onClick={() => setRenewModal({ student, enrollment: enr })}
                                            className="px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 active:scale-95 text-white shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                                            title="Renew course with fresh payment reference"
                                          >
                                            <ArrowPathIcon className="w-4 h-4" />
                                            Renew Course
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => setExtendModal({ student, enrollment: enr })}
                                            className="px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 active:scale-95 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                                            title="Extend course registration duration"
                                          >
                                            <ClockIcon className="w-4 h-4" />
                                            Extend Time
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#06243A]/40 border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium">
                              No courses currently assigned to this student.
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCompleteIncompleteRegistration(student)}
                              className="text-xs font-bold text-[#C5A97A] hover:underline"
                            >
                              Assign Course & Subjects →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center bg-white/40 dark:bg-gray-800/40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-black text-gray-600 dark:text-gray-300 mb-1">
                    {accessSearchQuery.trim() ? "No Students Found" : "No Enrolled Students"}
                  </h3>
                  <p className="text-gray-400 text-xs font-medium text-center max-w-sm">
                    {accessSearchQuery.trim()
                      ? `No students matched "${accessSearchQuery.trim()}". Try searching with another name, phone number, or ID.`
                      : "There are currently no student records available for access management."}
                  </p>
                  {accessSearchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setAccessSearchQuery("");
                        fetchAccessStudents("");
                      }}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-[#09314F] dark:text-[#C5A97A] bg-gray-100 dark:bg-[#06243A] hover:opacity-80 transition-all"
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================
            MODE 2: STUDENT CREATE (Complimentary)
        ======================================== */}
        {mode === "create" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-400">
            {autofillSource && (
              <div className="mb-6 p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-2 border-amber-500/30 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-2">
                      <span>Completing Incomplete Registration</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[9px] font-bold text-amber-800 dark:text-amber-200">
                        Existing Account #{autofillSource.id}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">
                      Signup details autofilled for <strong className="text-[#09314F] dark:text-white font-bold">{autofillSource.firstname} {autofillSource.surname}</strong> ({autofillSource.email || autofillSource.tel || "No contact"}). Assign course/subjects to complete enrollment.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearAutofill}
                  className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 hover:border-red-200 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all flex-shrink-0"
                >
                  Clear Autofill
                </button>
              </div>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* LEFT COLUMN */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Department Card */}
                  <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <BookOpenIcon className="w-4 h-4 text-[#C5A97A]" />
                        Department
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="relative">
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-10 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all ${
                            errors.department
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <option value="">Select department</option>
                          <option value="science">Science</option>
                          <option value="arts">Arts</option>
                          <option value="commercial">Commercial</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.department && (
                        <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                          {errors.department}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Course Selection Card */}
                  <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <AcademicCapIcon className="w-4 h-4 text-[#C5A97A]" />
                        Course & Billing
                      </h3>
                    </div>
                    <div className="p-6 space-y-5">
                      {/* Course */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Active Course
                        </label>
                        <div className="relative">
                          <select
                            name="course_id"
                            value={formData.course_id}
                            onChange={handleChange}
                            disabled={loadingCourses}
                            className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-10 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all ${
                              errors.course_id
                                ? "border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <option value="">
                              {loadingCourses
                                ? "Loading courses..."
                                : "Select a course"}
                            </option>
                            {courses.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.course_id && (
                          <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                            {errors.course_id}
                          </p>
                        )}
                      </div>

                      {/* Billing Cycle */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Billing Cycle
                        </label>
                        <div className="relative">
                          <select
                            name="billing_cycle"
                            value={formData.billing_cycle}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-10 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all ${
                              errors.billing_cycle
                                ? "border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <option value="">Select billing cycle</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="semi_annual">Semi-Annual</option>
                            <option value="annual">Annual</option>
                          </select>
                          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.billing_cycle && (
                          <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                            {errors.billing_cycle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment & Tuition Status Card */}
                  <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <CreditCardIcon className="w-4 h-4 text-[#C5A97A]" />
                        Payment & Tuition Status
                      </h3>
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                          formData.payment_type === "paid"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        {formData.payment_type === "paid" ? "Paid Enrollment" : "Free / Scholarship"}
                      </span>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Payment Type Toggle */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Tuition Status <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-[#06243A] p-1.5 rounded-2xl">
                          <button
                            type="button"
                            onClick={() => {
                              const autoFee = standardCourseFee > 0 ? standardCourseFee.toString() : (formData.amount_paid && formData.amount_paid !== "0" ? formData.amount_paid : "");
                              setFormData((prev) => ({
                                ...prev,
                                payment_type: "paid",
                                amount_paid: autoFee,
                              }));
                              if (errors.payment_type) setErrors((prev) => ({ ...prev, payment_type: null }));
                              if (errors.amount_paid) setErrors((prev) => ({ ...prev, amount_paid: null }));
                            }}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                              formData.payment_type === "paid"
                                ? "bg-white dark:bg-[#0B2740] text-[#09314F] dark:text-white shadow-md shadow-black/5"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                          >
                            <BanknotesIcon className="w-4 h-4 text-emerald-500" />
                            Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                payment_type: "free",
                                amount_paid: "0",
                                reference_code: "",
                              }));
                              if (errors.amount_paid) setErrors((prev) => ({ ...prev, amount_paid: null }));
                              if (errors.reference_code) setErrors((prev) => ({ ...prev, reference_code: null }));
                            }}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                              formData.payment_type === "free"
                                ? "bg-white dark:bg-[#0B2740] text-[#09314F] dark:text-white shadow-md shadow-black/5"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                          >
                            <SparklesIcon className="w-4 h-4 text-blue-500" />
                            Free / Complimentary
                          </button>
                        </div>
                      </div>

                      {/* When Paid */}
                      {formData.payment_type === "paid" ? (
                        <>
                          {/* Amount Paid */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                Amount Paid (₦) <span className="text-red-400">*</span>
                              </label>
                              {standardCourseFee > 0 && Number(formData.amount_paid) !== standardCourseFee && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({ ...prev, amount_paid: standardCourseFee.toString() }));
                                    if (errors.amount_paid) setErrors((prev) => ({ ...prev, amount_paid: null }));
                                  }}
                                  className="text-[10px] font-black text-[#C5A97A] hover:underline"
                                >
                                  Use Standard Fee (₦{standardCourseFee.toLocaleString()})
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#C5A97A]">
                                ₦
                              </div>
                              <input
                                type="number"
                                name="amount_paid"
                                min="0"
                                step="any"
                                value={formData.amount_paid}
                                onChange={handleChange}
                                placeholder={standardCourseFee > 0 ? standardCourseFee.toString() : "e.g. 15000"}
                                className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 pl-9 pr-4 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                                  errors.amount_paid
                                    ? "border-red-500"
                                    : "border-gray-200 dark:border-gray-700"
                                }`}
                              />
                            </div>
                            {errors.amount_paid && (
                              <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                                {errors.amount_paid}
                              </p>
                            )}
                          </div>

                          {/* Reference Code */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                              Payment Reference Code <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              name="reference_code"
                              value={formData.reference_code}
                              onChange={handleChange}
                              placeholder="e.g. TC-1790003177806-339281 / Bank Session ID / Teller #"
                              className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 font-mono transition-all ${
                                errors.reference_code
                                  ? "border-red-500"
                                  : "border-gray-200 dark:border-gray-700"
                              }`}
                            />
                            {errors.reference_code ? (
                              <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                                {errors.reference_code}
                              </p>
                            ) : (
                              <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                Paste the bank session ID, Paystack ref, POS RRN, or teller number. Must be unique.
                              </p>
                            )}
                          </div>

                          {/* Payment Method / Channel */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                              Payment Channel
                            </label>
                            <div className="relative">
                              <select
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-10 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all"
                              >
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="pos">Point of Sale (POS)</option>
                                <option value="cash">Cash Payment</option>
                                <option value="direct_deposit">Direct Bank Deposit</option>
                                <option value="manual">Manual Admin Entry</option>
                              </select>
                              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Subject Multi-Select Card */}
                  <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ClipboardDocumentIcon className="w-4 h-4 text-[#C5A97A]" />
                        Subjects
                        {formData.subject_ids.length > 0 && (
                          <span className="bg-[#C5A97A] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                            {formData.subject_ids.length} selected
                          </span>
                        )}
                      </h3>
                      {subjects.length > 0 && (
                        <div className="flex items-center gap-2 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={handleSelectAllSubjects}
                            className="text-[#C5A97A] hover:underline transition-all"
                          >
                            Select All
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <button
                            type="button"
                            onClick={handleClearSubjects}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      {!formData.course_id ? (
                        <p className="text-xs text-gray-400 font-medium text-center py-4">
                          Select a course first to view available subjects.
                        </p>
                      ) : loadingSubjects ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="w-6 h-6 border-2 border-[#C5A97A]/30 border-t-[#C5A97A] rounded-full animate-spin" />
                        </div>
                      ) : subjects.length === 0 ? (
                        <p className="text-xs text-gray-400 font-medium text-center py-4">
                          No subjects found for this course.
                        </p>
                      ) : filteredSubjects.length === 0 ? (
                        <div className="text-center py-4 space-y-2">
                          <p className="text-xs text-gray-400 font-medium">
                            No subjects found matching {formData.department ? `department "${formData.department}"` : "the current filters"}.
                          </p>
                          {formData.department && (
                            <button
                              type="button"
                              onClick={() => setFormData((p) => ({ ...p, department: "" }))}
                              className="text-xs font-bold text-[#C5A97A] hover:underline"
                            >
                              Show all course subjects
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                          {filteredSubjects.map((subject) => {
                            const isChecked = formData.subject_ids.some(
                              (id) => parseInt(id) === parseInt(subject.id)
                            );
                            const subjectDisplayName =
                              subject.name || subject.title || `Subject #${subject.id}`;
                            return (
                              <label
                                key={subject.id}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                                  isChecked
                                    ? "bg-[#09314F]/5 dark:bg-[#C5A97A]/10 border-[#C5A97A]/30"
                                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/40"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                    isChecked
                                      ? "bg-[#C5A97A] border-[#C5A97A]"
                                      : "border-gray-300 dark:border-gray-600"
                                  }`}
                                >
                                  {isChecked && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    handleSubjectToggle(subject.id)
                                  }
                                  className="sr-only"
                                />
                                <span className="text-sm font-bold text-gray-700 dark:text-white truncate">
                                  {subjectDisplayName}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      {errors.subject_ids && (
                        <p className="text-[10px] text-red-500 mt-2 font-bold">
                          {errors.subject_ids}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: FORM SECTIONS */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Section: Personal Information */}
                  <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-[#C5A97A]" />
                        Personal Information
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {/* First Name */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstname"
                          value={formData.firstname}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                            errors.firstname
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        />
                        {errors.firstname && (
                          <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                            {errors.firstname}
                          </p>
                        )}
                      </div>

                      {/* Surname */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Surname
                        </label>
                        <input
                          type="text"
                          name="surname"
                          value={formData.surname}
                          onChange={handleChange}
                          placeholder="Enter surname"
                          className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                            errors.surname
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        />
                        {errors.surname && (
                          <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                            {errors.surname}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Gender
                        </label>
                        <div className="relative">
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-10 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all ${
                              errors.gender
                                ? "border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="others">Others</option>
                          </select>
                          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.gender && (
                          <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                            {errors.gender}
                          </p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <CalendarIcon
                            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A97A] cursor-pointer z-10"
                            onClick={() => {
                              if (dateInputRef.current?.showPicker)
                                dateInputRef.current.showPicker();
                              else dateInputRef.current?.focus();
                            }}
                          />
                          <input
                            type="date"
                            ref={dateInputRef}
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            onClick={() => {
                              if (dateInputRef.current?.showPicker)
                                dateInputRef.current.showPicker();
                              else dateInputRef.current?.focus();
                            }}
                            className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 pl-11 pr-4 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden ${
                              errors.date_of_birth
                                ? "border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          />
                        </div>
                        {errors.date_of_birth && (
                          <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                            {errors.date_of_birth}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Contact Details */}
                  <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4 text-[#C5A97A]" />
                        Contact Details
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="student@example.com"
                          className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                            errors.email
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        />
                        {errors.email && (
                          <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#C5A97A] border-r border-gray-200 dark:border-gray-700 pr-3">
                            +234
                          </div>
                          <input
                            type="tel"
                            name="tel"
                            value={formData.tel}
                            onChange={handleChange}
                            placeholder="8012345678"
                            className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 pl-16 pr-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                              errors.tel
                                ? "border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          />
                        </div>
                        {errors.tel && (
                          <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                            {errors.tel}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Security (Password) */}
                  <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <LockClosedIcon className="w-4 h-4 text-[#C5A97A]" />
                        Security
                      </h3>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Password */}
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                            {formData.student_id ? "Password (Optional)" : "Password"}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              placeholder={
                                formData.student_id
                                  ? "Leave empty to keep existing password"
                                  : "Min. 8 characters"
                              }
                              className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-12 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                                errors.password
                                  ? "border-red-500"
                                  : "border-gray-200 dark:border-gray-700"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="w-4 h-4" />
                              ) : (
                                <EyeIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              placeholder={
                                formData.student_id
                                  ? "Confirm new password (if changing)"
                                  : "Re-enter password"
                              }
                              className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-12 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                                errors.confirmPassword
                                  ? "border-red-500"
                                  : "border-gray-200 dark:border-gray-700"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? (
                                <EyeSlashIcon className="w-4 h-4" />
                              ) : (
                                <EyeIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      {formData.student_id && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40">
                          Student created their password during initial signup. Leave password blank to retain their existing login password, or enter a new password to reset it.
                        </p>
                      )}

                      {/* Helper Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09314F]/5 dark:bg-[#C5A97A]/10 text-[#09314F] dark:text-[#C5A97A] text-xs font-black uppercase tracking-widest hover:bg-[#09314F]/10 dark:hover:bg-[#C5A97A]/20 transition-all"
                        >
                          <SparklesIcon className="w-3.5 h-3.5" />
                          Generate Strong Password
                        </button>
                        {formData.password && (
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-black uppercase tracking-widest hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                          >
                            <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                            Copy Password
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Location Details */}
                  <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-[#C5A97A]" />
                        Location Details
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Location <span className="text-red-400">*</span>
                        </label>
                        <input
                          list="admin-create-locations-list"
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Select or enter location..."
                          autoComplete="off"
                          className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                            errors.location
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        />
                        <datalist id="admin-create-locations-list">
                          {locationList.map((loc) => (
                            <option key={loc.code} value={`${loc.state}, ${loc.country}`} />
                          ))}
                        </datalist>
                        {errors.location && (
                          <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                            {errors.location}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Home Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter full home address"
                          className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Approval Reason */}
                  <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-[#C5A97A]" />
                        Approval Reason
                      </h3>
                    </div>
                    <div className="p-6">
                      <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                        Internal Approval Note{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows={3}
                        placeholder="e.g. Complimentary registration approved by management for scholarship student."
                        className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all resize-none ${
                          errors.reason
                            ? "border-red-500"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      />
                      {errors.reason && (
                        <p className="text-[10px] text-red-500 mt-1.5 font-bold">
                          {errors.reason}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        This note is saved to the audit log and is required for
                        registration verification.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={creating}
                    className={`w-full rounded-2xl font-black py-5 min-h-[60px] text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
                      creating
                        ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed text-white"
                        : "bg-gradient-to-r from-[#09314F] via-[#C5A97A] to-[#E83831] hover:opacity-90 active:scale-[0.98] text-white"
                    }`}
                  >
                    {creating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {formData.student_id
                          ? "Completing Registration..."
                          : formData.payment_type === "paid"
                          ? "Registering Student & Verifying Payment..."
                          : "Creating Complimentary Student..."}
                      </>
                    ) : (
                      <>
                        {formData.student_id ? (
                          <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Complete Student Registration
                          </>
                        ) : formData.payment_type === "paid" ? (
                          <>
                            <CreditCardIcon className="w-5 h-5" />
                            Register Paid Student & Record Payment
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="w-5 h-5" />
                            Create Complimentary Student
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* MODALS */}
      {recoveryModal && (
        <RecoveryModal
          payment={recoveryModal}
          onClose={() => setRecoveryModal(null)}
          onConfirm={handleRecoveryConfirm}
          loading={recovering}
        />
      )}

      {verificationModal && (
        <VerificationModal
          student={verificationModal}
          onClose={() => setVerificationModal(null)}
          onVerified={() =>
            setToast({
              type: "success",
              message: "Student contact verified successfully!",
            })
          }
        />
      )}

      {extendModal && (
        <ExtendAccessModal
          student={extendModal.student}
          enrollment={extendModal.enrollment}
          onClose={() => setExtendModal(null)}
          onConfirm={handleExtendSubmit}
          loading={submittingExtension}
        />
      )}

      {renewModal && (
        <RenewCourseModal
          student={renewModal.student}
          enrollment={renewModal.enrollment}
          onClose={() => setRenewModal(null)}
          onConfirm={handleRenewSubmit}
          loading={submittingRenewal}
        />
      )}
    </StaffDashboardLayout>
  );
}
