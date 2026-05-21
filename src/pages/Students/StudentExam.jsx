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

  // References
  const subjectRowRef = useRef(null);

  // Timer options (minutes)
  const timerOptions = ["10", "15", "20", "25", "30", "40", "50", "60", "70", "80", "90", "100", "110", "120"];

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

      // Pre-select first course if available
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]);
      }
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
  const displayTimer = `${timer} Mins`;

  return (
    <DashboardLayout pagetitle="Exam Practice">
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

      <div className="max-w-5xl mx-auto w-full pb-20 px-2 lg:px-4">
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
          />
        ) : showHistory ? (
          <ExamHistory
            onBack={() => setShowHistory(false)}
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
                <h1 className="text-xl md:text-2xl font-black text-[#09314F] dark:text-white uppercase tracking-tight">
                  Practice Center
                </h1>
              </div>
              <button
                onClick={() => setShowHistory(true)}
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
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">
                    <p>Welcome to your customized practice portal. Standard instructions:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Choose your enrolled course and preferred subject from the lists.</li>
                      <li>Select the target past question year to fetch relevant datasets.</li>
                      <li>
                        Configure your timer between{" "}
                        <span className="font-bold">10 and 120 minutes</span> to fit your preferred schedule.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((item, idx) => {
                    const title = item.course?.title || item.title || "Course";
                    const isSelected = selectedCourse && (item.enrollment_id === selectedCourse.enrollment_id || item.id === selectedCourse.id);
                    return (
                      <div
                        key={item.enrollment_id || item.id || idx}
                        onClick={() => handleCourseSelect(item)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative group flex items-start gap-4 shadow-sm ${
                          isSelected
                            ? "bg-[#09314F]/10 dark:bg-[#09314F]/60 border-[#BB9E7F] ring-2 ring-[#BB9E7F]/20"
                            : "bg-white dark:bg-[#09314F]/30 border-gray-100 dark:border-[#09314F] hover:border-gray-300 dark:hover:border-blue-800"
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
                          <div className="absolute top-3 right-3 text-[#BB9E7F]">
                            <Icon icon="lucide:check-circle" className="w-5 h-5 animate-scale-in" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Subject Horizontally Scrollable Row */}
            {selectedCourse && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C5A97A]"></span>
                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      2. Select Subject
                    </h4>
                  </div>
                  {/* Dynamic Device Hint Text */}
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider animate-pulse">
                    {isDesktop ? "Scroll to select more subjects" : "Swipe to select more subjects"}
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
                      className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 select-none cursor-grab"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {selectedCourse.subjects.map((sub, idx) => {
                        const name = sub.name || sub.title || "Subject";
                        const available = isSubjectAvailable(sub.id);
                        const isSelected = selectedSubject && String(selectedSubject.id) === String(sub.id);

                        return (
                          <div
                            key={sub.id || idx}
                            onClick={() => available && handleSubjectSelect(sub)}
                            className={`min-w-[180px] md:min-w-[210px] p-5 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative select-none ${
                              !available
                                ? "bg-gray-100 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/30 cursor-not-allowed opacity-60"
                                : isSelected
                                ? "bg-[#09314F] text-white border-transparent ring-4 ring-[#BB9E7F]/30 scale-[1.02] shadow-md"
                                : "bg-white dark:bg-[#09314F]/40 border-gray-100 dark:border-[#09314F] hover:border-gray-200 hover:scale-[1.01] cursor-pointer shadow-sm"
                            }`}
                          >
                            {/* Overlay for unavailable subjects */}
                            {!available && (
                              <div className="absolute inset-0 bg-black/60 dark:bg-black/75 rounded-3xl flex items-center justify-center p-4 z-20 text-center animate-fade-in">
                                <span className="text-[11px] font-bold text-white uppercase tracking-widest leading-relaxed">
                                  Not available at the moment
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between mb-8">
                              <div
                                className={`p-2.5 rounded-xl ${
                                  isSelected
                                    ? "bg-white/10 text-white"
                                    : "bg-gray-50 dark:bg-[#06243A] text-gray-400"
                                }`}
                              >
                                <Icon icon="mdi:book" className="w-5 h-5" />
                              </div>
                              {isSelected && (
                                <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-[#C5A97A]" />
                              )}
                            </div>

                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#C5A97A]">
                                SUBJECT
                              </span>
                              <h4 className="text-sm font-black uppercase tracking-tight truncate mt-1">
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

                  <div>
                    <select
                      value={timer}
                      onChange={(e) => setTimer(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#06243A] border border-gray-200 dark:border-[#1a4a75] rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-[#BB9E7F] focus:ring-1 focus:ring-[#BB9E7F]/30 transition-all appearance-none cursor-pointer"
                    >
                      {timerOptions.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                          className="dark:bg-[#09314F] text-gray-800 dark:text-gray-100"
                        >
                          {opt} Mins
                        </option>
                      ))}
                    </select>
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
                      onClick={handleStartPractice}
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
    </DashboardLayout>
  );
}
