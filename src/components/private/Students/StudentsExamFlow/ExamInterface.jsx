import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useTimer } from "react-timer-hook";
import { stripHtmlAndDecode } from "../../../../utils/textUtils";
import MobileMovableCalculator from "./MobileMovableCalculator";

export default function ExamInterface({
  attemptId,
  selectedCourse,
  selectedSubject,
  timer,
  onBack,
  onReviewExam,
}) {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("student_token") || "";

  // State Management
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem(`exam_attempt_${attemptId}_index`);
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync currentIndex to localStorage
  useEffect(() => {
    if (attemptId) {
      localStorage.setItem(`exam_attempt_${attemptId}_index`, currentIndex.toString());
    }
  }, [currentIndex, attemptId]);

  // Answering States
  const [selectedOptions, setSelectedOptions] = useState({}); // local state { [questionId]: optionId }
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // server synced { [questionId]: optionId }
  const [savingAnswer, setSavingAnswer] = useState(false);
  
  // Dialog / Warning / Submit States
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [toast, setToast] = useState(null);
  const [examFinished, setExamFinished] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);

  // Feedback States (Shown before congratulations)
  const [showFeedback, setShowFeedback] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [comment, setComment] = useState("");

  // react-timer-hook setup
  const minutesVal = parseInt(timer, 10) || 50;
  const initialExpiry = new Date();
  initialExpiry.setSeconds(initialExpiry.getSeconds() + minutesVal * 60);

  const {
    seconds,
    minutes: displayMinutes,
    hours: displayHours,
    pause,
    restart,
  } = useTimer({
    expiryTimestamp: initialExpiry,
    onExpire: () => handleAutoSubmit(),
    autoStart: false
  });

  // Pause timer when exam finishes
  useEffect(() => {
    if (examFinished) {
      pause();
    }
  }, [examFinished, pause]);

  // Suppress dev-mode ResizeObserver loop limit exceeded error overlays
  useEffect(() => {
    const handleResizeError = (e) => {
      if (
        e.message?.includes("ResizeObserver") ||
        e.message?.includes("loop limit exceeded") ||
        e.message?.includes("undelivered notifications")
      ) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };
    window.addEventListener("error", handleResizeError);
    return () => {
      window.removeEventListener("error", handleResizeError);
    };
  }, []);

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

      // Merge with any local storage answers that haven't synced yet (resilience against refreshes/drops)
      try {
        const localSaved = localStorage.getItem(`exam_answers_${attemptId}`);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          Object.assign(initialSelected, parsed);
        }
      } catch (e) {
        console.error("Failed reading local storage answers:", e);
      }

      setSelectedOptions(initialSelected);
      setSubmittedAnswers(initialSubmitted);

      // Set countdown timer using react-timer-hook
      const minutesVal = parseInt(timer, 10) || 50;
      const expiry = new Date();
      expiry.setSeconds(expiry.getSeconds() + minutesVal * 60);
      restart(expiry);

    } catch (err) {
      console.error("Failed to load attempt questions:", err);
      setError("Failed to load exam questions. Please try again or return to config.");
    } finally {
      setLoading(false);
    }
  }, [attemptId, API_BASE_URL, token, timer, restart]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Background Image Preloader: Cache all question & group diagrams in browser memory immediately
  useEffect(() => {
    if (!questions || questions.length === 0) return;

    const imagesToPreload = new Set();
    questions.forEach((q) => {
      if (q.image) {
        const url = q.image.startsWith("http") ? q.image : `${API_BASE_URL}/storage/${q.image}`;
        imagesToPreload.add(url);
      }
      if (q.group?.image) {
        const url = q.group.image.startsWith("http") ? q.group.image : `${API_BASE_URL}/storage/${q.group.image}`;
        imagesToPreload.add(url);
      }
    });

    imagesToPreload.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [questions, API_BASE_URL]);

  // Auto-scroll active pagination item into view
  useEffect(() => {
    const activeBtn = document.getElementById(`pag-btn-${currentIndex}`);
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [currentIndex]);

  const cleanHtmlContent = (html) => {
    if (!html) return "";
    // Replace non-breaking spaces with standard space to allow proper word-wrapping on mobile
    return html.replace(/&nbsp;/g, " ");
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

  const isSyncingQueueRef = useRef(false);

  // Submit background answer (silent, no error toast spam on temporary network drops)
  const submitAnswerToBackend = useCallback(async (questionId, optionId) => {
    if (!optionId || String(submittedAnswers[questionId]) === String(optionId)) return true;

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
      return false;
    }
  }, [attemptId, API_BASE_URL, token, submittedAnswers]);

  // Background queue processor: submits up to batchLimit unsynced answers sequentially without blocking UI
  const processBackgroundQueue = useCallback(async (batchLimit = 5) => {
    if (isSyncingQueueRef.current || examFinished) return;

    // Find unsynced question IDs where local choice differs from submitted answer
    const unsyncedIds = Object.keys(selectedOptions).filter(
      (qId) => selectedOptions[qId] && String(selectedOptions[qId]) !== String(submittedAnswers[qId])
    );
    if (unsyncedIds.length === 0) return;

    isSyncingQueueRef.current = true;
    setSavingAnswer(true);

    const batch = unsyncedIds.slice(0, batchLimit);
    for (const qId of batch) {
      const optId = selectedOptions[qId];
      if (!optId) continue;
      await submitAnswerToBackend(qId, optId);
    }

    setSavingAnswer(false);
    isSyncingQueueRef.current = false;
  }, [selectedOptions, submittedAnswers, submitAnswerToBackend, examFinished]);

  // Silent background interval: every 20 seconds, check and submit up to 5 unsynced items
  useEffect(() => {
    if (examFinished || loading) return;
    const interval = setInterval(() => {
      processBackgroundQueue(5);
    }, 20000);
    return () => clearInterval(interval);
  }, [examFinished, loading, processBackgroundQueue]);

  // Navigates instantly and triggers background saving without blocking
  const handleNavigate = (targetIndex) => {
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    // Instant UI switch! Zero latency!
    setCurrentIndex(targetIndex);

    // Trigger background submission in batches of 5 (at Q5, Q10, Q15, Q20, Q25...)
    if ((targetIndex + 1) % 5 === 0) {
      processBackgroundQueue(5);
    }
  };

  // Handle choice selection with localStorage persistence
  const handleOptionSelect = (optionId) => {
    if (examFinished) return;
    const currentQuestion = questions[currentIndex];
    setSelectedOptions((prev) => {
      const updated = {
        ...prev,
        [currentQuestion.id]: optionId,
      };
      try {
        localStorage.setItem(`exam_answers_${attemptId}`, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
      return updated;
    });
  };

  // Submit full exam attempt
  const handleSubmitExam = async (isAuto = false) => {
    setSubmittingExam(true);
    setShowSubmitConfirm(false);
    
    // Flush ALL remaining unsynced answers before final exam submission
    const unsyncedIds = Object.keys(selectedOptions).filter(
      (qId) => selectedOptions[qId] && String(selectedOptions[qId]) !== String(submittedAnswers[qId])
    );
    for (const qId of unsyncedIds) {
      await submitAnswerToBackend(qId, selectedOptions[qId]);
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
      setShowFeedback(true); // Reset to show feedback first when exam finishes
      setToast({
        type: "success",
        message: isAuto ? "Practice timed out and submitted successfully!" : "Practice session submitted successfully!",
      });

      // After successful submission, clean up localStorage!
      try {
        localStorage.removeItem(`exam_answers_${attemptId}`);
        localStorage.removeItem(`exam_attempt_${attemptId}_index`);
      } catch (e) {}

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
  const answeredCount = Object.keys(selectedOptions).length;
  const unansweredCount = totalQuestions - answeredCount;

  const cleanText = (htmlStr) => {
    if (!htmlStr) return "";
    return stripHtmlAndDecode(htmlStr);
  };

  // Active element
  const currentQuestion = questions[currentIndex];
  const activeOptions = getOptionsList(currentQuestion);
  const activeLocalChoice = currentQuestion ? selectedOptions[currentQuestion.id] : null;
  const activeGroup = (() => {
    if (!currentQuestion) return null;
    if (currentQuestion.group) return currentQuestion.group;
    if (currentQuestion.past_question_group) return currentQuestion.past_question_group;
    
    // Fallback: search other questions in the list that share the same group ID and have the group object
    const groupId = currentQuestion.past_question_group_id;
    if (groupId) {
      const match = questions.find(q => 
        String(q.past_question_group_id) === String(groupId) && 
        (q.group || q.past_question_group)
      );
      if (match) {
        return match.group || match.past_question_group;
      }
    }
    return null;
  })();

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

  // Import calculator component inline
  const CalculatorRightbar = require("./CalculatorRightbar.jsx").default;

  // Calculate results if finished
  const scoreVal = resultSummary?.score !== undefined ? Number(resultSummary.score) : 0;
  const percentage = resultSummary?.percentage !== undefined 
    ? Math.round(Number(resultSummary.percentage)) 
    : (totalQuestions > 0 ? Math.round((scoreVal / totalQuestions) * 100) : 0);

  const correctVal = resultSummary?.correct_answers !== undefined ? resultSummary.correct_answers : (resultSummary?.correct || scoreVal);
  const wrongVal = resultSummary?.wrong_answers !== undefined ? resultSummary.wrong_answers : (resultSummary?.wrong || 0);
  const skippedVal = resultSummary?.unanswered !== undefined ? resultSummary.unanswered : (totalQuestions - (resultSummary?.attempted_count || totalQuestions));


  return (
    <div className="w-full animate-in fade-in duration-500">
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

{/* Top Navigation & Timers Bar Container */}
<div className="mb-6 flex items-center justify-between gap-4 py-2 relative w-full">
  
  {/* Left Side: Back Navigation button (Flows normally) */}
  <button
    onClick={() => setShowExitConfirm(true)}
    className="flex items-center gap-1.5 group text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 z-10"
  >
    <Icon icon="lucide:chevron-left" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
    <span className="text-xs md:text-sm font-black uppercase tracking-wider">Back</span>
  </button>

  {/* Middle: Active Countdown Ticking Timer */}
  {/* Fixed globally at the top center of the viewport for both Mobile and Laptop/Desktop views */}
  <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 px-4 md:px-6 py-1.5 md:py-3 rounded-2xl shadow-lg backdrop-blur-md transition-all">
    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
    <span className="text-base md:text-2xl font-black font-mono tracking-widest text-red-600 dark:text-red-400">
      {displayHours > 0 
        ? `${String(displayHours).padStart(2, "0")}:${String(displayMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        : `${String(displayMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
    </span>
  </div>

  {/* Right Side: Static Time Chosen Display (Flows normally) */}
  <div className="px-3 py-1.5 bg-white dark:bg-[#09314F] border border-gray-100 dark:border-[#1a4a75] rounded-xl shrink-0 text-right shadow-sm z-10">
    <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">
      Duration
    </span>
    <span className="text-xs md:text-sm font-black text-gray-700 dark:text-gray-200">
      {timer} mins
    </span>
  </div>




</div>
      {/* Main Exam Header Workspace (Course, Question Count, and Subject info) */}
      <div className="mb-6 bg-white/95 dark:bg-[#09314F]/90 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex items-center justify-between gap-4 min-w-0 transition-all">
        {/* Far Left: Course Info */}
        <div className="min-w-0 text-left">
          <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block">
            COURSE
          </span>
          <span className="text-xs md:text-sm font-black uppercase text-[#09314F] dark:text-white block truncate">
            {selectedCourse?.course?.title || selectedCourse?.title || "JAMB"}
          </span>
        </div>

        {/* Middle: Total Questions Count */}
        <div className="text-center shrink-0">
          <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block">
            PRACTICE SIZE
          </span>
          <span className="text-xs md:text-sm font-black uppercase text-[#C5A97A] block">
            {totalQuestions} Questions
          </span>
        </div>

        {/* Far Right: Subject Info */}
        <div className="min-w-0 text-right">
          <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block">
            SUBJECT
          </span>
          <span className="text-xs md:text-sm font-black uppercase text-[#09314F] dark:text-white block truncate">
            {selectedSubject?.name || selectedSubject?.title}
          </span>
        </div>
      </div>

      {/* Main Question Card Area */}
      {questions.length > 0 && currentQuestion ? (
        (() => {
          // Check if subject is science/calculation based
          const subName = (selectedSubject?.name || selectedSubject?.title || "").toLowerCase();
          const isScience = [
            "math",
            "mathematics",
            "geography",
            "fmath",
            "further math",
            "further mathematics",
            "physics",
            "chemistry",
            "accounting",
            "economics",
            "calculation"
          ].some(keyword => subName.includes(keyword));

          const mainContent = (
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

                {/* Inner Content scroll container */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Passage group content */}
                  {activeGroup && activeGroup.type !== "none" && (
                    <div className="mb-8 p-6 bg-[#EDF0F3]/30 dark:bg-gray-900/40 rounded-[24px] border border-gray-200/50 dark:border-gray-700/30 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="px-2.5 py-1 bg-[#BB9E7F]/10 text-[#BB9E7F] text-[9px] font-black uppercase rounded-md tracking-wider">
                          Group: {cleanText(activeGroup.type).replace("_", " ")}
                        </span>
                        {activeGroup.title && (
                          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            — {cleanText(activeGroup.title)}
                          </span>
                        )}
                      </div>
                      {activeGroup.image && (
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                          <img
                            src={
                              activeGroup.image.startsWith("http")
                                ? activeGroup.image
                                : `${API_BASE_URL}/storage/${activeGroup.image}`
                            }
                            alt="Group Passage Diagram"
                            className="w-full h-auto rounded-xl"
                          />
                        </div>
                      )}
                      <div
                        className="text-[13px] text-[#09314F] dark:text-gray-300 leading-relaxed tracking-tight quill-content break-words whitespace-normal w-full overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: cleanHtmlContent(activeGroup.content) }}
                      />
                    </div>
                  )}

                  {/* Actual Question details */}
                  <div className="space-y-6">
                    <div
                      className="text-[15px] font-normal text-[#09314F] dark:text-white leading-relaxed quill-content break-words whitespace-normal w-full overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: cleanHtmlContent(currentQuestion.question) }}
                    />

                    {currentQuestion.image && (
                      <div className="w-full max-w-md bg-gray-50 dark:bg-[#06243A] rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                        <img
                          src={
                            currentQuestion.image.startsWith("http")
                              ? currentQuestion.image
                              : `${API_BASE_URL}/storage/${currentQuestion.image}`
                          }
                          alt="Question Diagram"
                          className="w-full h-auto rounded-xl"
                        />
                      </div>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4">
                    {activeOptions?.map((opt) => {
                      const letter = opt.label || "A";
                      const isSelected = String(activeLocalChoice) === String(opt.id);
                      const isSynced = String(submittedAnswers[currentQuestion.id]) === String(opt.id);

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleOptionSelect(opt.id)}
                          className={`flex items-center justify-between gap-4 px-6 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                            isSelected
                              ? "bg-blue-50/50 dark:bg-blue-950/20 border-[#C5A97A] text-blue-900 dark:text-blue-200"
                              : "bg-white dark:bg-[#09314F]/30 hover:border-gray-300 dark:hover:border-blue-800 border-gray-100 dark:border-[#09314F] text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-[#C5A97A] text-white"
                                  : "bg-gray-50 dark:bg-[#06243A] text-gray-400 group-hover:bg-gray-100"
                              }`}
                            >
                              {letter}
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                isSelected
                                  ? "text-blue-900 dark:text-blue-200 font-bold"
                                  : "text-gray-700 dark:text-gray-200"
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
                          id={`pag-btn-${idx}`}
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
                {currentIndex === totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(true)}
                    disabled={savingAnswer}
                    className="py-4 bg-[#E83831] hover:bg-[#d0312b] rounded-2xl font-black text-white text-xs uppercase tracking-widest transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Icon icon="lucide:check-square" className="w-4 h-4" />
                    <span>Submit Exam</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate(currentIndex + 1)}
                    disabled={savingAnswer}
                    className="py-4 bg-white dark:bg-[#09314F]/40 border border-gray-100 dark:border-[#09314F] hover:bg-gray-50 rounded-2xl font-bold text-[#09314F] dark:text-white text-xs uppercase tracking-widest disabled:opacity-30 transition-all shadow-sm"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          );

          if (isScience) {
            return (
              <div className="flex flex-col lg:flex-row gap-6 items-start relative">
                <div className="flex-1 w-full lg:min-w-0">{mainContent}</div>
                
                {/* Desktop Right Panel Calculator */}
                <div className="hidden lg:block relative shrink-0 z-[100]">
                  <CalculatorRightbar />
                </div>

                {/* Mobile & Tablet Movable Calculator Popup */}
                <div className="lg:hidden">
                  <MobileMovableCalculator isScience={isScience} />
                </div>
              </div>
            );
          }

          return mainContent;
        })()
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

      {/* Congratulations / Exam Finished Modal Overlay */}
      {examFinished && (
        <div className="fixed inset-0 z-[2500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-[#09314F] rounded-[32px] border border-[#C5A97A]/30 p-8 shadow-2xl text-center max-w-3xl w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            {showFeedback ? (
              <div className="text-left">
                <Icon icon="mdi:message-star-outline" className="w-16 h-16 text-[#C5A97A] mx-auto mb-4" />
                <h2 className="text-2xl font-black text-[#09314F] dark:text-white text-center tracking-tight mb-2">
                  How was the practice?
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                  Before you see your score, let us know how you felt about this exam.
                </p>

                {feedbackError && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-xl border border-red-100 mb-4 text-sm font-medium">
                    {feedbackError}
                  </div>
                )}

                <div className="mb-6 flex flex-col items-center">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Icon
                          icon={(hoverRating || rating) >= star ? "mdi:star" : "mdi:star-outline"}
                          className={`w-10 h-10 ${(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-[#09314F] dark:text-gray-300 mb-2">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                      placeholder="E.g., Great questions, but a bit tough"
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-[#09314F] dark:text-white focus:ring-2 focus:ring-[#BB9E7F] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#09314F] dark:text-gray-300 mb-2">
                      Comment (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us what you thought..."
                      rows="3"
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-[#09314F] dark:text-white focus:ring-2 focus:ring-[#BB9E7F] transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                  >
                    Skip
                  </button>
                  <button
                    onClick={async () => {
                      if (rating === 0) {
                        setFeedbackError("Please select a star rating.");
                        return;
                      }
                      setFeedbackLoading(true);
                      setFeedbackError(null);
                      try {
                        const studentToken = localStorage.getItem("student_token");
                        await axios.post(`${API_BASE_URL}/api/students/feedback`, {
                          feedbackable_type: "exam_attempt",
                          feedbackable_id: attemptId,
                          rating,
                          title: feedbackTitle,
                          comment,
                        }, {
                          headers: { Authorization: `Bearer ${studentToken}` }
                        });
                        setFeedbackLoading(false);
                        setShowFeedback(false);
                      } catch (err) {
                        setFeedbackLoading(false);
                        setFeedbackError(err.response?.data?.message || err.message || "Failed to submit feedback.");
                      }
                    }}
                    disabled={feedbackLoading}
                    className="flex-1 py-4 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all disabled:opacity-50"
                  >
                    {feedbackLoading ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                  {correctVal}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Icon icon="lucide:x-circle" className="w-5 h-5 text-red-500 mb-1" />
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Wrong
                </span>
                <span className="text-lg font-black text-gray-700 dark:text-gray-200 mt-1">
                  {wrongVal}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Icon icon="lucide:help-circle" className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Skipped
                </span>
                <span className="text-lg font-black text-gray-700 dark:text-gray-200 mt-1">
                  {skippedVal}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onBack}
                className="flex-1 py-4 border-2 border-[#09314F] dark:border-gray-500 hover:bg-[#09314F] dark:hover:bg-gray-500 hover:text-white text-[#09314F] dark:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
              >
                Go back to Center
              </button>
              <button
                onClick={() => onReviewExam && onReviewExam(attemptId)}
                className="flex-1 py-4 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all"
              >
                Review Exam
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
