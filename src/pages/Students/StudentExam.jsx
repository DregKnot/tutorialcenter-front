import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "@iconify/react";
import ExamInterface from "../../components/private/Students/StudentsExamFlow/ExamInterface.jsx";
import ExamHistory from "../../components/private/Students/StudentsExamFlow/ExamHistory.jsx";
import { StreakFire, getStreakFlameStyles, calculatePracticeStreak } from "../../components/private/Students/StudentsExamFlow/StreakFire.jsx";
import { StreakLightning, getStreakLightningStyles } from "../../components/private/Students/StudentsExamFlow/StreakLightning.jsx";

export default function StudentExam() {
  const { token: authToken } = useAuth();
  const location = useLocation();
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
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [isStreakHovered, setIsStreakHovered] = useState(false);
  const [activeExamSession, setActiveExamSession] = useState(null);

  const hasActiveSession = Boolean(activeExamSession && activeExamSession.remaining_seconds > 0);

  // Live ticker for active in-progress exam session countdown
  useEffect(() => {
    if (!hasActiveSession) return;
    const interval = setInterval(() => {
      setActiveExamSession((prev) => {
        if (!prev) return null;
        const currentSec = Math.max(0, Math.floor(Number(prev.remaining_seconds) || 0));
        const nextSec = currentSec - 1;
        if (nextSec <= 0) {
          return null; // Expired! Cannot rejoin anymore
        }
        return { ...prev, remaining_seconds: nextSec };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasActiveSession]);

  // Clock picker modal state
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [modalHours, setModalHours] = useState(0);
  const [modalMinutes, setModalMinutes] = useState(50);

  // Warning modal state
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

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

  // Lockdown & Tab Switching Monitor
  useEffect(() => {
    if (!showExamInterface) return;

    const handleBlur = () => {
      setWarningMessage("⚠️ Warning: Switching tabs or leaving the screen is monitored!");
      setTimeout(() => setWarningMessage(""), 5000);
    };

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => e.preventDefault();

    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
    };
  }, [showExamInterface]);

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

      const [coursesRes, availableRes, paymentsRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/students/courses`, { headers }),
        axios.get(`${API_BASE_URL}/api/students/exams/available`, { headers }),
        axios.get(`${API_BASE_URL}/api/students/payments`, { headers }).catch(() => ({ data: { payments: [] } })),
        axios.get(`${API_BASE_URL}/api/students/exams/results/history?page=1`, { headers }).catch(() => ({ data: null })),
      ]);

      if (historyRes?.data) {
        if (historyRes.data.streak !== undefined && historyRes.data.streak !== null) {
          setPracticeStreak(Number(historyRes.data.streak));
        } else {
          const attempts = Array.isArray(historyRes.data)
            ? historyRes.data
            : (Array.isArray(historyRes.data.data) ? historyRes.data.data : (historyRes.data.data?.data || []));
          setPracticeStreak(calculatePracticeStreak(attempts));
        }

        // Detect active in-progress attempt with valid remaining time
        if (historyRes.data.active_attempt) {
          const act = { ...historyRes.data.active_attempt };
          act.remaining_seconds = Math.max(0, Math.floor(Number(act.remaining_seconds) || 0));
          if (act.remaining_seconds > 0) {
            setActiveExamSession(act);
          } else {
            setActiveExamSession(null);
          }
        } else {
          const attemptsList = Array.isArray(historyRes.data)
            ? historyRes.data
            : (Array.isArray(historyRes.data.data) ? historyRes.data.data : (historyRes.data.data?.data || []));
          const inProg = attemptsList.find((a) => a.status === "in_progress");
          if (inProg) {
            const dur = Number(inProg.timer) || 50;
            const startMs = new Date(inProg.started_at || inProg.created_at).getTime();
            const remSec = Math.max(0, Math.floor((startMs + dur * 60 * 1000 - Date.now()) / 1000));
            if (remSec > 0) {
              inProg.remaining_seconds = remSec;
              setActiveExamSession(inProg);
            } else {
              setActiveExamSession(null);
            }
          } else {
            setActiveExamSession(null);
          }
        }
      }

      console.log("Students Courses Response:", coursesRes.data);
      console.log("Available Exams Response:", availableRes.data);

      const coursesData = coursesRes.data?.courses || coursesRes.data?.data || [];
      const availableData = Array.isArray(availableRes.data)
        ? availableRes.data
        : availableRes.data?.exams || availableRes.data?.data || [];
      const paymentsList = paymentsRes.data?.payments || paymentsRes.data?.courses || paymentsRes.data?.data || [];

      const isCourseExpired = (c) => {
        const status = c.status?.toLowerCase();
        if (status === 'cancelled' || status === 'removed' || status === 'inactive' || status === 'expired' || status === 'unpaid') {
          return true;
        }
        if (c.end_date) {
          const end = new Date(c.end_date);
          if (!isNaN(end.getTime()) && end < new Date()) {
            return true;
          }
        }
        return false;
      };

      const activeMap = new Map();
      coursesData.forEach((c) => {
        if (!isCourseExpired(c)) {
          const cid = Number(c.course_id || c.course?.id || c.id);
          if (cid) activeMap.set(cid, c);
        }
      });

      paymentsList.forEach((p) => {
        if (p.status === 'successful' || p.status === 'paid') {
          const cid = Number(p.course_id || p.course?.id || p.enrollment?.course_id);
          if (cid && !activeMap.has(cid)) {
            const paidAt = p.paid_at || p.created_at;
            let isPaymentExpired = false;

            if (paidAt) {
              const pDate = new Date(paidAt);
              const monthsMap = { weekly: 0.25, monthly: 1, quarterly: 3, semi_annual: 6, annual: 12 };
              const months = monthsMap[p.billing_cycle?.toLowerCase()] || 1;
              const paymentExpiry = new Date(pDate);
              paymentExpiry.setDate(paymentExpiry.getDate() + Math.round(months * 30));
              
              if (paymentExpiry < new Date()) {
                isPaymentExpired = true;
              }
            }

            if (!isPaymentExpired) {
              const enrollmentObj = p.enrollment || {};
              const courseObj = p.enrollment?.course || p.course || { id: cid, title: p.course_title || p.course_name };
              
              activeMap.set(cid, {
                ...enrollmentObj,
                id: enrollmentObj.id || p.course_enrollment_id || cid,
                course_id: cid,
                course: courseObj,
                course_name: courseObj.title || p.course_title || p.course_name,
                title: courseObj.title || p.course_title || p.course_name,
                status: 'active',
                billing_cycle: p.billing_cycle || enrollmentObj.billing_cycle,
                subjects: enrollmentObj.subjects || p.subjects || courseObj.subjects || []
              });
            }
          }
        }
      });

      const mergedCourses = Array.from(activeMap.values());
      setCourses(mergedCourses);
      setAvailableExams(availableData);

      // Handle pre-filling from Dashboard recommended practice
      if (location.state?.prefillSubjectId) {
        const pSubId = location.state.prefillSubjectId;
        const matchedCourse = coursesData.find(c => {
           const subs = c.subjects || c.course?.subjects || [];
           return subs.some(s => s.id === pSubId);
        });
        
        if (matchedCourse) {
           setSelectedCourse(matchedCourse);
           
           const subs = matchedCourse.subjects || matchedCourse.course?.subjects || [];
           const matchedSubject = subs.find(s => s.id === pSubId);
           
           if (matchedSubject) {
             setSelectedSubject(matchedSubject);
             
             if (location.state.prefillYearId) {
                const pYearId = String(location.state.prefillYearId);
                const matchingExam = availableData.find(
                  exam => (String(exam.subject_id) === String(pSubId) || String(exam.subject?.id) === String(pSubId)) &&
                          (String(exam.exam_year_id) === pYearId || String(exam.exam_year?.id) === pYearId || String(exam.id) === pYearId)
                );
                
                if (matchingExam) {
                  const yearId = matchingExam.exam_year_id || matchingExam.exam_year?.id || matchingExam.id;
                  const yearValue = matchingExam.year || matchingExam.exam_year?.year || matchingExam.exam_year_name || "Unknown Year";
                  setSelectedYear({
                    exam_year_id: yearId,
                    year: yearValue
                  });
                }
             }
           }
        }
        // clear state so it doesn't loop if they navigate back
        window.history.replaceState({}, document.title)
      }

    } catch (err) {
      console.error("Failed to load initial exam data:", err);
      setError("Failed to load active courses and available exams. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, authToken, location]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Derive unique, deduplicated subjects that actually have exams in availableExams for the selected course
  const getAvailableSubjectsForCourse = (course) => {
    if (!course || !availableExams || availableExams.length === 0) return [];

    // All subject IDs assigned to this course from database mapping
    const courseSubIds = new Set(
      (course.subjects || course.course?.subjects || []).map(s => String(s.id))
    );
    const courseId = String(course.id || course.course?.id || course.course_id || "");

    const uniqueSubjectsMap = new Map();

    availableExams.forEach((exam) => {
      const subId = String(exam.subject_id || exam.subject?.id);
      if (!subId) return;

      // Check if this exam belongs to the selected course:
      // Either the subject ID is in the course's subject list, OR the exam body's course_id matches
      const matchesCourse =
        courseSubIds.has(subId) ||
        (courseId && String(exam.exam_body?.course_id) === courseId);

      if (matchesCourse && !uniqueSubjectsMap.has(subId)) {
        // Find subject info from exam.subject or fallback to course subject data
        const courseSub = (course.subjects || course.course?.subjects || []).find(s => String(s.id) === subId);
        const examSub = exam.subject || {};

        uniqueSubjectsMap.set(subId, {
          id: exam.subject_id || exam.subject?.id || courseSub?.id,
          name: examSub.name || examSub.title || courseSub?.name || courseSub?.title || exam.subject_name || exam.title || exam.name || "Unknown Subject",
          banner: examSub.banner || examSub.image || courseSub?.banner || courseSub?.image,
          description: examSub.description || courseSub?.description || "",
        });
      }
    });

    return Array.from(uniqueSubjectsMap.values());
  };

  // Cross-reference: Check if subject is available in availableExams
  const isSubjectAvailable = (subjectId) => {
    if (!availableExams || availableExams.length === 0) return false;
    return availableExams.some(
      (exam) =>
        String(exam.subject_id) === String(subjectId) ||
        String(exam.subject?.id) === String(subjectId)
    );
  };

  // Filter available years for a given subject ID
  const getAvailableYearsForSubject = (subjectId) => {
    if (!availableExams || availableExams.length === 0) return [];
    
    // Find all exams matching this subject
    const matched = availableExams.filter(
      (exam) =>
        String(exam.subject_id) === String(subjectId) ||
        String(exam.subject?.id) === String(subjectId)
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

  // Check if a course matches selectedCourse safely without falsy/undefined false positives
  const isCourseSelected = (item, selected) => {
    if (!item || !selected) return false;
    if (item === selected) return true;

    // Check course_id or course.id if both exist
    const itemCourseId = item.course_id || item.course?.id;
    const selCourseId = selected.course_id || selected.course?.id;
    if (itemCourseId && selCourseId && String(itemCourseId) === String(selCourseId)) {
      return true;
    }

    // Check enrollment_id if both explicitly exist
    const itemEnrollId = item.enrollment_id || item.course_enrollment_id;
    const selEnrollId = selected.enrollment_id || selected.course_enrollment_id;
    if (itemEnrollId && selEnrollId && String(itemEnrollId) === String(selEnrollId)) {
      return true;
    }

    // Check id property if both exist
    if (item.id && selected.id && String(item.id) === String(selected.id)) {
      return true;
    }

    // Fallback: compare title if both exist
    const itemTitle = (item.course?.title || item.title || item.course_name || "").trim().toLowerCase();
    const selTitle = (selected.course?.title || selected.title || selected.course_name || "").trim().toLowerCase();
    if (itemTitle && selTitle && itemTitle === selTitle) {
      return true;
    }

    return false;
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

      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {
        // Fullscreen optional
      }

      setToast({
        type: "success",
        message: "Practice session successfully started!",
      });
    } catch (err) {
      console.error("Failed to start practice:", err);
      setToast({
        type: "error",
        message: "The questions for this exam year are unavailable.",
      });
    } finally {
      setStartingExam(false);
    }
  };

  const handleRejoinAttempt = (attempt) => {
    if (!attempt) return;
    const dur = Number(attempt.timer) || 50;
    const startMs = new Date(attempt.started_at || attempt.created_at).getTime();
    const remSec = attempt.remaining_seconds !== undefined
      ? attempt.remaining_seconds
      : Math.floor((startMs + dur * 60 * 1000 - Date.now()) / 1000);

    if (remSec <= 0) {
      setToast({
        type: "error",
        message: "This exam time has expired and the session cannot be rejoined.",
      });
      fetchInitialData();
      return;
    }

    setActiveAttemptId(attempt.id);
    setTimer(String(Math.max(1, Math.ceil(remSec / 60))));

    if (attempt.exam_year?.subject) {
      setSelectedSubject(attempt.exam_year.subject);
    }
    if (attempt.exam_year?.subject?.course_id && courses.length > 0) {
      const matched = courses.find((c) => c.id === attempt.exam_year.subject.course_id);
      if (matched) setSelectedCourse(matched);
    }

    setShowExamInterface(true);
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  const handleAbandonAttempt = async (attemptId) => {
    if (!attemptId) return;
    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      };
      await axios.post(`${API_BASE_URL}/api/students/exams/${attemptId}/abandon`, {}, { headers });
      setActiveExamSession(null);
      setToast({
        type: "success",
        message: "Exam session has been marked as abandoned.",
      });
      fetchInitialData();
    } catch (err) {
      console.error("Failed to abandon attempt:", err);
      setActiveExamSession(null);
      fetchInitialData();
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
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20"
              : toast.type === "error"
              ? "bg-gradient-to-r from-red-500 to-rose-500 shadow-red-500/20"
              : "bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-500/20"
          }`}
        >
          <Icon
            icon={toast.type === "success" ? "lucide:check-circle" : toast.type === "error" ? "lucide:x-circle" : "lucide:alert-circle"}
            className="w-5 h-5"
          />
          {toast.message}
        </div>
      )}

      {/* Lockdown Warning Toast */}
      {warningMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[3000] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2 animate-bounce border border-white/30">
          <Icon icon="lucide:alert-triangle" className="w-5 h-5" />
          {warningMessage}
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
              if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
              }
              setShowExamInterface(false);
              setActiveAttemptId(null);
              fetchInitialData();
            }}
            onReviewExam={(attemptId) => {
              if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
              }
              setShowExamInterface(false);
              setActiveAttemptId(null);
              setHistoryAttemptIdToOpen(attemptId);
              setShowHistory(true);
              fetchInitialData();
            }}
          />
        ) : showHistory ? (
          <ExamHistory
            availableExams={availableExams}
            initialExpandedAttemptId={historyAttemptIdToOpen}
            onBack={() => {
              setShowHistory(false);
              setHistoryAttemptIdToOpen(null);
              fetchInitialData();
            }}
            onRejoinExam={handleRejoinAttempt}
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
            {/* Top Action Row (History comes first on mobile as requested, and streak comes second; on desktop streak is on left and history is on right) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Practice History Button: order-1 on mobile, order-2 on sm+ */}
              <div className="order-1 sm:order-2 flex items-center justify-start sm:justify-end w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setHistoryAttemptIdToOpen(null);
                    setShowHistory(true);
                  }}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-white dark:bg-[#072238]/90 hover:bg-gray-50 dark:hover:bg-[#0a2f4c] border border-[#C5A97A]/40 hover:border-[#C5A97A] text-[#09314F] dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-sm group"
                >
                  <Icon icon="lucide:history" className="w-4 h-4 text-[#C5A97A] group-hover:rotate-[-20deg] transition-transform" />
                  <span>Practice History</span>
                </button>
              </div>

              {/* Main Evolving Streak Widget: order-2 on mobile, order-1 on sm+ */}
              <div className="order-2 sm:order-1 flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {(() => {
                  const isLightning = practiceStreak >= 30;
                  const streakStyles = isLightning
                    ? getStreakLightningStyles(practiceStreak)
                    : getStreakFlameStyles(practiceStreak);

                  return (
                    <div
                      onClick={() => {
                        setHistoryAttemptIdToOpen(null);
                        setShowHistory(true);
                      }}
                      onMouseEnter={() => setIsStreakHovered(true)}
                      onMouseLeave={() => setIsStreakHovered(false)}
                      className={`group relative flex items-center gap-4 px-4 py-3 bg-white dark:bg-[#072238]/90 backdrop-blur-md rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 w-full sm:w-auto ${
                        isLightning ? "border-amber-500/30 dark:border-amber-500/40" : "border-gray-100 dark:border-[#0f3d61]"
                      }`}
                      style={{
                        boxShadow: isStreakHovered || practiceStreak > 0
                          ? `0 0 24px ${streakStyles.glow}`
                          : undefined
                      }}
                      title="Click to view full practice history"
                    >
                      {/* Icon Box: Fire (Days 1-29) -> Lightning (Days 30-60+ with Black Background) */}
                      <div
                        className={`rounded-2xl shrink-0 w-16 h-16 flex items-center justify-center relative overflow-hidden transition-all group-hover:scale-105 duration-200 ${
                          isLightning
                            ? "bg-black shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-white/10"
                            : streakStyles.bgClass
                        }`}
                      >
                        {isLightning ? (
                          <StreakLightning streak={practiceStreak} size={54} />
                        ) : (
                          <StreakFire streak={practiceStreak} size={54} />
                        )}
                      </div>

                      {/* Text Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl md:text-2xl font-black text-[#09314F] dark:text-white leading-none tracking-tight block">
                            {practiceStreak} {practiceStreak === 1 ? "Day" : "Days"}
                          </span>
                          {isLightning && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm"
                              style={{
                                backgroundColor: "#000000",
                                borderColor: streakStyles.sparkColor,
                                color: streakStyles.sparkColor,
                                boxShadow: `0 0 10px ${streakStyles.glow}`,
                              }}
                            >
                              ⚡ {streakStyles.title}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                          <span>{isLightning ? "Black Lightning Streak" : "Practice Streak"}</span>
                          <Icon icon="lucide:arrow-right" className="w-3 h-3 text-[#C5A97A] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Active Ongoing Exam Session Card (Properly Aligned & Perfectly Portrayed) */}
            {activeExamSession && activeExamSession.remaining_seconds > 0 && (() => {
              const totalSec = Math.max(0, Math.floor(Number(activeExamSession.remaining_seconds) || 0));
              const remMins = Math.floor(totalSec / 60);
              const remSecs = totalSec % 60;
              const subjectName = activeExamSession.exam_year?.subject?.name ||
                                  activeExamSession.exam_year?.subject?.title ||
                                  "Practice Exam";
              const yearValue = activeExamSession.exam_year?.year || "";

              return (
                <div className="bg-[#0b253a] dark:bg-[#071c2d] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
                  {/* Decorative ambient glows */}
                  <div className="absolute -top-16 -right-16 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col gap-5">
                    {/* 1. Header Strip: Status Indicator on Left, Live Monospace Countdown on Right */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                          Active In-Progress Session
                        </span>
                      </div>

                      {/* High-Contrast Monospace Countdown Pill */}
                      <div className="flex items-center gap-2 px-3.5 py-1.5 bg-black/60 border border-amber-500/40 rounded-xl shadow-inner">
                        <Icon icon="lucide:clock-4" className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="font-mono text-sm sm:text-base font-black text-amber-300 tracking-wider">
                          {remMins}m {String(remSecs).padStart(2, "0")}s
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          left
                        </span>
                      </div>
                    </div>

                    {/* 2. Main Content Body: Icon + Subject Title + Year Tag + Explanation */}
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                        <Icon icon="lucide:file-text" className="w-7 h-7" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                            {subjectName}
                          </h3>
                          {yearValue && (
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Year {yearValue}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                          Your exam practice is in progress and your answers are safely saved. You can rejoin and finish your test before the time runs out.
                        </p>
                      </div>
                    </div>

                    {/* 3. Balanced Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAbandonAttempt(activeExamSession.id)}
                        className="order-2 sm:order-1 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2"
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                        <span>Abandon Exam</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejoinAttempt(activeExamSession)}
                        className="order-1 sm:order-2 px-7 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:via-orange-600 hover:to-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        <Icon icon="lucide:play-circle" className="w-4 h-4" />
                        <span>Resume Exam Now</span>
                        <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 1. Modern Exam Practice Center Hero / Guidance Hub */}
            <div className="bg-gradient-to-br from-[#0b2840]/90 via-[#071c2d]/95 to-[#04121d]/95 dark:from-[#071f33] dark:via-[#051829] dark:to-[#030d17] backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-[#C5A97A]/30 shadow-2xl relative overflow-hidden text-white">
              {/* Subtle Ambient Flares */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C5A97A]/15 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                {/* Header Row: Title & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C5A97A] to-amber-500 text-[#09314F] flex items-center justify-center shrink-0 shadow-lg shadow-[#C5A97A]/25">
                      <Icon icon="lucide:sparkles" className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#C5A97A]/20 text-[#C5A97A] border border-[#C5A97A]/30">
                          Official CBT Simulation
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                        Exam Practice Center
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Distraction-Free Lockdown Active
                    </span>
                  </div>
                </div>

                {/* 5-Step Practice Journey Pathway Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {/* Step 1: Choose Course */}
                  <div className="bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-[#C5A97A]/40 rounded-2xl p-4 transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#C5A97A]/15 text-[#C5A97A] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon icon="lucide:graduation-cap" className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white/10 text-gray-400">
                          Step 01
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight mb-1">
                        Choose Course
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Pick from your enrolled exam bodies (WAEC, JAMB, GCE).
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Choose Subject */}
                  <div className="bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-sky-400/40 rounded-2xl p-4 transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon icon="lucide:book-open" className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white/10 text-gray-400">
                          Step 02
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight mb-1">
                        Select Subject
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Choose your target subject of choice from the syllabus.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Choose Year */}
                  <div className="bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/40 rounded-2xl p-4 transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon icon="lucide:calendar" className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white/10 text-gray-400">
                          Step 03
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight mb-1">
                        Choose Year
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Select past questions by your preferred exam year.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Configure Timer */}
                  <div className="bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 rounded-2xl p-4 transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon icon="lucide:clock-4" className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white/10 text-gray-400">
                          Step 04
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight mb-1">
                        Configure Time
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Set custom countdown from 10 to 120 minutes.
                      </p>
                    </div>
                  </div>

                  {/* Step 5: Locked Screen Mode */}
                  <div className="bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/40 rounded-2xl p-4 transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon icon="lucide:shield-check" className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white/10 text-gray-400">
                          Step 05
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight mb-1">
                        Locked Screen
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Fullscreen lockdown CBT mode with active focus protection.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pro-Tip / Policy Ribbon */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-xs">
                  <div className="flex items-center gap-2.5 text-gray-300">
                    <Icon icon="lucide:info" className="w-4 h-4 text-[#C5A97A] shrink-0" />
                    <span>
                      <strong className="text-white">Preserved Progress:</strong> If you step away while time is counting, you can resume anytime from this page or Practice History.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryAttemptIdToOpen(null);
                      setShowHistory(true);
                    }}
                    className="text-[11px] font-black text-[#C5A97A] uppercase tracking-wider shrink-0 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Practice History</span>
                    <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Redesigned Course Selection */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-[#C5A97A]/20 border border-[#C5A97A]/40 text-[#C5A97A] font-black text-xs flex items-center justify-center shadow-sm">
                    01
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-wider">
                      Choose Enrolled Exam Body
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Select the curriculum syllabus you wish to practice today
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-[#C5A97A] uppercase tracking-widest bg-[#C5A97A]/10 px-3 py-1 rounded-full border border-[#C5A97A]/20">
                  {courses.length} Available
                </span>
              </div>

              {courses.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                  <Icon icon="lucide:book-x" className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-60" />
                  <p className="text-sm text-gray-400 font-bold">No active enrolled courses found.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Left and right fade overlays */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#E6E9EC] dark:from-[#04121d] to-transparent pointer-events-none z-10 opacity-40"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#E6E9EC] dark:from-[#04121d] to-transparent pointer-events-none z-10 opacity-40"></div>

                  <div
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 select-none py-1"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {courses.map((item, idx) => {
                      const title = item.course?.title || item.title || "Course";
                      const isSelected = isCourseSelected(item, selectedCourse);
                      const isWAEC = title.toUpperCase().includes("WAEC");
                      const isGCE = title.toUpperCase().includes("GCE");
                      const itemKey = item.course_id || item.course?.id || item.id || item.enrollment_id || idx;

                      return (
                        <div
                          key={itemKey}
                          onClick={() => handleCourseSelect(item)}
                          className={`min-w-[260px] md:min-w-[300px] p-5 rounded-3xl border cursor-pointer transition-all duration-300 relative group flex flex-col justify-between gap-4 shadow-sm shrink-0 ${
                            isSelected
                              ? "bg-gradient-to-br from-[#0c2f4d] to-[#071c2d] dark:from-[#092f4e] dark:to-[#05192b] text-white border-2 border-[#C5A97A] shadow-xl shadow-[#C5A97A]/15 scale-[1.02]"
                              : "bg-white dark:bg-[#072238]/60 hover:bg-gray-50 dark:hover:bg-[#092b47]/80 border-gray-100 dark:border-gray-800 hover:border-[#C5A97A]/50 hover:scale-[1.01]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                                isSelected
                                  ? "bg-gradient-to-tr from-[#C5A97A] to-amber-500 text-[#09314F] shadow-md"
                                  : "bg-[#09314F]/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 group-hover:text-[#C5A97A] group-hover:border-[#C5A97A]/40"
                              }`}
                            >
                              <Icon
                                icon={isWAEC ? "lucide:award" : isGCE ? "lucide:graduation-cap" : "lucide:book-open"}
                                className="w-6 h-6"
                              />
                            </div>

                            {isSelected ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C5A97A] text-[#09314F] flex items-center gap-1 shadow-sm animate-scale-in">
                                <Icon icon="lucide:check" className="w-3 h-3 stroke-[3]" />
                                Selected
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 group-hover:border-[#C5A97A] transition-colors"></span>
                            )}
                          </div>

                          <div>
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                                isSelected ? "text-[#C5A97A]" : "text-gray-400 group-hover:text-[#C5A97A]"
                              }`}
                            >
                              Curriculum Body
                            </span>
                            <h4
                              className={`text-lg font-black uppercase tracking-tight mt-0.5 truncate transition-colors ${
                                isSelected ? "text-white" : "text-[#09314F] dark:text-white"
                              }`}
                            >
                              {title}
                            </h4>
                          </div>

                          <div
                            className={`pt-3 border-t flex items-center justify-between text-xs transition-colors ${
                              isSelected
                                ? "border-white/10 text-gray-200"
                                : "border-gray-100 dark:border-white/10 text-gray-400"
                            }`}
                          >
                            <span className="inline-flex items-center gap-1.5 font-bold">
                              <Icon icon="lucide:layers" className="w-3.5 h-3.5 text-[#C5A97A]" />
                              <span>{item.subjects?.length || 0} Subjects Enrolled</span>
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                isSelected ? "text-[#C5A97A]" : "text-gray-400 dark:text-gray-500"
                              }`}
                            >
                              {isSelected ? "Active • Selected" : "Ready to Practice"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Select Subject */}
            {selectedCourse && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between w-full gap-2 mb-4 max-md:flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 font-black text-xs flex items-center justify-center shadow-sm">
                      02
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-wider">
                        Select Subject of Choice
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Choose the specific subject syllabus you want to focus on
                      </p>
                    </div>
                  </div>
                  {/* Dynamic Device Hint Text */}
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider animate-pulse text-right shrink-0 max-md:basis-full">
                    {isDesktop ? "Scroll to select subjects" : "Swipe to select subjects"}
                  </span>
                </div>

                {(() => {
                  const availableCourseSubjects = getAvailableSubjectsForCourse(selectedCourse);
                  if (!availableCourseSubjects || availableCourseSubjects.length === 0) {
                    return (
                      <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Icon icon="lucide:book-open" className="w-10 h-10 text-gray-400 mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">No practice exams or questions are currently available for subjects in this course.</p>
                        <p className="text-xs text-gray-400 mt-1">Please check back later or select a different course.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="relative">
                      {/* Fade Overlays for elegant premium scroll effect */}
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#E6E9EC] dark:from-gray-900 to-transparent pointer-events-none z-10 opacity-30"></div>
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#E6E9EC] dark:from-gray-900 to-transparent pointer-events-none z-10 opacity-30"></div>

                      <div
                        ref={subjectRowRef}
                        className="flex gap-4 overflow-x-auto py-3 pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 select-none cursor-grab"
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        {availableCourseSubjects.map((sub, idx) => {
                          const name = sub.name || sub.title || "Subject";
                          const isSelected = selectedSubject && String(selectedSubject.id) === String(sub.id);
                          const bannerUrl = sub.banner
                            ? (sub.banner.startsWith("http") ? sub.banner : `${API_BASE_URL}/storage/${sub.banner}`)
                            : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

                          return (
                            <div
                              key={sub.id || idx}
                              onClick={() => handleSubjectSelect(sub)}
                              className={`w-[180px] md:w-[210px] shrink-0 p-4 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative select-none group overflow-visible ${
                                isSelected
                                  ? "bg-[#09314F] text-white border-transparent ring-4 ring-[#C5A97A]/30 scale-[1.02] shadow-md"
                                  : "bg-white dark:bg-[#09314F]/40 border-gray-100 dark:border-[#09314F] hover:border-gray-200 hover:scale-[1.01] cursor-pointer shadow-sm"
                              }`}
                            >
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
                                <span
                                  className={`text-[9px] font-black uppercase tracking-widest block transition-colors ${
                                    isSelected ? "text-white/80 dark:text-gray-300" : "text-[#C5A97A]"
                                  }`}
                                >
                                  SUBJECT
                                </span>
                                <h4
                                  className={`text-sm font-black uppercase tracking-tight truncate mt-1 w-full transition-colors ${
                                    isSelected
                                      ? "text-[#C5A97A]"
                                      : "text-[#09314F] dark:text-white group-hover:text-[#09314F] dark:group-hover:text-[#C5A97A]"
                                  }`}
                                >
                                  {name}
                                </h4>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3 & 4. Sub-Configuration (Year & Timer) */}
            {selectedSubject && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {/* Year Selection Card */}
                <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-[#09314F] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 font-black text-xs flex items-center justify-center shadow-sm">
                        03
                      </span>
                      <h4 className="text-xs font-black text-[#09314F] dark:text-white uppercase tracking-wider">
                        Choose Exam Year
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
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400 font-black text-xs flex items-center justify-center shadow-sm">
                        04
                      </span>
                      <h4 className="text-xs font-black text-[#09314F] dark:text-white uppercase tracking-wider">
                        Configure Time of Choice
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
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 font-black text-xs flex items-center justify-center shadow-sm">
                        05
                      </span>
                      <h4 className="text-[15px] font-black uppercase tracking-tight text-[#09314F] dark:text-white">
                        Practice Session Summary &amp; Locked Launch
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

      {/* Custom Floating Clock Picker Modal (Ultra-Responsive down to Smartwatch screens) */}
      {isClockModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsClockModalOpen(false)} />
          <div className="relative bg-white dark:bg-[#09314F] border border-[#C5A97A]/30 rounded-2xl sm:rounded-[28px] md:rounded-[32px] p-3.5 xs:p-5 sm:p-7 md:p-8 w-full max-w-[94vw] xs:max-w-[360px] sm:max-w-md max-h-[94vh] flex flex-col overflow-y-auto shadow-2xl z-10 animate-scale-in text-[#09314F] dark:text-white my-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {/* Modal Header */}
            <div className="text-center mb-3 sm:mb-5 shrink-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 bg-[#09314F]/5 dark:bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 sm:mb-2 border border-[#C5A97A]/20">
                <Icon icon="lucide:clock" className="w-4 h-4 sm:w-6 sm:h-6 text-[#C5A97A]" />
              </div>
              <h3 className="text-xs sm:text-base md:text-lg font-black uppercase tracking-wider text-[#09314F] dark:text-white">
                Choose Practice Time
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 hidden xs:block">
                Set hours and minutes for your exam session
              </p>
              
              {/* Dynamic live badge */}
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#09314F]/5 dark:bg-white/10 text-[#09314F] dark:text-[#C5A97A] font-mono text-[10px] xs:text-xs font-black border border-[#C5A97A]/20">
                <span className="opacity-70">Total:</span>
                <span>
                  {modalHours > 0 ? `${modalHours}h ` : ""}
                  {modalMinutes}m ({(modalHours * 60) + modalMinutes} mins)
                </span>
              </div>
            </div>

            {/* Hours and Minutes Adjuster (Fluid flex down to 220px) */}
            <div className="flex items-center justify-center gap-1.5 xs:gap-3 sm:gap-6 bg-gray-50 dark:bg-[#06243A] p-2 xs:p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 mb-3 sm:mb-5 shrink-0">
              {/* Hours section */}
              <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider">Hours</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setModalHours(prev => Math.max(0, prev - 1))}
                    className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-full bg-white dark:bg-[#09314F] border border-gray-200 dark:border-[#1a4a75] flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm hover:border-[#C5A97A] active:scale-95 transition-all text-gray-700 dark:text-white shrink-0 select-none"
                    aria-label="Decrease hours"
                  >
                    -
                  </button>
                  <span className="text-xl xs:text-2xl sm:text-3xl font-black font-mono w-7 xs:w-9 sm:w-12 text-center text-[#09314F] dark:text-white">
                    {String(modalHours).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalHours(prev => Math.min(12, prev + 1))}
                    className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-full bg-white dark:bg-[#09314F] border border-gray-200 dark:border-[#1a4a75] flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm hover:border-[#C5A97A] active:scale-95 transition-all text-gray-700 dark:text-white shrink-0 select-none"
                    aria-label="Increase hours"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-lg xs:text-2xl sm:text-3xl font-black text-gray-300 dark:text-gray-600 px-0.5">:</span>

              {/* Minutes section */}
              <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider">Minutes</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setModalMinutes(prev => {
                      if (prev === 0) return 59;
                      return prev - 1;
                    })}
                    className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-full bg-white dark:bg-[#09314F] border border-gray-200 dark:border-[#1a4a75] flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm hover:border-[#C5A97A] active:scale-95 transition-all text-gray-700 dark:text-white shrink-0 select-none"
                    aria-label="Decrease minutes"
                  >
                    -
                  </button>
                  <span className="text-xl xs:text-2xl sm:text-3xl font-black font-mono w-7 xs:w-9 sm:w-12 text-center text-[#09314F] dark:text-white">
                    {String(modalMinutes).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalMinutes(prev => {
                      if (prev === 59) return 0;
                      return prev + 1;
                    })}
                    className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-full bg-white dark:bg-[#09314F] border border-gray-200 dark:border-[#1a4a75] flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm hover:border-[#C5A97A] active:scale-95 transition-all text-gray-700 dark:text-white shrink-0 select-none"
                    aria-label="Increase minutes"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Smartwatch / Touch Scrubbing Slider */}
            <div className="mb-3 sm:mb-4 px-1 shrink-0">
              <div className="flex items-center justify-between text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-gray-400 mb-1">
                <span>10m</span>
                <span className="text-[#C5A97A] font-black uppercase tracking-wider">Quick Scrub</span>
                <span>180m</span>
              </div>
              <input
                type="range"
                min="10"
                max="180"
                step="5"
                value={Math.max(10, Math.min(180, (modalHours * 60) + modalMinutes))}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setModalHours(Math.floor(val / 60));
                  setModalMinutes(val % 60);
                }}
                className="w-full accent-[#C5A97A] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer transition-all"
                aria-label="Quick adjust duration slider"
              />
            </div>

            {/* Quick Presets */}
            <div className="mb-3 sm:mb-5 shrink-0">
              <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 sm:mb-2 text-center">
                Quick Presets
              </span>
              <div className="grid grid-cols-3 xs:grid-cols-5 gap-1 xs:gap-1.5 sm:gap-2">
                {[
                  { label: "30m", h: 0, m: 30 },
                  { label: "45m", h: 0, m: 45 },
                  { label: "1h", h: 1, m: 0 },
                  { label: "1h 30m", h: 1, m: 30 },
                  { label: "2h", h: 2, m: 0 },
                ].map((preset, idx) => {
                  const isCurrent = modalHours === preset.h && modalMinutes === preset.m;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setModalHours(preset.h);
                        setModalMinutes(preset.m);
                      }}
                      className={`px-1.5 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-lg sm:rounded-xl border text-[10px] xs:text-xs font-bold transition-all text-center ${
                        isCurrent
                          ? "bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F] border-transparent font-black shadow-xs scale-102"
                          : "border-gray-200 dark:border-[#1a4a75] bg-white dark:bg-[#06243A] text-gray-700 dark:text-white hover:border-[#C5A97A] hover:bg-[#C5A97A]/5"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons (Stacked on smartwatch/ultra-compact, inline on larger) */}
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsClockModalOpen(false)}
                className="w-full xs:flex-1 py-2.5 sm:py-3.5 border border-gray-200 dark:border-[#1a4a75] hover:bg-gray-50 dark:hover:bg-[#06243A] rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest transition-all order-2 xs:order-1"
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
                className="w-full xs:flex-1 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-98 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md order-1 xs:order-2"
              >
                Apply Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Integrity Warning Modal */}
      {isWarningModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsWarningModalOpen(false)} />
          <div className="relative bg-white dark:bg-[#09314F] border border-[#C5A97A]/30 rounded-2xl sm:rounded-[28px] md:rounded-[32px] p-4 sm:p-6 md:p-8 w-full max-w-lg max-h-[94vh] flex flex-col shadow-2xl z-10 animate-scale-in text-[#09314F] dark:text-white my-auto">
            {/* Modal Header */}
            <div className="text-center shrink-0 mb-3 md:mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 border border-red-200 dark:border-red-800/40">
                <Icon icon="lucide:shield-alert" className="w-6 h-6 md:w-9 md:h-9 text-red-500" />
              </div>
              <h3 className="text-base md:text-xl font-black uppercase tracking-widest text-[#09314F] dark:text-white mb-1">
                Exam Integrity Notice
              </h3>
              <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-[#C5A97A] to-transparent mx-auto" />
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto pr-1 space-y-3.5 text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-medium flex-1 min-h-0 my-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
              <p>
                Before you begin your practice attempt, please read and agree to the following conditions:
              </p>
              <div className="bg-gray-50 dark:bg-[#06243A]/60 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 space-y-3 md:space-y-4">
                <div className="flex gap-3">
                  <Icon icon="lucide:lock" className="w-4 h-4 md:w-5 md:h-5 text-red-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-[#09314F] dark:text-white">Browser Lockdown:</span> Your browser will be locked in full screen. Tab switching, copying, and right-clicking are strictly monitored and disabled.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Icon icon="lucide:x-circle" className="w-4 h-4 md:w-5 md:h-5 text-red-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-[#09314F] dark:text-white">No AI assistance:</span> Do not use ChatGPT, Copilot, or any other AI tools during this exam.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Icon icon="lucide:search-slash" className="w-4 h-4 md:w-5 md:h-5 text-red-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-[#09314F] dark:text-white">No search tabs:</span> Avoid researching answers in another tab or external resources.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Icon icon="lucide:swatch-book" className="w-4 h-4 md:w-5 md:h-5 text-[#C5A97A] shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-[#09314F] dark:text-white">Treat this like reality:</span> In the actual exam hall, there will be no external help or tabs. Do yourself a massive favor: test your true knowledge under real conditions to build actual readiness.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Action Buttons */}
            <div className="shrink-0 pt-3 flex gap-3 sm:gap-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsWarningModalOpen(false)}
                className="flex-1 py-3 md:py-3.5 border border-gray-200 dark:border-[#1a4a75] hover:bg-gray-50 dark:hover:bg-[#06243A] rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-all"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWarningModalOpen(false);
                  handleStartPractice();
                }}
                className="flex-1 py-3 md:py-3.5 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
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
