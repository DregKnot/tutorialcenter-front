import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  LinkIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

export default function CourseAdvisorMasterClass() {
  const [scheduleData, setScheduleData] = useState({
    next_class: null,
    today_classes: [],
    week_schedule: {},
    upcoming_sessions: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  // --- FETCHING LOGIC ---
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/advisor/classes/schedule`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      console.log("Advisor Master Class API Response:", response.data);
      const data = response.data || {};
      
      setScheduleData({
        next_class: data.next_class || null,
        today_classes: Array.isArray(data.today_classes) ? data.today_classes : [],
        week_schedule: data.week_schedule || {},
        upcoming_sessions: Array.isArray(data.upcoming_sessions) ? data.upcoming_sessions : []
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

  // --- HELPERS ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "pm" : "am";
    const h12 = hour % 12 || 12;
    return `${h12}:${m}${ampm}`;
  };

  const getInitials = (title) => {
    if (!title) return "MC";
    return title.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  // --- SEARCH FILTERING ---
  const filteredData = useMemo(() => {
    if (!searchQuery) return scheduleData;
    
    const filterFn = (s) => (
      s.session_date?.includes(searchQuery) ||
      s.class?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      next_class: scheduleData.next_class && filterFn(scheduleData.next_class) ? scheduleData.next_class : null,
      today_classes: scheduleData.today_classes.filter(filterFn),
      week_schedule: Object.entries(scheduleData.week_schedule).reduce((acc, [date, sessions]) => {
        const matching = sessions.filter(filterFn);
        if (matching.length > 0) acc[date] = matching;
        return acc;
      }, {}),
      upcoming_sessions: scheduleData.upcoming_sessions.filter(filterFn)
    };
  }, [scheduleData, searchQuery]);

  // --- ACTIONS ---
  const handleSaveVideoLink = async () => {
    if (!selectedSession) return;
    setSaveLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/classes/session/recording`, {
        session_id: selectedSession.id, // Or class_id if that's what the endpoint expects
        recording_link: videoLink
      }, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json" 
        }
      });
      
      setToast({ type: "success", message: "Recording frequency updated successfully!" });
      setSelectedSession(null);
      fetchSessions();
    } catch (error) {
      console.error("Save error:", error);
      setToast({ type: "error", message: "Failed to update recording link." });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (!selectedSession || !selectedSession.class_link) return;
    
    const isZoom = selectedSession.class_link.includes("zoom.us") || selectedSession.class_link.includes("zoom");
    if (isZoom) {
      navigate(`/classroom/${selectedSession.id}`);
    } else {
      window.open(selectedSession.class_link, '_blank');
    }
  };

  const openModal = (session) => {
    setSelectedSession(session);
    setVideoLink(session.recording_link || "");
  };

  // --- UI COMPONENTS ---
  const SessionRow = ({ session, isNext = false }) => (
    <div 
      onClick={() => openModal(session)}
      className={`flex items-center gap-4 md:gap-8 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-all px-4 rounded-xl cursor-pointer group ${isNext ? "bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-500/10 dark:hover:bg-amber-500/20" : ""}`}
    >
      <div className={`w-10 h-10 rounded-full text-[10px] font-black flex items-center justify-center border border-white dark:border-gray-700 shadow-sm shrink-0 ${isNext ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300"}`}>
        {getInitials(session.class?.title)}
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
           {isNext && <span className="text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded leading-none">NEXT</span>}
           <span className="text-[14px] font-bold text-[#374151] dark:text-white truncate" title={session.class?.title}>
             {session.class?.title || "Master Class"}
           </span>
        </div>
        <span className="text-[13px] font-medium text-slate-500 dark:text-gray-400 md:text-center">
          {formatDate(session.session_date)}
        </span>
        <span className="text-[13px] font-medium text-slate-500 dark:text-gray-400 md:text-center">
          {formatTime(session.starts_at)}
        </span>
        <div className="truncate text-right hidden md:block">
           {session.class_link ? (
             <span className="text-[13px] text-blue-400 dark:text-blue-300 font-medium underline underline-offset-4 decoration-dotted">
               {session.class_link.replace(/^https?:\/\//, '').substring(0, 18) + '...'}
             </span>
           ) : (
             <span className="text-xs text-slate-300 dark:text-gray-600 italic">No link</span>
           )}
        </div>
      </div>
    </div>
  );

  const Section = ({ title, sessions, isEmpty = false }) => {
    if (isEmpty || (Array.isArray(sessions) && sessions.length === 0)) return null;
    return (
      <div className="mb-10">
        <h3 className="text-[11px] font-black text-slate-400 dark:text-gray-500 mb-5 px-4 uppercase tracking-[0.25em]">{title}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {Array.isArray(sessions) ? (
            sessions.map(s => <SessionRow key={s.id} session={s} />)
          ) : (
             Object.entries(sessions).map(([date, dateSessions]) => (
                <div key={date}>
                  {dateSessions.map(s => <SessionRow key={s.id} session={s} />)}
                </div>
             ))
          )}
        </div>
      </div>
    );
  };

  return (
    <StaffDashboardLayout pagetitle="Master Class">
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-white font-bold text-sm ${toast.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444] animate-bounce"}`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-4 hover:opacity-70">×</button>
        </div>
      )}

      <div className="p-6 max-w-[1600px] xl:px-10 mx-auto w-full min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px] font-black text-[#0F2843] dark:text-white tracking-tighter uppercase">Master Class</h1>
          <button className="relative p-2.5 bg-white dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
            <Icon icon="mdi:bell" className="text-[#0F2843] dark:text-white w-6 h-6" />
            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-[#E83831] border-2 border-white dark:border-gray-800 rounded-full" />
          </button>
        </div>

        <div className="mb-10 max-w-sm">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0F2843] dark:group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by date"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border border-gray-200 dark:border-gray-700 rounded-[24px] text-[15px] font-bold text-[#1F2937] dark:text-white focus:ring-4 focus:ring-[#0F2843]/5 dark:focus:ring-blue-500/10 focus:border-[#0F2843] dark:focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0F2843] dark:border-blue-500 mx-auto" />
            <p className="mt-4 text-slate-400 dark:text-gray-500 font-bold">Refining schedule...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.next_class && (
              <div className="mb-12">
                <h3 className="text-[11px] font-black text-amber-500 mb-5 px-4 uppercase tracking-[0.25em]">Next Up</h3>
                <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-amber-100 dark:border-amber-500/20 shadow-lg shadow-amber-50/20 dark:shadow-none overflow-hidden ring-2 ring-amber-500/10">
                  <SessionRow session={filteredData.next_class} isNext={true} />
                </div>
              </div>
            )}

            <Section title="Today" sessions={filteredData.today_classes} />
            <Section title="This Week" sessions={filteredData.week_schedule} />
            <Section title="Upcoming" sessions={filteredData.upcoming_sessions} />

            {!filteredData.next_class && 
             filteredData.today_classes.length === 0 && 
             Object.keys(filteredData.week_schedule).length === 0 && 
             filteredData.upcoming_sessions.length === 0 && (
              <div className="text-center py-24 bg-gray-50/50 dark:bg-gray-800/20 rounded-[48px] border-2 border-dashed border-gray-200 dark:border-gray-700 mx-4">
                <Icon icon="mdi:calendar-blank" className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-slate-400 dark:text-gray-500 text-lg font-bold">Your agenda is clear.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedSession && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm" onClick={() => setSelectedSession(null)} />
          <div className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-[#0F2843] dark:text-white mb-8">Details</h2>
            
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-slate-100 dark:border-gray-700">
                <p className="text-[15px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-tighter">
                  Manage Class Recording
                </p>
              </div>

              <div className="flex items-center gap-4 text-slate-600 dark:text-gray-300">
                <CalendarIcon className="w-5 h-5 shrink-0 text-slate-400 dark:text-gray-500" />
                <span className="text-[14px] font-bold uppercase tracking-tight">
                  {formatDate(selectedSession.session_date)} / {formatTime(selectedSession.starts_at).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-4 text-slate-600 dark:text-gray-300">
                <div className="w-5 h-5 bg-[#C5A97A] rounded shrink-0" />
                <span className="text-[14px] font-bold truncate">
                  {selectedSession.class?.title}
                </span>
              </div>

              <div className="flex items-center gap-4 text-blue-500 dark:text-blue-300">
                <LinkIcon className="w-5 h-5 text-blue-400 dark:text-blue-500 shrink-0" />
                <button 
                  onClick={handleJoinMeeting}
                  className="text-[14px] font-medium underline underline-offset-4 decoration-dotted truncate text-left focus:outline-none"
                >
                  {selectedSession.class_link ? (selectedSession.class_link.includes("zoom") ? "Start Zoom Class Room" : "Open Google Meet") : "No link assigned"}
                </button>
              </div>

              <div className="flex items-center gap-4 relative mt-4">
                <VideoCameraIcon className="w-5 h-5 text-slate-400 dark:text-gray-500 shrink-0" />
                <div className="flex-1">
                  <input
                    type="url"
                    placeholder="Add Video Link"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 text-[14px] font-medium text-[#1F2937] dark:text-white focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <button 
                onClick={() => setSelectedSession(null)}
                className="flex-1 py-4 bg-[#EF4444] text-white font-bold rounded-2xl hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-100 dark:shadow-none uppercase text-[11px] tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveVideoLink}
                disabled={saveLoading}
                className="flex-1 py-4 bg-[#0F2843] dark:bg-blue-600 text-white font-bold rounded-2xl hover:bg-[#1a3d5c] dark:hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none disabled:opacity-50 uppercase text-[11px] tracking-widest"
              >
                {saveLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffDashboardLayout>
  );
}
