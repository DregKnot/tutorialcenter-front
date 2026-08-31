import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import GuardianDashboardLayout from '../../components/private/Guardians/GuardianDashboardLayout';
import GuardianTopWardSelector from '../../components/private/Guardians/GuardianTopWardSelector';

export default function GuardianAuditLogs() {
  const navigate = useNavigate();

  const [guardian, setGuardian] = useState(null);
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Initial Load: Guardian Profile & Wards
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

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [profileRes, wardsRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/guardians/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (profileRes.status === "fulfilled") {
          const data = profileRes.value.data?.data || profileRes.value.data?.guardian || profileRes.value.data || {};
          if (data.firstname) setGuardian(data);
        }

        if (wardsRes.status === "fulfilled") {
          const wardsList = wardsRes.value.data?.data || [];
          setWards(wardsList);
        }
      } catch (err) {
        console.warn("Audit logs initial fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate, API_BASE_URL]);

  // Fetch Audit Logs with Ward & Category Filter
  const fetchAuditLogs = useCallback(async () => {
    const token = localStorage.getItem("guardian_token");
    if (!token) return;

    setFetchingLogs(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/guardians/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          student_id: selectedWardId,
          category: activeCategory,
          search: searchQuery,
          limit: 50
        }
      });
      if (res.data?.success) {
        setAuditLogs(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch guardian audit logs:", err);
    } finally {
      setFetchingLogs(false);
    }
  }, [API_BASE_URL, selectedWardId, activeCategory, searchQuery]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Filter categories
  const categories = [
    { id: 'all', name: 'All Activity', icon: 'lucide:activity' },
    { id: 'cbt', name: 'CBT Practice & Exams', icon: 'lucide:file-text' },
    { id: 'masterclass', name: 'Masterclass Attendance', icon: 'lucide:video' },
    { id: 'login', name: 'Login & Session Logs', icon: 'lucide:log-in' },
    { id: 'payment', name: 'Payments & Subscriptions', icon: 'lucide:credit-card' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071927] flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#C5A97A]/20 border-t-[#C5A97A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GuardianDashboardLayout guardianData={guardian}>
      {/* ── TOP HEADER BAR: Title, Search, Refresh & Ward Selector ────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-[#C5A97A] text-[11px] font-black uppercase tracking-wider mb-1.5">
              <Icon icon="lucide:shield-alert" className="w-3.5 h-3.5" />
              <span>Real-Time Accountability Feed</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#09314F] dark:text-white tracking-tight">
              Guardian Audit Logs
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Unfiltered chronological record of CBT tests, lesson attendance, and billing events for your wards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAuditLogs}
              disabled={fetchingLogs}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/80 transition-all active:scale-95"
            >
              <Icon icon="lucide:refresh-cw" className={`w-4 h-4 text-[#C5A97A] ${fetchingLogs ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/guardian/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F] font-black text-xs rounded-xl shadow-sm transition-all"
            >
              <Icon icon="lucide:arrow-left" className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* UNIFIED TOP WARD SELECTOR */}
        <GuardianTopWardSelector
          wards={wards}
          selectedWardId={selectedWardId}
          onSelectWard={setSelectedWardId}
          showAllOption={true}
        />
      </div>

      {/* ── FILTER CHIPS & SEARCH INPUT ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-3xl p-3.5 sm:p-4 border border-gray-100 dark:border-gray-700/80 shadow-sm">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#09314F] text-white shadow-md dark:bg-[#C5A97A] dark:text-[#09314F] font-black"
                    : "bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon icon={cat.icon} className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Icon icon="lucide:search" className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topic, subject or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
          />
        </div>
      </div>

      {/* ── AUDIT LOGS FEED ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-[32px] p-5 sm:p-6 lg:p-7 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-wider">
              Chronological Audit Trail ({auditLogs.length} Events)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-400">
            {selectedWardId === 'all' ? "Monitoring all wards" : `Filtered by selected ward`}
          </span>
        </div>

        {fetchingLogs ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-[#C5A97A]/20 border-t-[#C5A97A] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-400">Loading audit records...</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto text-gray-400">
              <Icon icon="lucide:inbox" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-700 dark:text-gray-200">No Audit Events Found</h4>
              <p className="text-xs text-gray-400 mt-1">There are no logged activities matching the selected filter.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => {
              const isCbt = log.category === 'cbt';
              const isMasterclass = log.category === 'masterclass';
              const isLogin = log.category === 'login' || log.category === 'activity';
              const isPayment = log.category === 'payment';

              const logTitle = log.title || log.event_title || "Student Activity";
              const logDesc = log.description || log.event_description || "Activity recorded for ward.";

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/70 border border-gray-100 dark:border-gray-700/80 hover:border-[#C5A97A]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Event Icon Capsule */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isCbt ? "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" :
                      isMasterclass ? "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400" :
                      isLogin ? "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400" :
                      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                    }`}>
                      <Icon
                        icon={
                          isCbt ? "lucide:file-check" :
                          isMasterclass ? "lucide:video" :
                          isLogin ? "lucide:log-in" :
                          "lucide:credit-card"
                        }
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm">
                          {log.student_name}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white leading-tight">
                          {logTitle}
                        </h4>
                      </div>

                      <p className="text-xs text-gray-700 dark:text-gray-200 font-semibold leading-relaxed">
                        {logDesc}
                      </p>

                      {/* Extra Meta Details */}
                      {log.meta && (
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 font-semibold pt-0.5 flex-wrap">
                          {log.meta.score_percentage !== undefined && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">
                              Score: {log.meta.score_percentage}% • {log.meta.correct_answers} / {log.meta.total_questions} Correct
                            </span>
                          )}
                          {log.meta.tutor && (
                            <span>Tutor: {log.meta.tutor}</span>
                          )}
                          {log.meta.duration && (
                            <span>Duration: {log.meta.duration}</span>
                          )}
                          {log.meta.amount && (
                            <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                              Amount: ₦{Number(log.meta.amount).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-800">
                    <span className="text-[11px] font-black font-mono text-[#09314F] dark:text-[#C5A97A]">
                      {log.time_formatted || "Just now"}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                      {log.date_formatted || log.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </GuardianDashboardLayout>
  );
}
