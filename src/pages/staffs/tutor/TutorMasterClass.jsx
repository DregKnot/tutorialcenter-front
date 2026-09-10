import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TutorPostClassReportModal from "../../../components/private/Tutor/TutorPostClassReportModal";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  LinkIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  ClockIcon,
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

export default function TutorMasterClass() {
  const [scheduleData, setScheduleData] = useState({
    next_class: null,
    today_classes: [],
    week_schedule: {},
    upcoming_sessions: [],
    sessions: [],
    classes: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("classes"); // "classes" | "timeline"
  const [timelineFilter, setTimelineFilter] = useState("all"); // "all" | "today" | "week" | "upcoming" | "past"
  const [toast, setToast] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const staffName = localStorage.getItem("staff_name") || "Tutor";
  const token = localStorage.getItem("staff_token");

  // --- FETCHING LOGIC ---
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tutor/classes/schedule`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      const data = response.data || {};
      
      setScheduleData({
        next_class: data.next_class || null,
        today_classes: Array.isArray(data.today_classes) ? data.today_classes : [],
        week_schedule: data.week_schedule || {},
        upcoming_sessions: Array.isArray(data.upcoming_sessions) ? data.upcoming_sessions : [],
        sessions: Array.isArray(data.sessions) ? data.sessions : (Array.isArray(data.upcoming_sessions) ? data.upcoming_sessions : []),
        classes: Array.isArray(data.classes) ? data.classes : []
      });

    } catch (error) {
      console.error("Fetch error:", error);
      setToast({ type: "error", message: "Failed to load master class schedule." });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Check for feedback query parameter or state/storage from leaving a masterclass
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const feedbackSessionId =
      searchParams.get("feedback_session") ||
      location.state?.completedSessionId ||
      sessionStorage.getItem("just_completed_class_session_id");

    if (feedbackSessionId) {
      sessionStorage.removeItem("just_completed_class_session_id");

      const allSessions = [
        ...(scheduleData.today_classes || []),
        ...Object.values(scheduleData.week_schedule || {}).flat(),
        ...(scheduleData.upcoming_sessions || []),
        ...(scheduleData.sessions || []),
        ...(scheduleData.next_class ? [scheduleData.next_class] : [])
      ];

      const session = allSessions.find(s => String(s.id) === String(feedbackSessionId));
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
  }, [location.search, location.state, scheduleData, navigate, location.pathname, staffName]);

  // --- HELPERS ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDayName = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "pm" : "am";
    const h12 = hour % 12 || 12;
    return `${h12}:${m}${ampm}`;
  };

  const getInitials = (title) => {
    if (!title) return "MC";
    return title.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const isPast = (session) => {
    if (!session || !session.session_date) return false;
    const now = new Date();
    const sDate = new Date(session.session_date);
    const sessionDay = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (sessionDay < today) return true;
    if (sessionDay > today) return false;

    const timeStr = session.ends_at || session.starts_at;
    if (timeStr) {
      const parts = timeStr.split(":");
      const sessionEnd = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate(), parseInt(parts[0], 10), parseInt(parts[1], 10));
      if (sessionEnd < now) return true;
    }
    return false;
  };

  // --- FILTERED DATA ---
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return scheduleData.classes || [];
    const q = searchQuery.toLowerCase();
    return (scheduleData.classes || []).filter(c => 
      c.title?.toLowerCase().includes(q) ||
      c.subject?.name?.toLowerCase().includes(q) ||
      (Array.isArray(c.subject?.courses) && c.subject.courses.some(cr => cr.title?.toLowerCase().includes(q)))
    );
  }, [scheduleData.classes, searchQuery]);

  const flattenedSessions = useMemo(() => {
    const map = new Map();
    const add = (s) => {
      if (!s || !s.id) return;
      if (!map.has(s.id)) map.set(s.id, s);
    };

    if (scheduleData.next_class) add(scheduleData.next_class);
    (scheduleData.today_classes || []).forEach(add);
    Object.values(scheduleData.week_schedule || {}).flat().forEach(add);
    (scheduleData.upcoming_sessions || []).forEach(add);
    (scheduleData.sessions || []).forEach(add);

    return Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(`${a.session_date}T${a.starts_at || '00:00'}`);
      const dateB = new Date(`${b.session_date}T${b.starts_at || '00:00'}`);
      return dateA - dateB;
    });
  }, [scheduleData]);

  const filteredSessions = useMemo(() => {
    let list = flattenedSessions;

    // Timeline tab filters
    if (timelineFilter === "today") {
      const todayStr = new Date().toISOString().split("T")[0];
      list = list.filter(s => s.session_date?.startsWith(todayStr));
    } else if (timelineFilter === "week") {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      list = list.filter(s => {
        const d = new Date(s.session_date);
        return d >= startOfWeek && d <= endOfWeek;
      });
    } else if (timelineFilter === "upcoming") {
      list = list.filter(s => !isPast(s));
    } else if (timelineFilter === "past") {
      list = list.filter(s => isPast(s));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.class?.title?.toLowerCase().includes(q) ||
        s.class?.subject?.name?.toLowerCase().includes(q) ||
        s.session_date?.includes(q)
      );
    }

    return list;
  }, [flattenedSessions, timelineFilter, searchQuery]);

  // --- ACTIONS ---
  const handleOpenLaunchModal = (session) => {
    setSelectedSession(session);
  };

  const handleLaunchWebClass = (session) => {
    if (!session?.id) return;
    navigate(`/classroom/${session.id}`);
  };

  const handleLaunchZoomApp = (session) => {
    if (!session?.class_link) return;
    navigate('/staffs/meet/app', {
      state: {
        class_link: session.class_link,
        class_schedule_id: session.id
      }
    });
  };

  const handleOpenReportModal = (session) => {
    setFeedbackSession({
      id: session.id,
      class_id: session.class_id || session.class?.id,
      class_title: session.class?.title || session.class?.subject?.name || "Masterclass",
      subject: session.class?.subject?.name || "General Subject",
      topic: session.class?.title || "Class Session",
      date: session.session_date ? new Date(session.session_date).toLocaleDateString() : new Date().toLocaleDateString(),
      time: `${session.starts_at || 'TBD'} - ${session.ends_at || 'TBD'}`,
      tutor_name: staffName,
      present_count: session.attendances?.length ?? 0,
      total_students: 20,
    });
    setFeedbackModalOpen(true);
    setSelectedSession(null);
  };

  return (
    <>
      <StaffDashboardLayout pagetitle="Master Class">
        {toast && (
          <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-2xl shadow-2xl text-white font-bold text-sm flex items-center gap-3 transition-all ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600 animate-bounce"}`}>
            <Icon icon={toast.type === "success" ? "lucide:check-circle" : "lucide:alert-circle"} className="w-5 h-5" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-3 hover:opacity-75 font-black text-lg">×</button>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full space-y-6 min-h-screen">
          
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 1. SUBTLE TOP BAR                                                  */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F2843] dark:text-white tracking-tight">
                  Master Class
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider">
                  Tutor
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1 font-medium">
                Your assigned masterclasses, weekly schedules, and upcoming live sessions.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
              <button
                onClick={fetchSessions}
                disabled={loading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-bold text-xs transition-all disabled:opacity-50 shadow-sm"
                title="Refresh Schedule"
              >
                <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C5A97A]' : 'text-slate-400'}`} />
                <span>{loading ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                onClick={() => navigate('/staffs/tutor/calendar')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-bold text-xs transition-all shadow-sm"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#C5A97A]" />
                <span>Calendar</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 2. SUBTLE NEXT UP SPOTLIGHT CARD                                   */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {scheduleData.next_class && (
            <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:to-transparent border border-amber-500/25 dark:border-amber-500/30 shadow-sm overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black tracking-widest uppercase">
                      Next Up on Your Agenda
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
                      {formatDayName(scheduleData.next_class.session_date)}, {formatDate(scheduleData.next_class.session_date)}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-[#0F2843] dark:text-white">
                      {scheduleData.next_class.class?.title || "Live Masterclass Session"}
                    </h2>
                    <p className="text-xs font-semibold text-[#C5A97A] mt-0.5">
                      Subject: {scheduleData.next_class.class?.subject?.name || "General"} • {formatTime(scheduleData.next_class.starts_at)} - {formatTime(scheduleData.next_class.ends_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs pt-0.5">
                    {scheduleData.next_class.class_link ? (
                      <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60 text-[11px]">
                        <Icon icon="lucide:video" className="w-3.5 h-3.5" />
                        Meeting Room Configured
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 italic">
                        No meeting link assigned yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Action Launcher */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleOpenLaunchModal(scheduleData.next_class)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#09314F] hover:bg-[#0e446d] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Icon icon="lucide:play-circle" className="w-4 h-4 text-[#C5A97A]" />
                    <span>Launch Session</span>
                  </button>

                  <button
                    onClick={() => handleOpenReportModal(scheduleData.next_class)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Icon icon="lucide:clipboard-check" className="w-4 h-4" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 3. VIEW CONTROLS & SEARCH BAR                                      */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            
            {/* Dual Tabs: My Classes vs Sessions Timeline */}
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full sm:w-auto self-start">
              <button
                onClick={() => setActiveTab("classes")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${activeTab === "classes" ? "bg-white dark:bg-gray-700 text-[#09314F] dark:text-white shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"}`}
              >
                <AcademicCapIcon className="w-4 h-4" />
                <span>My Masterclasses ({scheduleData.classes?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${activeTab === "timeline" ? "bg-white dark:bg-gray-700 text-[#09314F] dark:text-white shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"}`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Sessions Timeline ({flattenedSessions.length})</span>
              </button>
            </div>

            {/* Instant Search Filter */}
            <div className="relative w-full md:w-80">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === "classes" ? "Search classes or subjects..." : "Search by class, subject, date..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#09314F] dark:focus:ring-[#C5A97A] shadow-sm transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-black"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 4. TAB 1: MY MASTERCLASSES (CARD GRID)                              */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "classes" && (
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#09314F] dark:border-[#C5A97A] mx-auto" />
                  <p className="mt-3 text-slate-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
                    Loading your assigned classes...
                  </p>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800/40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6">
                  <AcademicCapIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <h3 className="text-sm font-black text-gray-700 dark:text-gray-200">
                    {searchQuery ? "No matching classes found" : "No Masterclasses Assigned Yet"}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                    {searchQuery ? "Try clearing your search filter to see all your assigned cohorts." : "You do not have any active masterclasses assigned to your tutor account."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredClasses.map((cls) => {
                    const courseTitles = Array.isArray(cls.subject?.courses) ? cls.subject.courses.map(c => c.title).join(", ") : null;
                    const schedulesList = Array.isArray(cls.schedules) ? cls.schedules : [];
                    
                    return (
                      <div
                        key={cls.id}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-[#C5A97A]/40 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Card Header Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-[#C5A97A] text-[10px] font-black uppercase tracking-wider">
                              {cls.subject?.name || "Subject Cohort"}
                            </span>
                          </div>

                          {/* Title */}
                          <div>
                            <h3 className="text-base font-black text-[#0F2843] dark:text-white group-hover:text-[#09314F] dark:group-hover:text-[#C5A97A] transition-colors line-clamp-1">
                              {cls.title}
                            </h3>
                            {courseTitles && (
                              <p className="text-[11px] font-semibold text-slate-400 dark:text-gray-400 truncate mt-0.5">
                                Program: {courseTitles}
                              </p>
                            )}
                          </div>

                          {/* Timetable / Recurring Schedules */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block">
                              Weekly Schedule
                            </span>
                            {schedulesList.length === 0 ? (
                              <span className="text-xs text-gray-400 italic">Schedule to be announced</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {schedulesList.map((sched, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600 text-[11px] font-bold text-slate-700 dark:text-gray-300"
                                  >
                                    <ClockIcon className="w-3 h-3 text-[#C5A97A]" />
                                    <span>{sched.day_of_week}: {formatTime(sched.start_time)} - {formatTime(sched.end_time)}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Co-Staff / Tutors Assigned */}
                          {Array.isArray(cls.staffs) && cls.staffs.length > 1 && (
                            <div className="pt-1 flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Co-Tutors:</span>
                              <div className="flex -space-x-1.5 overflow-hidden">
                                {cls.staffs.map((st) => (
                                  <div
                                    key={st.id}
                                    title={`${st.firstname} ${st.surname} (${st.pivot?.role || 'tutor'})`}
                                    className="w-5 h-5 rounded-full bg-slate-200 dark:bg-gray-700 border border-white dark:border-gray-800 flex items-center justify-center text-[8px] font-black text-slate-600 dark:text-gray-300"
                                  >
                                    {st.firstname?.[0]}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2.5">
                          <button
                            onClick={() => {
                              setActiveTab("timeline");
                              setSearchQuery(cls.title);
                            }}
                            className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/60 dark:hover:bg-gray-700 active:scale-95 text-[#09314F] dark:text-white font-black text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
                          >
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span>View Sessions</span>
                          </button>

                          {cls.zoom_start_url || cls.zoom_join_url ? (
                            <a
                              href={cls.zoom_start_url || cls.zoom_join_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 bg-[#09314F] hover:bg-[#0e446d] active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm"
                              title="Direct Zoom Link"
                            >
                              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-[#C5A97A]" />
                              <span>Room</span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 5. TAB 2: TIMELINE & SESSIONS                                      */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              {/* Timeline Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Sessions" },
                  { id: "today", label: "Today" },
                  { id: "week", label: "This Week" },
                  { id: "upcoming", label: "Upcoming" },
                  { id: "past", label: "Past / Completed" }
                ].map((flt) => {
                  const isActive = timelineFilter === flt.id;
                  return (
                    <button
                      key={flt.id}
                      onClick={() => setTimelineFilter(flt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${isActive ? "bg-[#09314F] dark:bg-[#C5A97A] text-white dark:text-[#09314F] shadow-sm" : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"}`}
                    >
                      {flt.label}
                    </button>
                  );
                })}
              </div>

              {/* Sessions Table / List */}
              {loading ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#09314F] dark:border-[#C5A97A] mx-auto" />
                  <p className="mt-3 text-slate-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
                    Loading sessions timeline...
                  </p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800/40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6">
                  <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <h3 className="text-sm font-black text-gray-700 dark:text-gray-200">
                    No sessions match this filter
                  </h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                    Try choosing a different timeline pill or clearing your search keywords.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/80">
                  {filteredSessions.map((session) => {
                    const sessionIsPast = isPast(session);
                    const isNext = scheduleData.next_class && String(scheduleData.next_class.id) === String(session.id);
                    
                    return (
                      <div
                        key={session.id}
                        className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all hover:bg-gray-50/70 dark:hover:bg-gray-700/40 ${isNext ? "bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-l-amber-500" : ""}`}
                      >
                        {/* Left Side: Avatar + Details */}
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${isNext ? "bg-amber-500 text-white shadow-amber-500/20" : sessionIsPast ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500" : "bg-[#09314F] text-white"}`}>
                            {getInitials(session.class?.title || session.title)}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isNext && (
                                <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest">
                                  Next Up
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider">
                                {session.class?.subject?.name || "Subject"}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400">
                                {formatDayName(session.session_date)}, {formatDate(session.session_date)}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-[#0F2843] dark:text-white truncate">
                              {session.class?.title || session.title || "Class Session"}
                            </h4>

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                              <span className="flex items-center gap-1 font-bold">
                                <ClockIcon className="w-3 h-3 text-[#C5A97A]" />
                                {formatTime(session.starts_at)} - {formatTime(session.ends_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Meeting Link / Actions */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-1 md:pt-0">
                          <button
                            onClick={() => handleOpenLaunchModal(session)}
                            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-[#09314F] dark:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                          >
                            <Icon icon="lucide:info" className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {session.recording_link && (
                            <a
                              href={session.recording_link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                            >
                              <VideoCameraIcon className="w-3.5 h-3.5" />
                              <span>Recording</span>
                            </a>
                          )}

                          <button
                            onClick={() => handleOpenReportModal(session)}
                            className="px-3.5 py-2 rounded-xl bg-[#C5A97A] hover:bg-[#b09262] text-[#09314F] font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                            title="Submit Post-Class Tutor Report"
                          >
                            <Icon icon="lucide:clipboard-check" className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 6. CLASS SESSION DETAILS / DIRECT LAUNCH MODAL                     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {selectedSession && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" 
              onClick={() => setSelectedSession(null)} 
            />
            
            <div className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A97A]">Session Overview</span>
                  <h2 className="text-xl font-black text-[#0F2843] dark:text-white">Class Details</h2>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center font-bold text-gray-500 dark:text-gray-300 text-xs transition-all"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3.5">
                <div className="bg-slate-50 dark:bg-gray-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-gray-700/60 space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Class & Subject</span>
                  <h3 className="text-sm font-black text-[#0F2843] dark:text-white">
                    {selectedSession.class?.title || selectedSession.title}
                  </h3>
                  <p className="text-xs font-bold text-[#C5A97A]">
                    Subject: {selectedSession.class?.subject?.name || "General Subject"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Session Date</span>
                    <span className="font-bold text-slate-700 dark:text-gray-200 mt-0.5 block">
                      {formatDayName(selectedSession.session_date)}, {formatDate(selectedSession.session_date)}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Time Range</span>
                    <span className="font-bold text-slate-700 dark:text-gray-200 mt-0.5 block">
                      {formatTime(selectedSession.starts_at)} - {formatTime(selectedSession.ends_at)}
                    </span>
                  </div>
                </div>

                {/* Meeting Room - OPTIONS SHOWN DIRECTLY WITHOUT EXTRA CLICK */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" />
                      Classroom Meeting Room
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {selectedSession.class_link ? "Configured" : "Pending link"}
                    </span>
                  </div>

                  {selectedSession.class_link ? (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-500 dark:text-gray-400 truncate font-medium">
                        {selectedSession.class_link.replace(/^https?:\/\//, '')}
                      </div>

                      {/* Direct Launch Options Displayed Instantly */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button 
                          onClick={() => handleLaunchWebClass(selectedSession)}
                          className="py-2.5 bg-[#09314F] hover:bg-[#15466f] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Icon icon="lucide:globe" className="w-3.5 h-3.5 text-[#C5A97A]" />
                          <span>Join on Web</span>
                        </button>
                        <button 
                          onClick={() => handleLaunchZoomApp(selectedSession)}
                          className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Icon icon="lucide:video" className="w-3.5 h-3.5" />
                          <span>Join via Zoom App</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No meeting link configured for this session yet.</p>
                  )}
                </div>

                {selectedSession.recording_link && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <VideoCameraIcon className="w-3.5 h-3.5" />
                      Recording Available
                    </span>
                    <a
                      href={selectedSession.recording_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Watch Now ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Bottom Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => handleOpenReportModal(selectedSession)}
                  className="w-full py-3 bg-[#C5A97A] hover:bg-[#b09262] text-[#09314F] font-black rounded-xl transition-all shadow-sm active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:clipboard-check" className="w-4 h-4" />
                  <span>Submit Post-Class Tutor Report</span>
                </button>

                <button 
                  onClick={() => setSelectedSession(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-white font-bold rounded-xl transition-all active:scale-95 text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </StaffDashboardLayout>

      {/* Post-Class Tutor Report Modal Integration */}
      <TutorPostClassReportModal 
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        sessionDetails={feedbackSession}
        onSubmitSuccess={() => {
          setToast({ type: "success", message: "Post-Class Tutor Report submitted successfully!" });
        }}
      />
    </>
  );
}
