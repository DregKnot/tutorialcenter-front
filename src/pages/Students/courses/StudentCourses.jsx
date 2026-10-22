import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../../../components/private/Students/DashboardLayout.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { studentCurriculumApi } from "../../../services/curriculumService.js";
import {
  BookOpen,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Award,
  AlertCircle,
  FileText,
  Sparkles,
  Layers
} from "lucide-react";

export default function StudentCourses() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  // Active expanded subject state (in-place screen coverage without covering sidebar)
  const [activeSubject, setActiveSubject] = useState(null);
  const [subjectCurriculumLoading, setSubjectCurriculumLoading] = useState(false);
  const [subjectCurriculum, setSubjectCurriculum] = useState(null);
  const [curriculumError, setCurriculumError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [lessonDetailsCache, setLessonDetailsCache] = useState({}); // { [lessonId]: lessonData }

  // Fetch student enrolled courses & subjects
  const fetchEnrolledCourses = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/api/students/dashboard-summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const rawPayload = res?.data || {};
      const data =
        rawPayload.data && typeof rawPayload.data === "object" && !Array.isArray(rawPayload.data)
          ? rawPayload.data
          : rawPayload;

      const fetchedCourses = Array.isArray(data.courses) ? data.courses : [];
      setCourses(fetchedCourses);
    } catch (err) {
      console.error("Failed to fetch enrolled courses:", err);
      setError("Failed to load your enrolled courses.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  // Load subject curriculum when student clicks a subject card
  const handleOpenSubject = async (subject) => {
    setActiveSubject(subject);
    setSubjectCurriculum(null);
    setCurriculumError(null);
    setSubjectCurriculumLoading(true);
    setExpandedModules({});

    try {
      const res = await studentCurriculumApi.getSubjectProgress(subject.id);
      if (res?.progress) {
        setSubjectCurriculum(res.progress);
        // Expand first module by default if it has modules
        if (res.progress.modules && res.progress.modules.length > 0) {
          setExpandedModules({ [res.progress.modules[0].id]: true });
        }
      } else {
        setSubjectCurriculum({ modules: [] });
      }
    } catch (err) {
      console.error("Failed to load subject modules:", err);
      // If 404 or empty, treat as 0 modules
      if (err.response?.status === 404) {
        setSubjectCurriculum({ modules: [] });
      } else {
        setCurriculumError(err.response?.data?.message || "Failed to load modules for this subject.");
      }
    } finally {
      setSubjectCurriculumLoading(false);
    }
  };

  const handleCloseSubject = () => {
    setActiveSubject(null);
    setSubjectCurriculum(null);
  };

  const toggleModule = async (moduleId) => {
    const isNowExpanded = !expandedModules[moduleId];
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: isNowExpanded,
    }));
  };

  // Helper to resolve image URL
  const getBannerUrl = (bannerPath) => {
    if (!bannerPath) {
      return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";
    }
    if (bannerPath.startsWith("http")) return bannerPath;
    return `${API_BASE_URL}/storage/${bannerPath}`;
  };

  return (
    <DashboardLayout pagetitle={activeSubject ? `${activeSubject.name} · Curriculum` : "Interactive Courses"}>
      <div className="max-w-6xl mx-auto px-2 sm:px-6 py-4 space-y-8">

        {/* ========================================================================= */}
        {/* VIEW 1: EXPANDED SUBJECT CONTAINER (COVERS SCREEN WITHOUT COVERING SIDEBAR) */}
        {/* ========================================================================= */}
        {activeSubject && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Top Back Navigation Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleCloseSubject}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-black uppercase tracking-wider text-[#09314F] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Subjects
              </button>
            </div>

            {/* Subject Hero Banner Card */}
            <div className="relative rounded-[36px] overflow-hidden shadow-2xl h-64 sm:h-80 border border-gray-200 dark:border-gray-800">
              <img
                src={getBannerUrl(activeSubject.banner)}
                alt={activeSubject.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09314F] via-[#09314F]/70 to-black/30" />

              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10">
                    Subject Curriculum
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
                  {activeSubject.name}
                </h1>
                {subjectCurriculum && (
                  <p className="text-xs sm:text-sm text-gray-200 font-medium max-w-xl">
                    {subjectCurriculum.total_lessons || 0} total lessons · {subjectCurriculum.completed_lessons || 0} completed ({Math.round(subjectCurriculum.overall_percentage || 0)}%)
                  </p>
                )}
              </div>
            </div>

            {/* Subject Curriculum Body */}
            {subjectCurriculumLoading && (
              <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-12 text-center animate-pulse space-y-4 border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto" />
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                <div className="h-4 w-72 bg-gray-100 dark:bg-gray-700 rounded mx-auto" />
              </div>
            )}

            {!subjectCurriculumLoading && curriculumError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-3xl p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-red-700 dark:text-red-300">Unable to Load Modules</h3>
                <p className="text-xs text-red-600 dark:text-red-400">{curriculumError}</p>
                <button
                  onClick={() => handleOpenSubject(activeSubject)}
                  className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl text-xs"
                >
                  Retry
                </button>
              </div>
            )}

            {/* EMPTY STATE: NO MODULE CREATED YET (EXPLICIT USER MANDATE) */}
            {!subjectCurriculumLoading && !curriculumError && (!subjectCurriculum?.modules || subjectCurriculum.modules.length === 0) && (
              <div className="bg-white dark:bg-gray-800/90 rounded-[36px] p-12 sm:p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <Layers className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-[#09314F] dark:text-white uppercase tracking-tight">
                    No Module Created Yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto">
                    Your tutors are currently preparing the interactive modules, video lessons, and worksheets for <span className="font-bold text-[#09314F] dark:text-white">{activeSubject.name}</span>. Check back soon!
                  </p>
                </div>
              </div>
            )}

            {/* MODULES LIST & ACCORDIONS */}
            {!subjectCurriculumLoading && !curriculumError && subjectCurriculum?.modules?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xs font-black text-[#09314F] dark:text-white uppercase tracking-wider">
                    Course Modules ({subjectCurriculum.modules.length})
                  </h2>
                  <span className="text-xs font-semibold text-gray-400">
                    Click module to explore lessons & materials
                  </span>
                </div>

                {subjectCurriculum.modules.map((mod, modIdx) => {
                  const isExpanded = Boolean(expandedModules[mod.id]);
                  const modPercentage = Math.round(mod.percentage || 0);

                  return (
                    <div
                      key={mod.id}
                      className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Module Bar */}
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                              modPercentage === 100
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-[#09314F] text-white"
                            }`}
                          >
                            {modPercentage === 100 ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              modIdx + 1
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#E83831]">
                              Topic {modIdx + 1}
                            </span>
                            <h3 className="font-black text-base sm:text-xl text-[#09314F] dark:text-white truncate">
                              {mod.title}
                            </h3>
                            <span className="text-xs text-gray-400 font-medium">
                              {mod.total_lessons || 0} lessons · {mod.completed_lessons || 0} completed
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex flex-col items-end gap-1">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {modPercentage}%
                            </span>
                            <div className="w-24 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#09314F] to-[#E83831] rounded-full transition-all"
                                style={{ width: `${modPercentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="p-2 rounded-xl text-gray-400">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                        </div>
                      </button>

                      {/* Module Lessons Container */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 bg-gray-50/50 dark:bg-gray-850">
                          {(!mod.lessons || mod.lessons.length === 0) ? (
                            <div className="p-6 text-center text-xs text-gray-400">
                              No lessons published in this module yet.
                            </div>
                          ) : (
                            mod.lessons.map((lesson, lessonIdx) => (
                              <div
                                key={lesson.id}
                                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                              >
                                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-xs text-gray-500 dark:text-gray-300 flex-shrink-0">
                                    {modIdx + 1}.{lessonIdx + 1}
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <h4 className="font-bold text-sm sm:text-base text-[#09314F] dark:text-white truncate">
                                      {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                      {lesson.duration_minutes > 0 && (
                                        <span className="flex items-center gap-1 font-medium">
                                          <Clock className="w-3.5 h-3.5" />
                                          {lesson.duration_minutes} mins
                                        </span>
                                      )}
                                      {lesson.progress_status === "completed" && (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          Completed
                                        </span>
                                      )}
                                      {lesson.progress_status === "in_progress" && (
                                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                                          {lesson.completion_percentage}% Watched
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action */}
                                <button
                                  onClick={() => navigate(`/student/courses/lessons/${lesson.id}`)}
                                  className="px-5 py-2.5 bg-[#09314F] hover:bg-[#0A2239] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm active:scale-95 self-end sm:self-center"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  {lesson.progress_status === "completed"
                                    ? "Rewatch"
                                    : lesson.progress_status === "in_progress"
                                    ? "Resume"
                                    : "Start Lesson"}
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ALL REGISTERED COURSES & SUBJECTS GRID (CARDS WITH BANNERS)        */}
        {/* ========================================================================= */}
        {!activeSubject && (
          <div className="space-y-10">
            {/* Header Hero */}
            <div className="bg-[#09314F] text-white rounded-[36px] p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BB9E7F]">
                  Self-Paced Learning Path
                </span>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  Registered Subjects
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 font-medium">
                  All your registered subjects are organized below by program. Click any subject banner to open its complete curriculum, animated video lessons, and materials.
                </p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[#BB9E7F]" />
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-80 bg-gray-100 dark:bg-gray-800/50 rounded-[32px] animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-3xl p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Notice</h3>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && courses.length === 0 && (
              <div className="bg-white dark:bg-gray-800/60 rounded-[36px] p-16 text-center border border-gray-100 dark:border-gray-800 space-y-3">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No Enrolled Courses Found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  You are not currently enrolled in any academic programs.
                </p>
              </div>
            )}

            {/* Courses & Subjects Layout */}
            {!loading && !error && courses.length > 0 && (
              <div className="space-y-12">
                {courses.map((course) => {
                  const subjects = course.subjects || [];

                  return (
                    <div key={course.id} className="space-y-6">
                      {/* Course Program Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-6 bg-[#09314F] dark:bg-blue-400 rounded-full" />
                        <h2 className="text-xl sm:text-2xl font-black text-[#09314F] dark:text-white uppercase tracking-tight">
                          {course.title || "Academic Program"}
                        </h2>
                        <span className="text-xs font-bold text-gray-400">
                          ({subjects.length} registered {subjects.length === 1 ? "subject" : "subjects"})
                        </span>
                      </div>

                      {/* Subjects Grid with Banners */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((sub) => {
                          const bannerSrc = getBannerUrl(sub.banner);
                          const progress = Math.round(sub.progress || 0);
                          const hasNoModules = sub.modules_count === 0 || sub.total_modules === 0;

                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleOpenSubject(sub)}
                              className="bg-white dark:bg-gray-800 rounded-[32px] h-84 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-2xl transition-all group relative cursor-pointer flex flex-col justify-between"
                            >
                              {/* Background Banner Image */}
                              <div className="absolute inset-0">
                                <img
                                  src={bannerSrc}
                                  alt={sub.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#09314F] via-[#09314F]/50 to-black/20" />
                              </div>

                              {/* Top Status Pill: Prominently showing "No module created yet" if empty */}
                              <div className="relative z-10 p-5 flex items-center justify-between">
                                {hasNoModules ? (
                                  <span className="px-3 py-1 bg-amber-500/90 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md backdrop-blur-md">
                                    No module created yet
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-xl border border-white/10">
                                    {progress}% Complete
                                  </span>
                                )}
                              </div>

                              {/* Bottom Subject Details */}
                              <div className="relative z-10 p-6 space-y-3">
                                <div>
                                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-snug truncate group-hover:text-amber-300 transition-colors">
                                    {sub.name}
                                  </h3>
                                  <p className="text-[11px] text-gray-300 font-medium line-clamp-1 mt-0.5">
                                    Click to open curriculum, video lessons & materials
                                  </p>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-[#76D287] rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                  <span className="text-[10px] font-black text-[#BB9E7F] uppercase tracking-wider">
                                    Open Curriculum
                                  </span>
                                  <div className="w-8 h-8 rounded-full bg-white text-[#09314F] flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md">
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
