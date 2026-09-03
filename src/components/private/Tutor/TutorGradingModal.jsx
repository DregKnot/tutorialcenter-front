import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  XMarkIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon
} from "@heroicons/react/24/outline";
import MathRenderer from "../../common/MathRenderer.jsx";

export default function TutorGradingModal({
  isOpen,
  onClose,
  assessment,
  onGraded
}) {
  const [submissions, setSubmissions] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'submitted', 'graded', 'in_progress', 'absent'

  // Selected Submission for Detailed Grading
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [submissionDetail, setSubmissionDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Grade Form State: keyed by question_id -> { marks_awarded, feedback, is_correct }
  const [gradesForm, setGradesForm] = useState({});
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  // Fetch Submissions List
  const fetchSubmissions = useCallback(async () => {
    if (!assessment || !isOpen) return;
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/tutor/assessments/${assessment.id}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        }
      );
      const data = res.data?.submissions || [];
      setSubmissions(Array.isArray(data) ? data : []);

      // Auto select first submitted if none selected
      if (!selectedSubmissionId && data.length > 0) {
        const firstSubmitted = data.find((s) => s.status === "submitted") || data[0];
        setSelectedSubmissionId(firstSubmitted.id);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
      setErrorMsg("Failed to load student submissions roster.");
    } finally {
      setLoadingList(false);
    }
  }, [assessment, isOpen, API_BASE_URL, token, selectedSubmissionId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Fetch Full Submission Detail
  const fetchSubmissionDetail = useCallback(async (subId) => {
    if (!subId || !assessment) return;
    setLoadingDetail(true);
    setAlertMsg(null);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/tutor/assessments/${assessment.id}/submissions/${subId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        }
      );
      const data = res.data?.submission || null;
      setSubmissionDetail(data);

      // Initialize grade form with existing marks and feedback
      if (data && Array.isArray(data.answers)) {
        const initial = {};
        data.answers.forEach((ans) => {
          initial[String(ans.question_id)] = {
            marks_awarded: ans.marks_awarded !== null && ans.marks_awarded !== undefined ? ans.marks_awarded : (ans.is_correct ? (ans.question?.marks || 0) : 0),
            feedback: ans.feedback || "",
            is_correct: ans.is_correct
          };
        });
        setGradesForm(initial);
      }
    } catch (err) {
      console.error("Failed to fetch submission detail:", err);
      setErrorMsg("Failed to load submission details.");
    } finally {
      setLoadingDetail(false);
    }
  }, [assessment, API_BASE_URL, token]);

  useEffect(() => {
    if (selectedSubmissionId) {
      fetchSubmissionDetail(selectedSubmissionId);
    }
  }, [selectedSubmissionId, fetchSubmissionDetail]);

  if (!isOpen || !assessment) return null;

  // Grade Form Inputs Handlers
  const handleGradeChange = (questionId, field, value) => {
    setGradesForm((prev) => ({
      ...prev,
      [String(questionId)]: {
        ...prev[String(questionId)],
        [field]: value
      }
    }));
  };

  // Submit Grading
  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!selectedSubmissionId) return;

    setSubmittingGrade(true);
    setAlertMsg(null);
    setErrorMsg(null);

    try {
      const payload = {
        grades: {}
      };

      Object.entries(gradesForm).forEach(([qId, gradeData]) => {
        payload.grades[qId] = {
          marks_awarded: parseFloat(gradeData.marks_awarded) || 0,
          feedback: gradeData.feedback ? gradeData.feedback.trim() : null,
          is_correct: typeof gradeData.is_correct === "boolean" ? gradeData.is_correct : (parseFloat(gradeData.marks_awarded) > 0)
        };
      });

      const res = await axios.post(
        `${API_BASE_URL}/api/tutor/assessments/${assessment.id}/submissions/${selectedSubmissionId}/grade`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        }
      );

      setAlertMsg("Grading submitted successfully! Student has been notified.");
      
      // Refresh list and detail
      await fetchSubmissions();
      if (res.data?.submission) {
        setSubmissionDetail(res.data.submission);
      }
      if (onGraded) onGraded();
    } catch (err) {
      console.error("Grading submit error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to submit grading.");
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Reopen Submission for Retake
  const handleReopenSubmission = async () => {
    if (!selectedSubmissionId) return;
    const confirm = window.confirm(
      "Are you sure you want to reopen this submission? The student's previous answers will be cleared so they can take the assessment again."
    );
    if (!confirm) return;

    setReopening(true);
    setAlertMsg(null);
    setErrorMsg(null);

    try {
      await axios.post(
        `${API_BASE_URL}/api/tutor/assessments/${assessment.id}/submissions/${selectedSubmissionId}/reopen`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        }
      );

      setAlertMsg("Submission reopened. The student may now re-attempt the assessment.");
      await fetchSubmissions();
      if (selectedSubmissionId) {
        await fetchSubmissionDetail(selectedSubmissionId);
      }
    } catch (err) {
      console.error("Reopen submission error:", err);
      setErrorMsg("Failed to reopen submission.");
    } finally {
      setReopening(false);
    }
  };

  // Filter submissions list
  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === "all") return true;
    return s.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "graded":
        return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300";
      case "submitted":
        return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 animate-pulse";
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300";
      case "absent":
        return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300";
      default:
        return "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-6xl bg-white dark:bg-[#09314F] rounded-none sm:rounded-[36px] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/10 bg-gradient-to-r from-[#0F2843] to-[#163a5f] text-white flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A97A]/20 border border-[#C5A97A]/30 flex items-center justify-center flex-shrink-0">
              <CheckBadgeIcon className="w-5 h-5 text-[#C5A97A]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white line-clamp-1">
                Submissions & Grading Desk
              </h2>
              <p className="text-xs text-gray-300 line-clamp-1">
                {assessment.title} • {assessment.class?.subject?.name || "Masterclass"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSubmissions}
              disabled={loadingList}
              className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition"
              title="Refresh submissions"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loadingList ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {alertMsg && (
          <div className="p-3.5 mx-4 sm:mx-6 mt-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 flex-shrink-0">
            <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span>{alertMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 mx-4 sm:mx-6 mt-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs flex items-center gap-2 flex-shrink-0">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-COLUMN DESK BODY */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          
          {/* LEFT COLUMN: SUBMISSIONS LIST ROSTER (4 COLS) */}
          <div className={`lg:col-span-4 border-r border-gray-100 dark:border-white/10 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-black/10 ${selectedSubmissionId ? "hidden lg:flex" : "flex"}`}>
            
            {/* Filter Tabs */}
            <div className="p-4 border-b border-gray-100 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-200">
                <span>Student Submissions ({submissions.length})</span>
                <span className="text-[11px] text-[#C5A97A] font-black">
                  {submissions.filter((s) => s.status === "graded").length} Graded
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {["all", "submitted", "graded", "in_progress", "absent"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition flex-shrink-0 ${
                      statusFilter === tab
                        ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843]"
                        : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                  >
                    {tab.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {loadingList ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  <div className="w-6 h-6 border-2 border-[#0F2843] dark:border-[#C5A97A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading submissions...
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No submissions match filter.
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = sub.id === selectedSubmissionId;
                  const studentName = sub.student
                    ? `${sub.student.firstname} ${sub.student.surname}`
                    : "Student";

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubmissionId(sub.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-white dark:bg-[#09314F] border-[#0F2843] dark:border-[#C5A97A] shadow-md ring-1 ring-[#0F2843]/20"
                          : "bg-white dark:bg-white/5 border-gray-200/70 dark:border-white/10 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#0F2843]/10 dark:bg-white/10 text-[#0F2843] dark:text-[#C5A97A] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {studentName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {studentName}
                          </h4>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {sub.submitted_at
                              ? new Date(sub.submitted_at).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "Not submitted"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getStatusBadge(
                            sub.status
                          )}`}
                        >
                          {sub.status.replace("_", " ")}
                        </span>
                        {sub.score !== null && sub.score !== undefined && (
                          <div className="text-[11px] font-black text-gray-700 dark:text-gray-200 mt-1">
                            {sub.score}/{sub.total_marks || assessment.total_marks}
                            <span className="text-gray-400 text-[9px] ml-1">
                              ({Math.round(sub.percentage || 0)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED GRADING DESK (8 COLS) */}
          <div className={`lg:col-span-8 flex flex-col overflow-hidden bg-white dark:bg-[#09314F] ${selectedSubmissionId ? "flex" : "hidden lg:flex"}`}>
            {loadingDetail ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-gray-400">
                <div className="w-8 h-8 border-2 border-[#0F2843] dark:border-[#C5A97A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading submission answers...
              </div>
            ) : !submissionDetail ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-gray-400">
                Select a student submission from the left roster to begin grading.
              </div>
            ) : (
              <form onSubmit={handleSubmitGrade} className="flex-1 flex flex-col overflow-hidden">
                
                {/* SUBMISSION TOP BAR */}
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedSubmissionId(null)}
                      className="lg:hidden px-2.5 py-1.5 rounded-xl bg-[#0F2843]/10 dark:bg-white/10 text-[#0F2843] dark:text-[#C5A97A] text-xs font-bold flex items-center gap-1 hover:bg-[#0F2843] hover:text-white transition"
                    >
                      <span>← Roster</span>
                    </button>

                    <div className="w-10 h-10 rounded-2xl bg-[#0F2843] text-[#C5A97A] font-black text-sm flex items-center justify-center flex-shrink-0">
                      {(submissionDetail.student?.firstname || "S").charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">
                        {submissionDetail.student?.firstname} {submissionDetail.student?.surname}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-300">
                        Status: <span className="font-bold capitalize">{submissionDetail.status}</span> • Current Score:{" "}
                        <span className="font-black text-[#0F2843] dark:text-[#C5A97A]">
                          {submissionDetail.score || 0} / {submissionDetail.total_marks || assessment.total_marks} ({Math.round(submissionDetail.percentage || 0)}%)
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Top Action: Reopen for retake */}
                  <button
                    type="button"
                    onClick={handleReopenSubmission}
                    disabled={reopening}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5 flex-shrink-0"
                    title="Allow student to retake"
                  >
                    <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                    <span>{reopening ? "Reopening..." : "Reopen for Retake"}</span>
                  </button>
                </div>

                {/* QUESTIONS & ANSWERS SCROLLABLE LIST */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
                  {(!submissionDetail.answers || submissionDetail.answers.length === 0) ? (
                    <div className="p-8 text-center text-xs text-gray-400">
                      No answers recorded for this submission.
                    </div>
                  ) : (
                    submissionDetail.answers.map((ans, idx) => {
                      const q = ans.question || {};
                      const gradeState = gradesForm[String(ans.question_id)] || {};
                      const isMcq = q.type === "mcq";

                      return (
                        <div
                          key={ans.id || idx}
                          className="p-5 rounded-3xl bg-gray-50/90 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 space-y-4 shadow-sm"
                        >
                          {/* Question Header */}
                          <div className="flex items-start justify-between gap-3 border-b border-gray-200/50 dark:border-white/10 pb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-[#0F2843] dark:text-[#C5A97A]">
                                  Question #{idx + 1}
                                </span>
                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                    isMcq
                                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                      : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                                  }`}
                                >
                                  {isMcq ? "MCQ (Auto-Scored)" : "Written Essay"}
                                </span>
                              </div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                <MathRenderer text={q.question} />
                              </div>
                            </div>

                            <span className="text-xs font-black text-gray-500 dark:text-gray-300 flex-shrink-0">
                              Max: {q.marks || 0} pts
                            </span>
                          </div>

                          {/* Student Answer Display */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                              Student's Answer:
                            </label>
                            {isMcq ? (
                              <div
                                className={`p-3 rounded-2xl text-xs font-bold border flex items-center justify-between ${
                                  ans.is_correct
                                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                                    : "bg-red-50 dark:bg-red-950/30 border-red-300 text-red-800 dark:text-red-200"
                                }`}
                              >
                                <span className="flex-1">
                                  Chosen: <span className="underline"><MathRenderer text={ans.option?.option_text || "No Option Selected"} /></span>
                                </span>
                                <span className="text-[10px] uppercase font-black flex-shrink-0 ml-2">
                                  {ans.is_correct ? "✓ Correct Choice" : "✗ Incorrect Choice"}
                                </span>
                              </div>
                            ) : (
                              <div className="p-4 rounded-2xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {ans.answer || <span className="italic text-gray-400">No written answer submitted.</span>}
                              </div>
                            )}
                          </div>

                          {/* Model Answer for Essay */}
                          {!isMcq && q.explanation && (
                            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200">
                              <span className="font-bold">Model Answer / Grading Note: </span>
                              <MathRenderer text={q.explanation} />
                            </div>
                          )}

                          {/* Marks & Feedback Input */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                            <div className="sm:col-span-1">
                              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                Awarded Marks
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={q.marks || 100}
                                step="0.5"
                                value={gradeState.marks_awarded !== undefined ? gradeState.marks_awarded : 0}
                                onChange={(e) =>
                                  handleGradeChange(ans.question_id, "marks_awarded", e.target.value)
                                }
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-black focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] outline-none"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                Tutor Feedback / Corrections (Visible to Student)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Excellent explanation of energy conservation."
                                value={gradeState.feedback || ""}
                                onChange={(e) =>
                                  handleGradeChange(ans.question_id, "feedback", e.target.value)
                                }
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* BOTTOM GRADING SUBMIT BAR */}
                <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-between gap-4 flex-shrink-0">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-300">
                    Grading will update the student's score and send them an in-app & email notification.
                  </div>

                  <button
                    type="submit"
                    disabled={submittingGrade}
                    className="px-8 py-2.5 text-xs font-black text-white bg-[#0F2843] hover:bg-[#163a5f] dark:bg-[#C5A97A] dark:hover:bg-[#d6bc8f] dark:text-[#0F2843] rounded-2xl shadow-lg shadow-[#0F2843]/20 transition flex items-center gap-2"
                  >
                    {submittingGrade ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Grades...</span>
                      </>
                    ) : (
                      <>
                        <CheckBadgeIcon className="w-4 h-4" />
                        <span>Finalize & Submit Grades</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
