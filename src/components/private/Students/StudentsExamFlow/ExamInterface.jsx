import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

export default function ExamInterface({
  attemptId,
  selectedCourse,
  selectedSubject,
  timer,
  onBack,
}) {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("student_token") || "";

  // State Management
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Answering States
  const [selectedOptions, setSelectedOptions] = useState({}); // local state { [questionId]: optionId }
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // server synced { [questionId]: optionId }
  const [savingAnswer, setSavingAnswer] = useState(false);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(null);
  
  // Dialog / Warning / Submit States
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [toast, setToast] = useState(null);
  const [examFinished, setExamFinished] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);

  // References
  const paginationRef = useRef(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Fetch all questions for this attempt
  const fetchQuestions = useCallback(async () => {
    if (!attemptId) return;
    setLoading(true);
    setError(null);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/students/exams/${attemptId}/questions`,
        { headers }
      );

      console.log("Exam Workspace Questions loaded:", response.data);
      const questionList = response.data?.questions || response.data?.data || [];
      setQuestions(questionList);

      // Pre-populate already answered questions from the questions payload if available
      const initialSelected = {};
      const initialSubmitted = {};
      questionList.forEach((q) => {
        // If question already has student's saved answer in relation
        if (q.student_answer?.option_id || q.user_answer?.option_id) {
          const optId = q.student_answer?.option_id || q.user_answer?.option_id;
          initialSelected[q.id] = optId;
          initialSubmitted[q.id] = optId;
        }
      });
      setSelectedOptions(initialSelected);
      setSubmittedAnswers(initialSubmitted);

      // Set countdown timer
      const minutes = parseInt(timer) || 50;
      setTimeLeft(minutes * 60);

    } catch (err) {
      console.error("Failed to load attempt questions:", err);
      setError("Failed to load exam questions. Please try again or return to config.");
    } finally {
      setLoading(false);
    }
  }, [attemptId, API_BASE_URL, token, timer]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Timer countdown hook
  useEffect(() => {
    if (timeLeft === null || examFinished) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handleAutoSubmit is stable
  }, [timeLeft, examFinished]);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds) => {
    if (totalSeconds === null) return "--:--";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Safe helper to extract option fields
  const getOptionsList = (question) => {
    if (!question) return [];
    if (Array.isArray(question.options)) {
      return question.options.map((opt) => ({
        ...opt,
        letter: opt.label || opt.letter || opt.option_letter || "A",
        option: opt.option_text || opt.option || opt.text || "",
      }));
    }
    
    // Fallback for flat structure
    const options = [];
    ["a", "b", "c", "d", "e"].forEach((letter) => {
      const optKey = `option_${letter}`;
      const idKey = `option_${letter}_id` || `option_${letter}`;
      if (question[optKey]) {
        options.push({
          id: question[idKey] || letter,
          option: question[optKey],
          letter: letter.toUpperCase(),
        });
      }
    });
    return options;
  };

  // Submit background answer
  const submitAnswerToBackend = async (questionId, optionId) => {
    if (!optionId || submittedAnswers[questionId] === optionId) return true;

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      await axios.post(
        `${API_BASE_URL}/api/students/exams/${attemptId}/answer`,
        {
          question_id: questionId,
          option_id: optionId,
        },
        { headers }
      );

      setSubmittedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
      return true;
    } catch (err) {
      console.error("Failed to sync answer:", err);
      setToast({
        type: "error",
        message: "Network Sync Error: Could not save your answer to the server.",
      });
      return false;
    }
  };

  // Navigates and saves pending choices in the background
  const handleNavigate = async (targetIndex) => {
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const currentQuestion = questions[currentIndex];
    const localChoice = selectedOptions[currentQuestion.id];

    // If an option is selected but not synced, sync in background
    if (localChoice && submittedAnswers[currentQuestion.id] !== localChoice) {
      setSavingAnswer(true);
      await submitAnswerToBackend(currentQuestion.id, localChoice);
      setSavingAnswer(false);
    }

    setCurrentIndex(targetIndex);
  };

  // Handle choice selection
  const handleOptionSelect = (optionId) => {
    if (examFinished) return;
    const currentQuestion = questions[currentIndex];
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  // Submit full exam attempt
  const handleSubmitExam = async (isAuto = false) => {
    setSubmittingExam(true);
    setShowSubmitConfirm(false);
    
    // First sync current active question selection if any
    const currentQuestion = questions[currentIndex];
    const currentChoice = selectedOptions[currentQuestion?.id];
    if (currentChoice && submittedAnswers[currentQuestion?.id] !== currentChoice) {
      await submitAnswerToBackend(currentQuestion.id, currentChoice);
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/students/exams/${attemptId}/submit`,
        {},
        { headers }
      );

      console.log("Exam submitted successfully:", response.data);
      setResultSummary(response.data?.result || response.data?.data || null);
      setExamFinished(true);

      setToast({
        type: "success",
        message: isAuto ? "Practice timed out and submitted successfully!" : "Practice session submitted successfully!",
      });

    } catch (err) {
      console.error("Failed to submit exam:", err);
      setToast({
        type: "error",
        message: "Failed to finalize the exam. Please check your network and try again.",
      });
    } finally {
      setSubmittingExam(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitExam(true);
  };

  // Counts
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(submittedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Active element
  const currentQuestion = questions[currentIndex];
  const activeOptions = getOptionsList(currentQuestion);
  const activeLocalChoice = currentQuestion ? selectedOptions[currentQuestion.id] : null;

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#C5A97A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
          Loading Practice Questions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center max-w-md mx-auto bg-white dark:bg-[#09314F]/40 border border-gray-100 dark:border-[#09314F] rounded-3xl p-8 shadow-md">
        <Icon icon="lucide:cloud-alert" className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#09314F] dark:text-white mb-2">Workspace Error</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-[#09314F] hover:bg-[#0a3d63] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
        >
          Return to Configuration
        </button>
      </div>
    );
  }

  if (examFinished) {
    // Dynamic results display
    const scoreVal = resultSummary?.score || resultSummary?.score_obtained || 0;
    const percentage = resultSummary?.percentage || (totalQuestions > 0 ? Math.round((scoreVal / totalQuestions) * 100) : 0);

    return (
      <div className="max-w-xl mx-auto w-full pb-20 px-2 lg:px-4 animate-in fade-in duration-500">
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-[32px] border border-[#C5A97A]/30 p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

          <Icon icon="lucide:party-popper" className="w-20 h-20 text-[#C5A97A] mx-auto mb-6 animate-bounce" />
          <h2 className="text-2xl font-black text-[#09314F] dark:text-white uppercase tracking-tight mb-2">
            Practice Completed!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Excellent job completing your practice attempt. Here is your summary:
          </p>

          {/* Prominent Circular Progress Score Chart */}
          <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                className="stroke-gray-100 dark:stroke-[#09314F] fill-transparent"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                className="stroke-[#C5A97A] fill-transparent transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={427}
                strokeDashoffset={427 - (427 * percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-[#09314F] dark:text-white">
                {percentage}%
              </span>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mt-1">
                SCORE OBTAINED
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-[#06243A] rounded-2xl p-5 mb-8 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col items-center">
              <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-500 mb-1" />
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Correct
              </span>
              <span className="text-lg font-black text-gray-700 dark:text-gray-200 mt-1">
                {resultSummary?.correct_answers_count || resultSummary?.correct || scoreVal}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Icon icon="lucide:x-circle" className="w-5 h-5 text-red-500 mb-1" />
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Wrong
              </span>
              <span className="text-lg font-black text-gray-700 dark:text-gray-200 mt-1">
                {resultSummary?.wrong_answers_count || resultSummary?.wrong || (totalQuestions - scoreVal)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Icon icon="lucide:help-circle" className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Skipped
              </span>
              <span className="text-lg font-black text-gray-700 dark:text-gray-200 mt-1">
                {totalQuestions - (resultSummary?.attempted_count || totalQuestions)}
              </span>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full py-4 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all"
          >
            Go back to Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pb-20 px-2 lg:px-4 animate-in fade-in duration-500">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[2000] px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm transition-all duration-300 flex items-center gap-3 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          }`}
        >
          <Icon
            icon={toast.type === "success" ? "lucide:check-circle" : "lucide:alert-triangle"}
            className="w-5 h-5 shrink-0"
          />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Submitting Overlay */}
      {submittingExam && (
        <div className="fixed inset-0 z-[2000] bg-[#09314F]/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
          <div className="w-16 h-16 border-4 border-t-[#C5A97A] border-[#BB9E7F]/20 rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-black uppercase tracking-widest text-[#C5A97A] mb-2">
            Submitting Practice Attempt
          </h2>
          <p className="text-xs text-gray-400 animate-pulse">Saving results and compiling score sheets...</p>
        </div>
      )}

      {/* Main Exam Header Workspace */}
      <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm mb-6 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        {/* Back navigation */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-2 group text-gray-500 hover:text-[#09314F] dark:hover:text-white transition-colors"
        >
          <Icon icon="lucide:chevron-left" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-bold">Back</span>
        </button>

        {/* Dynamic ticking timer */}
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-5 py-2.5 rounded-2xl relative shadow-inner">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          <span className="text-2xl font-black font-mono tracking-widest text-red-600 dark:text-red-400">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[10px] font-black uppercase text-gray-400 ml-1">
            Timer / {timer}mins
          </span>
        </div>

        {/* Labels info */}
        <div className="flex gap-6 text-right">
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
              COURSE
            </span>
            <span className="text-sm font-black uppercase text-[#09314F] dark:text-white">
              {selectedCourse?.course?.title || selectedCourse?.title || "JAMB"}
            </span>
          </div>
          <div className="border-l border-gray-100 dark:border-gray-800 pl-6">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
              SUBJECT
            </span>
            <span className="text-sm font-black uppercase text-[#09314F] dark:text-white">
              {selectedSubject?.name || selectedSubject?.title}
            </span>
          </div>
        </div>
      </div>

      {/* Main Question Card Area */}
      {questions.length > 0 && currentQuestion ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-[32px] border border-gray-100 dark:border-[#09314F] shadow-sm relative overflow-hidden">
            {/* Header info */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/10">
              <span className="px-4 py-1.5 bg-[#09314F] dark:bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl">
                Question {currentIndex + 1}
              </span>

              <div className="flex gap-4 text-xs font-black uppercase tracking-wider text-gray-400">
                <p>
                  Answered:{" "}
                  <span className="text-green-500 dark:text-green-400 ml-1 font-black">
                    {answeredCount}/{totalQuestions}
                  </span>
                </p>
                <p>
                  Unanswered:{" "}
                  <span className="text-gray-500 dark:text-gray-300 ml-1 font-black">
                    {unansweredCount}/{totalQuestions}
                  </span>
                </p>
              </div>
            </div>

            {/* Question Box */}
            <div className="p-6 md:p-8">
              <div 
                className="text-gray-700 dark:text-gray-200 text-[15px] font-medium leading-relaxed mb-8 prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
              />

              {/* Options selection */}
              <div className="space-y-3.5">
                {activeOptions.map((opt) => {
                  const letter = opt.letter || opt.option_letter || "A";
                  const isSelected = String(activeLocalChoice) === String(opt.id);
                  const isSynced = String(submittedAnswers[currentQuestion.id]) === String(opt.id);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500 ring-2 ring-blue-500/20"
                          : "bg-white dark:bg-[#09314F]/30 border-gray-100 dark:border-[#09314F] hover:border-gray-200 hover:scale-[1.005]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-colors shrink-0 ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-gray-50 dark:bg-[#06243A] text-gray-400 group-hover:bg-gray-100"
                          }`}
                        >
                          {letter}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-blue-900 dark:text-blue-200 font-bold" : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {opt.option || opt.text}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <div>
                          {isSynced ? (
                            <Icon icon="lucide:cloud-upload" className="w-5 h-5 text-blue-500 animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination numbers scroll area at the bottom of the card */}
            <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <button
                onClick={() => handleNavigate(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="p-3 bg-gray-50 dark:bg-[#06243A] hover:bg-gray-100 disabled:opacity-30 rounded-xl transition-all shrink-0 text-[#09314F] dark:text-white"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              </button>

              <div
                ref={paginationRef}
                className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
              >
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = submittedAnswers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleNavigate(idx)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs shrink-0 transition-all ${
                        isCurrent
                          ? "bg-[#09314F] text-white border-transparent"
                          : isAnswered
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30"
                          : "bg-gray-50 dark:bg-[#06243A] border border-transparent text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handleNavigate(currentIndex + 1)}
                disabled={currentIndex === totalQuestions - 1}
                className="p-3 bg-gray-50 dark:bg-[#06243A] hover:bg-gray-100 disabled:opacity-30 rounded-xl transition-all shrink-0 text-[#09314F] dark:text-white"
              >
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Controls underneath card */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleNavigate(currentIndex - 1)}
              disabled={currentIndex === 0 || savingAnswer}
              className="py-4 bg-white dark:bg-[#09314F]/40 border border-gray-100 dark:border-[#09314F] hover:bg-gray-50 rounded-2xl font-bold text-[#09314F] dark:text-white text-xs uppercase tracking-widest disabled:opacity-30 transition-all shadow-sm"
            >
              Previous
            </button>
            <button
              onClick={() => handleNavigate(currentIndex + 1)}
              disabled={currentIndex === totalQuestions - 1 || savingAnswer}
              className="py-4 bg-white dark:bg-[#09314F]/40 border border-gray-100 dark:border-[#09314F] hover:bg-gray-50 rounded-2xl font-bold text-[#09314F] dark:text-white text-xs uppercase tracking-widest disabled:opacity-30 transition-all shadow-sm"
            >
              Next
            </button>
          </div>

          {/* Big Solid Submit Button at the bottom */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="w-full py-4.5 bg-[#09314F] dark:bg-blue-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.99] mt-8"
          >
            <Icon icon="lucide:check-square" className="w-5 h-5" />
            <span>Submit Exam Session</span>
          </button>
        </div>
      ) : (
        <div className="py-24 text-center bg-white dark:bg-[#09314F]/40 border rounded-[32px] p-8">
          <p className="text-gray-400 font-bold">No questions loaded for this attempt.</p>
        </div>
      )}

      {/* Exit Practice Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setShowExitConfirm(false)} />
          <div className="relative bg-white rounded-3xl p-8 w-[90%] max-w-md shadow-2xl z-10 animate-scale-in">
            <h3 className="text-xl font-black text-[#09314F] mb-3 uppercase tracking-tight">
              Abandon Practice Session?
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Are you sure you want to exit? Your currently synced progress will be saved as incomplete, and you will return to the Configuration screen.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 uppercase tracking-widest transition-all"
              >
                No, Stay
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-red-200"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Submission Confirmation Dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setShowSubmitConfirm(false)} />
          <div className="relative bg-white rounded-3xl p-8 w-[90%] max-w-md shadow-2xl z-10 animate-scale-in">
            <h3 className="text-xl font-black text-[#09314F] mb-3 uppercase tracking-tight">
              Submit Exam Attempt?
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              You have answered <span className="font-black text-[#09314F]">{answeredCount}</span> of{" "}
              <span className="font-black">{totalQuestions}</span> questions. Are you ready to submit and finalize your practice session score?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 uppercase tracking-widest transition-all"
              >
                Keep Reviewing
              </button>
              <button
                onClick={() => handleSubmitExam(false)}
                className="flex-1 py-3.5 bg-[#09314F] hover:bg-[#0a3d63] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-blue-200"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
