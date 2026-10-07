import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

export default function PendingApprovalScreen({ 
  student, 
  pendingEnrollment, 
  onRefresh, 
  refreshing = false 
}) {
  const [copied, setCopied] = useState(false);


  const enrollmentCode = pendingEnrollment?.enrollment_code || student?.enrollment_code || "TMP-ENR-PENDING";
  const courseTitle = pendingEnrollment?.course_title || pendingEnrollment?.course?.title || "Course Enrollment";
  const pendingSubjects = pendingEnrollment?.pending_subjects || [];
  const paymentRef = pendingEnrollment?.payment_reference || "Pending Review";
  const expiresAt = pendingEnrollment?.expires_at;

  const handleCopyCode = () => {
    if (!enrollmentCode) return;
    navigator.clipboard.writeText(enrollmentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedExpiry = expiresAt 
    ? new Date(expiresAt).toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-8 animate-in fade-in duration-500 font-sans">
      
      {/* ── TOP HERO CARD ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2843] via-[#14375d] to-[#0a1e33] text-white p-6 sm:p-10 shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Payment Verification Under Review
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {student?.firstname || "Student"}! 👋
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Your application has been received and is waiting for administrator approval. You have been assigned a 
              <strong className="text-amber-300 font-semibold"> 48-hour temporary enrollment ID</strong>. Once payment is confirmed, your chosen subjects will be fully registered and learning materials will unlock.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 backdrop-blur-md border border-white/15 transition-all shadow-md disabled:opacity-50"
              title="Check if payment has been approved"
            >
              <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Checking..." : "Refresh Status"}
            </button>
          </div>
        </div>
      </div>

      {/* ── TEMPORARY ENROLLMENT ID CARD ── */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700/70 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-700/60">
          <div>
            <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
              Temporary Enrollment Code
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="font-mono text-xl sm:text-2xl font-black text-[#0F2843] dark:text-white tracking-wider bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80">
                {enrollmentCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all active:scale-95"
                title="Copy Temporary ID"
              >
                <Icon icon={copied ? "lucide:check" : "lucide:copy"} className={`w-4 h-4 ${copied ? "text-emerald-500" : ""}`} />
              </button>
              {copied && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  Copied!
                </span>
              )}
            </div>
          </div>

          {formattedExpiry && (
            <div className="flex items-center gap-3 bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200/70 dark:border-amber-900/60">
              <Icon icon="lucide:alarm-clock" className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-amber-900 dark:text-amber-200">48-Hour Validity Window</p>
                <p className="text-amber-700 dark:text-amber-400 font-medium">Valid until: {formattedExpiry}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── COURSE & SUBJECTS DETAILS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Program Card */}
          <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Icon icon="heroicons:academic-cap-solid" className="w-4 h-4 text-[#0F2843] dark:text-blue-400" />
              Selected Program
            </div>
            <p className="text-base font-extrabold text-[#0F2843] dark:text-white">
              {courseTitle}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Curriculum, past questions, and scheduled live tutoring are ready to activate upon approval.
            </p>
          </div>

          {/* Payment Card */}
          <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Icon icon="lucide:credit-card" className="w-4 h-4 text-[#0F2843] dark:text-blue-400" />
              Payment Information
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Method:</span>
              <span className="font-bold text-[#0F2843] dark:text-white uppercase">Bank Transfer</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Reference:</span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{paymentRef}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Status:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">Awaiting Verification</span>
            </div>
          </div>
        </div>

        {/* ── SUBJECTS PENDING REGISTRATION ── */}
        {pendingSubjects.length > 0 && (
          <div className="pt-2">
            <h3 className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-3">
              Subjects Chosen for Registration ({pendingSubjects.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {pendingSubjects.map((sub, idx) => (
                <div 
                  key={idx}
                  className="px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200/80 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                  <Icon icon="heroicons:book-open-solid" className="w-3.5 h-3.5 text-[#BB9E7F]" />
                  <span>{sub.name || sub.title || `Subject #${sub.id || idx + 1}`}</span>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                    Pending
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              ✨ All selected subjects will be officially registered to your profile with full attendance tracking immediately upon payment approval.
            </p>
          </div>
        )}
      </div>

      {/* ── 4-STAGE REGISTRATION STEPPER ── */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700/70 shadow-sm space-y-6">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">
          Enrollment & Verification Stages
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">1. Account Created</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Profile & login verified</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">2. Subjects Selected</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Course & curriculum chosen</p>
            </div>
          </div>

          {/* Step 3 - Active */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 flex items-start gap-3 shadow-md shadow-amber-500/10">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
              3
            </div>
            <div>
              <p className="text-xs font-black text-amber-950 dark:text-amber-200">3. Admin Review</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">Verifying bank transfer</p>
            </div>
          </div>

          {/* Step 4 - Locked */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 flex items-start gap-3 opacity-60">
            <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-500 flex items-center justify-center shrink-0 text-xs font-bold">
              <Icon icon="lucide:lock" className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400">4. Academic Access</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Unlocks automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ & SUPPORT SECTION ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-bold text-[#0F2843] dark:text-white">Have questions about your verification?</p>
          <p className="text-gray-500 dark:text-gray-400">Our support team is available to assist you with quick verification.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/feedback"
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-[#0F2843] dark:text-white font-bold transition-all"
          >
            Submit Inquiry
          </Link>
          <a
            href="https://wa.me/2348000000000?text=Hello%20Tutorial%20Center,%20I%20have%20submitted%20a%20bank%20transfer%20with%20temporary%20ID%20"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
          >
            <Icon icon="logos:whatsapp-icon" className="w-4 h-4" />
            WhatsApp Support
          </a>
        </div>
      </div>

    </div>
  );
}
