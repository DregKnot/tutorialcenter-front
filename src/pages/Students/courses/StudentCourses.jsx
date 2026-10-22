import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../../../components/private/Students/DashboardLayout.jsx";
import SubjectBookCard from "../../../components/common/SubjectBookCard.jsx";
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
  AlertCircle,
  Layers,
  Search,
  X
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

  // Search & Course Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");

  // Flattened total count of enrolled subjects
  const totalEnrolledSubjects = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.subjects?.length || 0), 0);
  }, [courses]);

  // Filtered courses and their subjects
  const filteredCourses = useMemo(() => {
    let result = courses;
    if (selectedCourseFilter !== "all") {
      result = result.filter(
        (c) => String(c.id || c.course_id) === String(selectedCourseFilter)
      );
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return result;
    }
    return result
      .map((c) => {
        const matchingSubjects = (c.subjects || []).filter((s) => {
          return (
            s.name?.toLowerCase().includes(q) ||
            s.code?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q)
          );
        });
        return {
          ...c,
          subjects: matchingSubjects,
        };
      })
      .filter((c) => (c.subjects || []).length > 0);
  }, [courses, selectedCourseFilter, searchQuery]);

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
        {/* ========================================================================= */}
        {/* VIEW 2: ALL REGISTERED COURSES & SUBJECTS GRID (CARDS WITH BANNERS)        */}
        {/* ========================================================================= */}
        {!activeSubject && (
          <div className="space-y-8">
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
                  You are not currently enrolled in any courses (JAMB, WAEC, NECO, or GCE). Contact administration or browse available packages to get started.
                </p>
              </div>
            )}

            {/* Search Bar & Course Selector Bar */}
            {!loading && !error && courses.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                {/* Course Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCourseFilter("all")}
                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      selectedCourseFilter === "all"
                        ? "bg-[#09314F] text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Subjects ({totalEnrolledSubjects})
                  </button>

                  {courses.map((course) => {
                    const cTitle = (course.course?.title || course.title || course.name || "JAMB").toUpperCase();
                    const cId = String(course.id || course.course_id);
                    const isSelected = selectedCourseFilter === cId;
                    const count = course.subjects?.length || 0;

                    return (
                      <button
                        key={cId}
                        onClick={() => setSelectedCourseFilter(cId)}
                        className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                          isSelected
                            ? "bg-[#09314F] text-white shadow-md"
                            : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span>{cTitle}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-black/10 text-gray-500 dark:text-gray-400"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-80 flex-shrink-0">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your subjects..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09314F] dark:focus:ring-blue-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Empty Search Results */}
            {!loading && !error && courses.length > 0 && filteredCourses.length === 0 && (
              <div className="bg-white dark:bg-gray-800/60 rounded-[36px] p-16 text-center border border-gray-100 dark:border-gray-800 space-y-3">
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
                  No Subjects Found
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  No enrolled subjects match &quot;{searchQuery}&quot;. Try a different keyword or reset the filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCourseFilter("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-black uppercase text-[#09314F] dark:text-white transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Courses & Subjects Layout */}
            {!loading && !error && filteredCourses.length > 0 && (
              <div className="space-y-12">
                {filteredCourses.map((course) => {
                  const subjects = course.subjects || [];
                  const rawCourseName = course.course?.title || course.title || course.name || "";
                  const courseTitle = rawCourseName ? rawCourseName.toUpperCase() : "JAMB";

                  return (
                    <div key={course.id || course.course_id} className="space-y-6">
                      {/* Course Program Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-8 bg-gradient-to-b from-amber-400 to-[#BB9E7F] rounded-full shadow-sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BB9E7F]">
                                Registered Course
                              </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-[#09314F] dark:text-white uppercase tracking-tight">
                              {courseTitle}
                            </h2>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="px-4 py-1.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-black text-[#09314F] dark:text-gray-200 shadow-sm">
                            {subjects.length} {subjects.length === 1 ? "Subject Textbook" : "Subject Textbooks"}
                          </span>
                          <span className="px-3 py-1.5 rounded-2xl bg-[#09314F]/10 dark:bg-blue-900/40 text-[11px] font-black text-[#09314F] dark:text-blue-300 uppercase tracking-wider">
                            Interactive Curriculum
                          </span>
                        </div>
                      </div>

                      {/* Subjects Grid in 3D Book UI */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
                        {subjects.map((sub) => (
                          <SubjectBookCard
                            key={sub.id}
                            subject={sub}
                            courseTitle={courseTitle}
                            role="student"
                            progress={sub.progress}
                            onClick={() => handleOpenSubject(sub)}
                            className="w-full"
                          />
                        ))}
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
