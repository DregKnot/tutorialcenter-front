import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import StudentAssessmentResultModal from "../../components/private/Students/StudentAssessmentResultModal.jsx";
import MathRenderer from "../../components/common/MathRenderer.jsx";
import axios from "axios";
import {
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function StudentAssessmentTaker() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active question index (0-indexed)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers State: keyed by question ID -> { question_option_id (for MCQ) or answer (for Essay) }
  const [answers, setAnswers] = useState({});

  // Live Timer State (in seconds)
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  // Submission States
  const [submitting, setSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("token") || localStorage.getItem("student_token");

  // Fetch Assessment Detail
  const fetchAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students/assessments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      const data = res.data || {};
      setAssessmentData(data);

      // If already graded or submitted, redirect to result
      if (data.submission && (data.submission.status === "graded" || data.submission.status === "submitted")) {
        setSubmissionResult(data);
        setResultModalOpen(true);
        return;
      }

      // Initialize answers from existing answers if any
      if (Array.isArray(data.answers)) {
        const initial = {};
        data.answers.forEach((ans) => {
          if (ans.question_option_id) {
            initial[String(ans.question_id)] = { question_option_id: ans.question_option_id };
          } else if (ans.answer) {
            initial[String(ans.question_id)] = { answer: ans.answer };
          }
        });
        setAnswers(initial);
      }

      // Initialize countdown timer if timer_minutes is set
      const timerMins = data.assessment?.timer_minutes;
      if (timerMins && timerMins > 0) {
        setTimeLeft(timerMins * 60);
      }
    } catch (err) {
      console.error("Failed to load assessment:", err);
      setError(err.response?.data?.message || "Failed to load assessment. You may not be enrolled in this subject.");
    } finally {
      setLoading(false);
    }
  }, [id, API_BASE_URL, token]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  // Handle live timer countdown
  const submitAnswersRef = useRef(null);

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting || !assessmentData) return;
    setSubmitting(true);
    setSubmitConfirmOpen(false);

    try {
      const payload = {
        answers: {}
      };

      Object.entries(answers).forEach(([qId, ansData]) => {
        if (ansData.question_option_id) {
          payload.answers[qId] = { question_option_id: parseInt(ansData.question_option_id) };
        } else if (ansData.answer && ansData.answer.trim()) {
          payload.answers[qId] = { answer: ansData.answer.trim() };
        }
      });

      const res = await axios.post(
        `${API_BASE_URL}/api/students/assessments/${id}/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        }
      );

      // Re-fetch detail to show result modal
      const refreshed = await axios.get(`${API_BASE_URL}/api/students/assessments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      setSubmissionResult(refreshed.data || { submission: res.data?.submission, assessment: assessmentData.assessment, questions: assessmentData.questions, answers: [] });
      setResultModalOpen(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.response?.data?.message || "Failed to submit assessment answers. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }, [submitting, assessmentData, answers, id, API_BASE_URL, token]);

  submitAnswersRef.current = handleSubmit;

  useEffect(() => {
    if (timeLeft === null || timeLeft === undefined) return;

    if (timeLeft <= 0) {
      // Auto-submit on time expiry
      if (submitAnswersRef.current) {
        submitAnswersRef.current(true);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  // Format seconds to MM:SS
  const formatTimer = (seconds) => {
    if (seconds === null || seconds === undefined) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const assessment = assessmentData?.assessment || {};
  const questions = assessmentData?.questions || [];
  const currentQuestion = questions[currentIndex] || null;

  // Answer handlers
  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: { question_option_id: optionId }
    }));
  };

  const handleEssayChange = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: { answer: text }
    }));
  };

  // Count answered questions
  const answeredCount = Object.keys(answers).filter((k) => {
    const a = answers[k];
    return a && (a.question_option_id || (a.answer && a.answer.trim()));
  }).length;

  if (loading) {
    return (
      <DashboardLayout hideRightPanel={true} hideHeader={true}>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#0F2843] dark:border-[#C5A97A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500">Entering Assessment Room...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !currentQuestion) {
    return (
      <DashboardLayout hideRightPanel={true} hideHeader={true}>
        <div className="p-6 max-w-2xl mx-auto min-h-[70vh] flex items-center justify-center">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#09314F] border border-gray-100 dark:border-white/10 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <ExclamationTriangleIcon className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Unable to Access Assessment</h2>
            <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed">{error}</p>
            <button
              onClick={() => navigate("/student/assessments")}
              className="px-6 py-2.5 rounded-2xl bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] text-xs font-black"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout hideRightPanel={true} hideHeader={true}>
      <div className="p-3 sm:p-6 max-w-5xl mx-auto w-full min-h-screen space-y-6 pb-24">
        
        {/* TOP STATUS BAR & TIMER */}
        <div className="bg-white dark:bg-[#09314F] rounded-[28px] p-5 sm:p-6 border border-gray-100 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black text-[#0F2843] dark:text-[#C5A97A] uppercase tracking-wider">
              <AcademicCapIcon className="w-4 h-4" />
              <span>Assessment in Progress</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {assessment.title}
            </h1>
            <p className="text-xs text-gray-400">
              Pass Standard: {assessment.pass_mark || 50}% • Total Marks: {assessment.total_marks || 0} pts
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Live Countdown Timer */}
            {timeLeft !== null && (
              <div
                className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-sm font-black transition ${
                  timeLeft <= 60
                    ? "bg-red-50 dark:bg-red-950/40 border-red-300 text-red-600 animate-pulse"
                    : timeLeft <= 300
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300"
                    : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-[#0F2843] dark:text-white"
                }`}
              >
                <ClockIcon className="w-5 h-5 flex-shrink-0" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            {/* Submit Button Trigger */}
            <button
              type="button"
              onClick={() => setSubmitConfirmOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] text-xs font-black shadow-lg hover:opacity-95 transition flex items-center gap-2"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Submit Test</span>
            </button>
          </div>
        </div>

        {/* QUESTION STEPPER BAR */}
        <div className="bg-white dark:bg-[#09314F] rounded-2xl p-3 border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {questions.map((q, idx) => {
            const isAnswered = !!(answers[String(q.id)]?.question_option_id || (answers[String(q.id)]?.answer && answers[String(q.id)]?.answer.trim()));
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-black flex items-center justify-center transition flex-shrink-0 ${
                  isCurrent
                    ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] shadow-md ring-2 ring-[#0F2843]/20"
                    : isAnswered
                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                    : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* QUESTION CANVAS */}
        <div className="bg-white dark:bg-[#09314F] rounded-[32px] p-6 sm:p-8 border border-gray-100 dark:border-white/10 shadow-xl space-y-6">
          
          {/* Question Top Info */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#0F2843] dark:text-[#C5A97A] uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span
                className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                  currentQuestion.type === "mcq"
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                }`}
              >
                {currentQuestion.type === "mcq" ? "Multiple Choice" : "Written Essay"}
              </span>
            </div>

            <span className="text-xs font-black text-gray-500 dark:text-gray-300">
              Worth: {currentQuestion.marks} {currentQuestion.marks === 1 ? "Mark" : "Marks"}
            </span>
          </div>

          {/* Question Text with LaTeX rendering */}
          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-relaxed">
            <MathRenderer text={currentQuestion.question} />
          </div>

          {/* MCQ OPTIONS SELECTOR */}
          {currentQuestion.type === "mcq" && (
            <div className="space-y-3 pt-2">
              {(currentQuestion.options || []).map((opt, optIndex) => {
                const selectedOptionId = answers[String(currentQuestion.id)]?.question_option_id;
                const isSelected = selectedOptionId === opt.id;

                return (
                  <button
                    key={opt.id || optIndex}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                      isSelected
                        ? "bg-[#0F2843]/5 dark:bg-[#C5A97A]/10 border-[#0F2843] dark:border-[#C5A97A] shadow-md ring-2 ring-[#0F2843]/10"
                        : "bg-gray-50 dark:bg-white/5 border-gray-200/80 dark:border-white/10 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 transition ${
                        isSelected
                          ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843]"
                          : "bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white leading-normal flex-1">
                      <MathRenderer text={opt.option_text} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ESSAY WRITTEN ANSWER TEXTAREA */}
          {currentQuestion.type === "essay" && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Type your response below:
              </label>
              <textarea
                rows={6}
                placeholder="Write your explanation or detailed response here..."
                value={answers[String(currentQuestion.id)]?.answer || ""}
                onChange={(e) => handleEssayChange(currentQuestion.id, e.target.value)}
                className="w-full p-4 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] outline-none transition resize-y leading-relaxed"
              />
              <div className="text-right text-[11px] text-gray-400 font-medium">
                {(answers[String(currentQuestion.id)]?.answer || "").split(/\s+/).filter(Boolean).length} Words
              </div>
            </div>
          )}

          {/* PREVIOUS / NEXT NAVIGATION FOOTER */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition flex items-center gap-2"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-2.5 rounded-2xl bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] text-xs font-black shadow-md transition flex items-center gap-2"
              >
                <span>Next Question</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitConfirmOpen(true)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition flex items-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Review & Submit</span>
              </button>
            )}
          </div>
        </div>

        {/* SUBMIT CONFIRMATION MODAL */}
        {submitConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-[#09314F] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-3xl bg-[#0F2843]/10 dark:bg-white/10 text-[#0F2843] dark:text-[#C5A97A] flex items-center justify-center mx-auto">
                <PaperAirplaneIcon className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Ready to Submit?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  You have answered <span className="font-bold text-[#0F2843] dark:text-[#C5A97A]">{answeredCount}</span> of{" "}
                  <span className="font-bold">{questions.length}</span> questions.
                  {answeredCount < questions.length && (
                    <span className="block text-amber-600 dark:text-amber-400 font-bold mt-1">
                      ⚠️ You have {questions.length - answeredCount} unanswered questions.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitConfirmOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                >
                  Continue Answering
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] text-xs font-black shadow-lg transition flex items-center gap-2"
                >
                  {submitting ? "Submitting..." : "Yes, Finalize Submission"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS MODAL */}
        <StudentAssessmentResultModal
          isOpen={resultModalOpen}
          onClose={() => {
            setResultModalOpen(false);
            navigate("/student/assessments");
          }}
          assessmentData={submissionResult}
        />

      </div>
    </DashboardLayout>
  );
}
