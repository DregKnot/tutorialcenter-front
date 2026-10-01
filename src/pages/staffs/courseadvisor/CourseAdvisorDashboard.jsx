import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { useStaffAuth } from "../../../context/StaffAuthContext.jsx";
import GuardianDetailsModal from "../../../components/private/staffs/GuardianDetailsModal.jsx";
import AdminStudentViewModal from "../../../components/private/staffs/AdminStudentViewModal.jsx";
import { Icon } from "@iconify/react";

export default function CourseAdvisorDashboard() {
  const { staff } = useStaffAuth();
  const navigate = useNavigate();

  // Primary API States
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [avgAttempts, setAvgAttempts] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  // UI States
  const [activeTab, setActiveTab] = useState("guardians"); // "guardians" | "at_risk"
  const [searchQuery, setSearchQuery] = useState("");
  const [guardianFilter, setGuardianFilter] = useState("all"); // "all" | "multiple" | "active" | "empty"
  const [atRiskFilter, setAtRiskFilter] = useState("all"); // "all" | "unpaid" | "no_attempts"
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal States
  const [selectedGuardian, setSelectedGuardian] = useState(null);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  // Helper to extract student latest course enrollment
  const getLatestCourse = useCallback((student) => {
    const payments = student.payments || [];
    if (payments.length > 0) {
      const sortedPayments = [...payments]
        .filter(p => p.status === 'successful' && p.enrollment && p.enrollment.end_date)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (sortedPayments.length > 0) {
        const latestPayment = sortedPayments[0];
        return {
          status: latestPayment.enrollment.status || 'active',
          end_date: latestPayment.enrollment.end_date,
          start_date: latestPayment.enrollment.start_date,
          course: latestPayment.course || latestPayment.enrollment.course
        };
      }
    }

    const studentInfo = Array.isArray(student?.information) ? student.information[0] : (student?.information || {});
    const courses = student?.courses || student?.course_enrollments || studentInfo?.courses || studentInfo?.course_enrollments || [];

    if (!courses || courses.length === 0) return null;

    return [...courses].sort((a, b) => {
      const dateA = new Date(a.end_date || 0);
      const dateB = new Date(b.end_date || 0);
      return dateB - dateA;
    })[0];
  }, []);

  const isStudentActive = useCallback((student) => {
    const latest = getLatestCourse(student);
    if (!latest) return false;
    return latest.status === 'active' || (latest.end_date && new Date(latest.end_date) >= new Date());
  }, [getLatestCourse]);

  const isStudentSuspended = useCallback((student) => {
    return (
      student.banned === 1 ||
      student.account_status === "suspended" ||
      student.deleted_at != null ||
      student.information?.deleted_at != null ||
      (Array.isArray(student.information) && student.information[0]?.deleted_at != null)
    );
  }, []);

  // Fetch Advisor Overview Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      };

      const [studentsRes, statsRes, guardiansRes, classesRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/advisor/students/all`, config),
        axios.get(`${API_BASE_URL}/api/advisor/dashboard/stats`, config),
        axios.get(`${API_BASE_URL}/api/advisor/guardians/all`, config),
        axios.get(`${API_BASE_URL}/api/advisor/classes/schedule`, config),
      ]);

      // 1. Students
      if (studentsRes.status === "fulfilled") {
        const raw = studentsRes.value?.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.students)
          ? raw.students
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        setStudents(list);
      }

      // 2. Stats
      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        setAvgAttempts(statsRes.value.data.average_attempts_per_student || 0);
        setAvgScore(statsRes.value.data.average_point_per_exam || 0);
      }

      // 3. Guardians
      if (guardiansRes.status === "fulfilled") {
        const raw = guardiansRes.value?.data;
        const gList = Array.isArray(raw?.guardians)
          ? raw.guardians
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
          ? raw
          : [];
        setGuardians(gList);
      }

      // 4. Upcoming Classes / Masterclasses
      if (classesRes.status === "fulfilled") {
        const cData = classesRes.value?.data;
        const cList = Array.isArray(cData)
          ? cData
          : Array.isArray(cData?.classes)
          ? cData.classes
          : Array.isArray(cData?.schedule)
          ? cData.schedule
          : Array.isArray(cData?.data)
          ? cData.data
          : [];
        setUpcomingClasses(cList);
      }
    } catch (err) {
      console.error("Failed to load Advisor dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculated Metrics
  const totalStudents = students.length;
  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const newStudentsCount = useMemo(() => {
    return students.filter(s => {
      if (!s.created_at) return false;
      const d = new Date(s.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  }, [students, currentMonth, currentYear]);

  const activeStudents = useMemo(() => {
    return students.filter(s => isStudentActive(s) && !isStudentSuspended(s)).length;
  }, [students, isStudentActive, isStudentSuspended]);

  const inactiveStudents = useMemo(() => {
    return students.filter(s => !isStudentActive(s) && !isStudentSuspended(s)).length;
  }, [students, isStudentActive, isStudentSuspended]);

  const activePercentage = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

  // Total unique wards linked across guardians
  const totalWardsLinked = useMemo(() => {
    const set = new Set();
    guardians.forEach(g => {
      (g.students || []).forEach(st => set.add(st.id));
    });
    return set.size;
  }, [guardians]);

  // Next Upcoming Class / Masterclass
  const nextClass = useMemo(() => {
    if (!upcomingClasses || upcomingClasses.length === 0) return null;
    const currentTime = Date.now();
    const future = upcomingClasses
      .filter(c => {
        if (!c.starts_at) return false;
        return new Date(c.starts_at).getTime() >= currentTime;
      })
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
    return future[0] || upcomingClasses[0] || null;
  }, [upcomingClasses]);

  // Filtered Guardians List
  const filteredGuardians = useMemo(() => {
    return guardians.filter(g => {
      const q = searchQuery.toLowerCase().trim();
      const name = `${g.first_name || ""} ${g.last_name || ""}`.toLowerCase();
      const email = String(g.email || "").toLowerCase();
      const phone = String(g.tel || g.phone || "").toLowerCase();
      const wards = (g.students || []).map(w => `${w.first_name || ""} ${w.last_name || ""}`.toLowerCase()).join(" ");

      const matchesSearch = !q || name.includes(q) || email.includes(q) || phone.includes(q) || wards.includes(q);
      if (!matchesSearch) return false;

      const wardCount = (g.students || []).length;
      if (guardianFilter === "multiple") return wardCount > 1;
      if (guardianFilter === "empty") return wardCount === 0;
      if (guardianFilter === "active") return (g.students || []).some(w => isStudentActive(w));

      return true;
    });
  }, [guardians, searchQuery, guardianFilter, isStudentActive]);

  // At-Risk / Needs Attention Students
  const atRiskStudents = useMemo(() => {
    return students
      .map(st => {
        const active = isStudentActive(st);
        const suspended = isStudentSuspended(st);
        const latest = getLatestCourse(st);
        const attempts = Number(st.exam_attempts_count ?? st.attempts_count ?? 0);

        let issues = [];
        if (!active && !suspended) issues.push({ label: "Unpaid / Expired Enrollment", type: "danger" });
        if (suspended) issues.push({ label: "Account Suspended", type: "warning" });
        if (attempts === 0) issues.push({ label: "0 Mock Attempts", type: "info" });

        // Linked guardian
        const matchedGuardian = guardians.find(g =>
          (g.students || []).some(w => String(w.id) === String(st.id))
        );

        return {
          ...st,
          isActive: active,
          isSuspended: suspended,
          latestCourse: latest,
          attempts,
          issues,
          guardian: matchedGuardian,
        };
      })
      .filter(st => {
        if (st.issues.length === 0) return false;

        const q = searchQuery.toLowerCase().trim();
        const name = `${st.first_name || st.name || ""} ${st.last_name || ""}`.toLowerCase();
        const email = String(st.email || "").toLowerCase();
        const phone = String(st.tel || st.phone || "").toLowerCase();
        const matchesSearch = !q || name.includes(q) || email.includes(q) || phone.includes(q);
        if (!matchesSearch) return false;

        if (atRiskFilter === "unpaid") return !st.isActive && !st.isSuspended;
        if (atRiskFilter === "no_attempts") return st.attempts === 0;
        return true;
      });
  }, [students, guardians, searchQuery, atRiskFilter, isStudentActive, isStudentSuspended, getLatestCourse]);

  // Paginated Guardians
  const paginatedGuardians = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGuardians.slice(start, start + pageSize);
  }, [filteredGuardians, currentPage]);

  const totalGuardianPages = Math.ceil(filteredGuardians.length / pageSize) || 1;

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [now]);

  const advisorName = staff?.firstname || staff?.first_name || staff?.name?.split(" ")[0] || "Advisor";

  return (
    <StaffDashboardLayout pagetitle="Overview" hideHeader={false}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
        
        {/* 1. HERO GREETING & OPERATIONS BANNER */}
        <div className="bg-gradient-to-r from-[#09314F] via-[#0D3E64] to-[#124B78] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#1a4a75]">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#C5A97A]/20 to-transparent pointer-events-none" />
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Icon icon="lucide:graduation-cap" className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#C5A97A] text-[#09314F]">
                  Course Advisory Operations
                </span>
                <span className="text-xs text-gray-300 font-medium">
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {greeting}, {advisorName}!
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                Monitor student academic health, inspect mock test participation, and stay connected with guardians and upcoming live classes.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate("/staffs/course-advisor/students")}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 shadow-sm"
              >
                <Icon icon="lucide:users" className="w-4 h-4 text-[#C5A97A]" />
                <span>Students</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/staffs/course-advisor/guardians")}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 shadow-sm"
              >
                <Icon icon="lucide:shield-check" className="w-4 h-4 text-[#C5A97A]" />
                <span>Guardians</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/staffs/course-advisor/master-class")}
                className="px-4 py-2.5 bg-gradient-to-r from-[#C5A97A] to-[#E83831] hover:opacity-90 active:scale-95 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all flex items-center gap-2"
              >
                <Icon icon="lucide:video" className="w-4 h-4" />
                <span>Master Class</span>
              </button>
            </div>
          </div>

          {/* Dynamic Masterclass Ticker Bar */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#C5A97A]/20 flex items-center justify-center text-[#C5A97A] shrink-0">
                <Icon icon="lucide:calendar-clock" className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A97A] block">
                  Next Scheduled Master Class
                </span>
                <span className="font-bold text-gray-200">
                  {nextClass
                    ? `${nextClass.title || nextClass.subject_name || "Live Master Class"}${nextClass.starts_at ? ` • ${new Date(nextClass.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}`
                    : "No immediate session in progress. Student timetables are normal."}
                </span>
              </div>
            </div>
            {nextClass && (
              <button
                type="button"
                onClick={() => navigate("/staffs/course-advisor/master-class")}
                className="text-[11px] font-bold text-[#C5A97A] hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                <span>Launch Hub</span>
                <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. REFINED EXECUTIVE KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total Students with Active Breakdown */}
          <div className="bg-white dark:bg-[#06243A] p-6 rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Icon icon="lucide:users" className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-wider">
                +{newStudentsCount} this mo
              </span>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                Total Enrolled Students
              </span>
              <div className="text-3xl font-black text-[#09314F] dark:text-white mt-1 tracking-tight">
                {loading ? "..." : totalStudents}
              </div>
            </div>

            {/* Health Bar */}
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {activeStudents} Paid ({activePercentage}%)
                </span>
                <span className="text-rose-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {inactiveStudents} Unpaid
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${activePercentage}%` }}
                />
                <div
                  className="bg-rose-400 h-full transition-all duration-500"
                  style={{ width: `${100 - activePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Guardians Directory */}
          <div className="bg-white dark:bg-[#06243A] p-6 rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Icon icon="lucide:shield-check" className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Family Roster
              </span>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                Total Guardians
              </span>
              <div className="text-3xl font-black text-[#09314F] dark:text-white mt-1 tracking-tight">
                {loading ? "..." : guardians.length}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px] font-medium">
                {totalWardsLinked} students linked to family
              </span>
              <button
                type="button"
                onClick={() => navigate("/staffs/course-advisor/guardians")}
                className="text-[11px] font-bold text-[#C5A97A] hover:underline flex items-center gap-1"
              >
                <span>Directory</span>
                <Icon icon="lucide:arrow-right" className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3: Average Exam Score Benchmark */}
          <div className="bg-white dark:bg-[#06243A] p-6 rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Icon icon="lucide:award" className="w-6 h-6" />
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                avgScore >= 70
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : avgScore >= 50
                  ? "bg-sky-500/10 text-sky-500 border-sky-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}>
                {avgScore >= 70 ? "High Mastery" : avgScore >= 50 ? "Satisfactory" : "Needs Review"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                Avg Exam Score
              </span>
              <div className="text-3xl font-black text-[#09314F] dark:text-white mt-1 tracking-tight">
                {loading ? "..." : `${avgScore}%`}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 text-[11px] text-gray-400 font-medium">
              Scaled academic performance across all tests
            </div>
          </div>

          {/* Card 4: Practice Attempts per Student */}
          <div className="bg-white dark:bg-[#06243A] p-6 rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Icon icon="lucide:clipboard-check" className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Drill Routine
              </span>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                Avg Attempts / Student
              </span>
              <div className="text-3xl font-black text-[#09314F] dark:text-white mt-1 tracking-tight">
                {loading ? "..." : avgAttempts}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 text-[11px] text-gray-400 font-medium">
              Mock tests & past questions per learner
            </div>
          </div>

        </div>

        {/* 3. OPERATIONAL TABS (Guardians Directory vs. At-Risk Alert Feed) */}
        <div className="bg-white dark:bg-[#06243A] rounded-3xl border border-gray-100 dark:border-[#1a4a75] shadow-sm overflow-hidden">
          
          {/* Tab Header Strip */}
          <div className="p-6 md:p-8 pb-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setActiveTab("guardians"); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "guardians"
                    ? "bg-[#09314F] text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                <Icon icon="lucide:shield" className="w-4 h-4 text-[#C5A97A]" />
                <span>Guardians &amp; Wards ({guardians.length})</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("at_risk"); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "at_risk"
                    ? "bg-[#09314F] text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                <Icon icon="lucide:alert-triangle" className="w-4 h-4 text-amber-400" />
                <span>Action Needed ({atRiskStudents.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Icon icon="lucide:search" className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={activeTab === "guardians" ? "Search guardian or ward..." : "Search student..."}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all"
              />
            </div>
          </div>

          {/* TAB 1: GUARDIANS & WARDS DIRECTORY */}
          {activeTab === "guardians" && (
            <div>
              {/* Filter Sub-bar */}
              <div className="px-6 md:px-8 py-3 bg-gray-50/60 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Filter:</span>
                  {[
                    { id: "all", label: "All" },
                    { id: "multiple", label: "Multiple Wards" },
                    { id: "active", label: "Active Wards" },
                    { id: "empty", label: "No Wards" },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => { setGuardianFilter(f.id); setCurrentPage(1); }}
                      className={`px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                        guardianFilter === f.id
                          ? "bg-white dark:bg-gray-800 text-[#09314F] dark:text-[#C5A97A] shadow-sm border border-gray-200 dark:border-gray-700"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-gray-400">
                  Showing {filteredGuardians.length} guardians
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#B99E7F] text-white">
                      <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase tracking-widest">
                        Guardian Name &amp; Contact
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                        Assigned Wards (Students)
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                        Ward Count
                      </th>
                      <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-12 text-center text-sm font-medium text-gray-400">
                          <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin mx-auto text-[#C5A97A] mb-2" />
                          <span>Loading guardian directory...</span>
                        </td>
                      </tr>
                    ) : paginatedGuardians.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-12 text-center text-sm font-medium text-gray-400">
                          <Icon icon="lucide:search-x" className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                          <span>No guardians found matching your criteria.</span>
                        </td>
                      </tr>
                    ) : (
                      paginatedGuardians.map((guardian, idx) => {
                        const guardianName = `${guardian.first_name || ""} ${guardian.last_name || ""}`.trim() || "Guardian";
                        const guardianInitial = (guardian.first_name || "G")[0].toUpperCase();
                        const wards = guardian.students || [];

                        return (
                          <tr
                            key={guardian.id || idx}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-colors"
                          >
                            {/* Guardian Info */}
                            <td className="px-6 md:px-8 py-4">
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-2xl bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-[#C5A97A] font-black text-sm flex items-center justify-center shrink-0">
                                  {guardianInitial}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-[#09314F] dark:text-white block truncate">
                                    {guardianName}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                                    {guardian.email && (
                                      <span className="flex items-center gap-1">
                                        <Icon icon="lucide:mail" className="w-3 h-3 text-[#C5A97A]" />
                                        <span className="truncate max-w-[160px]">{guardian.email}</span>
                                      </span>
                                    )}
                                    {(guardian.tel || guardian.phone) && (
                                      <span className="flex items-center gap-1">
                                        <Icon icon="lucide:phone" className="w-3 h-3 text-[#C5A97A]" />
                                        <span>{guardian.tel || guardian.phone}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Wards list with clickable chips */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto">
                                {wards.length > 0 ? (
                                  wards.map(student => {
                                    const wardName = `${student.first_name || student.name || ""} ${student.last_name || ""}`.trim();
                                    const wardActive = isStudentActive(student);

                                    return (
                                      <button
                                        key={student.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedStudentId(student.id);
                                          setIsStudentModalOpen(true);
                                        }}
                                        className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border group cursor-pointer ${
                                          wardActive
                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-400"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400"
                                        }`}
                                        title="Click to view student file"
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${wardActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                                        <span>{wardName}</span>
                                        <Icon icon="lucide:external-link" className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                      </button>
                                    );
                                  })
                                ) : (
                                  <span className="text-xs text-gray-400 italic">No student wards linked</span>
                                )}
                              </div>
                            </td>

                            {/* Wards Count */}
                            <td className="px-6 py-4 text-center">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                {wards.length} {wards.length === 1 ? "Ward" : "Wards"}
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td className="px-6 md:px-8 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedGuardian(guardian);
                                    setIsGuardianModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-[#C5A97A] hover:text-[#09314F] text-xs font-bold text-gray-700 dark:text-gray-200 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
                                  <span>View Profile</span>
                                </button>
                                {(guardian.tel || guardian.phone) && (
                                  <a
                                    href={`tel:${guardian.tel || guardian.phone}`}
                                    className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-500 hover:text-white text-gray-500 dark:text-gray-400 transition-all"
                                    title="Call Guardian"
                                  >
                                    <Icon icon="lucide:phone" className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {guardian.email && (
                                  <a
                                    href={`mailto:${guardian.email}`}
                                    className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white text-gray-500 dark:text-gray-400 transition-all"
                                    title="Send Email"
                                  >
                                    <Icon icon="lucide:mail" className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {totalGuardianPages > 1 && (
                <div className="px-6 md:px-8 py-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Page {currentPage} of {totalGuardianPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalGuardianPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalGuardianPages))}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AT-RISK & ACTION NEEDED STUDENTS FEED */}
          {activeTab === "at_risk" && (
            <div>
              {/* Filter Sub-bar */}
              <div className="px-6 md:px-8 py-3 bg-gray-50/60 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Filter:</span>
                  {[
                    { id: "all", label: "All Attention Needed" },
                    { id: "unpaid", label: "Unpaid / Expired" },
                    { id: "no_attempts", label: "Zero Mock Tests" },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => { setAtRiskFilter(f.id); setCurrentPage(1); }}
                      className={`px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                        atRiskFilter === f.id
                          ? "bg-white dark:bg-gray-800 text-[#09314F] dark:text-[#C5A97A] shadow-sm border border-gray-200 dark:border-gray-700"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-gray-400">
                  {atRiskStudents.length} students requiring advisor follow-up
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#B99E7F] text-white">
                      <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase tracking-widest">
                        Student Information
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                        Identified Issue / Flag
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                        Linked Guardian
                      </th>
                      <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                    {atRiskStudents.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-12 text-center text-sm font-medium text-gray-400">
                          <Icon icon="lucide:check-circle-2" className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                          <span className="font-bold text-gray-700 dark:text-gray-200 block">Great news!</span>
                          <span>No students currently flagged in this category.</span>
                        </td>
                      </tr>
                    ) : (
                      atRiskStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((student, idx) => {
                        const sName = `${student.first_name || student.name || ""} ${student.last_name || ""}`.trim() || "Student";
                        const sInitial = (student.first_name || "S")[0].toUpperCase();

                        return (
                          <tr key={student.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-colors">
                            {/* Student Info */}
                            <td className="px-6 md:px-8 py-4">
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black text-sm flex items-center justify-center shrink-0">
                                  {sInitial}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-[#09314F] dark:text-white block truncate">
                                    {sName}
                                  </span>
                                  <span className="text-xs text-gray-400 block truncate">
                                    {student.email || student.tel || "No contact"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Issues flags */}
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {student.issues.map((iss, iIdx) => (
                                  <span
                                    key={iIdx}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                      iss.type === "danger"
                                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                        : iss.type === "warning"
                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    }`}
                                  >
                                    {iss.label}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Linked Guardian */}
                            <td className="px-6 py-4 text-center">
                              {student.guardian ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedGuardian(student.guardian);
                                    setIsGuardianModalOpen(true);
                                  }}
                                  className="text-xs font-bold text-[#C5A97A] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                >
                                  <Icon icon="lucide:shield" className="w-3.5 h-3.5" />
                                  <span>{student.guardian.first_name} {student.guardian.last_name}</span>
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No Guardian Linked</span>
                              )}
                            </td>

                            {/* Action */}
                            <td className="px-6 md:px-8 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentId(student.id);
                                  setIsStudentModalOpen(true);
                                }}
                                className="px-4 py-1.5 rounded-xl bg-[#09314F] hover:bg-[#0c3f66] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                              >
                                Follow Up
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 4. MODALS FOR GUARDIAN AND STUDENT INSPECTION */}
      {isGuardianModalOpen && selectedGuardian && (
        <GuardianDetailsModal
          guardian={selectedGuardian}
          isOpen={isGuardianModalOpen}
          onClose={() => {
            setIsGuardianModalOpen(false);
            setSelectedGuardian(null);
          }}
          onViewStudent={(studentId) => {
            setIsGuardianModalOpen(false);
            setSelectedGuardian(null);
            setSelectedStudentId(studentId);
            setIsStudentModalOpen(true);
          }}
        />
      )}

      {isStudentModalOpen && selectedStudentId && (
        <AdminStudentViewModal
          studentId={selectedStudentId}
          isOpen={isStudentModalOpen}
          onClose={() => {
            setIsStudentModalOpen(false);
            setSelectedStudentId(null);
          }}
          onUpdate={() => {
            fetchData();
          }}
        />
      )}

    </StaffDashboardLayout>
  );
}
