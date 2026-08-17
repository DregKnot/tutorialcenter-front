import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { useStaffAuth } from "../../../context/StaffAuthContext";
import { Icon } from "@iconify/react";
import { stripHtmlAndDecode } from "../../../utils/textUtils.js";

export default function CooDashboard() {
  const { staff } = useStaffAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [recentAudit, setRecentAudit] = useState([]);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  // Helper to get 2-letter initials from course title
  const getCourseInitials = (title) => {
    if (!title) return "TC";
    const cleaned = title.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const words = cleaned.split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase() || "TC";
  };

  // Fetch Executive Operations Data
  const fetchExecutiveData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("staff_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [paymentsRes, studentsRes, staffRes, coursesRes, blogsRes, subjectsRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/admin/payments/all`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/students/all`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/staffs/all`, { headers }),
        axios.get(`${API_BASE_URL}/api/courses`),
        axios.get(`${API_BASE_URL}/api/blogs`),
        axios.get(`${API_BASE_URL}/api/admin/subjects/all`, { headers }),
      ]);

      // 1. Payments
      if (paymentsRes.status === "fulfilled") {
        const raw = paymentsRes.value?.data;
        const pData = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.payments)
          ? raw.payments
          : [];
        setPayments(pData);
        setRecentAudit(pData.slice(0, 5));
      }

      // 2. Students
      if (studentsRes.status === "fulfilled") {
        const sRaw = studentsRes.value?.data;
        const sData = Array.isArray(sRaw)
          ? sRaw
          : Array.isArray(sRaw?.data)
          ? sRaw.data
          : Array.isArray(sRaw?.students)
          ? sRaw.students
          : [];
        setStudents(Array.isArray(sData) ? sData : []);
      }

      // 3. Staff
      if (staffRes.status === "fulfilled") {
        const stRaw = staffRes.value?.data;
        const stData = Array.isArray(stRaw)
          ? stRaw
          : Array.isArray(stRaw?.data)
          ? stRaw.data
          : Array.isArray(stRaw?.staffs)
          ? stRaw.staffs
          : [];
        setStaffs(Array.isArray(stData) ? stData : []);
      }

      // 4. Courses
      if (coursesRes.status === "fulfilled") {
        const cRaw = coursesRes.value?.data;
        const cData = Array.isArray(cRaw)
          ? cRaw
          : Array.isArray(cRaw?.data)
          ? cRaw.data
          : Array.isArray(cRaw?.courses)
          ? cRaw.courses
          : [];
        setCourses(Array.isArray(cData) ? cData : []);
      }

      // 5. Subjects
      if (subjectsRes.status === "fulfilled") {
        const subRaw = subjectsRes.value?.data;
        const subData = Array.isArray(subRaw)
          ? subRaw
          : Array.isArray(subRaw?.data)
          ? subRaw.data
          : Array.isArray(subRaw?.subjects)
          ? subRaw.subjects
          : [];
        setSubjects(Array.isArray(subData) ? subData : []);
      }

      // 6. Blogs
      if (blogsRes.status === "fulfilled") {
        const bRaw = blogsRes.value?.data;
        const bData = Array.isArray(bRaw)
          ? bRaw
          : Array.isArray(bRaw?.data)
          ? bRaw.data
          : [];
        setBlogs(Array.isArray(bData) ? bData : []);
      }
    } catch (err) {
      console.error("Error fetching COO executive data:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchExecutiveData();
  }, [fetchExecutiveData]);

  // Helper to match subjects belonging to a course (matching CoursesManagement & CourseDetailModal)
  const getCourseSubjects = (course) => {
    if (!course) return [];
    if (Array.isArray(course.subjects) && course.subjects.length > 0) {
      return course.subjects;
    }
    return subjects.filter((s) => {
      if (s.course_id && Number(s.course_id) === Number(course.id)) return true;
      if (Array.isArray(s.courses)) {
        return s.courses.some((c) => Number(c?.id || c) === Number(course.id));
      }
      return false;
    });
  };

  // Compute Total Revenue
  const totalRevenue = payments.reduce((acc, curr) => {
    const amount = Number(curr.amount || curr.total_amount || 0);
    return acc + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Compute Total Blog Views
  const totalBlogViews = blogs.reduce((acc, curr) => {
    return acc + Number(curr.views || 0);
  }, 0);

  // Course Statistics
  const totalCoursesCount = courses.length;
  const coursesWithSubjects = courses.filter((c) => getCourseSubjects(c).length > 0);
  const coursesWithoutSubjects = courses.filter((c) => getCourseSubjects(c).length === 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <StaffDashboardLayout pagetitle="COO Operations Dashboard" hideHeader={false}>
      <div className="max-w-[1400px] mx-auto space-y-6 select-none">
        
        {/* ── TOP BANNER & GREETING ────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#09314F] via-[#0D3E64] to-[#124B78] rounded-[28px] p-6 md:p-8 text-white shadow-xl overflow-hidden border border-white/10">
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
            <Icon icon="fluent:chart-multiple-24-filled" className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  COO • Operations Preview
                </span>
                <span className="text-white/60 text-xs font-medium">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                {getGreeting()}, {staff?.firstname || "Chief Operations Officer"}
              </h1>
              <p className="text-sm text-gray-300 mt-1 max-w-xl font-medium">
                Welcome to your operations command center. Monitor institutional metrics, explore academic curriculums, and manage editorial publications.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate("/staffs/manage-blogs")}
                className="px-6 py-3.5 bg-gradient-to-r from-[#E83831] to-[#FF574D] hover:opacity-90 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg flex items-center gap-2 transition-all"
              >
                <Icon icon="lucide:pen-tool" className="w-4 h-4" />
                <span>Write Blog / Vlog</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI METRICS ROW ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Total Students */}
          <div 
            onClick={() => navigate("/staffs/manage-students")}
            className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Students</span>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#09314F] dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Icon icon="lucide:users" className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#09314F] dark:text-white">
                {loading ? "..." : students.length}
              </span>
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5">
                <Icon icon="lucide:arrow-up-right" className="w-3 h-3" /> Enrolled
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Verified Student Population</p>
          </div>

          {/* Card 2: Total Staffs */}
          <div 
            onClick={() => navigate("/staffs/manage-staffs")}
            className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Faculty & Staff</span>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Icon icon="lucide:user-check" className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#09314F] dark:text-white">
                {loading ? "..." : staffs.length}
              </span>
              <span className="text-[11px] font-bold text-blue-500">Active</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Tutors, Advisors & Admins</p>
          </div>

          {/* Card 3: Gross Revenue */}
          <div 
            onClick={() => navigate("/staffs/payments")}
            className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Gross Revenue</span>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-[#C5A97A] group-hover:scale-110 transition-transform">
                <Icon icon="lucide:wallet" className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-[#09314F] dark:text-white">
                {loading ? "..." : `₦${totalRevenue.toLocaleString()}`}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              {payments.length} Transaction Records Audited
            </p>
          </div>

          {/* Card 4: Blog Studio & Reach */}
          <div 
            onClick={() => navigate("/staffs/manage-blogs")}
            className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Blog & Vlog Studio</span>
              <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Icon icon="lucide:newspaper" className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#09314F] dark:text-white">
                {loading ? "..." : blogs.length}
              </span>
              <span className="text-[11px] font-bold text-purple-500">
                {totalBlogViews} Views
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Full Author & Publishing Control</p>
          </div>
        </div>

        {/* ── TWO COLUMN MAIN SECTION ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: Academic Explorer & Programs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ── ACADEMIC PROGRAMS & CURRICULUMS ────────────────────────────── */}
            <div className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm p-6 space-y-6">
              
              {/* Header with detailed metrics count */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-black text-[#09314F] dark:text-white flex items-center gap-2">
                    <Icon icon="lucide:book-open" className="w-5 h-5 text-[#C5A97A]" />
                    Academic Programs & Curriculums
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Showing <strong className="text-gray-700 dark:text-gray-200">{totalCoursesCount} Total Courses</strong> •{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">{coursesWithSubjects.length} with subjects</strong> •{" "}
                    <strong className="text-amber-600 dark:text-amber-400">{coursesWithoutSubjects.length} pending subjects</strong>
                  </p>
                </div>

                {/* Summary Pills & Link */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-xl bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-white text-[10px] font-black uppercase tracking-wider">
                    {totalCoursesCount} Courses
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    {coursesWithSubjects.length} Active
                  </span>
                  {coursesWithoutSubjects.length > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-black uppercase tracking-wider">
                      {coursesWithoutSubjects.length} No Subject
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate("/staffs/manage-courses")}
                    className="text-xs font-bold text-[#09314F] dark:text-[#C5A97A] hover:underline flex items-center gap-1 ml-2"
                  >
                    <span>Explore Courses</span>
                    <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Course Cards Grid */}
              {loading ? (
                <div className="py-12 text-center text-gray-400 text-sm space-y-2">
                  <div className="w-8 h-8 border-3 border-[#C5A97A] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Loading course curriculums...</p>
                </div>
              ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.map((course, idx) => {
                    const courseTitle = course.title || course.name || "Academic Program";
                    const courseSubjects = getCourseSubjects(course);
                    const hasSubjects = courseSubjects.length > 0;
                    const cleanDescription = stripHtmlAndDecode(course.description);
                    const initials = getCourseInitials(courseTitle);

                    return (
                      <div 
                        key={course.id || idx}
                        onClick={() => navigate("/staffs/manage-courses")}
                        className="p-5 rounded-2xl bg-gray-50/80 dark:bg-[#06243A] border border-gray-100 dark:border-gray-800 hover:border-[#C5A97A]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          {/* Card Header: Initials + Title + Subject Status Badge */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#09314F] to-[#124B78] text-[#C5A97A] flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                                {initials}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-[#09314F] dark:text-white leading-snug group-hover:text-[#E83831] transition-colors line-clamp-1">
                                  {courseTitle}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-bold">
                                  {course.price ? `₦${Number(course.price).toLocaleString()}` : "Free Enrollment"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Pill */}
                          <div className="mb-3">
                            {hasSubjects ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-wider">
                                <Icon icon="lucide:layers" className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{courseSubjects.length} {courseSubjects.length === 1 ? 'Subject' : 'Subjects'} Assigned</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-black uppercase tracking-wider">
                                <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 text-amber-500" />
                                <span>Created but no subject</span>
                              </span>
                            )}
                          </div>

                          {/* Clean Description */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {cleanDescription || "Comprehensive secondary and tertiary exam preparatory curriculum."}
                          </p>
                        </div>

                        {/* Card Footer: Subject names preview if available */}
                        {hasSubjects && courseSubjects.some(s => s?.name) && (
                          <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-800/80 flex flex-wrap gap-1.5">
                            {courseSubjects.slice(0, 3).map((sub, sIdx) => (
                              <span
                                key={sub?.id || sIdx}
                                className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[9px] font-bold border border-gray-100 dark:border-gray-700"
                              >
                                {sub?.name || `Subject #${sIdx + 1}`}
                              </span>
                            ))}
                            {courseSubjects.length > 3 && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold text-gray-400">
                                +{courseSubjects.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">No courses recorded yet.</div>
              )}
            </div>

            {/* Quick Launchpad Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => navigate("/staffs/manage-exams")}
                className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-2xl p-5 border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:border-[#E83831]/40 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon icon="lucide:clipboard-check" className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-[#09314F] dark:text-white">Exam Question Bank</h4>
                <p className="text-[11px] text-gray-400 mt-1">Browse past exam years and questions in read-only mode.</p>
              </div>

              <div 
                onClick={() => navigate("/staffs/leaderboard")}
                className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-2xl p-5 border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:border-[#C5A97A]/40 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#C5A97A] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon icon="lucide:trophy" className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-[#09314F] dark:text-white">Student Leaderboard</h4>
                <p className="text-[11px] text-gray-400 mt-1">Monitor academic rankings, gamified quiz points, and performance.</p>
              </div>

              <div 
                onClick={() => navigate("/staffs/school-tests")}
                className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-2xl p-5 border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:border-blue-400/40 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon icon="lucide:brain" className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-[#09314F] dark:text-white">Cognitive Test Results</h4>
                <p className="text-[11px] text-gray-400 mt-1">Review school partner test scores and institutional analytics.</p>
              </div>
            </div>

          </div>

          {/* RIGHT 1 COLUMN: Editorial Spotlight & Financial Audit */}
          <div className="space-y-6">
            
            {/* Recent Publications Spotlight */}
            <div className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Icon icon="lucide:pen" className="w-4 h-4 text-[#E83831]" />
                  Editorial Spotlight
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/staffs/manage-blogs")}
                  className="text-[11px] font-bold text-[#09314F] dark:text-[#C5A97A] hover:underline"
                >
                  Manage All
                </button>
              </div>

              {blogs.length > 0 ? (
                <div className="space-y-3">
                  {blogs.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => navigate("/staffs/manage-blogs")}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#06243A] border border-gray-100 dark:border-gray-800 hover:border-[#E83831]/40 transition-all cursor-pointer flex items-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        {b.featured_image ? (
                          <img
                            src={b.featured_image}
                            alt={b.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Icon icon="lucide:image" className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-black text-[#09314F] dark:text-white truncate group-hover:text-[#E83831] transition-colors">
                          {b.title}
                        </h5>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                          <span className="capitalize">{b.category?.name || "General"}</span>
                          <span>•</span>
                          <span>{b.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-gray-400 text-xs">
                  No blogs published yet. Start writing today!
                </div>
              )}
            </div>

            {/* Recent Payment Audit Log */}
            <div className="bg-white dark:bg-[#09314F]/40 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Icon icon="lucide:history" className="w-4 h-4 text-emerald-500" />
                  Recent Transactions
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/staffs/payments")}
                  className="text-[11px] font-bold text-[#09314F] dark:text-[#C5A97A] hover:underline"
                >
                  Audit All
                </button>
              </div>

              {recentAudit.length > 0 ? (
                <div className="space-y-3">
                  {recentAudit.map((tx, idx) => (
                    <div
                      key={tx.id || idx}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#06243A] border border-gray-100 dark:border-gray-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-[#09314F] dark:text-white truncate max-w-[140px]">
                          {tx.student?.firstname ? `${tx.student.firstname} ${tx.student.surname || ''}` : tx.reference || "Verified Enrollment"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "Recent"}
                        </p>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                        +₦{Number(tx.amount || tx.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-gray-400 text-xs">
                  No recent transaction entries found.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </StaffDashboardLayout>
  );
}
