import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { useStaffAuth } from "../../../context/StaffAuthContext";
import {
  Users,
  Award,
  Video,
  Download,
  RefreshCw,
  Search,
  X,
  Eye,
  Star,
  HeartHandshake,
  PlaySquare,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Phone,
  ExternalLink,
  FileText,
  Check,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

// Survey Sections for Tabbed Navigation in Staff Review
const SURVEY_SECTIONS = [
  { id: "all", label: "All Questions", icon: FileText },
  { id: "demographics", label: "Demographics", icon: Award },
  { id: "ratings", label: "Experience Ratings", icon: Star },
  { id: "improvements", label: "Improvements & Issues", icon: AlertTriangle },
  { id: "video_formats", label: "Video Formats", icon: Video },
  { id: "video_features", label: "Length & Content", icon: PlaySquare },
  { id: "nps_suggestions", label: "Wishlist & NPS", icon: ThumbsUp },
];

// Full Question Schema with Human-Readable Prompts
const SURVEY_QUESTION_SCHEMA = [
  // SECTION 1: Demographics & Target Exam
  {
    id: "full_name",
    section: "demographics",
    number: "1",
    category: "Student Profile",
    question: "1. What is your full name?",
    type: "text",
  },
  {
    id: "exam_target",
    section: "demographics",
    number: "2",
    category: "Target Examination",
    question: "2. What examination are you preparing for?",
    type: "badge",
  },
  {
    id: "subjects_taken",
    section: "demographics",
    number: "3",
    category: "Enrolled Subjects",
    question: "3. Which subjects are you currently taking with Tutorial Center Africa?",
    type: "tags",
  },
  {
    id: "usage_duration",
    section: "demographics",
    number: "4",
    category: "Student Tenure",
    question: "4. How long have you been using Tutorial Center Africa?",
    type: "badge",
  },

  // SECTION 2: Platform Experience Ratings (1 to 5 Stars)
  {
    id: "overall_rating",
    section: "ratings",
    number: "5",
    category: "Platform Experience",
    question: "5. Overall Experience with Tutorial Center Africa",
    type: "rating",
    highlight: true,
  },
  {
    id: "live_classes_rating",
    section: "ratings",
    number: "6",
    category: "Live Classes",
    question: "6. Satisfaction with Live Masterclasses",
    type: "rating",
  },
  {
    id: "tutors_rating",
    section: "ratings",
    number: "7",
    category: "Faculty & Tutors",
    question: "7. Satisfaction with our Tutors",
    type: "rating",
  },
  {
    id: "study_materials_rating",
    section: "ratings",
    number: "8",
    category: "Study Materials",
    question: "8. Satisfaction with Study Materials & Handouts",
    type: "rating",
  },
  {
    id: "cbt_rating",
    section: "ratings",
    number: "9",
    category: "Exam Simulation",
    question: "9. Satisfaction with CBT / Practice Exams",
    type: "rating",
  },
  {
    id: "platform_rating",
    section: "ratings",
    number: "10",
    category: "Portal Usability",
    question: "10. Satisfaction with the Learning Platform",
    type: "rating",
  },
  {
    id: "navigation_ease",
    section: "ratings",
    number: "11",
    category: "Platform Navigation",
    question: "11. How easy is it for you to navigate the platform?",
    type: "badge",
  },
  {
    id: "q12_likes_most",
    section: "ratings",
    number: "12",
    category: "Biggest Value",
    question: "12. What do you like most about Tutorial Center Africa?",
    type: "quote",
    highlight: true,
  },

  // SECTION 3: Improvements & Issues
  {
    id: "q13_improve_areas",
    section: "improvements",
    number: "13",
    category: "Priority Areas",
    question: "13. What areas do you think Tutorial Center Africa should improve?",
    type: "tags",
  },
  {
    id: "q14_one_thing_improve",
    section: "improvements",
    number: "14",
    category: "Top Improvement",
    question: "14. What is the ONE thing you would most like us to improve?",
    type: "quote",
    highlight: true,
  },
  {
    id: "q15_had_problem",
    section: "improvements",
    number: "15",
    category: "Issue Occurrence",
    question: "15. Have you experienced any problem while using Tutorial Center Africa?",
    type: "boolean",
  },
  {
    id: "q16_problem_details",
    section: "improvements",
    number: "16",
    category: "Issue Details",
    question: "16. Please describe the problem you experienced:",
    type: "problem_alert",
    highlight: true,
  },
  {
    id: "q17_better_experience",
    section: "improvements",
    number: "17",
    category: "Student Suggestions",
    question: "17. What would make your learning experience even better?",
    type: "quote",
  },

  // SECTION 4: Courses & Video Formats
  {
    id: "courses_awareness",
    section: "video_formats",
    number: "18",
    category: "Feature Awareness",
    question: "18. Did you know Tutorial Center Africa now has a Courses section for recorded lessons?",
    type: "badge",
  },
  {
    id: "courses_utility_rating",
    section: "video_formats",
    number: "19",
    category: "Recorded Lesson Utility",
    question: "19. How useful do you think recorded lessons will be to you?",
    type: "rating",
  },
  {
    id: "q20_courses_reasons",
    section: "video_formats",
    number: "20",
    category: "Use Cases",
    question: "20. Why would you use recorded lessons?",
    type: "tags",
  },
  {
    id: "preferred_video_format",
    section: "video_formats",
    number: "21 & 22",
    category: "Preferred Format",
    question: "21 & 22. If you could choose ONE format for most of your recorded classes, which would you pick?",
    type: "badge",
    highlight: true,
  },
  {
    id: "q23_format_reason",
    section: "video_formats",
    number: "23",
    category: "Format Rationale",
    question: "23. Why do you prefer this video format?",
    type: "quote",
    highlight: true,
  },

  // SECTION 5: Video Length & Study Preferences
  {
    id: "preferred_video_length",
    section: "video_features",
    number: "24",
    category: "Lesson Length",
    question: "24. What video length do you prefer for one lesson?",
    type: "badge",
  },
  {
    id: "q25_smaller_videos",
    section: "video_features",
    number: "25",
    category: "Lesson Splitting",
    question: "25. Would you prefer a long lesson to be divided into smaller bite-sized videos?",
    type: "badge",
  },
  {
    id: "q26_best_understanding",
    section: "video_features",
    number: "26",
    category: "Comprehension Aids",
    question: "26. What helps you understand a lesson best?",
    type: "tags",
  },
  {
    id: "q27_short_quizzes",
    section: "video_features",
    number: "27",
    category: "Topic Quizzes",
    question: "27. Would you like short quizzes after each topic?",
    type: "badge",
  },
  {
    id: "q28_past_questions",
    section: "video_features",
    number: "28",
    category: "Exam Questions",
    question: "28. Include past examination questions in lessons?",
    type: "badge",
  },
  {
    id: "q29_captions",
    section: "video_features",
    number: "29",
    category: "Subtitles",
    question: "29. Subtitles / captions on recorded lessons?",
    type: "badge",
  },
  {
    id: "q30_playback_speed",
    section: "video_features",
    number: "30",
    category: "Playback Speed",
    question: "30. Adjustable video playback speed (1.25x, 1.5x)?",
    type: "badge",
  },
  {
    id: "q31_course_contents",
    section: "video_features",
    number: "31",
    category: "Course Inclusions",
    question: "31. What would you like to see inside each course?",
    type: "tags",
  },
  {
    id: "q32_next_step",
    section: "video_features",
    number: "32",
    category: "Post-Lesson Activity",
    question: "32. After watching a recorded lesson, what would you most like to do next?",
    type: "badge",
  },
  {
    id: "q33_study_time",
    section: "video_features",
    number: "33",
    category: "Study Routine",
    question: "33. When do you normally prefer to study?",
    type: "badge",
  },
  {
    id: "q34_device",
    section: "video_features",
    number: "34",
    category: "Primary Device",
    question: "34. Device normally used to access Tutorial Center Africa?",
    type: "badge",
  },
  {
    id: "q35_release_freq",
    section: "video_features",
    number: "35",
    category: "Lesson Frequency",
    question: "35. How often should new lessons be released?",
    type: "badge",
  },

  // SECTION 6: Suggestions, NPS & Contact
  {
    id: "q36_new_feature",
    section: "nps_suggestions",
    number: "36",
    category: "Feature Wishlist",
    question: "36. What new feature would you like Tutorial Center Africa to introduce?",
    type: "quote",
  },
  {
    id: "q37_wish_had",
    section: "nps_suggestions",
    number: "37",
    category: "Missing Capabilities",
    question: "37. What is ONE thing you wish TCA had that it currently doesn't?",
    type: "quote",
  },
  {
    id: "q38_change_one_thing",
    section: "nps_suggestions",
    number: "38",
    category: "Platform Change",
    question: "38. If you could change one thing across Tutorial Center Africa, what would it be?",
    type: "quote",
  },
  {
    id: "q39_anything_else",
    section: "nps_suggestions",
    number: "39",
    category: "Additional Feedback",
    question: "39. Anything else you would like to share with the team?",
    type: "quote",
  },
  {
    id: "nps_score",
    section: "nps_suggestions",
    number: "40",
    category: "Net Promoter Score",
    question: "40. How likely are you to recommend Tutorial Center Africa to another student?",
    type: "nps",
    highlight: true,
  },
  {
    id: "q41_nps_reason",
    section: "nps_suggestions",
    number: "41",
    category: "NPS Explanation",
    question: "41. Why did you give us this recommendation score?",
    type: "quote",
    highlight: true,
  },
  {
    id: "wants_followup",
    section: "nps_suggestions",
    number: "42",
    category: "Follow-up Permission",
    question: "42. May a member of the Tutorial Center Africa team contact you about your feedback?",
    type: "boolean",
  },
  {
    id: "whatsapp_number",
    section: "nps_suggestions",
    number: "43",
    category: "Contact Channel",
    question: "43. WhatsApp Phone Number for follow-up",
    type: "contact",
  },
];

const KNOWN_SURVEY_KEYS = new Set(SURVEY_QUESTION_SCHEMA.map((q) => q.id));
const SYSTEM_KEYS = new Set([
  "id",
  "student_id",
  "survey_type",
  "created_at",
  "updated_at",
  "student",
  "ip_address",
  "user_agent",
  "responses",
]);

// Safely extract answer whether stored in responses JSON or top-level model
function getSurveyAnswer(survey, key) {
  if (!survey) return undefined;
  let parsedResponses = survey.responses;
  if (typeof parsedResponses === "string") {
    try {
      parsedResponses = JSON.parse(parsedResponses);
    } catch (e) {
      parsedResponses = {};
    }
  }

  if (
    parsedResponses &&
    parsedResponses[key] !== undefined &&
    parsedResponses[key] !== null
  ) {
    return parsedResponses[key];
  }
  if (survey[key] !== undefined && survey[key] !== null) {
    return survey[key];
  }
  return undefined;
}

// Rich renderer for question responses based on question type
function renderAnswerValue(q, val) {
  const isBlank =
    val === undefined ||
    val === null ||
    val === "" ||
    (Array.isArray(val) && val.length === 0);

  if (isBlank) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-400 italic">
        Not provided by student
      </span>
    );
  }

  if (q.type === "rating") {
    const num = Number(val) || 0;
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= num
                  ? "text-[#C5A97A] fill-[#C5A97A]"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-black text-[#0F2843] dark:text-[#C5A97A]">
          {num} / 5
        </span>
        {num === 5 && (
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
            5 ★ Highly Satisfied
          </span>
        )}
        {num === 4 && (
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/50">
            4 ★ Satisfied
          </span>
        )}
        {num === 3 && (
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
            3 ★ Neutral
          </span>
        )}
        {num > 0 && num <= 2 && (
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
            {num} ★ Needs Improvement
          </span>
        )}
      </div>
    );
  }

  if (q.type === "nps") {
    const num = Number(val);
    let badgeClass =
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50";
    let npsRole = "Detractor (Score 0-6)";
    if (num >= 9) {
      badgeClass =
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50";
      npsRole = "Promoter (Score 9-10) 🌟";
    } else if (num >= 7) {
      badgeClass =
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50";
      npsRole = "Passive (Score 7-8)";
    }

    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className={`px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 ${badgeClass}`}
        >
          <span>Recommendation: {num} / 10</span>
        </div>
        <span className="text-xs font-bold text-[#0F2843] dark:text-white">
          • {npsRole}
        </span>
      </div>
    );
  }

  if (q.type === "tags") {
    const arr = Array.isArray(val) ? val : [val];
    return (
      <div className="flex flex-wrap gap-2">
        {arr.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-[#0F2843]/5 text-[#0F2843] dark:bg-[#C5A97A]/15 dark:text-[#C5A97A] border border-[#0F2843]/10 dark:border-[#C5A97A]/30"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C5A97A]" />
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  if (q.type === "quote") {
    return (
      <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-black/30 border-l-4 border-[#C5A97A] text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed italic">
        "{String(val)}"
      </div>
    );
  }

  if (q.type === "problem_alert") {
    return (
      <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border-l-4 border-rose-500 text-xs sm:text-sm text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
        "{String(val)}"
      </div>
    );
  }

  if (q.type === "boolean") {
    const isYes =
      val === true ||
      val === "Yes" ||
      val === "true" ||
      val === 1 ||
      val === "1";
    if (isYes) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Yes
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300 border border-gray-200 dark:border-white/10">
        <X className="w-3.5 h-3.5 text-gray-400" />
        No
      </span>
    );
  }

  if (q.type === "contact") {
    const cleanNumber = String(val).replace(/[^0-9+]/g, "");
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {String(val)}
        </span>
        <a
          href={`https://wa.me/${cleanNumber.replace("+", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chat on WhatsApp
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
        </a>
      </div>
    );
  }

  if (q.type === "badge") {
    return (
      <span className="inline-block px-3.5 py-1 rounded-xl text-xs font-bold bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] shadow-sm">
        {String(val)}
      </span>
    );
  }

  return (
    <span className="text-xs sm:text-sm font-semibold text-[#0F2843] dark:text-white">
      {String(val)}
    </span>
  );
}

export default function AdminSurveyAnalytics() {
  const { token, staffToken } = useStaffAuth() || {};
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Filters & Modal
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [activeModalSurvey, setActiveModalSurvey] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [modalActiveSection, setModalActiveSection] = useState("all");
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  const fetchSummary = useCallback(async (tokenOverride) => {
    const effectiveToken =
      tokenOverride ||
      token ||
      staffToken ||
      localStorage.getItem("staff_token");

    if (!effectiveToken) {
      setLoading(false);
      setError("Please log in to view survey analytics.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/surveys/summary`, {
        headers: { Authorization: `Bearer ${effectiveToken}` },
      });
      setData(res.data?.data || null);
    } catch (err) {
      console.error("Failed to load survey summary", err);
      setError(
        err.response?.data?.message ||
        "Failed to load survey analytics. Please verify permissions."
      );
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token, staffToken]);

  useEffect(() => {
    const effectiveToken =
      token ||
      staffToken ||
      localStorage.getItem("staff_token");

    if (effectiveToken) {
      fetchSummary(effectiveToken);
    } else {
      setLoading(false);
      setError("Please log in to view survey analytics.");
    }
  }, [token, staffToken, fetchSummary]);

  const handleExportCSV = async () => {
    const effectiveToken =
      token ||
      staffToken ||
      localStorage.getItem("staff_token");

    if (!effectiveToken) {
      alert("Authentication token not found.");
      return;
    }

    setExporting(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/surveys/export`, {
        headers: { Authorization: `Bearer ${effectiveToken}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `tutorialcenter_surveys_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export survey data.");
    } finally {
      setExporting(false);
    }
  };

  const openSurveyDetails = async (id) => {
    const effectiveToken =
      token ||
      staffToken ||
      localStorage.getItem("staff_token");

    if (!effectiveToken) return;

    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/surveys/${id}`, {
        headers: { Authorization: `Bearer ${effectiveToken}` },
      });
      setActiveModalSurvey(res.data?.data || null);
      setModalActiveSection("all");
      setModalSearchQuery("");
    } catch (err) {
      console.error("Failed to fetch survey details:", err);
      alert("Failed to fetch full survey details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filtered recent responses
  const filteredResponses = useMemo(() => {
    if (!data?.recent_responses) return [];
    return data.recent_responses.filter((r) => {
      const matchExam =
        selectedExam === "all" ||
        (r.exam_target && r.exam_target.toLowerCase().includes(selectedExam.toLowerCase()));

      const matchFormat =
        selectedFormat === "all" ||
        (r.preferred_video_format &&
          r.preferred_video_format.toLowerCase().includes(selectedFormat.toLowerCase()));

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (r.full_name && r.full_name.toLowerCase().includes(q)) ||
        (r.format_reason && r.format_reason.toLowerCase().includes(q)) ||
        (r.one_improvement && r.one_improvement.toLowerCase().includes(q)) ||
        (r.likes_most && r.likes_most.toLowerCase().includes(q));

      return matchExam && matchFormat && matchSearch;
    });
  }, [data, selectedExam, selectedFormat, searchQuery]);

  // Process modal responses and questions
  const unmappedQuestions = useMemo(() => {
    if (!activeModalSurvey) return [];
    let resp = activeModalSurvey.responses || {};
    if (typeof resp === "string") {
      try {
        resp = JSON.parse(resp);
      } catch (e) {
        resp = {};
      }
    }

    const extra = [];
    Object.entries(resp).forEach(([key, val]) => {
      if (
        !KNOWN_SURVEY_KEYS.has(key) &&
        !SYSTEM_KEYS.has(key) &&
        val !== null &&
        val !== undefined &&
        val !== "" &&
        !(Array.isArray(val) && val.length === 0)
      ) {
        const prettyLabel = key
          .replace(/^q\d+_/, "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        extra.push({
          id: key,
          section: "nps_suggestions",
          number: "Extra",
          category: "Additional Field",
          question: prettyLabel,
          type: Array.isArray(val) ? "tags" : typeof val === "object" ? "quote" : "text",
        });
      }
    });
    return extra;
  }, [activeModalSurvey]);

  const displayedQuestions = useMemo(() => {
    if (!activeModalSurvey) return [];
    let combined = [...SURVEY_QUESTION_SCHEMA, ...unmappedQuestions];

    if (modalActiveSection !== "all") {
      combined = combined.filter((q) => q.section === modalActiveSection);
    }

    if (modalSearchQuery.trim()) {
      const query = modalSearchQuery.toLowerCase();
      combined = combined.filter((q) => {
        const answerVal = getSurveyAnswer(activeModalSurvey, q.id);
        const answerStr =
          typeof answerVal === "object"
            ? JSON.stringify(answerVal)
            : String(answerVal || "");
        return (
          q.question.toLowerCase().includes(query) ||
          q.category.toLowerCase().includes(query) ||
          answerStr.toLowerCase().includes(query)
        );
      });
    }

    return combined;
  }, [activeModalSurvey, unmappedQuestions, modalActiveSection, modalSearchQuery]);

  const totalQuestionsCount = SURVEY_QUESTION_SCHEMA.length + unmappedQuestions.length;

  const answeredQuestionsCount = useMemo(() => {
    if (!activeModalSurvey) return 0;
    const combined = [...SURVEY_QUESTION_SCHEMA, ...unmappedQuestions];
    return combined.filter((q) => {
      const val = getSurveyAnswer(activeModalSurvey, q.id);
      return (
        val !== undefined &&
        val !== null &&
        val !== "" &&
        !(Array.isArray(val) && val.length === 0)
      );
    }).length;
  }, [activeModalSurvey, unmappedQuestions]);

  return (
    <StaffDashboardLayout>
      <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#C5A97A]/15 text-[#C5A97A] dark:text-[#d3be98] rounded-full text-xs font-black uppercase tracking-wider">
                Platform Intelligence
              </span>
              <span className="text-xs text-gray-400 font-medium">Real-time Data</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F2843] dark:text-white mt-1">
              Student Survey & Courses Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Actionable insights on live classes, tutors, and student preferences for the upcoming recorded Courses feature.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="p-2.5 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2 text-xs font-bold"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={exporting || loading}
              className="px-5 py-2.5 rounded-2xl bg-[#0F2843] text-white hover:bg-[#1a3e63] dark:bg-[#C5A97A] dark:text-[#0F2843] transition flex items-center gap-2 text-xs font-black shadow-md disabled:opacity-50"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* LOADING PLACEHOLDER */}
        {loading && !data ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C5A97A]" />
          </div>
        ) : (
          <>
            {/* KPI STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Total Responses */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Total Responses
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-[#0F2843]/5 dark:bg-white/10 flex items-center justify-center text-[#0F2843] dark:text-[#C5A97A]">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#0F2843] dark:text-white mt-4">
                  {data?.total_responses || 0}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Active student feedback submissions
                </p>
              </div>

              {/* Stat 2: NPS Score */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Net Promoter Score (NPS)
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-4">
                  <span
                    className={`text-3xl font-black ${
                      (data?.nps?.score || 0) >= 40
                        ? "text-emerald-600 dark:text-emerald-400"
                        : (data?.nps?.score || 0) >= 0
                        ? "text-amber-500"
                        : "text-rose-500"
                    }`}
                  >
                    {data?.nps?.score > 0 ? `+${data?.nps?.score}` : data?.nps?.score || 0}
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">
                    (Scale -100 to +100)
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-bold">
                  <span className="text-emerald-600">
                    {data?.nps?.promoters_pct || 0}% Promoters
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-rose-500">
                    {data?.nps?.detractors_pct || 0}% Detractors
                  </span>
                </div>
              </div>

              {/* Stat 3: Overall Platform Rating */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Avg Overall Rating
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-[#C5A97A]/15 flex items-center justify-center text-[#C5A97A]">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-3xl font-black text-[#0F2843] dark:text-white">
                    {data?.ratings?.overall || 0}
                  </span>
                  <span className="text-xs text-gray-400 font-bold">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        (data?.ratings?.overall || 0) >= s
                          ? "text-[#C5A97A] fill-current"
                          : "text-gray-200 dark:text-gray-700"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-gray-400 font-semibold ml-1">
                    Platform Satisfaction
                  </span>
                </div>
              </div>

              {/* Stat 4: Top Video Format */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    #1 Preferred Format
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Video className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-base font-black text-[#0F2843] dark:text-white truncate">
                    {data?.video_formats?.[0]?.format || "No responses yet"}
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                    {data?.video_formats?.[0]
                      ? `${data.video_formats[0].percentage}% of students`
                      : "Pending data"}
                  </p>
                </div>
              </div>
            </div>

            {/* DEEP DIVE SECTION: VIDEO FORMATS & RATINGS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* VIDEO FORMAT BREAKDOWN */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                    <PlaySquare className="w-5 h-5 text-[#C5A97A]" />
                    Preferred Video Formats for Courses
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Direct votes on what style to produce for recorded lessons
                  </p>
                </div>

                <div className="space-y-4">
                  {data?.video_formats?.length > 0 ? (
                    data.video_formats.map((fmt, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200">
                          <span className="truncate pr-2">{fmt.format}</span>
                          <span className="text-[#0F2843] dark:text-[#C5A97A] flex-shrink-0 font-black">
                            {fmt.count} ({fmt.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0
                                ? "bg-gradient-to-r from-[#C5A97A] to-[#e4cb9c]"
                                : idx === 1
                                ? "bg-gradient-to-r from-[#0F2843] to-[#204975] dark:from-white/60 dark:to-white/80"
                                : "bg-gray-400 dark:bg-gray-600"
                            }`}
                            style={{ width: `${fmt.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-400 font-medium">
                      No video format preferences recorded yet.
                    </div>
                  )}
                </div>

                {/* Video Lengths breakdown */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Preferred Lesson Video Length
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {data?.video_lengths?.map((len, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-center"
                      >
                        <div className="text-xs font-black text-[#0F2843] dark:text-white">
                          {len.length}
                        </div>
                        <div className="text-[10px] text-[#C5A97A] font-bold mt-0.5">
                          {len.percentage}% ({len.count})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RATINGS BREAKDOWN */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#C5A97A]" />
                    Satisfaction Ratings Across Features
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Student perception on key educational touchpoints (out of 5.0)
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Live Masterclasses", val: data?.ratings?.live_classes || 0 },
                    { label: "Tutors & Instructors", val: data?.ratings?.tutors || 0 },
                    { label: "Study Materials & Notes", val: data?.ratings?.study_materials || 0 },
                    { label: "CBT & Exam Practice", val: data?.ratings?.cbt || 0 },
                    { label: "Platform Usability & App", val: data?.ratings?.platform || 0 },
                    { label: "Anticipated Utility of Courses", val: data?.ratings?.courses_utility || 0 },
                  ].map((item, idx) => {
                    const pct = Math.round((item.val / 5) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200">
                          <span>{item.label}</span>
                          <span className="font-black text-[#0F2843] dark:text-[#C5A97A]">
                            {item.val} / 5.0
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.val >= 4.0
                                ? "bg-emerald-500"
                                : item.val >= 3.0
                                ? "bg-[#C5A97A]"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Exam Breakdown */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Respondents by Exam Target
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data?.exam_targets?.map((ex, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-[#0F2843]/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300"
                      >
                        {ex.exam}: <strong className="text-[#0F2843] dark:text-[#C5A97A]">{ex.count}</strong> ({ex.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT RESPONSES EXPLORER TABLE */}
            <div className="bg-white dark:bg-[#09314F] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden space-y-4 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-[#0F2843] dark:text-white">
                    Individual Student Responses & Feedback
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Click any student to view their complete 43-question submission and feedback rationale.
                  </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search name or comment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none w-48 sm:w-60"
                    />
                  </div>

                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="px-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none"
                  >
                    <option value="all">All Exams</option>
                    <option value="JAMB">JAMB</option>
                    <option value="WAEC">WAEC</option>
                    <option value="NECO">NECO</option>
                    <option value="GCE">GCE</option>
                  </select>

                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="px-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none"
                  >
                    <option value="all">All Formats</option>
                    <option value="Full syllabus">Full syllabus</option>
                    <option value="Topic-by-topic">Topic-by-topic</option>
                    <option value="Past questions">Past questions</option>
                    <option value="Crash course">Crash course</option>
                  </select>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 border-y border-gray-100 dark:border-white/10">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Exam Target</th>
                      <th className="py-3 px-4">Preferred Video Style</th>
                      <th className="py-3 px-4">Length</th>
                      <th className="py-3 px-4 text-center">Overall</th>
                      <th className="py-3 px-4 text-center">NPS</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10 font-medium">
                    {filteredResponses.length > 0 ? (
                      filteredResponses.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition"
                        >
                          <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            <div>{r.full_name}</div>
                            {r.wants_followup && r.whatsapp_number && (
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                WhatsApp: {r.whatsapp_number}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-[10px] font-bold">
                              {r.exam_target || "N/A"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#0F2843] dark:text-[#C5A97A] font-semibold">
                            {r.preferred_video_format || "N/A"}
                          </td>
                          <td className="py-3.5 px-4">{r.preferred_video_length || "N/A"}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-black text-[#C5A97A]">
                              {r.overall_rating ? `${r.overall_rating} ★` : "-"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {r.nps_score !== null ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${
                                  r.nps_score >= 9
                                    ? "bg-emerald-600"
                                    : r.nps_score >= 7
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                              >
                                {r.nps_score}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                            {r.created_at}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => openSurveyDetails(r.id)}
                              disabled={loadingDetail}
                              className="px-3 py-1.5 rounded-xl bg-[#0F2843]/5 dark:bg-white/10 hover:bg-[#0F2843] hover:text-white dark:hover:bg-[#C5A97A] dark:hover:text-[#0F2843] transition text-xs font-bold inline-flex items-center gap-1 text-[#0F2843] dark:text-gray-200 disabled:opacity-50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {loadingDetail ? "Loading..." : "View"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-xs text-gray-400 font-medium"
                        >
                          No survey responses match your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* FULL RESPONSE MODAL DRAWER */}
        {activeModalSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-[#09314F] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
              {/* MODAL HEADER */}
              <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/10 flex items-start justify-between gap-4 bg-white dark:bg-[#09314F] shrink-0">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843]">
                      Survey Review
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C5A97A]/20 text-[#0F2843] dark:text-[#C5A97A] border border-[#C5A97A]/30">
                      Exam: {activeModalSurvey.exam_target || "General"}
                    </span>
                    {activeModalSurvey.wants_followup && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Follow-up Requested
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0F2843] dark:text-white">
                    {activeModalSurvey.student
                      ? `${activeModalSurvey.student.firstname || ""} ${activeModalSurvey.student.surname || ""}`.trim()
                      : activeModalSurvey.full_name || "Anonymous Student"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      Submitted: {new Date(activeModalSurvey.created_at).toLocaleString()}
                    </span>
                    {activeModalSurvey.student?.email && (
                      <span>• Email: {activeModalSurvey.student.email}</span>
                    )}
                    {(activeModalSurvey.whatsapp_number || activeModalSurvey.student?.phone_number) && (
                      <span>
                        • Phone: {activeModalSurvey.whatsapp_number || activeModalSurvey.student?.phone_number}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalSurvey(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL SCROLLABLE BODY */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {/* 4 CORE HIGHLIGHT METRIC CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Overall Rating
                    </div>
                    <div className="text-lg font-black text-[#C5A97A] mt-0.5 flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-current text-[#C5A97A]" />
                      {activeModalSurvey.overall_rating || "-"} / 5
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      NPS Score
                    </div>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {activeModalSurvey.nps_score !== null
                        ? `${activeModalSurvey.nps_score} / 10`
                        : "-"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Preferred Format
                    </div>
                    <div
                      className="text-xs font-black text-[#0F2843] dark:text-white mt-1 truncate"
                      title={activeModalSurvey.preferred_video_format || "-"}
                    >
                      {activeModalSurvey.preferred_video_format || "-"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Video Length
                    </div>
                    <div className="text-xs font-black text-[#0F2843] dark:text-white mt-1">
                      {activeModalSurvey.preferred_video_length || "-"}
                    </div>
                  </div>
                </div>

                {/* DIRECT REACHOUT CALLOUT IF OPTED IN */}
                {(activeModalSurvey.wants_followup || activeModalSurvey.whatsapp_number) && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                          Follow-Up Permission Granted
                        </div>
                        <div className="text-xs text-emerald-800 dark:text-emerald-200">
                          Student confirmed team members can contact them regarding their feedback.
                          {activeModalSurvey.whatsapp_number && (
                            <span className="font-bold ml-1">
                              WhatsApp: {activeModalSurvey.whatsapp_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {activeModalSurvey.whatsapp_number && (
                      <a
                        href={`https://wa.me/${String(activeModalSurvey.whatsapp_number).replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl inline-flex items-center gap-1.5 transition shadow-sm shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat on WhatsApp
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* SECTION TABS & SEARCH BAR */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Section Switcher */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                      {SURVEY_SECTIONS.map((sec) => {
                        const Icon = sec.icon;
                        const isCurrent = modalActiveSection === sec.id;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => setModalActiveSection(sec.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                              isCurrent
                                ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] shadow-sm"
                                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {sec.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Search inside modal */}
                    <div className="relative min-w-[200px] sm:w-64 shrink-0">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter questions or answers..."
                        value={modalSearchQuery}
                        onChange={(e) => setModalSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-100 outline-none focus:ring-1 focus:ring-[#C5A97A]"
                      />
                      {modalSearchQuery && (
                        <button
                          onClick={() => setModalSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary progress bar / count */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium px-1">
                    <span>
                      Showing {displayedQuestions.length} of {totalQuestionsCount} questions
                    </span>
                    <span>
                      {answeredQuestionsCount} of {totalQuestionsCount} questions answered
                    </span>
                  </div>
                </div>

                {/* ELABORATE QUESTION & ANSWER LIST */}
                <div className="space-y-4">
                  {displayedQuestions.length > 0 ? (
                    displayedQuestions.map((q) => {
                      const answerVal = getSurveyAnswer(activeModalSurvey, q.id);
                      return (
                        <div
                          key={q.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            q.highlight
                              ? "bg-gradient-to-br from-amber-50/50 via-white to-gray-50/60 dark:from-[#C5A97A]/10 dark:via-white/[0.03] dark:to-white/[0.02] border-[#C5A97A]/40 shadow-sm"
                              : "bg-gray-50/70 dark:bg-white/[0.03] border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20"
                          }`}
                        >
                          {/* TOP: Question Header */}
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0F2843]/10 dark:bg-[#C5A97A]/20 text-[#0F2843] dark:text-[#C5A97A]">
                                  {q.category}
                                </span>
                                {q.highlight && (
                                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Core Insight
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-[#0F2843] dark:text-white leading-snug">
                                {q.question}
                              </h4>
                            </div>
                          </div>

                          {/* BOTTOM: Student Answer */}
                          <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-white/10 space-y-1.5">
                            <div className="text-[10px] uppercase font-black tracking-wider text-gray-400 dark:text-gray-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              Student Answer:
                            </div>
                            <div className="pl-0.5">
                              {renderAnswerValue(q, answerVal)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 space-y-2">
                      <HelpCircle className="w-8 h-8 text-gray-400 mx-auto" />
                      <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        No questions match your current search or section filter.
                      </div>
                      <button
                        onClick={() => {
                          setModalActiveSection("all");
                          setModalSearchQuery("");
                        }}
                        className="text-xs font-bold text-[#0F2843] dark:text-[#C5A97A] hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                  Viewing full feedback for {activeModalSurvey.full_name || "student"}
                </span>
                <button
                  onClick={() => setActiveModalSurvey(null)}
                  className="px-6 py-2.5 bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] hover:opacity-90 transition rounded-2xl text-xs font-black ml-auto shadow-sm"
                >
                  Close Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
