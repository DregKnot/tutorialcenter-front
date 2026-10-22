import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import SubjectBookCard from "../../../components/common/SubjectBookCard.jsx";
import axios from "axios";
import {
  BookOpenIcon,
  ChevronRightIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  XMarkIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://tutorialcenter-back.test" ||
  "http://localhost:8000";

export default function AdminSubjectModules() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Navigation & Search State
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("staff_token");

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch courses & subjects
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      };

      const [coursesRes, subjectsRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/courses`),
        axios.get(`${API_BASE_URL}/api/admin/subjects/all`, config),
      ]);

      if (coursesRes.status === "fulfilled") {
        setCourses(coursesRes.value.data?.data || coursesRes.value.data?.courses || []);
      }

      if (subjectsRes.status === "fulfilled") {
        setSubjects(subjectsRes.value.data?.data || subjectsRes.value.data?.subjects || []);
      }
    } catch (err) {
      console.error("Failed to load lessons data:", err);
      setToast({ type: "error", message: "Failed to load subjects and courses." });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to match subjects to a course
  const getCourseSubjects = useCallback(
    (courseId) => {
      return subjects.filter((s) => {
        const courseList = Array.isArray(s.courses)
          ? s.courses
          : s.course
          ? [s.course]
          : [];
        return (
          courseList.some((c) => Number(c?.id || c) === Number(courseId)) ||
          Number(s.course_id) === Number(courseId)
        );
      });
    },
    [subjects]
  );

  // Active selected course object
  const activeCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return courses.find((c) => Number(c.id) === Number(selectedCourseId)) || null;
  }, [courses, selectedCourseId]);

  // Subjects belonging to the currently selected course
  const activeCourseSubjects = useMemo(() => {
    if (!activeCourse) return [];
    return getCourseSubjects(activeCourse.id);
  }, [activeCourse, getCourseSubjects]);

  // Global search filtering across all subjects or within active course
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return activeCourse ? activeCourseSubjects : [];
    }

    const pool = activeCourse ? activeCourseSubjects : subjects;
    return pool.filter((s) => {
      const nameMatch = s.name?.toLowerCase().includes(q);
      const codeMatch = s.code?.toLowerCase().includes(q);
      const descMatch = s.description?.toLowerCase().includes(q);
      return nameMatch || codeMatch || descMatch;
    });
  }, [searchQuery, activeCourse, activeCourseSubjects, subjects]);

  const openStudio = (subj) => {
    navigate(`/staffs/model-creation/${subj.id}`);
  };

  return (
    <StaffDashboardLayout pagetitle="Lessons">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[180] px-6 py-4 rounded-2xl shadow-2xl text-white transition-all ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          }`}
        >
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="flex flex-col gap-8 min-h-screen">
        {/* ========================================================================= */}
        {/* HERO BANNER: LESSONS & CURRICULUM STUDIO                                   */}
        {/* ========================================================================= */}
        <div className="p-8 sm:p-10 bg-[#0F2843] rounded-[40px] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BB9E7F]">
                Curriculum & Studio
              </span>
              {activeCourse && (
                <>
                  <span className="text-gray-500">/</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    {activeCourse.title}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {activeCourse ? `${activeCourse.title} Lessons` : "Interactive Lessons"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              {activeCourse
                ? `Select any subject textbook below to manage its topics (modules), attach animated videos, upload slide PDFs, and configure practice quizzes.`
                : `Select a course program below to access its subject textbooks, organize sequential modules, attach animated lessons, and set up practice quizzes.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
              <FolderPlusIcon className="w-8 h-8 text-[#BB9E7F]" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEARCH BAR & NAVIGATION CONTROLS                                         */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          {/* Back to courses button (when inside a course) */}
          <div className="flex items-center gap-3">
            {activeCourse && (
              <button
                onClick={() => {
                  setSelectedCourseId(null);
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-black uppercase tracking-wider text-[#0F2843] dark:text-white transition-all shadow-sm active:scale-95"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                All Courses
              </button>
            )}

            <div className="text-xs font-bold text-gray-400">
              {activeCourse
                ? `${filteredSubjects.length} ${
                    filteredSubjects.length === 1 ? "Subject Textbook" : "Subject Textbooks"
                  }`
                : `${courses.length} Available Courses`}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeCourse
                  ? `Search ${activeCourse.title} subjects...`
                  : "Search all subjects..."
              }
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LOADING STATE                                                             */}
        {/* ========================================================================= */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-[3/4.2] max-w-[270px] mx-auto w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 1: COURSES VIEW (WHEN NO COURSE IS SELECTED & NO SEARCH QUERY)    */}
        {/* ========================================================================= */}
        {!loading && !activeCourse && !searchQuery.trim() && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-6 bg-[#0F2843] dark:bg-blue-400 rounded-full" />
              <h2 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-wider">
                Select a Course Program
              </h2>
            </div>

            {courses.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-gray-800/40 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                <BookOpenIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-black text-gray-700 dark:text-gray-300">
                  No Courses Found
                </h3>
                <p className="text-xs text-gray-400">
                  Create courses in Manage Courses first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => {
                  const courseSubjs = getCourseSubjects(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className="bg-white dark:bg-gray-800 rounded-[32px] p-6 border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all cursor-pointer group flex flex-col justify-between h-64 relative overflow-hidden"
                    >
                      {/* Ambient background accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

                      <div className="space-y-3 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-[#0F2843]/10 dark:bg-blue-900/40 text-[#0F2843] dark:text-blue-300 flex items-center justify-center font-black">
                          <AcademicCapIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BB9E7F]">
                            Curriculum Program
                          </span>
                          <h3 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {course.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {course.description || "Comprehensive syllabus and interactive lessons."}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between relative z-10">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300">
                          {courseSubjs.length} {courseSubjs.length === 1 ? "Subject" : "Subjects"}
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-[#0F2843] dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Open Course
                          <ChevronRightIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: SUBJECTS BOOK UI (INSIDE A COURSE OR GLOBAL SEARCH ACTIVE)     */}
        {/* ========================================================================= */}
        {!loading && (activeCourse || searchQuery.trim()) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-6 bg-[#0F2843] dark:bg-blue-400 rounded-full" />
                <h2 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-wider">
                  {searchQuery.trim()
                    ? `Search Results for "${searchQuery}"`
                    : `${activeCourse?.title} Subject Textbooks`}
                </h2>
              </div>
            </div>

            {filteredSubjects.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-gray-800/40 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                <BookOpenIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-black text-gray-700 dark:text-gray-300">
                  No Subjects Found
                </h3>
                <p className="text-xs text-gray-400">
                  {searchQuery.trim()
                    ? `No subjects match "${searchQuery}". Try a different keyword.`
                    : "No subjects assigned to this course yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
                {filteredSubjects.map((subject) => {
                  const subjectCourseTitle =
                    activeCourse?.title ||
                    subject.courses?.[0]?.title ||
                    subject.course?.title ||
                    "";

                  return (
                    <SubjectBookCard
                      key={subject.id}
                      subject={subject}
                      courseTitle={subjectCourseTitle}
                      role="admin"
                      actionLabel="Manage Lessons"
                      onClick={() => openStudio(subject)}
                      className="w-full"
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
