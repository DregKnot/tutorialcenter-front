import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function AdminGuardianManagement() {
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState([
    { label: "Total Guardians", value: 0, icon: UserGroupIcon, bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Active", value: 0, icon: ShieldCheckIcon, bg: "bg-green-100", color: "text-green-600" },
  ]);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/guardians/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.guardians || res.data?.data || [];
      setGuardians(data);
      
      const activeCount = data.length; // Simplified since there's no banned field typical for guardians

      setStats([
        { label: "Total Guardians", value: data.length, icon: UserGroupIcon, bg: "bg-[#09314F]/10", color: "text-[#09314F]" },
        { label: "Active", value: activeCount, icon: ShieldCheckIcon, bg: "bg-[#BB9E7F]/10", color: "text-[#BB9E7F]" },
      ]);
    } catch (error) {
      console.error("Failed to fetch guardians:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter guardians
  const filteredGuardians = guardians.filter(g => {
    const query = searchQuery.toLowerCase();
    const fullName = `${g.firstname || ''} ${g.surname || ''}`.toLowerCase();
    return fullName.includes(query) || (g.email && g.email.toLowerCase().includes(query)) || (g.tel && g.tel.includes(query));
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredGuardians.length / itemsPerPage) || 1;
  const currentGuardians = filteredGuardians.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <StaffDashboardLayout pagetitle="GUARDIAN MANAGEMENT">
      <div className="flex flex-col gap-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-gray-800/80 p-6 rounded-3xl border border-gray-50 dark:border-gray-700/50 flex flex-col justify-between h-40 shadow-sm"
            >
               <div className="flex justify-between items-start">
                  <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                     <stat.icon className="w-6 h-6" />
                  </div>
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
           <div className="flex items-center gap-4 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-lg">
                 <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                   placeholder="Search by name, email, or phone..." 
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

        {/* Guardians Table Section */}
        {/* Guardians Table Section */}
        <div className="space-y-4">
           {/* Desktop Table Header (Hidden on Mobile) */}
           <div className="hidden md:grid md:grid-cols-4 items-center bg-[#09314F] px-6 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-wider shadow-md">
              <div>Guardian Name</div>
              <div className="text-center">Email</div>
              <div className="text-center">Phone Number</div>
              <div className="text-right pr-4">Students Enrolled</div>
           </div>

           {/* Rows List */}
           <div className="flex flex-col gap-3 min-h-[400px]">
              {loading ? (
                <div className="flex-1 flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-[#0F2843]/20 border-t-[#0F2843] rounded-full animate-spin"></div>
                </div>
              ) : currentGuardians.length > 0 ? (
                currentGuardians.map((guardian, idx) => {
                  const displayName = (guardian.firstname && guardian.surname)
                    ? `${guardian.firstname} ${guardian.surname}`.trim() 
                    : (guardian.firstname || guardian.surname || "Unknown Guardian");

                  return (
                    <div key={idx}>
                      {/* DESKTOP ROW */}
                      <div className="hidden md:grid md:grid-cols-4 items-center bg-white dark:bg-gray-800/60 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all group">
                         <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-[#0F2843] text-white flex items-center justify-center font-black text-xs uppercase flex-shrink-0">
                              {displayName.charAt(0)}
                            </div>
                            <span className="font-bold text-[#0F2843] dark:text-white text-sm truncate" title={displayName}>
                              {displayName}
                            </span>
                         </div>
                         
                         <div className="text-center font-medium text-gray-500 dark:text-gray-400 text-xs truncate px-2" title={guardian.email}>
                            {guardian.email || "N/A"}
                         </div>
                         
                         <div className="text-center font-bold text-gray-800 dark:text-gray-200 text-xs">
                            {guardian.tel || "N/A"}
                         </div>
                         
                         <div className="text-right pr-2">
                            <span className="inline-flex items-center px-3 py-1 bg-[#BB9E7F]/10 text-[#BB9E7F] rounded-lg text-xs font-bold">
                               {guardian.students?.length || 0} Ward(s)
                            </span>
                         </div>
                      </div>

                      {/* MOBILE CARD VIEW */}
                      <div className="block md:hidden bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-[#0F2843] text-white flex items-center justify-center font-black text-xs uppercase flex-shrink-0">
                              {displayName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#0F2843] dark:text-white text-sm truncate">{displayName}</p>
                              <span className="inline-flex items-center px-2 py-0.5 bg-[#BB9E7F]/10 text-[#BB9E7F] rounded-md text-[10px] font-bold mt-0.5">
                                {guardian.students?.length || 0} Ward(s)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs">
                          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                            <span className="text-[11px] font-semibold">Email:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{guardian.email || "—"}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                            <span className="text-[11px] font-semibold">Phone:</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{guardian.tel || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-12">
                   <UserGroupIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                   <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Guardians Found</h3>
                   <p className="text-gray-400 font-medium max-w-sm text-center">
                     We couldn't find any guardians matching your search criteria.
                   </p>
                </div>
              )}
           </div>

           {/* Simple pagination indicator */}
           {!loading && filteredGuardians.length > 0 && (
             <div className="flex items-center justify-between px-2 pt-4 border-t border-gray-100 dark:border-gray-800">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                 Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredGuardians.length)} of {filteredGuardians.length}
               </p>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                 Page {currentPage} of {totalPages}
               </p>
             </div>
           )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
