import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
// Extract YouTube video ID from URL
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const match = String(url).match(/(?:youtube(?:-nocookie)?\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
  return match ? match[1] : null;
};

// Retrieve high-quality YouTube thumbnail
const getThumbnailUrl = (cls) => {
  if (cls.thumbnail) return cls.thumbnail;
  const vidId = cls.videoId || getYoutubeVideoId(cls.videoUrl || cls.recording_link);
  if (vidId) {
    return `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
  }
  return null;
};

// Format recorded date prioritizing the saved/updated date
const formatRecordedDate = (cls) => {
  if (cls.saved_at) {
    try {
      return new Date(cls.saved_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      // ignore
    }
  }
  if (cls.date) return cls.date;
  if (cls.session_date) {
    try {
      return new Date(cls.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      // ignore
    }
  }
  return "Recent";
};

// Format viewer timestamp for analytics
const formatViewTimestamp = (isoStr) => {
  if (!isoStr) return "Recently";
  try {
    const d = new Date(isoStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Recently";
  }
};

// Format YouTube-style view count (e.g. 0 views, 1 view, 24 views, 1.4K views)
export const formatViewCount = (count) => {
  const num = Number(count) || 0;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M views";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K views";
  }
  return `${num} ${num === 1 ? "view" : "views"}`;
};

const RecordedClasses = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [recordedClasses, setRecordedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAnalyticsSession, setActiveAnalyticsSession] = useState(null);
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState("");
  const [analyticsFilter, setAnalyticsFilter] = useState("all"); // "all" | "repeat"
  const [viewersLoading, setViewersLoading] = useState(false);
  const [sessionAnalyticsData, setSessionAnalyticsData] = useState(null);
  const { setIsClassActive, token } = useAuth();

  // Detect staff/admin vs student role
  const staffToken = localStorage.getItem("staff_token");
  const isAdminOrStaff = Boolean(staffToken);
  const activeToken = staffToken || token || localStorage.getItem("student_token");
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Prevent autologout while watching a recorded class
  useEffect(() => {
    if (selectedVideo) {
      setIsClassActive(true);
    } else {
      setIsClassActive(false);
    }

    return () => {
      setIsClassActive(false);
    };
  }, [selectedVideo, setIsClassActive]);

  // Fetch recorded classes from backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const headers = {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json"
        };
        const response = await axios.get(`${API_BASE_URL}/api/students/recorded-classes`, { headers });
        if (response.data?.success) {
          setRecordedClasses(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch recorded classes", err);
        const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Could not load recorded classes.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeToken) fetchClasses();
  }, [activeToken, API_BASE_URL]);

  // Fetch detailed viewers analytics for staff/admin when modal opens
  useEffect(() => {
    if (!activeAnalyticsSession || !isAdminOrStaff) {
      setSessionAnalyticsData(null);
      setAnalyticsSearchQuery("");
      setAnalyticsFilter("all");
      return;
    }

    let isMounted = true;
    const fetchSessionViewers = async () => {
      try {
        setViewersLoading(true);
        const headers = {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        };
        const endpoint = `${API_BASE_URL}/api/staffs/classes/sessions/${activeAnalyticsSession.id}/viewers`;
        const res = await axios.get(endpoint, { headers });
        if (isMounted && res.data?.success && res.data.data) {
          setSessionAnalyticsData(res.data.data);
        }
      } catch (err) {
        console.warn("Could not load session viewers:", err?.response?.data?.message || err.message);
        if (isMounted) {
          setSessionAnalyticsData({
            class_session_id: activeAnalyticsSession.id,
            session_title: activeAnalyticsSession.title,
            subject: activeAnalyticsSession.subject,
            total_views: activeAnalyticsSession.views || activeAnalyticsSession.total_views || 0,
            unique_viewers: activeAnalyticsSession.unique_viewers || (activeAnalyticsSession.viewers ? activeAnalyticsSession.viewers.length : 0),
            repeat_viewers: (activeAnalyticsSession.viewers || []).filter((v) => Number(v.view_count) > 1).length,
            viewers: activeAnalyticsSession.viewers || [],
          });
        }
      } finally {
        if (isMounted) setViewersLoading(false);
      }
    };

    fetchSessionViewers();

    return () => {
      isMounted = false;
    };
  }, [activeAnalyticsSession, isAdminOrStaff, activeToken, API_BASE_URL]);

  const handleSelectVideo = async (cls) => {
    setSelectedVideo(cls);

    // Optimistically increment view count in UI
    setRecordedClasses((prev) =>
      prev.map((item) =>
        item.id === cls.id
          ? {
              ...item,
              views: (item.views || item.total_views || 0) + 1,
              total_views: (item.total_views || item.views || 0) + 1,
            }
          : item
      )
    );

    // Call the backend record view endpoint
    if (cls.id && activeToken) {
      try {
        const headers = {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        };
        const res = await axios.post(`${API_BASE_URL}/api/students/recorded-classes/${cls.id}/view`, {}, { headers });
        if (res.data?.success && res.data.data) {
          setRecordedClasses((prev) =>
            prev.map((item) =>
              item.id === cls.id
                ? {
                    ...item,
                    views: res.data.data.views,
                    total_views: res.data.data.total_views || res.data.data.views,
                    unique_viewers: res.data.data.unique_viewers,
                    view_count: res.data.data.view_count,
                    my_views: res.data.data.my_views,
                  }
                : item
            )
          );
        }
      } catch (err) {
        console.warn("Could not record class view:", err?.response?.data?.message || err.message);
      }
    }
  };

  // Extract unique available courses from loaded recordings
  const availableCourses = useMemo(() => {
    const set = new Set();
    recordedClasses.forEach((c) => {
      const course = c.course_name || c.course?.title;
      if (course) set.add(course);
    });
    return Array.from(set);
  }, [recordedClasses]);

  const filteredClasses = recordedClasses.filter(c => {
    const matchesSearch = (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.subject || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedCourseFilter !== "all") {
      const cName = (c.course_name || c.course?.title || "").toLowerCase();
      if (cName !== selectedCourseFilter.toLowerCase()) return false;
    }

    return true;
  });

  // Computed metrics and filtered viewers for Staff/Admin engagement modal
  const viewersList = sessionAnalyticsData?.viewers || activeAnalyticsSession?.viewers || [];
  const totalViewsCount = sessionAnalyticsData?.total_views ?? (activeAnalyticsSession?.views || activeAnalyticsSession?.total_views || 0);
  const uniqueViewersCount = sessionAnalyticsData?.unique_viewers ?? (activeAnalyticsSession?.unique_viewers ?? viewersList.length);
  const repeatViewersCount = sessionAnalyticsData?.repeat_viewers ?? viewersList.filter((v) => Number(v.view_count) > 1).length;

  const filteredViewers = viewersList.filter((v) => {
    const studentName = `${v.firstname || ""} ${v.surname || ""} ${v.name || ""}`.toLowerCase();
    const matchesSearch = studentName.includes(analyticsSearchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (analyticsFilter === "repeat") {
      return Number(v.view_count) > 1;
    }
    return true;
  });

  const Layout = isAdminOrStaff ? StaffDashboardLayout : DashboardLayout;

  return (
    <Layout
      pagetitle={isAdminOrStaff ? "Video Vault & Class Recordings" : "Recorded Classes"}
      hideRightPanel={true}
      hideHeader={false}
    >
      <div className="w-full max-w-[1400px] mx-auto pb-10">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {isAdminOrStaff ? "Academy Video Vault & Analytics" : "Recorded Sessions"}
                </span>
                {isAdminOrStaff && (
                  <span className="text-xs font-bold text-gray-400">
                    {recordedClasses.length} recordings available
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black text-[#09314F] dark:text-white tracking-tight">
                {isAdminOrStaff ? "Master Class Video Vault" : "Recorded Masterclasses"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                {isAdminOrStaff
                  ? "Explore all masterclass recordings, student watch times, unique viewers, and repeat session attendance."
                  : "Catch up on sessions you missed or review topics for your upcoming exams."}
              </p>
            </div>
            {isAdminOrStaff && (
              <button
                onClick={() => navigate('/staffs/calendar')}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                <Icon icon="lucide:calendar" className="w-4 h-4" />
                Back to Master Class Calendar
              </button>
            )}
          </div>

          {/* Admin Vault Overview Metrics Strip */}
          {isAdminOrStaff && recordedClasses.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Vault Recordings</p>
                <p className="text-2xl font-black text-[#09314F] dark:text-white mt-1">{recordedClasses.length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Total class videos</p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total Class Plays</p>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-200 mt-1">
                  {recordedClasses.reduce((acc, c) => acc + (c.views || c.total_views || 0), 0)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Cumulative student views</p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Unique Students</p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-200 mt-1">
                  {recordedClasses.reduce((acc, c) => acc + (c.unique_viewers || 0), 0)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Total unique learners</p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Watch Time Window</p>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-200 mt-1">10 mins</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Min interval per view</p>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search classes by title or subject..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E83831]/20 focus:border-[#E83831] transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold text-gray-600 dark:text-gray-300">
              <Icon icon="lucide:filter" className="w-4 h-4" />
              Filter
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold text-gray-600 dark:text-gray-300">
              <Icon icon="lucide:arrow-down-up" className="w-4 h-4" />
              Sort
            </button>
          </div>
        </div>

        {/* Program / Course Filter Tabs */}
        {availableCourses.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Program:</span>
            <button
              type="button"
              onClick={() => setSelectedCourseFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCourseFilter === "all"
                  ? "bg-[#09314F] text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Programs ({recordedClasses.length})
            </button>
            {availableCourses.map((cName) => {
              const count = recordedClasses.filter(c => (c.course_name || c.course?.title || "").toLowerCase() === cName.toLowerCase()).length;
              return (
                <button
                  key={cName}
                  type="button"
                  onClick={() => setSelectedCourseFilter(cName)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCourseFilter.toLowerCase() === cName.toLowerCase()
                      ? "bg-[#09314F] text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {cName} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Classes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Icon icon="lucide:loader-2" className="w-8 h-8 text-[#E83831] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-semibold">{error}</div>
        ) : filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClasses.map((cls) => {
              const thumbUrl = getThumbnailUrl(cls);

              return (
              <div 
                key={cls.id} 
                className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => handleSelectVideo(cls)}
              >
                {/* Thumbnail Area */}
                <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  {thumbUrl ? (
                    <>
                      <img
                        src={thumbUrl}
                        alt={cls.title || "Recorded Class"}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {/* Dark overlay for contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/70 transition-colors" />
                    </>
                  ) : (
                    /* Fallback decorative pattern */
                    <div className={`absolute inset-0 bg-gradient-to-br ${cls.color || "from-blue-600 to-indigo-600"} flex items-center justify-center`}>
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_2px,transparent_2px)] bg-[size:16px_16px]" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center border border-white/40 group-hover:scale-110 group-hover:bg-[#E83831] group-hover:border-[#E83831] transition-all duration-300 shadow-xl">
                    <Icon icon="lucide:play" className="w-5 h-5 md:w-6 md:h-6 text-white ml-0.5" />
                  </div>

                  {/* Views Badge (Student vs Admin View) */}
                  {typeof cls.views !== "undefined" && (
                    isAdminOrStaff ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAnalyticsSession(cls);
                        }}
                        title="Click to view student watch attendance and repeat re-watch counts"
                        className="absolute top-3 left-3 z-20 bg-black/80 hover:bg-[#09314F] backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5 border border-white/20 hover:border-blue-400 transition-all shadow-md group/badge cursor-pointer"
                      >
                        <Icon icon="solar:eye-bold" className="w-3.5 h-3.5 text-blue-400" />
                        <span>{formatViewCount(cls.views || cls.total_views || 0)}</span>
                        {typeof cls.unique_viewers !== "undefined" && (
                          <span className="text-gray-300 border-l border-white/20 pl-1.5 flex items-center gap-1 font-semibold">
                            <Icon icon="lucide:users" className="w-3 h-3 text-emerald-400" />
                            {cls.unique_viewers}
                          </span>
                        )}
                        <Icon icon="solar:chart-square-bold" className="w-3 h-3 text-amber-400 ml-0.5" />
                      </button>
                    ) : (
                      <div className="absolute top-3 left-3 z-10 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5 border border-white/10 shadow-sm pointer-events-none">
                        <Icon icon="solar:eye-bold" className="w-3.5 h-3.5 text-blue-400" />
                        <span>{formatViewCount(cls.views || cls.total_views || 0)}</span>
                      </div>
                    )
                  )}
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 z-10 bg-black/75 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-md tracking-wider border border-white/10">
                    {cls.duration || "1h"}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(cls.course_name || cls.course?.title) && (
                        <span className="inline-block px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider rounded-md">
                          {cls.course_name || cls.course?.title}
                        </span>
                      )}
                      <span className="inline-block px-2.5 py-1 bg-[#09314F]/10 dark:bg-gray-700 text-[#09314F] dark:text-blue-300 text-[10px] font-black uppercase tracking-wider rounded-md">
                        {cls.subject}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Icon icon="lucide:calendar" className="w-3.5 h-3.5" />
                      {formatRecordedDate(cls)}
                    </span>
                  </div>

                  {/* Subtitle / Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
                      <Icon icon="lucide:user" className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{cls.tutor}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight mb-2 group-hover:text-[#E83831] transition-colors line-clamp-2">
                    {cls.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#09314F] text-white flex items-center justify-center text-[10px] font-bold">
                        {cls.tutor?.[0] || "T"}
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {cls.tutor || "Instructor"}
                      </span>
                    </div>
                    <button className="text-[#E83831] text-xs font-black uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                      Watch <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center p-16 sm:p-20 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 mt-8">
            <Icon icon="lucide:video-off" className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-black text-gray-700 dark:text-gray-300 mb-2">No recorded classes yet</h3>
            <p className="text-sm text-gray-400 max-w-md text-center">
              {searchQuery
                ? `We couldn't find any recordings matching "${searchQuery}". Try adjusting your search.`
                : !isAdminOrStaff
                  ? "Recordings for your registered courses will appear here once live sessions end. If you are registered for upcoming programs like JAMB, video recordings will become available once live masterclasses kick off next month!"
                  : "No recordings found for the selected program or filters."}
            </p>
          </div>
        )}

      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <Icon icon="lucide:x" className="w-6 h-6" />
          </button>

          <div className="w-full max-w-6xl w-11/12 h-[80vh] md:h-[90vh] flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden shadow-2xl relative">
            {/* In-player view counter & fullscreen helper */}
            <div className="absolute top-4 left-4 bg-black/65 px-4 py-2 rounded-xl text-white font-semibold text-xs backdrop-blur-md z-10 flex items-center gap-3 border border-white/10 shadow-lg">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <Icon icon="solar:eye-bold" className="w-4 h-4" />
                {formatViewCount(selectedVideo.views || selectedVideo.total_views || 0)}
              </span>
              <span className="text-gray-500">|</span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <Icon icon="lucide:maximize" className="w-3.5 h-3.5 text-gray-400"/> Player fullscreen controls available
              </span>
            </div>
            {selectedVideo.videoId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.videoId}?autoplay=1&modestbranding=1&rel=0&controls=1`}
                title="Recorded Masterclass"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              ></iframe>
            ) : (
              <iframe
                className="w-full h-full"
                src={selectedVideo.videoUrl}
                title="Recorded Masterclass"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      )}

      {/* Admin/Staff Class Viewers & Engagement Modal */}
      {isAdminOrStaff && activeAnalyticsSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between bg-gradient-to-r from-gray-50/80 to-white dark:from-gray-800 dark:to-gray-800/80">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#09314F] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Icon icon="solar:eye-bold" className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#09314F]/10 dark:bg-gray-700 text-[#09314F] dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                      {activeAnalyticsSession.subject || "Recorded Class"}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                      Tutor: {activeAnalyticsSession.tutor || "Instructor"}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                    {activeAnalyticsSession.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveAnalyticsSession(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                title="Close"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Engagement Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Total Views */}
                <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      Total Views
                    </span>
                    <Icon icon="solar:eye-bold" className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-[#09314F] dark:text-blue-100">
                    {totalViewsCount}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    All plays (10m+ watch time)
                  </p>
                </div>

                {/* Unique Viewers */}
                <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Unique Students
                    </span>
                    <Icon icon="lucide:users" className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-[#09314F] dark:text-emerald-100">
                    {uniqueViewersCount}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Distinct individual students
                  </p>
                </div>

                {/* Repeat Watchers */}
                <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/10 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      Repeat Watchers
                    </span>
                    <Icon icon="solar:flame-bold" className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-[#09314F] dark:text-amber-100">
                    {repeatViewersCount}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Watched more than once
                  </p>
                </div>
              </div>

              {/* Explainer: What are Unique Viewers */}
              <div className="bg-slate-50 dark:bg-gray-900/60 border border-slate-200/80 dark:border-gray-700/80 rounded-2xl p-3.5 flex items-start gap-3">
                <Icon icon="lucide:info" className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <span className="font-bold text-gray-800 dark:text-gray-200">What are Unique Viewers?</span>{" "}
                  <strong>Unique Viewers</strong> represents the count of distinct students who watched this recording. If a student re-watches the class multiple times (with each rewatch requiring at least 10 minutes of watch time), their views add to <strong>Total Views</strong>, but they count only once under <strong>Unique Students</strong>.
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search student by first or last name..."
                    value={analyticsSearchQuery}
                    onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl shrink-0">
                  <button
                    onClick={() => setAnalyticsFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      analyticsFilter === "all"
                        ? "bg-white dark:bg-gray-800 text-[#09314F] dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    All ({viewersList.length})
                  </button>
                  <button
                    onClick={() => setAnalyticsFilter("repeat")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      analyticsFilter === "repeat"
                        ? "bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <Icon icon="solar:flame-bold" className="w-3.5 h-3.5 text-amber-500" />
                    Repeat ({repeatViewersCount})
                  </button>
                </div>
              </div>

              {/* Viewers List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
                  <span>Student</span>
                  <span>Engagement</span>
                </div>

                {viewersLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-xs font-medium">Loading viewer attendance...</span>
                  </div>
                ) : filteredViewers.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700/60 max-h-[300px] overflow-y-auto rounded-2xl border border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800/40">
                    {filteredViewers.map((viewer, idx) => {
                      const firstName = viewer.firstname || viewer.name?.split(" ")?.[0] || "Student";
                      const lastName = viewer.surname || viewer.name?.split(" ")?.slice(1).join(" ") || "";
                      const viewCount = Number(viewer.view_count) || 1;
                      const isRepeat = viewCount > 1;
                      const avatarSrc = viewer.avatar
                        ? viewer.avatar.startsWith("http")
                          ? viewer.avatar
                          : `${API_BASE_URL}/storage/${viewer.avatar}`
                        : null;

                      return (
                        <div
                          key={viewer.student_id || viewer.id || idx}
                          className="p-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {avatarSrc ? (
                              <img
                                src={avatarSrc}
                                alt={firstName}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#09314F] to-blue-700 text-white font-black text-xs flex items-center justify-center border border-white/20 shadow-sm">
                                {firstName[0]?.toUpperCase() || "S"}
                                {lastName[0]?.toUpperCase() || ""}
                              </div>
                            )}

                            <div>
                              <div className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                <span>{firstName} {lastName}</span>
                              </div>
                              <div className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <Icon icon="lucide:clock" className="w-3 h-3" />
                                Last viewed: {formatViewTimestamp(viewer.last_viewed_at || viewer.first_viewed_at)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {isRepeat ? (
                              <>
                                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 shadow-sm">
                                  <Icon icon="solar:flame-bold" className="w-3.5 h-3.5 text-amber-500" />
                                  {viewCount} views
                                </span>
                                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                                  Rewatched {viewCount - 1}x
                                </span>
                              </>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                1 view
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Icon icon="lucide:users" className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {analyticsSearchQuery
                        ? `No viewers found matching "${analyticsSearchQuery}"`
                        : analyticsFilter === "repeat"
                        ? "No students have re-watched this recording yet."
                        : "No students have viewed this recording yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end">
              <button
                onClick={() => setActiveAnalyticsSession(null)}
                className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
};

export default RecordedClasses;
