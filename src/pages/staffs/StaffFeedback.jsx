import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";
import { useStaffAuth } from "../../context/StaffAuthContext.jsx";

export default function StaffFeedback() {
  const { token: contextToken } = useStaffAuth() || {};

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    average_rating: 5.0,
    recommendation_rate: 100,
    stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    categories: { all: 0, course: 0, subject: 0, class: 0, staff: 0, exam: 0 },
    authors: { all: 0, student: 0, guardian: 0, staff: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters & Pagination State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
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

  // Modal Inspection State
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Fetch Feedback from Backend
  const fetchFeedbacks = useCallback(async () => {
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
        category: selectedCategory,
        author_group: selectedAuthor,
        rating: selectedRating,
        status: selectedStatus,
        search: searchQuery.trim() || undefined,
      };

      console.log("📢 [ADMIN FEEDBACK] Fetching system feedbacks with filters:", {
        url: `${API_BASE_URL}/api/admin/feedbacks/all`,
        params,
        tokenAttached: !!staffToken,
      });

      let res;
      try {
        res = await axios.get(`${API_BASE_URL}/api/admin/feedbacks/all`, {
          headers,
          params,
        });
      } catch (adminErr) {
        console.warn("⚠️ [ADMIN FEEDBACK] Primary route failed, trying fallback /api/staffs/feedbacks/all...", adminErr);
        res = await axios.get(`${API_BASE_URL}/api/staffs/feedbacks/all`, {
          headers,
          params,
        });
      }

      console.log("✅ [ADMIN FEEDBACK] Raw API Response:", res.data);

      if (res.data?.success) {
        const paginatedData = res.data.feedbacks;
        console.log("📊 [ADMIN FEEDBACK] Loaded Reviews List:", paginatedData.data);
        console.log("📈 [ADMIN FEEDBACK] System Ratings & Stats:", res.data.stats);

        setFeedbacks(paginatedData.data || []);
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
        console.warn("⚠️ [ADMIN FEEDBACK] No feedbacks data array found in response");
        setFeedbacks([]);
      }
    } catch (err) {
      console.error("❌ [ADMIN FEEDBACK] Failed to load feedbacks:", err);
      setError("Failed to load system feedbacks. Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, selectedCategory, selectedAuthor, selectedRating, selectedStatus, searchQuery, API_BASE_URL, contextToken]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Toggle Published / Hidden Status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setActionLoading(id);
      const staffToken =
        contextToken ||
        localStorage.getItem("staff_token") ||
        localStorage.getItem("token");

      const headers = {
        Accept: "application/json",
        ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
      };

      const targetStatus = currentStatus === "published" ? "hidden" : "published";

      await axios.patch(
        `${API_BASE_URL}/api/admin/feedbacks/${id}/status`,
        { status: targetStatus },
        { headers }
      );

      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: targetStatus } : f))
      );

      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback((prev) => ({ ...prev, status: targetStatus }));
      }
    } catch (err) {
      console.error("Failed to toggle feedback status", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Feedback
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this feedback? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(id);
      const staffToken =
        contextToken ||
        localStorage.getItem("staff_token") ||
        localStorage.getItem("token");

      const headers = {
        Accept: "application/json",
        ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
      };

      await axios.delete(`${API_BASE_URL}/api/admin/feedbacks/${id}/admin`, {
        headers,
      });

      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback(null);
      }
    } catch (err) {
      console.error("Failed to delete feedback", err);
      alert("Failed to delete feedback. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Category Badges & Icons
  const getCategoryBadge = (categoryKey, categoryName) => {
    switch (categoryKey) {
      case "course":
        return {
          bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40",
          icon: "lucide:book-open",
          label: "Course",
        };
      case "subject":
        return {
          bg: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40",
          icon: "lucide:bookmark",
          label: "Subject",
        };
      case "class":
        return {
          bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
          icon: "lucide:presentation",
          label: "Master Class",
        };
      case "staff":
        return {
          bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
          icon: "lucide:user-check",
          label: "Tutor / Teacher",
        };
      case "exam":
        return {
          bg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40",
          icon: "lucide:award",
          label: "Exam & Practice",
        };
      default:
        return {
          bg: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
          icon: "lucide:layers",
          label: categoryName || "General",
        };
    }
  };

  // Author Group Badges
  const getAuthorBadge = (group, role) => {
    switch (group) {
      case "student":
        return {
          bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40",
          icon: "lucide:graduation-cap",
          label: "Student",
        };
      case "guardian":
        return {
          bg: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/40",
          icon: "lucide:users",
          label: "Guardian",
        };
      case "staff":
        return {
          bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
          icon: "lucide:shield-check",
          label: role || "Staff",
        };
      default:
        return {
          bg: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
          icon: "lucide:user",
          label: role || "User",
        };
    }
  };

  // Render Star Rating Visual
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            icon="lucide:star"
            className={`w-3.5 h-3.5 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <StaffDashboardLayout pagetitle="System Feedback & Reviews Management" hideHeader={false}>
      <div className="max-w-[1500px] mx-auto space-y-8 pb-16 font-sans">

        {/* ── Header Banner ───────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#09314F] via-[#0b3d63] to-[#09314F] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C5A97A] text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Icon icon="lucide:star" className="w-3.5 h-3.5 fill-[#C5A97A]" />
              <span>Admin Feedback & Sentiment Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">System Feedback & Reviews</h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl">
              Inspect, analyze, and moderate all student, guardian, and staff feedback submitted for courses, subjects, live masterclasses, tutors, and exams.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => fetchFeedbacks()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-bold backdrop-blur-md border border-white/10"
            >
              <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Reviews</span>
            </button>
          </div>

          {/* Decorative Background Accents */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#C5A97A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-[#E83831]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ── Analytics & Rating Overview Bar ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Main Average Rating Card */}
          <div className="bg-white dark:bg-gray-800/60 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">Average Platform Score</span>
            <div className="flex items-end gap-3 my-2">
              <span className="text-4xl sm:text-5xl font-black text-[#09314F] dark:text-[#C5A97A]">
                {stats.average_rating ? Number(stats.average_rating).toFixed(1) : "5.0"}
              </span>
              <div className="pb-1.5 space-y-1">
                {renderStars(Math.round(stats.average_rating || 5))}
                <span className="text-[11px] text-gray-400 font-bold block">out of 5.0 rating</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Based on <span className="font-bold text-gray-900 dark:text-white">{stats.total}</span> submitted reviews
            </div>
          </div>

          {/* Recommendation Rate */}
          <div className="bg-white dark:bg-gray-800/60 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Recommendation Rate</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Icon icon="lucide:thumbs-up" className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.recommendation_rate || 100}%
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              of reviewers recommend Tutorial Center courses and teachers.
            </p>
          </div>

          {/* Star Breakdown Bar */}
          <div className="bg-white dark:bg-gray-800/60 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm col-span-1 md:col-span-1 lg:col-span-2 flex flex-col justify-between space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">Rating Distribution</span>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.stars?.[star] || 0;
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-12 font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      {star} <Icon icon="lucide:star" className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C5A97A] to-[#09314F] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[11px] font-mono text-gray-400">
                      {percentage}% ({count})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── Category Tabs & Filter Toolbar ──────────────────────────── */}
        <div className="bg-white dark:bg-gray-800/60 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Icon icon="lucide:filter" className="w-3.5 h-3.5 text-[#C5A97A]" /> Category:
            </span>

            {[
              { id: "all", label: "All Reviews", count: stats.categories?.all || stats.total, icon: "lucide:layers" },
              { id: "course", label: "Courses", count: stats.categories?.course || 0, icon: "lucide:book-open" },
              { id: "subject", label: "Subjects", count: stats.categories?.subject || 0, icon: "lucide:bookmark" },
              { id: "class", label: "Master Classes", count: stats.categories?.class || 0, icon: "lucide:presentation" },
              { id: "staff", label: "Tutors / Teachers", count: stats.categories?.staff || 0, icon: "lucide:user-check" },
              { id: "exam", label: "Exams & Practice", count: stats.categories?.exam || 0, icon: "lucide:award" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#09314F] text-white shadow-md shadow-[#09314F]/20 dark:bg-[#C5A97A] dark:text-[#09314F]"
                    : "bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon icon={cat.icon} className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  selectedCategory === cat.id
                    ? "bg-white/20 text-white dark:bg-[#09314F]/20 dark:text-[#09314F]"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search review comments, student names, titles..."
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
            </div>

            <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-end">
              
              {/* Author Dropdown */}
              <select
                value={selectedAuthor}
                onChange={(e) => {
                  setSelectedAuthor(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#09314F]"
              >
                <option value="all">All Reviewers</option>
                <option value="student">Students ({stats.authors?.student || 0})</option>
                <option value="guardian">Guardians ({stats.authors?.guardian || 0})</option>
                <option value="staff">Staff ({stats.authors?.staff || 0})</option>
              </select>

              {/* Rating Dropdown */}
              <select
                value={selectedRating}
                onChange={(e) => {
                  setSelectedRating(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#09314F]"
              >
                <option value="all">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                <option value="3">⭐⭐⭐ (3 Stars)</option>
                <option value="2">⭐⭐ (2 Stars)</option>
                <option value="1">⭐ (1 Star)</option>
              </select>

              {/* Status Dropdown */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#09314F]"
              >
                <option value="all">All Status</option>
                <option value="published">Published Only</option>
                <option value="hidden">Hidden Only</option>
              </select>

              {/* Per Page */}
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#09314F]"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
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
            <button onClick={() => fetchFeedbacks()} className="underline hover:no-underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Reviews Grid / List ─────────────────────────────────────── */}
        {loading ? (
          <div className="py-24 text-center space-y-4 bg-white dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 border-4 border-[#E83831] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-xs font-bold">Scanning system reviews and feedback ratings...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Icon icon="lucide:message-square-off" className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Feedback Reviews Found</h3>
            <p className="text-gray-400 text-xs max-w-sm mx-auto">
              No reviews match the selected filter criteria. Try choosing another category tab or clearing search queries.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map((item) => {
              const catBadge = getCategoryBadge(item.category_key, item.category);
              const authorBadge = getAuthorBadge(item.author_group, item.author_role);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className="bg-white dark:bg-gray-800/60 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group relative"
                >
                  
                  {/* Top Bar: Reviewer & Target Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#09314F] to-[#0b3d63] text-white font-black text-xs flex items-center justify-center shadow-sm">
                        {item.author_name?.[0] || "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm group-hover:text-[#09314F] dark:group-hover:text-[#C5A97A] transition-colors">
                          {item.author_name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold ${authorBadge.bg}`}>
                            <Icon icon={authorBadge.icon} className="w-2.5 h-2.5" />
                            <span>{authorBadge.label}</span>
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {item.created_at_human || "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[10px] font-black ${catBadge.bg}`}>
                        <Icon icon={catBadge.icon} className="w-3 h-3" />
                        <span>{catBadge.label}</span>
                      </span>
                      {item.status === "hidden" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] font-bold">
                          <Icon icon="lucide:eye-off" className="w-2.5 h-2.5" /> Hidden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          <Icon icon="lucide:check" className="w-2.5 h-2.5" /> Published
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Entity Title */}
                  <div className="bg-gray-50/70 dark:bg-gray-900/40 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Reviewing:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.target_title}</span>
                    </div>
                    {item.would_recommend ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                        <Icon icon="lucide:thumbs-up" className="w-3 h-3" /> Recommends
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 text-[10px] font-black">
                        <Icon icon="lucide:thumbs-down" className="w-3 h-3" /> Neutral
                      </span>
                    )}
                  </div>

                  {/* Stars & Comment Content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      {renderStars(item.rating)}
                      <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                        {item.rating}.0 / 5.0
                      </span>
                    </div>

                    {item.title && (
                      <h5 className="font-black text-sm text-gray-900 dark:text-white leading-snug">
                        "{item.title}"
                      </h5>
                    )}

                    <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed line-clamp-3 italic">
                      {item.comment ? `“${item.comment}”` : "No written comment provided."}
                    </p>
                  </div>

                  {/* Moderation Controls Footer */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(item.id, item.status);
                      }}
                      disabled={actionLoading === item.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] ${
                        item.status === "published"
                          ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                      }`}
                    >
                      <Icon
                        icon={item.status === "published" ? "lucide:eye-off" : "lucide:eye"}
                        className="w-3.5 h-3.5"
                      />
                      <span>{item.status === "published" ? "Hide Review" : "Publish Review"}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFeedback(item);
                        }}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#09314F] hover:text-white dark:hover:bg-[#C5A97A] dark:hover:text-[#09314F] transition-all"
                        title="View Full Details"
                      >
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFeedback(item.id);
                        }}
                        disabled={actionLoading === item.id}
                        className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all"
                        title="Delete Review"
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ── Server-Side Pagination Footer ───────────────────────────── */}
        {!loading && feedbacks.length > 0 && (
          <div className="p-5 bg-white dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-900 dark:text-white">{pagination.from}</span> to{" "}
              <span className="font-bold text-gray-900 dark:text-white">{pagination.to}</span> of{" "}
              <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> feedback reviews
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

        {/* ── Inspection Detail Modal ─────────────────────────────────── */}
        {selectedFeedback && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#09314F]/10 dark:bg-[#C5A97A]/10 text-[#09314F] dark:text-[#C5A97A] flex items-center justify-center font-bold">
                    <Icon icon="lucide:message-square" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Review & Feedback Inspector</h3>
                    <p className="text-xs text-gray-400 font-mono">Feedback ID: #{selectedFeedback.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center justify-center transition-colors"
                >
                  <Icon icon="lucide:x" className="w-4 h-4" />
                </button>
              </div>

              {/* Reviewer Profile */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#09314F] to-[#0b3d63] text-white font-bold flex items-center justify-center text-base">
                    {selectedFeedback.author_name?.[0] || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selectedFeedback.author_name}</h4>
                    <p className="text-xs text-gray-400">{selectedFeedback.author_email || "No email attached"}</p>
                  </div>
                </div>

                {(() => {
                  const b = getAuthorBadge(selectedFeedback.author_group, selectedFeedback.author_role);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-black ${b.bg}`}>
                      <Icon icon={b.icon} className="w-3.5 h-3.5" />
                      <span>{b.label}</span>
                    </span>
                  );
                })()}
              </div>

              {/* Review Target & Score Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Target Category</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedFeedback.category}</span>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Target Item</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate block">{selectedFeedback.target_title}</span>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Overall Rating</span>
                  <span className="font-bold text-amber-500">{selectedFeedback.rating}.0 / 5.0 Stars</span>
                </div>
              </div>

              {/* Full Comment */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Written Review</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                  {selectedFeedback.title && (
                    <h5 className="font-black text-sm text-[#09314F] dark:text-[#C5A97A]">{selectedFeedback.title}</h5>
                  )}
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedFeedback.comment || "No detailed comment was provided."}
                  </p>
                </div>
              </div>

              {/* Sub-ratings Breakdown if present */}
              {selectedFeedback.ratings && Object.keys(selectedFeedback.ratings).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Sub-Ratings Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedFeedback.ratings).map(([key, val]) => (
                      <div key={key} className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                        <span className="font-bold capitalize text-gray-600 dark:text-gray-400">{key.replace(/_/g, " ")}:</span>
                        <span className="font-black text-gray-900 dark:text-white">{val} / 5</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(selectedFeedback.id, selectedFeedback.status)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  {selectedFeedback.status === "published" ? "Hide from Public" : "Publish to Public"}
                </button>

                <button
                  onClick={() => setSelectedFeedback(null)}
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
