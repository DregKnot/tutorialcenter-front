import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import axios from "axios";
import {
  AcademicCapIcon,
  BookOpenIcon,
  PlusIcon,
  ChevronRightIcon,
  FolderPlusIcon,
  SparklesIcon,
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
      console.error("Failed to load subject modules data:", err);
      setToast({ type: "error", message: "Failed to load subjects and courses." });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openStudio = (subj) => {
    navigate(`/staffs/model-creation/${subj.id}`);
  };

  return (
    <StaffDashboardLayout pagetitle="Subject Modules">
      {/* Toast */}
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
        {/* Header Hero Banner */}
        <div className="p-8 sm:p-10 bg-[#0F2843] rounded-[40px] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BB9E7F]">
              Curriculum & Lesson Studio
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Subject Modules
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              Select a subject below to manage its topics (modules), attach animated video lessons, upload lecture slide PDFs, and configure practice quizzes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
              <FolderPlusIcon className="w-8 h-8 text-[#BB9E7F]" />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 bg-gray-100 dark:bg-gray-800/50 rounded-[32px] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Subjects Grouped by Registered Course */}
        {!loading && (
          <div className="space-y-10">
            {courses.length === 0 && subjects.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-gray-800/40 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                <BookOpenIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-black text-gray-700 dark:text-gray-300">No Subjects Found</h3>
                <p className="text-xs text-gray-400">Create subjects in Manage Courses first.</p>
              </div>
            ) : (
              courses.map((course) => {
                const courseSubjects = subjects.filter(
                  (s) => Number(s.courses?.[0]?.id || s.courses?.[0]) === Number(course.id)
                );

                if (courseSubjects.length === 0) return null;

                return (
                  <div key={course.id} className="space-y-5">
                    {/* Course Heading */}
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-6 bg-[#0F2843] dark:bg-blue-400 rounded-full" />
                      <h2 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-wider">
                        {course.title}
                      </h2>
                      <span className="text-xs font-bold text-gray-400">
                        ({courseSubjects.length} subjects)
                      </span>
                    </div>

                    {/* Subject Cards Grid with Banners */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courseSubjects.map((subject) => {
                        const bannerSrc = subject.banner
                          ? subject.banner.startsWith("http")
                            ? subject.banner
                            : `${API_BASE_URL}/storage/${subject.banner}`
                          : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

                        return (
                          <div
                            key={subject.id}
                            className="bg-white dark:bg-gray-800 rounded-[32px] h-80 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all group relative flex flex-col justify-between"
                          >
                            {/* Background Banner */}
                            <div className="absolute inset-0">
                              <img
                                src={bannerSrc}
                                alt={subject.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2843] via-[#0F2843]/60 to-transparent" />
                            </div>

                            {/* Top Badge */}
                            <div className="relative z-10 p-5 flex items-center justify-between">
                              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/10">
                                {course.title}
                              </span>
                            </div>

                            {/* Bottom Card Content */}
                            <div className="relative z-10 p-6 space-y-3">
                              <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight truncate">
                                {subject.name}
                              </h3>

                              <button
                                onClick={() => openStudio(subject)}
                                className="w-full py-3.5 bg-white hover:bg-gray-100 text-[#0F2843] font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 group/btn"
                              >
                                <BookOpenIcon className="w-4 h-4 text-[#BB9E7F]" />
                                Manage Modules & Lessons
                                <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover/btn:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </StaffDashboardLayout>
  );
}
