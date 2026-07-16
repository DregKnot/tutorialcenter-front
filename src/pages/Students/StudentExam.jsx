import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "@iconify/react";
import ExamInterface from "../../components/private/Students/StudentsExamFlow/ExamInterface.jsx";
import ExamHistory from "../../components/private/Students/StudentsExamFlow/ExamHistory.jsx";

export default function StudentExam() {
  const { token: authToken } = useAuth();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  // State Management
  const [courses, setCourses] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selections
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [timer, setTimer] = useState("50"); // default value

  // UI States
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1080);
  const [toast, setToast] = useState(null);
  const [startingExam, setStartingExam] = useState(false);
  const [showExamInterface, setShowExamInterface] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyAttemptIdToOpen, setHistoryAttemptIdToOpen] = useState(null);

  // Clock picker modal state
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [modalHours, setModalHours] = useState(0);
  const [modalMinutes, setModalMinutes] = useState(50);

  // Warning modal state
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  // Sync modal controls when modal is opened
  useEffect(() => {
    if (isClockModalOpen) {
      const totalMins = parseInt(timer, 10) || 50;
      setModalHours(Math.floor(totalMins / 60));
      setModalMinutes(totalMins % 60);
    }
  }, [isClockModalOpen, timer]);

  // References
  const subjectRowRef = useRef(null);


  // Handle responsiveness breakpoints
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1080);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clear toast helper
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Fetch initial data (Courses and Available Exams in parallel)
  const fetchInitialData = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    setError(null);
    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      };

      const [coursesRes, availableRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/students/courses`, { headers }),
        axios.get(`${API_BASE_URL}/api/students/exams/available`, { headers }),
      ]);

      console.log("Students Courses Response:", coursesRes.data);
      console.log("Available Exams Response:", availableRes.data);

      const coursesData = coursesRes.data?.courses || coursesRes.data?.data || [];
      const availableData = Array.isArray(availableRes.data)
        ? availableRes.data
        : availableRes.data?.exams || availableRes.data?.data || [];

      setCourses(coursesData);
      setAvailableExams(availableData);

      // Course is unselected by default
    } catch (err) {
      console.error("Failed to load initial exam data:", err);
      setError("Failed to load active courses and available exams. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, authToken]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Cross-reference: Check if subject is available in availableExams
  const isSubjectAvailable = (subjectId) => {
    if (!availableExams || availableExams.length === 0) return false;
    return availableExams.some(
      (exam) =>
        String(exam.subject_id) === String(subjectId) ||
        String(exam.subject?.id) === String(subjectId) ||
        String(exam.id) === String(subjectId)
    );
  };

  // Filter available years for a given subject ID
  const getAvailableYearsForSubject = (subjectId) => {
    if (!availableExams || availableExams.length === 0) return [];
    
    // Find all exams matching this subject
    const matched = availableExams.filter(
      (exam) =>
        String(exam.subject_id) === String(subjectId) ||
        String(exam.subject?.id) === String(subjectId) ||
        String(exam.id) === String(subjectId)
    );

    // Extract year information securely
    const yearsMapped = matched.map((exam) => {
      const yearId = exam.exam_year_id || exam.exam_year?.id || exam.id;
      const yearValue = exam.year || exam.exam_year?.year || exam.exam_year_name || "Unknown Year";
      return {
        exam_year_id: yearId,
        year: yearValue,
      };
    });

    // Remove duplicates just in case
    const seen = new Set();
    return yearsMapped.filter((item) => {
      const key = `${item.exam_year_id}-${item.year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Reset sub-selections when course changes
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedSubject(null);
    setSelectedYear(null);
  };

  // Handle subject select and fetch years
  const handleSubjectSelect = (subject) => {
    if (!isSubjectAvailable(subject.id)) {
      setToast({
        type: "warning",
        message: `Practice questions for ${subject.name || subject.title} are not available at the moment.`,
      });
      return;
    }
    setSelectedSubject(subject);
    setSelectedYear(null);
  };

  // Handle Year select
  const handleYearSelect = (e) => {
    const yearId = e.target.value;
    if (!yearId) {
      setSelectedYear(null);
      return;
    }
    const yearsList = getAvailableYearsForSubject(selectedSubject?.id);
    const foundYear = yearsList.find((y) => String(y.exam_year_id) === String(yearId));
    
    if (foundYear) {
      setSelectedYear(foundYear);
    }
  };

  // Start Practice Action Integration
  const handleStartPractice = async () => {
    if (!selectedCourse || !selectedSubject || !selectedYear) {
      setToast({
        type: "warning",
        message: "Please complete all selections before starting.",
      });
      return;
    }

    const matchingExam = availableExams.find(
      (exam) =>
        (String(exam.subject_id) === String(selectedSubject.id) ||
         String(exam.subject?.id) === String(selectedSubject.id)) &&
        (String(exam.exam_year_id) === String(selectedYear.exam_year_id) ||
         String(exam.exam_year?.id) === String(selectedYear.exam_year_id) ||
         String(exam.id) === String(selectedYear.exam_year_id))
    );

    if (!matchingExam) {
      setToast({
        type: "error",
        message: "Could not find a valid exam matching your selection.",
      });
      return;
    }

    const examYearId = matchingExam.id;

    setStartingExam(true);
    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/students/exams/start/${examYearId}`,
        { timer: parseInt(timer, 10) },
        { headers }
      );

      console.log("Start Exam API Response:", response.data);
      const attemptId = response.data?.attempt?.id || response.data?.attempt_id || response.data?.id;

      if (!attemptId) {
        throw new Error("Attempt ID not returned from start API.");
      }

      setActiveAttemptId(attemptId);
      setShowExamInterface(true);
      setToast({
        type: "success",
        message: "Practice session successfully started!",
      });
    } catch (err) {
      console.error("Failed to start practice:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to start practice attempt. Please try again.",
      });
    } finally {
      setStartingExam(false);
    }
  };

  // Dynamic values
  const displayTimer = (() => {
    const mins = parseInt(timer, 10) || 50;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0) {
      return `${hrs} hr${hrs > 1 ? 's' : ''} ${m} min${m > 1 ? 's' : ''}`;
    }
    return `${m} mins`;
  })();

  return (
    <DashboardLayout pagetitle="Exam Practice" isExamActive={showExamInterface && !!activeAttemptId} hideRightPanel={true}>
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[2000] px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm transition-all duration-300 flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-[#76D287]"
              : toast.type === "warning"
              ? "bg-[#BB9E7F]"
              : "bg-[#E83831]"
          }`}
        >
          <Icon
            icon={
              toast.type === "success"
                ? "lucide:check-circle"
                : toast.type === "warning"
                ? "lucide:alert-triangle"
                : "lucide:x-circle"
            }
            className="w-5 h-5 shrink-0"
          />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Preparing Overlay */}
      {startingExam && (
        <div className="fixed inset-0 z-[2000] bg-[#09314F]/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
          <div className="w-20 h-20 border-4 border-t-[#C5A97A] border-[#BB9E7F]/20 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-[#C5A97A] mb-2">
            Preparing Exam
          </h2>
          <p className="text-sm text-gray-300 animate-pulse">
            Configuring practice environment and loading questions...
          </p>
        </div>
      )}

      <div className="w-full pb-20 px-0 lg:px-4 transition-all duration-300">
        {showExamInterface && activeAttemptId ? (
          <ExamInterface
            attemptId={activeAttemptId}
            selectedCourse={selectedCourse}
            selectedSubject={selectedSubject}
            timer={timer}
            onBack={() => {
              setShowExamInterface(false);
              setActiveAttemptId(null);
            }}
            onReviewExam={(attemptId) => {
              setShowExamInterface(false);
              setActiveAttemptId(null);
              setHistoryAttemptIdToOpen(attemptId);
              setShowHistory(true);
            }}
          />
        ) : showHistory ? (
          <ExamHistory
            availableExams={availableExams}
            initialExpandedAttemptId={historyAttemptIdToOpen}
            onBack={() => {
              setShowHistory(false);
              setHistoryAttemptIdToOpen(null);
            }}
          />
        ) : loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#C5A97A] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
              Syncing Practice Center...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white dark:bg-[#09314F]/40 rounded-3xl border border-red-200 dark:border-red-900/30 p-8 shadow-sm">
            <Icon icon="lucide:cloud-alert" className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#09314F] dark:text-white mb-2">Sync Error</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchInitialData}
              className="px-6 py-3 bg-[#09314F] text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#0a3d63] transition-all"
            >
              Retry Sync
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Action Row */}
            <div className="flex items-center justify-between gap-4">
              <div>
                {/* Practice Center title removed - header handles this */}
              </div>
              <button
                onClick={() => {
                  setHistoryAttemptIdToOpen(null);
                  setShowHistory(true);
                }}
                className="px-5 py-2.5 bg-[#09314F]/5 dark:bg-white/5 hover:bg-[#09314F]/10 border border-[#C5A97A]/30 hover:border-[#C5A97A] text-[#09314F] dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
              >
                <Icon icon="lucide:history" className="w-4 h-4 text-[#C5A97A]" />
                <span>Practice History</span>
              </button>
            </div>

            {/* 1. Welcoming Instructions Box */}
            <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 md:p-8 border border-[#C5A97A]/30 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A97A]/10 to-transparent rounded-bl-full pointer-events-none"></div>
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-[#09314F]/5 dark:bg-white/5 rounded-2xl shrink-0">
                  <Icon icon="lucide:info" className="w-6 h-6 text-[#C5A97A]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#09314F] dark:text-white uppercase tracking-tight mb-2">
                    Exam Practice Center
                  </h3>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
                    <p>Welcome to your customized practice portal. Here is how to get started:</p>
                    <ul className="space-y-2 mt-2">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A97A] shrink-0 mt-2"></span>
                        <span>Choose your enrolled course and preferred subject from the lists below.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A97A] shrink-0 mt-2"></span>
                        <span>Select the target past question year to fetch relevant datasets.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A97A] shrink-0 mt-2"></span>
                        <span>
                          Configure your timer between{" "}
                          <span className="font-bold text-[#09314F] dark:text-white">10 and 120 minutes</span> to fit your preferred schedule.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A97A] shrink-0 mt-2"></span>
                        <span>
                          Click the <span className="font-bold text-[#09314F] dark:text-white">Practice History</span> button above to review your past performances and explanations.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Course Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#C5A97A]"></span>
                <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  1. Choose Course
                </h4>
              </div>

              {courses.length === 0 ? (
                <div className="p-6 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-400 font-bold">No ongoing courses found.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Left and right fade overlays */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#E6E9EC] dark:from-gray-900 to-transparent pointer-events-none z-10 opacity-30"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#E6E9EC] dark:from-gray-900 to-transparent pointer-events-none z-10 opacity-30"></div>

                  <div
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 select-none"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {courses.map((item, idx) => {
                      const title = item.course?.title || item.title || "Course";
                      const isSelected = selectedCourse && (item.enrollment_id === selectedCourse.enrollment_id || item.id === selectedCourse.id);
                      return (
                        <div
                          key={item.enrollment_id || item.id || idx}
                          onClick={() => handleCourseSelect(item)}
                          className={`min-w-[240px] md:min-w-[280px] p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative group flex items-start gap-4 shadow-sm shrink-0 ${
                            isSelected
                              ? "bg-[#09314F]/10 dark:bg-[#09314F]/60 border-[#C5A97A] ring-2 ring-[#C5A97A]/20"
                              : "bg-white dark:bg-[#09314F]/30 border-gray-100 dark:border-[#09314F] hover:border-gray-200 dark:hover:border-blue-800"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-xl shrink-0 transition-colors ${
                              isSelected
                                ? "bg-[#09314F] text-white dark:bg-blue-600"
                                : "bg-gray-50 dark:bg-[#06243A] text-gray-400 group-hover:text-gray-600"
                            }`}
                          >
                            <Icon icon="mdi:book-open-page-variant" className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h4
                              className={`font-black uppercase tracking-tight text-sm truncate ${
                                isSelected ? "text-[#09314F] dark:text-white" : "text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {title}
                            </h4>
                            <p className="text-[11px] text-gray-400 font-bold uppercase mt-1">
                              {item.subjects?.length || 0} subjects enrolled
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-3 right-3 text-[#C5A97A]">
                              <Icon icon="lucide:check-circle" className="w-5 h-5 animate-scale-in" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Subject Horizontally Scrollable Row */}
            {selectedCourse && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between w-full gap-2 mb-4 max-md:flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#C5A97A] shrink-0"></span>
                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      2. Select Subject
                    </h4>
                  </div>
                  {/* Dynamic Device Hint Text */}
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider animate-pulse text-right shrink-0 max-md:basis-full">
                    {isDesktop ? "Scroll to select subjects" : "Swipe to select subjects"}
                  </span>
                </div>

                {!selectedCourse.subjects || selectedCourse.subjects.length === 0 ? (
                  <div className="p-6 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
                    <p className="text-sm text-gray-400 font-bold">No subjects mapped to this course.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Fade Overlays for elegant premium scroll effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#E6E9EC] dark:from-gray-900 to-transparent pointer-events-none z-10 opacity-30"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#E6E9EC] dark:from-gray-900 to-transparent pointer-events-none z-10 opacity-30"></div>

                    <div
                      ref={subjectRowRef}
                      className="flex gap-4 overflow-x-auto py-3 pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 select-none cursor-grab"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {selectedCourse.subjects.map((sub, idx) => {
                        const name = sub.name || sub.title || "Subject";
                        const available = isSubjectAvailable(sub.id);
                        const isSelected = selectedSubject && String(selectedSubject.id) === String(sub.id);
                        const bannerUrl = sub.banner
                          ? (sub.banner.startsWith("http") ? sub.banner : `${API_BASE_URL}/storage/${sub.banner}`)
                          : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

                        return (
                          <div
                            key={sub.id || idx}
                            onClick={() => available && handleSubjectSelect(sub)}
                            className={`w-[180px] md:w-[210px] shrink-0 p-4 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative select-none group overflow-visible ${
                              !available
                                ? "bg-gray-100 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/30 cursor-not-allowed opacity-60"
                                : isSelected
                                ? "bg-[#09314F] text-white border-transparent ring-4 ring-[#C5A97A]/30 scale-[1.02] shadow-md"
                                : "bg-white dark:bg-[#09314F]/40 border-gray-100 dark:border-[#09314F] hover:border-gray-200 hover:scale-[1.01] cursor-pointer shadow-sm"
                            }`}
                          >
                            {/* Overlay for unavailable subjects */}
                            {!available && (
                              <div className="absolute inset-0 bg-black/60 dark:bg-black/75 rounded-3xl flex items-center justify-center p-4 z-20 text-center animate-fade-in">
                                <span className="text-[11px] font-bold text-white uppercase tracking-widest leading-relaxed">
                                  Not available
                                </span>
                              </div>
                            )}

                            {/* Banner Header Image */}
                            <div className="w-full h-24 rounded-2xl overflow-hidden mb-3 relative shrink-0">
                              <img
                                src={bannerUrl}
                                alt={name}
                                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/10 dark:bg-black/35 pointer-events-none transition-opacity duration-700 group-hover:bg-black/5 dark:group-hover:bg-black/20"></div>
                              {isSelected && (
                                <div className="absolute top-2.5 right-2.5 bg-[#C5A97A] text-white p-1 rounded-full shadow-md flex items-center justify-center animate-scale-in">
                                  <Icon icon="lucide:check" className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            <div className="mt-1 min-w-0 w-full">
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#C5A97A] block">
                                SUBJECT
                              </span>
                              <h4 className="text-sm font-black uppercase tracking-tight truncate mt-1 w-full">
                                {name}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Sub-Configuration (Year & Timer) */}
            {selectedSubject && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {/* Year Selection Card */}
                <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A97A]"></span>
                      <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        3. Exam Year
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                      Select the year of past questions you want to practice.
                    </p>
                  </div>

                  <div>
                    <select
                      value={selectedYear?.exam_year_id || ""}
                      onChange={handleYearSelect}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#06243A] border border-gray-200 dark:border-[#1a4a75] rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-[#BB9E7F] focus:ring-1 focus:ring-[#BB9E7F]/30 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="dark:bg-[#09314F]">
                        Choose Exam Year
                      </option>
                      {getAvailableYearsForSubject(selectedSubject.id).map((yearObj) => (
                        <option
                          key={yearObj.exam_year_id}
                          value={yearObj.exam_year_id}
                          className="dark:bg-[#09314F] text-gray-800 dark:text-gray-100"
                        >
                          {yearObj.year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Practice Timer Card */}
                <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A97A]"></span>
                      <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        4. Practice Timer
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                      Customize duration to fit your practice schedule.
                    </p>
                  </div>

                  <div 
                    onClick={() => setIsClockModalOpen(true)}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-[#06243A] border border-gray-200 dark:border-[#1a4a75] rounded-xl text-sm font-bold text-[#09314F] dark:text-white outline-none focus:border-[#BB9E7F] focus:ring-1 focus:ring-[#BB9E7F]/30 transition-all cursor-pointer flex items-center justify-between group/time"
                  >
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:clock" className="w-5 h-5 text-[#C5A97A]" />
                      <span>{displayTimer}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#C5A97A] tracking-wider group-hover/time:underline">
                      Set Duration
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Summary & Action Area */}
            {selectedYear && (
              <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#09314F] shadow-sm animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Summary Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:sliders-horizontal" className="w-5 h-5 text-[#C5A97A]" />
                      <h4 className="text-[15px] font-black uppercase tracking-tight text-[#09314F] dark:text-white">
                        Practice Session Summary
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                      <p>
                        Course:{" "}
                        <span className="text-[#09314F] dark:text-white font-black uppercase ml-1">
                          {selectedCourse.course?.title || selectedCourse.title}
                        </span>
                      </p>
                      <p>
                        Subject:{" "}
                        <span className="text-[#09314F] dark:text-white font-black uppercase ml-1">
                          {selectedSubject.name || selectedSubject.title}
                        </span>
                      </p>
                      <p>
                        Year:{" "}
                        <span className="text-[#09314F] dark:text-white font-black ml-1">
                          {selectedYear.year}
                        </span>
                      </p>
                      <p>
                        Timer:{" "}
                        <span className="text-[#09314F] dark:text-white font-black ml-1">
                          {displayTimer}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Start Exam Button */}
                  <div className="w-full md:w-auto">
                    <button
                      onClick={() => setIsWarningModalOpen(true)}
                      disabled={startingExam}
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98] disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all shrink-0"
                    >
                      <span>Start Practice Session</span>
                      <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Floating Clock Picker Modal */}
      {isClockModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsClockModalOpen(false)} />
          <div className="relative bg-white dark:bg-[#09314F] border border-[#C5A97A]/30 rounded-[32px] p-8 w-[90%] max-w-md shadow-2xl z-10 animate-scale-in text-[#09314F] dark:text-white">
            <div className="text-center mb-6">
              <Icon icon="lucide:clock" className="w-10 h-10 text-[#C5A97A] mx-auto mb-2" />
              <h3 className="text-lg font-black uppercase tracking-widest text-[#09314F] dark:text-white">
                Choose Practice Time
              </h3>
              <p className="text-xs text-gray-400 mt-1">Set hours and minutes for your exam session</p>
            </div>

            {/* Hours and Minutes Adjuster */}
            <div className="flex items-center justify-center gap-6 bg-gray-50 dark:bg-[#06243A] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
              {/* Hours section */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalHours(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#09314F] border border-gray-200 dark:border-[#1a4a75] flex items-center justify-center font-bold shadow-sm hover:border-[#C5A97A] active:scale-95 transition-all text-gray-700 dark:text-white"
                  >
                    -
                  </button>
                  <span className="text-3xl font-black font-mono w-12 text-center">{String(modalHours).padStart(2, '0')}</span>
                  <button
                    type="button"
                    onClick={() => setModalHours(prev => Math.min(12, prev + 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#09314F] border border-gray-200 dark:border-[#1a4a75] flex items-center justify-center font-bold shadow-sm hover:border-[#C5A97A] active:scale-95 transition-all text-gray-700 dark:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-3xl font-black text-gray-300 dark:text-gray-600">:</span>

              {/* Minutes section */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Minutes</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalMinutes(prev => {
                      if (prev === 0) return 59;
                      return prev - 1;
                    })}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#09314F] border border-gray-200 dark:border-[#1a4a75] flex items-center justify-center font-bold shadow-sm hover:border-[#C5A97A] active:scale-95 transition-all text-gray-700 dark:text-white"
                  >
                    -
                  </button>
                  <span className="text-3xl font-black font-mono w-12 text-center">{String(modalMinutes).padStart(2, '0')}</span>
                  <button
                    type="button"
                    onClick={() => setModalMinutes(prev => {
                      if (prev === 59) return 0;
                      return prev + 1;
                    })}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#09314F] border border-gray-200 dark:border-[#1a4a75] flex items-center justify-center font-bold shadow-sm hover:border-[#C5A97A] active:scale-95 transition-all text-gray-700 dark:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mb-6">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3 text-center">Quick Presets</span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: "30m", h: 0, m: 30 },
                  { label: "45m", h: 0, m: 45 },
                  { label: "1h", h: 1, m: 0 },
                  { label: "1h 30m", h: 1, m: 30 },
                  { label: "2h", h: 2, m: 0 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setModalHours(preset.h);
                      setModalMinutes(preset.m);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-[#1a4a75] bg-white dark:bg-[#06243A] text-xs font-bold hover:border-[#C5A97A] hover:bg-[#C5A97A]/5 transition-all text-gray-700 dark:text-white"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsClockModalOpen(false)}
                className="flex-1 py-3.5 border border-gray-200 dark:border-[#1a4a75] hover:bg-gray-50 dark:hover:bg-[#06243A] rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const total = (modalHours * 60) + modalMinutes;
                  setTimer(String(total > 0 ? total : 10)); // Min 10 mins
                  setIsClockModalOpen(false);
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
              >
                Apply Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Integrity Warning Modal */}
      {isWarningModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsWarningModalOpen(false)} />
          <div className="relative bg-white dark:bg-[#09314F] border border-[#C5A97A]/30 rounded-[32px] p-8 w-[90%] max-w-lg shadow-2xl z-10 animate-scale-in text-[#09314F] dark:text-white">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800/40">
                <Icon icon="lucide:shield-alert" className="w-9 h-9 text-red-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-[#09314F] dark:text-white mb-2">
                Exam Integrity Notice
              </h3>
              <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-[#C5A97A] to-transparent mx-auto mb-4" />
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-medium mb-8">
              <p>
                Before you begin your practice attempt, please read and agree to the following conditions:
              </p>
              <div className="bg-gray-50 dark:bg-[#06243A]/60 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
                <div className="flex gap-3">
                  <Icon icon="lucide:x-circle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-[#09314F] dark:text-white">No AI assistance:</span> Do not use ChatGPT, Copilot, or any other AI tools during this exam.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Icon icon="lucide:search-slash" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-[#09314F] dark:text-white">No search tabs:</span> Avoid researching answers in another tab or external resources.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Icon icon="lucide:swatch-book" className="w-5 h-5 text-[#C5A97A] shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-[#09314F] dark:text-white">Treat this like reality:</span> In the actual exam hall, there will be no external help or tabs. Do yourself a massive favor: test your true knowledge under real conditions to build actual readiness.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsWarningModalOpen(false)}
                className="flex-1 py-3.5 border border-gray-200 dark:border-[#1a4a75] hover:bg-gray-50 dark:hover:bg-[#06243A] rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-all"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWarningModalOpen(false);
                  handleStartPractice();
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
              >
                I Agree & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
