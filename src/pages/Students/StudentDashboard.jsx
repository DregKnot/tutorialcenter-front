import { useEffect, useState } from "react";
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

// ── Welcome header ─────────────────────────────────────────────────────────────
function WelcomeHeader() {
  const { student } = useAuth();
  const firstName = student?.firstname || "Student";
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] dark:text-white tracking-tight">
          {greeting}, <span className="text-[#E83831]">{firstName}</span> 👋
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

export default function StudentDashboard() {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  const { token: authToken } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoCoursePopup, setShowNoCoursePopup] = useState(false);

  useEffect(() => {
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
        setCourses(fetchedCourses);
        const hasSubjects = fetchedCourses.some((c) => c.subjects && c.subjects.length > 0);
        if (!hasSubjects) setShowNoCoursePopup(true);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveCourses();
  }, [API_BASE_URL, authToken]);

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
        <WelcomeHeader />

        {/* ── Stats Bar ─────────────────────────────────────────────────── */}
        <StudentStatsBar />

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
              <StudentActivityChart />
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
        <RecommendedExamPractice />

      </div>
    </DashboardLayout>
  );
}
