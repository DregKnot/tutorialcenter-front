import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import otp_img_student from "../../../assets/images/otpStudentpic.webp";
import TC_logo from "../../../assets/images/tutorial_logo.webp";
import axios from "axios";
import { getStudentData, updateStudentData } from "./studentStorageHelper";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

const EXAM_OPTIONS = [
  { id: "jamb", key: "JAMB", label: "JAMB", subtitle: "UTME Preparation", isOlevel: false },
  { id: "waec", key: "WAEC", label: "WAEC", subtitle: "O-Levels Track", isOlevel: true, track: "WAEC" },
  { id: "neco", key: "NECO", label: "NECO", subtitle: "O-Levels Track", isOlevel: true, track: "NECO" },
  { id: "gce", key: "GCE", label: "GCE", subtitle: "O-Levels Track", isOlevel: true, track: "GCE" },
];

export default function StudentTrainingSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courses, setCourses] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [examError, setExamError] = useState(false);
  const [selectedExams, setSelectedExams] = useState([]);

  /* ================= FETCH COURSES ================= */
  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    setFetchError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`);
      const fetched = response?.data?.courses || response?.data?.data || [];
      setCourses(fetched);

      // Restore previously chosen exams if student navigated back
      const existing = getStudentData();
      const restored = [];
      if (existing?.selectedTraining && Array.isArray(existing.selectedTraining)) {
        if (existing.selectedTraining.includes(1)) restored.push("jamb");
        if (existing.selectedExamTrack) {
          const trackKey = existing.selectedExamTrack.toLowerCase();
          if (["waec", "neco", "gce"].includes(trackKey)) restored.push(trackKey);
        } else if (existing.selectedTraining.some(id => [2, 3, 4].includes(Number(id)))) {
          restored.push("waec");
        }
      }
      if (restored.length > 0) {
        setSelectedExams(restored);
      }
    } catch (error) {
      console.error("[StudentTrainingSelection] Failed to fetch courses:", error);
      setFetchError("Unable to load examination courses. Please check your connection and try again.");
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /* ================= TOGGLE SELECTION (MUTUAL EXCLUSION FOR O-LEVELS) ================= */
  const toggleExam = (examId) => {
    setExamError(false);
    const target = EXAM_OPTIONS.find((e) => e.id === examId);
    if (!target) return;

    setSelectedExams((prev) => {
      const alreadySelected = prev.includes(examId);
      if (alreadySelected) {
        return prev.filter((id) => id !== examId);
      }
      if (target.isOlevel) {
        // When WAEC is picked, NECO and GCE deactivate (and vice versa)
        const withoutOtherOlevels = prev.filter((id) => {
          const opt = EXAM_OPTIONS.find((e) => e.id === id);
          return !opt?.isOlevel;
        });
        return [...withoutOtherOlevels, examId];
      }
      // JAMB can be toggled independently alongside any O-Level option
      return [...prev, examId];
    });
  };

  /* ================= CONTINUE ================= */
  const handleContinue = async () => {
    if (selectedExams.length === 0) {
      setExamError(true);
      return;
    }

    setExamError(false);
    setLoading(true);

    try {
      const jambCourse = courses.find((c) => Number(c.id) === 1 || c.title?.toLowerCase().includes("jamb")) || {
        id: 1,
        title: "JAMB",
      };
      // Course ID 4 is the authoritative backend O'Levels course
      const olevelCourse = courses.find((c) => Number(c.id) === 4 || c.title?.toLowerCase().includes("level") || c.title?.toLowerCase().includes("gce")) || {
        id: 4,
        title: "O'Levels",
      };

      const finalCourseIds = [];
      const chosenOlevelId = selectedExams.find((id) => {
        const opt = EXAM_OPTIONS.find((e) => e.id === id);
        return opt?.isOlevel;
      });
      const chosenTrack = chosenOlevelId ? EXAM_OPTIONS.find((e) => e.id === chosenOlevelId)?.track : null;

      if (selectedExams.includes("jamb")) {
        finalCourseIds.push(Number(jambCourse.id));
      }
      if (chosenOlevelId) {
        finalCourseIds.push(Number(olevelCourse.id));
      }

      const availableTrainings = [
        { ...jambCourse, id: Number(jambCourse.id), title: "JAMB" },
        { ...olevelCourse, id: Number(olevelCourse.id), title: chosenTrack ? `O'Levels (${chosenTrack})` : "O'Levels" },
      ];

      // Safely persist selected trainings and courses
      updateStudentData({
        selectedTraining: finalCourseIds,
        selectedExamTrack: chosenTrack,
        availableTrainings,
      });

      navigate("/register/student/subject/selection");
    } catch (error) {
      console.error("[StudentTrainingSelection] Failed to persist selection:", error);
      setExamError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#F4F4F4] font-sans selection:bg-[#09314F] selection:text-white">
      {/* VISUAL HERO SECTION (Collapses into clean banner on mobile/tablet) */}
      <div className="w-full lg:w-1/2 h-[200px] sm:h-[260px] lg:h-auto lg:min-h-screen relative order-1 lg:order-2 overflow-hidden shrink-0">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${otp_img_student})` }}
        >
          <div className="w-full h-full bg-gradient-to-t from-[#09314F]/80 via-transparent to-black/20 lg:bg-[#09314F]/25 backdrop-blur-[1px]" />
        </div>
      </div>

      {/* INTERACTIVE FORM SECTION (Elastic container that shrinks/expands fluidly) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-8 md:py-12 order-2 lg:order-1">
        <div className="w-full max-w-[min(100%,540px)] mx-auto my-auto flex flex-col">
          {/* LOGO */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src={TC_logo}
              alt="Tutorial Center Logo"
              className="h-16 sm:h-20 w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={() => {
                if (window.confirm("Returning to the home page will clear your registration progress. Are you sure?")) {
                  navigate("/");
                }
              }}
            />
          </div>

          {/* HEADER BAR WITH BACK NAVIGATION */}
          <div className="relative w-full flex items-center justify-center mb-6">
            <button
              type="button"
              onClick={() => navigate("/register/student/biodata")}
              aria-label="Go back to Biodata"
              className="absolute left-0 p-2.5 sm:p-3 bg-white hover:bg-gray-50 text-[#09314F] rounded-2xl shadow-sm border border-gray-200/80 transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] tracking-tight text-center px-12">
              Select Training
            </h1>
          </div>

          {/* MAIN CARD CONTAINER */}
          <div className="bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-[0_10px_35px_rgba(9,49,79,0.06)] border border-gray-100 flex flex-col">
            <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8 text-center max-w-[380px] mx-auto leading-relaxed">
              Select the examination(s) you are preparing to write. You can select multiple courses to bundle your preparation.
            </p>

            {/* FETCH ERROR STATE */}
            {fetchError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
                <p className="text-xs sm:text-sm font-bold text-red-600 mb-3">{fetchError}</p>
                <button
                  type="button"
                  onClick={fetchCourses}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#09314F] text-white rounded-xl text-xs font-bold shadow hover:bg-[#0c4066] transition-all"
                >
                  <ArrowPathIcon className="h-4 w-4" /> Try Again
                </button>
              </div>
            )}

            {/* LOADING SKELETONS */}
            {loadingCourses && !fetchError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-[58px] rounded-2xl bg-gray-100 animate-pulse border border-gray-200/60"
                  />
                ))}
              </div>
            )}

            {/* COURSES RESPONSIVE GRID (Adapts from 1-col on mobile to 2-col on tablet/desktop) */}
            {!loadingCourses && !fetchError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full mb-8">
                {EXAM_OPTIONS.map((exam) => {
                  const isSelected = selectedExams.includes(exam.id);
                  const hasOtherOlevelSelected =
                    exam.isOlevel &&
                    selectedExams.some((id) => id !== exam.id && EXAM_OPTIONS.find((e) => e.id === id)?.isOlevel);

                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => toggleExam(exam.id)}
                      className={`min-h-[64px] rounded-2xl font-bold flex items-center justify-between px-4 sm:px-5 transition-all duration-200 text-left border-2 active:scale-[0.98] ${
                        isSelected
                          ? "bg-[#09314F] text-white border-[#09314F] shadow-md shadow-[#09314F]/20 ring-2 ring-[#09314F]/20"
                          : hasOtherOlevelSelected
                          ? "bg-gray-50/50 text-gray-400 border-gray-100 hover:bg-gray-100/70"
                          : "bg-gray-50/80 hover:bg-gray-100/90 text-gray-700 border-gray-200/80"
                      }`}
                    >
                      <div className="flex flex-col pr-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black uppercase tracking-wide truncate">
                            {exam.label}
                          </span>
                          {exam.isOlevel && (
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-[#09314F]"
                              }`}
                            >
                              O-Levels
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? "text-gray-300" : "text-gray-400"
                          }`}
                        >
                          {exam.subtitle}
                        </span>
                      </div>
                      {isSelected ? (
                        <CheckCircleIcon className="h-6 w-6 text-[#76D287] shrink-0 fill-current" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ERROR VALIDATION MESSAGE */}
            {examError && (
              <div className="p-3 mb-6 bg-red-50 border border-red-200/80 rounded-xl text-center animate-shake">
                <p className="text-red-600 text-xs sm:text-sm font-bold">
                  Please select at least one examination to continue.
                </p>
              </div>
            )}

            {/* ACTION BUTTON CONTAINER */}
            <div className="w-full">
              <button
                type="button"
                onClick={handleContinue}
                disabled={loading || loadingCourses || courses.length === 0}
                className={`w-full py-4 sm:py-4.5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wide text-white transition-all shadow-lg active:scale-[0.98] ${
                  loading || loadingCourses || courses.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-[#09314F] via-[#0c4066] to-[#E83831] hover:shadow-[#09314F]/25 hover:brightness-105"
                }`}
              >
                {loading ? "Saving Selection..." : "Continue to Subject Selection"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
