import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/private/Students/DashboardLayout";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Video,
  PlaySquare,
  Layers,
  Star,
  MessageSquare,
  Award,
  Clock,
  ThumbsUp,
  Send,
  RotateCcw,
  Trophy,
  Medal,
  PartyPopper,
  AlertCircle,
} from "lucide-react";

// ─── Animated Confetti Particle ───────────────────────────────────────────────
const CONFETTI_COLORS = ["#C5A97A", "#0F2843", "#34d399", "#f59e0b", "#f472b6", "#60a5fa"];

function ConfettiPiece({ style }) {
  return (
    <div
      style={style}
      className="absolute rounded-sm pointer-events-none"
    />
  );
}

function Confetti({ active }) {
  const pieces = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: `${4 + Math.random() * 6}px`,
      height: `${8 + Math.random() * 6}px`,
      bg: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: `${Math.random() * 1.2}s`,
      duration: `${1.4 + Math.random() * 1.2}s`,
      rotation: `${Math.random() * 360}deg`,
    }))
  ).current;

  if (!active) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {pieces.map((p) => (
        <ConfettiPiece
          key={p.id}
          style={{
            left: p.left,
            top: "-10px",
            width: p.width,
            height: p.height,
            backgroundColor: p.bg,
            transform: `rotate(${p.rotation})`,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg) scale(0.5); opacity: 0; }
        }
        @keyframes badge-pop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.12) rotate(4deg); opacity: 1; }
          80%  { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes shimmer-badge {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ring-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(197,169,122,0.6), 0 0 0 0 rgba(197,169,122,0.3); }
          50%       { box-shadow: 0 0 0 16px rgba(197,169,122,0), 0 0 0 32px rgba(197,169,122,0); }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes stars-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .badge-pop-enter  { animation: badge-pop 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .badge-shimmer {
          background: linear-gradient(120deg, #C5A97A 0%, #fef3c7 40%, #e4cb9c 50%, #fef3c7 60%, #C5A97A 100%);
          background-size: 200% auto;
          animation: shimmer-badge 2.4s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ring-pulse { animation: ring-pulse 2s ease-out infinite; }
        .float-icon { animation: float-icon 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// ─── Survey Completion Badge ───────────────────────────────────────────────────
function SurveyBadge({ studentName }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div
      className={`relative mx-auto w-64 transition-all duration-700 ${
        show ? "badge-pop-enter opacity-100" : "opacity-0 scale-0"
      }`}
      style={{ animation: show ? "badge-pop 0.7s cubic-bezier(0.22,1,0.36,1) forwards" : "none" }}
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-3xl ring-pulse" style={{ borderRadius: "1.5rem" }} />

      {/* Badge card */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-[#C5A97A] shadow-2xl shadow-[#C5A97A]/40">
        {/* Top ribbon */}
        <div className="bg-gradient-to-r from-[#0F2843] via-[#163a5f] to-[#0F2843] px-4 py-2 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A97A]">Tutorial Center Africa</span>
        </div>

        {/* Badge body */}
        <div className="bg-gradient-to-b from-[#0c2236] to-[#0a1c2e] px-6 py-5 flex flex-col items-center gap-3">
          {/* Icon halo */}
          <div
            className="float-icon w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fde68a, #C5A97A 60%, #92670e)",
              boxShadow: "0 0 30px rgba(197,169,122,0.6), inset 0 2px 4px rgba(255,255,255,0.3)",
            }}
          >
            <Trophy className="w-10 h-10 text-[#0F2843]" strokeWidth={2.5} />
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <p className="text-[10px] text-[#C5A97A]/70 font-bold uppercase tracking-widest">Awarded To</p>
            <p className="text-sm font-black text-white leading-tight">{studentName || "Valued Student"}</p>
          </div>

          {/* Badge name */}
          <div className="text-center">
            <h3 className="text-xl font-black badge-shimmer leading-tight">Survey Pioneer</h3>
            <p className="text-[10px] text-[#C5A97A]/60 mt-0.5">Class of 2025 · Early Contributor</p>
          </div>

          {/* Stars row */}
          <div className="flex gap-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 text-[#C5A97A] fill-[#C5A97A]" />
            ))}
          </div>

          {/* Seal line */}
          <div className="w-full border-t border-[#C5A97A]/20 pt-2 flex items-center justify-center gap-2">
            <Medal className="w-3.5 h-3.5 text-[#C5A97A]/50" />
            <span className="text-[9px] font-bold text-[#C5A97A]/50 uppercase tracking-wider">Empowering Minds · Achieving Excellence</span>
          </div>
        </div>

        {/* Bottom ribbon */}
        <div className="bg-gradient-to-r from-[#C5A97A] via-[#e4cb9c] to-[#C5A97A] px-4 py-1.5 text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#0F2843]">Feedback · Honoured · 2025</span>
        </div>
      </div>
    </div>
  );
}

const TOTAL_STEPS = 5;
const STORAGE_KEY = "tca_student_survey_draft_v1";

const EXAM_OPTIONS = [
  "JAMB",
  "WAEC",
  "NECO",
  "GCE",
  "More than one of the above",
];

const SUBJECT_LIST = [
  "English Language",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Government",
  "Civic Education",
  "History",
  "Financial Accounting",
  "Commerce",
  "Marketing",
  "Office Practice",
  "Store Management",
  "Data Processing",
  "Health Education",
  "Other",
];

const DURATION_OPTIONS = [
  "Less than 1 month",
  "1–3 months",
  "3–6 months",
  "More than 6 months",
];

const EASE_OPTIONS = [
  "Very easy",
  "Easy",
  "Neutral",
  "Difficult",
  "Very difficult",
];

const IMPROVE_AREAS = [
  "Live classes",
  "Tutor quality",
  "Class scheduling",
  "Communication & announcements",
  "Study materials",
  "Past questions",
  "CBT practice",
  "Performance tracking",
  "Platform navigation",
  "Website/mobile experience",
  "Course content",
  "Recorded classes",
  "Customer & student support",
  "Response time to students",
  "Internet & technical experience",
  "Other",
];

const COURSES_AWARENESS_OPTIONS = [
  "Yes, I have used it",
  "Yes, but I have not used it yet",
  "No, I didn't know about it",
];

const COURSES_REASONS = [
  "To revise what I learned in live classes",
  "To study when I miss a live class",
  "To learn at my own pace",
  "To prepare before an examination",
  "To revisit difficult topics",
  "To study at a convenient time",
  "To understand topics better",
  "Other",
];

const VIDEO_FORMATS = [
  {
    id: "tutor",
    title: "Tutor Teaching on Camera",
    desc: "A tutor appears on screen and teaches the lesson directly, simulating a real classroom.",
    icon: "👨‍🏫",
  },
  {
    id: "animated",
    title: "Animated Videos",
    desc: "The lesson is explained with 2D/3D motion graphics, character animations, visual analogies, and effects.",
    icon: "🎬",
  },
  {
    id: "illustration",
    title: "Illustration / Whiteboard Style",
    desc: "Dynamic handwriting, whiteboard sketches, diagrams, flowcharts, and high-clarity voice narration.",
    icon: "✏️",
  },
  {
    id: "slides",
    title: "Slides with Voice Explanation",
    desc: "Structured presentation slides, key concept bullet points, formulas, diagrams, and tutor voiceover.",
    icon: "📊",
  },
  {
    id: "hybrid",
    title: "Hybrid (Combination of Styles)",
    desc: "A powerful mixture: tutor introducing concepts, switching to animations/illustrations for tough topics.",
    icon: "🔄",
  },
];

const VIDEO_LENGTHS = [
  "5–10 minutes",
  "10–15 minutes",
  "15–20 minutes",
  "20–30 minutes",
  "30–45 minutes",
  "More than 45 minutes",
];

const UNDERSTANDING_AIDS = [
  "Tutor explanation",
  "Animations",
  "Diagrams & illustrations",
  "Real-life examples",
  "Worked examples step-by-step",
  "Practice questions",
  "Past examination questions",
  "Text / notes on screen",
  "Quizzes after each lesson",
  "Demonstrations",
  "Combination of these",
];

const COURSE_CONTENTS = [
  "Video lessons",
  "Course notes",
  "Downloadable study materials (PDF)",
  "Past questions",
  "Detailed solutions",
  "Practice questions",
  "Topic-based CBT tests",
  "Quizzes",
  "Assignments",
  "Progress tracking",
  "Revision tests",
  "Tutor explanations",
  "Exam tips",
  "Summary / revision videos",
];

const NEXT_STEPS = [
  "Take a short quiz",
  "Practise questions on the topic",
  "Attempt past questions",
  "Read the lesson notes",
  "Move directly to the next lesson",
  "Review the video again",
];

const STUDY_TIMES = [
  "Morning (6:00 AM – 12:00 PM)",
  "Afternoon (12:00 PM – 5:00 PM)",
  "Evening (5:00 PM – 9:00 PM)",
  "Late night (9:00 PM onwards)",
  "Flexible / No specific time",
];

const DEVICES = [
  "Smartphone (Android / iPhone)",
  "Tablet / iPad",
  "Laptop",
  "Desktop computer",
  "More than one device",
];



export default function StudentSurvey() {
  const { token, student } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);
  const [submissionDate, setSubmissionDate] = useState(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: About You & Overall
    full_name: "",
    exam_target: "",
    subjects_taken: [],
    usage_duration: "",
    overall_rating: 0,
    live_classes_rating: 0,
    tutors_rating: 0,
    study_materials_rating: 0,
    cbt_rating: 0,
    platform_rating: 0,
    navigation_ease: "",
    q12_likes_most: "",

    // Step 2: Improvements & Issues
    q13_improve_areas: [],
    q14_one_thing_improve: "",
    q15_had_problem: "",
    q16_problem_details: "",
    q17_better_experience: "",

    // Step 3: Courses & Video Formats
    courses_awareness: "",
    courses_utility_rating: 0,
    q20_courses_reasons: [],
    preferred_video_format: "",
    q23_format_reason: "",

    // Step 4: Video Length & Materials
    preferred_video_length: "",
    q25_smaller_videos: "",
    q26_best_understanding: [],
    q27_short_quizzes: "",
    q28_past_questions: "",
    q29_captions: "",
    q30_playback_speed: "",
    q31_course_contents: [],
    q32_next_step: "",
    q33_study_time: "",
    q34_device: "",
    q35_release_freq: "",

    // Step 5: Suggestions & NPS
    q36_new_feature: "",
    q37_wish_had: "",
    q38_change_one_thing: "",
    q39_anything_else: "",
    nps_score: null,
    q41_nps_reason: "",
    wants_followup: false,
    whatsapp_number: "",
  });

  // Pre-fill user data and check submission status
  useEffect(() => {
    // Check local storage for draft
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Could not load survey draft:", e);
    }

    if (student) {
      setFormData((prev) => ({
        ...prev,
        full_name:
          prev.full_name ||
          `${student.firstname || ""} ${student.surname || ""}`.trim(),
        whatsapp_number: prev.whatsapp_number || student.phone || "",
      }));
    }

    // Check backend status
    const checkSurveyStatus = async () => {
      if (!token) {
        setCheckingStatus(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/students/survey/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.has_submitted) {
          setHasSubmittedBefore(true);
          setSubmissionDate(res.data?.submitted_at);
        }
      } catch (err) {
        console.error("Survey status check failed:", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkSurveyStatus();
  }, [token, student, API_BASE_URL]);

  // Auto-save draft to local storage on change
  useEffect(() => {
    if (!submittedSuccess) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (e) {
        // quota exceeded or private mode
      }
    }
  }, [formData, submittedSuccess]);

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const handleNext = () => {
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        survey_type: "learning_experience_v1",
        full_name: formData.full_name,
        exam_target: formData.exam_target,
        subjects_taken: formData.subjects_taken,
        usage_duration: formData.usage_duration,
        overall_rating: formData.overall_rating || null,
        live_classes_rating: formData.live_classes_rating || null,
        tutors_rating: formData.tutors_rating || null,
        study_materials_rating: formData.study_materials_rating || null,
        cbt_rating: formData.cbt_rating || null,
        platform_rating: formData.platform_rating || null,
        navigation_ease: formData.navigation_ease,
        courses_awareness: formData.courses_awareness,
        courses_utility_rating: formData.courses_utility_rating || null,
        preferred_video_format: formData.preferred_video_format,
        preferred_video_length: formData.preferred_video_length,
        nps_score: formData.nps_score,
        wants_followup: formData.wants_followup,
        whatsapp_number: formData.whatsapp_number,
        responses: formData,
      };

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // First try authenticated submission (if token available)
      try {
        await axios.post(`${API_BASE_URL}/api/students/survey/submit`, payload, {
          headers,
        });
      } catch (firstErr) {
        // If an authenticated submission fails due to server/database constraint mismatch with the token,
        // retry anonymously so the student's submission is never rejected.
        if (token && (!firstErr.response || firstErr.response.status >= 500)) {
          console.warn("Survey authenticated submit failed; retrying anonymously as fallback...", firstErr);
          await axios.post(`${API_BASE_URL}/api/students/survey/submit`, payload);
        } else {
          throw firstErr;
        }
      }

      // Clear draft
      localStorage.removeItem(STORAGE_KEY);
      // Bust achievements cache so achievement badges & counters update instantly across app
      try {
        localStorage.removeItem("tc_student_achievements_summary");
      } catch (cacheErr) {
        // ignore storage errors
      }
      setSubmittedSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Survey submission failed:", err);
      const rawMsg = err.response?.data?.message || "";

      // Sanitize: never leak raw SQL, database dumps, or backend exceptions to students
      const isTechnicalOrSql =
        !rawMsg ||
        /SQLSTATE|QueryException|syntax error|insert into|constraint|foreign key|PDOException|values \(/i.test(
          rawMsg
        );

      const friendlyMsg = isTechnicalOrSql
        ? "We couldn't save your feedback right now due to a temporary server connection issue. Your answers have been preserved as a draft — please try clicking Submit again in a moment."
        : rawMsg;

      setError(friendlyMsg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // Helper for 1-5 Star / Pill rating
  const renderRatingBar = (field, currentVal, label) => {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>{label}</span>
          <span className="text-[#C5A97A] font-bold">
            {currentVal > 0 ? `${currentVal} / 5` : "Not rated"}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = currentVal >= star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => updateField(field, star)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                  isSelected
                    ? "bg-[#0F2843] dark:bg-[#C5A97A] text-white dark:text-[#0F2843] border-transparent shadow-sm"
                    : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300"
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    isSelected ? "fill-current" : "stroke-current fill-none"
                  }`}
                />
                <span>{star}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 px-1">
          <span>1 = Very Poor / Dissatisfied</span>
          <span>5 = Excellent / Highly Satisfied</span>
        </div>
      </div>
    );
  };

  if (checkingStatus) {
    return (
      <DashboardLayout pagetitle="Student Feedback Survey" hideRightPanel>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C5A97A]"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Already submitted state
  if (hasSubmittedBefore && !submittedSuccess) {
    return (
      <DashboardLayout pagetitle="Student Feedback Survey" hideRightPanel>
        <div className="max-w-2xl mx-auto py-10 px-4">
          <div className="relative overflow-hidden bg-gradient-to-b from-[#0c2236] to-[#082033] rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#C5A97A]/20 text-center space-y-7">
            {/* Glow orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16 w-64 h-64 bg-[#C5A97A]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A97A]/10 border border-[#C5A97A]/20 text-[#C5A97A] text-[11px] font-black tracking-wider uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Already Submitted
              </div>
            </div>

            <SurveyBadge studentName={student ? `${student.firstname || ""} ${student.surname || ""}`.trim() : ""} />

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Your Badge is Secured! 🏆
              </h2>
              <p className="text-sm text-gray-300 max-w-md mx-auto">
                You've already helped shape Tutorial Center Africa. Your responses
                are actively guiding our Courses feature and live classes.
              </p>
              {submissionDate && (
                <p className="text-xs text-[#C5A97A]/60 font-medium">
                  Submitted on: {new Date(submissionDate).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/student/achievements")}
                className="px-6 py-3 bg-gradient-to-r from-[#C5A97A] to-[#d8be8d] text-[#0F2843] rounded-2xl text-xs font-black hover:opacity-90 transition shadow-lg shadow-[#C5A97A]/20 flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-[#0F2843]" />
                View in My Achievements 🏆
              </button>
              <button
                onClick={() => navigate("/student/dashboard")}
                className="px-6 py-3 bg-white/10 text-gray-200 rounded-2xl text-xs font-bold hover:bg-white/20 transition flex items-center justify-center border border-white/10"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setHasSubmittedBefore(false)}
                className="px-6 py-3 bg-white/5 text-gray-300 rounded-2xl text-xs font-bold hover:bg-white/15 transition flex items-center justify-center gap-2 border border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
                Update / Retake
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  // Submitted success state
  if (submittedSuccess) {
    return (
      <DashboardLayout pagetitle="Survey Completed" hideRightPanel>
        <div className="max-w-2xl mx-auto py-10 px-4">
          <div className="relative overflow-hidden bg-gradient-to-b from-[#0c2236] to-[#082033] rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#C5A97A]/20 text-center space-y-7">
            {/* Confetti burst */}
            <Confetti active={submittedSuccess} />

            {/* Glow orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-20 w-72 h-72 bg-[#C5A97A]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Status pill */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[11px] font-black uppercase tracking-widest">
                <PartyPopper className="w-3.5 h-3.5" />
                Survey Complete!
              </span>
            </div>

            {/* Badge */}
            <SurveyBadge studentName={student ? `${student.firstname || ""} ${student.surname || ""}`.trim() : ""} />

            {/* Text block */}
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white">
                You've Earned Your Badge! 🎉
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed max-w-lg mx-auto">
                Your feedback directly shapes how we produce recorded video lessons,
                schedule masterclasses, and equip you for exam success.
              </p>
            </div>

            {/* Quote box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-[#C5A97A]/25 text-sm font-semibold text-[#C5A97A]">
              "Learn. Practise. Improve. Succeed."
              <div className="text-[10px] text-[#C5A97A]/50 font-normal mt-1">
                Tutorial Center Africa · Empowering Minds, Achieving Excellence
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/student/achievements")}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#C5A97A] to-[#d8be8d] text-[#0F2843] rounded-2xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-[#C5A97A]/25 flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-[#0F2843]" />
                View in My Achievements 🏆
              </button>
              <button
                onClick={() => navigate("/student/dashboard")}
                className="w-full sm:w-auto px-8 py-3.5 bg-white/10 text-white rounded-2xl text-xs font-bold hover:bg-white/20 transition flex items-center justify-center border border-white/10"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pagetitle="Student Feedback & Learning Experience Survey" hideRightPanel>
      <div className="max-w-3xl mx-auto py-6 px-4 space-y-6 pb-20">
        {/* HEADER HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2843] via-[#163a5f] to-[#0F2843] text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#C5A97A]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C5A97A] text-[11px] font-black tracking-wider uppercase backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your Voice Matters</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Student Feedback & Experience Survey
              </h1>
              <p className="text-xs text-gray-300 max-w-md">
                Help us improve live masterclasses and design our new recorded
                Courses feature to fit your exact learning style.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 self-start sm:self-auto">
              <Clock className="w-4 h-4 text-[#C5A97A]" />
              <div className="text-right">
                <div className="text-[10px] text-gray-300 font-medium">Estimated Time</div>
                <div className="text-xs font-black text-white">~3 to 4 Mins</div>
              </div>
            </div>
          </div>

          {/* STEP PROGRESS BAR */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-300">
              <span>
                Step {step} of {TOTAL_STEPS}:{" "}
                {step === 1 && "About You & Experience"}
                {step === 2 && "Platform Improvements"}
                {step === 3 && "Courses & Video Preferences"}
                {step === 4 && "Video Length & Content"}
                {step === 5 && "Recommendations & NPS"}
              </span>
              <span className="text-[#C5A97A] font-black">
                {Math.round((step / TOTAL_STEPS) * 100)}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#C5A97A] to-[#e6cf9f] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div
            id="survey-error-alert"
            className="p-4 sm:p-5 rounded-2xl bg-rose-50/95 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in"
          >
            <div className="flex items-start sm:items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 sm:mt-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-3 py-1.5 rounded-lg bg-rose-200/60 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/70 text-rose-900 dark:text-rose-100 text-xs font-bold transition shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-white/10 space-y-8">
          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 dark:border-white/10 pb-4">
                <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C5A97A]" />
                  Section 1: About You & Your Exams
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tell us a bit about what you are studying with us.
                </p>
              </div>

              {/* Q1: Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  1. What is your name? <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] transition"
                />
              </div>

              {/* Q2: Examination preparing for */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  2. What examination are you preparing for? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXAM_OPTIONS.map((exam) => (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => updateField("exam_target", exam)}
                      className={`p-3 rounded-2xl text-xs font-bold text-left border transition ${
                        formData.exam_target === exam
                          ? "bg-[#0F2843] text-white border-transparent dark:bg-[#C5A97A] dark:text-[#0F2843] shadow-sm"
                          : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300"
                      }`}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Subjects taking */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  3. Which subjects are you currently taking with Tutorial Center Africa?
                </label>
                <p className="text-[11px] text-gray-400">Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_LIST.map((subj) => {
                    const isSelected = formData.subjects_taken.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleArrayItem("subjects_taken", subj)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                          isSelected
                            ? "bg-[#C5A97A] text-[#0F2843] border-[#C5A97A] font-bold shadow-sm"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q4: Usage duration */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  4. How long have you been using Tutorial Center Africa?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DURATION_OPTIONS.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => updateField("usage_duration", dur)}
                      className={`p-3 rounded-2xl text-xs font-semibold text-center border transition ${
                        formData.usage_duration === dur
                          ? "bg-[#0F2843] text-white border-transparent dark:bg-[#C5A97A] dark:text-[#0F2843]"
                          : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2: RATINGS */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-4">
                <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#C5A97A]" />
                  Section 2: Your Experience Ratings
                </h3>

                {renderRatingBar("overall_rating", formData.overall_rating, "5. Overall Experience with Tutorial Center Africa")}
                {renderRatingBar("live_classes_rating", formData.live_classes_rating, "6. Satisfaction with Live Masterclasses")}
                {renderRatingBar("tutors_rating", formData.tutors_rating, "7. Satisfaction with our Tutors")}
                {renderRatingBar("study_materials_rating", formData.study_materials_rating, "8. Satisfaction with Study Materials")}
                {renderRatingBar("cbt_rating", formData.cbt_rating, "9. Satisfaction with CBT / Exam Practice")}
                {renderRatingBar("platform_rating", formData.platform_rating, "10. Satisfaction with the Learning Platform")}
              </div>

              {/* Q11: Navigation Ease */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  11. How easy is it for you to navigate the platform?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {EASE_OPTIONS.map((ease) => (
                    <button
                      key={ease}
                      type="button"
                      onClick={() => updateField("navigation_ease", ease)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition ${
                        formData.navigation_ease === ease
                          ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] border-transparent"
                          : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
                      }`}
                    >
                      {ease}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q12: Likes most */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  12. What do you like most about Tutorial Center Africa?
                </label>
                <textarea
                  rows={3}
                  placeholder="Share what has helped you most in your studies..."
                  value={formData.q12_likes_most}
                  onChange={(e) => updateField("q12_likes_most", e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] transition"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 dark:border-white/10 pb-4">
                <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#C5A97A]" />
                  Section 3: What Should We Improve?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Be frank and direct. Your feedback helps us fix bugs and elevate your experience.
                </p>
              </div>

              {/* Q13: Areas of improvement */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  13. What areas do you think Tutorial Center Africa should improve?
                </label>
                <p className="text-[11px] text-gray-400">Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {IMPROVE_AREAS.map((area) => {
                    const isSelected = formData.q13_improve_areas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArrayItem("q13_improve_areas", area)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                          isSelected
                            ? "bg-amber-500 text-white border-amber-500 font-bold shadow-sm"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q14: ONE Thing */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  14. What is the ONE thing you would most like us to improve? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="If you could only change or upgrade one single thing, what would it be?"
                  value={formData.q14_one_thing_improve}
                  onChange={(e) => updateField("q14_one_thing_improve", e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] transition"
                />
              </div>

              {/* Q15: Had problem? */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  15. Have you experienced any problem while using Tutorial Center Africa?
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {["Yes", "No"].map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => updateField("q15_had_problem", choice)}
                      className={`p-3 rounded-2xl text-xs font-bold border transition ${
                        formData.q15_had_problem === choice
                          ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] border-transparent"
                          : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q16: Problem description if Yes */}
              {formData.q15_had_problem === "Yes" && (
                <div className="space-y-1.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 animate-fade-in">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
                    16. Please describe the problem you experienced:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what went wrong (e.g. video loading, payment, audio, schedule conflict)..."
                    value={formData.q16_problem_details}
                    onChange={(e) => updateField("q16_problem_details", e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-white dark:bg-[#09314F] border border-amber-200 dark:border-amber-900/50 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 transition"
                  />
                </div>
              )}

              {/* Q17: What would make experience better */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  17. What would make your learning experience even better?
                </label>
                <textarea
                  rows={3}
                  placeholder="Share any ideas you have for our classes, tutors, or platform..."
                  value={formData.q17_better_experience}
                  onChange={(e) => updateField("q17_better_experience", e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] transition"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 dark:border-white/10 pb-4">
                <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#C5A97A]" />
                  Sections 4 & 5: New Courses & Video Preferences
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This helps our media production team choose the exact video format for your recorded lessons.
                </p>
              </div>

              {/* Q18: Courses awareness */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  18. Did you know that Tutorial Center Africa now has a Courses section where you can access recorded lessons?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {COURSES_AWARENESS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("courses_awareness", opt)}
                      className={`p-3 rounded-2xl text-xs font-semibold text-center border transition ${
                        formData.courses_awareness === opt
                          ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] border-transparent"
                          : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q19: Utility of recorded lessons */}
              {renderRatingBar(
                "courses_utility_rating",
                formData.courses_utility_rating,
                "19. How useful do you think recorded lessons will be to you? (1 = Not useful, 5 = Extremely useful)"
              )}

              {/* Q20: Why would you use recorded lessons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  20. Why would you use recorded lessons?
                </label>
                <p className="text-[11px] text-gray-400">Select all that apply</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COURSES_REASONS.map((reason) => {
                    const isSelected = formData.q20_courses_reasons.includes(reason);
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => toggleArrayItem("q20_courses_reasons", reason)}
                        className={`p-3 rounded-xl text-xs text-left font-medium border transition ${
                          isSelected
                            ? "bg-[#C5A97A]/20 border-[#C5A97A] text-[#0F2843] dark:text-[#C5A97A] font-bold"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{reason}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q21 & 22: VIDEO FORMAT PREFERENCE (KEY QUESTION) */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                <div>
                  <label className="block text-sm font-black text-[#0F2843] dark:text-white">
                    21 & 22. If you could choose ONE format for most of your recorded classes, which would you pick? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Click the style that helps you understand concepts quickest:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {VIDEO_FORMATS.map((fmt) => {
                    const isSelected = formData.preferred_video_format === fmt.title;
                    return (
                      <div
                        key={fmt.id}
                        onClick={() => updateField("preferred_video_format", fmt.title)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                          isSelected
                            ? "border-[#C5A97A] bg-[#C5A97A]/10 dark:bg-[#C5A97A]/15 shadow-md"
                            : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl p-2 rounded-xl bg-white dark:bg-white/10 shadow-sm flex-shrink-0">
                          {fmt.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs sm:text-sm font-black text-[#0F2843] dark:text-white">
                              {fmt.title}
                            </h4>
                            {isSelected && (
                              <span className="text-xs font-bold text-[#C5A97A] flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 leading-relaxed">
                            {fmt.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Q23: Reason for preference */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  23. Why do you prefer this video format? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Real tutor keeps me focused, or animations help me picture biology cells, etc."
                  value={formData.q23_format_reason}
                  onChange={(e) => updateField("q23_format_reason", e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] transition"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 4 ================= */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 dark:border-white/10 pb-4">
                <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                  <PlaySquare className="w-5 h-5 text-[#C5A97A]" />
                  Sections 6, 7 & 8: Video Length & Study Preferences
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  How long should lessons be, and what study materials do you need inside?
                </p>
              </div>

              {/* Q24: Video length */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  24. What video length do you prefer for one lesson? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VIDEO_LENGTHS.map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => updateField("preferred_video_length", len)}
                      className={`p-3 rounded-2xl text-xs font-bold border transition ${
                        formData.preferred_video_length === len
                          ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] border-transparent shadow-sm"
                          : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q25: Divide long lessons? */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  25. Would you prefer a long lesson to be divided into smaller bite-sized videos?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Yes", "No", "I'm not sure"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("q25_smaller_videos", opt)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition ${
                        formData.q25_smaller_videos === opt
                          ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] border-transparent"
                          : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q26: What helps understanding best */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  26. What helps you understand a lesson best?
                </label>
                <p className="text-[11px] text-gray-400">Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {UNDERSTANDING_AIDS.map((aid) => {
                    const isSelected = formData.q26_best_understanding.includes(aid);
                    return (
                      <button
                        key={aid}
                        type="button"
                        onClick={() => toggleArrayItem("q26_best_understanding", aid)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                          isSelected
                            ? "bg-[#0F2843] text-white border-transparent font-bold"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{aid}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q27, Q28, Q29, Q30 Quick Checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                    27. Short quizzes after each topic?
                  </label>
                  <div className="flex gap-2">
                    {["Yes", "No", "Maybe"].map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => updateField("q27_short_quizzes", o)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          formData.q27_short_quizzes === o
                            ? "bg-[#C5A97A] text-[#0F2843] border-[#C5A97A]"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                    28. Include past examination questions?
                  </label>
                  <div className="flex gap-2">
                    {["Yes, definitely", "Sometimes", "Not necessary"].map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => updateField("q28_past_questions", o)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          formData.q28_past_questions === o
                            ? "bg-[#C5A97A] text-[#0F2843] border-[#C5A97A]"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                    29. Subtitles / captions on recorded lessons?
                  </label>
                  <div className="flex gap-2">
                    {["Yes", "No", "Not important"].map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => updateField("q29_captions", o)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          formData.q29_captions === o
                            ? "bg-[#0F2843] text-white border-transparent"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                    30. Adjustable video playback speed (1.25x, 1.5x)?
                  </label>
                  <div className="flex gap-2">
                    {["Yes", "No", "Not important"].map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => updateField("q30_playback_speed", o)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          formData.q30_playback_speed === o
                            ? "bg-[#0F2843] text-white border-transparent"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Q31: What should be inside each course */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  31. What would you like to see inside each course?
                </label>
                <p className="text-[11px] text-gray-400">Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {COURSE_CONTENTS.map((item) => {
                    const isSelected = formData.q31_course_contents.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleArrayItem("q31_course_contents", item)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                          isSelected
                            ? "bg-[#C5A97A] text-[#0F2843] border-[#C5A97A] font-bold"
                            : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q32: Next step after watching */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  32. After watching a recorded lesson, what would you most like to do next?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NEXT_STEPS.map((stepItem) => (
                    <button
                      key={stepItem}
                      type="button"
                      onClick={() => updateField("q32_next_step", stepItem)}
                      className={`p-3 rounded-xl text-xs font-semibold text-left border transition ${
                        formData.q32_next_step === stepItem
                          ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] border-transparent"
                          : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
                      }`}
                    >
                      {stepItem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Times & Devices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                    33. When do you normally prefer to study?
                  </label>
                  <select
                    value={formData.q33_study_time}
                    onChange={(e) => updateField("q33_study_time", e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none"
                  >
                    <option value="">Select preferred study time</option>
                    {STUDY_TIMES.map((t) => (
                      <option key={t} value={t} className="text-gray-900">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                    34. Device normally used to access TCA?
                  </label>
                  <select
                    value={formData.q34_device}
                    onChange={(e) => updateField("q34_device", e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none"
                  >
                    <option value="">Select your device</option>
                    {DEVICES.map((d) => (
                      <option key={d} value={d} className="text-gray-900">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5 ================= */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 dark:border-white/10 pb-4">
                <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-[#C5A97A]" />
                  Sections 9, 10 & 11: Suggestions & Final Rating
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Almost done! Share your wishlist features and your overall recommendation score.
                </p>
              </div>

              {/* Q36: New feature */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  36. What new feature would you like Tutorial Center Africa to introduce?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flashcards, AI tutor chatbot, offline download, voice notes..."
                  value={formData.q36_new_feature}
                  onChange={(e) => updateField("q36_new_feature", e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] transition"
                />
              </div>

              {/* Q37: Wish had */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  37. What is ONE thing you wish TCA had that it currently doesn't?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily practice reminders, peer study groups..."
                  value={formData.q37_wish_had}
                  onChange={(e) => updateField("q37_wish_had", e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] transition"
                />
              </div>

              {/* Q40: NET PROMOTER SCORE (NPS: 0 to 10) */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs sm:text-sm font-black text-[#0F2843] dark:text-white">
                    40. How likely are you to recommend Tutorial Center Africa to another student? <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#C5A97A]/20 text-[#0F2843] dark:text-[#C5A97A]">
                    {formData.nps_score !== null ? `${formData.nps_score} / 10` : "Select a score"}
                  </span>
                </div>

                <div className="grid grid-cols-11 gap-1 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = formData.nps_score === num;
                    let badgeColor = "hover:border-gray-300";
                    if (isSelected) {
                      if (num >= 9) badgeColor = "bg-emerald-600 text-white border-emerald-600 shadow-md";
                      else if (num >= 7) badgeColor = "bg-amber-500 text-white border-amber-500 shadow-md";
                      else badgeColor = "bg-rose-600 text-white border-rose-600 shadow-md";
                    }

                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updateField("nps_score", num)}
                        className={`h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center border transition-all ${
                          isSelected
                            ? badgeColor
                            : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-gray-400 font-semibold px-1">
                  <span>0 = Not likely at all</span>
                  <span>10 = Extremely likely</span>
                </div>
              </div>

              {/* Q41: NPS Reason */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  41. Why did you give us this rating?
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us what influenced your recommendation score..."
                  value={formData.q41_nps_reason}
                  onChange={(e) => updateField("q41_nps_reason", e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] transition"
                />
              </div>

              {/* SECTION 11: OPTIONAL CONTACT */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0F2843] dark:text-[#C5A97A] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  Follow-up Permission (Optional)
                </h4>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="wants_followup"
                    checked={formData.wants_followup}
                    onChange={(e) => updateField("wants_followup", e.target.checked)}
                    className="w-4 h-4 rounded text-[#0F2843] focus:ring-[#C5A97A]"
                  />
                  <label
                    htmlFor="wants_followup"
                    className="text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer"
                  >
                    42. Yes, a member of the Tutorial Center Africa team may contact me about my feedback.
                  </label>
                </div>

                {formData.wants_followup && (
                  <div className="space-y-1.5 animate-fade-in pl-7">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                      43. WhatsApp Phone Number:
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +234 801 234 5678"
                      value={formData.whatsapp_number}
                      onChange={(e) => updateField("whatsapp_number", e.target.value)}
                      className="w-full max-w-sm px-4 py-2.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM CONTROLS / STEPPER BUTTONS */}
          <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-2xl bg-[#0F2843] dark:bg-[#C5A97A] text-white dark:text-[#0F2843] font-black text-xs hover:opacity-90 transition flex items-center gap-1.5 shadow-md"
              >
                Next Section
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Submit Feedback</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
