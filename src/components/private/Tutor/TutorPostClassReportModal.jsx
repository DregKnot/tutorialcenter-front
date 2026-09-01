import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

export default function TutorPostClassReportModal({
  isOpen,
  onClose,
  sessionDetails = null,
  onSubmitSuccess = () => {},
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  // Form State matching Official Post-Class Tutor Report
  const [formData, setFormData] = useState({
    // Section 1: Attendance
    presentCount: 0,
    totalCount: 0,
    hasAttendanceIssues: false,
    attendanceIssuesDetail: "",

    // Section 2: Lesson Delivery
    aspectsCovered: "",
    completionStatus: "Fully", // Fully, Partially, Not completed
    leftReason: "",

    // Section 3: Student Understanding
    evidenceObserved: "",
    struggledConcepts: "",
    studentsNeedingAttention: "",

    // Section 4: Student Engagement
    participationLevel: "Active", // Very Active, Active, Moderate, Low
    respondedWellTo: "",
    issuesAffectingConcentration: "",

    // Section 5: Assessment
    assessedToday: true,
    generalPerformance: "Good", // Excellent, Good, Average, Poor

    // Section 6: Class Challenges
    selectedChallenges: [],
    otherChallengeDetail: "",
    challengeExplanation: "",

    // Section 7: Next Step
    improvementPlan: "",
    supportRequired: false,
    supportDetail: "",

    // Tutor's Overall Assessment
    managementSummary: "",
    tutorSignature: "",
  });

  // Pre-fill header and attendance when modal opens
  useEffect(() => {
    if (isOpen && sessionDetails) {
      const storedStaff = localStorage.getItem("staff_user") || localStorage.getItem("user");
      let tutorName = "Course Tutor";
      try {
        if (storedStaff) {
          const parsed = JSON.parse(storedStaff);
          tutorName = trimString(`${parsed.firstname || ""} ${parsed.surname || ""}`) || "Course Tutor";
        }
      } catch (e) {}

      setFormData((prev) => ({
        ...prev,
        presentCount: sessionDetails.present_count ?? (sessionDetails.attendances_count ?? 15),
        totalCount: sessionDetails.total_students ?? 20,
        tutorSignature: sessionDetails.tutor_name || tutorName,
      }));
      setError(null);
      setSuccessMessage(null);
      setCurrentStep(1);
    }
  }, [isOpen, sessionDetails]);

  if (!isOpen) return null;

  function trimString(str) {
    return (str || "").trim();
  }

  const handleCheckboxToggle = (challenge) => {
    setFormData((prev) => {
      const exists = prev.selectedChallenges.includes(challenge);
      return {
        ...prev,
        selectedChallenges: exists
          ? prev.selectedChallenges.filter((c) => c !== challenge)
          : [...prev.selectedChallenges, challenge],
      };
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!sessionDetails?.id) {
      setError("Class session reference is missing.");
      return;
    }

    if (!formData.aspectsCovered.trim()) {
      setError("Please describe the specific aspects of the topic covered in Section 2.");
      setCurrentStep(1);
      return;
    }

    if (!formData.managementSummary.trim()) {
      setError("Please provide the summary for management in the Overall Assessment section.");
      setCurrentStep(3);
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem("staff_token") || localStorage.getItem("token");

    const payload = {
      class_session_id: sessionDetails.id,
      attendance: {
        present_count: parseInt(formData.presentCount, 10) || 0,
        total_count: parseInt(formData.totalCount, 10) || 0,
        has_issues: Boolean(formData.hasAttendanceIssues),
        issues_detail: formData.hasAttendanceIssues ? formData.attendanceIssuesDetail : null,
      },
      lesson_delivery: {
        aspects_covered: formData.aspectsCovered,
        completion_status: formData.completionStatus,
        left_reason: formData.completionStatus !== "Fully" ? formData.leftReason : null,
      },
      student_understanding: {
        evidence: formData.evidenceObserved,
        struggled_concepts: formData.struggledConcepts,
        students_needing_attention: formData.studentsNeedingAttention,
      },
      student_engagement: {
        participation_level: formData.participationLevel,
        responded_well_to: formData.respondedWellTo,
        issues_affecting_concentration: formData.issuesAffectingConcentration,
      },
      assessment: {
        assessed_today: Boolean(formData.assessedToday),
        general_performance: formData.assessedToday ? formData.generalPerformance : null,
      },
      class_challenges: {
        challenges: formData.selectedChallenges,
        other_challenge: formData.selectedChallenges.includes("Other") ? formData.otherChallengeDetail : null,
        explanation: formData.challengeExplanation,
      },
      next_steps: {
        improvement_plan: formData.improvementPlan,
        support_required: Boolean(formData.supportRequired),
        support_detail: formData.supportRequired ? formData.supportDetail : null,
      },
      overall_assessment: {
        management_summary: formData.managementSummary,
        tutor_signature: formData.tutorSignature,
      },
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/staffs/classes/tutor-report`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setLoading(false);
      setSuccessMessage("Post-Class Tutor Report submitted successfully to management.");
      setTimeout(() => {
        onSubmitSuccess(response.data?.data);
        onClose();
      }, 1200);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
          "Failed to submit post-class report. Please verify all required fields."
      );
    }
  };

  const challengeOptions = [
    "Student Understanding",
    "Student Participation",
    "Time Management",
    "Technical/Network Issues",
    "Teaching Materials",
    "Behaviour/Discipline",
    "Other",
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#091E2F] border border-gray-100 dark:border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* TOP HEADER */}
        <div className="bg-gradient-to-r from-[#09314F] to-[#124b75] p-5 sm:p-6 text-white relative">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A97A]/20 border border-[#C5A97A]/40 text-[#E5D2B3] text-[10px] font-black uppercase tracking-widest">
                <Icon icon="lucide:clipboard-check" className="w-3.5 h-3.5" />
                <span>Official Report</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Post-Class Tutor Report
              </h2>
              <p className="text-xs text-white/70">
                {sessionDetails?.subject || "Masterclass"} • {sessionDetails?.class_title || "Lesson Session"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <Icon icon="lucide:x" className="w-4 h-4" />
            </button>
          </div>

          {/* Session Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/15 text-[11px]">
            <div>
              <span className="text-white/50 uppercase text-[9px] font-bold block">Tutor</span>
              <span className="font-bold text-white truncate block">{formData.tutorSignature || "Tutor"}</span>
            </div>
            <div>
              <span className="text-white/50 uppercase text-[9px] font-bold block">Date</span>
              <span className="font-bold text-white block">{sessionDetails?.date || new Date().toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-white/50 uppercase text-[9px] font-bold block">Class Time</span>
              <span className="font-bold text-white block">{sessionDetails?.time || "Live Session"}</span>
            </div>
            <div>
              <span className="text-white/50 uppercase text-[9px] font-bold block">Topic</span>
              <span className="font-bold text-white truncate block">{sessionDetails?.topic || sessionDetails?.class_title || "Topic Lesson"}</span>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
            {[
              { num: 1, label: "Attendance & Lesson" },
              { num: 2, label: "Understanding & Engagement" },
              { num: 3, label: "Assessment & Next Steps" },
            ].map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`flex-1 text-left py-1.5 px-2.5 rounded-xl transition-all text-[11px] font-black flex items-center gap-2 ${
                  currentStep === st.num
                    ? "bg-[#C5A97A] text-[#09314F]"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[9px]">
                  {st.num}
                </span>
                <span className="hidden sm:inline">{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-gray-800 dark:text-gray-100">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Icon icon="lucide:check-circle" className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ── STEP 1: ATTENDANCE & LESSON DELIVERY ────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* 1. ATTENDANCE */}
              <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#09314F] dark:bg-[#C5A97A] text-white dark:text-[#09314F] text-[10px] font-black flex items-center justify-center">1</span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#09314F] dark:text-white">Attendance</h3>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300">How many students attended the class?</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">Present:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.presentCount}
                        onChange={(e) => setFormData({ ...formData, presentCount: e.target.value })}
                        className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center font-black text-sm"
                      />
                    </div>
                    <span className="text-gray-400 font-bold">/</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">Total:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.totalCount}
                        onChange={(e) => setFormData({ ...formData, totalCount: e.target.value })}
                        className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center font-black text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">Were there any notable attendance issues?</p>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="hasAttendanceIssues"
                          checked={!formData.hasAttendanceIssues}
                          onChange={() => setFormData({ ...formData, hasAttendanceIssues: false, attendanceIssuesDetail: "" })}
                        />
                        <span>No</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="hasAttendanceIssues"
                          checked={formData.hasAttendanceIssues}
                          onChange={() => setFormData({ ...formData, hasAttendanceIssues: true })}
                        />
                        <span>Yes — Please specify</span>
                      </label>
                    </div>

                    {formData.hasAttendanceIssues && (
                      <input
                        type="text"
                        placeholder="e.g. 3 students joined 25 mins late due to network glitch"
                        value={formData.attendanceIssuesDetail}
                        onChange={(e) => setFormData({ ...formData, attendanceIssuesDetail: e.target.value })}
                        className="mt-2 w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* 2. LESSON DELIVERY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#09314F] dark:bg-[#C5A97A] text-white dark:text-[#09314F] text-[10px] font-black flex items-center justify-center">2</span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#09314F] dark:text-white">Lesson Delivery</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      What specific aspect(s) of the topic did you cover today? <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Covered Organic Chemistry: IUPAC nomenclature, Alkyl groups, and structural isomers."
                      value={formData.aspectsCovered}
                      onChange={(e) => setFormData({ ...formData, aspectsCovered: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Was the planned lesson completed?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Fully", "Partially", "Not completed"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormData({ ...formData, completionStatus: st })}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                            formData.completionStatus === st
                              ? "bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F]"
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {formData.completionStatus !== "Fully" && (
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          If partially completed, what was left and why?
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Reaction mechanisms left for next session to allow thorough exercise drills."
                          value={formData.leftReason}
                          onChange={(e) => setFormData({ ...formData, leftReason: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── STEP 2: STUDENT UNDERSTANDING & ENGAGEMENT ──────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* 3. STUDENT UNDERSTANDING */}
              <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#09314F] dark:bg-[#C5A97A] text-white dark:text-[#09314F] text-[10px] font-black flex items-center justify-center">3</span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#09314F] dark:text-white">Student Understanding</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      What evidence did you observe that students understood the lesson?
                    </label>
                    <p className="text-[10px] text-gray-400 mb-1">(e.g., correctly answered questions, completed exercises, explained concepts.)</p>
                    <textarea
                      rows={2}
                      placeholder="e.g. 80% of students solved live calculation problems on Zoom whiteboard within 2 minutes."
                      value={formData.evidenceObserved}
                      onChange={(e) => setFormData({ ...formData, evidenceObserved: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Which concept(s) did students struggle with?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Finding the longest carbon chain with branching radicals."
                      value={formData.struggledConcepts}
                      onChange={(e) => setFormData({ ...formData, struggledConcepts: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Which student(s) require additional attention or support?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Daniel O. and Grace A. (hesitant during question rounds)."
                      value={formData.studentsNeedingAttention}
                      onChange={(e) => setFormData({ ...formData, studentsNeedingAttention: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. STUDENT ENGAGEMENT */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#09314F] dark:bg-[#C5A97A] text-white dark:text-[#09314F] text-[10px] font-black flex items-center justify-center">4</span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#09314F] dark:text-white">Student Engagement</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      How actively did students participate?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["Very Active", "Active", "Moderate", "Low"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, participationLevel: lvl })}
                          className={`py-2 rounded-xl text-xs font-black transition-all ${
                            formData.participationLevel === lvl
                              ? "bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F]"
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      What did students respond particularly well to?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Worked past JAMB questions on the interactive slide deck."
                      value={formData.respondedWellTo}
                      onChange={(e) => setFormData({ ...formData, respondedWellTo: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Were there any issues affecting participation or concentration?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Minor audio lag for 2 students initially, resolved after rejoin."
                      value={formData.issuesAffectingConcentration}
                      onChange={(e) => setFormData({ ...formData, issuesAffectingConcentration: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── STEP 3: ASSESSMENT, CHALLENGES, NEXT STEPS & SIGNATURE ──────── */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* 5. ASSESSMENT */}
              <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#09314F] dark:bg-[#C5A97A] text-white dark:text-[#09314F] text-[10px] font-black flex items-center justify-center">5</span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#09314F] dark:text-white">Assessment</h3>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Did you assess students' understanding today?</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="assessedToday"
                          checked={formData.assessedToday}
                          onChange={() => setFormData({ ...formData, assessedToday: true })}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="assessedToday"
                          checked={!formData.assessedToday}
                          onChange={() => setFormData({ ...formData, assessedToday: false })}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {formData.assessedToday && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">If yes, what was the general performance?</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Excellent", "Good", "Average", "Poor"].map((perf) => (
                          <button
                            key={perf}
                            type="button"
                            onClick={() => setFormData({ ...formData, generalPerformance: perf })}
                            className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                              formData.generalPerformance === perf
                                ? "bg-emerald-600 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {perf}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. CLASS CHALLENGES */}
              <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#09314F] dark:bg-[#C5A97A] text-white dark:text-[#09314F] text-[10px] font-black flex items-center justify-center">6</span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#09314F] dark:text-white">Class Challenges</h3>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">What was the biggest challenge encountered during the class?</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {challengeOptions.map((c) => {
                      const isSel = formData.selectedChallenges.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleCheckboxToggle(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSel
                              ? "bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F]"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          <Icon icon={isSel ? "lucide:check-square" : "lucide:square"} className="w-3.5 h-3.5" />
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>

                  {formData.selectedChallenges.includes("Other") && (
                    <input
                      type="text"
                      placeholder="Specify other challenge..."
                      value={formData.otherChallengeDetail}
                      onChange={(e) => setFormData({ ...formData, otherChallengeDetail: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                    />
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Briefly explain:</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Time management was tight due to detailed breakdown of organic functional groups."
                      value={formData.challengeExplanation}
                      onChange={(e) => setFormData({ ...formData, challengeExplanation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 7. NEXT STEP */}
              <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#09314F] dark:bg-[#C5A97A] text-white dark:text-[#09314F] text-[10px] font-black flex items-center justify-center">7</span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#09314F] dark:text-white">Next Step</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      What should be done in the next class to improve students' learning?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Conduct a 10-minute speed drill on IUPAC naming before beginning reaction mechanisms."
                      value={formData.improvementPlan}
                      onChange={(e) => setFormData({ ...formData, improvementPlan: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs"
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Is any intervention or support from Tutorial Center required?</p>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="supportRequired"
                          checked={!formData.supportRequired}
                          onChange={() => setFormData({ ...formData, supportRequired: false, supportDetail: "" })}
                        />
                        <span>No</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="supportRequired"
                          checked={formData.supportRequired}
                          onChange={() => setFormData({ ...formData, supportRequired: true })}
                        />
                        <span>Yes</span>
                      </label>
                    </div>

                    {formData.supportRequired && (
                      <textarea
                        rows={2}
                        placeholder="If yes, what specifically is required from management/advisors?"
                        value={formData.supportDetail}
                        onChange={(e) => setFormData({ ...formData, supportDetail: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* TUTOR'S OVERALL ASSESSMENT */}
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#09314F] dark:text-[#C5A97A]">
                  Tutor's Overall Assessment
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    In one or two sentences, what is the most important thing management should know about today's class? <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Class was productive and engaged; students showed strong enthusiasm for problem-solving drills."
                    value={formData.managementSummary}
                    onChange={(e) => setFormData({ ...formData, managementSummary: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Tutor's Name/Signature:</label>
                    <input
                      type="text"
                      value={formData.tutorSignature}
                      onChange={(e) => setFormData({ ...formData, tutorSignature: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Submission Date/Time:</label>
                    <input
                      type="text"
                      disabled
                      value={new Date().toLocaleString()}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-xs text-gray-400 font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </form>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Previous Section
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-500 font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2.5 bg-[#09314F] dark:bg-[#C5A97A] text-white dark:text-[#09314F] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Next Section</span>
                <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                    <span>Submitting Report...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:check" className="w-4 h-4" />
                    <span>Submit Tutor Report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
