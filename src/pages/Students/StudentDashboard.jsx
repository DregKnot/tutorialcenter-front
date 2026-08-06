import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

// ── New dashboard components ─────────────────────────────────────────────────
import StudentStatsBar from "../../components/private/Students/dashboard/StudentStatsBar.jsx";
import CourseCardGrid from "../../components/private/Students/dashboard/CourseCardGrid.jsx";
import StudentActivityChart from "../../components/private/Students/dashboard/StudentActivityChart.jsx";
import AchievementsPanel from "../../components/private/Students/dashboard/AchievementsPanel.jsx";
import MiniCalendarWidget from "../../components/private/Students/dashboard/MiniCalendarWidget.jsx";
import RecommendedExamPractice from "../../components/private/Students/dashboard/RecommendedExamPractice.jsx";
import useStudentActivity from "../../hooks/useStudentActivity.js";
import { getDashboardCache, setDashboardCache } from "../../utils/dashboardCache.js";

// ── Welcome header ─────────────────────────────────────────────────────────────
function WelcomeHeader({ leaderboardRank }) {
  const { student } = useAuth();
  let firstName = student?.firstname || "Student";
  let title = "";
  
  if (leaderboardRank >= 1 && leaderboardRank <= 3) {
    if (student?.gender?.toLowerCase() === "female") {
      title = "Queen ";
    } else if (student?.gender?.toLowerCase() === "male") {
      title = "King ";
    } else {
      title = "Highness ";
    }
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  let nameColorClass = "text-[#E83831]"; // Default red
  if (leaderboardRank === 1) nameColorClass = "text-amber-400 drop-shadow-md"; // Gold
  else if (leaderboardRank === 2) nameColorClass = "text-slate-300 drop-shadow-md"; // Silver
  else if (leaderboardRank === 3) nameColorClass = "text-amber-700 drop-shadow-md"; // Bronze

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] dark:text-white tracking-tight">
          {greeting}, <span className={nameColorClass}>{title}{firstName}</span> 👋
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
          {dateStr} · Here's your learning overview
        </p>
      </div>
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-2.5 shadow-sm self-start">
        <Icon icon="lucide:zap" className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-wide">Keep it up!</span>
      </div>
    </div>
  );
}

