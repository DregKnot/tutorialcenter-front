import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { 
  TrophyIcon, 
  SparklesIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  AcademicCapIcon,
  FireIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  ChartPieIcon
} from "@heroicons/react/24/outline";

// Fallback data for initialization or demo
const FALLBACK_LEADERBOARD = [
  { 
    student_id: 1, 
    id: 1, 
    name: "Tengen Izui", 
    total_score: 151, 
    points: 151, 
    average_score: 35.2, 
    highest_score: 87, 
    total_attempts: 48, 
    total_correct_answers: 151, 
    rank: 1, 
    profile_picture: null,
    today_points: 0,
    today_subjects: ["Mathematics"],
    most_practiced_subject: "Mathematics",
    subject_breakdowns: [
      { subject: "Biology", accumulated_score: 71, total_attempts: 18, total_correct: 71, total_questions: 132, highest_score: 87, avg_score: 49, today_score: 0, today_attempts: 0 },
      { subject: "Mathematics", accumulated_score: 67, total_attempts: 25, total_correct: 67, total_questions: 325, highest_score: 46, avg_score: 21, today_score: 0, today_attempts: 0 },
      { subject: "English Language", accumulated_score: 13, total_attempts: 5, total_correct: 13, total_questions: 22, highest_score: 80, avg_score: 57, today_score: 0, today_attempts: 0 },
    ],
    daily_timeline: [
      { date: "2026-08-09", points_accumulated: 4, attempts_count: 1, subjects: ["Biology"] },
      { date: "2026-08-05", points_accumulated: 12, attempts_count: 3, subjects: ["English Language", "Biology"] },
      { date: "2026-07-24", points_accumulated: 13, attempts_count: 2, subjects: ["Biology"] },
      { date: "2026-06-08", points_accumulated: 22, attempts_count: 7, subjects: ["Biology", "Mathematics"] },
    ]
  },
  { 
    student_id: 2, 
    id: 2, 
    name: "Theemo Thee", 
    total_score: 85, 
    points: 85, 
    average_score: 42, 
    highest_score: 75, 
    total_attempts: 12, 
    total_correct_answers: 85, 
    rank: 2, 
    profile_picture: null,
    today_points: 15,
    today_subjects: ["Physics"],
    most_practiced_subject: "Physics",
    subject_breakdowns: [
      { subject: "Physics", accumulated_score: 55, total_attempts: 8, total_correct: 55, total_questions: 90, highest_score: 75, avg_score: 61, today_score: 15, today_attempts: 1 },
      { subject: "Chemistry", accumulated_score: 30, total_attempts: 4, total_correct: 30, total_questions: 50, highest_score: 60, avg_score: 50, today_score: 0, today_attempts: 0 },
    ],
    daily_timeline: [
      { date: "2026-08-24", points_accumulated: 15, attempts_count: 1, subjects: ["Physics"] },
    ]
  },
  { 
    student_id: 3, 
    id: 3, 
    name: "I am Themothee", 
    total_score: 62, 
    points: 62, 
    average_score: 38, 
    highest_score: 70, 
    total_attempts: 9, 
    total_correct_answers: 62, 
    rank: 3, 
    profile_picture: null,
    today_points: 0,
    today_subjects: [],
    most_practiced_subject: "Chemistry",
    subject_breakdowns: [
      { subject: "Chemistry", accumulated_score: 42, total_attempts: 6, total_correct: 42, total_questions: 70, highest_score: 70, avg_score: 60, today_score: 0, today_attempts: 0 },
      { subject: "Mathematics", accumulated_score: 20, total_attempts: 3, total_correct: 20, total_questions: 40, highest_score: 50, avg_score: 45, today_score: 0, today_attempts: 0 },
    ],
    daily_timeline: []
  }
];

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Track expanded student IDs (supports expanding any status bar in-place)
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [studentDetailsMap, setStudentDetailsMap] = useState({});
  const [detailLoadingMap, setDetailLoadingMap] = useState({});
  const [activeTabMap, setActiveTabMap] = useState({}); // student_id -> 'subjects' | 'timeline'

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  // Fetch Leaderboard List
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("staff_token");

      let rawData = [];
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/dashboard/leaderboard`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              Accept: "application/json"
            },
          }
        );
        if (response.data && response.data.success) {
          rawData = response.data.data || [];
        } else if (response.data?.data) {
          rawData = response.data.data;
        } else if (Array.isArray(response.data)) {
          rawData = response.data;
        }
      } catch (adminErr) {
        try {
          const studentRes = await axios.get(
            `${API_BASE_URL}/api/students/leaderboard`,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
              },
            }
          );
          if (Array.isArray(studentRes.data)) {
            rawData = studentRes.data;
          } else if (studentRes.data?.data && Array.isArray(studentRes.data.data)) {
            rawData = studentRes.data.data;
          }
        } catch (studentErr) {
          console.warn("Leaderboard endpoint notice:", studentErr?.message);
        }
      }

      if (Array.isArray(rawData) && rawData.length > 0) {
        const normalized = rawData.map((item, idx) => {
          const rawBreakdowns = item.subject_breakdowns || item.subjects || [];
          let subjectBreakdowns = [];

          if (Array.isArray(rawBreakdowns) && rawBreakdowns.length > 0) {
            subjectBreakdowns = rawBreakdowns.map(sb => ({
              subject: sb.subject || sb.subject_name || "General",
              accumulated_score: Number(sb.accumulated_score || sb.total_score || sb.score || 0),
              total_attempts: Number(sb.total_attempts || sb.attempts_count || 1),
              total_correct: Number(sb.total_correct || sb.correct_answers || 0),
              total_questions: Number(sb.total_questions || sb.questions_count || 0),
              highest_score: Number(sb.highest_score || sb.max_score || 0),
              avg_score: Number(sb.avg_score || sb.average_score || 0),
              today_score: Number(sb.today_score || sb.daily_score || 0),
              today_attempts: Number(sb.today_attempts || 0),
            }));
          }

          return {
            student_id: item.student_id || item.id || idx + 1,
            id: item.student_id || item.id || idx + 1,
            name: item.name || `${item.firstname || ''} ${item.surname || ''}`.trim() || "Student",
            average_score: Number(item.average_score || item.avgAccuracy || 0),
            highest_score: Number(item.highest_score || item.highestScore || 0),
            total_attempts: Number(item.total_attempts || item.totalAttempts || 0),
            total_correct_answers: Number(item.total_correct_answers || 0),
            total_score: Number(item.total_score || item.points || 0),
            points: Number(item.total_score || item.points || 0),
            rank: item.rank || idx + 1,
            profile_picture: item.profile_picture || item.avatar || null,
            today_points: Number(item.today_points || item.daily_points || 0),
            today_subjects: Array.isArray(item.today_subjects) ? item.today_subjects : [],
            most_practiced_subject: item.most_practiced_subject || "General Studies",
            subject_breakdowns: subjectBreakdowns,
            daily_timeline: item.daily_timeline || []
          };
        });
        setStudents(normalized);
        const initialMap = {};
        normalized.forEach(s => {
          if (s.subject_breakdowns.length > 0) initialMap[s.student_id] = s;
        });
        setStudentDetailsMap(initialMap);
      } else {
        setStudents(FALLBACK_LEADERBOARD);
      }
      setError("");
    } catch (err) {
      console.warn("Using fallback leaderboard data:", err?.message);
      setStudents(FALLBACK_LEADERBOARD);
      setError("");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Fetch Deep Student Detail on Expand
  const fetchStudentDetail = async (studentId) => {
    if (studentDetailsMap[studentId]?.subject_breakdowns?.length > 0) {
      return; // Already loaded
    }

    setDetailLoadingMap(prev => ({ ...prev, [studentId]: true }));
    const token = localStorage.getItem("staff_token");

    try {
      let detailRes = null;
      try {
        detailRes = await axios.get(
          `${API_BASE_URL}/api/admin/dashboard/leaderboard/students/${studentId}`,
          { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
        );
      } catch (e1) {
        try {
          detailRes = await axios.get(
            `${API_BASE_URL}/api/admin/leaderboard/students/${studentId}`,
            { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
          );
        } catch (e2) {
          detailRes = await axios.get(
            `${API_BASE_URL}/api/students/exams/results/history?student_id=${studentId}`,
            { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
          );
        }
      }

      const resData = detailRes?.data?.data || detailRes?.data;
      if (resData) {
        setStudentDetailsMap(prev => ({
          ...prev,
          [studentId]: resData
        }));
      }
    } catch (err) {
      console.warn("Detail fetch fallback used:", err?.message);
    } finally {
      setDetailLoadingMap(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleToggleExpand = (student) => {
    if (expandedStudentId === student.student_id) {
      setExpandedStudentId(null);
    } else {
      setExpandedStudentId(student.student_id);
      fetchStudentDetail(student.student_id);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // Separate Top 3 Podium and Rest
  const top1 = students[0] || null;
  const top2 = students[1] || null;
  const top3 = students[2] || null;
  const listStudents = filteredStudents.filter(s => s.rank > 3);

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Helper to render the expanded status bar drawer
  const renderExpandedDrawer = (student) => {
    const detail = studentDetailsMap[student.student_id] || student;
    const isLoading = detailLoadingMap[student.student_id];
    const activeTab = activeTabMap[student.student_id] || "subjects";
    const breakdowns = detail.subject_breakdowns || student.subject_breakdowns || [];
    const timeline = detail.daily_timeline || student.daily_timeline || [];

    return (
      <div 
        id={`expanded-panel-${student.student_id}`}
        className="overflow-hidden border-t border-amber-300/40 dark:border-white/5 pt-5 mt-4 space-y-5"
      >
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-amber-300/30 dark:border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTabMap(prev => ({ ...prev, [student.student_id]: "subjects" }));
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "subjects"
                  ? "bg-[#0F2843] text-white dark:bg-white dark:text-gray-900 shadow-md font-extrabold"
                  : "bg-black/5 dark:bg-white/10 text-[#0F2843] dark:text-white hover:bg-black/10 dark:hover:bg-white/20"
              }`}
            >
              <AcademicCapIcon className="w-4 h-4" /> Subject Breakdown & Points
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTabMap(prev => ({ ...prev, [student.student_id]: "timeline" }));
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "timeline"
                  ? "bg-[#0F2843] text-white dark:bg-white dark:text-gray-900 shadow-md font-extrabold"
                  : "bg-black/5 dark:bg-white/10 text-[#0F2843] dark:text-white hover:bg-black/10 dark:hover:bg-white/20"
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4" /> Daily Points by Date
            </button>
          </div>

          <div className="text-[11px] font-bold text-[#0F2843]/80 dark:text-white/80 flex items-center gap-2">
            <span>Dominant Focus: <strong className="text-[#0F2843] dark:text-white">{detail.most_practiced_subject || student.most_practiced_subject}</strong></span>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-3 border-amber-600 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-[10px] font-bold text-[#0F2843]/80 dark:text-white/70 uppercase tracking-widest">Loading Live Intelligence...</p>
          </div>
        )}

        {/* TAB 1: SUBJECT BREAKDOWN WITH STRICT GREEN / RED PASS-FAIL INDICATORS */}
        {!isLoading && activeTab === "subjects" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#0F2843] dark:text-white/80">
              <span>All Attempted Subjects ({breakdowns.length})</span>
              <span className="text-[10px] text-gray-500 dark:text-white/60">Condition: &ge; 50 Pts (Green) • &lt; 50 Pts (Red)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {breakdowns.map((sb, idx) => {
                const isPassing = sb.accumulated_score >= 50;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
                      isPassing
                        ? "bg-emerald-50/90 border-emerald-300 shadow-sm dark:bg-emerald-950/40 dark:border-emerald-500/50 dark:shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/20"
                        : "bg-rose-50/90 border-rose-300 shadow-sm dark:bg-rose-950/40 dark:border-rose-500/50 dark:shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-400/20"
                    }`}
                  >
                    {/* Background glow orb */}
                    <div 
                      className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40 ${
                        isPassing ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />

                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`p-2.5 rounded-xl shadow-inner ${
                            isPassing 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30" 
                              : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                          }`}
                        >
                          <BookOpenIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-sm text-[#0F2843] dark:text-white">
                              {sb.subject}
                            </h5>
                            {isPassing ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                &ge; 50 Pts
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                &lt; 50 Pts
                              </span>
                            )}
                          </div>
                          
                          <div className="text-[11px] text-gray-600 dark:text-white/70 mt-1 flex items-center gap-2 flex-wrap">
                            <span>Attempts: <strong>{sb.total_attempts}</strong></span>
                            <span>•</span>
                            <span>Correct: <strong className="text-emerald-600 dark:text-emerald-400">{sb.total_correct}</strong> / {sb.total_questions || "—"}</span>
                            {sb.accuracy_percentage !== undefined && (
                              <>
                                <span>•</span>
                                <span>Acc: <strong>{sb.accuracy_percentage}%</strong></span>
                              </>
                            )}
                            <span>•</span>
                            <span>High: <strong>{sb.highest_score}%</strong></span>
                          </div>

                          {/* Question Bank Coverage Bar (if bank data available) */}
                          {sb.total_questions_in_bank > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-white/10 space-y-1">
                              <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-white/60">
                                <span>Bank Coverage ({sb.unique_questions_answered || sb.total_questions} / {sb.total_questions_in_bank} Qs)</span>
                                <strong className="text-[#0F2843] dark:text-[#C5A97A] font-mono">{sb.bank_coverage_percentage}%</strong>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                                  style={{ width: `${Math.min(100, sb.bank_coverage_percentage || 0)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Accumulated Score Pill */}
                      <div 
                        className={`text-right py-2 px-3.5 rounded-xl border backdrop-blur-md shrink-0 ${
                          isPassing 
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm dark:bg-emerald-900/60 dark:border-emerald-500/40 dark:text-emerald-300" 
                            : "bg-rose-100 text-rose-900 border-rose-300 shadow-sm dark:bg-rose-900/60 dark:border-rose-500/40 dark:text-rose-300"
                        }`}
                      >
                        <span className="text-[8px] font-black uppercase tracking-wider block opacity-75">
                          Score
                        </span>
                        <span className="text-sm font-black">
                          {sb.accumulated_score} Pts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {breakdowns.length === 0 && (
                <div className="col-span-2 py-8 text-center text-gray-500 dark:text-white/60 bg-white/40 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                  <ChartPieIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">No subject practice recorded for this student yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DAILY POINTS TIMELINE */}
        {!isLoading && activeTab === "timeline" && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#0F2843] dark:text-white/80">
              Points Accumulated by Date ({timeline.length} Sessions)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {timeline.map((tl, i) => (
                <div 
                  key={i}
                  className="p-3.5 rounded-xl bg-white/80 dark:bg-black/30 border border-gray-200 dark:border-white/10 backdrop-blur-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-[#0F2843] dark:text-white">
                      <CalendarDaysIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0F2843] dark:text-white">{new Date(tl.date).toDateString()}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(tl.subjects || []).map((sub, sIdx) => (
                          <span key={sIdx} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-white/20 text-gray-800 dark:text-white border border-gray-200 dark:border-transparent">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">+{tl.points_accumulated} Pts</span>
                    <span className="text-[9px] font-bold text-gray-500 dark:text-white/60">{tl.attempts_count} exams</span>
                  </div>
                </div>
              ))}

              {timeline.length === 0 && (
                <div className="col-span-2 py-8 text-center text-gray-500 dark:text-white/60 bg-white/40 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                  <p className="text-xs font-bold">No daily practice history found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <StaffDashboardLayout pagetitle="Student Leadership Board">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl bg-white/90 dark:bg-gray-800/80 rounded-[32px] p-6 md:p-8 border border-gray-200/60 dark:border-gray-700/60 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Student Leadership Board</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Status Bar Engine
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">
                Click any status bar to expand live subject mastery, pass/fail indicators, and daily timeline.
              </p>
            </div>
          </div>
          
          <button 
            onClick={fetchLeaderboard}
            disabled={loading}
            className="flex items-center justify-center gap-2 self-start md:self-auto px-5 py-3 bg-[#0F2843] hover:bg-[#09314F] disabled:bg-gray-400 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md relative z-10"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh data
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4 text-sm text-red-500 font-bold flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && students.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Rankings...</p>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* TOP 3 PODIUM: EXPANDABLE GLOWING STATUS BARS (GOLD/SILVER/BRONZE) */}
            {/* ======================================================== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-[#0F2843] dark:text-gray-400 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-amber-500" />
                  Top 3 Podium Leaders (Click to Expand)
                </h2>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Live Glowing Status Bars</span>
              </div>

              {/* 1. RANK 1: GOLD GLOWING STATUS BAR */}
              {top1 && (
                <div
                  onClick={() => handleToggleExpand(top1)}
                  className={`status-bar-card rounded-3xl p-5 md:p-6 transition-all duration-300 cursor-pointer backdrop-blur-xl border relative overflow-hidden group ${
                    expandedStudentId === top1.student_id
                      ? "bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border-amber-400 shadow-xl ring-2 ring-amber-400/50 dark:from-amber-600/30 dark:via-yellow-600/20 dark:to-stone-900/90 dark:border-amber-400 dark:shadow-[0_0_40px_rgba(245,158,11,0.3)] dark:ring-2 dark:ring-amber-400/40"
                      : "bg-gradient-to-r from-amber-100/90 via-yellow-50 to-amber-200/70 hover:from-amber-100 border-amber-300/80 shadow-md ring-1 ring-amber-400/30 hover:border-amber-400 dark:from-amber-500/15 dark:via-yellow-500/10 dark:to-stone-900/80 dark:hover:from-amber-500/25 dark:border-amber-400/50 dark:shadow-[0_10px_30px_rgba(245,158,11,0.15)] dark:ring-1 dark:ring-amber-400/30 dark:hover:border-amber-300 dark:hover:shadow-[0_15px_45px_rgba(245,158,11,0.25)]"
                  }`}
                >
                  {/* Glowing ambient light */}
                  <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Main Status Bar Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      {/* Rank 1 Gold Crown Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/30 shrink-0 border border-amber-300">
                        <TrophyIcon className="w-6 h-6" />
                      </div>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {top1.profile_picture ? (
                          <img 
                            src={top1.profile_picture.startsWith("http") ? top1.profile_picture : `${API_BASE_URL}/storage/${top1.profile_picture}`} 
                            alt={top1.name} 
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md ring-2 ring-amber-400/40"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-xl border-2 border-amber-400 shadow-md ring-2 ring-amber-400/40">
                            {getInitials(top1.name)}
                          </div>
                        )}
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-amber-950 shadow">#1</span>
                      </div>

                      {/* Student Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base md:text-lg font-black text-[#0F2843] dark:text-white">{top1.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300 border border-amber-400/40">
                            Champion
                          </span>
                        </div>
                        <p className="text-[11px] text-[#0F2843]/80 dark:text-amber-200/80 font-bold mt-0.5">
                          ID: #{top1.student_id} • Focus: <strong className="text-[#0F2843] dark:text-amber-200">{top1.most_practiced_subject}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Stats Pill Columns */}
                    <div className="flex items-center gap-3 md:gap-6 flex-wrap self-end md:self-center">
                      <div className="bg-white/90 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-300/60 dark:border-amber-400/20 text-center min-w-[90px] shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0F2843]/70 dark:text-amber-300/70 block">Attempts</span>
                        <span className="text-sm font-black text-[#0F2843] dark:text-white">{top1.total_attempts}</span>
                      </div>

                      <div className="bg-white/90 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-300/60 dark:border-amber-400/20 text-center min-w-[90px] shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0F2843]/70 dark:text-amber-300/70 block">Avg Accuracy</span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{top1.average_score}%</span>
                      </div>

                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-500/20 text-center min-w-[120px] border border-amber-300/40">
                        <span className="text-[9px] font-black uppercase tracking-wider block opacity-90">Total Accumulated</span>
                        <span className="text-base font-black">{top1.total_score} Points</span>
                      </div>

                      <button className="p-2.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all">
                        {expandedStudentId === top1.student_id ? (
                          <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable In-Place Subject & Date Drawer */}
                  {expandedStudentId === top1.student_id && renderExpandedDrawer(top1)}
                </div>
              )}

              {/* 2. RANK 2: SILVER GLOWING STATUS BAR */}
              {top2 && (
                <div
                  onClick={() => handleToggleExpand(top2)}
                  className={`status-bar-card rounded-3xl p-5 md:p-6 transition-all duration-300 cursor-pointer backdrop-blur-xl border relative overflow-hidden group ${
                    expandedStudentId === top2.student_id
                      ? "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 border-slate-400 shadow-xl ring-2 ring-slate-400/50 dark:from-slate-500/30 dark:via-slate-600/20 dark:to-slate-950/90 dark:border-slate-300 dark:shadow-[0_0_40px_rgba(203,213,225,0.3)] dark:ring-2 dark:ring-slate-300/40"
                      : "bg-gradient-to-r from-slate-100/95 via-slate-50 to-slate-200/70 hover:from-slate-100 border-slate-300/80 shadow-md ring-1 ring-slate-300/40 dark:from-slate-400/15 dark:via-slate-300/10 dark:to-slate-950/80 dark:hover:from-slate-400/25 dark:border-slate-300/50 dark:shadow-[0_10px_30px_rgba(203,213,225,0.15)] dark:ring-1 dark:ring-slate-300/30 dark:hover:border-slate-200 dark:hover:shadow-[0_15px_45px_rgba(203,213,225,0.25)]"
                  }`}
                >
                  <div className="absolute top-0 right-1/4 w-72 h-72 bg-slate-300/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Main Status Bar Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      {/* Rank 2 Silver Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-slate-400/20 shrink-0 border border-slate-300">
                        2
                      </div>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {top2.profile_picture ? (
                          <img 
                            src={top2.profile_picture.startsWith("http") ? top2.profile_picture : `${API_BASE_URL}/storage/${top2.profile_picture}`} 
                            alt={top2.name} 
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-400 shadow-md ring-2 ring-slate-400/40"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-slate-400/20 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xl border-2 border-slate-400 shadow-md ring-2 ring-slate-400/40">
                            {getInitials(top2.name)}
                          </div>
                        )}
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-slate-400 text-white shadow">#2</span>
                      </div>

                      {/* Student Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base md:text-lg font-black text-[#0F2843] dark:text-white">{top2.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-300/30 text-slate-800 dark:bg-slate-300/20 dark:text-slate-200 border border-slate-400/40">
                            Silver Runner-Up
                          </span>
                        </div>
                        <p className="text-[11px] text-[#0F2843]/80 dark:text-slate-300/80 font-bold mt-0.5">
                          ID: #{top2.student_id} • Focus: <strong className="text-[#0F2843] dark:text-slate-300">{top2.most_practiced_subject}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Stats Pill Columns */}
                    <div className="flex items-center gap-3 md:gap-6 flex-wrap self-end md:self-center">
                      <div className="bg-white/90 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-300/60 dark:border-slate-300/20 text-center min-w-[90px] shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0F2843]/70 dark:text-slate-300/70 block">Attempts</span>
                        <span className="text-sm font-black text-[#0F2843] dark:text-white">{top2.total_attempts}</span>
                      </div>

                      <div className="bg-white/90 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-300/60 dark:border-slate-300/20 text-center min-w-[90px] shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0F2843]/70 dark:text-slate-300/70 block">Avg Accuracy</span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{top2.average_score}%</span>
                      </div>

                      <div className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-slate-400/20 text-center min-w-[120px] border border-slate-300/40">
                        <span className="text-[9px] font-black uppercase tracking-wider block opacity-90">Total Accumulated</span>
                        <span className="text-base font-black">{top2.total_score} Points</span>
                      </div>

                      <button className="p-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all">
                        {expandedStudentId === top2.student_id ? (
                          <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Drawer */}
                  {expandedStudentId === top2.student_id && renderExpandedDrawer(top2)}
                </div>
              )}

              {/* 3. RANK 3: BRONZE GLOWING STATUS BAR */}
              {top3 && (
                <div
                  onClick={() => handleToggleExpand(top3)}
                  className={`status-bar-card rounded-3xl p-5 md:p-6 transition-all duration-300 cursor-pointer backdrop-blur-xl border relative overflow-hidden group ${
                    expandedStudentId === top3.student_id
                      ? "bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 border-amber-500 shadow-xl ring-2 ring-amber-500/50 dark:from-amber-800/30 dark:via-orange-900/20 dark:to-stone-950/90 dark:border-amber-600 dark:shadow-[0_0_40px_rgba(180,83,9,0.3)] dark:ring-2 dark:ring-amber-600/40"
                      : "bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-200/70 hover:from-amber-100 border-amber-400/60 shadow-md ring-1 ring-amber-400/30 dark:from-amber-700/15 dark:via-orange-600/10 dark:to-stone-950/80 dark:hover:from-amber-700/25 dark:border-amber-600/50 dark:shadow-[0_10px_30px_rgba(180,83,9,0.15)] dark:ring-1 dark:ring-amber-600/30 dark:hover:border-amber-500 dark:hover:shadow-[0_15px_45px_rgba(180,83,9,0.25)]"
                  }`}
                >
                  <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-700/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Main Status Bar Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      {/* Rank 3 Bronze Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-amber-700/20 shrink-0 border border-amber-500">
                        3
                      </div>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {top3.profile_picture ? (
                          <img 
                            src={top3.profile_picture.startsWith("http") ? top3.profile_picture : `${API_BASE_URL}/storage/${top3.profile_picture}`} 
                            alt={top3.name} 
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-600 shadow-md ring-2 ring-amber-600/40"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-amber-700/20 text-amber-800 dark:text-amber-200 flex items-center justify-center font-black text-xl border-2 border-amber-600 shadow-md ring-2 ring-amber-600/40">
                            {getInitials(top3.name)}
                          </div>
                        )}
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-600 text-white shadow">#3</span>
                      </div>

                      {/* Student Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base md:text-lg font-black text-[#0F2843] dark:text-white">{top3.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-700/20 text-amber-900 dark:bg-amber-700/20 dark:text-amber-200 border border-amber-600/30">
                            Bronze Finalist
                          </span>
                        </div>
                        <p className="text-[11px] text-[#0F2843]/80 dark:text-amber-200/80 font-bold mt-0.5">
                          ID: #{top3.student_id} • Focus: <strong className="text-[#0F2843] dark:text-amber-200">{top3.most_practiced_subject}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Stats Pill Columns */}
                    <div className="flex items-center gap-3 md:gap-6 flex-wrap self-end md:self-center">
                      <div className="bg-white/90 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-400/50 dark:border-amber-600/20 text-center min-w-[90px] shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0F2843]/70 dark:text-amber-200/70 block">Attempts</span>
                        <span className="text-sm font-black text-[#0F2843] dark:text-white">{top3.total_attempts}</span>
                      </div>

                      <div className="bg-white/90 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-400/50 dark:border-amber-600/20 text-center min-w-[90px] shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0F2843]/70 dark:text-amber-200/70 block">Avg Accuracy</span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{top3.average_score}%</span>
                      </div>

                      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-700/20 text-center min-w-[120px] border border-amber-500/40">
                        <span className="text-[9px] font-black uppercase tracking-wider block opacity-90">Total Accumulated</span>
                        <span className="text-base font-black">{top3.total_score} Points</span>
                      </div>

                      <button className="p-2.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all">
                        {expandedStudentId === top3.student_id ? (
                          <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Drawer */}
                  {expandedStudentId === top3.student_id && renderExpandedDrawer(top3)}
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* FULL RANKINGS SECTION (RANKS 4+) WITH EXPANDABLE GLASS STATUS BARS */}
            {/* ======================================================== */}
            <div className="space-y-4 pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                  <h3 className="text-sm font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Full Leaderboard Roster</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Click any student status bar to expand full subject breakdown & daily points</p>
                </div>

                <div className="relative w-full md:max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search student by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700/60 focus:border-amber-400 text-gray-900 dark:text-white font-bold text-sm outline-none backdrop-blur-md transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Ranks 4+ Expandable Status Bar List */}
              <div className="space-y-3">
                {listStudents.length > 0 ? (
                  listStudents.map((student) => {
                    const isExpanded = expandedStudentId === student.student_id;

                    return (
                      <div
                        key={student.student_id}
                        onClick={() => handleToggleExpand(student)}
                        className={`status-bar-card rounded-2xl p-4 md:p-5 transition-all duration-300 cursor-pointer backdrop-blur-xl border relative overflow-hidden ${
                          isExpanded
                            ? "bg-slate-100 dark:bg-slate-900 text-[#0F2843] dark:text-white border-primary/60 shadow-xl ring-1 ring-primary/40"
                            : "bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white border-gray-200/80 dark:border-gray-700/60 hover:border-primary/40 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                          <div className="flex items-center gap-3.5">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-black text-xs shrink-0 border border-gray-200 dark:border-transparent">
                              {student.rank}
                            </span>

                            {student.profile_picture ? (
                              <img 
                                src={student.profile_picture.startsWith("http") ? student.profile_picture : `${API_BASE_URL}/storage/${student.profile_picture}`} 
                                alt={student.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-black text-xs">
                                {getInitials(student.name)}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-sm text-[#0F2843] dark:text-white">{student.name}</h4>
                                {student.today_points > 0 && (
                                  <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-0.5">
                                    <FireIcon className="w-3 h-3 text-emerald-600" /> +{student.today_points} Today
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                                Focus: <strong className="text-primary dark:text-blue-300">{student.most_practiced_subject}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Columns */}
                          <div className="flex items-center gap-4 self-end md:self-center">
                            <div className="text-center min-w-[70px]">
                              <span className="text-[8px] font-black uppercase text-gray-500 dark:text-gray-400 block">Attempts</span>
                              <span className="text-xs font-black text-[#0F2843] dark:text-white">{student.total_attempts}</span>
                            </div>

                            <div className="text-center min-w-[70px]">
                              <span className="text-[8px] font-black uppercase text-gray-500 dark:text-gray-400 block">Accuracy</span>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-500">{student.average_score}%</span>
                            </div>

                            <div className="text-center min-w-[90px] px-3 py-1.5 rounded-xl bg-gray-100/90 dark:bg-gray-700/60 border border-gray-200 dark:border-transparent">
                              <span className="text-[8px] font-black uppercase text-gray-500 dark:text-gray-400 block">Total Points</span>
                              <span className="text-xs font-black text-[#0F2843] dark:text-white">{student.total_score} Pts</span>
                            </div>

                            <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-300">
                              {isExpanded ? (
                                <ChevronUpIcon className="w-4 h-4" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Drawer */}
                        {isExpanded && renderExpandedDrawer(student)}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No students matching filter</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </StaffDashboardLayout>
  );
}
