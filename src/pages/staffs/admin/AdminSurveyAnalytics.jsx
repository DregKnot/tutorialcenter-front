import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { useStaffAuth } from "../../../context/StaffAuthContext";
import {
  Users,
  Award,
  Video,
  Download,
  RefreshCw,
  Search,
  X,
  Eye,
  Star,
  HeartHandshake,
  PlaySquare,
} from "lucide-react";

export default function AdminSurveyAnalytics() {
  const { staffToken } = useStaffAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Filters & Modal
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [activeModalSurvey, setActiveModalSurvey] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/surveys/summary`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      setData(res.data?.data || null);
    } catch (err) {
      console.error("Failed to load survey summary", err);
      setError("Failed to load survey analytics. Please verify permissions.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, staffToken]);

  useEffect(() => {
    if (staffToken) {
      fetchSummary();
    }
  }, [staffToken, fetchSummary]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/surveys/export`, {
        headers: { Authorization: `Bearer ${staffToken}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `tutorialcenter_surveys_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export survey data.");
    } finally {
      setExporting(false);
    }
  };

  const openSurveyDetails = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/surveys/${id}`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      setActiveModalSurvey(res.data?.data || null);
    } catch (err) {
      console.error("Failed to fetch survey details:", err);
      alert("Failed to fetch full survey details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filtered recent responses
  const filteredResponses = useMemo(() => {
    if (!data?.recent_responses) return [];
    return data.recent_responses.filter((r) => {
      const matchExam =
        selectedExam === "all" ||
        (r.exam_target && r.exam_target.toLowerCase().includes(selectedExam.toLowerCase()));

      const matchFormat =
        selectedFormat === "all" ||
        (r.preferred_video_format &&
          r.preferred_video_format.toLowerCase().includes(selectedFormat.toLowerCase()));

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (r.full_name && r.full_name.toLowerCase().includes(q)) ||
        (r.format_reason && r.format_reason.toLowerCase().includes(q)) ||
        (r.one_improvement && r.one_improvement.toLowerCase().includes(q)) ||
        (r.likes_most && r.likes_most.toLowerCase().includes(q));

      return matchExam && matchFormat && matchSearch;
    });
  }, [data, selectedExam, selectedFormat, searchQuery]);

  return (
    <StaffDashboardLayout>
      <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#C5A97A]/15 text-[#C5A97A] dark:text-[#d3be98] rounded-full text-xs font-black uppercase tracking-wider">
                Platform Intelligence
              </span>
              <span className="text-xs text-gray-400 font-medium">Real-time Data</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F2843] dark:text-white mt-1">
              Student Survey & Courses Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Actionable insights on live classes, tutors, and student preferences for the upcoming recorded Courses feature.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="p-2.5 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2 text-xs font-bold"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={exporting || loading}
              className="px-5 py-2.5 rounded-2xl bg-[#0F2843] text-white hover:bg-[#1a3e63] dark:bg-[#C5A97A] dark:text-[#0F2843] transition flex items-center gap-2 text-xs font-black shadow-md disabled:opacity-50"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* LOADING PLACEHOLDER */}
        {loading && !data ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C5A97A]" />
          </div>
        ) : (
          <>
            {/* KPI STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Total Responses */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Total Responses
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-[#0F2843]/5 dark:bg-white/10 flex items-center justify-center text-[#0F2843] dark:text-[#C5A97A]">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#0F2843] dark:text-white mt-4">
                  {data?.total_responses || 0}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Active student feedback submissions
                </p>
              </div>

              {/* Stat 2: NPS Score */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Net Promoter Score (NPS)
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-4">
                  <span
                    className={`text-3xl font-black ${
                      (data?.nps?.score || 0) >= 40
                        ? "text-emerald-600 dark:text-emerald-400"
                        : (data?.nps?.score || 0) >= 0
                        ? "text-amber-500"
                        : "text-rose-500"
                    }`}
                  >
                    {data?.nps?.score > 0 ? `+${data?.nps?.score}` : data?.nps?.score || 0}
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">
                    (Scale -100 to +100)
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-bold">
                  <span className="text-emerald-600">
                    {data?.nps?.promoters_pct || 0}% Promoters
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-rose-500">
                    {data?.nps?.detractors_pct || 0}% Detractors
                  </span>
                </div>
              </div>

              {/* Stat 3: Overall Platform Rating */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Avg Overall Rating
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-[#C5A97A]/15 flex items-center justify-center text-[#C5A97A]">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-3xl font-black text-[#0F2843] dark:text-white">
                    {data?.ratings?.overall || 0}
                  </span>
                  <span className="text-xs text-gray-400 font-bold">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        (data?.ratings?.overall || 0) >= s
                          ? "text-[#C5A97A] fill-current"
                          : "text-gray-200 dark:text-gray-700"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-gray-400 font-semibold ml-1">
                    Platform Satisfaction
                  </span>
                </div>
              </div>

              {/* Stat 4: Top Video Format */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    #1 Preferred Format
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Video className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-base font-black text-[#0F2843] dark:text-white truncate">
                    {data?.video_formats?.[0]?.format || "No responses yet"}
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                    {data?.video_formats?.[0]
                      ? `${data.video_formats[0].percentage}% of students`
                      : "Pending data"}
                  </p>
                </div>
              </div>
            </div>

            {/* DEEP DIVE SECTION: VIDEO FORMATS & RATINGS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* VIDEO FORMAT BREAKDOWN */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                    <PlaySquare className="w-5 h-5 text-[#C5A97A]" />
                    Preferred Video Formats for Courses
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Direct votes on what style to produce for recorded lessons
                  </p>
                </div>

                <div className="space-y-4">
                  {data?.video_formats?.length > 0 ? (
                    data.video_formats.map((fmt, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200">
                          <span className="truncate pr-2">{fmt.format}</span>
                          <span className="text-[#0F2843] dark:text-[#C5A97A] flex-shrink-0 font-black">
                            {fmt.count} ({fmt.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0
                                ? "bg-gradient-to-r from-[#C5A97A] to-[#e4cb9c]"
                                : idx === 1
                                ? "bg-gradient-to-r from-[#0F2843] to-[#204975] dark:from-white/60 dark:to-white/80"
                                : "bg-gray-400 dark:bg-gray-600"
                            }`}
                            style={{ width: `${fmt.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-400 font-medium">
                      No video format preferences recorded yet.
                    </div>
                  )}
                </div>

                {/* Video Lengths breakdown */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Preferred Lesson Video Length
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {data?.video_lengths?.map((len, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-center"
                      >
                        <div className="text-xs font-black text-[#0F2843] dark:text-white">
                          {len.length}
                        </div>
                        <div className="text-[10px] text-[#C5A97A] font-bold mt-0.5">
                          {len.percentage}% ({len.count})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RATINGS BREAKDOWN */}
              <div className="bg-white dark:bg-[#09314F] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-[#0F2843] dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#C5A97A]" />
                    Satisfaction Ratings Across Features
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Student perception on key educational touchpoints (out of 5.0)
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Live Masterclasses", val: data?.ratings?.live_classes || 0 },
                    { label: "Tutors & Instructors", val: data?.ratings?.tutors || 0 },
                    { label: "Study Materials & Notes", val: data?.ratings?.study_materials || 0 },
                    { label: "CBT & Exam Practice", val: data?.ratings?.cbt || 0 },
                    { label: "Platform Usability & App", val: data?.ratings?.platform || 0 },
                    { label: "Anticipated Utility of Courses", val: data?.ratings?.courses_utility || 0 },
                  ].map((item, idx) => {
                    const pct = Math.round((item.val / 5) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200">
                          <span>{item.label}</span>
                          <span className="font-black text-[#0F2843] dark:text-[#C5A97A]">
                            {item.val} / 5.0
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.val >= 4.0
                                ? "bg-emerald-500"
                                : item.val >= 3.0
                                ? "bg-[#C5A97A]"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Exam Breakdown */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Respondents by Exam Target
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data?.exam_targets?.map((ex, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-[#0F2843]/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300"
                      >
                        {ex.exam}: <strong className="text-[#0F2843] dark:text-[#C5A97A]">{ex.count}</strong> ({ex.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT RESPONSES EXPLORER TABLE */}
            <div className="bg-white dark:bg-[#09314F] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden space-y-4 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-[#0F2843] dark:text-white">
                    Individual Student Responses & Feedback
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Click any student to view their complete 43-question submission and feedback rationale.
                  </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search name or comment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none w-48 sm:w-60"
                    />
                  </div>

                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="px-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none"
                  >
                    <option value="all">All Exams</option>
                    <option value="JAMB">JAMB</option>
                    <option value="WAEC">WAEC</option>
                    <option value="NECO">NECO</option>
                    <option value="GCE">GCE</option>
                  </select>

                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="px-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none"
                  >
                    <option value="all">All Formats</option>
                    <option value="Full syllabus">Full syllabus</option>
                    <option value="Topic-by-topic">Topic-by-topic</option>
                    <option value="Past questions">Past questions</option>
                    <option value="Crash course">Crash course</option>
                  </select>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 border-y border-gray-100 dark:border-white/10">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Exam Target</th>
                      <th className="py-3 px-4">Preferred Video Style</th>
                      <th className="py-3 px-4">Length</th>
                      <th className="py-3 px-4 text-center">Overall</th>
                      <th className="py-3 px-4 text-center">NPS</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10 font-medium">
                    {filteredResponses.length > 0 ? (
                      filteredResponses.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition"
                        >
                          <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            <div>{r.full_name}</div>
                            {r.wants_followup && r.whatsapp_number && (
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                WhatsApp: {r.whatsapp_number}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-[10px] font-bold">
                              {r.exam_target || "N/A"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#0F2843] dark:text-[#C5A97A] font-semibold">
                            {r.preferred_video_format || "N/A"}
                          </td>
                          <td className="py-3.5 px-4">{r.preferred_video_length || "N/A"}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-black text-[#C5A97A]">
                              {r.overall_rating ? `${r.overall_rating} ★` : "-"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {r.nps_score !== null ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${
                                  r.nps_score >= 9
                                    ? "bg-emerald-600"
                                    : r.nps_score >= 7
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                              >
                                {r.nps_score}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                            {r.created_at}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => openSurveyDetails(r.id)}
                              disabled={loadingDetail}
                              className="px-3 py-1.5 rounded-xl bg-[#0F2843]/5 dark:bg-white/10 hover:bg-[#0F2843] hover:text-white dark:hover:bg-[#C5A97A] dark:hover:text-[#0F2843] transition text-xs font-bold inline-flex items-center gap-1 text-[#0F2843] dark:text-gray-200 disabled:opacity-50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {loadingDetail ? "Loading..." : "View"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-xs text-gray-400 font-medium"
                        >
                          No survey responses match your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* FULL RESPONSE MODAL DRAWER */}
        {activeModalSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#09314F] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#0F2843] dark:text-white">
                    Survey Submission: {activeModalSurvey.full_name || "Anonymous Student"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Target Exam: {activeModalSurvey.exam_target || "N/A"} • Submitted on{" "}
                    {new Date(activeModalSurvey.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalSurvey(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CORE HIGHLIGHTS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Overall Rating</div>
                  <div className="text-lg font-black text-[#C5A97A] mt-0.5">
                    {activeModalSurvey.overall_rating || "-"} / 5
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-400">NPS Score</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {activeModalSurvey.nps_score !== null ? `${activeModalSurvey.nps_score} / 10` : "-"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Preferred Format</div>
                  <div className="text-xs font-black text-[#0F2843] dark:text-white mt-1 truncate">
                    {activeModalSurvey.preferred_video_format || "-"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Video Length</div>
                  <div className="text-xs font-black text-[#0F2843] dark:text-white mt-1">
                    {activeModalSurvey.preferred_video_length || "-"}
                  </div>
                </div>
              </div>

              {/* OPEN FEEDBACK TEXT HIGHLIGHTS */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-white/5 border border-blue-100 dark:border-white/10 space-y-1">
                  <h4 className="text-xs font-black text-[#0F2843] dark:text-[#C5A97A] uppercase tracking-wider">
                    Why they prefer this video format:
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    "{activeModalSurvey.responses?.q23_format_reason || "No comment provided"}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-white/5 border border-amber-100 dark:border-white/10 space-y-1">
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    ONE Thing to Improve:
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    "{activeModalSurvey.responses?.q14_one_thing_improve || "No comment provided"}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-white/5 border border-emerald-100 dark:border-white/10 space-y-1">
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                    What they like most:
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    "{activeModalSurvey.responses?.q12_likes_most || "No comment provided"}"
                  </p>
                </div>

                {activeModalSurvey.responses?.q15_had_problem === "Yes" && (
                  <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 space-y-1">
                    <h4 className="text-xs font-black text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                      Reported Issue:
                    </h4>
                    <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                      "{activeModalSurvey.responses?.q16_problem_details || "No details given"}"
                    </p>
                  </div>
                )}
              </div>

              {/* RAW RESPONSES ACCORDION / JSON LIST */}
              <div className="pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                  All Submitted Answers (Key-Value)
                </h4>
                <div className="max-h-60 overflow-y-auto bg-gray-50 dark:bg-black/30 rounded-2xl p-4 text-[11px] font-mono text-gray-600 dark:text-gray-300 space-y-2">
                  {Object.entries(activeModalSurvey.responses || {}).map(([k, v]) => (
                    <div key={k} className="border-b border-gray-200/50 dark:border-white/5 pb-1">
                      <span className="text-[#0F2843] dark:text-[#C5A97A] font-bold">{k}:</span>{" "}
                      <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveModalSurvey(null)}
                  className="px-6 py-2.5 bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] rounded-2xl text-xs font-black"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
