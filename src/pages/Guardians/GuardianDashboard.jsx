import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import GuardianDashboardLayout from '../../components/private/Guardians/GuardianDashboardLayout';
import GuardianTopWardSelector from '../../components/private/Guardians/GuardianTopWardSelector';

export default function GuardianDashboard() {
  const navigate = useNavigate();
  
  const [guardian, setGuardian] = useState(null);
  const [dashboardWards, setDashboardWards] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Stats, Attendance & Performance Data
  const [performanceDetails, setPerformanceDetails] = useState(null);
  const [wardAttendance, setWardAttendance] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);

  // UI States
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('Scores');
  const [analysisTimeframe, setAnalysisTimeframe] = useState('This Month');
  const [openAccordion, setOpenAccordion] = useState('schedule');
  const [activeDayHover, setActiveDayHover] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // 1. Initial Load: Guardian Profile and Wards List
  useEffect(() => {
    const token = localStorage.getItem("guardian_token");
    const info = localStorage.getItem("guardian_info");

    if (!token) {
      navigate("/guardian/login");
      return;
    }
    if (info) {
      try { setGuardian(JSON.parse(info)); } catch (e) {}
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profileRes, wardsRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/guardians/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (profileRes.status === "fulfilled") {
          const data = profileRes.value.data?.data || profileRes.value.data?.guardian || profileRes.value.data || {};
          if (data.firstname) setGuardian(data);
        }

        if (wardsRes.status === "fulfilled") {
          const wardsList = wardsRes.value.data?.data || [];
          setDashboardWards(wardsList);
          if (wardsList.length > 0) {
            setSelectedStudentId(wardsList[0].id);
          }
        }
      } catch (error) {
        console.warn("Dashboard initial fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, API_BASE_URL]);

  const [wardSchedule, setWardSchedule] = useState([]);

  // 2. Fetch Detailed Stats & Attendance for Selected Ward
  const fetchWardStats = useCallback(async () => {
    if (!selectedStudentId) return;
    const token = localStorage.getItem("guardian_token");
    if (!token) return;

    try {
      const [detailsRes, attRes, subRes, repRes, schedRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/performance-details?per_page=6`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/attendance`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/subscription`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/weekly-report`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/classes/schedule`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (detailsRes.status === "fulfilled") setPerformanceDetails(detailsRes.value.data);
      if (attRes.status === "fulfilled") {
        const rawAtt = attRes.value.data?.attendance || [];
        setWardAttendance(Array.isArray(rawAtt) ? rawAtt : []);
      }
      if (subRes.status === "fulfilled") setSubscription(subRes.value.data);
      if (repRes.status === "fulfilled") setWeeklyReport(repRes.value.data);
      if (schedRes.status === "fulfilled") {
        const rawSched = schedRes.value.data?.data || [];
        setWardSchedule(Array.isArray(rawSched) ? rawSched : []);
      }
    } catch (error) {
      console.error("Failed to fetch ward stats:", error);
    }
  }, [selectedStudentId, API_BASE_URL]);

  useEffect(() => {
    fetchWardStats();
  }, [fetchWardStats]);

  const selectedWard = dashboardWards.find(w => w.id === selectedStudentId);

  // Derived Analytics Data
  const subjects = performanceDetails?.subject_breakdowns || [];
  const recentHistory = performanceDetails?.history?.data || [];

  // Subscription Lifecycle Calculation (Model A)
  const totalPlanDays = 30;
  const daysLeft = typeof subscription?.days_left === 'number' ? subscription.days_left : 9;
  const daysUsed = Math.max(0, Math.min(totalPlanDays, totalPlanDays - daysLeft));
  const elapsedCyclePct = Math.min(100, Math.max(0, Math.round((daysUsed / totalPlanDays) * 100)));
  const isNearExpiry = elapsedCyclePct >= 80;



  // Dynamic Weekly Study Frequency from Attendance & Login/Logout backend calculation
  const weeklyStudyDays = weeklyReport?.weekly_study_days && weeklyReport.weekly_study_days.length === 7
    ? weeklyReport.weekly_study_days
    : [
        { day: "M", full: "Mon", hours: "0m", hours_formatted: "0m", questions: 0, questions_answered: 0, pct: 10 },
        { day: "T", full: "Tue", hours: "0m", hours_formatted: "0m", questions: 0, questions_answered: 0, pct: 10 },
        { day: "W", full: "Wed", hours: "0m", hours_formatted: "0m", questions: 0, questions_answered: 0, pct: 10 },
        { day: "T", full: "Thu", hours: "0m", hours_formatted: "0m", questions: 0, questions_answered: 0, pct: 10 },
        { day: "F", full: "Fri", hours: "0m", hours_formatted: "0m", questions: 0, questions_answered: 0, pct: 10 },
        { day: "S", full: "Sat", hours: "0m", hours_formatted: "0m", questions: 0, questions_answered: 0, pct: 10 },
        { day: "S", full: "Sun", hours: "0m", hours_formatted: "0m", questions: 0, questions_answered: 0, pct: 10 },
      ];

  const totalWeeklyQuestions = Number(
    weeklyReport?.total_questions ?? (performanceDetails?.summary?.total_questions_attempted ?? (weeklyReport?.total_attempts ? weeklyReport.total_attempts * 40 : 0))
  );
  const lastActiveSessionText = weeklyReport?.last_active_session || "No practice recorded";

  const subjectBarColors = [
    { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
    { bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
    { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
    { bg: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
    { bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
    { bg: "bg-teal-500", text: "text-teal-600 dark:text-teal-400" },
  ];

  const monthlyCapsules = subjects.length > 0 
    ? subjects.slice(0, 7).map((s, idx) => ({
        label: s.subject_name.substring(0, 3).toUpperCase(),
        fullName: s.subject_name,
        value: activeAnalysisTab === 'Statistics' ? s.total_questions_attempted || 40 : s.average_score,
        heightPct: activeAnalysisTab === 'Statistics' ? Math.min(100, Math.max(25, (s.total_questions_attempted || 40) / 2)) : Math.min(100, Math.max(20, s.average_score)),
        subColor: subjectBarColors[idx % subjectBarColors.length]
      }))
    : [
        { label: "MTH", fullName: "Mathematics", value: activeAnalysisTab === 'Statistics' ? 85 : 78, heightPct: 78, subColor: subjectBarColors[0] },
        { label: "ENG", fullName: "English", value: activeAnalysisTab === 'Statistics' ? 60 : 72, heightPct: 72, subColor: subjectBarColors[1] },
        { label: "PHY", fullName: "Physics", value: activeAnalysisTab === 'Statistics' ? 95 : 65, heightPct: 65, subColor: subjectBarColors[2] },
        { label: "CHM", fullName: "Chemistry", value: activeAnalysisTab === 'Statistics' ? 110 : 82, heightPct: 82, subColor: subjectBarColors[3] },
        { label: "BIO", fullName: "Biology", value: activeAnalysisTab === 'Statistics' ? 75 : 88, heightPct: 88, subColor: subjectBarColors[4] },
        { label: "ECN", fullName: "Economics", value: activeAnalysisTab === 'Statistics' ? 50 : 60, heightPct: 60, subColor: subjectBarColors[5] },
        { label: "GOV", fullName: "Government", value: activeAnalysisTab === 'Statistics' ? 40 : 55, heightPct: 55, subColor: subjectBarColors[6] },
      ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071927] flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#C5A97A]/20 border-t-[#C5A97A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GuardianDashboardLayout guardianData={guardian}>
      {/* ── TOP HEADER BAR: Welcome Greeting & Ward Selector ──────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-black text-[#C5A97A] tracking-widest uppercase">Guardian Oversight</p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#09314F] dark:text-white tracking-tight">
              Welcome Back, {guardian?.surname || guardian?.firstname || "Guardian"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/guardian/performance"
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/80 transition-all"
            >
              <Icon icon="lucide:trending-up" className="w-4 h-4 text-[#C5A97A]" />
              <span>Full Analytics</span>
            </Link>

            <Link
              to="/guardian/payments"
              className="flex items-center gap-2 px-3.5 py-2 bg-[#09314F] hover:bg-[#0d3f66] dark:bg-[#C5A97A] dark:hover:bg-[#b09262] text-white dark:text-[#09314F] font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Icon icon="lucide:credit-card" className="w-4 h-4" />
              <span>Renew Plan</span>
            </Link>
          </div>
        </div>

        {/* UNIFIED TOP WARD SELECTOR */}
        <GuardianTopWardSelector
          wards={dashboardWards}
          selectedWardId={selectedStudentId}
          onSelectWard={(id) => id !== 'all' ? setSelectedStudentId(id) : null}
          showAllOption={false}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ASYMMETRIC BENTO GRID (Responsive Mobile & Desktop Layout)          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        
        {/* ── LEFT & CENTER 8 COLS ──────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-5 lg:space-y-6">
          
          {/* ── TOP SUB-ROW: Activity Insight + Recent CBT Activity Stream ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
            
            {/* CARD 1: ACTIVITY INSIGHT HERO BANNER (Driven by login/logout & attendance) */}
            <div className="md:col-span-7 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 text-white relative overflow-hidden shadow-xl bg-[#082842] flex flex-col justify-between min-h-[280px]">
              {/* Fluid wave background effect */}
              <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                <svg viewBox="0 0 500 500" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,100 C150,200 350,0 500,100 L500,0 L0,0 Z" fill="url(#wave-gradient-1)" opacity="0.8"></path>
                  <path d="M0,250 C180,100 300,380 500,200 L500,500 L0,500 Z" fill="url(#wave-gradient-2)" opacity="0.6"></path>
                  <defs>
                    <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Top Bar inside Banner */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center justify-center border border-emerald-400/40">
                    <Icon icon="lucide:activity" className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-black tracking-wide text-white uppercase">Activity Insight</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Practice
                  </span>
                </div>
              </div>

              {/* Main Metric & Mini Chart Grid */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end mt-4">
                
                {/* Left: Study Questions Completed */}
                <div className="sm:col-span-5 space-y-2">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                        {totalWeeklyQuestions}
                      </p>
                      <span className="text-xs sm:text-sm font-bold text-white/80 uppercase tracking-wider">
                        Questions Answered
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-300 mt-1 flex items-center gap-1">
                      <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-emerald-400" />
                      CBT Questions Attempted This Week
                    </p>
                  </div>

                  <div className="bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                      <Icon icon="lucide:clock" className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/60 font-bold leading-none">Last Active Session</p>
                      <p className="text-[11px] font-black text-white leading-tight mt-0.5">
                        {lastActiveSessionText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Embedded Weekly Study Frequency Widget */}
                <div className="sm:col-span-7 bg-white dark:bg-[#071927] rounded-3xl p-3.5 text-gray-800 dark:text-white shadow-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Weekly Engagement</span>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                      {weeklyReport?.total_hours ? `${weeklyReport.total_hours} Active` : (weeklyReport?.total_minutes ? `${weeklyReport.total_minutes}m Active` : "0m Active")}
                    </span>
                  </div>

                  <div className="flex items-end justify-between h-24 pt-2 gap-1.5">
                    {weeklyStudyDays.map((dayItem, dIdx) => {
                      const isHovered = activeDayHover === dIdx;
                      const qCount = dayItem.questions_answered ?? (dayItem.questions || 0);
                      const timeStr = dayItem.hours_formatted || dayItem.hours || "0m";
                      const hasActivity = (dayItem.minutes_active || 0) > 0 || qCount > 0;

                      return (
                        <div
                          key={dIdx}
                          onMouseEnter={() => setActiveDayHover(dIdx)}
                          onMouseLeave={() => setActiveDayHover(null)}
                          className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer group relative"
                        >
                          {isHovered && (
                            <div className="absolute -top-7 bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap z-20">
                              {dayItem.full || dayItem.day}: {timeStr} • {qCount} Questions
                            </div>
                          )}
                          <div className="w-full max-w-[18px] bg-gray-100 dark:bg-gray-800 h-20 rounded-full flex flex-col justify-end p-0.5 overflow-hidden">
                            <div
                              className={`w-full rounded-full transition-all duration-500 bg-gradient-to-t ${
                                hasActivity
                                  ? (dIdx % 2 === 0 ? "from-blue-600 to-cyan-400" : "from-emerald-500 to-teal-400")
                                  : "from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600"
                              }`}
                              style={{ height: `${Math.max(8, dayItem.pct || 8)}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                            {dayItem.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* CARD 2: RECENT PRACTICE ACTIVITY STREAM */}
            <div className="md:col-span-5 bg-white dark:bg-gray-800 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-black text-[#09314F] dark:text-white tracking-tight">
                    Recent CBT Activity
                  </h3>
                  <Link
                    to="/guardian/performance"
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#09314F] hover:text-white dark:bg-gray-700 dark:hover:bg-[#C5A97A] dark:hover:text-[#09314F] text-gray-700 dark:text-gray-200 flex items-center justify-center transition-all shadow-sm"
                  >
                    <Icon icon="lucide:arrow-up-right" className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex items-center gap-4 mb-4 text-[11px] font-bold text-gray-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                    Passed (≥50%)
                  </span>
                  <span className="flex items-center gap-1 text-rose-500">
                    <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5" />
                    Needs Practice
                  </span>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {recentHistory.length === 0 ? (
                    <div className="py-6 text-center text-gray-400 text-xs font-semibold">
                      No recent practice exams recorded.
                    </div>
                  ) : (
                    recentHistory.slice(0, 2).map((item, idx) => {
                      const isPassing = item.percentage >= 50;
                      return (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                              idx % 2 === 0
                                ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}>
                              <Icon icon="lucide:file-text" className="w-4 h-4" />
                            </div>
                            <div className="truncate max-w-[130px] sm:max-w-none">
                              <h4 className="text-xs font-black text-[#09314F] dark:text-white leading-tight truncate">
                                {item.subject_name} CBT
                              </h4>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                {item.correct_answers}/{item.total_questions} Correct • {item.duration_minutes || "<1"}m
                              </p>
                            </div>
                          </div>

                          <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-xl shrink-0 ${
                            isPassing
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                          }`}>
                            {item.percentage}%
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <Link
                to="/guardian/performance"
                className="text-center text-[11px] font-black text-[#C5A97A] hover:underline mt-3 block"
              >
                View Full Test Records →
              </Link>
            </div>

          </div>

          {/* ── BOTTOM WIDE ROW: Academic Practice Analysis ── */}
          <div className="bg-white dark:bg-gray-800 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 lg:p-7 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:bar-chart" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#09314F] dark:text-white tracking-tight">
                    {activeAnalysisTab === 'Scores' && "Subject CBT Score Distribution"}
                    {activeAnalysisTab === 'Statistics' && "Practice Question Volume Tracking"}
                    {activeAnalysisTab === 'Insight' && "Automated Academic Health Diagnosis"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {activeAnalysisTab === 'Scores' && "Average CBT percentage score benchmark across enrolled subjects"}
                    {activeAnalysisTab === 'Statistics' && "Total questions attempted and practice test volume"}
                    {activeAnalysisTab === 'Insight' && "Direct feedback on strongest subjects and areas needing review"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl text-xs font-bold">
                  {['Scores', 'Statistics', 'Insight'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveAnalysisTab(tab)}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        activeAnalysisTab === tab
                          ? "bg-white dark:bg-gray-800 text-[#09314F] dark:text-white shadow-sm font-black"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <select
                  value={analysisTimeframe}
                  onChange={(e) => setAnalysisTimeframe(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-900 text-xs font-bold rounded-2xl px-3 py-2 text-gray-700 dark:text-gray-200 border-none focus:outline-none"
                >
                  <option>This Month</option>
                  <option>This Term</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeAnalysisTab === 'Insight' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase">
                    <Icon icon="lucide:sparkles" className="w-4 h-4" />
                    <span>Strongest Subject</span>
                  </div>
                  <h4 className="text-base font-black text-gray-900 dark:text-white">
                    {subjects[0]?.subject_name || "Biology"} ({subjects[0]?.average_score || 88}% Avg)
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    High accuracy across syllabus topics. Ready for high-tier mock exam drills.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-xs uppercase">
                    <Icon icon="lucide:alert-triangle" className="w-4 h-4" />
                    <span>Needs Focus</span>
                  </div>
                  <h4 className="text-base font-black text-gray-900 dark:text-white">
                    {subjects[subjects.length - 1]?.subject_name || "Physics"} ({subjects[subjects.length - 1]?.average_score || 55}% Avg)
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    Calculations in core topics require additional practice tests to reach 75%+ target.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 space-y-2 sm:col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-xs uppercase">
                    <Icon icon="lucide:compass" className="w-4 h-4" />
                    <span>Weekly Objective</span>
                  </div>
                  <h4 className="text-base font-black text-gray-900 dark:text-white">
                    Target 200 Questions
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    Complete 5 timed CBT tests before the weekend to maintain steady mastery progress.
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-2 overflow-x-auto">
                <div className="min-w-[400px]">
                  {/* Top values row */}
                  <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2">
                    {monthlyCapsules.map((cap, idx) => (
                      <div key={idx} className="text-center">
                        <span className="text-[10px] sm:text-xs font-black font-mono text-gray-700 dark:text-gray-300">
                          {activeAnalysisTab === 'Statistics' ? `${cap.value} Qs` : `${cap.value}%`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pillar Tracks */}
                  <div className="grid grid-cols-7 gap-2 sm:gap-4 h-44 sm:h-48 items-end pb-2">
                    {monthlyCapsules.map((cap, idx) => (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group cursor-pointer">
                        <div className="w-full max-w-[48px] bg-gray-100 dark:bg-gray-900/80 h-full rounded-full flex flex-col justify-end p-1 relative overflow-hidden border border-gray-100 dark:border-gray-800">
                          <div className="absolute top-2 inset-x-0 h-8 opacity-20 bg-[radial-gradient(#C5A97A_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />
                          <div
                            className={`w-full rounded-full transition-all duration-700 shadow-md ${
                              idx % 2 === 0
                                ? "bg-gradient-to-t from-[#09314F] to-[#1a517c] dark:from-[#C5A97A] dark:to-[#e8d5b7]"
                                : "bg-gradient-to-t from-purple-600 to-indigo-500"
                            }`}
                            style={{ height: `${cap.heightPct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Labels row */}
                  <div className="grid grid-cols-7 gap-2 sm:gap-4 border-t border-gray-100 dark:border-gray-700/80 pt-3">
                    {monthlyCapsules.map((cap, idx) => (
                      <div key={idx} className="text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          {cap.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ── RIGHT COLUMN 4 COLS (Sidebar Hub) ───────────────────────── */}
        <div className="lg:col-span-4 space-y-5 lg:space-y-6">
          
          {/* 1. VIBRANT YELLOW SUBSCRIPTION CARD (Model A) */}
          <div className="bg-gradient-to-br from-[#F59E0B] via-[#EAB308] to-[#FACC15] text-[#09314F] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 400 300">
              <path d="M-20,150 Q100,50 200,160 T420,120" fill="none" stroke="#FFFFFF" strokeWidth="24" strokeLinecap="round" opacity="0.6" />
              <path d="M30,220 Q150,120 280,240 T420,180" fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
            </svg>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#09314F]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#09314F]">
                  Academic Access & Billing
                </h3>
              </div>
              {isNearExpiry && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#09314F] text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                  Renewal Alert
                </span>
              )}
            </div>

            <div className="relative z-10 space-y-3 mt-4">
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#09314F] leading-tight">
                  {subscription?.course_title || (selectedWard ? `${selectedWard.name}'s Prep Plan` : "WAEC & JAMB Intensive Plan")}
                </h4>
                <p className="text-xs font-bold text-[#09314F]/80 mt-0.5">
                  30-Day Cycle • {elapsedCyclePct}% Elapsed ({daysUsed} of {totalPlanDays} Days)
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-[#09314F]">
                  <span>50% Mid-Cycle</span>
                  <span>80% Alert</span>
                  <span>100% Expiry</span>
                </div>
                
                <div className="w-full bg-white/40 h-3 rounded-full overflow-hidden p-0.5 relative">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#09314F] via-purple-700 to-[#09314F]"
                    style={{ width: `${elapsedCyclePct}%` }}
                  />
                  <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/70" />
                  <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-white/70" />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-[#09314F]">
                    {daysLeft} DAYS
                  </span>
                  <span className="text-xs font-bold text-[#09314F]/70 uppercase">
                    / {subscription?.cost ? `₦${Number(subscription.cost).toLocaleString()}` : "₦10,000"}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#09314F]/70 mt-0.5">
                  {daysLeft > 0 ? "Remaining until cycle expiration" : "Subscription expired. Renew to resume CBT practice."}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <Link
                to="/guardian/payments"
                className="w-full py-3.5 bg-white text-[#09314F] hover:bg-gray-50 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-center"
              >
                <Icon icon="lucide:credit-card" className="w-4 h-4" />
                <span>{isNearExpiry ? "Renew Early (Maintain Access)" : "Renew Subscription"}</span>
              </Link>
            </div>
          </div>

          {/* 2. MASTERCLASS SCHEDULE & ATTENDANCE ACCORDIONS */}
          <div className="bg-white dark:bg-gray-800 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-4 divide-y divide-gray-100 dark:divide-gray-700/60">
            
            {/* Accordion 1: MASTERCLASS TIMETABLE */}
            <div className="pt-1">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'schedule' ? null : 'schedule')}
                className="flex items-center justify-between w-full text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:calendar" className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#09314F] dark:text-white uppercase tracking-wider group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Masterclass Weekly Schedule
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Days & Live Subjects for this week
                    </p>
                  </div>
                </div>

                <Icon
                  icon="lucide:chevron-down"
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    openAccordion === 'schedule' ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {openAccordion === 'schedule' && (
                <div className="pt-4 space-y-2.5 animate-in fade-in slide-in-from-top-2 max-h-[300px] overflow-y-auto pr-1">
                  {wardSchedule.length === 0 ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-center border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400">
                      <p className="font-bold">No masterclasses scheduled for this week.</p>
                    </div>
                  ) : (
                    wardSchedule.map((slot) => {
                      const isAttended = slot.attendance_status === 'present';
                      const isLate = slot.attendance_status === 'late';
                      const isMissed = slot.attendance_status === 'absent';

                      return (
                        <div
                          key={slot.id}
                          className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#09314F] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                              {slot.day?.substring(0, 3) || "CLS"}
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-[#09314F] dark:text-white leading-tight">
                                {slot.class_title}
                              </h5>
                              <p className="text-[10px] text-gray-400 font-semibold truncate max-w-[130px] sm:max-w-[170px] mt-0.5">
                                Tutor: {slot.tutor} • {slot.time}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            isAttended
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-transparent"
                              : isLate
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-transparent"
                              : isMissed
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-transparent"
                              : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-transparent"
                          }`}>
                            {isAttended ? (slot.attendance_duration > 0 ? `Attended (${slot.attendance_duration}m)` : "Attended") :
                             isLate ? "Joined Late" :
                             isMissed ? "Missed" : "Scheduled"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: ATTENDANCE LOGS */}
            <div className="pt-4">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'masterclass' ? null : 'masterclass')}
                className="flex items-center justify-between w-full text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:video" className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#09314F] dark:text-white uppercase tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Recent Masterclasses Attended
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {wardAttendance.length > 0 ? `${wardAttendance.length} Lessons Recorded` : "Logs & Replays"}
                    </p>
                  </div>
                </div>

                <Icon
                  icon="lucide:chevron-down"
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    openAccordion === 'masterclass' ? "rotate-180 text-purple-600" : ""
                  }`}
                />
              </button>

              {openAccordion === 'masterclass' && (
                <div className="pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 max-h-[300px] overflow-y-auto pr-1">
                  {wardAttendance.length === 0 ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-center border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400">
                      <p className="font-bold">No masterclass attendance records yet.</p>
                    </div>
                  ) : (
                    wardAttendance.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                            {item.class_name || "Live Masterclass"}
                          </span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {item.duration || "Attended"}
                          </span>
                        </div>

                        <div className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60">
                          <p className="text-[9px] uppercase font-black text-gray-400">Topic Covered</p>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                            {item.topic || "Core Syllabus Lecture"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-1 border-t border-gray-100 dark:border-gray-800">
                          <span>{item.tutor || "Instructor"}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </GuardianDashboardLayout>
  );
}
