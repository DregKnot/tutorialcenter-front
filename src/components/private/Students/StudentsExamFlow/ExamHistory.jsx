import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import ExamReview from "./ExamReview.jsx";

// Helper to calculate flame visual styles and characteristics based on daily streak
const getStreakFlameStyles = (streak) => {
  if (streak === 0) {
    return {
      outer: ["#4A5568", "#718096"],
      middle: ["#718096", "#A0AEC0"],
      inner: ["#A0AEC0", "#E2E8F0"],
      glow: "rgba(113, 128, 150, 0.2)",
      scale: 0.8,
      speed: "3s",
      sparks: false,
      title: "Inactive",
      bgClass: "bg-gray-50 dark:bg-gray-900/30",
    };
  }

  let level = 1; // 1 = yellow, 2 = orange, 3 = red, 4 = blue
  let progress = 1; // 1 to 7

  if (streak <= 7) {
    level = 1;
    progress = streak;
  } else if (streak <= 14) {
    level = 2;
    progress = streak - 7;
  } else if (streak <= 21) {
    level = 3;
    progress = streak - 14;
  } else {
    level = 4;
    progress = Math.min(7, streak - 21);
  }

  const scale = 0.85 + (progress / 7) * 0.4; // Scale grows from 0.85 to ~1.25 within level
  const speed = `${1.6 - (progress / 7) * 0.9}s`; // Burns faster (1.6s down to 0.7s)

  let outer, middle, inner, glow, title, sparkColor, bgClass;

  if (level === 1) {
    outer = ["#FF5722", "#FF9800"]; // Deep orange to gold
    middle = ["#FF9800", "#FFC107"]; // Gold to yellow
    inner = ["#FFEB3B", "#FFFFFF"]; // Light yellow to white
    glow = `rgba(255, 152, 0, ${0.4 + (progress / 7) * 0.3})`;
    sparkColor = "#FF9800";
    title = "Bronze Spark";
    bgClass = "bg-amber-50 dark:bg-amber-950/20";
  } else if (level === 2) {
    outer = ["#E64A19", "#FF5722"]; // Dark orange-red to bright orange-red
    middle = ["#FF5722", "#FF9800"]; // Bright orange-red to deep orange
    inner = ["#FFCC80", "#FFF3E0"]; // Pale peach to warm light yellow
    glow = `rgba(230, 74, 25, ${0.4 + (progress / 7) * 0.4})`;
    sparkColor = "#FF5722";
    title = "Silver Ember";
    bgClass = "bg-orange-50 dark:bg-orange-950/20";
  } else if (level === 3) {
    outer = ["#B71C1C", "#D32F2F"]; // Deep maroon to crimson red
    middle = ["#D32F2F", "#F44336"]; // Crimson to vibrant red
    inner = ["#FF8A80", "#FFEBEE"]; // Bright neon red to soft white-pink
    glow = `rgba(211, 47, 47, ${0.5 + (progress / 7) * 0.4})`;
    sparkColor = "#F44336";
    title = "Golden Blaze";
    bgClass = "bg-red-50 dark:bg-red-950/20";
  } else {
    outer = ["#0D47A1", "#1976D2"]; // Deep blue to royal blue
    middle = ["#1976D2", "#00BCD4"]; // Royal blue to cyan
    inner = ["#80DEEA", "#E0F7FA"]; // Electric cyan to bright icy white
    glow = `rgba(0, 188, 212, ${0.6 + (progress / 7) * 0.4})`;
    sparkColor = "#00BCD4";
    title = "Icy Singularity";
    bgClass = "bg-cyan-50 dark:bg-cyan-950/20";
  }

  return {
    outer,
    middle,
    inner,
    glow,
    scale,
    speed,
    sparks: true,
    sparkColor,
    title,
    bgClass,
  };
};

