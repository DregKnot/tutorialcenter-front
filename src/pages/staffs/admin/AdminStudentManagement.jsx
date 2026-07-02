import React, { useState, useEffect, useCallback } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import AdminStudentViewModal from "../../../components/private/staffs/AdminStudentViewModal.jsx";
import axios from "axios";
import { 
  MagnifyingGlassIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserGroupIcon as UserGroupOutline,
  CheckCircleIcon,
  NoSymbolIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline";

export default function AdminStudentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stats, setStats] = useState([
    { 
      label: "Total Students", 
      value: 0, 
      subLabel: "+0 new", 
      icon: UserGroupOutline, 
      color: "text-[#0F2843]", 
      bg: "bg-blue-50/50",
      counterColor: "bg-white border-gray-100 text-gray-400"
    },
    { 
      label: "Active Students", 
      value: 0, 
      subLabel: "Online", 
      icon: CheckCircleIcon, 
      color: "text-[#22C55E]", 
      bg: "bg-green-50/50",
      counterColor: "bg-white border-green-100 text-[#22C55E]"
    },
    { 
      label: "Inactive Students", 
      value: 0, 
      subLabel: "Offline", 
      icon: UserGroupOutline, 
      color: "text-[#EF4444]", 
      bg: "bg-red-50/50",
      counterColor: "bg-white border-red-100 text-[#EF4444]"
    },
    { 
      label: "Suspended", 
      value: 0, 
      subLabel: "", 
      icon: NoSymbolIcon, 
      color: "text-[#F59E0B]", 
      bg: "bg-orange-50/50",
      counterColor: "bg-white border-orange-100 text-[#F59E0B]"
    },
  ]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const config = {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      };

      const res = await axios.get(`${API_BASE_URL}/api/admin/students/all`, config);
      console.log("[AdminStudentManagement] Fetch results:", res.data);
      const fetchedStudents = res.data?.students || res.data?.data || [];
      const studentsArray = Array.isArray(fetchedStudents) ? fetchedStudents : [];
      
      setStudents(studentsArray);
      calculateStats(studentsArray);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const calculateStats = (allStudents) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const newStudentsThisMonth = allStudents.filter(s => {
      if (!s.created_at) return false;
      const date = new Date(s.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const activeCount = allStudents.filter(s => s.account_status === "active").length;
    const inactiveCount = allStudents.filter(s => s.account_status === "inactive").length;
    const suspendedCount = allStudents.filter(s => 
      s.banned === 1 || 
      s.account_status === "suspended" || 
      s.deleted_at != null || 
      s.information?.deleted_at != null || 
      (Array.isArray(s.information) && s.information[0]?.deleted_at != null)
    ).length;

    setStats(prev => [
      { ...prev[0], value: allStudents.length, subLabel: `+${newStudentsThisMonth.length} new` },
      { ...prev[1], value: activeCount || allStudents.length, subLabel: "Active" }, 
      { ...prev[2], value: inactiveCount, subLabel: "Inactive" },
      { ...prev[3], value: suspendedCount, subLabel: `Suspended` },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (studentId) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudentId(null);
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstname || ''} ${student.surname || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || (student.email && student.email.toLowerCase().includes(query));
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const currentStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <StaffDashboardLayout pagetitle="STUDENT MANAGEMENT">
      <div className="flex flex-col gap-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800/80 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-gray-700/50 flex flex-col justify-between h-44 transition-all hover:translate-y-[-2px]">
               <div className="flex justify-between items-start">
                  <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                     <stat.icon className="w-6 h-6" />
                  </div>
                  {stat.subLabel && (
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${stat.counterColor} shadow-sm uppercase tracking-wider`}>
                      {stat.subLabel}
                    </span>
                  )}
               </div>
               <div>
                  <p className="text-[13px] font-bold text-gray-400 mb-1">{stat.label}</p>
                  <h3 className="text-4xl font-black text-[#0F2843] dark:text-white">{stat.value}</h3>
               </div>
            </div>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           {/* Search and Filters */}
           <div className="flex items-center gap-4 w-full md:w-auto flex-1">
              <button className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                 <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-600" />
              </button>
              <div className="relative flex-1 max-w-lg">
                 <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search by name, email..." 
                   className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-[0_4px_15px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-[#BB9E7F] text-sm font-medium text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-500" 
                 />
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

        {/* Students Table Section */}
        <div className="space-y-4">
           {/* Custom Table Header */}
           <div className="grid grid-cols-6 items-center bg-[#BB9E7F] px-8 py-5 rounded-2xl text-white font-black text-[13px] uppercase tracking-widest shadow-lg">
              <div>Name</div>
              <div className="text-center">Status</div>
              <div className="text-center">Email</div>
              <div className="text-center">Phone Number</div>
              <div className="text-center">Actions</div>
              <div className="text-center"></div>
           </div>

           {/* Students Rows List */}
           <div className="flex flex-col gap-4 min-h-[400px]">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#0F2843]/20 border-t-[#0F2843] rounded-full animate-spin"></div>
                </div>
              ) : currentStudents.length > 0 ? (
                currentStudents.map((student, idx) => {
                  const isSuspended = student.banned === 1 || 
                                      student.account_status === "suspended" || 
                                      student.deleted_at != null || 
                                      student.information?.deleted_at != null || 
                                      (Array.isArray(student.information) && student.information[0]?.deleted_at != null);

                  const displayName = (student.firstname && student.surname)
                    ? `${student.firstname} ${student.surname}`.trim() 
                    : student.username || "Unknown Student";

                  return (
                  <div 
                    key={student.id || idx} 
                    className={`grid grid-cols-6 items-center bg-white dark:bg-gray-800 px-8 py-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-50 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2 ${isSuspended ? "opacity-60 grayscale-[0.5]" : ""}`}
                  >
                     {/* Name Column with Avatar */}
                     <div className="flex items-center gap-4 col-span-1">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#BB9E7F]/30 group-hover:border-[#BB9E7F] transition-all bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                           {student.profile_picture ? (
                             <img 
                               src={`${API_BASE_URL}/storage/${student.profile_picture}`} 
                               className="w-full h-full object-cover" 
                               alt={displayName} 
                             />
                           ) : (
                             <span className="font-black text-[#0F2843] dark:text-white text-sm">
                               {displayName?.[0]?.toUpperCase() || "S"}
                             </span>
                           )}
                        </div>
                        <span className="font-black text-[#0F2843] dark:text-white text-sm truncate">{displayName}</span>
                     </div>
                     
                     {/* Data Columns */}
                     <div className="text-center font-black text-[13px] tracking-tight uppercase">
                       {isSuspended ? (
                         <span className="text-[#EF4444]">Suspended</span>
                       ) : (
                         <span className={student.account_status === 'active' ? 'text-[#22C55E]' : 'text-gray-500'}>
                           {student.account_status || "Active"}
                         </span>
                       )}
                     </div>
                     <div className="text-center text-gray-500 font-bold text-[13px] truncate">{student.email || "—"}</div>
                     <div className="text-center text-[#BB9E7F] font-black text-sm">{student.tel || student.guardian?.tel || "—"}</div>
                     
                     {/* Actions Column */}
                     <div className="text-center">
                        <button 
                          onClick={() => handleOpenModal(student.id)}
                          className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-[#0F2843] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all active:scale-95"
                        >
                           <EyeIcon className="w-5 h-5" />
                        </button>
                     </div>
                     <div className="text-center"></div>
                  </div>
                )})
              ) : (
                /* Awaiting Content Placeholder */
                <div className="flex-1 flex flex-col items-center justify-center bg-white/40 dark:bg-gray-800/40 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700 p-12">
                   <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                      <UserPlusIcon className="w-10 h-10 text-gray-300" />
                   </div>
                   <h3 className="text-2xl font-black text-gray-400 mb-2">No Students Found</h3>
                   <p className="text-gray-400 text-sm font-medium text-center max-w-sm leading-relaxed">
                      {searchQuery ? `No student matches "${searchQuery}". Try a different search.` : "No students are currently registered in the system."}
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
      
      {isModalOpen && selectedStudentId && (
        <AdminStudentViewModal 
          studentId={selectedStudentId}
          onClose={handleCloseModal}
          onUpdate={fetchData}
        />
      )}
    </StaffDashboardLayout>
  );
}
