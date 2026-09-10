import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.webp";
import signup_img from "../../../assets/images/Student_sign_up.webp";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { getStudentData, updateStudentData } from "./studentStorageHelper";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

const DURATION_OPTIONS = [
  { key: "monthly", label: "Monthly", months: 1, tag: "Standard", discount: "" },
  { key: "quarterly", label: "Quarterly", months: 3, tag: "Most Popular", discount: "Save 5%" },
  { key: "semi_annual", label: "Semi-Annual", months: 6, tag: "Save 5%", discount: "Save 5%" },
  { key: "annual", label: "Annual", months: 12, tag: "Best Value", discount: "Save 5%" },
];

export const StudentTrainingDuration = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [error, setError] = useState(false);

  /* ================= HELPERS ================= */
  const calculatePrice = useCallback((basePrice, months) => {
    const total = Number(basePrice || 0) * months;
    return months === 1 ? total : Math.round(total * 0.95);
  }, []);

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      setLoadingCourses(true);
      try {
        const studentData = getStudentData();
        const selectedTraining = studentData?.selectedTraining || [];

        if (!selectedTraining.length) {
          navigate("/register/student/training/selection");
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/courses`);
        const allCourses = res?.data?.courses || res?.data?.data || [];
        const activeCourses = allCourses.filter((c) => selectedTraining.includes(c.id));

        if (activeCourses.length === 0) {
          navigate("/register/student/training/selection");
          return;
        }

        setCourses(activeCourses);

        // Pre-populate with previous selections or default to quarterly (most popular)
        const savedDurations = studentData?.selectedDurations || {};
        const initMap = {};

        activeCourses.forEach((c) => {
          if (savedDurations[c.id]) {
            initMap[c.id] = savedDurations[c.id];
          } else {
            const defaultOption = DURATION_OPTIONS.find((d) => d.key === "quarterly") || DURATION_OPTIONS[0];
            initMap[c.id] = {
              duration: defaultOption.key,
              months: defaultOption.months,
              price: calculatePrice(c.price, defaultOption.months),
            };
          }
        });

        setSelectedDurations(initMap);
      } catch (err) {
        console.error("[StudentTrainingDuration] Failed to load courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    init();
  }, [navigate, calculatePrice]);

  /* ================= DURATION CHANGE ================= */
  const handleDurationChange = (course, durationKey) => {
    const option = DURATION_OPTIONS.find((d) => d.key === durationKey);
    if (!option) return;

    const price = calculatePrice(course.price, option.months);

    setSelectedDurations((prev) => ({
      ...prev,
      [course.id]: {
        duration: option.key,
        months: option.months,
        price,
      },
    }));
  };

  /* ================= TOTAL ================= */
  const totalAmount = useMemo(() => {
    return Object.values(selectedDurations)
      .filter(Boolean)
      .reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [selectedDurations]);

  /* ================= CONTINUE ================= */
  const handleContinue = () => {
    const valid = courses.every((course) => selectedDurations[course.id]);

    if (!valid) {
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    try {
      updateStudentData({
        selectedDurations,
      });

      navigate("/register/student/training/payment");
    } catch (err) {
      console.error("[StudentTrainingDuration] Failed to save durations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#F4F4F4] font-sans selection:bg-[#09314F] selection:text-white">
      {/* VISUAL IMAGE PANEL */}
      <div className="w-full lg:w-1/2 h-[200px] sm:h-[260px] lg:h-auto lg:min-h-screen relative order-1 lg:order-2 overflow-hidden shrink-0">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${signup_img})` }}
        >
          <div className="w-full h-full bg-gradient-to-t from-[#09314F]/80 via-transparent to-black/20 lg:bg-[#09314F]/25 backdrop-blur-[1px]" />
        </div>
      </div>

      {/* INTERACTIVE FORM AREA */}
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
              onClick={() => navigate("/register/student/subject/selection")}
              aria-label="Go back to Subject Selection"
              className="absolute left-0 p-2.5 sm:p-3 bg-white hover:bg-gray-50 text-[#09314F] rounded-2xl shadow-sm border border-gray-200/80 transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] tracking-tight text-center px-12">
              Select Duration
            </h1>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm mb-6 text-center max-w-[420px] mx-auto leading-relaxed">
            Choose your preferred learning period for each enrolled program. Multi-month plans receive a 5% discount.
          </p>

          {/* COURSE DURATION CARDS */}
          {loadingCourses ? (
            <div className="space-y-4 py-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6 mb-8">
              {courses.map((course) => {
                const currentSelection = selectedDurations[course.id]?.duration;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_10px_35px_rgba(9,49,79,0.06)] border border-gray-100"
                  >
                    <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
                      <h2 className="text-sm sm:text-base font-black text-[#09314F] uppercase tracking-wide truncate">
                        {course.title}
                      </h2>
                      <span className="text-xs font-bold text-gray-400">
                        Base: ₦{Number(course.price || 0).toLocaleString()}/mo
                      </span>
                    </div>

                    {/* DURATION PILLS (Adaptive grid: 2 cols on mobile, 4 cols on desktop) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {DURATION_OPTIONS.map((opt) => {
                        const isSelected = currentSelection === opt.key;
                        const planPrice = calculatePrice(course.price, opt.months);

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => handleDurationChange(course, opt.key)}
                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-between text-center min-h-[90px] active:scale-[0.98] ${
                              isSelected
                                ? "border-[#09314F] bg-blue-50/50 shadow-md shadow-[#09314F]/10 ring-1 ring-[#09314F]"
                                : "border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="w-full">
                              <span className={`text-[11px] font-black uppercase tracking-wider block ${
                                isSelected ? "text-[#09314F]" : "text-gray-600"
                              }`}>
                                {opt.label}
                              </span>
                              {opt.discount && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                                  {opt.discount}
                                </span>
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-black text-[#09314F] font-mono mt-2">
                              ₦{planPrice.toLocaleString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VALIDATION ERROR */}
          {error && (
            <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-red-600 text-xs sm:text-sm font-bold">
                Please choose a duration plan for all your selected examination courses.
              </p>
            </div>
          )}

          {/* TOTAL & ACTION BAR */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_10px_35px_rgba(9,49,79,0.06)] border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">
                Total Investment
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#09314F] font-mono">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={loading || loadingCourses || courses.length === 0}
              className={`w-full sm:w-auto flex-1 max-w-[280px] py-4 px-6 rounded-2xl font-black text-sm tracking-wide text-white transition-all shadow-lg active:scale-[0.98] ${
                loading || loadingCourses || courses.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-[#09314F] via-[#0c4066] to-[#E83831] hover:shadow-[#09314F]/25 hover:brightness-105"
              }`}
            >
              {loading ? "Proceeding..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTrainingDuration;