// Custom Procedural Animated SVG Flame Component with keyframes, SMIL morph paths and rising sparks
const StreakFire = ({ streak }) => {
  const styles = getStreakFlameStyles(streak);
  
  // Outer flame keyframes paths for native fluid morphing
  const outerPaths = "M30 85 C15 75 10 50 25 25 C30 15 35 5 35 5 C35 5 40 18 45 28 C55 15 65 0 65 0 C65 0 65 15 60 30 C75 55 70 75 55 85 C48 90 38 90 30 85 Z;M32 84 C18 76 13 47 28 22 C32 16 36 8 36 8 C36 8 38 19 43 31 C52 18 63 6 63 6 C63 6 62 17 58 32 C71 57 67 76 53 84 C46 88 38 88 32 84 Z;M28 86 C12 74 8 52 23 27 C28 14 34 2 34 2 C34 2 41 17 47 26 C57 12 67 3 67 3 C67 3 67 13 61 28 C77 53 72 73 57 86 C50 91 40 91 28 86 Z;M30 85 C15 75 10 50 25 25 C30 15 35 5 35 5 C35 5 40 18 45 28 C55 15 65 0 65 0 C65 0 65 15 60 30 C75 55 70 75 55 85 C48 90 38 90 30 85 Z";

  // Middle flame keyframes paths for native fluid morphing
  const middlePaths = "M33 80 C23 72 20 53 30 35 C33 28 37 20 37 20 C37 20 40 30 44 38 C51 28 58 17 58 17 C58 17 58 29 54 40 C64 59 60 74 49 80 C44 84 37 84 33 80 Z;M35 79 C26 73 22 51 31 33 C34 29 38 23 38 23 C38 23 39 31 43 40 C49 30 56 22 56 22 C56 22 56 31 52 42 C62 60 58 75 47 79 C42 82 36 82 35 79 Z;M31 81 C20 70 18 55 28 37 C31 27 35 17 35 17 C35 17 41 29 45 36 C53 26 60 13 60 13 C60 13 60 27 56 38 C66 57 62 72 51 81 C46 85 39 85 31 81 Z;M33 80 C23 72 20 53 30 35 C33 28 37 20 37 20 C37 20 40 30 44 38 C51 28 58 17 58 17 C58 17 58 29 54 40 C64 59 60 74 49 80 C44 84 37 84 33 80 Z";

  // Inner flame keyframes paths for native fluid morphing
  const innerPaths = "M37 75 C30 68 28 55 35 43 C37 38 40 32 40 32 C40 32 42 38 45 44 C50 37 54 29 54 29 C54 29 54 38 51 46 C57 60 54 71 46 75 C42 78 38 78 37 75 Z;M38 74 C32 69 30 53 36 41 C38 37 41 33 41 33 C41 33 42 39 44 45 C48 39 52 31 52 31 C52 31 52 39 49 47 C55 61 52 72 45 74 C41 76 38 76 38 74 Z;M35 76 C28 66 26 57 33 44 C35 39 38 30 38 30 C38 30 43 37 46 43 C51 35 56 26 56 26 C56 26 55 37 52 45 C58 59 55 70 47 76 C43 79 38 79 35 76 Z;M37 75 C30 68 28 55 35 43 C37 38 40 32 40 32 C40 32 42 38 45 44 C50 37 54 29 54 29 C54 29 54 38 51 46 C57 60 54 71 46 75 C42 78 38 78 37 75 Z";

  const glowColor = styles.glow;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: "64px", height: "64px", overflow: "visible" }}>
      {/* Styles inject keyframes animations directly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flame-pulse-${streak} {
          0%, 100% { filter: drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 16px ${glowColor}); }
          50% { filter: drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 24px ${glowColor}); }
        }
        @keyframes spark-float-1-${streak} {
          0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
          100% { transform: translate(-8px, -45px) scale(0); opacity: 0; }
        }
        @keyframes spark-float-2-${streak} {
          0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
          100% { transform: translate(12px, -35px) scale(0); opacity: 0; }
        }
        @keyframes spark-float-3-${streak} {
          0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
          100% { transform: translate(2px, -50px) scale(0); opacity: 0; }
        }
        .flame-streak-anim-${streak} {
          animation: flame-pulse-${streak} 1.8s infinite ease-in-out;
          transform: scale(${styles.scale});
          transform-origin: center 80%;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .spark-streak-1-${streak} { animation: spark-float-1-${streak} 1.4s infinite ease-out; }
        .spark-streak-2-${streak} { animation: spark-float-2-${streak} 1.9s infinite ease-out 0.4s; }
        .spark-streak-3-${streak} { animation: spark-float-3-${streak} 1.6s infinite ease-out 0.8s; }
      ` }} />

      <svg 
        viewBox="-10 -10 120 120" 
        className={`w-full h-full flame-streak-anim-${streak}`}
        style={{ overflow: "visible" }}
      >
        {/* Outer Flame Layer */}
        <path 
          d="M30 85 C15 75 10 50 25 25 C30 15 35 5 35 5 C35 5 40 18 45 28 C55 15 65 0 65 0 C65 0 65 15 60 30 C75 55 70 75 55 85 C48 90 38 90 30 85 Z" 
          fill={styles.outer[0]} 
          fillOpacity="0.65"
        >
          <animate attributeName="d" dur={styles.speed} repeatCount="indefinite" values={outerPaths} />
        </path>

        {/* Middle Flame Layer */}
        <path 
          d="M33 80 C23 72 20 53 30 35 C33 28 37 20 37 20 C37 20 40 30 44 38 C51 28 58 17 58 17 C58 17 58 29 54 40 C64 59 60 74 49 80 C44 84 37 84 33 80 Z" 
          fill={styles.middle[0]} 
          fillOpacity="0.8"
        >
          <animate attributeName="d" dur={styles.speed} repeatCount="indefinite" values={middlePaths} />
        </path>

        {/* Inner Flame Layer */}
        <path 
          d="M37 75 C30 68 28 55 35 43 C37 38 40 32 40 32 C40 32 42 38 45 44 C50 37 54 29 54 29 C54 29 54 38 51 46 C57 60 54 71 46 75 C42 78 38 78 37 75 Z" 
          fill={styles.inner[0]} 
          fillOpacity="1.0"
        >
          <animate attributeName="d" dur={styles.speed} repeatCount="indefinite" values={innerPaths} />
        </path>

        {/* Dynamic Sparks */}
        {styles.sparks && (
          <g fill={styles.sparkColor}>
            <circle cx="35" cy="50" r="2.5" className={`spark-streak-1-${streak}`} />
            <circle cx="65" cy="45" r="2" className={`spark-streak-2-${streak}`} />
            <circle cx="50" cy="55" r="3" className={`spark-streak-3-${streak}`} />
          </g>
        )}
      </svg>
    </div>
  );
};

