import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { Icon } from "@iconify/react";
import { useNavigate, useLocation } from "react-router-dom";
import TutorPostClassReportModal from "../../../components/private/Tutor/TutorPostClassReportModal";
import { isAdminStaff } from "../../../utils/roleUtils";
import { 
  ClockIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  SparklesIcon,
  DocumentTextIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({
    kpis: {
      total_classes: 0,
      completed_sessions: 0,
      total_sessions: 0,
      sessions_this_month: 0,
      pending_grading_count: 0,
      total_assessments: 0,
      total_submissions: 0,
      overall_delivery_progress: 0,
    },
    class_progress: [],
    next_class: null,
    today_classes: [],
    pending_reports: [],
    assessments_summary: []
  });

  const [scheduleData, setScheduleData] = useState({
    next_class: null,
    today_classes: [],
    week_schedule: {},
    upcoming_sessions: []
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");
  const staffName = localStorage.getItem("staff_name") || "Tutor";

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState(null);

  const handleJoinClass = (session) => {
    if (!session) return;
    if (session.id) {
      navigate(`/classroom/${session.id}`);
      return;
    }
    const link = session.class_link || session.recording_link;
    if (link) {
      navigate('/staffs/meet', {
        state: {
          class_link: link,
          class_schedule_id: session.id,
          alreadyOpened: true
        }
      });
    }
  };

  // --- FETCHING LOGIC ---
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      // 1. Fetch comprehensive overview endpoint
      const overviewRes = await axios.get(`${API_BASE_URL}/api/tutor/dashboard/overview`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (overviewRes.data?.success && overviewRes.data.data) {
        const d = overviewRes.data.data;

        // Read client-side unreported sessions from leaving sessions
        const localUnreported = (() => {
          if (isAdminStaff()) return [];
          try {
            return JSON.parse(localStorage.getItem("tutor_unreported_sessions") || "[]");
          } catch (e) {
            return [];
          }
        })();

        // Clean out any future-dated sessions so classes in front (e.g. tomorrow Sep 28) never appear
        const validLocalUnreported = localUnreported.filter(loc => {
          const locDate = loc.session_date ? String(loc.session_date).slice(0, 10) : todayStr;
          return locDate <= todayStr;
        });
        if (validLocalUnreported.length !== localUnreported.length) {
          try {
            localStorage.setItem("tutor_unreported_sessions", JSON.stringify(validLocalUnreported));
          } catch (e) {}
        }

        const backendReports = (Array.isArray(d.pending_reports) ? d.pending_reports : []).filter(r => {
          const rDate = r.session_date ? String(r.session_date).slice(0, 10) : todayStr;
          return rDate <= todayStr;
        });

        const seenIds = new Set(backendReports.map(r => String(r.id)));
        const combinedReports = [...backendReports];

        for (const loc of validLocalUnreported) {
          if (!seenIds.has(String(loc.id))) {
            combinedReports.push({
              id: loc.id,
              class_id: loc.class_id || loc.id,
              class_title: loc.class_title || "Masterclass",
              class: {
                id: loc.class_id || loc.id,
                title: loc.class_title || "Masterclass",
                subject: { name: loc.subject || "General Subject" }
              },
              session_date: loc.session_date,
              starts_at: loc.starts_at,
              status: 'pending_report'
            });
            seenIds.add(String(loc.id));
          }
        }

        // Limit to max 4 most recent earlier items so it doesn't flood the dashboard
        const finalPendingReports = combinedReports.slice(0, 4);

        setOverviewData({
          kpis: d.kpis || {
            total_classes: 0,
            total_students: 0,
            sessions_this_month: 0,
            pending_grading_count: 0,
            total_assessments: 0,
            total_submissions: 0,
            overall_delivery_progress: 0,
          },
          class_progress: Array.isArray(d.class_progress) ? d.class_progress : [],
          next_class: d.next_class || null,
          today_classes: Array.isArray(d.today_classes) ? d.today_classes : [],
          pending_reports: finalPendingReports,
          assessments_summary: Array.isArray(d.assessments_summary) ? d.assessments_summary : []
        });

        // Set schedule data for modals
        setScheduleData(prev => ({
          ...prev,
          next_class: d.next_class || null,
          today_classes: Array.isArray(d.today_classes) ? d.today_classes : [],
        }));
      }

      // 2. Fetch schedule data for timetable and week calendar modal reference
      try {
        const scheduleRes = await axios.get(`${API_BASE_URL}/api/tutor/classes/schedule`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        const sched = scheduleRes.data || {};
        setScheduleData(prev => ({
          ...prev,
          next_class: sched.next_class || prev.next_class,
          today_classes: Array.isArray(sched.today_classes) ? sched.today_classes : prev.today_classes,
          week_schedule: sched.week_schedule || {},
          upcoming_sessions: Array.isArray(sched.upcoming_sessions) ? sched.upcoming_sessions : []
        }));
      } catch (schedErr) {
        console.warn("Schedule timetable secondary fetch notice:", schedErr);
      }

    } catch (error) {
      console.error("Dashboard overview fetch error, attempting schedule fallback:", error);
      // Fallback to schedule endpoint if overview endpoint unavailable
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tutor/classes/schedule`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        const data = response.data || {};
        const classes = Array.isArray(data.classes) ? data.classes : [];

        const localUnreported = (() => {
          if (isAdminStaff()) return [];
          try {
            return JSON.parse(localStorage.getItem("tutor_unreported_sessions") || "[]");
          } catch (e) {
            return [];
          }
        })();

        setScheduleData({
          next_class: data.next_class || null,
          today_classes: Array.isArray(data.today_classes) ? data.today_classes : [],
          week_schedule: data.week_schedule || {},
          upcoming_sessions: Array.isArray(data.upcoming_sessions) ? data.upcoming_sessions : []
        });

        setOverviewData(prev => ({
          ...prev,
          kpis: {
            ...prev.kpis,
            total_classes: classes.length,
            completed_sessions: prev.kpis.completed_sessions || 0,
            total_sessions: prev.kpis.total_sessions || 0,
            sessions_this_month: (data.upcoming_sessions?.length || 0) + (data.today_classes?.length || 0),
          },
          next_class: data.next_class || null,
          today_classes: Array.isArray(data.today_classes) ? data.today_classes : [],
          pending_reports: localUnreported
            .filter(loc => {
              const locDate = loc.session_date ? String(loc.session_date).slice(0, 10) : todayStr;
              return locDate <= todayStr;
            })
            .slice(0, 4)
            .map(loc => ({
              id: loc.id,
              class_id: loc.class_id || loc.id,
              class_title: loc.class_title || "Masterclass",
              class: {
                id: loc.class_id || loc.id,
                title: loc.class_title || "Masterclass",
                subject: { name: loc.subject || "General Subject" }
              },
              session_date: loc.session_date,
              starts_at: loc.starts_at,
              status: 'pending_report'
            }))
        }));
      } catch (fallbackErr) {
        console.error("Fatal dashboard fetch failure:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchDashboardData();

    // Real-time background sync ticker (refreshes every 45s so state stays updated)
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 45000);

    // Instant refresh when tutor focuses back on the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboardData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleUnreportedUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener("tutor-unreported-updated", handleUnreportedUpdate);
    window.addEventListener("storage", handleUnreportedUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("tutor-unreported-updated", handleUnreportedUpdate);
      window.removeEventListener("storage", handleUnreportedUpdate);
    };
  }, [fetchDashboardData]);

  // Check for feedback query parameter or sessionStorage upon leaving class
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const feedbackSessionId =
      searchParams.get("feedback_session") ||
      location.state?.completedSessionId ||
      sessionStorage.getItem("just_completed_class_session_id");

    if (feedbackSessionId) {
      sessionStorage.removeItem("just_completed_class_session_id");

      const staffRole = localStorage.getItem("staff_role") || "";
      if (isAdminStaff(staffRole)) {
        return;
      }

      const allSessions = [
        ...(overviewData.today_classes || []),
        ...(scheduleData.today_classes || []),
        ...Object.values(scheduleData.week_schedule || {}).flat(),
        ...(scheduleData.upcoming_sessions || []),
        ...(overviewData.next_class ? [overviewData.next_class] : [])
      ];

      const session = allSessions.find((s) => String(s.id) === String(feedbackSessionId));
      if (session) {
        setFeedbackSession({
          id: session.id,
          class_id: session.class_id || session.id,
          class_title: session.class?.title || session.class?.subject?.name || session.title || "Masterclass",
          subject: (typeof session.class?.subject === "object" ? session.class?.subject?.name : session.class?.subject) || "General Subject",
          topic: session.class?.title || session.title || "Lesson Session",
          date: session.session_date ? new Date(session.session_date).toLocaleDateString() : new Date().toLocaleDateString(),
          time: `${session.starts_at || 'TBD'} - ${session.ends_at || 'TBD'}`,
          tutor_name: staffName,
          present_count: session.attendances?.length ?? 0,
          total_students: 20,
        });
      } else {
        setFeedbackSession({
          id: feedbackSessionId,
          class_id: feedbackSessionId,
          class_title: "Master Class",
          subject: "Live Masterclass",
          topic: "Class Lesson",
          date: new Date().toLocaleDateString(),
          time: "Just Concluded",
          tutor_name: staffName,
          present_count: 0,
          total_students: 20,
        });
      }

      setFeedbackModalOpen(true);

      if (location.search || location.state?.promptPostClassReport) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.search, location.state, overviewData, scheduleData, navigate, location.pathname, staffName]);

  // Open feedback modal from pending report list
  const handleOpenReportModal = (session) => {
    setFeedbackSession({
      id: session.id,
      class_id: session.class_id || session.id,
      class_title: session.class?.title || session.class?.subject?.name || session.title || "Masterclass",
      subject: (typeof session.class?.subject === "object" ? session.class?.subject?.name : session.class?.subject) || "General Subject",
      topic: session.class?.title || session.title || "Lesson Session",
      date: session.session_date ? new Date(session.session_date).toLocaleDateString() : new Date().toLocaleDateString(),
      time: `${session.starts_at || 'TBD'} - ${session.ends_at || 'TBD'}`,
      tutor_name: staffName,
      present_count: session.attendances?.length ?? 0,
      total_students: 20,
    });
    setFeedbackModalOpen(true);
  };

  // --- HELPERS ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTimeStr = (timeStr) => {
    if (!timeStr) return "";
    if (typeof timeStr !== "string") return String(timeStr);
    if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm") || !timeStr.includes(":") || timeStr.includes("-")) {
      return timeStr;
    }
    const parts = timeStr.split(":");
    const hour = parseInt(parts[0], 10);
    if (isNaN(hour)) return timeStr;
    const m = parts[1] || "00";
    const ampm = hour >= 12 ? "pm" : "am";
    const h12 = hour % 12 || 12;
    return `${h12}:${m}${ampm}`;
  };

  const getInitials = (title) => {
    if (!title) return "MC";
    return title.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  };

  const activeNextClass = overviewData.next_class || scheduleData.next_class;
  const activeTodayClasses = overviewData.today_classes?.length > 0 
    ? overviewData.today_classes 
    : scheduleData.today_classes;

  const kpis = overviewData.kpis;

  return (
    <>
    <StaffDashboardLayout pagetitle="Overview">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen pb-24 font-sans">

        {/* ========================================================================= */}
        {/* 1. EXECUTIVE WELCOME & HERO BANNER                                        */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#09314F] via-[#0D3B5F] to-[#0A263D] text-white rounded-[32px] p-6 sm:p-8 mb-8 shadow-xl shadow-blue-950/10 border border-white/10">
          {/* Subtle Ambient Background Orbs */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Instructor Portal
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {getGreeting()}, {staffName.split(" ")[0]}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-2xl leading-relaxed">
                Here is your teaching command center with real-time syllabus tracking, learner engagement analytics, and pending instructional action items.
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => navigate('/staffs/tutor/assessments')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all shadow-sm"
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4 text-amber-300" />
                <span>Assessments</span>
              </button>
              <button
                onClick={() => navigate('/staffs/tutor/calendar')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all shadow-sm"
              >
                <CalendarDaysIcon className="w-4 h-4 text-blue-300" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => navigate('/staffs/tutor/master-class')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E83831] hover:bg-[#c92f29] active:scale-95 text-white text-xs font-black rounded-2xl transition-all shadow-lg shadow-red-950/20 tracking-wider uppercase"
              >
                <BookOpenIcon className="w-4 h-4" />
                <span>Master Classes</span>
              </button>
            </div>
          </div>

          {/* Real-time next session teaser strip */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E83831] animate-ping" />
              <span className="font-bold text-slate-200">
                {activeNextClass 
                  ? `Next Session: ${activeNextClass.class?.title || "Upcoming Masterclass"} (${formatTimeStr(activeNextClass.starts_at)})` 
                  : "No upcoming sessions on today's immediate queue."}
              </span>
            </div>
            {activeNextClass && (
              <button
                onClick={() => handleJoinClass(activeNextClass)}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] rounded-xl transition-all shadow-md active:scale-95 tracking-wider uppercase"
              >
                <VideoCameraIcon className="w-3.5 h-3.5" />
                Launch Class
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. REAL-TIME KPI METRICS GRID                                             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* Card 1: Assigned Classes */}
          <div 
            onClick={() => navigate('/staffs/tutor/master-class')}
            className="group cursor-pointer bg-white dark:bg-[#09314F] p-6 rounded-[28px] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-[#09314F] dark:text-blue-300 flex items-center justify-center transition-colors group-hover:bg-[#09314F] group-hover:text-white dark:group-hover:bg-blue-600">
                <AcademicCapIcon className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                Active Cohorts
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Assigned Classes</p>
            <div className="text-3xl font-black text-[#09314F] dark:text-white mt-1 tracking-tight">
              {loading ? (
                <div className="h-8 w-12 bg-slate-100 dark:bg-white/10 animate-pulse rounded-md" />
              ) : (
                kpis.total_classes
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center justify-between">
              <span>View class cohorts</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#09314F] dark:text-blue-300" />
            </p>
          </div>

          {/* Card 2: Completed Sessions */}
          <div 
            onClick={() => navigate('/staffs/tutor/master-class')}
            className="group cursor-pointer bg-white dark:bg-[#09314F] p-6 rounded-[28px] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                Delivered
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Completed Sessions</p>
            <div className="text-3xl font-black text-[#09314F] dark:text-white mt-1 tracking-tight">
              {loading ? (
                <div className="h-8 w-12 bg-slate-100 dark:bg-white/10 animate-pulse rounded-md" />
              ) : (
                kpis.completed_sessions ?? 0
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center justify-between">
              <span>{kpis.total_sessions ? `Out of ${kpis.total_sessions} total syllabus sessions` : "Sessions delivered to date"}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-emerald-600 dark:text-emerald-300" />
            </p>
          </div>

          {/* Card 3: Sessions This Month */}
          <div 
            onClick={() => navigate('/staffs/tutor/calendar')}
            className="group cursor-pointer bg-white dark:bg-[#09314F] p-6 rounded-[28px] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <CalendarDaysIcon className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                Monthly Load
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Sessions This Month</p>
            <div className="text-3xl font-black text-[#09314F] dark:text-white mt-1 tracking-tight">
              {loading ? (
                <div className="h-8 w-12 bg-slate-100 dark:bg-white/10 animate-pulse rounded-md" />
              ) : (
                kpis.sessions_this_month
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center justify-between">
              <span>View full calendar</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-indigo-600 dark:text-indigo-300" />
            </p>
          </div>

          {/* Card 4: Pending Grading Queue */}
          <div 
            onClick={() => navigate('/staffs/tutor/assessments')}
            className={`group cursor-pointer p-6 rounded-[28px] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
              kpis.pending_grading_count > 0 
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40' 
                : 'bg-white dark:bg-[#09314F] border-gray-100 dark:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                kpis.pending_grading_count > 0
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 group-hover:bg-amber-500 group-hover:text-white'
                  : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300'
              }`}>
                <ClipboardDocumentCheckIcon className="w-6 h-6" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                kpis.pending_grading_count > 0
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900'
              }`}>
                {kpis.pending_grading_count > 0 ? "Action Required" : "Up to Date"}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Pending Grading</p>
            <div className={`text-3xl font-black mt-1 tracking-tight ${
              kpis.pending_grading_count > 0 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-[#09314F] dark:text-white'
            }`}>
              {loading ? (
                <div className="h-8 w-12 bg-slate-100 dark:bg-white/10 animate-pulse rounded-md" />
              ) : (
                kpis.pending_grading_count
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center justify-between">
              <span>{kpis.pending_grading_count > 0 ? "Review submissions" : "All graded"}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-amber-600 dark:text-amber-400" />
            </p>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. TUTOR ACTION HUB & URGENT TO-DOS (Dynamic alerts)                      */}
        {/* ========================================================================= */}
        {(kpis.pending_grading_count > 0 || (overviewData.pending_reports && overviewData.pending_reports.length > 0)) && (
          <div className="mb-8 space-y-4">
            
            {/* Urgent: Pending Grading Alert */}
            {kpis.pending_grading_count > 0 && (
              <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
                      {kpis.pending_grading_count} Student Submission{kpis.pending_grading_count > 1 ? "s" : ""} Awaiting Your Evaluation
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                      Prompt grading boosts learner momentum and ensures accurate weekly performance metrics.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/staffs/tutor/assessments')}
                  className="self-start sm:self-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all tracking-wider uppercase flex items-center gap-2"
                >
                  <span>Grade Now</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Urgent: Pending Post-Class Reports */}
            {overviewData.pending_reports && overviewData.pending_reports.length > 0 && (
              <div className="bg-blue-500/10 dark:bg-blue-950/30 border border-blue-500/30 rounded-[24px] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#09314F] text-white flex items-center justify-center flex-shrink-0">
                      <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#09314F] dark:text-blue-200">
                        Post-Class Feedback Reports Pending ({overviewData.pending_reports.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Management requires reports submitted after concluding masterclass sessions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {overviewData.pending_reports.map((s) => (
                    <div key={s.id} className="bg-white dark:bg-[#09314F] border border-blue-100 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#09314F] dark:text-white truncate">
                          {s.class?.title || "Masterclass"}
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          {formatDate(s.session_date)} • {formatTimeStr(s.starts_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenReportModal(s)}
                        className="px-3 py-1.5 bg-[#09314F] hover:bg-[#E83831] text-white text-[11px] font-black rounded-xl transition-colors tracking-wider uppercase flex-shrink-0"
                      >
                        Submit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CURRICULUM DELIVERY & SYLLABUS TRACK (Replaces static 8% progress)     */}
        {/* ========================================================================= */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#09314F]/5 dark:bg-white/5 text-[#09314F] dark:text-blue-300">
                <Icon icon="solar:chart-2-bold" className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-wider">
                  Curriculum & Syllabus Delivery
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Track delivery progress across active subject cohorts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#09314F] dark:text-blue-300">
                Overall: {kpis.overall_delivery_progress}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#09314F] p-6 sm:p-7 rounded-[32px] border border-gray-100 dark:border-white/10 shadow-sm">
            {/* Global progress meter */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                <span>Academic Term Start</span>
                <span className="text-[#09314F] dark:text-white font-black">
                  {kpis.overall_delivery_progress}% Completed
                </span>
                <span>Term Target (100%)</span>
              </div>
              <div className="h-3.5 w-full bg-slate-100 dark:bg-black/30 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-[#10B981] rounded-full transition-all duration-1000 shadow-sm relative"
                  style={{ width: `${Math.min(100, Math.max(kpis.overall_delivery_progress, 4))}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Individual Class Delivery Cards */}
            {overviewData.class_progress && overviewData.class_progress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {overviewData.class_progress.map((cls) => (
                  <div 
                    key={cls.id}
                    className="p-5 rounded-2xl bg-slate-50/70 dark:bg-black/20 border border-slate-100 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {cls.subject_name}
                        </span>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                          {cls.progress_percent}%
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-[#09314F] dark:text-white leading-snug">
                        {cls.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        {cls.completed_sessions} of {cls.total_sessions} sessions delivered • {cls.remaining_sessions} remaining
                      </p>
                    </div>

                    {/* Progress bar per class */}
                    <div className="mt-4">
                      <div className="h-2 w-full bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#09314F] dark:bg-blue-500 rounded-full transition-all duration-700"
                          style={{ width: `${cls.progress_percent}%` }}
                        />
                      </div>

                      {cls.next_session && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-semibold truncate">
                            Next: {formatDate(cls.next_session.session_date)} ({formatTimeStr(cls.next_session.starts_at)})
                          </span>
                          {cls.next_session.class_link && (
                            <button
                              onClick={() => handleJoinClass(cls.next_session)}
                              className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-wider ml-2 flex-shrink-0"
                            >
                              Join Link
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 font-medium">
                No active class cohorts currently assigned to your profile.
              </div>
            )}

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. LIVE TEACHING AGENDA & NEXT CLASS HERO                                 */}
        {/* ========================================================================= */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#09314F]/5 dark:bg-white/5 text-[#09314F] dark:text-blue-300">
                <Icon icon="solar:calendar-bold" className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-wider">
                  Teaching Schedule & Next Session
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Your immediate instructional queue and class launchpads
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/staffs/tutor/master-class')}
              className="text-xs font-black text-[#09314F] dark:text-blue-300 hover:text-[#E83831] dark:hover:text-blue-400 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <span>Full Schedule</span>
              <ArrowRightIcon className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Prominent Next Class Card (Takes 2 cols on lg) */}
            <div className="lg:col-span-2">
              {activeNextClass ? (
                <div className="relative overflow-hidden bg-white dark:bg-[#09314F] p-6 sm:p-7 rounded-[32px] border-2 border-emerald-500 shadow-xl shadow-emerald-500/5 dark:shadow-none flex flex-col justify-between h-full">
                  <div className="absolute top-4 right-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      Next Up
                    </span>
                  </div>

                  <div>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-[22px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xl border border-emerald-200 dark:border-emerald-800/60 shadow-inner flex-shrink-0">
                        {getInitials(activeNextClass.class?.title)}
                      </div>
                      <div className="min-w-0 pr-16">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {activeNextClass.class?.subject?.name || "Academic Masterclass"}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-[#09314F] dark:text-white mt-0.5 leading-snug">
                          {activeNextClass.class?.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          {activeNextClass.title || "Curriculum Session"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/10 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                        <p className="font-black text-slate-700 dark:text-slate-200 mt-0.5">
                          {formatDate(activeNextClass.session_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Time</p>
                        <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {formatTimeStr(activeNextClass.starts_at)} - {formatTimeStr(activeNextClass.ends_at)}
                        </p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                        <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Scheduled Session
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400 font-medium">
                      Ready to start the lesson?
                    </span>
                    <button
                      onClick={() => handleJoinClass(activeNextClass)}
                      className="px-6 py-3 bg-[#09314F] hover:bg-[#E83831] active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition-all tracking-wider uppercase flex items-center gap-2"
                    >
                      <VideoCameraIcon className="w-4 h-4" />
                      <span>Launch Class Meeting</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#09314F] p-8 rounded-[32px] border border-gray-100 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[260px]">
                  <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center mb-3">
                    <CheckCircleIcon className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-black text-[#09314F] dark:text-white">
                    All Clear For Now!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    No immediate upcoming class sessions scheduled on today's roster. Check your calendar for upcoming dates.
                  </p>
                  <button
                    onClick={() => navigate('/staffs/tutor/calendar')}
                    className="mt-4 px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[#09314F] dark:text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Open Master Calendar
                  </button>
                </div>
              )}
            </div>

            {/* Today's Other Sessions List (1 col) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                Today's Other Sessions
              </h3>

              {activeTodayClasses && activeTodayClasses.filter(s => s.id !== activeNextClass?.id).length > 0 ? (
                activeTodayClasses
                  .filter(s => s.id !== activeNextClass?.id)
                  .slice(0, 3)
                  .map((session) => (
                    <div 
                      key={session.id} 
                      className="bg-white dark:bg-[#09314F] p-5 rounded-[24px] border border-gray-100 dark:border-white/10 shadow-sm flex items-center justify-between gap-3 group hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            Today
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {formatTimeStr(session.starts_at)}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-[#09314F] dark:text-white truncate">
                          {session.class?.title || "Master Class"}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleJoinClass(session)}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-[#09314F] hover:text-white dark:hover:bg-blue-600 transition-colors"
                        title="Join / Launch Session"
                      >
                        <VideoCameraIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              ) : (
                <div className="bg-slate-50/50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-[24px] p-6 text-center">
                  <p className="text-xs font-semibold text-slate-400">
                    No additional sessions today.
                  </p>
                </div>
              )}

              {/* Quick Assessment Toolkit Card */}
              <div className="bg-gradient-to-br from-[#09314F]/5 to-[#E83831]/5 dark:from-white/5 dark:to-white/5 border border-gray-100 dark:border-white/10 rounded-[24px] p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <SparklesIcon className="w-4 h-4 text-[#E83831]" />
                  <span className="text-xs font-black text-[#09314F] dark:text-white uppercase tracking-wider">
                    Quick Assessment Tool
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Author new MCQ or theory tests, publish to student cohorts, and review scores.
                </p>
                <button
                  onClick={() => navigate('/staffs/tutor/assessments')}
                  className="mt-3 w-full py-2 bg-[#09314F] dark:bg-blue-600 hover:bg-[#E83831] dark:hover:bg-blue-500 text-white text-[11px] font-black rounded-xl transition-all shadow-sm tracking-wider uppercase"
                >
                  Go to Assessments
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. TUTOR QUICK TOOLKIT SHORTCUTS                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/staffs/tutor/master-class')}
            className="p-4 rounded-2xl bg-white dark:bg-[#09314F] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <BookOpenIcon className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-black text-[#09314F] dark:text-white">Master Classes</h4>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Assigned subject modules</p>
          </button>

          <button
            onClick={() => navigate('/staffs/tutor/calendar')}
            className="p-4 rounded-2xl bg-white dark:bg-[#09314F] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <CalendarDaysIcon className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-black text-[#09314F] dark:text-white">Timetable Calendar</h4>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Month & week schedule</p>
          </button>

          <button
            onClick={() => navigate('/staffs/tutor/assessments')}
            className="p-4 rounded-2xl bg-white dark:bg-[#09314F] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-black text-[#09314F] dark:text-white">Grading & Tests</h4>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Grade student tests</p>
          </button>

          <button
            onClick={() => navigate('/staffs/leaderboard')}
            className="p-4 rounded-2xl bg-white dark:bg-[#09314F] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <TrophyIcon className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-black text-[#09314F] dark:text-white">Student Leaderboard</h4>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Top rank & engagement</p>
          </button>
        </div>

      </div>
    </StaffDashboardLayout>



    {/* ====== POST-CLASS TUTOR REPORT POPUP MODAL ====== */}
    <TutorPostClassReportModal 
      isOpen={feedbackModalOpen}
      onClose={() => {
        setFeedbackModalOpen(false);
        fetchDashboardData();
      }}
      sessionDetails={feedbackSession}
      onSubmitSuccess={() => {
        setFeedbackModalOpen(false);
        if (feedbackSession?.id) {
          try {
            const stored = JSON.parse(localStorage.getItem("tutor_unreported_sessions") || "[]");
            const updated = stored.filter(s => String(s.id) !== String(feedbackSession.id));
            localStorage.setItem("tutor_unreported_sessions", JSON.stringify(updated));
          } catch (e) {}
        }
        fetchDashboardData();
      }}
      onSkip={() => {
        setFeedbackModalOpen(false);
        fetchDashboardData();
      }}
    />
    </>
  );
}
