import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import StudentAssessmentResultModal from "../../components/private/Students/StudentAssessmentResultModal.jsx";
import axios from "axios";
import {
  AcademicCapIcon,
  ClockIcon,
  CalendarDaysIcon,
  PlayIcon,
  TrophyIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function StudentAssessments() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'submitted', 'graded', 'absent'

  // Selected for review modal
  const [reviewData, setReviewData] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [loadingReview, setLoadingReview] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("token") || localStorage.getItem("student_token");

  // Fetch Student Assessments
  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students/assessments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = res.data?.assessments || [];
      setAssessments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load student assessments:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Open Results Review Modal
  const handleOpenReview = async (assessmentId) => {
    setLoadingReview(assessmentId);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students/assessments/${assessmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      setReviewData(res.data);
      setReviewModalOpen(true);
    } catch (err) {
      console.error("Failed to load review details:", err);
      alert("Failed to load submission review.");
    } finally {
      setLoadingReview(null);
    }
  };

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const subStatus = a.submission?.status || "not_started";

      if (statusFilter === "pending") {
        if (subStatus !== "not_started" && subStatus !== "in_progress") return false;
      } else if (statusFilter === "submitted") {
        if (subStatus !== "submitted") return false;
      } else if (statusFilter === "graded") {
        if (subStatus !== "graded") return false;
      } else if (statusFilter === "absent") {
        if (subStatus !== "absent") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (a.title || "").toLowerCase().includes(q);
        const subjectMatch = (a.subject?.name || a.class?.title || "").toLowerCase().includes(q);
        if (!titleMatch && !subjectMatch) return false;
      }

      return true;
    });
  }, [assessments, statusFilter, searchQuery]);

  // High-level KPI computations
  const totalCount = assessments.length;
  const pendingCount = assessments.filter(
    (a) => !a.submission || a.submission.status === "in_progress"
  ).length;
  const gradedCount = assessments.filter((a) => a.submission?.status === "graded").length;

  const gradedScores = assessments
    .filter((a) => a.submission?.status === "graded" && a.submission.percentage !== null)
    .map((a) => a.submission.percentage);

  const avgPercentage =
    gradedScores.length > 0
      ? Math.round(gradedScores.reduce((sum, p) => sum + p, 0) / gradedScores.length)
      : null;

  return (
    <DashboardLayout hideRightPanel={true} hideHeader={true}>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full min-h-screen space-y-8 pb-24">
        
        {/* ── TOP HERO HEADER ─────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#0F2843] via-[#163a5f] to-[#0F2843] rounded-[32px] p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-white/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-black text-[#C5A97A] uppercase tracking-wider">
                <AcademicCapIcon className="w-4 h-4" />
                <span>My Academic Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Class Assessments & Assignments
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
                Take tests assigned by your masterclass tutors, track your due dates, and review graded feedback to improve your subject mastery.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={fetchAssessments}
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
                title="Refresh Assessments"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI STATS BAR ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#09314F] rounded-3xl p-5 border border-gray-100 dark:border-white/10 shadow-sm space-y-1">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
              Total Assigned
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#0F2843] dark:text-white">
              {totalCount}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">In your enrolled subjects</p>
          </div>

          <div className="bg-white dark:bg-[#09314F] rounded-3xl p-5 border border-gray-100 dark:border-white/10 shadow-sm space-y-1">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>To Take / Due</span>
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {pendingCount}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Pending your submission</p>
          </div>

          <div className="bg-white dark:bg-[#09314F] rounded-3xl p-5 border border-gray-100 dark:border-white/10 shadow-sm space-y-1">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Graded & Reviewed
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {gradedCount}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">With tutor feedback</p>
          </div>

          <div className="bg-white dark:bg-[#09314F] rounded-3xl p-5 border border-gray-100 dark:border-white/10 shadow-sm space-y-1">
            <span className="text-[11px] font-black text-[#C5A97A] uppercase tracking-wider">
              Average Score
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#0F2843] dark:text-[#C5A97A]">
              {avgPercentage !== null ? `${avgPercentage}%` : "N/A"}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Across graded tests</p>
          </div>
        </div>

        {/* ── FILTER & SEARCH CONTROLS ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#09314F] rounded-[28px] p-4 sm:p-5 border border-gray-100 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto custom-scrollbar">
            {[
              { id: "all", label: "All Tests" },
              { id: "pending", label: "To Take" },
              { id: "submitted", label: "Submitted" },
              { id: "graded", label: "Graded" },
              { id: "absent", label: "Missed" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex-shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assessment or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] outline-none transition"
            />
          </div>
        </div>

        {/* ── ASSESSMENTS GRID ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="p-16 text-center text-xs text-gray-400 bg-white dark:bg-[#09314F] rounded-3xl border border-gray-100 dark:border-white/10">
            <div className="w-8 h-8 border-2 border-[#0F2843] dark:border-[#C5A97A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading assigned assessments...
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-[#09314F] rounded-[32px] border border-gray-100 dark:border-white/10 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#0F2843]/10 dark:bg-white/10 text-[#0F2843] dark:text-[#C5A97A] flex items-center justify-center mx-auto">
              <AcademicCapIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                No Assessments in this Category
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {searchQuery
                  ? "No assignments match your search query."
                  : "You're all caught up! There are currently no pending assessments for your enrolled subjects."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((item) => {
              const sub = item.submission;
              const subStatus = sub?.status || "not_started";
              const isGraded = subStatus === "graded";
              const isSubmitted = subStatus === "submitted";
              const isAbsent = subStatus === "absent";
              const isToTake = subStatus === "not_started" || subStatus === "in_progress";

              const subjectName = item.subject?.name || item.class?.subject?.name || "Subject";
              const classTitle = item.class?.title || `${subjectName} Masterclass`;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#09314F] rounded-[32px] p-6 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group"
                >
                  {/* Top Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-[#0F2843]/10 dark:bg-white/10 text-[#0F2843] dark:text-[#C5A97A]">
                        {subjectName}
                      </span>

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                          isGraded
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                            : isSubmitted
                            ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300"
                            : isAbsent
                            ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300"
                            : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300"
                        }`}
                      >
                        {isGraded
                          ? "Graded"
                          : isSubmitted
                          ? "Submitted (Pending Grading)"
                          : isAbsent
                          ? "Missed"
                          : "To Take"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-[#0F2843] dark:group-hover:text-[#C5A97A] transition line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium line-clamp-1">
                        {classTitle}
                      </p>
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                      <div className="px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 flex items-center gap-1">
                        <SparklesIcon className="w-3.5 h-3.5 text-[#C5A97A]" />
                        <span>{item.total_marks || 0} Total Marks</span>
                      </div>

                      {item.timer_minutes && (
                        <div className="px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5 text-blue-500" />
                          <span>{item.timer_minutes} Mins</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Due Date & Score Box */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 space-y-2 text-xs">
                    {isGraded ? (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Your Grade:</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {sub.score} / {sub.total_marks || item.total_marks} ({Math.round(sub.percentage || 0)}%)
                        </span>
                      </div>
                    ) : isSubmitted ? (
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span className="font-medium">MCQ Partial Score:</span>
                        <span className="font-bold text-[#0F2843] dark:text-[#C5A97A]">
                          {sub.score || 0} pts (Essays Pending)
                        </span>
                      </div>
                    ) : isAbsent ? (
                      <div className="text-red-500 font-bold text-[11px]">
                        Deadline passed without submission.
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Passing Standard:</span>
                        <span className="font-bold text-[#0F2843] dark:text-white">
                          {item.pass_mark || 50}%
                        </span>
                      </div>
                    )}

                    {item.due_at && (
                      <div className="text-[11px] text-gray-400 pt-1 border-t border-gray-200/50 dark:border-white/10 flex items-center gap-1.5">
                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                        <span>Deadline: {new Date(item.due_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-gray-100 dark:border-white/10">
                    {isToTake ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/student/assessments/${item.id}`)}
                        className="w-full py-2.5 rounded-2xl bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] text-xs font-black shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
                      >
                        <PlayIcon className="w-4 h-4" />
                        <span>{subStatus === "in_progress" ? "Resume Assessment" : "Start Assessment"}</span>
                      </button>
                    ) : isGraded || isSubmitted ? (
                      <button
                        type="button"
                        onClick={() => handleOpenReview(item.id)}
                        disabled={loadingReview === item.id}
                        className="w-full py-2.5 rounded-2xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {loadingReview === item.id ? (
                          <div className="w-4 h-4 border-2 border-[#0F2843] dark:border-[#C5A97A] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <TrophyIcon className="w-4 h-4 text-[#C5A97A]" />
                        )}
                        <span>
                          {loadingReview === item.id
                            ? "Loading..."
                            : isGraded
                            ? "View Feedback & Results"
                            : "View Submitted Answers"}
                        </span>
                      </button>
                    ) : (
                      <div className="text-center py-2 text-xs font-bold text-gray-400">
                        Assessment Closed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* REVIEW RESULTS MODAL */}
        <StudentAssessmentResultModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          assessmentData={reviewData}
        />

      </div>
    </DashboardLayout>
  );
}
