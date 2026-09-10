import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import TC_logo from "../../../assets/images/tutorial_logo.webp";
import signup_img from "../../../assets/images/Student_sign_up.webp";
import axios from "axios";
import { getStudentData, getStudentDepartment, updateStudentData } from "./studentStorageHelper";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

export const StudentSubjectSelection = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [subjectsByCourse, setSubjectsByCourse] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState(null);

  const dropdownRef = useRef(null);

  /* ================= HELPERS ================= */
  const getSubjectLimit = (courseTitle = "") =>
    courseTitle.toLowerCase().includes("jamb") ? 4 : 9;

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      setLoadingSubjects(true);
      try {
        const studentData = getStudentData();
        const storedTraining = studentData?.selectedTraining || [];
        const department = getStudentDepartment();

        if (!storedTraining.length) {
          navigate("/register/student/training/selection");
          return;
        }

        // Fetch courses list
        const courseRes = await axios.get(`${API_BASE_URL}/api/courses`);
        const allCourses = courseRes?.data?.courses || courseRes?.data?.data || [];
        const activeCourses = allCourses.filter((c) => storedTraining.includes(c.id));

        if (activeCourses.length === 0) {
          console.warn("[SubjectSelection] None of the stored training IDs matched active courses.");
          navigate("/register/student/training/selection");
          return;
        }

        setSelectedCourses(activeCourses);

        const subjectMap = {};
        const selectionMap = {};
        const previouslySavedSubjects = studentData?.selectedSubjects || {};

        // Fetch subjects for each selected course
        for (const course of activeCourses) {
          try {
            const res = await axios.get(
              `${API_BASE_URL}/api/courses/${course.id}/subjects/${department}`
            );
            const subjects = res?.data?.subjects || res?.data?.data || [];
            subjectMap[course.id] = subjects;

            // Restore previous subject selection if valid, else empty array
            selectionMap[course.id] = previouslySavedSubjects[course.id] || [];
          } catch (err) {
            console.warn(`[SubjectSelection] Could not load subjects for ${course.title} under ${department}:`, err);
            subjectMap[course.id] = [];
            selectionMap[course.id] = [];
          }
        }

        setSubjectsByCourse(subjectMap);
        setSelectedSubjects(selectionMap);
      } catch (err) {
        console.error("[SubjectSelection] Initialization failed:", err);
        setToast({ type: "error", message: "Failed to load subjects. Please check your connection." });
      } finally {
        setLoadingSubjects(false);
      }
    };

    init();
  }, [navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ================= SUBJECT TOGGLE ================= */
  const toggleSubject = (courseId, subjectId) => {
    setSelectedSubjects((prev) => {
      const current = prev[courseId] || [];
      const course = selectedCourses.find((c) => c.id === courseId);
      const limit = getSubjectLimit(course?.title);

      if (current.includes(subjectId)) {
        return { ...prev, [courseId]: current.filter((id) => id !== subjectId) };
      }
      if (current.length >= limit) {
        setToast({ type: "error", message: `Maximum limit of ${limit} subjects reached for ${course?.title || "this course"}.` });
        return prev;
      }
      return { ...prev, [courseId]: [...current, subjectId] };
    });
  };

  /* ================= VALIDATE & PROCEED ================= */
  const handleContinue = () => {
    // Check if courses with available subjects have at least one chosen
    const incompleteCourse = selectedCourses.find((course) => {
      const available = subjectsByCourse[course.id] || [];
      const selected = selectedSubjects[course.id] || [];
      // If the course offers subject choices, student must pick at least 1
      return available.length > 0 && selected.length === 0;
    });

    if (incompleteCourse) {
      setToast({
        type: "error",
        message: `Please select subjects for ${incompleteCourse.title}.`,
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleProceed = () => {
    setLoading(true);
    try {
      updateStudentData({
        selectedSubjects,
      });
      navigate("/register/student/training/duration");
    } catch (err) {
      console.error("[SubjectSelection] Failed to persist subjects:", err);
      setToast({ type: "error", message: "Failed to save subject selections. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#F4F4F4] font-sans selection:bg-[#09314F] selection:text-white">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[300] px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-300 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          } animate-fadeIn`}
        >
          <div className="flex items-center gap-2.5 text-sm font-bold">
            {toast.type === "error" && <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />}
            {toast.message}
          </div>
        </div>
      )}

      {/* VISUAL IMAGE PANEL (Scales on desktop, fluid banner on mobile) */}
      <div className="w-full lg:w-1/2 h-[200px] sm:h-[260px] lg:h-auto lg:min-h-screen relative order-1 lg:order-2 overflow-hidden shrink-0">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${signup_img})` }}
        >
          <div className="w-full h-full bg-gradient-to-t from-[#09314F]/80 via-transparent to-black/20 lg:bg-[#09314F]/25 backdrop-blur-[1px]" />
        </div>
      </div>

      {/* INTERACTIVE FORM SECTION */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-8 md:py-12 order-2 lg:order-1 overflow-y-auto">
        <div className="w-full max-w-[min(100%,560px)] mx-auto my-auto flex flex-col">
          {/* LOGO */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src={TC_logo}
              alt="Tutorial Center"
              className="h-16 sm:h-20 w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={() => {
                if (window.confirm("Returning to the home page will clear your registration progress. Are you sure?")) {
                  navigate("/");
                }
              }}
            />
          </div>

          {/* HEADER BAR */}
          <div className="relative w-full flex items-center justify-center mb-6">
            <button
              type="button"
              onClick={() => navigate("/register/student/training/selection")}
              aria-label="Go back to Course Selection"
              className="absolute left-0 p-2.5 sm:p-3 bg-white hover:bg-gray-50 text-[#09314F] rounded-2xl shadow-sm border border-gray-200/80 transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] tracking-tight text-center px-12">
              Subject Selection
            </h1>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm mb-6 text-center max-w-[420px] mx-auto leading-relaxed">
            Select the specific subjects you will sit for in each of your chosen examination programs.
          </p>

          {/* SUBJECT SELECTION CONTAINER */}
          <div ref={dropdownRef} className="w-full bg-white rounded-3xl shadow-[0_10px_35px_rgba(9,49,79,0.06)] border border-gray-100 p-4 sm:p-6 mb-8 relative z-10">
            {loadingSubjects ? (
              <div className="space-y-4 py-8">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : selectedCourses.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm font-semibold">
                No courses selected. Please return to the previous screen.
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCourses.map((course) => {
                  const selectedIds = selectedSubjects[course.id] || [];
                  const subjects = subjectsByCourse[course.id] || [];
                  const limit = getSubjectLimit(course.title);
                  const isOpen = openDropdown === course.id;
                  const isAutoCurriculum = subjects.length === 0;

                  return (
                    <div
                      key={course.id}
                      className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 border border-gray-200/70 hover:border-gray-300 transition-all relative"
                    >
                      {/* COURSE HEADER */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs sm:text-sm font-black text-[#09314F] uppercase tracking-wide truncate">
                          {course.title}
                        </span>
                        {!isAutoCurriculum && (
                          <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                            selectedIds.length === limit
                              ? "bg-emerald-100 text-emerald-800"
                              : selectedIds.length > 0
                              ? "bg-blue-100 text-[#09314F]"
                              : "bg-gray-200 text-gray-600"
                          }`}>
                            {selectedIds.length} / {limit} chosen
                          </span>
                        )}
                      </div>

                      {/* SELECTION TRIGGER OR DEFAULT BADGE */}
                      {isAutoCurriculum ? (
                        <div className="py-2 px-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-[#09314F] font-bold text-center">
                          Standard Comprehensive Curriculum (All Core Subjects Included)
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            id={`toggle-${course.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(isOpen ? null : course.id);
                            }}
                            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#09314F] transition-all flex items-center justify-between text-left shadow-sm active:scale-[0.99]"
                          >
                            <span className="text-xs sm:text-sm font-bold text-gray-700 truncate pr-2">
                              {selectedIds.length > 0
                                ? subjects
                                    .filter((s) => selectedIds.includes(s.id))
                                    .map((s) => s.name)
                                    .join(", ")
                                : "Click to select subjects"}
                            </span>
                            <span className="text-xs font-black text-[#09314F] shrink-0">
                              {isOpen ? "▲" : "▼"}
                            </span>
                          </button>

                          {/* DROPDOWN OVERLAY (Mobile-safe max-height and scrolling) */}
                          {isOpen && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 max-h-[260px] overflow-y-auto animate-fadeIn">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                Choose up to {limit} subjects
                              </p>
                              <div className="space-y-1.5">
                                {subjects.map((subject) => {
                                  const isSelected = selectedIds.includes(subject.id);
                                  const isLimitReached = !isSelected && selectedIds.length >= limit;

                                  return (
                                    <button
                                      key={subject.id}
                                      type="button"
                                      disabled={isLimitReached}
                                      onClick={() => toggleSubject(course.id, subject.id)}
                                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        isSelected
                                          ? "bg-[#09314F] text-white shadow-sm"
                                          : isLimitReached
                                          ? "opacity-40 bg-gray-50 text-gray-400 cursor-not-allowed"
                                          : "hover:bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      <span>{subject.name}</span>
                                      {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-[#76D287]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={loadingSubjects || selectedCourses.length === 0}
            className={`w-full py-4 sm:py-4.5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wide text-white transition-all shadow-lg active:scale-[0.98] ${
              loadingSubjects || selectedCourses.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-[#09314F] via-[#0c4066] to-[#E83831] hover:shadow-[#09314F]/25 hover:brightness-105"
            }`}
          >
            Review & Continue
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#09314F]/75 backdrop-blur-sm flex items-center justify-center z-[200] p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl sm:text-2xl font-black text-[#09314F] tracking-tight">
                Confirm Subject Selection
              </h2>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6 overflow-y-auto pr-1">
              {selectedCourses.map((course) => {
                const subjects =
                  subjectsByCourse[course.id]?.filter((s) =>
                    selectedSubjects[course.id]?.includes(s.id)
                  ) || [];

                return (
                  <div key={course.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5">
                      {course.title}
                    </h3>
                    {subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {subjects.map((s) => (
                          <span
                            key={s.id}
                            className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-[#09314F] shadow-sm border border-gray-200"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-gray-500">
                        Standard Curriculum
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
              >
                Make Changes
              </button>
              <button
                type="button"
                onClick={handleProceed}
                disabled={loading}
                className="flex-[1.5] py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#09314F] hover:bg-[#0c4066] shadow-md shadow-[#09314F]/25 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Confirm & Proceed to Duration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSubjectSelection;