export default function ExamHistory({ availableExams = [], initialExpandedAttemptId = null, onBack }) {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("student_token") || "";

  // State Management
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState(initialExpandedAttemptId);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter & Sort States
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast
  const [toast, setToast] = useState(null);

  // Fetch History from API
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/students/exams/results/history?page=${currentPage}`,
        { headers }
      );

      console.log("Exam History loaded:", response.data);

      const responseData = response.data;
      let attemptsArray = [];
      let totalPagesVal = 1;
      let currentPageVal = 1;

      if (Array.isArray(responseData)) {
        attemptsArray = responseData;
      } else if (Array.isArray(responseData.data)) {
        attemptsArray = responseData.data;
        totalPagesVal = responseData.last_page || 1;
        currentPageVal = responseData.current_page || 1;
      } else if (responseData.attempts && Array.isArray(responseData.attempts.data)) {
        attemptsArray = responseData.attempts.data;
        totalPagesVal = responseData.attempts.last_page || 1;
        currentPageVal = responseData.attempts.current_page || 1;
      } else if (responseData.attempts && Array.isArray(responseData.attempts)) {
        attemptsArray = responseData.attempts;
      } else if (responseData.history && Array.isArray(responseData.history)) {
        attemptsArray = responseData.history;
      } else if (responseData.data && Array.isArray(responseData.data.data)) {
        attemptsArray = responseData.data.data;
        totalPagesVal = responseData.data.last_page || 1;
        currentPageVal = responseData.data.current_page || 1;
      }

      setAttempts(attemptsArray);
      setTotalPages(totalPagesVal);
      setCurrentPage(currentPageVal);

      // If initialExpandedAttemptId is provided and we found it, keep it. 
      // If we didn't find it on this page, it might be on another page or we might need to search for it, 
      // but usually the newly finished exam is the very first one on page 1.

    } catch (err) {
      console.error("Failed to load attempt history:", err);
      setError("Unable to retrieve your practice history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, API_BASE_URL, token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Format timestamp helper
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return null;
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const dayName = days[d.getDay()];
      const date = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      return {
        day: dayName,
        date: `${month} ${date}, ${year}`,
        time: `${hours}:${minutes} ${ampm}`,
      };
    } catch (e) {
      return null;
    }
  };

  // Helper to extract stats
  const getAttemptStats = (attempt) => {
    const scoreVal = attempt.score !== undefined ? Number(attempt.score) : (attempt.correct_answers !== undefined ? Number(attempt.correct_answers) : 0);
    const totalQ = attempt.total_questions !== undefined ? Number(attempt.total_questions) : (attempt.questions_count !== undefined ? Number(attempt.questions_count) : 0);
    
    const percentage = attempt.percentage !== undefined
      ? Math.round(Number(attempt.percentage))
      : (totalQ ? Math.round((scoreVal / totalQ) * 100) : 0);

    const correct = attempt.correct_answers !== undefined
      ? Number(attempt.correct_answers)
      : (attempt.correct_answers_count !== undefined ? Number(attempt.correct_answers_count) : (attempt.correct !== undefined ? Number(attempt.correct) : scoreVal));

    const wrong = attempt.wrong_answers !== undefined
      ? Number(attempt.wrong_answers)
      : (attempt.wrong_answers_count !== undefined ? Number(attempt.wrong_answers_count) : (attempt.wrong !== undefined ? Number(attempt.wrong) : 0));

    const unanswered = totalQ - (correct + wrong) > 0 ? totalQ - (correct + wrong) : 0;

    // Try to find matching exam from availableExams fallback
    const matchingExam = (availableExams || []).find(
      (exam) => 
        String(exam.id) === String(attempt.exam_year_id) ||
        String(exam.exam_year_id) === String(attempt.exam_year_id)
    );

    const courseTitle = 
      attempt.course?.title || 
      attempt.exam_year?.subject?.course?.title || 
      attempt.examYear?.subject?.course?.title ||
      matchingExam?.subject?.course?.title ||
      matchingExam?.course?.title ||
      attempt.course_title || 
      "General Course";

    const subjectName = 
      attempt.subject?.name || 
      attempt.exam_year?.subject?.name || 
      attempt.examYear?.subject?.name ||
      matchingExam?.subject?.name ||
      matchingExam?.subject?.title ||
      attempt.subject_name || 
      "General Subject";

    const yearValue = 
      attempt.year || 
      attempt.exam_year?.year || 
      attempt.examYear?.year ||
      matchingExam?.exam_year?.year ||
      matchingExam?.year ||
      attempt.exam_year_name || 
      "N/A";

    return {
      score: scoreVal,
      totalQuestions: totalQ,
      percentage,
      correct,
      wrong,
      unanswered,
      courseTitle,
      subjectName,
      yearValue,
    };
  };

  // Calculate Streak
  const getStreak = (allAttempts) => {
    if (!allAttempts || allAttempts.length === 0) return 0;
    const dates = allAttempts
      .map((a) => {
        const dateStr = a.started_at || a.created_at;
        return dateStr ? new Date(dateStr).toDateString() : null;
      })
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .map((d) => new Date(d));

    if (dates.length === 0) return 0;

    // Sort dates descending (newest first)
    dates.sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreak = 0;
    let expectedDate = new Date(today);

    const firstDate = new Date(dates[0]);
    firstDate.setHours(0, 0, 0, 0);

    if (firstDate.getTime() === today.getTime()) {
      currentStreak = 1;
      expectedDate = yesterday;
    } else if (firstDate.getTime() === yesterday.getTime()) {
      currentStreak = 1;
      expectedDate = new Date(yesterday);
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      return 0; // No active daily streak
    }

    for (let i = 1; i < dates.length; i++) {
      const d = new Date(dates[i]);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === expectedDate.getTime()) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (d.getTime() < expectedDate.getTime()) {
        break;
      }
    }
    return currentStreak;
  };

  // Process overall metrics
  const completedAttempts = attempts.filter((a) => a.status === "completed" || !a.status);
  const averageScore = completedAttempts.length
    ? Math.round(
        completedAttempts.reduce((acc, curr) => acc + getAttemptStats(curr).percentage, 0) /
          completedAttempts.length
      )
    : 0;

  const bestAttempt = completedAttempts.length
    ? completedAttempts.reduce((best, curr) => {
        const currStats = getAttemptStats(curr);
        const bestStats = getAttemptStats(best);
        return currStats.percentage > bestStats.percentage ? curr : best;
      }, completedAttempts[0])
    : null;

  const activeStreak = getStreak(attempts);

  // Filters & Sorting logic (executed client-side on current page or entire fetched set)
  const filteredAttempts = attempts
    .filter((a) => {
      const stats = getAttemptStats(a);
      const matchesSearch =
        stats.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stats.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(stats.yearValue || "").toLowerCase().includes(searchQuery.toLowerCase());

      const statusVal = a.status || "completed";
      const matchesStatus = selectedStatus === "all" || statusVal === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const statsA = getAttemptStats(a);
      const statsB = getAttemptStats(b);
      const dateA = new Date(a.started_at || a.created_at).getTime();
      const dateB = new Date(b.started_at || b.created_at).getTime();

      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "highest") return statsB.percentage - statsA.percentage;
      if (sortBy === "lowest") return statsA.percentage - statsB.percentage;
      return 0;
    });

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

      {/* Header View */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 group text-gray-500 hover:text-[#09314F] dark:hover:text-white transition-colors"
        >
          <Icon
            icon="lucide:chevron-left"
            className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"
          />
          <span className="text-sm font-black uppercase tracking-wider">Configure Exam</span>
        </button>

        <h2 className="text-xl md:text-2xl font-black text-[#09314F] dark:text-white uppercase tracking-tight">
          Practice History
        </h2>
      </div>

      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Metric Card 1: Average Score */}
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex items-center text-left gap-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 text-[#C5A97A] rounded-2xl shrink-0">
            <Icon icon="lucide:award" className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[28px] font-black text-[#09314F] dark:text-white leading-none">
              {averageScore}%
            </h4>
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mt-2">
              Average Score
            </p>
          </div>
        </div>

        {/* Metric Card 2: Highest Score */}
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex items-center text-left gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-950/20 text-[#76D287] rounded-2xl shrink-0">
            <Icon icon="lucide:trophy" className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[28px] font-black text-[#09314F] dark:text-white leading-none">
              {bestAttempt ? `${getAttemptStats(bestAttempt).percentage}%` : "0%"}
            </h4>
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mt-2 truncate">
              {bestAttempt
                ? `${getAttemptStats(bestAttempt).yearValue} ${getAttemptStats(bestAttempt).subjectName}`
                : "Best Score"}
            </p>
          </div>
        </div>

        {/* Metric Card 3: Daily Streak */}
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex items-center text-left gap-4">
          <div className={`${getStreakFlameStyles(activeStreak).bgClass} rounded-2xl shrink-0 relative w-16 h-16 flex items-center justify-center`}>
            <StreakFire streak={activeStreak} />
          </div>
          <div className="min-w-0">
            <h4 className="text-[28px] font-black text-[#09314F] dark:text-white leading-none">
              {activeStreak} {activeStreak === 1 ? "Day" : "Days"}
            </h4>
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mt-2">
              Practice Streak
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sort & Filter Row */}
      <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-5 border border-gray-100 dark:border-[#09314F] shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Icon icon="lucide:search" className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search subject, course, or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#06243A] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-[#06243A] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer focus:border-[#C5A97A] transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
            <option value="in_progress">In Progress</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-[#06243A] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer focus:border-[#C5A97A] transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Score</option>
            <option value="lowest">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* 3. Attempts Content */}
      {loading ? (
        // Premium Loading Skeletons
        <div className="space-y-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="bg-white dark:bg-[#09314F]/20 rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center animate-pulse"
            >
              <div className="flex gap-4 items-center w-full md:w-auto">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded hidden md:block"></div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="py-16 text-center bg-white dark:bg-[#09314F]/40 border border-red-200 dark:border-red-950 rounded-3xl p-8 shadow-sm">
          <Icon icon="lucide:cloud-alert" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#09314F] dark:text-white mb-2">Workspace Error</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-6 py-3 bg-[#09314F] text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#0a3d63] transition-all"
          >
            Retry Fetching
          </button>
        </div>
      ) : filteredAttempts.length === 0 ? (
        // Empty State
        <div className="py-20 text-center bg-white dark:bg-[#09314F]/40 rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800 p-8">
          <div className="w-20 h-20 bg-gray-50 dark:bg-[#06243A] rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Icon icon="lucide:folder-open" className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-[#09314F] dark:text-white mb-1">No Attempts Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            You haven't completed any practice attempts matching your criteria yet. Set up a course and click Start to begin!
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#09314F] hover:bg-[#0a3d63] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
          >
            Start Practice Now
          </button>
        </div>
      ) : (
        // List of Attempts Cards
        <div className="space-y-6">
          {filteredAttempts.map((attempt) => {
            const stats = getAttemptStats(attempt);
            const startStamp = formatDate(attempt.started_at || attempt.created_at);
            const endStamp = formatDate(attempt.submitted_at || attempt.updated_at || attempt.ended_at);
            const status = attempt.status || "completed";

            // Circle dash configs
            const scorePercentage = stats.percentage;
            let strokeColor = "#E83831"; // red
            if (scorePercentage >= 70) {
              strokeColor = "#76D287"; // green
            } else if (scorePercentage >= 50) {
              strokeColor = "#C5A97A"; // gold
            }

            const isExpanded = String(expandedAttemptId) === String(attempt.id);

            return (
              <div key={attempt.id} className="space-y-4">
                <div
                  onClick={() => setExpandedAttemptId(isExpanded ? null : attempt.id)}
                  className={`bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-[32px] border p-6 shadow-sm hover:shadow-md hover:scale-[1.005] cursor-pointer transition-all duration-300 flex flex-col xl:flex-row gap-6 justify-between xl:items-center w-full ${
                    isExpanded ? "border-[#C5A97A] ring-2 ring-[#C5A97A]/25" : "border-gray-100 dark:border-[#09314F]"
                  }`}
                >
                  {/* Score Circular Progress & Titles */}
                  <div className="flex items-center gap-5 w-full xl:w-auto shrink-0">
                    <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="stroke-gray-100 dark:stroke-gray-800 fill-transparent"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="fill-transparent transition-all duration-1000 ease-out"
                          style={{ stroke: strokeColor }}
                          strokeWidth="6"
                          strokeDasharray={201}
                          strokeDashoffset={201 - (201 * scorePercentage) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-base font-black text-[#09314F] dark:text-white">
                          {scorePercentage}%
                        </span>
                      </div>
                    </div>
   
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase text-[#C5A97A] tracking-wider block">
                        {stats.courseTitle}
                      </span>
                      <h3 className="text-base font-black text-[#09314F] dark:text-white uppercase tracking-tight mt-1 truncate">
                        {stats.subjectName} - {stats.yearValue}
                      </h3>
                      <div className="mt-2.5 flex items-center gap-2">
                        {/* Status Badges */}
                        {status === "completed" && (
                          <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                            <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                        {status === "abandoned" && (
                          <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                            <Icon icon="lucide:alert-triangle" className="w-3.5 h-3.5" />
                            Abandoned
                          </span>
                        )}
                        {status === "in_progress" && (
                          <span className="px-2.5 py-1 bg-gray-500/10 text-gray-500 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gray-400 animate-ping"></span>
                            In Progress
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-bold">
                          Score: {stats.score}/{stats.totalQuestions}
                        </span>
                      </div>
                    </div>
                  </div>
   
                  {/* Timeline display details */}
                  <div className="flex items-center justify-between xl:justify-start gap-4 py-4 xl:py-0 w-full xl:w-auto border-y xl:border-y-0 border-gray-100 dark:border-gray-800 px-2 xl:px-0 shrink-0">
                    {/* Start Point */}
                    {startStamp && (
                      <div className="text-left shrink-0">
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                          <Icon icon="lucide:calendar" className="w-3 h-3 text-[#C5A97A]" />
                          Started
                        </span>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mt-1">
                          {startStamp.date}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                          {startStamp.time} ({startStamp.day})
                        </p>
                      </div>
                    )}
   
                    {/* Connector Line */}
                    <div className="flex-1 xl:w-12 h-[1px] xl:h-0.5 bg-gray-200 dark:bg-gray-800 shrink-0 relative flex items-center justify-center">
                      <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5 text-gray-300 absolute" />
                    </div>
   
                    {/* Submit Point */}
                    <div className="text-left shrink-0">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                        <Icon icon="lucide:check-circle-2" className="w-3 h-3 text-green-500" />
                        Submitted
                      </span>
                      {status === "in_progress" ? (
                        <p className="text-xs font-bold text-orange-500 dark:text-orange-400 mt-1 animate-pulse">
                          Ticking...
                        </p>
                      ) : endStamp ? (
                        <>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mt-1">
                            {endStamp.date}
                          </p>
                          <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                            {endStamp.time} ({endStamp.day})
                          </p>
                        </>
                      ) : (
                        <p className="text-xs font-bold text-gray-400 mt-1">N/A</p>
                      )}
                    </div>
                  </div>
   
                  {/* Score breakdown metrics grid */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-[#06243A] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 w-full xl:w-auto shrink-0">
                    <div className="text-center px-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                        Correct
                      </span>
                      <span className="text-sm font-black text-green-500 block mt-1">
                        {stats.correct}
                      </span>
                    </div>
                    <div className="text-center px-1 border-x border-gray-200/50 dark:border-gray-800/50">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                        Wrong
                      </span>
                      <span className="text-sm font-black text-red-500 block mt-1">{stats.wrong}</span>
                    </div>
                    <div className="text-center px-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                        Skipped
                      </span>
                      <span className="text-sm font-black text-gray-500 block mt-1">
                        {stats.unanswered}
                      </span>
                    </div>
                  </div>
                </div>

                
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="p-3 bg-white dark:bg-[#09314F]/40 border border-gray-100 dark:border-[#09314F] hover:bg-gray-50 disabled:opacity-30 rounded-xl transition-all shadow-sm"
          >
            <Icon icon="lucide:chevron-left" className="w-5 h-5 text-gray-600 dark:text-white" />
          </button>
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className="p-3 bg-white dark:bg-[#09314F]/40 border border-gray-100 dark:border-[#09314F] hover:bg-gray-50 disabled:opacity-30 rounded-xl transition-all shadow-sm"
          >
            <Icon icon="lucide:chevron-right" className="w-5 h-5 text-gray-600 dark:text-white" />
          </button>
        </div>
      )}

      {/* Full-page review overlay (rendered at root to bypass parent transforms/gaps) */}
      {(() => {
        const activeAttemptForReview = filteredAttempts.find(a => String(a.id) === String(expandedAttemptId));
        if (!activeAttemptForReview) return null;

        const stats = getAttemptStats(activeAttemptForReview);

        return (
          <div className="fixed inset-0 z-[999] flex flex-col bg-slate-900/50 backdrop-blur-xl animate-in fade-in duration-300">
            {/* Scrollable page content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto w-full px-4 md:px-8 pt-4 md:pt-6 pb-20">
                
                {/* Close button row */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setExpandedAttemptId(null)}
                    className="flex items-center gap-2 group text-gray-500 hover:text-[#09314F] dark:hover:text-white transition-colors"
                  >
                    <Icon icon="lucide:chevron-left" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#09314F] dark:text-white">Back to History</span>
                  </button>
                  <button
                    onClick={() => setExpandedAttemptId(null)}
                    className="p-2.5 bg-white dark:bg-[#09314F]/40 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group"
                  >
                    <Icon icon="lucide:x" className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>

                {/* Attempt Summary Card (mirrors the history card) */}
                <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-[32px] border border-gray-100 dark:border-[#09314F] p-6 md:p-8 shadow-sm mb-8">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                    {/* Left: Score ring + subject info */}
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="26" className="stroke-gray-100 dark:stroke-[#06243A] fill-transparent" strokeWidth="5" />
                          <circle cx="32" cy="32" r="26" className="stroke-[#C5A97A] fill-transparent" strokeWidth="5" strokeDasharray={163} strokeDashoffset={163 - (163 * stats.percentage) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-xs font-black text-[#09314F] dark:text-white">{stats.percentage}%</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-[#C5A97A] tracking-wider block">{stats.courseTitle}</span>
                        <h3 className="text-base font-black text-[#09314F] dark:text-white uppercase tracking-tight mt-1 truncate">
                          {stats.subjectName} - {stats.yearValue}
                        </h3>
                        <span className="text-xs text-gray-400 font-bold mt-1 block">
                          Score: {stats.score}/{stats.totalQuestions}
                        </span>
                      </div>
                    </div>

                    {/* Right: Score breakdown */}
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-[#06243A] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 w-full xl:w-auto shrink-0">
                      <div className="text-center px-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Correct</span>
                        <span className="text-sm font-black text-green-500 block mt-1">{stats.correct}</span>
                      </div>
                      <div className="text-center px-3 border-x border-gray-200/50 dark:border-gray-800/50">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Wrong</span>
                        <span className="text-sm font-black text-red-500 block mt-1">{stats.wrong}</span>
                      </div>
                      <div className="text-center px-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Skipped</span>
                        <span className="text-sm font-black text-gray-500 block mt-1">{stats.unanswered}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full ExamReview content */}
                <ExamReview attemptId={activeAttemptForReview.id} hideHeader={true} onBack={() => setExpandedAttemptId(null)} />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
