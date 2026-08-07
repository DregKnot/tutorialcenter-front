import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function GuardianDashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [guardian, setGuardian] = useState(null);
  const [dashboardWards, setDashboardWards] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // States for new endpoints
  const [performanceOverview, setPerformanceOverview] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [fetchingStats, setFetchingStats] = useState(false);

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [performanceTab, setPerformanceTab] = useState('today');

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  useEffect(() => {
    const token = localStorage.getItem("guardian_token");
    const info = localStorage.getItem("guardian_info");

    if (!token) {
      navigate("/guardian/login");
      return;
    }
    if (info) {
      try { setGuardian(JSON.parse(info)); } catch (e) {}
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/api/guardians/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = profileRes.data?.data || profileRes.data?.guardian || profileRes.data || {};
        if (data.firstname) setGuardian(data);

        const wardsRes = await axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const wardsList = wardsRes.data.data || [];
        setDashboardWards(wardsList);
        
        if (wardsList.length > 0) {
          setSelectedStudentId(wardsList[0].id);
        }
      } catch (error) {
        console.warn("Dashboard fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, API_BASE_URL]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const token = localStorage.getItem("guardian_token");
    if (!token) return;

    const fetchWardStats = async () => {
      setFetchingStats(true);
      try {
        const [perfRes, subRes, repRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/performance-overview`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/subscription`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/weekly-report`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setPerformanceOverview(perfRes.data);
        setSubscription(subRes.data);
        setWeeklyReport(repRes.data);
      } catch (error) {
        console.error("Failed to fetch ward stats:", error);
      } finally {
        setFetchingStats(false);
      }
    };

    fetchWardStats();
  }, [selectedStudentId, API_BASE_URL]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = localStorage.getItem("guardian_token");
      if (token) {
        await axios.post(`${API_BASE_URL}/api/guardians/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (error) {} finally {
      localStorage.removeItem("guardian_token");
      localStorage.removeItem("guardian_info");
      setLoggingOut(false);
      navigate("/guardian/login");
    }
  };

  const selectedWard = dashboardWards.find(w => w.id === selectedStudentId);

  // Get color based on days left
  const getDurationColor = (days) => {
    if (days <= 5) return 'bg-gradient-to-br from-[#e83831] to-red-600 text-white';
    if (days <= 10) return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white';
    return 'bg-gradient-to-br from-[#09314F] to-[#1a4a6b] text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071927] flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#bb9e7f]/20 border-t-[#bb9e7f] rounded-full animate-spin" />
      </div>
    );
  }

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#09314F] shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-6 border-b border-gray-100 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bb9e7f] to-[#e83831] flex items-center justify-center text-white shadow-md">
            <Icon icon="lucide:shield-check" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#09314F] dark:text-white uppercase">
              TUTORIAL CENTER
            </h1>
            <p className="text-[10px] font-bold text-[#bb9e7f] tracking-widest uppercase">Guardian Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { name: 'Dashboard', icon: 'lucide:layout-dashboard', active: true },
            { name: 'Performance', icon: 'lucide:trending-up', active: false },
            { name: 'Reports', icon: 'lucide:file-text', active: false },
            { name: 'Payment', icon: 'lucide:credit-card', active: false },
            { name: 'Help', icon: 'lucide:help-circle', active: false },
            { name: 'Settings', icon: 'lucide:settings', active: false },
          ].map((item) => (
            <button key={item.name} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-[#09314F] text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#09314F] dark:hover:text-white font-medium'}`}>
              <Icon icon={item.icon} className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-white/10 space-y-5 mt-auto">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Light</span>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${theme === "dark" ? "bg-blue-900" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full shadow transition-all duration-300 flex items-center justify-center ${theme === "dark" ? "right-1 bg-gray-800" : "left-1 bg-white"}`}>
                {theme === "light" ? <SunIcon className="w-3 h-3 text-yellow-500" /> : <MoonIcon className="w-3 h-3 text-blue-300" />}
              </span>
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Dark</span>
          </div>
          <button onClick={handleLogout} disabled={loggingOut} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-[#e83831] font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#071927] font-sans overflow-hidden text-gray-800 dark:text-gray-100">
      <Sidebar />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col lg:pl-64 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#09314F]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-[#09314F] dark:text-gray-300 dark:hover:text-white rounded-lg transition-colors">
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
             <Link
                to="/register/guardian/addstudent"
                className="flex items-center gap-2 px-4 py-2 bg-[#bb9e7f] hover:bg-[#a68a6d] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Icon icon="lucide:user-plus" className="w-4 h-4" />
                <span className="hidden sm:inline">Add Wards</span>
              </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#bb9e7f]/20 text-[#bb9e7f] border border-[#bb9e7f]/40 flex items-center justify-center font-black text-sm">
                {guardian?.firstname?.[0]?.toUpperCase() || "G"}
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {dashboardWards.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
               <div className="w-24 h-24 bg-[#bb9e7f]/10 rounded-full flex items-center justify-center mb-6">
                 <Icon icon="lucide:users" className="w-12 h-12 text-[#bb9e7f]" />
               </div>
               <h2 className="text-2xl font-black text-[#09314F] dark:text-white mb-3">No Wards Registered</h2>
               <p className="text-gray-500 dark:text-gray-400 mb-8">It looks like you haven't linked any students to your account yet. Register your wards to track their academic progress.</p>
               <Link to="/register/guardian/addstudent" className="flex items-center gap-2 px-6 py-3 bg-[#bb9e7f] text-white font-bold rounded-xl shadow-lg hover:bg-[#a68a6d] transition-all">
                 <Icon icon="lucide:plus" className="w-5 h-5" />
                 ADD WARDS NOW
               </Link>
             </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              
              {/* WELCOME SECTION */}
              <div className="mb-8">
                <h2 className="text-sm font-bold text-[#bb9e7f] tracking-widest uppercase mb-2">Welcome Back</h2>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-[#09314F] dark:text-white">Guardian {guardian?.surname || 'Account'}</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                  Track your registered students' academic progress, course enrollments, subject breakdowns, and practice examination performance in real-time. Select a ward from the card below to inspect their detailed performance metrics.
                </p>
              </div>

              {fetchingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                  {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-[#09314F]/50 rounded-[2rem]" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                  
                  {/* WARD DETAILS & SWITCHER CARD */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-1 relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#09314F] to-[#1a4a6b] dark:from-[#051c2d] dark:to-[#0a2f4c] shadow-2xl p-6 flex flex-col hover:shadow-md transition-shadow lg:min-h-[350px]">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#bb9e7f]/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10 flex-1 text-white">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#bb9e7f] to-[#e83831] flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0">
                          {selectedWard?.name.substring(0,2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-xl font-bold truncate">{selectedWard?.name}</h3>
                          <p className="text-xs text-gray-300 truncate">{selectedWard?.department || 'General Science'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-5">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Enrolled Courses</p>
                        <p className="text-sm font-medium">{selectedWard?.active_courses?.map(c => c.title).join(', ') || 'None'}</p>
                      </div>
                      
                      {selectedWard?.subjects && selectedWard.subjects.length > 0 && (
                        <div className="space-y-1 mb-6">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Subjects ({selectedWard.subjects.length})</p>
                          <p className="text-sm font-medium">{selectedWard.subjects.slice(0,3).map(s => s.name).join(', ')}{selectedWard.subjects.length > 3 ? '...' : ''}</p>
                        </div>
                      )}
                    </div>

                    <div className="relative mt-auto pt-4 border-t border-white/10 z-20">
                      <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center justify-between w-full gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3 text-white overflow-hidden">
                          <div className="w-9 h-9 rounded-full bg-[#bb9e7f] flex items-center justify-center font-bold text-xs shrink-0">
                             {selectedWard?.name?.substring(0,2).toUpperCase()}
                          </div>
                          <div className="text-left overflow-hidden">
                            <p className="text-[9px] text-gray-300 uppercase tracking-widest font-bold">Viewing</p>
                            <p className="font-bold text-sm truncate">{selectedWard?.name}</p>
                          </div>
                        </div>
                        <Icon icon="lucide:chevron-down" className={`w-4 h-4 shrink-0 text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute bottom-full mb-2 left-0 w-full bg-white dark:bg-[#0f2843] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto">
                          {dashboardWards.map(ward => (
                            <button
                              key={ward.id}
                              onClick={() => { setSelectedStudentId(ward.id); setDropdownOpen(false); }}
                              className={`flex items-center gap-3 w-full p-3 text-left transition-colors ${selectedStudentId === ward.id ? 'bg-[#bb9e7f]/10 dark:bg-[#bb9e7f]/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#bb9e7f] to-[#e83831] flex items-center justify-center text-white font-bold text-xs shrink-0">
                                 {ward.name.substring(0,2).toUpperCase()}
                              </div>
                              <div className="flex-1 truncate">
                                <p className={`font-bold text-sm truncate ${selectedStudentId === ward.id ? 'text-[#09314F] dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{ward.name}</p>
                              </div>
                              {selectedStudentId === ward.id && <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-[#bb9e7f]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PERFORMANCE OVERVIEW CARD */}
                  <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-white dark:bg-[#09314F] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col hover:shadow-md transition-shadow lg:min-h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Icon icon="lucide:activity" className="w-6 h-6" />
                      </div>
                      <div className="flex bg-gray-100 dark:bg-[#0f2843] p-1 rounded-xl">
                        <button onClick={() => setPerformanceTab('today')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${performanceTab === 'today' ? 'bg-white dark:bg-[#051c2d] text-[#09314F] dark:text-white shadow-sm' : 'text-gray-500'}`}>Today</button>
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-gray-800 dark:text-white mb-6">Performance</h3>
                    
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div className="p-4 bg-gray-50 dark:bg-[#0f2843] rounded-2xl">
                         <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Subjects</p>
                         <p className="text-2xl font-black text-[#09314F] dark:text-white">{performanceOverview?.subjects_practiced_today || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-[#0f2843] rounded-2xl">
                         <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Attempts</p>
                         <p className="text-2xl font-black text-[#09314F] dark:text-white">{performanceOverview?.total_attempts_today || 0}</p>
                      </div>
                      <div className="col-span-2 p-4 bg-gray-50 dark:bg-[#0f2843] rounded-2xl flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Average Score</p>
                          <p className="text-3xl font-black text-[#09314F] dark:text-white">{performanceOverview?.average_score_today || 0}%</p>
                        </div>
                        {performanceOverview?.most_practiced_subject && (
                          <div className="text-right">
                             <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Top</p>
                             <p className="text-xs font-bold text-[#bb9e7f]">{performanceOverview.most_practiced_subject.substring(0, 10)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DURATION / SUBSCRIPTION CARD */}
                  <div className={`col-span-1 md:col-span-1 lg:col-span-1 p-6 rounded-[2rem] shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden lg:min-h-[350px] ${subscription?.has_active_subscription ? getDurationColor(subscription.days_left) : 'bg-gray-100 dark:bg-[#0f2843]'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-6 relative z-10">
                      <Icon icon="lucide:clock" className="w-6 h-6 text-current" />
                    </div>
                    <h3 className={`text-lg font-black mb-6 relative z-10 ${subscription?.has_active_subscription ? 'text-white' : 'text-gray-800 dark:text-white'}`}>Subscription</h3>
                    
                    {subscription?.has_active_subscription ? (
                      <div className="flex-1 flex flex-col justify-between relative z-10">
                        <div>
                          <div className="flex items-end gap-2 mb-2">
                             <p className="text-5xl font-black text-white leading-none">{subscription.days_left}</p>
                             <p className="text-white/80 font-bold uppercase tracking-widest text-sm mb-1">Days</p>
                          </div>
                          <p className="text-sm text-white/80 font-medium mb-6">Remaining until expiration</p>
                          
                          <div className="bg-black/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm border border-white/10 mt-auto">
                             <span className="text-xs font-bold uppercase tracking-wider text-white/90">Renewal Cost</span>
                             <span className="text-lg font-black text-white">₦{Number(subscription.cost).toLocaleString()}</span>
                          </div>
                        </div>
                        <button className="w-full py-3.5 mt-4 bg-white text-gray-900 font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-colors shadow-lg active:scale-95 text-xs">
                          Renew
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                        <Icon icon="lucide:alert-circle" className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">No active subscription found for this ward.</p>
                        <button className="w-full py-4 bg-[#bb9e7f] text-white font-black uppercase tracking-wider rounded-xl hover:bg-[#a68a6d] transition-colors shadow-lg active:scale-95 text-xs">
                          Subscribe Now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* WEEKLY REPORTS CARD */}
                  <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-white dark:bg-[#09314F] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col hover:shadow-md transition-shadow lg:min-h-[350px]">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                      <Icon icon="lucide:calendar-range" className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-800 dark:text-white mb-6">Weekly Report</h3>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-4 line-clamp-3">
                        {weeklyReport?.summary || "Loading report..."}
                      </p>
                      
                      {weeklyReport && (
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                           <div className="p-3 border border-gray-100 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-[#0f2843]/50">
                             <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Practices</p>
                             <p className="text-lg font-black text-[#09314F] dark:text-white">{weeklyReport.total_attempts}</p>
                           </div>
                           <div className="p-3 border border-gray-100 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-[#0f2843]/50">
                             <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Average</p>
                             <p className="text-lg font-black text-[#09314F] dark:text-white">{weeklyReport.average_score}%</p>
                           </div>
                        </div>
                      )}
                    </div>
                    
                    <button className="w-full mt-4 py-3.5 border-2 border-[#bb9e7f] text-[#bb9e7f] font-black uppercase tracking-wider rounded-xl hover:bg-[#bb9e7f]/10 transition-colors text-xs active:scale-95">
                      Full Report
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
