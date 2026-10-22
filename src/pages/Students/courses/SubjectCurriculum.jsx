import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../../../components/private/Students/DashboardLayout.jsx";
import { studentCurriculumApi } from "../../../services/curriculumService.js";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertCircle
} from "lucide-react";

export default function SubjectCurriculum() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const loadCurriculum = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentCurriculumApi.getSubjectProgress(subjectId);
      if (res?.progress) {
        setProgressData(res.progress);
        // Expand first module by default
        if (res.progress.modules && res.progress.modules.length > 0) {
          const initialExpanded = {};
          res.progress.modules.forEach((mod, idx) => {
            initialExpanded[mod.id] = idx === 0 || (mod.percentage > 0 && mod.percentage < 100);
          });
          setExpandedModules(initialExpanded);
        }
      } else {
        setError("Curriculum data not found.");
      }
    } catch (err) {
      console.error("Failed to load subject curriculum:", err);
      setError(err.response?.data?.message || "Failed to load curriculum for this subject.");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    if (subjectId) {
      loadCurriculum();
    }
  }, [subjectId, loadCurriculum]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
            <PlayCircle className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Not Started
          </span>
        );
    }
  };

  return (
    <DashboardLayout pagetitle={progressData?.subject_name ? `${progressData.subject_name} · Curriculum` : "Curriculum"}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Top Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/student/courses")}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#09314F] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center shadow-sm animate-pulse space-y-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto" />
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto" />
            <div className="h-4 w-64 bg-gray-100 dark:bg-gray-700 rounded-md mx-auto" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-3xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Curriculum Unavailable</h3>
            <p className="text-sm text-red-600 dark:text-red-300 max-w-md mx-auto">{error}</p>
            <button
              onClick={loadCurriculum}
              className="mt-3 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Curriculum Content */}
        {!loading && !error && progressData && (
          <>
            {/* Subject Hero Header */}
            <div className="bg-gradient-to-br from-[#09314F] to-[#0A2239] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300 border border-white/10">
                    <BookOpen className="w-3.5 h-3.5" />
                    Interactive Learning Path
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                    {progressData.subject_name}
                  </h1>
                  <p className="text-sm text-gray-300 font-medium">
                    Master this subject step-by-step through bite-sized animated lessons, downloadable notes, and practice quizzes.
                  </p>
                </div>

                {/* Overall Progress Gauge */}
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex flex-col items-center justify-center min-w-[200px] text-center">
                  <span className="text-3xl font-black text-white">
                    {Math.round(progressData.overall_percentage || 0)}%
                  </span>
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-300 mt-0.5">
                    Course Completion
                  </span>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-[#76D287] h-full rounded-full transition-all duration-700"
                      style={{ width: `${progressData.overall_percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-300 mt-2">
                    {progressData.completed_lessons} of {progressData.total_lessons} lessons completed
                  </span>
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-black text-[#09314F] dark:text-white uppercase tracking-wider text-xs">
                  Modules & Topics ({progressData.modules?.length || 0})
                </h2>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Click any module to view its lessons
                </span>
              </div>

              {(!progressData.modules || progressData.modules.length === 0) ? (
                <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center space-y-2">
                  <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                  <h3 className="font-bold text-gray-700 dark:text-gray-300">No Modules Published Yet</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your tutors are currently preparing video lessons and practice materials for this subject.
                  </p>
                </div>
              ) : (
                progressData.modules.map((module, modIdx) => {
                  const isExpanded = Boolean(expandedModules[module.id]);
                  const modPercentage = Math.round(module.percentage || 0);

                  return (
                    <div
                      key={module.id}
                      className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Module Header Bar */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            modPercentage === 100
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-[#09314F]/10 text-[#09314F] dark:bg-white/10 dark:text-white"
                          }`}>
                            {modPercentage === 100 ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              modIdx + 1
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black text-base sm:text-lg text-[#09314F] dark:text-white truncate">
                              {module.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>{module.total_lessons} {module.total_lessons === 1 ? "lesson" : "lessons"}</span>
                              <span>·</span>
                              <span>{module.completed_lessons} completed</span>
                            </div>
                          </div>
                        </div>

                        {/* Module Progress Pill & Expand Icon */}
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex flex-col items-end gap-1">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {modPercentage}%
                            </span>
                            <div className="w-24 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#09314F] dark:bg-blue-400 rounded-full transition-all"
                                style={{ width: `${modPercentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                        </div>
                      </button>

                      {/* Module Lessons Container */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 dark:border-gray-700/60 divide-y divide-gray-100 dark:divide-gray-700/40 bg-gray-50/40 dark:bg-gray-850/40">
                          {(!module.lessons || module.lessons.length === 0) ? (
                            <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
                              No lessons currently published in this module.
                            </div>
                          ) : (
                            module.lessons.map((lesson, lessonIdx) => (
                              <div
                                key={lesson.id}
                                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                              >
                                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                  <div className="mt-0.5 w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">
                                    {modIdx + 1}.{lessonIdx + 1}
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-bold text-sm sm:text-base text-[#09314F] dark:text-white truncate">
                                        {lesson.title}
                                      </h4>
                                      {getStatusBadge(lesson.progress_status)}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                      {lesson.duration_minutes > 0 && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3.5 h-3.5" />
                                          {lesson.duration_minutes} mins
                                        </span>
                                      )}
                                      {lesson.completion_percentage > 0 && lesson.progress_status !== "completed" && (
                                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                          {lesson.completion_percentage}% watched
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <Link
                                    to={`/student/courses/lessons/${lesson.id}`}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm ${
                                      lesson.progress_status === "completed"
                                        ? "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-[#09314F] dark:text-white"
                                        : lesson.progress_status === "in_progress"
                                        ? "bg-[#09314F] hover:bg-[#0A2239] text-white"
                                        : "bg-[#09314F] hover:bg-[#0A2239] text-white"
                                    }`}
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    {lesson.progress_status === "completed"
                                      ? "Rewatch"
                                      : lesson.progress_status === "in_progress"
                                      ? "Resume"
                                      : "Start"}
                                  </Link>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
