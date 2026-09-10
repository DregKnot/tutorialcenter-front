import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "../../components/private/Students/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { 
  MagnifyingGlassIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  SignalIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

export default function StudentClassSchedule() {
  const { token: authToken } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const navigate = useNavigate();

  // --- STATE ---
  const [scheduleData, setScheduleData] = useState({
    next_class: null,
    next_classes: [],
    today_classes: [],
    week_schedule: {},
    upcoming_sessions: [],
    older_sessions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Responsive Breakpoints
  const isHighRes = windowWidth >= 1800;
  const isMobile = windowWidth < 1024; // Where the grid stacks

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Collapse States
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(true);
  const [isOlderOpen, setIsOlderOpen] = useState(false);

  /* =============================
     FETCH STUDENT SCHEDULE
  ============================= */
  const fetchStudentSchedule = useCallback(async () => {
    if (!authToken) {
      console.warn("DEBUG: No student_token found in localStorage!");
      return;
    }
    
    setLoading(true);
    try {
      console.group("DEBUG: Student Class Schedule Fetching");
      const res = await axios.get(`${API_BASE_URL}/api/students/class/schedule`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      });

      const data = res.data?.data || res.data;
      const nextClasses = Array.isArray(data.next_classes) && data.next_classes.length > 0
        ? data.next_classes
        : (data.next_class ? [data.next_class] : []);

      setScheduleData({
        next_class: nextClasses[0] || null,
        next_classes: nextClasses,
        today_classes: Array.isArray(data.today_classes) ? data.today_classes : [],
        week_schedule: data.week_schedule || {},
        upcoming_sessions: Array.isArray(data.upcoming_sessions) ? data.upcoming_sessions : [],
        older_sessions: Array.isArray(data.older_sessions) ? data.older_sessions : []
      });
      console.log("Fetched Data:", data);
      console.groupEnd();
    } catch (err) {
      console.error("DEBUG: Failed to fetch student schedule", err);
      setError(err.response?.data?.message || "Unable to load schedule at the moment.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, authToken]);

  useEffect(() => {
    fetchStudentSchedule();
  }, [fetchStudentSchedule]);

  const groupedSessions = useMemo(() => {
    // Flatten week_schedule object into an array if it has date keys
    const weeklyArray = Object.values(scheduleData.week_schedule).flat();

    let today = [...scheduleData.today_classes];
    let weekly = weeklyArray.length > 0 ? [...weeklyArray] : [...scheduleData.upcoming_sessions];
    let older = [...scheduleData.older_sessions];

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matches = (s) => {
        const title = (s.title || s.class?.title || "").toLowerCase();
        const subject = (s.subject_name || s.subject?.name || "").toLowerCase();
        const tutorName = (s.tutor?.name || s.tutor_name || "").toLowerCase();
        return title.includes(term) || subject.includes(term) || tutorName.includes(term);
      };
      today = today.filter(matches);
      weekly = weekly.filter(matches);
      older = older.filter(matches);
    }

    // Sort sections by date/time
    const sortByTime = (a, b) => (a.starts_at || "").localeCompare(b.starts_at || "");
    today.sort(sortByTime);
    weekly.sort((a,b) => (a.session_date || "").localeCompare(b.session_date || "") || sortByTime(a,b));
    older.sort((a,b) => (b.session_date || "").localeCompare(a.session_date || "")); // Newest older first

    return { today, weekly, older };
  }, [scheduleData, searchTerm]);

  /* =============================
     HELPERS
  ============================= */
  const getSessionStatus = (session) => {
    const now = new Date();
    const [startH, startM] = session.starts_at.split(':');
    const [endH, endM] = session.ends_at.split(':');
    
    const startTime = new Date();
    startTime.setHours(parseInt(startH), parseInt(startM), 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endH), parseInt(endM), 0);

    if (now >= startTime && now <= endTime) return 'live';
    if (now < startTime) return 'upcoming';
    return 'completed';
  };

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "long", month: "short", day: "numeric", year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const abbreviateTitle = (title) => {
    if (!title || !title.includes(" - ")) return title;
    const parts = title.split(" - ");
    const prefix = parts[0]; // JAMB, WAEC, etc.
    const subject = parts[1];
    
    // Split subject into words
    const words = subject.trim().split(/\s+/);
    
    if (words.length === 1) {
      // Single word -> first three letters
      return `${prefix} - ${words[0].substring(0, 3)}`;
    } else {
      // Multiple words -> acronym (first letter of each)
      const acronym = words.map(w => w[0]).join("");
      return `${prefix} - ${acronym}`;
    }
  };

  /* =============================
     UI COMPONENTS
  ============================= */
  
  const handleJoinClass = (e, sessionObj) => {
    e.stopPropagation();
    e.preventDefault();
    const link = sessionObj?.recording_link || sessionObj?.class_link;
    if (!link) return;
    
    const isZoom = link.includes("zoom.us") || link.includes("zoom");

    if (isZoom) {
      navigate(`/classroom/${sessionObj.id}`);
    } else {
      // Open the window DIRECTLY in the click handler to bypass popup blockers for Google Meet
      window.activeClassPopup = window.open(link, '_blank');
      navigate('/student/meet', {
          state: {
              class_link: link,
              class_schedule_id: sessionObj.id,
              alreadyOpened: true
          }
      });
    }
  };

  // Helper: extract tutor info with fallbacks across session.tutor, session.tutor_name, and session.class.staffs
  const getTutorInfo = useCallback((session) => {
    if (!session) return { name: "Expert Tutor", avatarUrl: null, role: "Tutor", fallbackUrl: "https://ui-avatars.com/api/?name=Tutor&background=09314F&color=fff&bold=true" };

    let name = null;
    let avatarPath = null;
    let role = "Tutor";

    // 1. Direct tutor object on session
    if (session.tutor && typeof session.tutor === "object") {
      name = session.tutor.name || 
        (session.tutor.firstname ? `${session.tutor.firstname} ${session.tutor.surname || ''}`.trim() : null);
      avatarPath = session.tutor.avatar || session.tutor.profile_picture || null;
      role = session.tutor.role || "Tutor";
    }

    // 2. Direct tutor_name string on session
    if ((!name || name === "Tutorial Center Tutor") && session.tutor_name && session.tutor_name !== "Tutorial Center Tutor") {
      name = session.tutor_name;
    }

    // 3. From session.class.staffs
    const staffs = session.class?.staffs;
    if ((!name || name === "Tutorial Center Tutor") && Array.isArray(staffs) && staffs.length > 0) {
      const staff = staffs.find(s => {
        const r = (s.role || '').toLowerCase();
        return r === 'lead' || r === 'tutor';
      }) || staffs[0];

      if (staff) {
        name = staff.name || `${staff.firstname || ''} ${staff.surname || ''}`.trim();
        avatarPath = avatarPath || staff.profile_picture || staff.avatar || null;
        role = staff.role || role;
      }
    }

    const finalName = (name && name !== "Tutorial Center Tutor") ? name : "Expert Tutor";
    let avatarUrl = null;
    if (avatarPath) {
      avatarUrl = avatarPath.startsWith("http") ? avatarPath : `${API_BASE_URL}/storage/${avatarPath}`;
    }

    return {
      name: finalName,
      avatarUrl,
      role: role ? (role.charAt(0).toUpperCase() + role.slice(1)) : "Tutor",
      fallbackUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=09314F&color=fff&bold=true`
    };
  }, [API_BASE_URL]);

  const ClassRow = ({ session, isToday }) => {
    const isExpanded = expandedSessionId === session.id;
    const status = isToday ? getSessionStatus(session) : null;
    const tutor = getTutorInfo(session);
    
    return (
      <div 
        onClick={() => {
          if (isHighRes || isMobile) return; // No expansion needed on high-res or mobile stack
          setExpandedSessionId(isExpanded ? null : session.id);
        }}
        className={`relative flex flex-col bg-white dark:bg-[#09314F]/50 dark:backdrop-blur-md rounded-[40px] border border-gray-50 dark:border-[#09314F] shadow-sm transition-all cursor-pointer group mb-6 select-none ${
          isHighRes || isMobile
            ? "hover:translate-y-[-1px] hover:shadow-md" 
            : isExpanded 
              ? "ring-2 ring-[#BB9E7F]/20 scale-[1.01] -translate-y-1 py-2 hover:shadow-xl dark:ring-[#BB9E7F]/40" 
              : "hover:translate-y-[-2px] hover:shadow-xl"
        }`}
      >
        {/* FLOATING POP-OUT AVATAR (Visible ONLY at exactly 1024px-1279px / lg) */}
        {!isExpanded && (
          <div className="hidden lg:flex xl:hidden absolute -top-5 -left-5 w-16 h-16 bg-white dark:bg-[#09314F] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-gray-50 dark:border-[#09314F] items-center justify-center z-[25] transition-all group-hover:scale-110 group-hover:-rotate-3">
             <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#BB9E7F]/30 group-hover:border-[#BB9E7F] transition-all bg-gray-50 flex items-center justify-center">
                <img 
                  src={tutor.avatarUrl || tutor.fallbackUrl}
                  className="w-full h-full object-cover"
                  alt={tutor.name}
                  onError={(e) => { e.target.src = tutor.fallbackUrl; }}
                />
             </div>
          </div>
        )}

        {/* COMPACT VIEW (Normal Row) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-center gap-y-6 lg:gap-3 xl:gap-4 px-8 py-6 transition-all ${(!isHighRes && !isMobile) && isExpanded ? "opacity-30 grayscale blur-[1px]" : ""}`}>
          {/* Title Column */}
          <div className="flex items-center gap-4 col-span-1 lg:pl-6 xl:pl-0 min-w-0">
            <div className="relative shrink-0 lg:hidden xl:flex">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 border-2 border-[#BB9E7F]/30 group-hover:border-[#BB9E7F] transition-all flex items-center justify-center">
                <img 
                  src={tutor.avatarUrl || tutor.fallbackUrl}
                  className="w-full h-full object-cover"
                  alt={tutor.name}
                  onError={(e) => { e.target.src = tutor.fallbackUrl; }}
                />
              </div>
              {status === 'live' && <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-[#22C55E] border-2 border-white rounded-full shadow-sm animate-pulse"></span>}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-black text-[#09314F] dark:text-white leading-tight uppercase truncate ${isHighRes || isMobile ? "text-[16px]" : "text-[15px]"}`}>
                {isHighRes || isMobile
                  ? (session.class?.title || session.title || "Master Class")
                  : abbreviateTitle(session.class?.title || session.title || "Master Class")
                }
              </span>
              {isToday && status !== 'completed' && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {status === 'live' ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 italic">
                      <SignalIcon className="w-3.5 h-3.5 animate-pulse" /> LIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 italic">
                      UPCOMING
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Instructor Column */}
          <div className="text-left sm:text-center min-w-0">
            <span className="text-[11px] font-black text-gray-400 dark:text-blue-300 uppercase tracking-widest block mb-1">Tutor</span>
            <span className="text-[13px] font-black text-[#09314F] dark:text-white truncate block">
              {tutor.name}
            </span>
          </div>

          {/* Link Column */}
          <div className="text-left lg:text-center min-w-0">
            <span className="text-[11px] font-black text-gray-400 dark:text-blue-300 uppercase tracking-widest block mb-1">Session</span>
            <span 
              className="text-[#3A5ECC] dark:text-blue-400 text-[13px] font-bold underline decoration-dotted underline-offset-4 truncate block"
              onClick={(e) => e.stopPropagation()} // Prevent toggling the card when clicking the link
            >
              {session.recording_link || (session.class_link ? session.class_link.replace(/^https?:\/\//, '').substring(0, 18) + '...' : null) || "Awaiting"}
            </span>
          </div>

          {/* Time Column */}
          <div className="text-left sm:text-center min-w-0">
            <span className="text-[11px] font-black text-gray-400 dark:text-blue-300 uppercase tracking-widest block mb-1">Time</span>
            <div className="flex items-center sm:justify-center gap-1.5 text-[#09314F] dark:text-white font-black text-[14px]">
              <ClockIcon className="w-4 h-4 text-[#BB9E7F]" />
              <span>{formatTime(session.starts_at)}</span>
            </div>
          </div>

          {/* Date Column */}
          <div className="text-left sm:text-center min-w-0">
            <span className="text-[11px] font-black text-gray-400 dark:text-blue-300 uppercase tracking-widest block mb-1 text-center">Date</span>
            <div className="flex items-center sm:justify-center gap-1.5 text-gray-600 dark:text-gray-200 font-black text-[14px]">
              <CalendarIcon className="w-4 h-4 text-[#BB9E7F]" />
              <span>{new Date(session.session_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* EXPANDED VIEW (Info Card) */}
        {!isHighRes && !isMobile && isExpanded && (
          <div className="w-full bg-white dark:bg-[#09314F]/80 dark:backdrop-blur-md p-8 md:p-10 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300 border-t border-gray-50 dark:border-white/10 mt-2 rounded-b-[40px]">
            <div className="flex flex-wrap gap-8">
               <div className="flex items-center gap-8 flex-1 min-w-[280px]">
                 <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gray-50 border-2 border-[#BB9E7F]/30 p-1 shadow-lg flex items-center justify-center">
                    <img 
                      src={tutor.avatarUrl || tutor.fallbackUrl}
                      className="w-full h-full object-cover rounded-2xl"
                      alt={tutor.name}
                      onError={(e) => { e.target.src = tutor.fallbackUrl; }}
                    />
                 </div>
                 <div className="flex flex-col">
                   <span className="px-3 py-1 bg-[#BB9E7F] text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-3 self-start shadow-sm">Full Session Details</span>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter text-[#09314F] dark:text-white leading-none mb-2">
                     {session.class?.title || session.title || "Master Class Session"}
                   </h3>
                   <div className="flex flex-wrap items-center gap-4 text-gray-400 font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-[#BB9E7F]" />
                        <span className="text-[#09314F] dark:text-white font-extrabold">{tutor.name}</span>
                      </div>
                      <div className="hidden lg:block w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-[#BB9E7F]" />
                        <span>{formatTime(session.starts_at)} - {formatTime(session.ends_at)}</span>
                      </div>
                   </div>
                 </div>
               </div>

               <div className="flex flex-col gap-3 flex-1 min-w-[250px]">
                   <div className="w-full">
                    <span className="text-[10px] font-black text-gray-300 dark:text-blue-300 uppercase tracking-[0.2em] mb-1 block">Live Meeting Link</span>
                    <button 
                      onClick={(e) => handleJoinClass(e, session)}
                      className="text-sm font-bold text-[#3A5ECC] dark:text-blue-400 underline decoration-dotted underline-offset-4 break-all block text-left"
                    >
                      {session.recording_link || (session.class_link ? session.class_link.replace(/^https?:\/\//, '').substring(0, 18) + '...' : null) || "Link Awaiting Deployment..."}
                    </button>
                 </div>
                 <div className="flex items-center gap-2 text-gray-400 dark:text-blue-300 font-black text-[12px] uppercase tracking-widest mt-2">
                    <CalendarIcon className="w-4 h-4 text-[#BB9E7F]" />
                    <span>{formatSessionDate(session.session_date)}</span>
                 </div>
               </div>
             </div>

             <div className="mt-8 pt-8 border-t border-gray-50 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                <p className="hidden lg:block text-[11px] font-black text-gray-300 dark:text-white/50 uppercase tracking-[0.3em]">
                  Click anywhere to close full view
                </p>
                <div className="flex items-center gap-4 w-full">
                  <button 
                    onClick={(e) => handleJoinClass(e, session)}
                    className="flex-1 px-10 py-5 bg-[#09314F] text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[11px] text-center"
                  >
                    Join Now
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setExpandedSessionId(null); }}
                    className="flex-1 lg:hidden px-8 py-5 bg-gray-100 text-[#09314F] font-black rounded-2xl uppercase tracking-widest text-[11px]"
                  >
                    Close
                  </button>
                </div>
             </div>
             
             {/* Bottom tag as requested */}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-black text-[#09314F] uppercase tracking-[0.5em] whitespace-nowrap">Click To Close</span>
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout 
      pagetitle="Master Class" 
      hideHeader={false}
      hideMobileTitle={false}
      hideMobileBell={false}
      hideRightPanel={true}
    >
      <div className="max-w-[1600px] xl:px-10 mx-auto w-full min-h-screen">
        

        {/* ========= Featured Next Class(es) ========= */}
        {scheduleData.next_classes && scheduleData.next_classes.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-[12px] font-black text-[#E83831] uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#E83831] rounded-full animate-pulse"></span> NEXT UP
                </h2>
                {scheduleData.next_classes.length > 1 && (
                  <span className="px-3 py-1 bg-red-500/10 dark:bg-red-950/50 text-[#E83831] border border-[#E83831]/25 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    2 Sessions Ahead
                  </span>
                )}
              </div>
              <div className="h-[1px] flex-1 bg-red-100 dark:bg-red-900/30"></div>
            </div>

            {scheduleData.next_classes.length === 1 ? (
              /* Single Class Hero */
              <div className="bg-[#09314F] rounded-[40px] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl group transition-all hover:translate-y-[-4px]">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#BB9E7F]/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left w-full lg:w-auto">
                    {(() => {
                      const tutor = getTutorInfo(scheduleData.next_classes[0]);
                      return (
                        <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/10 border border-white/20 p-1 backdrop-blur-md shrink-0">
                          <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img 
                              src={tutor.avatarUrl || tutor.fallbackUrl}
                              className="w-full h-full object-cover"
                              alt={tutor.name}
                              onError={(e) => { e.target.src = tutor.fallbackUrl; }}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex-1 min-w-0">
                      <span className="px-3.5 py-1 bg-[#E83831] text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block shadow-sm">
                        Recommended Session
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter mb-3 leading-tight truncate">
                        {scheduleData.next_classes[0].title || scheduleData.next_classes[0].class?.title || "Master Class Session"}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/70 font-bold text-sm">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-[#BB9E7F]" />
                          <span className="text-white font-extrabold">{getTutorInfo(scheduleData.next_classes[0]).name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-[#BB9E7F]" />
                          <span>{formatTime(scheduleData.next_classes[0].starts_at)} - {formatTime(scheduleData.next_classes[0].ends_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-[#BB9E7F]" />
                          <span>{formatSessionDate(scheduleData.next_classes[0].session_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end gap-4 min-w-[200px] w-full sm:w-auto">
                    <button 
                      onClick={(e) => handleJoinClass(e, scheduleData.next_classes[0])}
                      className="w-full sm:w-auto px-10 py-5 bg-[#BB9E7F] text-[#09314F] font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-black/20 group-hover:px-12 active:scale-95 uppercase tracking-widest text-xs"
                    >
                      Join Session
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Dual Classes Grid - Sooner Class Prioritized First */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                {/* 1. Sooner Class (Priority Card) */}
                <div className="xl:col-span-7 bg-[#09314F] rounded-[40px] p-7 md:p-8 text-white relative overflow-hidden shadow-2xl group transition-all hover:translate-y-[-3px] flex flex-col justify-between border-2 border-[#BB9E7F]/30">
                  <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#BB9E7F]/15 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="px-3.5 py-1 bg-[#E83831] text-white rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> Starts Soonest • Priority
                      </span>
                      <span className="text-[11px] font-black text-[#BB9E7F] uppercase tracking-wider">
                        {scheduleData.next_classes[0].subject_name || "General"}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-5 text-center sm:text-left">
                      {(() => {
                        const tutor = getTutorInfo(scheduleData.next_classes[0]);
                        return (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-1 shrink-0 backdrop-blur-md">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                              <img 
                                src={tutor.avatarUrl || tutor.fallbackUrl}
                                className="w-full h-full object-cover"
                                alt={tutor.name}
                                onError={(e) => { e.target.src = tutor.fallbackUrl; }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight mb-2 truncate">
                          {scheduleData.next_classes[0].title || scheduleData.next_classes[0].class?.title || "Master Class Session"}
                        </h3>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-white/70 font-bold text-xs md:text-sm">
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4 text-[#BB9E7F]" />
                            <span className="text-white font-extrabold">{getTutorInfo(scheduleData.next_classes[0]).name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4 text-[#BB9E7F]" />
                            <span>{formatTime(scheduleData.next_classes[0].starts_at)} - {formatTime(scheduleData.next_classes[0].ends_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white/70 font-bold text-xs">
                      <CalendarIcon className="w-4 h-4 text-[#BB9E7F]" />
                      <span>{formatSessionDate(scheduleData.next_classes[0].session_date)}</span>
                    </div>
                    <button 
                      onClick={(e) => handleJoinClass(e, scheduleData.next_classes[0])}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#BB9E7F] text-[#09314F] font-black rounded-xl hover:bg-white transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs text-center"
                    >
                      Join Session
                    </button>
                  </div>
                </div>

                {/* 2. Later Class (Secondary Card) */}
                <div className="xl:col-span-5 bg-gradient-to-br from-[#0C3B5E] to-[#09314F] rounded-[40px] p-7 md:p-8 text-white relative overflow-hidden shadow-xl group transition-all hover:translate-y-[-3px] flex flex-col justify-between border border-white/15">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="px-3.5 py-1 bg-white/15 text-white/90 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-[#BB9E7F]" /> Upcoming Next
                      </span>
                      <span className="text-[11px] font-black text-white/60 uppercase tracking-wider">
                        {scheduleData.next_classes[1].subject_name || "General"}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5 text-center sm:text-left">
                      {(() => {
                        const tutor = getTutorInfo(scheduleData.next_classes[1]);
                        return (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-1 shrink-0 backdrop-blur-md">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                              <img 
                                src={tutor.avatarUrl || tutor.fallbackUrl}
                                className="w-full h-full object-cover"
                                alt={tutor.name}
                                onError={(e) => { e.target.src = tutor.fallbackUrl; }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter leading-tight mb-2 truncate">
                          {scheduleData.next_classes[1].title || scheduleData.next_classes[1].class?.title || "Master Class Session"}
                        </h3>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-white/70 font-bold text-xs">
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-[#BB9E7F]" />
                            <span className="text-white font-extrabold">{getTutorInfo(scheduleData.next_classes[1]).name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-3.5 h-3.5 text-[#BB9E7F]" />
                            <span>{formatTime(scheduleData.next_classes[1].starts_at)} - {formatTime(scheduleData.next_classes[1].ends_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white/70 font-bold text-xs">
                      <CalendarIcon className="w-4 h-4 text-[#BB9E7F]" />
                      <span>{formatSessionDate(scheduleData.next_classes[1].session_date)}</span>
                    </div>
                    <button 
                      onClick={(e) => handleJoinClass(e, scheduleData.next_classes[1])}
                      className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-[#09314F] border border-white/20 font-black rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-widest text-[11px] text-center"
                    >
                      Join Session
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========= Controls Bar ========= */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
          <div className="relative flex-1 group">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#BB9E7F] transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search master classes..." 
              className="w-full pl-16 pr-8 py-5 bg-white dark:bg-[#09314F]/50 dark:backdrop-blur-md rounded-[32px] border-none shadow-[0_10px_35px_rgba(0,0,0,0.03)] focus:ring-4 focus:ring-[#BB9E7F]/10 text-[15px] font-bold text-[#09314F] dark:text-white placeholder-gray-300 dark:placeholder-white/50 transition-all"
            />
          </div>
          <button 
            onClick={() => navigate('/student/recorded-classes')}
            className="flex items-center justify-center gap-2 px-8 py-5 bg-white dark:bg-[#09314F]/50 dark:backdrop-blur-md rounded-[32px] shadow-[0_10px_35px_rgba(0,0,0,0.03)] hover:shadow-md border border-gray-100 dark:border-[#09314F] text-[#09314F] dark:text-white hover:text-[#E83831] dark:hover:text-[#E83831] transition-all font-black text-xs tracking-widest uppercase"
          >
            <Icon icon="lucide:video" className="w-5 h-5 text-[#BB9E7F]" />
            Recorded Classes
          </button>
        </div>

        {/* ========= Classes List ========= */}
        <div className="space-y-12">
          
          {/* Today Section (Non-collapsable) */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[12px] font-black text-[#BB9E7F] uppercase tracking-[0.3em] pl-2 whitespace-nowrap">TODAY'S CLASSES</h2>
              {(!isHighRes && !isMobile) && (
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic hidden md:inline">— Click any session for more details</span>
              )}
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            
            <div className="flex flex-col">
              {groupedSessions.today.length > 0 ? (
                groupedSessions.today.map(session => (
                  <ClassRow key={session.id} session={session} isToday={true} />
                ))
              ) : (
                <div className="p-12 text-center bg-gray-50/30 rounded-[40px] border border-gray-100">
                  <p className="font-bold text-gray-400 text-sm">No classes scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Section (Collapsable) */}
          <div>
            <div 
              className="flex items-center gap-4 mb-6 cursor-pointer group/header"
              onClick={() => setIsWeeklyOpen(!isWeeklyOpen)}
            >
              <h2 className="text-[12px] font-black text-[#BB9E7F] uppercase tracking-[0.3em] pl-2 whitespace-nowrap">WEEKLY SCHEDULE</h2>
              {(!isHighRes && !isMobile) && (
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic hidden md:inline">— Click any session for more details</span>
              )}
              <div className="h-[1px] flex-1 bg-gray-100 group-hover/header:bg-[#BB9E7F]/30 transition-all"></div>
              {isWeeklyOpen ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
            </div>
            
            {isWeeklyOpen && (
              <div className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                {groupedSessions.weekly.length > 0 ? (
                  groupedSessions.weekly.map(session => (
                    <ClassRow key={session.id} session={session} isToday={false} />
                  ))
                ) : (
                  <div className="p-10 text-center bg-gray-50/20 rounded-[30px] border border-dashed border-gray-100">
                    <p className="font-bold text-gray-400 text-xs italic">No other sessions scheduled for this week</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Older Section (Collapsable) */}
          <div>
            <div 
              className="flex items-center gap-4 mb-6 cursor-pointer group/header"
              onClick={() => setIsOlderOpen(!isOlderOpen)}
            >
              <h2 className="text-[12px] font-black text-[#BB9E7F] uppercase tracking-[0.3em] pl-2">OLDER CLASSES</h2>
              <div className="h-[1px] flex-1 bg-gray-100 group-hover/header:bg-[#BB9E7F]/30 transition-all"></div>
              {isOlderOpen ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
            </div>
            
            {isOlderOpen && (
              <div className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                {groupedSessions.older.length > 0 ? (
                  groupedSessions.older.map(session => (
                    <ClassRow key={session.id} session={session} isToday={false} />
                  ))
                ) : (
                  <div className="p-10 text-center bg-gray-50/20 rounded-[30px] border border-dashed border-gray-100">
                    <p className="font-bold text-gray-400 text-xs italic">No older sessions found</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed bottom-10 right-10 z-[100] bg-[#09314F] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-4">
             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
             <span className="text-sm font-black uppercase tracking-widest italic">Syncing Class Schedule...</span>
          </div>
        )}

        {error && (
          <div className="mt-12 p-10 bg-red-50 rounded-[40px] border-2 border-dashed border-red-100 text-center">
            <h3 className="text-red-600 font-bold mb-2 uppercase tracking-widest text-sm">Data Link Interrupted</h3>
            <p className="text-red-400 text-xs font-bold">{error}</p>
            <button 
              onClick={fetchStudentSchedule}
              className="mt-6 px-10 py-3.5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-red-200"
            >
              Force Reconnect
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
