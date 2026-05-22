import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

export default function ExamHistory({ onBack }) {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("student_token") || "";

  // State Management
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const scoreVal = attempt.score !== undefined ? attempt.score : (attempt.correct_answers_count || 0);
    const totalQ = attempt.total_questions || attempt.questions_count || 0;
    const percentage = attempt.percentage !== undefined
      ? attempt.percentage
      : (totalQ ? Math.round((scoreVal / totalQ) * 100) : 0);

    const correct = attempt.correct_answers_count !== undefined
      ? attempt.correct_answers_count
      : (attempt.correct || scoreVal || 0);

    const wrong = attempt.wrong_answers_count !== undefined
      ? attempt.wrong_answers_count
      : (attempt.wrong || 0);

    const unanswered = attempt.unanswered_answers_count !== undefined
      ? attempt.unanswered_answers_count
      : (attempt.unanswered || (totalQ - correct - wrong >= 0 ? totalQ - correct - wrong : 0));

    const courseTitle = attempt.course?.title || attempt.exam_year?.subject?.course?.title || attempt.course_title || "General Course";
    const subjectName = attempt.subject?.name || attempt.exam_year?.subject?.name || attempt.subject_name || "General Subject";
    const yearValue = attempt.year || attempt.exam_year?.year || attempt.exam_year_name || "N/A";

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
        stats.yearValue.toLowerCase().includes(searchQuery.toLowerCase());

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Metric Card 1: Average Score */}
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex items-center gap-5">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 text-[#C5A97A] rounded-2xl shrink-0">
            <Icon icon="lucide:award" className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-[28px] font-black text-[#09314F] dark:text-white leading-none">
              {averageScore}%
            </h4>
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mt-2">
              Average Score
            </p>
          </div>
        </div>

        {/* Metric Card 2: Highest Score */}
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex items-center gap-5">
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
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex items-center gap-5">
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-orange-500 rounded-2xl shrink-0 relative">
            <Icon icon="lucide:flame" className={`w-8 h-8 ${activeStreak > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div>
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

            return (
              <div
                key={attempt.id}
                className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-[32px] border border-gray-100 dark:border-[#09314F] p-6 shadow-sm hover:shadow-md hover:scale-[1.005] transition-all duration-300 flex flex-col md:flex-row gap-6 justify-between items-center"
              >
                {/* Score Circular Progress & Titles */}
                <div className="flex items-center gap-5 w-full md:w-auto">
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
                <div className="flex items-center gap-4 py-4 md:py-0 w-full md:w-auto border-y md:border-y-0 border-gray-50 dark:border-gray-900 px-4 md:px-0">
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
                  <div className="flex-1 md:w-12 h-[1px] md:h-0.5 bg-gray-200 dark:bg-gray-800 shrink-0 relative flex items-center justify-center">
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
                <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-[#06243A] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 w-full md:w-auto">
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
    </div>
  );
}
