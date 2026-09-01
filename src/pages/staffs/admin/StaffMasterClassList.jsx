// pages/Admin/MasterClass/MasterClassList.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import CreateMasterClassModal from "../../../components/private/staffs/AdminMasterclassModal.jsx";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserCircleIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

// --- HELPERS ---
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? "pm" : "am";
  const h12 = hour % 12 || 12;
  return `${h12}:${m}${ampm}`;
};

const getStaffName = (cls) => {
  const staff = cls.staffs?.[0];
  if (!staff) return "Unassigned";
  const s = staff.staff || staff;
  if (s.firstname && s.surname) return `${s.firstname} ${s.surname}`;
  return s.name || "Unassigned";
};

// --- STANDALONE CLASS ROW COMPONENT ---
function ClassRow({ cls, copiedLink, onCopyLink, onSelectDetail, onEdit }) {
  const isLinkCopied = copiedLink === cls.id;
  const startDate = cls.start_date || cls.schedules?.[0]?.start_date;
  const endDate = cls.end_date || cls.schedules?.[0]?.end_date;
  const isActive = cls.status === "active";
  
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
    <div 
      onClick={() => onSelectDetail(cls)}
      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-gray-100 dark:border-gray-700/40 last:border-0 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all rounded-2xl group cursor-pointer"
    >
      {/* Left Side: Avatar + Title + Instructor */}
      <div className="flex items-center gap-4 min-w-[260px] flex-1">
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
            isActive 
              ? "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white" 
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          }`}>
            {cls.title ? cls.title.substring(0, 2).toUpperCase() : "MC"}
          </div>
          <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${
            isActive ? "bg-emerald-500" : "bg-gray-400"
          }`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate" title={cls.title}>
              {cls.title}
            </h3>
            {cls.subject?.name && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                {cls.subject.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <UserCircleIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate font-medium">{getStaffName(cls)}</span>
          </div>
        </div>
      </div>

      {/* Middle Side: Date Range (Start Date -> End Date) & Weekly Schedule */}
      <div className="flex flex-wrap items-center gap-4 lg:gap-6 min-w-[320px] flex-1">
        {/* Start Date & End Date Timeline */}
        <div className="flex flex-col bg-gray-50 dark:bg-gray-700/40 px-3.5 py-2 rounded-xl border border-gray-100 dark:border-gray-700/60 min-w-[200px]">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1">
            <CalendarDaysIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Duration Timeline</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
            <span>{formatDate(startDate)}</span>
            <span className="text-gray-400 font-normal">to</span>
            <span>{formatDate(endDate)}</span>
          </div>
        </div>

        {/* Weekly Schedule Days & Times */}
        <div className="flex flex-col justify-center min-w-[140px]">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1">
            <ClockIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Weekly Schedule</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cls.schedules && cls.schedules.length > 0 ? (
              cls.schedules.map((s, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                >
                  {s.day_of_week.substring(0, 3).toUpperCase()}: {formatTime(s.start_time)}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">No schedule</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Links & Actions */}
      <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700/40">
        {/* Join Link */}
        {link ? (
          <div className="flex items-center gap-1.5 bg-blue-50/70 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
            <VideoCameraIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline truncate max-w-[100px] lg:max-w-[120px]"
              title={link}
            >
              {link.replace(/^https?:\/\//, '')}
            </a>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink(link, cls.id);
              }}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md transition-colors"
              title="Copy class link"
            >
              <Icon 
                icon={isLinkCopied ? "mdi:check" : "mdi:content-copy"} 
                className={`w-3.5 h-3.5 ${isLinkCopied ? "text-emerald-600" : "text-blue-500"}`} 
              />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic px-2">No meeting link</span>
        )}

        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(cls);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-[#0F2843] hover:text-white dark:bg-gray-700 dark:hover:bg-blue-600 rounded-xl transition-all text-gray-700 dark:text-gray-200 font-bold text-xs shadow-sm"
          title="Edit Master Class"
        >
          <Icon icon="mdi:pencil-outline" className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
}

// --- MAIN MASTERCLASS LIST COMPONENT ---
export default function MasterClassList() {
  // --- STATE ---
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [toast, setToast] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  // --- FETCHING LOGIC ---
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/classes/all`, {
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
      console.error("Endpoint failed:", error.response?.status, error.response?.data);
      setClasses([]); 
      setToast({
        type: "error",
        message: "Failed to load classes."
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleCopyLink = (link, classId) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(classId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleEditClass = (cls) => {
    setSelectedClassDetail(null);
    setEditingClass(cls);
    setShowCreateModal(true);
  };

  // --- FILTERED CLASSES ---
  const filteredClasses = useMemo(() => {
    if (!Array.isArray(classes)) return [];
    return classes.filter(cls => {
      // Status filter
      if (statusFilter !== "all" && cls.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = cls.title?.toLowerCase().includes(q);
        const descMatch = cls.description?.toLowerCase().includes(q);
        const subjectMatch = cls.subject?.name?.toLowerCase().includes(q);
        const tutorMatch = getStaffName(cls).toLowerCase().includes(q);
        return titleMatch || descMatch || subjectMatch || tutorMatch;
      }

      return true;
    });
  }, [classes, searchQuery, statusFilter]);

  // --- RENDER ---
  return (
    <StaffDashboardLayout pagetitle="MASTER CLASS">
      {/* Toast */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-full">
              <Icon icon={toast.type === "success" ? "mdi:check-circle" : "mdi:close-circle"} className="w-4 h-4" />
            </div>
            <p className="font-bold text-sm">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Create / Edit Class Modal */}
      {showCreateModal && (
        <CreateMasterClassModal
          editClass={editingClass}
          onClose={() => {
            setShowCreateModal(false);
            setEditingClass(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingClass(null);
            fetchClasses();
            setToast({
              type: "success",
              message: editingClass ? "Master class updated successfully!" : "Master class created successfully!"
            });
          }}
        />
      )}

      <div className="p-6 max-w-[1600px] xl:px-10 mx-auto w-full">

        {/* ========= Header & Controls Bar ========= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Created Master Classes
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              Manage masterclasses, weekly schedules, start & end dates, and assigned tutors
            </p>
          </div>

          <button
            onClick={() => {
              setEditingClass(null);
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#0F2843] dark:bg-blue-600 hover:bg-[#1a3d60] dark:hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Schedule Master Class</span>
          </button>
        </div>

        {/* ========= Filter & Search Controls ========= */}
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by class title, subject, instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-blue-500 focus:border-transparent bg-gray-50/50 dark:bg-gray-900/50 placeholder:text-gray-400"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
            {["all", "active", "inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === status
                    ? "bg-white dark:bg-gray-800 text-[#0F2843] dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {status === "all" ? `All (${classes.length})` : status}
              </button>
            ))}
          </div>
        </div>

        {/* ========= Classes List ========= */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0F2843] dark:border-blue-500 mx-auto" />
            <p className="mt-4 text-sm font-bold text-gray-500">Loading master classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDaysIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">No master classes found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? "No classes match your search query." : "Get started by scheduling your first masterclass."}
            </p>
            <button
              onClick={() => {
                setEditingClass(null);
                setShowCreateModal(true);
              }}
              className="mt-5 px-6 py-3 bg-[#0F2843] dark:bg-blue-600 text-white font-bold text-sm rounded-xl shadow hover:bg-opacity-90"
            >
              Schedule Master Class
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-3">
            <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {filteredClasses.map(cls => (
                <ClassRow 
                  key={cls.id} 
                  cls={cls} 
                  copiedLink={copiedLink}
                  onCopyLink={handleCopyLink}
                  onSelectDetail={setSelectedClassDetail}
                  onEdit={handleEditClass}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Detail Modal */}
      {selectedClassDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0F2843]/40 backdrop-blur-sm" 
            onClick={() => setSelectedClassDetail(null)} 
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-[#0F2843] p-8 text-white relative">
              <button 
                onClick={() => setSelectedClassDetail(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {selectedClassDetail.title?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight leading-tight">{selectedClassDetail.title}</h2>
                  <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-widest">
                    {selectedClassDetail.subject?.name || "Master Class Overview"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Assigned Instructor</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[#0F2843] dark:text-white font-black text-xs">
                        {getStaffName(selectedClassDetail)[0]}
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">{getStaffName(selectedClassDetail)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      selectedClassDetail.status === "active" 
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                    }`}>
                      {selectedClassDetail.status || "active"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Created On</h4>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Icon icon="mdi:calendar-clock" className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold">{formatDate(selectedClassDetail.created_at)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {selectedClassDetail.description || "No description provided for this master class."}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Duration & Schedule</h4>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Start Date</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {formatDate(selectedClassDetail.start_date || selectedClassDetail.schedules?.[0]?.start_date)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">End Date</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {formatDate(selectedClassDetail.end_date || selectedClassDetail.schedules?.[0]?.end_date)}
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block mb-2">Weekly Days:</span>
                        {selectedClassDetail.schedules?.map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1 text-xs">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{s.day_of_week}s</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatTime(s.start_time)} - {formatTime(s.end_time)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Class Link</h4>
                    {selectedClassDetail.class_link ? (
                      <a 
                        href={selectedClassDetail.class_link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon icon="mdi:link-variant" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 truncate max-w-[200px]">
                            {selectedClassDetail.class_link}
                          </span>
                        </div>
                        <Icon icon="mdi:arrow-right" className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No meeting link provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/80 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => {
                  const target = selectedClassDetail;
                  setSelectedClassDetail(null);
                  setEditingClass(target);
                  setShowCreateModal(true);
                }}
                className="px-5 py-2.5 bg-[#0F2843] dark:bg-blue-600 hover:bg-[#1a3d60] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm flex items-center gap-2"
              >
                <Icon icon="mdi:pencil" className="w-3.5 h-3.5" />
                Edit Master Class
              </button>
              <button 
                onClick={() => setSelectedClassDetail(null)}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffDashboardLayout>
  );
}