export default function StudentDashboard({ blogs = [] }) {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  const { token: authToken, student } = useAuth();
  const navigate = useNavigate();
  const studentId = student?.id;

  // Retrieve cached dashboard state if available for instant 0ms load
  const cachedData = getDashboardCache(studentId);

  const [courses, setCourses] = useState(() => cachedData?.courses || []);
  const [loading, setLoading] = useState(() => !cachedData); // Only show spinner if NO cache exists
  const [showNoCoursePopup, setShowNoCoursePopup] = useState(false);
  const [attempts, setAttempts] = useState(() => cachedData?.attempts || []);
  const [unreadCount, setUnreadCount] = useState(() => cachedData?.unreadCount || 0);
  const [leaderboardRank, setLeaderboardRank] = useState(() => cachedData?.leaderboardRank || null);

  // Fetch real login/logout activity data
  const { weekData: weekActivity } = useStudentActivity(authToken);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const count = res.data.unread_count || 0;
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count for dashboard:", err);
    }
  }, [API_BASE_URL, authToken]);

  useEffect(() => {
    fetchUnreadCount();
    window.addEventListener('updateUnreadCount', fetchUnreadCount);
    return () => window.removeEventListener('updateUnreadCount', fetchUnreadCount);
  }, [fetchUnreadCount]);

  useEffect(() => {
    let currentCourses = courses;
    let currentAttempts = attempts;
    let currentRank = leaderboardRank;

    const fetchActiveCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/students/courses`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        });
        if (res?.status !== 200) throw new Error(res?.data?.message);
        const fetchedCourses = res?.data?.courses || [];
        currentCourses = fetchedCourses;
        setCourses(fetchedCourses);
        const hasSubjects = fetchedCourses.some((c) => c.subjects && c.subjects.length > 0);
        if (!hasSubjects) setShowNoCoursePopup(true);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/students/exams/results/history`, {
          headers: { Authorization: `Bearer ${authToken}`, Accept: "application/json" },
        });
        const responseData = res?.data || [];
        let attemptsArray = [];
        if (Array.isArray(responseData)) attemptsArray = responseData;
        else if (Array.isArray(responseData.data)) attemptsArray = responseData.data;
        else if (responseData.attempts && Array.isArray(responseData.attempts.data)) attemptsArray = responseData.attempts.data;
        else if (responseData.history && Array.isArray(responseData.history)) attemptsArray = responseData.history;
        else if (responseData.data && Array.isArray(responseData.data.data)) attemptsArray = responseData.data.data;

        currentAttempts = attemptsArray;
        setAttempts(attemptsArray);
      } catch (err) {
        console.error("Failed to load exam history for stats:", err);
      }
    };

    const fetchRank = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/students/leaderboard`, {
          headers: { Authorization: `Bearer ${authToken}`, Accept: "application/json" },
        });
        let rawData = [];
        if (Array.isArray(res.data)) rawData = res.data;
        else if (res.data?.data && Array.isArray(res.data.data)) rawData = res.data.data;
        else if (res.data?.leaderboard && Array.isArray(res.data.leaderboard)) rawData = res.data.leaderboard;

        const studentObj = rawData.find(item => item.student_id === student?.id || item.id === student?.id);
        if (studentObj && studentObj.rank) {
          currentRank = studentObj.rank;
          setLeaderboardRank(studentObj.rank);
        } else {
          const idx = rawData.findIndex(item => item.student_id === student?.id || item.id === student?.id);
          if (idx !== -1) {
            currentRank = idx + 1;
            setLeaderboardRank(idx + 1);
          }
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard rank:", err);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchActiveCourses(), fetchHistory(), fetchRank()]);
      // Cache data for instant loading on subsequent navigations
      if (studentId) {
        setDashboardCache(studentId, {
          courses: currentCourses,
          attempts: currentAttempts,
          leaderboardRank: currentRank,
          unreadCount,
        });
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL, authToken, studentId]);

  // Compute average score from history
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, attempt) => {
        const scoreVal = attempt.score !== undefined ? Number(attempt.score) : (attempt.correct_answers !== undefined ? Number(attempt.correct_answers) : 0);
        const totalQ = attempt.total_questions !== undefined ? Number(attempt.total_questions) : (attempt.questions_count !== undefined ? Number(attempt.questions_count) : 0);
        const percentage = attempt.percentage !== undefined ? Math.round(Number(attempt.percentage)) : (totalQ ? Math.round((scoreVal / totalQ) * 100) : 0);
        return sum + (isNaN(percentage) ? 0 : percentage);
      }, 0) / attempts.length)
    : 0;

  // Calculate Max Streak (highest streak ever achieved)
  const getMaxStreak = (allAttempts) => {
    if (!allAttempts || allAttempts.length === 0) return 0;
    const dates = allAttempts
      .map((a) => {
        const dateStr = a.started_at || a.created_at;
        return dateStr ? new Date(dateStr).toDateString() : null;
      })
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .map((d) => new Date(d));

    if (dates.length === 0) return 0;
    dates.sort((a, b) => a - b); // ascending for max streak
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      prev.setHours(0, 0, 0, 0);
      const curr = new Date(dates[i]);
      curr.setHours(0, 0, 0, 0);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    return maxStreak;
  };

  const actualMaxStreak = getMaxStreak(attempts);

  // Generate highlights
  const highlights = [];
  
  // 1. Payment expirations
  courses.forEach(course => {
    const status = course.status?.toLowerCase();
    if (status === 'cancelled' || status === 'removed' || status === 'inactive') return;
    
    let expiry = null;
    if (course.end_date) {
      expiry = new Date(course.end_date);
    } else if (course.start_date && course.billing_cycle) {
      const start = new Date(course.start_date);
      if (!isNaN(start.getTime())) {
        const monthsMap = { monthly: 1, quarterly: 3, semi_annual: 6, annual: 12 };
        const months = monthsMap[course.billing_cycle] || 1;
        expiry = new Date(start);
        expiry.setMonth(expiry.getMonth() + months);
      }
    }

    if (expiry) {
      const diffTime = expiry.getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7 && diffDays >= 0) {
        const title = course.course?.title || course.course_name || "your course";
        highlights.push({
          type: "payment",
          text: `Subscription for ${title} expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}.`,
          actionLabel: "Renew Now",
          actionUrl: "/student/payments?action=renew"
        });
      } else if (diffDays < 0) {
        const title = course.course?.title || course.course_name || "your course";
        highlights.push({
          type: "payment",
          text: `Subscription for ${title} has expired!`,
          actionLabel: "Renew Now",
          actionUrl: "/student/payments?action=renew"
        });
      }
    }
  });

  // 2. Add blogs
  blogs.forEach(blog => {
    highlights.push({
      type: "blog",
      text: blog.title || "New blog post available!",
      actionLabel: "Read",
      actionUrl: blog.url || "#"
    });
  });

  // 3. Live class & Merit info updates to load up the slot machine
  highlights.push({
    type: "liveclass",
    text: "Live Class: Master Mathematics begins in 190 minutes!",
    actionLabel: "Join",
    actionUrl: "/student/classes"
  });

  highlights.push({
    type: "recorded",
    text: "Missed a session? Catch up on Recorded Masterclasses!",
    actionLabel: "Watch",
    actionUrl: "/student/recorded-classes"
  });

  highlights.push({
    type: "merit",
    text: "New Merit unlocked: Exam Streak Champion!",
    actionLabel: "View",
    actionUrl: "/student/achievements"
  });

  // 4. General fallbacks if empty or small pool
  if (highlights.length <= 2) {
    highlights.push({
      type: "info",
      text: "You are all caught up on your courses!",
      actionLabel: "Practice",
      actionUrl: "/student/exams"
    });
    highlights.push({
      type: "info",
      text: "Check out the latest exam tips in the community.",
      actionLabel: "Community",
      actionUrl: "/community"
    });
  }

  return (
    <DashboardLayout hideRightPanel={true} hideHeader={true}>
      {/* ── No Course Popup ─────────────────────────────────────────────── */}
      {showNoCoursePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="lucide:book-x" className="w-10 h-10 text-[#E83831]" />
            </div>
            <h2 className="text-2xl font-black text-[#09314F] dark:text-white uppercase mb-3">
              No Active Courses
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
              You haven't enrolled in any subjects yet. Add a training course to access your
              study materials, classes, and exams.
            </p>
            <button
              onClick={() => {
                setShowNoCoursePopup(false);
                navigate("/student/payments?action=add");
              }}
              className="w-full py-4 bg-gradient-to-r from-[#09314F] to-[#0a426b] hover:from-[#E83831] hover:to-[#ff473e] text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              Add Training Now
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto text-gray-800 dark:text-gray-100 pb-10">

        {/* ── Welcome header ────────────────────────────────────────────────── */}
        <WelcomeHeader leaderboardRank={leaderboardRank} />

        {/* ── Stats Bar ─────────────────────────────────────────────────── */}
        <StudentStatsBar avgScore={avgScore} streak={actualMaxStreak} weekActivity={weekActivity} highlights={highlights} unreadCount={unreadCount} leaderboardRank={leaderboardRank} />

        {/* ── Main 2-column grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

          {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 h-full">

            {/* Section label */}
            <div className="flex items-center gap-2">
              <Icon icon="lucide:layout-grid" className="w-4 h-4 text-[#09314F] dark:text-blue-300" />
              <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                My Courses
              </h2>
            </div>

            {/* Course Cards grid — up to 4, responsive */}
            <CourseCardGrid courses={courses} loading={loading} />

            {/* Student Activity Chart */}
            <div className="flex-1 flex flex-col min-h-[250px]">
              <StudentActivityChart attempts={attempts} />
            </div>

          </div>

          {/* ── RIGHT COLUMN ───────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 h-full">
            {/* Invisible spacer to align tops perfectly with left column */}
            <div className="flex items-center gap-2 invisible" aria-hidden="true">
              <Icon icon="lucide:layout-grid" className="w-4 h-4" />
              <h2 className="text-xs font-black uppercase tracking-widest">Spacer</h2>
            </div>
            
            <div className="flex-none">
              <AchievementsPanel />
            </div>
            <div className="flex-none">
              <MiniCalendarWidget />
            </div>
          </div>

        </div>

        {/* ── Recommended Exam Practice — full width ─────────────────────── */}
        <RecommendedExamPractice courses={courses} attempts={attempts} />

      </div>
    </DashboardLayout>
  );
}
