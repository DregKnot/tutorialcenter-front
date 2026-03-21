import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { 
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

export default function TutorMasterClass() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  // --- FETCHING LOGIC ---
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/tutor/classes`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      const fetchedClasses = response?.data?.classes;
      if (Array.isArray(fetchedClasses)) {
        setClasses(fetchedClasses);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setClasses([]);
      setToast({ type: "error", message: "Failed to load your master classes." });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // --- GROUPING ---
  const filteredList = useMemo(() => {
    if (!Array.isArray(classes)) return [];
    if (!searchQuery) return classes;
    return classes.filter(cls => 
      cls.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classes, searchQuery]);

  const todayClasses = useMemo(() => {
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return filteredList.filter(cls =>
      cls.schedules?.some(schedule => schedule.day_of_week === dayOfWeek)
    );
  }, [filteredList]);

  const olderClasses = useMemo(() => {
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return filteredList.filter(cls =>
      !cls.schedules?.some(schedule => schedule.day_of_week === dayOfWeek)
    );
  }, [filteredList]);

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

  const copyToClipboard = (link, classId) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(classId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // --- CLASS ROW ---
  const ClassRow = ({ cls }) => {
    const isLinkCopied = copiedLink === cls.id;
    const schedule = cls.schedules?.[0];
    const startTime = schedule ? formatTime(schedule.start_time) : "—";
    
    let link = cls.class_link;
    if (!link && cls.schedules && cls.schedules.length > 0) {
       for (let sched of cls.schedules) {
          if (sched.sessions && sched.sessions.length > 0) {
             const found = sched.sessions.find(s => s.class_link);
             if (found) { link = found.class_link; break; }
          }
       }
    }

    return (
      <div className="flex items-center gap-6 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-all px-4 rounded-xl group">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-[#E5E7EB] text-[#4B5563] text-xs font-black flex items-center justify-center shadow-inner border border-white">
            ME
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#F5A623] border-2 border-white rounded-full shadow-sm" />
        </div>

        <div className="flex-1 flex flex-row items-center justify-between gap-3 overflow-hidden">
          <div className="flex-[2] min-w-0">
             <span className="text-[15px] font-bold text-[#1F2937] truncate block" title={cls.title}>
                {cls.title}
             </span>
          </div>

          <div className="flex-shrink-0 flex items-center gap-4 text-center">
            <span className="text-sm font-bold text-gray-600 whitespace-nowrap hidden md:block">
              {formatDate(cls.start_date)}
            </span>
            <span className="text-sm font-bold text-[#0F2843] whitespace-nowrap min-w-[65px]">
              {startTime}
            </span>
          </div>

          <div className="flex-shrink-0 min-w-0 flex justify-end">
             {link ? (
               <div className="flex items-center gap-2">
                 <a
                   href={link}
                   target="_blank"
                   rel="noreferrer"
                   className="text-sm text-blue-500 font-bold hover:underline truncate max-w-[100px] lg:max-w-[150px]"
                 >
                   {link.replace(/^https?:\/\//, '')}
                 </a>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     copyToClipboard(link, cls.id);
                   }}
                   className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                 >
                   <Icon icon={isLinkCopied ? "mdi:check" : "mdi:content-copy"} className={`w-3.5 h-3.5 ${isLinkCopied ? "text-green-500" : "text-blue-400"}`} />
                 </button>
               </div>
             ) : (
               <span className="text-xs text-gray-300 italic">No link</span>
             )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <StaffDashboardLayout>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white bg-${toast.type === "success" ? "[#76D287]" : "[#E83831]"}`}>
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-[#0F2843] tracking-tighter uppercase">Master Class</h1>
          <button className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <Icon icon="mdi:bell" className="text-[#0F2843] w-6 h-6" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#E83831] border-2 border-white rounded-full" />
          </button>
        </div>

        <div className="mb-10 max-w-sm">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by date"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-2xl text-[15px] font-bold text-[#1F2937] focus:ring-2 focus:ring-[#0F2843] focus:border-transparent bg-white shadow-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#09314F] mx-auto" />
            <p className="mt-4 text-gray-600 font-bold">Loading your classes...</p>
          </div>
        ) : (todayClasses.length === 0 && olderClasses.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-lg font-bold">No classes assigned yet.</p>
          </div>
        ) : (
          <div>
            {todayClasses.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-black text-gray-800 mb-4 px-2 uppercase tracking-widest">Today</h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-1">
                  {todayClasses.map(cls => <ClassRow key={cls.id} cls={cls} />)}
                </div>
              </div>
            )}

            {olderClasses.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-gray-800 mb-4 px-2 uppercase tracking-widest">Older</h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-1">
                  {olderClasses.map(cls => <ClassRow key={cls.id} cls={cls} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
