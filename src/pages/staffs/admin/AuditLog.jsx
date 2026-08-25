import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { useStaffAuth } from "../../../context/StaffAuthContext.jsx";

export default function AuditLog() {
  const { token: contextToken } = useStaffAuth() || {};

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    teachers: 0,
    advisors: 0,
    guardians: 0,
    admins: 0,
    unread: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination State
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  // Inspection Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Fetch Audit Logs from Backend
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const staffToken =
        contextToken ||
        localStorage.getItem("staff_token") ||
        localStorage.getItem("token");

      const headers = {
        Accept: "application/json",
        ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
      };

      const params = {
        page,
        per_page: perPage,
        audience: selectedAudience,
        status: selectedStatus,
        search: searchQuery.trim() || undefined,
      };

      let res;
      try {
        res = await axios.get(`${API_BASE_URL}/api/admin/audit-logs`, {
          headers,
          params,
        });
      } catch (adminErr) {
        // Fallback to /api/staffs/audit-logs
        res = await axios.get(`${API_BASE_URL}/api/staffs/audit-logs`, {
          headers,
          params,
        });
      }

      if (res.data?.success) {
        const paginatedData = res.data.logs;
        setLogs(paginatedData.data || []);
        setPagination({
          current_page: paginatedData.current_page || 1,
          last_page: paginatedData.last_page || 1,
          total: paginatedData.total || 0,
          from: paginatedData.from || 0,
          to: paginatedData.to || 0,
        });
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setError("Failed to load audit logs. Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, selectedAudience, selectedStatus, searchQuery, API_BASE_URL, contextToken]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Reset to page 1 on filter change
  const handleAudienceChange = (aud) => {
    setSelectedAudience(aud);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAuditLogs();
  };

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog.data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Helper for group badges
  const getGroupBadge = (group, role) => {
    switch (group) {
      case "student":
        return {
          bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40",
          icon: "lucide:graduation-cap",
          label: "Student",
        };
      case "teacher":
        return {
          bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
          icon: "lucide:book-open",
          label: "Teacher / Tutor",
        };
      case "advisor":
        return {
          bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
          icon: "lucide:shield-check",
          label: "Course Advisor",
        };
      case "guardian":
        return {
          bg: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/40",
          icon: "lucide:users",
          label: "Guardian",
        };
      case "admin":
      case "coo":
        return {
          bg: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40",
          icon: "lucide:shield-alert",
          label: role || "Admin",
        };
      default:
        return {
          bg: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
          icon: "lucide:bell",
          label: role || "User",
        };
    }
  };

  // Helper for notification category icons
  const getEventIcon = (typeName, title) => {
    const text = `${typeName} ${title}`.toLowerCase();
    if (text.includes("login") || text.includes("logout") || text.includes("auth") || text.includes("password")) {
      return { icon: "lucide:key-round", color: "text-amber-500 bg-amber-500/10" };
    }
    if (text.includes("exam") || text.includes("test") || text.includes("score") || text.includes("result")) {
      return { icon: "lucide:award", color: "text-blue-500 bg-blue-500/10" };
    }
    if (text.includes("verify") || text.includes("otp") || text.includes("email")) {
      return { icon: "lucide:mail-check", color: "text-emerald-500 bg-emerald-500/10" };
    }
    if (text.includes("class") || text.includes("subject") || text.includes("course")) {
      return { icon: "lucide:book-marked", color: "text-purple-500 bg-purple-500/10" };
    }
    if (text.includes("payment") || text.includes("transaction")) {
      return { icon: "lucide:credit-card", color: "text-emerald-500 bg-emerald-500/10" };
    }
    return { icon: "lucide:bell-ring", color: "text-[#C5A97A] bg-[#C5A97A]/10" };
  };

  return (
    <StaffDashboardLayout pagetitle="System Audit & Notification Logs" hideHeader={false}>
      <div className="max-w-[1500px] mx-auto space-y-8 pb-16 font-sans">

        {/* ── Page Header & Quick Description ─────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#09314F] via-[#0b3d63] to-[#09314F] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C5A97A] text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Icon icon="lucide:activity" className="w-3.5 h-3.5" />
              <span>Real-Time Audit Trail</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Notification & Event Audit Log</h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl">
              Inspect all automated alerts, emails, push events, and status updates dispatched across students, teachers, course advisors, guardians, and administrators.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => fetchAuditLogs()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-bold backdrop-blur-md border border-white/10"
            >
              <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Trail</span>
            </button>
          </div>

          {/* Decorative Background Accents */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#C5A97A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-[#E83831]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ── Metrics & Audience Counts ──────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800/60 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-black uppercase tracking-wider">Total Logs</span>
              <Icon icon="lucide:layers" className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-black text-[#09314F] dark:text-white mt-2">
              {stats.total.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/60 p-4 sm:p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-500">
              <span className="text-[11px] font-black uppercase tracking-wider">Students</span>
              <Icon icon="lucide:graduation-cap" className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
              {stats.students.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/60 p-4 sm:p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-[11px] font-black uppercase tracking-wider">Teachers</span>
              <Icon icon="lucide:book-open" className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {stats.teachers.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/60 p-4 sm:p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-[11px] font-black uppercase tracking-wider">Advisors</span>
              <Icon icon="lucide:shield-check" className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
              {stats.advisors.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/60 p-4 sm:p-5 rounded-2xl border border-sky-100 dark:border-sky-900/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-sky-500">
              <span className="text-[11px] font-black uppercase tracking-wider">Guardians</span>
              <Icon icon="lucide:users" className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-2">
              {stats.guardians.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/60 p-4 sm:p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-500">
              <span className="text-[11px] font-black uppercase tracking-wider">Admins / COO</span>
              <Icon icon="lucide:shield-alert" className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
              {stats.admins.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── Audience Selector & Filters ────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800/60 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          
          {/* Audience Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Icon icon="lucide:filter" className="w-3.5 h-3.5 text-[#C5A97A]" /> Audience:
            </span>

            {[
              { id: "all", label: "All Audits", count: stats.total, icon: "lucide:globe" },
              { id: "student", label: "Students", count: stats.students, icon: "lucide:graduation-cap" },
              { id: "teacher", label: "Teachers / Tutors", count: stats.teachers, icon: "lucide:book-open" },
              { id: "advisor", label: "Course Advisors", count: stats.advisors, icon: "lucide:shield-check" },
              { id: "guardian", label: "Guardians", count: stats.guardians, icon: "lucide:users" },
              { id: "admin", label: "Admins", count: stats.admins, icon: "lucide:shield-alert" },
            ].map((aud) => (
              <button
                key={aud.id}
                onClick={() => handleAudienceChange(aud.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedAudience === aud.id
                    ? "bg-[#09314F] text-white shadow-md shadow-[#09314F]/20 dark:bg-[#C5A97A] dark:text-[#09314F]"
                    : "bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon icon={aud.icon} className="w-3.5 h-3.5" />
                <span>{aud.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  selectedAudience === aud.id
                    ? "bg-white/20 text-white dark:bg-[#09314F]/20 dark:text-[#09314F]"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}>
                  {aud.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Status Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-md">
              <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient name, email, event text, or ID..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl text-xs font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09314F] dark:focus:ring-[#C5A97A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#09314F]"
              >
                <option value="all">All Read Status</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>

              {/* Per Page */}
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#09314F]"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Error Banner ────────────────────────────────────────────── */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:alert-circle" className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={() => fetchAuditLogs()} className="underline hover:no-underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Audit Logs Table / Cards ────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-[#E83831] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 text-xs font-bold">Scanning and indexing notification logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <Icon icon="lucide:inbox" className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Audit Logs Found</h3>
              <p className="text-gray-400 text-xs max-w-sm mx-auto">
                No notifications match the active filter criteria. Try changing the audience tab or clearing search queries.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-[11px] font-black uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-5">Recipient & Role</th>
                    <th className="py-4 px-5">Event / Notification</th>
                    <th className="py-4 px-5">Summary / Message</th>
                    <th className="py-4 px-5">Dispatched At</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {logs.map((log) => {
                    const groupBadge = getGroupBadge(log.recipient_group, log.recipient_role);
                    const eventIcon = getEventIcon(log.type_name, log.title);

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
                      >
                        {/* Recipient Column */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#09314F] to-[#0b3d63] text-white font-black text-xs flex items-center justify-center shadow-sm">
                              {log.recipient_name?.[0] || "U"}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[#09314F] dark:group-hover:text-[#C5A97A] transition-colors">
                                {log.recipient_name}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold ${groupBadge.bg}`}>
                                  <Icon icon={groupBadge.icon} className="w-2.5 h-2.5" />
                                  <span>{groupBadge.label}</span>
                                </span>
                                {log.recipient_email && (
                                  <span className="text-[11px] text-gray-400 truncate max-w-[140px]">
                                    {log.recipient_email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Event Category Column */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${eventIcon.color}`}>
                              <Icon icon={eventIcon.icon} className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-black text-gray-800 dark:text-gray-200 capitalize">
                                {log.type_name.replace(/([A-Z])/g, " $1").replace("Notification", "").trim() || "Notification"}
                              </p>
                              <span className="text-[10px] text-gray-400">
                                {log.notifiable_type} #{log.notifiable_id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Message Preview */}
                        <td className="py-4 px-5 max-w-xs">
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                              {log.title && log.title !== "1" ? log.title : log.message}
                            </p>
                            <p className="text-gray-400 text-[11px] line-clamp-1">
                              {log.message}
                            </p>
                          </div>
                        </td>

                        {/* Dispatched At */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-700 dark:text-gray-300">
                              {log.created_at_human || "Recently"}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {log.created_at ? new Date(log.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : ""}
                            </p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          {log.is_read ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                              <Icon icon="lucide:check-check" className="w-3 h-3" />
                              <span>Read</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px]">
                              <Icon icon="lucide:clock" className="w-3 h-3" />
                              <span>Unread</span>
                            </span>
                          )}
                        </td>

                        {/* Inspect Action */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#09314F] hover:text-white dark:hover:bg-[#C5A97A] dark:hover:text-[#09314F] transition-all"
                            title="Inspect Log Details"
                          >
                            <Icon icon="lucide:eye" className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination Footer ─────────────────────────────────────── */}
          {!loading && logs.length > 0 && (
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-gray-400 font-medium">
                Showing <span className="font-bold text-gray-900 dark:text-white">{pagination.from}</span> to{" "}
                <span className="font-bold text-gray-900 dark:text-white">{pagination.to}</span> of{" "}
                <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> audit records
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.current_page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                    let pageNum = i + 1;
                    if (pagination.last_page > 5 && pagination.current_page > 3) {
                      pageNum = pagination.current_page - 2 + i;
                      if (pageNum > pagination.last_page) pageNum = pagination.last_page - (4 - i);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          pagination.current_page === pageNum
                            ? "bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F]"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={pagination.current_page >= pagination.last_page}
                  onClick={() => setPage((prev) => Math.min(pagination.last_page, prev + 1))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Inspection Detail Modal / Slide-Over ───────────────────── */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#09314F]/10 dark:bg-[#C5A97A]/10 text-[#09314F] dark:text-[#C5A97A] flex items-center justify-center font-bold">
                    <Icon icon="lucide:activity" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Audit Trail Inspector</h3>
                    <p className="text-xs text-gray-400 font-mono">ID: {selectedLog.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center justify-center transition-colors"
                >
                  <Icon icon="lucide:x" className="w-4 h-4" />
                </button>
              </div>

              {/* Recipient Profile Card */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#09314F] to-[#0b3d63] text-white font-bold flex items-center justify-center text-sm">
                    {selectedLog.recipient_name?.[0] || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selectedLog.recipient_name}</h4>
                    <p className="text-xs text-gray-400">{selectedLog.recipient_email || "No email attached"}</p>
                  </div>
                </div>

                {(() => {
                  const b = getGroupBadge(selectedLog.recipient_group, selectedLog.recipient_role);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-black ${b.bg}`}>
                      <Icon icon={b.icon} className="w-3.5 h-3.5" />
                      <span>{b.label}</span>
                    </span>
                  );
                })()}
              </div>

              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Event Type</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 break-words">{selectedLog.type_name}</span>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Target Entity</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedLog.notifiable_type} #{selectedLog.notifiable_id}</span>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Read Timestamp</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {selectedLog.read_at ? new Date(selectedLog.read_at).toLocaleString() : "Unread"}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Dispatched Notification Message</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                  {selectedLog.title && selectedLog.title !== "1" && (
                    <p className="font-black text-sm text-[#09314F] dark:text-[#C5A97A]">{selectedLog.title}</p>
                  )}
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedLog.message}
                  </p>
                </div>
              </div>

              {/* Raw JSON Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Raw Data Payload (JSON)</h4>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#09314F] dark:text-[#C5A97A] hover:underline"
                  >
                    <Icon icon={copiedJson ? "lucide:check" : "lucide:copy"} className="w-3.5 h-3.5" />
                    <span>{copiedJson ? "Copied!" : "Copy Payload"}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#031525] text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-48 border border-gray-800">
                  {JSON.stringify(selectedLog.data, null, 2)}
                </pre>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2.5 bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F] rounded-2xl font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </StaffDashboardLayout>
  );
}
