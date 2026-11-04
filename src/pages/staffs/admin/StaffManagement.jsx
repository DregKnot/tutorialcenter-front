
import { useState, useEffect, useCallback, useMemo } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StaffManagementModal from "../../../components/private/staffs/StaffManagementModal.jsx";
import { 
  UsersIcon, 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  // BellIcon,
  ChevronDownIcon,
  UserGroupIcon,
  HandThumbUpIcon,
  NoSymbolIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { isReadOnlyStaff } from "../../../utils/roleUtils.js";


export default function StaffManagement() {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const staffRole = (localStorage.getItem("staff_role") || "").toLowerCase();
  const isPreview = isReadOnlyStaff(staffRole);


  const token = localStorage.getItem("staff_token");

  // --- STATE ---
  const [staffs, setStaffs] = useState([]);
  const [activeStaffs, setActiveStaffs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive', 'suspended'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Statistics State
  const [stats, setStats] = useState([
    { 
      label: "Total Staffs", 
      filterKey: "all",
      value: 0, 
      subLabel: "+0 new", 
      icon: UsersIcon, 
      color: "text-[#0F2843]", 
      bg: "bg-blue-50/50",
      counterColor: "bg-white border-gray-100 text-gray-400"
    },
    { 
      label: "Active Staffs", 
      filterKey: "active",
      value: 0, 
      subLabel: "Online", 
      icon: HandThumbUpIcon, 
      color: "text-[#22C55E]", 
      bg: "bg-green-50/50",
      counterColor: "bg-white border-green-100 text-[#22C55E]"
    },
    { 
      label: "Inactive Staffs", 
      filterKey: "inactive",
      value: 0, 
      subLabel: "Offline", 
      icon: UserGroupIcon, 
      color: "text-[#EF4444]", 
      bg: "bg-red-50/50",
      counterColor: "bg-white border-red-100 text-[#EF4444]"
    },
    { 
      label: "Suspended", 
      filterKey: "suspended",
      value: 0, 
      subLabel: "+0 staffs", 
      icon: NoSymbolIcon, 
      color: "text-[#F59E0B]", 
      bg: "bg-orange-50/50",
      counterColor: "bg-white border-orange-100 text-[#F59E0B]"
    },
  ]);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const config = {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      };

      // Fetch all staffs AND active staffs concurrently
      const [staffRes, activeRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/staffs/all`, config),
        axios.post(`${API_BASE_URL}/api/admin/staffs/active`, {}, config).catch(() => ({ data: [] }))
      ]);

      console.group("Staff Management Data Fetching");
      console.log("Staff Response Payload:");
      console.table(staffRes?.data?.staffs || staffRes?.data?.data);
      console.log("Active Staff Response Payload:", activeRes?.data);
      console.groupEnd();

      const fetchedStaffs = staffRes.data?.staffs || staffRes.data?.data;
      const staffsArray = Array.isArray(fetchedStaffs) ? fetchedStaffs : [];
      
      // The active staffs endpoint returns an array of staff in the 'staffs' property
      const activeStaffsData = Array.isArray(activeRes.data) ? activeRes.data : (activeRes.data?.staffs || activeRes.data?.data || []);
      
      console.log("🎯 PARSED ACTIVE STAFFS:", activeStaffsData);

      setStaffs(staffsArray);
      setActiveStaffs(activeStaffsData);
      calculateStats(staffsArray, activeStaffsData);
    } catch (error) {
      console.error("Endpoint failed:", error.response?.status, error.response?.data);
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const calculateStats = (allStaffs, activeStaffsData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Total and New Staff (current month)
    const newStaffsThisMonth = allStaffs.filter(s => {
      if (!s.created_at) return false;
      const date = new Date(s.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Suspended logic based on new rules: deleted_at is not null
    const suspendedStaffs = allStaffs.filter(s => s.deleted_at !== null); 
    const suspendedThisMonth = suspendedStaffs.filter(s => {
      if (!s.deleted_at) return false;
      const date = new Date(s.deleted_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Active Staffs: Determined by the length of the new active API response
    const activeCount = activeStaffsData.length;

    // Inactive Staffs: Total Staffs minus Active Staffs
    // Ensure it doesn't drop below 0 just in case of weird data
    const inactiveCount = Math.max(0, allStaffs.length - activeCount);

    setStats(prev => [
      { ...prev[0], filterKey: "all", value: allStaffs.length, subLabel: `+${newStaffsThisMonth.length} new` },
      { ...prev[1], filterKey: "active", value: activeCount }, 
      { ...prev[2], filterKey: "inactive", value: inactiveCount },
      { ...prev[3], filterKey: "suspended", value: suspendedStaffs.length, subLabel: `+${suspendedThisMonth.length} staffs` },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Active staff ID lookup set
  const activeStaffIds = useMemo(() => {
    return new Set(activeStaffs.map(s => String(s.id || s.staff_id)));
  }, [activeStaffs]);

  // Counts for status tabs
  const suspendedStaffsCount = useMemo(() => {
    return staffs.filter(s => s.deleted_at !== null).length;
  }, [staffs]);

  const activeStaffsCount = useMemo(() => {
    return staffs.filter(s => s.deleted_at === null && (activeStaffIds.has(String(s.id)) || activeStaffIds.has(String(s.staff_id)))).length;
  }, [staffs, activeStaffIds]);

  const inactiveStaffsCount = useMemo(() => {
    return Math.max(0, staffs.length - suspendedStaffsCount - activeStaffsCount);
  }, [staffs.length, suspendedStaffsCount, activeStaffsCount]);

  // --- MERGE DATA FOR TABLE WITH SUSPENDED & STATUS FILTERING ---
  const tableData = useMemo(() => {
    return staffs.map(staff => {
      const isSuspended = staff.deleted_at !== null;
      const sId = String(staff.id || staff.staff_id);
      const isActive = !isSuspended && (activeStaffIds.has(sId) || activeStaffIds.has(String(staff.id)) || activeStaffIds.has(String(staff.staff_id)));
      let status = "inactive";
      if (isSuspended) status = "suspended";
      else if (isActive) status = "active";

      return {
        ...staff,
        name: `${staff.firstname || ""} ${staff.surname || ""}`.trim() || staff.email || "Staff",
        profile_picture: (staff.profile_picture && staff.profile_picture !== "default-avatar.png") 
          ? staff.profile_picture 
          : null,
        isSuspended,
        status,
      };
    }).filter(staff => {
      // 1. Status Filter
      if (statusFilter === "suspended" && !staff.isSuspended) return false;
      if (statusFilter === "active" && staff.status !== "active") return false;
      if (statusFilter === "inactive" && staff.status !== "inactive") return false;

      // 2. Search Term Filter (name, email, staff_id, role)
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchesName = staff.name.toLowerCase().includes(q);
        const matchesEmail = (staff.email || "").toLowerCase().includes(q);
        const matchesStaffId = (staff.staff_id || "").toLowerCase().includes(q);
        const matchesRole = (staff.role || "").toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesStaffId || matchesRole;
      }

      return true;
    });
  }, [staffs, activeStaffIds, statusFilter, searchTerm]);

  // Pagination state
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(tableData.length / itemsPerPage) || 1;
  const currentStaffs = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <StaffDashboardLayout pagetitle="MANAGE STAFFS">
      <div className="flex flex-col gap-8">
        {/* Add Staff Button Row */}
        {!isPreview && (
          <div className="flex justify-end">
            <button
              onClick={() => navigate("/staffs/staff-registration")}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#0F2843] text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm"
            >
              <span className="text-2xl leading-none">+</span> Add Staff
            </button>
          </div>
        )}

        {/* Stats Grid - Interactive Filter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const isSelected = statusFilter === stat.filterKey;
            return (
              <div 
                key={idx} 
                onClick={() => {
                  setStatusFilter(stat.filterKey);
                  setCurrentPage(1);
                }}
                className={`bg-white dark:bg-gray-800/80 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border transition-all cursor-pointer flex flex-col justify-between h-44 hover:translate-y-[-2px] select-none ${
                  isSelected 
                    ? "border-[#0F2843] dark:border-[#BB9E7F] ring-2 ring-[#0F2843]/20 dark:ring-[#BB9E7F]/40 shadow-md scale-[1.01]" 
                    : "border-gray-50 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600"
                }`}
                title={`Filter table by ${stat.label}`}
              >
                 <div className="flex justify-between items-start">
                    <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                       <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#0F2843] dark:bg-[#BB9E7F] animate-pulse" />
                      )}
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${stat.counterColor} shadow-sm uppercase tracking-wider`}>
                        {stat.subLabel}
                      </span>
                    </div>
                 </div>
                 <div>
                    <p className={`text-[13px] font-bold mb-1 ${isSelected ? "text-[#0F2843] dark:text-[#BB9E7F]" : "text-gray-400"}`}>{stat.label}</p>
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-4xl font-black text-[#0F2843] dark:text-white">{stat.value}</h3>
                      {isSelected && (
                        <span className="text-[10px] font-extrabold text-[#0F2843] dark:text-[#BB9E7F] uppercase tracking-wider">Active View</span>
                      )}
                    </div>
                 </div>
              </div>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
           {/* Search Field & Status Filter Tabs */}
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                 <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search by name, email, or staff ID..." 
                   className="w-full pl-14 pr-6 py-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-[#BB9E7F] text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400" 
                 />
              </div>

              {/* Status Segment Filter Tabs */}
              <div className="flex items-center p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto text-xs font-bold gap-1">
                {[
                  { key: "all", label: "All", count: staffs.length },
                  { key: "active", label: "Active", count: activeStaffsCount },
                  { key: "inactive", label: "Inactive", count: inactiveStaffsCount },
                  { key: "suspended", label: "Suspended", count: suspendedStaffsCount, isDanger: true },
                ].map((tab) => {
                  const isActiveTab = statusFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setStatusFilter(tab.key);
                        setCurrentPage(1);
                      }}
                      className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        isActiveTab
                          ? tab.isDanger
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-[#0F2843] dark:bg-[#BB9E7F] text-white shadow-sm"
                          : tab.isDanger
                            ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                        isActiveTab
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
           </div>

           {/* Simple pagination arrows */}
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-50 dark:border-gray-700 disabled:opacity-30 transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                 <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
              >
                 <ChevronRightIcon className="w-5 h-5 text-[#0F2843] dark:text-gray-400" />
              </button>
           </div>
        </div>

        {/* Staff Table Section */}
        <div className="space-y-4">
           {/* Desktop Table Header (Hidden on Mobile) */}
           <div className="hidden md:grid md:grid-cols-6 items-center bg-[#BB9E7F] px-6 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-wider shadow-md">
              <div>Name</div>
              <div className="text-center">Staff ID</div>
              <div className="text-center">Role</div>
              <div className="text-center">Status</div>
              <div className="text-center">Email & Phone</div>
              <div className="text-right pr-4">Actions</div>
           </div>

           {/* Staff Rows List */}
           <div className="flex flex-col gap-3 min-h-[400px]">
              {loading ? (
                <div className="flex-1 flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-[#0F2843]/20 border-t-[#0F2843] rounded-full animate-spin"></div>
                </div>
              ) : currentStaffs.length > 0 ? (
                currentStaffs.map((staff, idx) => (
                  <div key={staff.id || idx}>
                    {/* DESKTOP ROW */}
                    <div 
                      onClick={() => {
                        setSelectedStaffId(staff.id);
                        setIsModalOpen(true);
                      }}
                      className={`hidden md:grid md:grid-cols-6 items-center bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border hover:shadow-lg transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2 ${
                        staff.isSuspended 
                          ? "border-amber-200 dark:border-amber-900/60 bg-amber-50/20" 
                          : "border-gray-100 dark:border-gray-700/60"
                      }`}
                    >
                       {/* Name Column with Avatar */}
                       <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                            staff.isSuspended ? "border-amber-400" : "border-[#BB9E7F]/30 group-hover:border-[#BB9E7F]"
                          } transition-all bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center`}>
                             {staff.profile_picture ? (
                               <img 
                                 src={`${API_BASE_URL}/storage/${staff.profile_picture}`} 
                                 className="w-full h-full object-cover" 
                                 alt={staff.name} 
                               />
                             ) : (
                               <span className="font-black text-[#0F2843] dark:text-white text-xs">
                                 {(staff.firstname?.[0] || "U").toUpperCase()}
                               </span>
                             )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#0F2843] dark:text-white text-sm truncate block" title={staff.name}>{staff.name}</span>
                            {staff.isSuspended && (
                              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Suspended Account</span>
                            )}
                          </div>
                       </div>
                       
                       {/* Staff ID */}
                       <div className="text-center text-gray-500 font-bold text-xs">{staff.staff_id || "N/A"}</div>
                       
                       {/* Role */}
                       <div className="text-center font-bold text-xs">
                         <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 capitalize">
                           {staff.role}
                         </span>
                       </div>

                       {/* Status Column */}
                       <div className="text-center">
                         {staff.isSuspended ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase tracking-wider">
                             <NoSymbolIcon className="w-3.5 h-3.5" />
                             Suspended
                           </span>
                         ) : staff.status === "active" ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             Active
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 uppercase tracking-wider">
                             Offline
                           </span>
                         )}
                       </div>

                       {/* Email & Phone */}
                       <div className="text-center min-w-0 px-2">
                         <p className="text-gray-800 dark:text-gray-200 font-medium text-xs truncate" title={staff.email}>{staff.email}</p>
                         <p className="text-[#BB9E7F] font-bold text-[11px] mt-0.5">{staff.tel || "—"}</p>
                       </div>
                       
                       {/* Actions Column */}
                       <div className="text-right pr-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStaffId(staff.id);
                              setIsModalOpen(true);
                            }}
                            className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-[#0F2843] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all active:scale-95"
                            title="View staff details"
                          >
                             <EyeIcon className="w-4 h-4" />
                          </button>
                       </div>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div 
                      onClick={() => {
                        setSelectedStaffId(staff.id);
                        setIsModalOpen(true);
                      }}
                      className="block md:hidden bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#BB9E7F]/30 bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                            {staff.profile_picture ? (
                              <img 
                                src={`${API_BASE_URL}/storage/${staff.profile_picture}`} 
                                className="w-full h-full object-cover" 
                                alt={staff.name} 
                              />
                            ) : (
                              <span className="font-black text-[#0F2843] dark:text-white text-xs">
                                {(staff.firstname?.[0] || "U").toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#0F2843] dark:text-white text-sm truncate">{staff.name}</p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 capitalize">
                                {staff.role} • ID: {staff.staff_id || "N/A"}
                              </span>
                              {staff.isSuspended ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  <NoSymbolIcon className="w-3 h-3" />
                                  Suspended
                                </span>
                              ) : staff.status === "active" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaffId(staff.id);
                            setIsModalOpen(true);
                          }}
                          className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-[#0F2843] dark:hover:text-white rounded-xl"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs">
                        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                          <span className="text-[11px] font-semibold">Email:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{staff.email || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                          <span className="text-[11px] font-semibold">Phone:</span>
                          <span className="font-bold text-[#BB9E7F]">{staff.tel || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Awaiting Content Placeholder */
                <div className="flex-1 flex flex-col items-center justify-center bg-white/40 dark:bg-gray-800/40 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700 p-12">
                   <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                      <UserPlusIcon className="w-10 h-10 text-gray-300" />
                   </div>
                   <h3 className="text-2xl font-black text-gray-400 mb-2">
                     {statusFilter === "suspended" ? "No Suspended Staff" : "No Staff Found"}
                   </h3>
                   <p className="text-gray-400 text-sm font-medium text-center max-w-sm leading-relaxed">
                      {statusFilter === "suspended" 
                        ? "There are currently no suspended staff members. All staff accounts are in good standing." 
                        : searchTerm 
                        ? `No staff matches "${searchTerm}". Try a different search.` 
                        : "No staff members found matching your criteria."}
                   </p>
                </div>
              )}
           </div>
        </div>

        {/* Detailed Pagination Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-t border-gray-100">
           {/* Page Numbers */}
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:translate-y-[-2px] disabled:opacity-30 transition-all border border-gray-50 dark:border-gray-700"
              >
                 <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              
              {/* Dynamic Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                 if (totalPages > 5) {
                   if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                     if (page === 2 || page === totalPages - 1) return <span key={page} className="px-2 text-gray-400 font-bold">...</span>;
                     return null;
                   }
                 }
                 return (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-xl font-black text-sm transition-all hover:translate-y-[-2px] ${
                    page === currentPage 
                      ? "bg-[#BB9E7F] text-white shadow-lg scale-105" 
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-50 dark:border-gray-700 hover:border-[#BB9E7F]/30"
                  }`}
                >
                  {page}
                </button>
              )})}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:translate-y-[-2px] disabled:opacity-30 transition-all border border-gray-50 dark:border-gray-700"
              >
                 <ChevronRightIcon className="w-5 h-5 text-[#0F2843] dark:text-gray-400" />
              </button>
           </div>

           {/* Rows per page selector */}
           <div className="flex items-center gap-4 opacity-70">
              <div className="bg-white dark:bg-gray-800 px-5 py-3.5 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700 flex items-center gap-3 transition-all group">
                 <span className="font-black text-[#0F2843] dark:text-white text-sm">10</span>
                 <ChevronDownIcon className="w-5 h-5 text-gray-300" />
              </div>
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">/ page</span>
           </div>
        </div>
      </div>

      {/* Staff Management Modal */}
      {isModalOpen && selectedStaffId && (
        <StaffManagementModal 
          staffId={selectedStaffId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStaffId(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedStaffId(null);
            fetchData(); // Refresh table data
          }}
        />
      )}
    </StaffDashboardLayout>
  );
}
