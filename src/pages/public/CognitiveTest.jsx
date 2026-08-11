import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import axios from "axios";
import logo from "../../assets/images/tutorial_logo.webp";
import { cognitiveQuestions } from "../../data/cognitiveQuestions";

const CognitiveTest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Expiration State
  const [isExpired, setIsExpired] = useState(false);
  const [remainingLinkMins, setRemainingLinkMins] = useState(60);

  // Test Flow States: "form" | "test" | "completed"
  const [step, setStep] = useState("form");
  const [showReview, setShowReview] = useState(false); // Toggle answer review mode
  const [studentName, setStudentName] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(1200); // 20 minutes
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [schoolFromToken, setSchoolFromToken] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Final Results
  const [finalScore, setFinalScore] = useState(null);

  // Backend record ID (from /api/cognitive-tests/start)
  const [testRecordId, setTestRecordId] = useState(null);

  const containerRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  // Check 1-hour token validity upon page mount
  useEffect(() => {
    const urlToken = searchParams.get("token");
    const storedToken = localStorage.getItem("active_cognitive_test_token");
    const activeToken = urlToken || storedToken;

    if (activeToken) {
      try {
        const decoded = JSON.parse(atob(activeToken));
        if (decoded.exp) {
          const now = Date.now();
          if (now > decoded.exp) {
            setIsExpired(true);
          } else {
            const minsLeft = Math.ceil((decoded.exp - now) / (1000 * 60));
            setRemainingLinkMins(minsLeft);
            if (decoded.school) {
              setSchoolName(decoded.school);
              setSchoolFromToken(true);
            }
          }
        }
      } catch (e) {
        console.error("Invalid token format", e);
      }
    }
    
    // Shuffle questions once on mount
    const shuffled = [...cognitiveQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, [searchParams]);

  // Countdown timer when test is active
  useEffect(() => {
    if (step !== "test") return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Lockdown & Tab Switching Monitor
  useEffect(() => {
    if (step !== "test") return;

    const handleBlur = () => {
      setWarningMessage("⚠️ Warning: Switching tabs or leaving the screen is monitored!");
      setTimeout(() => setWarningMessage(""), 5000);
    };

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => e.preventDefault();

    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
    };
  }, [step]);

  const handleStartTest = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !schoolName.trim()) return;

    // Register the test session with the backend
    try {
      const res = await axios.post(`${API_BASE_URL}/api/cognitive-tests/start`, {
        student_name: studentName.trim(),
        school: schoolName.trim(),
      });
      if (res.data?.data?.id) {
        setTestRecordId(res.data.data.id);
        console.log("🧠 [CognitiveTest] Backend record created, ID:", res.data.data.id);
      }
    } catch (err) {
      console.warn("🧠 [CognitiveTest] Backend start failed (continuing offline):", err.message);
    }

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Fullscreen optional
    }

    setStep("test");
  };

  const handleSelectOption = (optIndex) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    shuffledQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const formatTimeSpent = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleAutoSubmit = () => {
    submitResults();
  };

  const submitResults = async () => {
    if (submitting) return;
    setSubmitting(true);

    const score = calculateScore();
    const total = shuffledQuestions.length;
    const percentage = Math.round((score / total) * 100);
    const timeSpentSecs = 1200 - timerSeconds;
    const timeTaken = formatTimeSpent(timeSpentSecs);

    const resultObj = {
      id: testRecordId || Date.now(),
      student_name: studentName.trim(),
      school_name: schoolName.trim(),
      email: "N/A",
      score,
      total,
      percentage,
      time_taken: timeTaken,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setFinalScore(resultObj);



    // Complete the test on the backend
    if (testRecordId) {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/cognitive-tests/${testRecordId}/complete`, {
          score,
        });
        console.log("🧠 [CognitiveTest] Backend complete response:", res.data);
      } catch (err) {
        console.warn("🧠 [CognitiveTest] Backend complete failed:", err.message);
      }
    }

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    setStep("completed");
    setSubmitting(false);
  };

  const currentQ = shuffledQuestions.length > 0 ? (shuffledQuestions[currentIndex] || shuffledQuestions[0]) : cognitiveQuestions[0];
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  // EXPIRED LINK SCREEN
  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#071927] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="w-full max-w-md bg-[#0F2843] border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-red-500/40 text-red-400">
            <Icon icon="lucide:clock-8" className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">
            Test Access Link Expired ⌛
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed mb-6">
            This cognitive test link was valid for 1 hour and has now expired. Please contact your school administrator to request an updated access link.
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3.5 bg-gradient-to-r from-[#BB9E7F] to-[#d8b590] text-[#0F2843] font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg hover:scale-105"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#071927] text-white flex flex-col font-sans select-none relative overflow-hidden"
    >
      {/* Background Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#E83831]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full bg-[#09314F]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tutorial Center" className="h-10 w-auto object-contain" />
          <div className="hidden sm:block border-l border-white/20 pl-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#BB9E7F]">
              National Cognitive Challenge
            </span>
          </div>
        </div>

        {step === "test" && (
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
            <Icon icon="lucide:clock" className="w-5 h-5 text-[#BB9E7F] animate-pulse" />
            <span className="font-mono text-base font-bold text-white tracking-widest">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        )}
      </header>

      {/* Warning Notification Toast */}
      {warningMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2 animate-bounce border border-white/30">
          <Icon icon="lucide:alert-triangle" className="w-5 h-5" />
          {warningMessage}
        </div>
      )}

      {/* STEP 1: INITIAL GREETING & STUDENT INFO FORM MODAL */}
      {step === "form" && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F2843] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header Banner */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#BB9E7F]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#BB9E7F]/40 shadow-inner">
                <Icon icon="lucide:brain-circuit" className="w-9 h-9 text-[#BB9E7F]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                Welcome to the Cognitive Test! 🧠
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md mx-auto mb-2">
                Test your problem-solving, speed, and analytical reasoning skills. The top-performing students and schools win exciting prizes!
              </p>
              <div className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-extrabold rounded-full">
                ⏱️ Access Link Active ({remainingLinkMins}m remaining)
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleStartTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  School Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Icon icon="lucide:building-2" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    readOnly={schoolFromToken}
                    placeholder="Enter your school name..."
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BB9E7F] text-sm font-medium ${schoolFromToken ? "bg-white/20 text-gray-200 cursor-not-allowed" : "bg-white/5 text-white placeholder-gray-500"}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Student Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Icon icon="lucide:user" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name..."
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BB9E7F] text-sm text-white placeholder-gray-500 font-medium"
                  />
                </div>
              </div>



              {/* Instructions Callout */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
                <Icon icon="lucide:shield-alert" className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Test Lockdown:</strong> Once you click Start, your test environment will be active. Avoid switching tabs during your attempt.
                </span>
              </div>

              <button
                type="submit"
                disabled={!studentName.trim() || !schoolName.trim()}
                className="w-full py-4 bg-gradient-to-r from-[#BB9E7F] to-[#d8b590] hover:opacity-95 text-[#0F2843] font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                <span>Start Cognitive Test</span>
                <Icon icon="lucide:arrow-right" className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 2: ACTIVE TEST INTERFACE */}
      {step === "test" && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-between z-10">
          
          {/* Progress Header & Timer */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#BB9E7F] block mb-1">
                  Question {currentIndex + 1} of {shuffledQuestions.length}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  School: <strong className="text-white">{schoolName}</strong>
                </span>
              </div>
              <div className="bg-red-600 border-2 border-red-400 rounded-xl px-6 py-2 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse">
                <span className="text-lg sm:text-xl font-black text-white tracking-widest font-mono">
                  {formatTimeSpent(timerSeconds)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#BB9E7F] to-[#4ade80] transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-[#0F2843] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 flex-1 flex flex-col justify-between">
            <div>
              {currentQ.category && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-white/10 text-[#BB9E7F] border border-[#BB9E7F]/30 text-[10px] font-black uppercase tracking-wider rounded-md">
                    {currentQ.category}
                  </span>
                </div>
              )}
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-relaxed mb-6">
                {currentQ.question}
              </h2>

              {/* Options Grid */}
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-[#BB9E7F]/20 border-[#BB9E7F] text-white ring-2 ring-[#BB9E7F]/50 shadow-md"
                          : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                            isSelected
                              ? "bg-[#BB9E7F] text-[#0F2843]"
                              : "bg-white/10 text-gray-300 group-hover:bg-white/20"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm sm:text-base font-semibold">{opt}</span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-[#BB9E7F] bg-[#BB9E7F]" : "border-white/30"
                        }`}
                      >
                        {isSelected && <Icon icon="lucide:check" className="w-3.5 h-3.5 text-[#0F2843] stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Bar inside card */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                Previous
              </button>

              {currentIndex < shuffledQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(shuffledQuestions.length - 1, prev + 1))}
                  className="px-6 py-2.5 bg-[#BB9E7F] hover:bg-[#d8b590] text-[#0F2843] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                >
                  Next
                  <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submitResults}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
                >
                  {submitting ? "Submitting..." : "Submit Test"}
                  <Icon icon="lucide:send" className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Palette Jump Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {shuffledQuestions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent = currentIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? "bg-[#BB9E7F] text-[#0F2843] ring-2 ring-white scale-110"
                      : isAnswered
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </main>
      )}

      {/* STEP 3: COMPLETED / THANK YOU & SCORE POPUP MODAL OR DETAILED ANSWER REVIEW */}
      {step === "completed" && finalScore && (
        <>
          {/* OPTION A: DETAILED ANSWER REVIEW VIEW */}
          {showReview ? (
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto z-10 pb-20">
              
              {/* Header Bar */}
              <div className="bg-[#0F2843] border border-white/10 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-[#BB9E7F]/20 text-[#BB9E7F] text-[10px] font-black uppercase tracking-wider rounded">
                      Cognitive Test Answer Review
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white">
                    {finalScore.student_name} — {finalScore.school_name}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Review correct answers and detailed explanations for all 20 questions.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                    <span className="block text-[9px] uppercase tracking-wider text-gray-400">Score</span>
                    <span className="text-lg font-black text-[#BB9E7F]">{finalScore.score} / {finalScore.total}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                    <span className="block text-[9px] uppercase tracking-wider text-gray-400">Percentage</span>
                    <span className="text-lg font-black text-emerald-400">{finalScore.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Questions Answer Breakdown List */}
              <div className="space-y-6">
                {shuffledQuestions.map((q, qIdx) => {
                  const studentAns = answers[qIdx];
                  const isCorrect = studentAns === q.correctIndex;
                  const isUnanswered = studentAns === undefined;

                  return (
                    <div
                      key={q.id}
                      className={`bg-[#0F2843] border rounded-3xl p-6 shadow-lg transition-all ${
                        isCorrect
                          ? "border-emerald-500/40"
                          : isUnanswered
                          ? "border-gray-500/30"
                          : "border-red-500/40"
                      }`}
                    >
                      {/* Question Badge & Category */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-[#BB9E7F]">
                            Question {qIdx + 1}
                          </span>
                          {q.category && (
                            <span className="px-2 py-0.5 bg-white/10 text-gray-300 text-[10px] font-bold rounded">
                              {q.category}
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5">
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black rounded-full">
                              <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
                              Correct (+1)
                            </span>
                          ) : isUnanswered ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/30 text-[11px] font-black rounded-full">
                              <Icon icon="lucide:minus-circle" className="w-3.5 h-3.5" />
                              Unanswered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-black rounded-full">
                              <Icon icon="lucide:x-circle" className="w-3.5 h-3.5" />
                              Incorrect
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <h3 className="text-base font-bold text-white mb-4 leading-relaxed">
                        {q.question}
                      </h3>

                      {/* Options List */}
                      <div className="space-y-2 mb-4">
                        {q.options.map((opt, optIdx) => {
                          const isOptionCorrect = optIdx === q.correctIndex;
                          const isStudentSelected = studentAns === optIdx;

                          let optionStyle = "bg-white/5 border-white/10 text-gray-300";
                          if (isOptionCorrect) {
                            optionStyle = "bg-emerald-500/20 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/50";
                          } else if (isStudentSelected && !isCorrect) {
                            optionStyle = "bg-red-500/20 border-red-500 text-white font-bold ring-1 ring-red-500/50";
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-black/30 flex items-center justify-center font-bold text-[10px]">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>

                              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase">
                                {isOptionCorrect && (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <Icon icon="lucide:check" className="w-3.5 h-3.5" />
                                    Correct Answer
                                  </span>
                                )}
                                {isStudentSelected && !isCorrect && (
                                  <span className="text-red-400 flex items-center gap-1">
                                    <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                                    Your Choice
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Box */}
                      {q.explanation && (
                        <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 leading-relaxed flex items-start gap-2">
                          <Icon icon="lucide:lightbulb" className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-blue-300 text-[10px] uppercase tracking-wider mb-0.5">Explanation:</strong>
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowReview(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all border border-white/20 flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:arrow-left" className="w-4 h-4" />
                  <span>Back to Summary</span>
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 bg-[#BB9E7F] hover:bg-white text-[#0F2843] font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:home" className="w-4 h-4" />
                  <span>Return to Home</span>
                </button>
              </div>
            </main>
          ) : (
            /* OPTION B: COMPLETED SUMMARY POPUP MODAL */
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-[#0F2843] border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Trophy Banner */}
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(245,158,11,0.4)] border-2 border-white/30">
                  <Icon icon="lucide:trophy" className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  Thank You! 🎉
                </h1>
                <p className="text-xs text-gray-300 mb-6">
                  Your cognitive test response has been recorded successfully.
                </p>

                {/* Score Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5 text-xs text-gray-300">
                    <span>Student Name</span>
                    <strong className="text-white font-bold">{finalScore.student_name}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5 text-xs text-gray-300">
                    <span>School Name</span>
                    <strong className="text-white font-bold">{finalScore.school_name}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5 text-xs text-gray-300">
                    <span>Time Taken</span>
                    <strong className="text-[#BB9E7F] font-mono font-bold">{finalScore.time_taken}</strong>
                  </div>

                  {/* Score Display */}
                  <div className="pt-2 flex items-center justify-around">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-400">Total Score</span>
                      <span className="text-2xl font-black text-[#BB9E7F]">
                        {finalScore.score} / {finalScore.total}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-400">Percentage</span>
                      <span className="text-2xl font-black text-emerald-400">
                        {finalScore.percentage}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  The high scores across participating schools will be evaluated, and winners will be announced soon!
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowReview(true)}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Icon icon="lucide:eye" className="w-4 h-4" />
                    <span>Review Detailed Answers</span>
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="w-full py-3.5 bg-[#BB9E7F] hover:bg-white text-[#0F2843] font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Icon icon="lucide:home" className="w-4 h-4" />
                    <span>Return to Home</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CognitiveTest;
