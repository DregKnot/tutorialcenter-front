import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";
import logo from "../../assets/images/tutorial_logo.webp";
import { formatDurationClock } from "../../utils/bootcampUtils.js";

const CREDENTIALS_KEY = "bootcamp_cbt_credentials";

export default function BootcampCbt() {
  const { token } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  // Page meta + CBT info
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState("");
  const [cbt, setCbt] = useState(null);

  // Flow stage: "gate" | "passcode" | "portal" | "test"
  const [stage, setStage] = useState("gate");
  const [authTab, setAuthTab] = useState("register"); // "register" | "login"

  // Auth form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Authenticated participant state
  const [participant, setParticipant] = useState(null);
  const [issuedPin, setIssuedPin] = useState("");
  const [pinCopied, setPinCopied] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [record, setRecord] = useState(null);
  const [leaderboard, setLeaderboard] = useState({
    top_three: [],
    my_entry: null,
    total_participants: 0,
  });
  const [review, setReview] = useState([]);
  const [showReview, setShowReview] = useState(false);

  // Test runner state
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [startingTest, setStartingTest] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const answersRef = useRef(answers);
  const submittingRef = useRef(false);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Mark page noindex so unlisted CBT stays hidden from search engines
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Prefill saved credentials if this browser previously registered
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || "null");
      if (saved?.phone && saved?.pin) {
        setPhone(saved.phone);
        setPin(saved.pin);
        setAuthTab("login");
      }
    } catch {}
  }, []);

  const fetchCbtMeta = useCallback(async () => {
    if (!token) return;
    setLoadingMeta(true);
    setMetaError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/public/bootcamp/cbt/${token}`, {
        headers: { Accept: "application/json" },
      });
      setCbt(res.data?.data || null);
    } catch (err) {
      setMetaError(
        err.response?.data?.message || "This Bootcamp CBT link is invalid or unavailable."
      );
      setCbt(null);
    } finally {
      setLoadingMeta(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchCbtMeta();
  }, [fetchCbtMeta]);

  const persistCredentials = (phoneVal, pinVal) => {
    try {
      localStorage.setItem(
        CREDENTIALS_KEY,
        JSON.stringify({ phone: phoneVal.trim(), pin: pinVal.trim() })
      );
    } catch {}
  };

  const applySessionPayload = (data) => {
    if (data.cbt) setCbt(data.cbt);
    if (data.participant) setParticipant(data.participant);
    setAttempt(data.attempt || null);
    setRecord(data.record || null);
    setLeaderboard(
      data.leaderboard || { top_three: [], my_entry: null, total_participants: 0 }
    );
    setReview(Array.isArray(data.review) ? data.review : []);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!fullName.trim() || !phone.trim()) {
      setAuthError("Please enter both your full name and phone number.");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/public/bootcamp/cbt/${token}/register`,
        { full_name: fullName.trim(), phone: phone.trim() },
        { headers: { Accept: "application/json" } }
      );
      const data = res.data?.data || {};
      const newPin = data.secret_pin || "";
      setPin(newPin);
      setIssuedPin(newPin);
      persistCredentials(phone.trim(), newPin);
      applySessionPayload(data);
      setStage("passcode");
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setAuthTab("login");
      }
      setAuthError(
        err.response?.data?.message || "Could not complete registration. Please check your details."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!phone.trim() || pin.trim().length !== 4) {
      setAuthError("Enter your phone number and 4-digit secret PIN.");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/public/bootcamp/cbt/${token}/login`,
        { phone: phone.trim(), pin: pin.trim() },
        { headers: { Accept: "application/json" } }
      );
      const data = res.data?.data || {};
      persistCredentials(phone.trim(), pin.trim());
      applySessionPayload(data);
      setStage("portal");
    } catch (err) {
      setAuthError(
        err.response?.data?.message || "Phone number or 4-digit secret PIN is incorrect."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const resolveMediaUrl = useCallback(
    (url) => {
      if (!url) return "";
      if (/^https?:\/\//i.test(url)) return url;
      return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    },
    [API_BASE_URL]
  );

  const answersStorageKey = `bootcamp_cbt_answers_${token}_${phone.trim()}`;

  const handleStartTest = async () => {
    setAuthError("");
    setStartingTest(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/public/bootcamp/cbt/${token}/start`,
        { phone: phone.trim(), pin: pin.trim() },
        { headers: { Accept: "application/json" } }
      );
      const data = res.data?.data || {};
      const loadedQuestions = Array.isArray(data.questions) ? data.questions : [];
      let cachedAnswers = {};
      try {
        cachedAnswers = JSON.parse(sessionStorage.getItem(answersStorageKey) || "{}");
      } catch {}
      setQuestions(loadedQuestions);
      setCurrentIdx(0);
      setAnswers(cachedAnswers && typeof cachedAnswers === "object" ? cachedAnswers : {});
      answersRef.current = cachedAnswers && typeof cachedAnswers === "object" ? cachedAnswers : {};
      setRemainingSeconds(Number(data.remaining_seconds || 1200));
      setStage("test");
    } catch (err) {
      setAuthError(
        err.response?.data?.message || "Unable to start this CBT right now."
      );
    } finally {
      setStartingTest(false);
    }
  };

  const handleSubmitTest = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmittingTest(true);
    setShowSubmitConfirm(false);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/public/bootcamp/cbt/${token}/submit`,
        {
          phone: phone.trim(),
          pin: pin.trim(),
          answers: answersRef.current,
        },
        { headers: { Accept: "application/json" } }
      );
      try {
        sessionStorage.removeItem(answersStorageKey);
      } catch {}
      const data = res.data?.data || {};
      applySessionPayload(data);
      setStage("portal");
    } catch (err) {
      setAuthError(
        err.response?.data?.message || "Failed to submit CBT. Please try again."
      );
    } finally {
      submittingRef.current = false;
      setSubmittingTest(false);
    }
  }, [API_BASE_URL, token, phone, pin, answersStorageKey]);

  // Countdown timer during active CBT
  useEffect(() => {
    if (stage !== "test") return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, handleSubmitTest]);

  // Tab switch warning during test
  useEffect(() => {
    if (stage !== "test") return;
    const onBlur = () => {
      setWarningMsg("Warning: Leaving this CBT screen is monitored.");
      setTimeout(() => setWarningMsg(""), 4000);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [stage]);

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers((prev) => {
      const next = { ...prev, [String(questionId)]: optionKey };
      answersRef.current = next;
      try {
        sessionStorage.setItem(answersStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopyPin = () => {
    if (!issuedPin) return;
    navigator.clipboard.writeText(issuedPin);
    setPinCopied(true);
    setTimeout(() => setPinCopied(false), 2500);
  };

  // --- LOADING / ERROR STATES ---
  if (loadingMeta) {
    return (
      <div className="min-h-screen bg-[#071927] text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-[#BB9E7F]/30 border-t-[#BB9E7F] rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-300">
          Loading Bootcamp CBT...
        </p>
      </div>
    );
  }

  if (metaError || !cbt) {
    return (
      <div className="min-h-screen bg-[#071927] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0F2843] border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <Icon icon="lucide:link-2-off" className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black">Invalid CBT Link</h1>
          <p className="text-xs text-gray-300 leading-relaxed">{metaError}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-3 bg-[#BB9E7F] text-[#09314F] font-black text-xs uppercase tracking-wider rounded-xl"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const timerMins = Math.floor(remainingSeconds / 60);
  const timerSecs = remainingSeconds % 60;
  const showRankFourPlus =
    leaderboard.my_entry && Number(leaderboard.my_entry.rank) > 3;

  return (
    <div className="min-h-screen bg-[#071927] text-white flex flex-col font-sans relative overflow-x-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#E83831]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full bg-[#09314F]/85 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <img src={logo} alt="Tutorial Center" className="h-9 w-auto object-contain shrink-0" />
          <div className="border-l border-white/20 pl-3 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#BB9E7F] block">
              Bootcamp CBT • {cbt.subject_label}
            </span>
            <h1 className="text-xs sm:text-sm font-black text-white truncate">{cbt.title}</h1>
          </div>
        </div>

        {stage === "test" && (
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl shrink-0">
            <Icon icon="lucide:clock" className="w-4 h-4 text-[#BB9E7F] animate-pulse" />
            <span className="font-mono text-sm sm:text-base font-black">
              {String(timerMins).padStart(2, "0")}:{String(timerSecs).padStart(2, "0")}
            </span>
          </div>
        )}

        {participant && stage === "portal" && (
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-[#BB9E7F] block">
              Candidate
            </span>
            <span className="text-xs font-black">{participant.full_name}</span>
          </div>
        )}
      </header>

      {warningMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-black flex items-center gap-2">
          <Icon icon="lucide:alert-triangle" className="w-4 h-4" />
          {warningMsg}
        </div>
      )}

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {/* ── STAGE 1: PHONE + NAME + SECRET PIN GATE ────────────────────────── */}
        {stage === "gate" && (
          <div className="max-w-lg mx-auto mt-4 bg-[#0F2843] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#BB9E7F]/15 border border-[#BB9E7F]/30 text-[#BB9E7F] text-[10px] font-black uppercase tracking-widest">
                {cbt.subject_label} • {cbt.questions_count} Questions • {cbt.duration_minutes} Mins
              </span>
              <h2 className="text-2xl font-black">{cbt.title}</h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                Register once with your name and phone number to get your 4-digit secret PIN, or sign in as a returning Bootcamp student to view your record and take the CBT.
              </p>
            </div>

            {/* Auth Mode Switch */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/30 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("register");
                  setAuthError("");
                }}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  authTab === "register"
                    ? "bg-[#BB9E7F] text-[#09314F]"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                New Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("login");
                  setAuthError("");
                }}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  authTab === "login"
                    ? "bg-[#BB9E7F] text-[#09314F]"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Returning Student
              </button>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-2">
                <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authTab === "register" ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#BB9E7F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#BB9E7F]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#BB9E7F] to-[#d6b796] text-[#09314F] font-black text-xs uppercase tracking-widest rounded-xl shadow-lg disabled:opacity-60"
                >
                  {authLoading ? "Registering..." : "Register & Get Secret PIN"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#BB9E7F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    4-Digit Secret PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-lg font-mono tracking-[0.5em] text-center text-white placeholder-gray-400 focus:outline-none focus:border-[#BB9E7F]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Forgot your PIN? Message the Bootcamp Admin on WhatsApp using your registered phone number to reset it.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#BB9E7F] to-[#d6b796] text-[#09314F] font-black text-xs uppercase tracking-widest rounded-xl shadow-lg disabled:opacity-60"
                >
                  {authLoading ? "Checking..." : "Continue to My Record & CBT"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── STAGE 2: SECRET PASSCODE SCREENSHOT CARD ──────────────────────── */}
        {stage === "passcode" && (
          <div className="max-w-md mx-auto mt-6 bg-[#0F2843] border-2 border-[#BB9E7F]/60 rounded-3xl p-7 text-center shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
              <Icon icon="lucide:shield-check" className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#BB9E7F]">
                Save Your Bootcamp Pass
              </span>
              <h2 className="text-xl font-black mt-1">{participant?.full_name}</h2>
              <p className="text-xs text-gray-300 mt-1">
                Take a screenshot or copy this 4-digit secret PIN. You will need it with your phone number for next week's CBT.
              </p>
            </div>

            <div className="bg-black/40 border border-white/15 rounded-2xl py-5 px-4">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Your Secret PIN
              </span>
              <p className="text-4xl font-mono font-black tracking-[0.4em] text-[#BB9E7F]">
                {issuedPin}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopyPin}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Icon icon={pinCopied ? "lucide:check" : "lucide:copy"} className="w-4 h-4" />
                {pinCopied ? "PIN Copied!" : "Copy PIN"}
              </button>
              <button
                type="button"
                onClick={() => setStage("portal")}
                className="flex-1 py-3 bg-[#BB9E7F] text-[#09314F] rounded-xl text-xs font-black uppercase tracking-wider"
              >
                I Have Saved It →
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 3: SINGLE-PAGE RECORD, CBT LAUNCHER & LEADERBOARD ────────── */}
        {stage === "portal" && (
          <div className="space-y-6">
            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold">
                {authError}
              </div>
            )}

            {/* Action / Current CBT Card */}
            <div className="bg-gradient-to-br from-[#0F2843] to-[#163b61] border border-white/15 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#BB9E7F]">
                  {cbt.subject_label} • Week of {cbt.week_start_date}
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  Welcome, {participant?.full_name}
                </h2>
                <p className="text-xs text-gray-300 mt-1">
                  {attempt?.is_completed
                    ? `You completed this CBT with ${attempt.score} / ${attempt.total_questions} points in ${formatDurationClock(attempt.time_taken_seconds)}.`
                    : cbt.is_open
                    ? `${cbt.questions_count} questions • ${cbt.duration_minutes} minutes • 1 point per correct answer.`
                    : "This CBT is currently closed or paused."}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {attempt?.is_completed ? (
                  <button
                    type="button"
                    onClick={() => setShowReview((p) => !p)}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-wider"
                  >
                    {showReview ? "Hide Answers" : "Review My Answers"}
                  </button>
                ) : cbt.is_open ? (
                  <button
                    type="button"
                    disabled={startingTest || cbt.questions_count === 0}
                    onClick={handleStartTest}
                    className="px-6 py-3.5 bg-gradient-to-r from-[#BB9E7F] to-[#e0c09e] text-[#09314F] font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg disabled:opacity-50"
                  >
                    {startingTest ? "Starting..." : "Start CBT Now"}
                  </button>
                ) : (
                  <span className="px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-black uppercase">
                    CBT Closed
                  </span>
                )}
              </div>
            </div>

            {/* My Subject Record: Strictly This Week & Last Week */}
            <div className="bg-[#0F2843] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#BB9E7F]">
                  Your {record?.subject_label || cbt.subject_label} Record
                </h3>
                <span className="text-[11px] text-gray-400 font-semibold">
                  Last Week & This Week
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    Last Week
                  </span>
                  {record?.last_week ? (
                    <div className="mt-1.5">
                      <p className="text-2xl font-black text-white">
                        {record.last_week.score} / {record.last_week.total_questions}{" "}
                        <span className="text-xs font-bold text-[#BB9E7F]">pts</span>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {record.last_week.title} •{" "}
                        {formatDurationClock(record.last_week.time_taken_seconds)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-gray-400 mt-2">
                      No score recorded last week
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                    This Week
                  </span>
                  {record?.this_week ? (
                    <div className="mt-1.5">
                      <p className="text-2xl font-black text-white">
                        {record.this_week.score} / {record.this_week.total_questions}{" "}
                        <span className="text-xs font-bold text-emerald-300">pts</span>
                      </p>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        {record.this_week.title} •{" "}
                        {formatDurationClock(record.this_week.time_taken_seconds)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-gray-300 mt-2">
                      Not completed yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Leaderboard: Top 3 + Your Position right after if #4+ */}
            <div className="bg-[#0F2843] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Icon icon="lucide:trophy" className="w-5 h-5 text-amber-400" />
                  Top Performers — {cbt.title}
                </h3>
                <span className="text-[11px] font-bold text-gray-400">
                  {leaderboard.total_participants} completed
                </span>
              </div>

              {leaderboard.top_three.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-gray-400 bg-black/20 rounded-2xl">
                  No completed submissions yet. Be the first to set the high score!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leaderboard.top_three.map((entry) => {
                    const rankBadge =
                      entry.rank === 1
                        ? "bg-amber-400 text-black"
                        : entry.rank === 2
                        ? "bg-slate-200 text-black"
                        : "bg-amber-700 text-white";

                    return (
                      <div
                        key={`${entry.rank}-${entry.participant_id}`}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                          entry.is_me
                            ? "bg-amber-400/15 border-amber-400/60"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${rankBadge}`}
                          >
                            #{entry.rank}
                          </span>
                          <div className="min-w-0">
                            <p className="font-black text-sm text-white truncate flex items-center gap-2">
                              <span>{entry.full_name}</span>
                              {entry.is_me && (
                                <span className="px-2 py-0.5 bg-amber-400 text-black text-[9px] font-black rounded uppercase">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              Time: {formatDurationClock(entry.time_taken_seconds)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-[#BB9E7F]">
                            {entry.score}
                          </span>
                          <span className="text-xs text-gray-400 font-bold">
                            {" "}
                            / {entry.total_questions} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* If not in Top 3, show student's own position & score immediately after Top 3 */}
                  {showRankFourPlus && (
                    <div
                      data-testid="my-pinned-rank-row"
                      className="p-4 rounded-2xl border-2 border-[#BB9E7F] bg-[#BB9E7F]/15 flex items-center justify-between gap-3 mt-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-[#BB9E7F] text-[#09314F] flex items-center justify-center font-black text-sm shrink-0">
                          #{leaderboard.my_entry.rank}
                        </span>
                        <div className="min-w-0">
                          <p className="font-black text-sm text-white truncate flex items-center gap-2">
                            <span>{leaderboard.my_entry.full_name}</span>
                            <span className="px-2 py-0.5 bg-[#BB9E7F] text-[#09314F] text-[9px] font-black rounded uppercase">
                              YOUR POSITION
                            </span>
                          </p>
                          <p className="text-[11px] text-gray-300">
                            Time: {formatDurationClock(leaderboard.my_entry.time_taken_seconds)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-white">
                          {leaderboard.my_entry.score}
                        </span>
                        <span className="text-xs text-gray-300 font-bold">
                          {" "}
                          / {leaderboard.my_entry.total_questions} pts
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Optional Post-Submit Answer Review */}
            {showReview && review.length > 0 && (
              <div className="bg-[#0F2843] border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#BB9E7F]">
                  Answer Review
                </h3>
                <div className="space-y-4">
                  {review.map((q) => (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border ${
                        q.is_correct
                          ? "bg-emerald-500/10 border-emerald-500/40"
                          : "bg-rose-500/10 border-rose-500/40"
                      }`}
                    >
                      <p className="text-xs font-black uppercase mb-1 text-gray-300">
                        Question {q.number} •{" "}
                        {q.is_correct ? "Correct (+1 pt)" : "Incorrect"}
                      </p>
                      <p className="text-sm font-bold text-white mb-2">{q.question_text}</p>
                      <p className="text-xs text-gray-300">
                        Your Answer:{" "}
                        <strong className="text-white">{q.selected_option || "Skipped"}</strong>{" "}
                        • Correct Answer:{" "}
                        <strong className="text-emerald-300">{q.correct_option}</strong>
                      </p>
                      {q.explanation && (
                        <p className="text-xs text-gray-300 mt-1.5 italic">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 4: ACTIVE CBT RUNNER ─────────────────────────────────────── */}
        {stage === "test" && currentQuestion && (
          <div className="space-y-5">
            {/* Progress & Navigator */}
            <div className="bg-[#0F2843] border border-white/10 rounded-3xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                <span>
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span>
                  {answeredCount} / {questions.length} Answered
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {questions.map((q, idx) => {
                  const isAnswered = answers[String(q.id)] !== undefined;
                  const isActive = idx === currentIdx;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-black border transition-all ${
                        isActive
                          ? "bg-[#BB9E7F] text-[#09314F] border-[#BB9E7F]"
                          : isAnswered
                          ? "bg-emerald-500/25 text-emerald-200 border-emerald-400/50"
                          : "bg-white/5 text-gray-400 border-white/10"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-[#0F2843] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              {currentQuestion.passage_text && (
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#BB9E7F] block mb-1">
                    Passage / Instruction
                  </span>
                  {currentQuestion.passage_text}
                </div>
              )}

              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed whitespace-pre-line">
                {currentQuestion.question_text}
              </h2>

              {currentQuestion.image_url && (
                <img
                  src={resolveMediaUrl(currentQuestion.image_url)}
                  alt={`Question ${currentIdx + 1}`}
                  className="max-h-64 rounded-2xl border border-white/15 object-contain bg-white/5 p-2"
                />
              )}

              <div className="space-y-3">
                {(currentQuestion.options || []).map((opt) => {
                  const selected = answers[String(currentQuestion.id)] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                      className={`w-full text-left p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                        selected
                          ? "bg-[#BB9E7F]/20 border-[#BB9E7F] text-white"
                          : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          selected
                            ? "bg-[#BB9E7F] text-[#09314F]"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-sm font-medium">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-xs font-bold disabled:opacity-40"
                >
                  ← Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
                    className="px-5 py-2.5 rounded-xl bg-[#BB9E7F] text-[#09314F] text-xs font-black uppercase tracking-wider"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(true)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider"
                  >
                    Submit CBT
                  </button>
                )}
              </div>
            </div>

            {currentIdx < questions.length - 1 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider"
                >
                  Finish & Submit Early
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F2843] border border-white/15 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-black">Submit CBT?</h3>
            <p className="text-xs text-gray-300">
              You answered <strong>{answeredCount}</strong> out of{" "}
              <strong>{questions.length}</strong> questions. Once submitted, you cannot retake this CBT.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold"
              >
                Review
              </button>
              <button
                type="button"
                disabled={submittingTest}
                onClick={handleSubmitTest}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase"
              >
                {submittingTest ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
