import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/private/Students/DashboardLayout.jsx";
import { studentCurriculumApi } from "../../../services/curriculumService.js";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Check
} from "lucide-react";

export default function LessonQuizTaker() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Screen state: "intro" | "taking" | "results"
  const [screen, setScreen] = useState("intro");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Quiz info
  const [quizInfo, setQuizInfo] = useState(null);
  const [pastSubmissions, setPastSubmissions] = useState([]);

  // Active attempt state
  const [submissionId, setSubmissionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionId }
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const timerIntervalRef = useRef(null);

  // Result state
  const [submissionResult, setSubmissionResult] = useState(null);

  // Load quiz preview info & submissions
  const loadQuizInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [detailsRes, submissionsRes] = await Promise.allSettled([
        studentCurriculumApi.getQuizDetails(quizId),
        studentCurriculumApi.getMyQuizSubmissions(quizId),
      ]);

      if (detailsRes.status === "fulfilled" && detailsRes.value?.quiz) {
        setQuizInfo(detailsRes.value.quiz);
      } else {
        setError("Quiz details could not be loaded.");
      }

      if (submissionsRes.status === "fulfilled" && submissionsRes.value?.submissions) {
        setPastSubmissions(submissionsRes.value.submissions);
      }
    } catch (err) {
      console.error("Failed to load quiz details:", err);
      setError("Failed to load quiz information.");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      loadQuizInfo();
    }
  }, [quizId, loadQuizInfo]);

  // Handle Quiz Start
  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentCurriculumApi.startQuizAttempt(quizId);
      if (res?.submission_id && res?.questions) {
        setSubmissionId(res.submission_id);
        setQuestions(res.questions);
        setCurrentIndex(0);
        setAnswers({});

        // Configure timer
        if (quizInfo?.timer_minutes) {
          setTimeLeft(quizInfo.timer_minutes * 60);
        } else {
          setTimeLeft(null);
        }

        setScreen("taking");
      } else {
        setError(res?.message || "Failed to start quiz attempt.");
      }
    } catch (err) {
      console.error("Failed to start quiz:", err);
      setError(err.response?.data?.message || "Failed to start quiz attempt.");
    } finally {
      setLoading(false);
    }
  };

  // Timer Countdown
  useEffect(() => {
    if (screen === "taking" && timeLeft !== null) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            // Auto submit when time runs out
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [screen, timeLeft]);

  // Select option for current question
  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Submit Quiz Answers
  const handleSubmitQuiz = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
        question_id: parseInt(qId, 10),
        option_id: optId,
        answer_text: null,
      }));

      const res = await studentCurriculumApi.submitQuiz(quizId, submissionId, formattedAnswers);
      if (res?.submission) {
        setSubmissionResult(res.submission);
        setScreen("results");
      } else {
        setError("Error submitting quiz results.");
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setError(err.response?.data?.message || "Failed to submit answers.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz();
  };

  // Format seconds to mm:ss
  const formatTimer = (secs) => {
    if (secs === null) return "--:--";
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];

  return (
    <DashboardLayout pagetitle={quizInfo?.title ? `${quizInfo.title} · Practice Quiz` : "Practice Quiz"}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Top Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#09314F] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lesson
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-3xl p-16 text-center animate-pulse space-y-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto" />
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-3xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Notice</h3>
            <p className="text-sm text-red-600 dark:text-red-300 max-w-md mx-auto">{error}</p>
          </div>
        )}

        {/* SCREEN 1: INTRO / PREVIEW */}
        {!loading && screen === "intro" && quizInfo && (
          <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div className="space-y-2 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] dark:text-white">
                {quizInfo.title}
              </h1>
              {quizInfo.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {quizInfo.description}
                </p>
              )}
            </div>

            {/* Quiz Rules & Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pass Mark</span>
                <p className="text-xl font-black text-[#09314F] dark:text-white">{quizInfo.pass_mark}%</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time Limit</span>
                <p className="text-xl font-black text-[#09314F] dark:text-white">
                  {quizInfo.timer_minutes ? `${quizInfo.timer_minutes}m` : "Untimed"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl text-center space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Attempts</span>
                <p className="text-xl font-black text-[#09314F] dark:text-white">
                  {quizInfo.max_attempts ? `${pastSubmissions.length}/${quizInfo.max_attempts}` : "Unlimited"}
                </p>
              </div>
            </div>

            {quizInfo.instructions && (
              <div className="p-5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl text-xs text-blue-900 dark:text-blue-300 space-y-1">
                <span className="font-black uppercase tracking-wider text-[10px]">Instructions:</span>
                <p className="leading-relaxed">{quizInfo.instructions}</p>
              </div>
            )}

            {/* Past Submissions Log */}
            {pastSubmissions.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Previous Attempts
                </h3>
                <div className="space-y-2">
                  {pastSubmissions.map((sub, i) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-750 rounded-xl text-xs font-medium"
                    >
                      <span>Attempt #{pastSubmissions.length - i}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#09314F] dark:text-white">{Math.round(sub.percentage)}%</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          sub.is_passed ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}>
                          {sub.is_passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              <button
                onClick={handleStartQuiz}
                className="w-full sm:w-auto px-10 py-4 bg-[#09314F] hover:bg-[#0A2239] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-95"
              >
                Start Practice Quiz
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: ACTIVE QUIZ RUNNER */}
        {!loading && screen === "taking" && currentQuestion && (
          <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            
            {/* Header: Progress & Timer */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-700">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex gap-1.5 mt-1">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentIndex
                          ? "w-8 bg-[#09314F] dark:bg-blue-400"
                          : answers[questions[idx].id]
                          ? "w-4 bg-emerald-500"
                          : "w-4 bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {timeLeft !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm shadow-sm ${
                  timeLeft <= 120
                    ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200 animate-pulse"
                    : "bg-gray-50 text-gray-700 dark:bg-gray-750 dark:text-gray-300"
                }`}>
                  <Clock className="w-4 h-4" />
                  {formatTimer(timeLeft)}
                </div>
              )}
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#09314F] dark:text-white leading-relaxed">
                {currentQuestion.question_text}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {(currentQuestion.options || []).map((opt, optIdx) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                      isSelected
                        ? "border-[#09314F] dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 text-[#09314F] dark:text-white shadow-sm"
                        : "border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#09314F] text-white dark:bg-blue-500"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {letter}
                    </div>
                    <span className="font-semibold text-sm sm:text-base flex-1">
                      {opt.option_text}
                    </span>
                    {isSelected && <Check className="w-5 h-5 text-[#09314F] dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>

            {/* Runner Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-2.5 bg-[#09314F] hover:bg-[#0A2239] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-8 py-3 bg-[#E83831] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {submitting ? "Grading..." : "Submit Answers"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 3: RESULTS & SCORE REVIEW */}
        {!loading && screen === "results" && submissionResult && (
          <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            
            {/* Score Showcase */}
            <div className="text-center max-w-md mx-auto space-y-3">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-md ${
                submissionResult.is_passed
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300"
              }`}>
                {submissionResult.is_passed ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <XCircle className="w-10 h-10" />
                )}
              </div>

              <h1 className="text-3xl font-black text-[#09314F] dark:text-white">
                {submissionResult.is_passed ? "Quiz Passed!" : "Needs Improvement"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                You scored <span className="font-bold text-[#09314F] dark:text-white">{Math.round(submissionResult.percentage)}%</span> ({submissionResult.score} / {submissionResult.total_marks} marks).
              </p>
            </div>

            {/* Answer Explanations Review */}
            {submissionResult.answers && submissionResult.answers.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Detailed Answer Review
                </h3>
                <div className="space-y-4">
                  {submissionResult.answers.map((ans, idx) => (
                    <div
                      key={ans.id || idx}
                      className={`p-5 rounded-2xl border ${
                        ans.is_correct
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                          : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40"
                      } space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Question {idx + 1}
                        </span>
                        <span className={`text-xs font-bold ${ans.is_correct ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {ans.is_correct ? "Correct (+ marks)" : "Incorrect"}
                        </span>
                      </div>
                      {ans.explanation && (
                        <div className="pt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-200/40 dark:border-gray-700/40">
                          <span className="font-bold text-[#09314F] dark:text-white">Explanation: </span>
                          {ans.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setScreen("intro")}
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-[#09314F] dark:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#09314F] hover:bg-[#0A2239] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Return to Lesson
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
