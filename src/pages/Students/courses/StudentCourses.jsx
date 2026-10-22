import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../../../components/private/Students/DashboardLayout.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function StudentCourses() {
  const navigate = useNavigate();
  const { token, student } = useAuth();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

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
      setError("Failed to load your courses and subjects.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  return (
    <DashboardLayout pagetitle="Interactive Curriculum">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#09314F] to-[#0F2843] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-amber-300 border border-white/10">
              <GraduationCap className="w-3.5 h-3.5" />
              Self-Paced Learning Path
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Interactive Courses & Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              Select any of your enrolled subjects to access step-by-step video modules, lecture slides, and practice mastery quizzes.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-56 bg-gray-100 dark:bg-gray-800/50 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-3xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Notice</h3>
            <p className="text-sm text-red-600 dark:text-red-300 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchEnrolledCourses}
              className="mt-3 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-16 text-center space-y-4">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No Enrolled Subjects Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You are not currently enrolled in any academic courses. Please check your training selection or contact your advisor.
            </p>
          </div>
        )}

        {/* Course Programs & Subjects */}
        {!loading && !error && courses.length > 0 && (
          <div className="space-y-10">
            {courses.map((course) => {
              const subjects = course.subjects || [];

              return (
                <div key={course.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-6 bg-[#09314F] dark:bg-blue-400 rounded-full" />
                    <h2 className="text-xl font-black text-[#09314F] dark:text-white">
                      {course.title || "Academic Program"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((sub) => {
                      const progress = Math.round(sub.progress || 0);

                      return (
                        <div
                          key={sub.id}
                          className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="w-12 h-12 rounded-2xl bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-white flex items-center justify-center font-black">
                                <BookOpen className="w-6 h-6 text-[#09314F] dark:text-blue-400" />
                              </div>
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                {progress}% Complete
                              </span>
                            </div>

                            <div>
                              <h3 className="text-lg font-black text-[#09314F] dark:text-white group-hover:text-[#E83831] transition-colors">
                                {sub.name}
                              </h3>
                              <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                Complete module breakdown, interactive video lessons, and test assessments.
                              </p>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#09314F] to-[#E83831] rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="pt-6 mt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              Self-Paced Track
                            </span>
                            <button
                              onClick={() => navigate(`/student/courses/subject/${sub.id}`)}
                              className="px-4 py-2 bg-[#09314F] hover:bg-[#0A2239] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                            >
                              Open Curriculum
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
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
    </DashboardLayout>
  );
}
