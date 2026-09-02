import React, { useState, useEffect, useCallback, useMemo } from "react";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";
import axios from "axios";
import { 
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BellIcon
} from "@heroicons/react/24/outline";

export default function StaffStudentSchedule() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");
  const staffRole = (localStorage.getItem("staff_role") || "").toLowerCase();
  const isAdvisor = staffRole === "course_advisor" || staffRole === "advisor";

  // --- STATE ---
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().substring(0, 10);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'live', 'scheduled', 'completed'
  const [loading, setLoading] = useState(true);
  const [classesData, setClassesData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [expandedClassIds, setExpandedClassIds] = useState({});
  const [showLiveNotifications, setShowLiveNotifications] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState([]);

  // --- FETCH SCHEDULE & ENROLLED STUDENTS ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      };

      // Fetch classes schedule based on role
      const scheduleUrl = isAdvisor
        ? `${API_BASE_URL}/api/advisor/classes/schedule`
        : `${API_BASE_URL}/api/admin/classes/all`;

      const studentsUrl = isAdvisor
        ? `${API_BASE_URL}/api/advisor/students/all`
        : `${API_BASE_URL}/api/admin/students/all`;

      const [scheduleRes, studentsRes] = await Promise.all([
        axios.get(scheduleUrl, config).catch((e) => {
          console.warn("Failed schedule fetch:", e);
          return { data: {} };
        }),
        axios.get(studentsUrl, config).catch((e) => {
          console.warn("Failed students fetch:", e);
          return { data: [] };
        }),
      ]);

      // Parse students list
      const rawStudents = studentsRes.data?.students || studentsRes.data?.data || studentsRes.data || [];
      const parsedStudents = Array.isArray(rawStudents) ? rawStudents : [];
      setStudentsData(parsedStudents);

      // Parse classes & sessions
      const sData = scheduleRes.data || {};
      let allSessionsList = [];

      if (Array.isArray(sData.classes)) {
        sData.classes.forEach((cls) => {
          const subject = cls.subject;
          const staffs = cls.staffs || [];
          const schedules = cls.schedules || [];
          schedules.forEach((sch) => {
            const sessions = sch.sessions || [];
            sessions.forEach((ses) => {
              allSessionsList.push({
                ...ses,
                class: {
                  ...cls,
                  subject: subject,
                  staffs: staffs,
                },
              });
            });
          });
        });
      } else {
        const today = Array.isArray(sData.today_classes) ? sData.today_classes : [];
        const upcoming = Array.isArray(sData.upcoming_sessions) ? sData.upcoming_sessions : [];
        const past = Array.isArray(sData.past_sessions) ? sData.past_sessions : [];
        const week = sData.week_schedule && typeof sData.week_schedule === "object" ? Object.values(sData.week_schedule).flat() : [];
        const directSessions = Array.isArray(sData.sessions) ? sData.sessions : [];

        const merged = [...today, ...upcoming, ...past, ...week, ...directSessions];
        const map = new Map();
        merged.forEach((item) => {
          if (item && item.id) map.set(String(item.id), item);
        });
        allSessionsList = Array.from(map.values());
      }

      setClassesData(allSessionsList);

      // Automatically expand the first 2 classes by default
      const initialExpanded = {};
      allSessionsList.slice(0, 3).forEach((s) => {
        initialExpanded[s.id] = true;
      });
      setExpandedClassIds(initialExpanded);

      // Extract sample live notifications from recent joins
      const logs = [];
      allSessionsList.forEach((ses) => {
        const attends = ses.attendances || [];
        attends.forEach((att) => {
          if (att.joined_at) {
            logs.push({
              id: `${ses.id}-${att.student_id}`,
              student_name: att.student ? `${att.student.firstname} ${att.student.surname}` : "Student",
              class_title: ses.class?.title || ses.class?.subject?.name || "Masterclass",
              subject: ses.class?.subject?.name || "General",
              joined_at: att.joined_at,
              status: att.status || "present",
            });
          }
        });
      });
      setNotificationLogs(logs.slice(0, 15));

      // Detailed debug logs for schedule & attendance
      console.group("📅 [StudentSchedule] Live Schedules & Attendance Diagnostics");
      console.log("🔑 Staff Role:", staffRole || "admin/staff", "| Is Advisor:", isAdvisor);
      console.log("📡 Schedule API URL:", scheduleUrl);
      console.log("👥 Students API URL:", studentsUrl);
      console.log("📚 Total Sessions Loaded:", allSessionsList.length, allSessionsList);
      console.log("🎓 Total Registered Students Directory:", parsedStudents.length, parsedStudents);
      console.log("🔔 Recent Live Join Logs:", logs);
      console.groupEnd();

      // Sample first 3 classes attendance breakdown
      if (allSessionsList.length > 0) {
        console.group("🔍 [StudentSchedule] Class Attendance Breakdown Sample");
        allSessionsList.slice(0, 5).forEach((ses) => {
          const subName = (typeof ses.class?.subject === "object" ? ses.class?.subject?.name : ses.class?.subject) || "Subject";
          const title = ses.class?.title || ses.title || `${subName} Masterclass`;
          const atts = ses.attendances || [];
          console.log(`📖 [${title} - ${subName}] (Date: ${ses.session_date || "Today"} | Time: ${ses.starts_at}-${ses.ends_at})`, {
            session_id: ses.id,
            attendance_records: atts.length,
            attendances: atts,
          });
        });
        console.groupEnd();
      }

    } catch (error) {
      console.error("❌ Failed to load student schedule data:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token, isAdvisor, staffRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HELPERS ---
  const formatDateStr = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTimeStr = (timeStr) => {
    if (!timeStr) return "TBD";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "pm" : "am";
    const h12 = hour % 12 || 12;
    return `${h12}:${m}${ampm}`;
  };

  const getSessionClassState = (session) => {
    if (!session || !session.session_date) return "scheduled";
    const now = new Date();
    const sessionDate = new Date(session.session_date);
    const isToday = sessionDate.toDateString() === now.toDateString();

    if (!isToday) {
      return sessionDate < now ? "completed" : "scheduled";
    }

    if (session.starts_at && session.ends_at) {
      const [startH, startM] = session.starts_at.split(":").map(Number);
      const [endH, endM] = session.ends_at.split(":").map(Number);

      const startTime = new Date();
      startTime.setHours(startH, startM, 0, 0);

      const endTime = new Date();
      endTime.setHours(endH, endM, 0, 0);

      if (now >= startTime && now <= endTime) return "live";
      if (now > endTime) return "completed";
      return "scheduled";
    }

    return "scheduled";
  };

  // Check if student is enrolled in a specific subject
  const isStudentEnrolled = (student, subjectId, subjectName) => {
    if (!student) return false;
    const subIdStr = String(subjectId);
    const subNameLower = (subjectName || "").toLowerCase().trim();

    // 1. Direct subject_enrollments
    const enrollments = student.subject_enrollments || student.subjects || [];
    if (Array.isArray(enrollments)) {
      if (enrollments.some((s) => String(s.subject_id || s.id) === subIdStr)) return true;
      if (subNameLower && enrollments.some((s) => (s.name || s.subject?.name || "").toLowerCase().trim() === subNameLower)) return true;
    }

    // 2. Student information JSON
    const info = Array.isArray(student.information) ? student.information[0] : student.information;
    if (info && info.subjects && Array.isArray(info.subjects)) {
      if (info.subjects.some((s) => String(s.id || s.subject_id) === subIdStr || (s.name || "").toLowerCase().trim() === subNameLower)) return true;
    }

    return false;
  };

  // Get enrolled students for a specific session/class
  const getEnrolledStudentsForClass = useCallback((session) => {
    const subjectId = session.class?.subject_id || session.class?.subject?.id;
    const subjectName = typeof session.class?.subject === "object" ? session.class?.subject?.name : session.class?.subject;

    // Filter all registered students who have this subject in their enrollment
    let enrolled = studentsData.filter((st) => isStudentEnrolled(st, subjectId, subjectName));

    // Fallback if no matching subject enrollment found: map attendance records so attending students always show
    if (enrolled.length === 0 && session.attendances && session.attendances.length > 0) {
      enrolled = session.attendances
        .map((att) => att.student || studentsData.find((s) => s.id === att.student_id))
        .filter(Boolean);
    }

    return enrolled;
  }, [studentsData]);

  // Build attendance detail for a specific student in a class session
  const getStudentAttendanceInfo = (student, session) => {
    const attendances = session.attendances || [];
    const attRecord = attendances.find((a) => a.student_id === student.id || a.student?.id === student.id);

    if (!attRecord) {
      return {
        status: "absent",
        joined_at: null,
        left_at: null,
        rejoin_count: 0,
        duration_minutes: 0,
        is_clean_exit: false,
      };
    }

    const joinedAt = attRecord.joined_at ? new Date(attRecord.joined_at) : null;
    const leftAt = attRecord.left_at ? new Date(attRecord.left_at) : null;
    let duration = 0;

    if (joinedAt && leftAt) {
      duration = Math.max(1, Math.round((leftAt - joinedAt) / 60000));
    } else if (attRecord.attendance_duration) {
      duration = Number(attRecord.attendance_duration) || 0;
    }

    return {
      status: attRecord.status || "present",
      joined_at: joinedAt ? joinedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
      left_at: leftAt ? leftAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
      rejoin_count: attRecord.rejoin_count || 0,
      duration_minutes: duration,
      is_clean_exit: Boolean(attRecord.left_at),
    };
  };

  // Toggle card expansion
  const toggleCardExpansion = (id) => {
    setExpandedClassIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // --- FILTERED SESSIONS LIST ---
  const filteredSessions = useMemo(() => {
    return classesData.filter((session) => {
      // 1. Date Filter
      if (selectedDate && session.session_date) {
        const sessionDate = session.session_date.substring(0, 10);
        if (sessionDate !== selectedDate) return false;
      }

      // 2. Status Filter
      const state = getSessionClassState(session);
      if (statusFilter !== "all" && state !== statusFilter) return false;

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (session.class?.title || "").toLowerCase().includes(q);
        const subjectName = typeof session.class?.subject === "object" ? session.class?.subject?.name : session.class?.subject;
        const subjectMatch = (subjectName || "").toLowerCase().includes(q);
        const tutorMatch = (session.class?.staffs || []).some((st) => `${st.firstname} ${st.surname}`.toLowerCase().includes(q));

        // Check if any student name matches
        const enrolled = getEnrolledStudentsForClass(session);
        const studentMatch = enrolled.some((st) => `${st.firstname} ${st.surname} ${st.email}`.toLowerCase().includes(q));

        if (!titleMatch && !subjectMatch && !tutorMatch && !studentMatch) return false;
      }

      return true;
    });
  }, [classesData, selectedDate, statusFilter, searchQuery, getEnrolledStudentsForClass]);

  return (
    <StaffDashboardLayout pagetitle="Student Schedule & Live Attendance">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full min-h-screen space-y-8 pb-24">

        {/* ── TOP HEADER & CONTROL BAR ─────────────────────────────── */}
        <div className="bg-white dark:bg-[#09314F] rounded-[32px] p-6 border border-gray-100 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black text-[#0F2843] dark:text-[#C5A97A] uppercase tracking-widest">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{isAdvisor ? "Course Advisor Schedule Hub" : "Administrator Master Roster"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F2843] dark:text-white tracking-tight">
              Student Schedule & Attendance
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">
              View daily scheduled classes with full enrolled student rosters, join timestamps, rejoin events, and stay durations directly inside each class card.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowLiveNotifications(!showLiveNotifications)}
              className={`relative px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
                showLiveNotifications
                  ? "bg-[#0F2843] text-white border-[#0F2843] dark:bg-[#C5A97A] dark:text-[#09314F]"
                  : "bg-gray-50 dark:bg-black/20 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-100"
              }`}
            >
              <BellIcon className="w-4 h-4" />
              <span>Live Ticker</span>
              {notificationLogs.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-3 bg-gray-50 hover:bg-gray-100 dark:bg-black/20 dark:hover:bg-black/40 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 rounded-2xl transition-all"
              title="Refresh Schedule"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin text-[#0F2843] dark:text-[#C5A97A]" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── LIVE ACTIVITY TICKER (Collapsible Drawer) ───────────── */}
        {showLiveNotifications && (
          <div className="bg-gradient-to-r from-[#0F2843] to-[#1E3A5F] text-white rounded-3xl p-5 border border-white/10 shadow-lg animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C5A97A]">Live Attendance Stream</h4>
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase">{notificationLogs.length} Recent Joins</span>
            </div>

            {notificationLogs.length === 0 ? (
              <p className="text-xs text-white/70 italic py-2">No live join activity recorded yet today.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {notificationLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-3 shrink-0 min-w-[260px] border border-white/10 text-xs"
                  >
                    <div className="flex items-center justify-between font-black text-white mb-1">
                      <span className="truncate max-w-[170px]">{log.student_name}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/80 truncate">{log.subject} &bull; {log.class_title}</p>
                    <p className="text-[10px] text-[#C5A97A] font-bold mt-1">
                      Joined at {new Date(log.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DATE NAVIGATOR & FILTERS ─────────────────────────────── */}
        <div className="bg-white dark:bg-[#09314F] rounded-3xl p-5 border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Quick Date Pills */}
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: "Today", offset: 0 },
                { label: "Tomorrow", offset: 1 },
                { label: "Yesterday", offset: -1 },
              ].map((btn, idx) => {
                const target = new Date();
                target.setDate(target.getDate() + btn.offset);
                const targetStr = target.toISOString().substring(0, 10);
                const isActive = selectedDate === targetStr;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(targetStr)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#0F2843] dark:bg-[#C5A97A] text-white dark:text-[#09314F] shadow-md shadow-slate-200 dark:shadow-none"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-black/20 dark:hover:bg-black/40 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}

              {/* Specific Date Picker */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 shrink-0">
                <CalendarDaysIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-black text-gray-800 dark:text-white outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "All Classes" },
                { id: "live", label: "🟢 Live Now" },
                { id: "scheduled", label: "🕒 Scheduled" },
                { id: "completed", label: "✅ Completed" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === st.id
                      ? "bg-blue-50 dark:bg-blue-950/60 text-[#0F2843] dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subject (e.g. Biology), class topic, tutor, or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl text-xs font-bold text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] transition-all"
            />
          </div>
        </div>

        {/* ── SCHEDULE CARDS CONTAINER ─────────────────────────────── */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-50 dark:bg-black/20 rounded-[32px] border border-gray-100 dark:border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-[#09314F] rounded-[32px] p-12 border border-gray-100 dark:border-white/10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0F2843] dark:text-blue-300 flex items-center justify-center mx-auto text-2xl font-black">
              <CalendarDaysIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-gray-800 dark:text-white">No Scheduled Classes Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No masterclasses are scheduled for {formatDateStr(selectedDate)}. Choose another date or adjust your filters above.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredSessions.map((session) => {
              const isExpanded = !!expandedClassIds[session.id];
              const state = getSessionClassState(session);
              const subjectName = (typeof session.class?.subject === "object" ? session.class?.subject?.name : session.class?.subject) || "General Subject";
              const classTitle = session.class?.title || session.title || `${subjectName} Masterclass`;
              const enrolledStudents = getEnrolledStudentsForClass(session);
              
              // Calculate Attendance Breakdown
              let presentCount = 0;
              let lateCount = 0;
              let disconnectedCount = 0;
              let absentCount = 0;

              enrolledStudents.forEach((st) => {
                const info = getStudentAttendanceInfo(st, session);
                if (info.status === "present") presentCount++;
                else if (info.status === "late") lateCount++;
                else if (info.status === "absent") absentCount++;
                if (info.rejoin_count > 0 || (info.joined_at && !info.is_clean_exit && state === "completed")) {
                  disconnectedCount++;
                }
              });

              // Tutor information
              const tutor = session.class?.staffs?.find((s) => s.role === "lead" || s.role === "tutor") || session.class?.staffs?.[0];
              const tutorName = tutor ? `${tutor.firstname} ${tutor.surname}` : "Assigned Tutor";

              return (
                <div
                  key={session.id}
                  className="bg-white dark:bg-[#09314F] rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* ── CARD HEADER (Schedule Details & Quick Stats) ── */}
                  <div className="p-6 sm:p-7 border-b border-gray-100 dark:border-white/10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left: Class Subject & Topic */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#0F2843] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {subjectName}
                          </span>
                          
                          {/* Live / Status Indicator */}
                          {state === "live" ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Live Now
                            </span>
                          ) : state === "completed" ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                              Completed
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              Upcoming
                            </span>
                          )}

                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {formatDateStr(session.session_date)}
                          </span>
                        </div>

                        <h2 className="text-xl font-black text-[#0F2843] dark:text-white tracking-tight">
                          {classTitle}
                        </h2>

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-300 font-medium">
                          <span className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            {formatTimeStr(session.starts_at)} - {formatTimeStr(session.ends_at)}
                          </span>
                          <span>&bull;</span>
                          <span className="font-bold text-gray-700 dark:text-gray-200">
                            Tutor: {tutorName}
                          </span>
                        </div>
                      </div>

                      {/* Right: Quick Attendance Summary Metrics */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 px-3.5 py-2 rounded-2xl text-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Enrolled</span>
                          <span className="text-sm font-black text-[#0F2843] dark:text-white">{enrolledStudents.length}</span>
                        </div>

                        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 rounded-2xl text-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Present</span>
                          <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">{presentCount}</span>
                        </div>

                        {lateCount > 0 && (
                          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-2 rounded-2xl text-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">Late</span>
                            <span className="text-sm font-black text-amber-700 dark:text-amber-300">{lateCount}</span>
                          </div>
                        )}

                        {disconnectedCount > 0 && (
                          <div className="bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-3.5 py-2 rounded-2xl text-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 block">Rejoined</span>
                            <span className="text-sm font-black text-orange-700 dark:text-orange-300">{disconnectedCount}</span>
                          </div>
                        )}

                        <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-2 rounded-2xl text-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block">Absent</span>
                          <span className="text-sm font-black text-rose-700 dark:text-rose-300">{absentCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expand / Collapse Roster Trigger */}
                    <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Attendance Roster for {subjectName} ({enrolledStudents.length} Registered Students)
                      </span>

                      <button
                        onClick={() => toggleCardExpansion(session.id)}
                        className="px-4 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-black text-gray-700 dark:text-white flex items-center gap-1.5 transition-all"
                      >
                        <span>{isExpanded ? "Hide Student Roster" : "View Registered Students"}</span>
                        {isExpanded ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* ── CARD BODY (Registered Students & Attendance List) ── */}
                  {isExpanded && (
                    <div className="p-6 bg-slate-50/60 dark:bg-black/20 space-y-4 animate-in fade-in duration-150">
                      {enrolledStudents.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-xs font-bold">
                          No students are registered for this subject ({subjectName}) yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#09314F]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-black/30 text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider text-[10px] border-b border-gray-200 dark:border-white/10">
                              <tr>
                                <th className="py-3 px-4">Student</th>
                                <th className="py-3 px-4">Attendance Status</th>
                                <th className="py-3 px-4">Join Time</th>
                                <th className="py-3 px-4">Last Seen / Left</th>
                                <th className="py-3 px-4">Rejoin / Disconnects</th>
                                <th className="py-3 px-4">Stay Duration</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium text-gray-700 dark:text-gray-200">
                              {enrolledStudents.map((student) => {
                                const att = getStudentAttendanceInfo(student, session);
                                const initials = `${student.firstname?.[0] || ""}${student.surname?.[0] || ""}`.toUpperCase() || "ST";

                                return (
                                  <tr
                                    key={student.id}
                                    className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors"
                                  >
                                    {/* Student Identity */}
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F2843] to-[#1E3A5F] text-white font-black text-xs flex items-center justify-center shrink-0">
                                          {initials}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-bold text-gray-900 dark:text-white truncate">
                                            {student.firstname} {student.surname}
                                          </p>
                                          <p className="text-[10px] text-gray-400 truncate">{student.email}</p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Attendance Status */}
                                    <td className="py-3.5 px-4">
                                      {att.status === "present" ? (
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                          ● Present
                                        </span>
                                      ) : att.status === "late" ? (
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                          ● Late
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                                          ● Absent
                                        </span>
                                      )}
                                    </td>

                                    {/* Join Time */}
                                    <td className="py-3.5 px-4 font-bold text-gray-600 dark:text-gray-300">
                                      {att.joined_at || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                    </td>

                                    {/* Last Active / Left */}
                                    <td className="py-3.5 px-4 font-bold text-gray-600 dark:text-gray-300">
                                      {att.left_at || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                    </td>

                                    {/* Rejoin / Drop count */}
                                    <td className="py-3.5 px-4">
                                      {att.rejoin_count > 0 ? (
                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                                          ⚠️ Rejoined {att.rejoin_count}x
                                        </span>
                                      ) : att.status !== "absent" ? (
                                        <span className="text-[11px] text-gray-400 font-bold">Stable (0)</span>
                                      ) : (
                                        <span className="text-gray-300 dark:text-gray-600">—</span>
                                      )}
                                    </td>

                                    {/* Stay Duration */}
                                    <td className="py-3.5 px-4">
                                      {att.duration_minutes > 0 ? (
                                        <div className="space-y-1">
                                          <span className="font-black text-[#0F2843] dark:text-[#C5A97A]">
                                            {att.duration_minutes} mins
                                          </span>
                                          <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-emerald-500 rounded-full"
                                              style={{ width: `${Math.min(100, (att.duration_minutes / 60) * 100)}%` }}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-300 dark:text-gray-600">0 mins</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
