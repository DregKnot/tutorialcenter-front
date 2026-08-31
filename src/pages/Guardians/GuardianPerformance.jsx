import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import GuardianDashboardLayout from "../../components/private/Guardians/GuardianDashboardLayout";
import GuardianTopWardSelector from "../../components/private/Guardians/GuardianTopWardSelector";

const COLORS = [
  "#09314F",
  "#C5A97A",
  "#E83831",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#06B6D4",
  "#84CC16",
];

// Custom Tooltip for Subject Donut Chart
function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-3 text-xs z-50 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }} />
        <p className="font-black text-[#09314F] dark:text-white text-sm">{data.name}</p>
      </div>
      <div className="space-y-1 text-gray-600 dark:text-gray-300 text-[11px]">
        <div className="flex justify-between">
          <span>Practices:</span>
          <strong className="text-gray-900 dark:text-white">{data.value} tests</strong>
        </div>
        <div className="flex justify-between">
          <span>Average Score:</span>
          <strong className="text-emerald-600 dark:text-emerald-400">{data.average_score}%</strong>
        </div>
        <div className="flex justify-between">
          <span>Accuracy:</span>
          <strong className="text-[#09314F] dark:text-[#C5A97A]">{data.accuracy_percentage}%</strong>
        </div>
        <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-1 mt-1">
          <span>Bank Coverage:</span>
          <strong className="text-[#E83831]">{data.bank_coverage_percentage}%</strong>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip for Bar Chart
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-3 text-xs z-50">
      <p className="font-black text-[#09314F] dark:text-white mb-1.5 text-sm">{label}</p>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500 dark:text-gray-400">{entry.name}:</span>
          </span>
          <strong className="font-mono text-gray-900 dark:text-white">{entry.value}%</strong>
        </div>
      ))}
    </div>
  );
}

export default function GuardianPerformance() {
  const navigate = useNavigate();

  const [guardian, setGuardian] = useState(null);
  const [wards, setWards] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingWard, setFetchingWard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Initial Load: Guardian Profile and Wards List
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

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [profileRes, wardsRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/guardians/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (profileRes.status === "fulfilled") {
          const data = profileRes.value.data?.data || profileRes.value.data?.guardian || profileRes.value.data || {};
          if (data.firstname) setGuardian(data);
        }

        if (wardsRes.status === "fulfilled") {
          const wardsList = wardsRes.value.data?.data || [];
          setWards(wardsList);
          if (wardsList.length > 0) {
            setSelectedStudentId(wardsList[0].id);
          }
        }
      } catch (error) {
        console.warn("Performance initial fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate, API_BASE_URL]);

  // Fetch Ward Detailed Performance
  const fetchDetailedPerformance = useCallback(
    async (studentId, page = 1) => {
      if (!studentId) return;
      const token = localStorage.getItem("guardian_token");
      if (!token) return;

      setFetchingWard(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/guardians/dashboard/wards/${studentId}/performance-details?page=${page}&per_page=8`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success) {
          setPerformanceData(res.data);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error("Failed to fetch detailed performance:", error);
      } finally {
        setFetchingWard(false);
      }
    },
    [API_BASE_URL]
  );

  useEffect(() => {
    if (selectedStudentId) {
      fetchDetailedPerformance(selectedStudentId, 1);
    }
  }, [selectedStudentId, fetchDetailedPerformance]);

  const selectedWard = wards.find((w) => w.id === selectedStudentId);
  const summary = performanceData?.summary || {
    total_attempts: 0,
    average_score: 0,
    total_correct_answers: 0,
    total_questions_attempted: 0,
    overall_accuracy: 0,
    total_subjects_practiced: 0,
  };
  const subjects = performanceData?.subject_breakdowns || [];
  const history = performanceData?.history?.data || [];
  const pagination = performanceData?.history || {};

  // Pie chart data
  const pieData = subjects.map((sub, idx) => ({
    name: sub.subject_name,
    value: sub.total_attempts,
    average_score: sub.average_score,
    accuracy_percentage: sub.accuracy_percentage,
    bank_coverage_percentage: sub.bank_coverage_percentage,
    fill: COLORS[idx % COLORS.length],
  }));

  // Bar chart data
  const barData = subjects.slice(0, 7).map((sub) => ({
    subject: sub.subject_name.length > 10 ? `${sub.subject_name.substring(0, 8)}...` : sub.subject_name,
    fullName: sub.subject_name,
    "Average Score": sub.average_score,
    "Highest Score": sub.highest_score,
  }));

  // Global question bank coverage calculation
  const totalBankQuestions = subjects.reduce((acc, curr) => acc + (curr.total_questions_in_bank || 0), 0);
  const totalAnsweredUnique = subjects.reduce((acc, curr) => acc + (curr.unique_questions_answered || 0), 0);
  const globalBankCoverage = totalBankQuestions > 0 ? Math.round((totalAnsweredUnique / totalBankQuestions) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071927] flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#C5A97A]/20 border-t-[#C5A97A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GuardianDashboardLayout guardianData={guardian}>
      {/* ── TOP HEADER BAR: Title, Back to Dashboard & Ward Selector ──────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-[#C5A97A] text-[11px] font-black uppercase tracking-wider mb-1.5">
              <Icon icon="lucide:line-chart" className="w-3.5 h-3.5" />
              <span>Academic Analytics & Exam Reports</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#09314F] dark:text-white tracking-tight">
              Ward Examination Performance
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Review practice tests, accuracy rates, and question bank coverage across all subjects.
            </p>
          </div>

          <Link
            to="/guardian/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors self-start shadow-sm"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* UNIFIED TOP WARD SELECTOR */}
        <GuardianTopWardSelector
          wards={wards}
          selectedWardId={selectedStudentId}
          onSelectWard={(id) => id !== "all" ? setSelectedStudentId(id) : null}
          showAllOption={false}
        />
      </div>

      {fetchingWard ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#C5A97A]/20 border-t-[#C5A97A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-gray-400">Loading {selectedWard?.name || "ward"}'s analytics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── KPI ANALYTICS SUMMARY CARDS ─────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* Card 1: Total Practices */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400">Total Exams</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Icon icon="lucide:file-check" className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-[#09314F] dark:text-white font-mono">
                  {summary.total_attempts}
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Completed CBT tests</p>
              </div>
            </div>

            {/* Card 2: Average Score */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400">Avg Score</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon icon="lucide:award" className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {summary.average_score}%
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Overall benchmark</p>
              </div>
            </div>

            {/* Card 3: Accuracy Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400">Accuracy</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Icon icon="lucide:target" className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-[#09314F] dark:text-[#C5A97A] font-mono">
                  {summary.overall_accuracy}%
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  {summary.total_correct_answers}/{summary.total_questions_attempted} Questions
                </p>
              </div>
            </div>

            {/* Card 4: Question Bank Coverage */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400">Bank Coverage</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-[#E83831] flex items-center justify-center">
                  <Icon icon="lucide:database" className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-[#E83831] font-mono">
                  {globalBankCoverage}%
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  {totalAnsweredUnique}/{totalBankQuestions} Bank Questions
                </p>
              </div>
            </div>

            {/* Card 5: Active Subjects */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400">Subjects</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Icon icon="lucide:book-marked" className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {summary.total_subjects_practiced}
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Enrolled subjects practiced</p>
              </div>
            </div>

          </div>

          {/* ── CHARTS SECTION ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            
            {/* Donut Chart: Subject Practice Share */}
            <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-[32px] p-5 sm:p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-black text-[#09314F] dark:text-white tracking-tight flex items-center gap-2">
                    <Icon icon="lucide:pie-chart" className="w-4 h-4 text-[#C5A97A]" />
                    <span>Practice Share by Subject</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    {pieData.length} Subjects
                  </span>
                </div>

                {pieData.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs">
                    <Icon icon="lucide:bar-chart-2" className="w-8 h-8 mb-2 opacity-40" />
                    <span>No subject attempts recorded yet.</span>
                  </div>
                ) : (
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Mini legend indicators */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {pieData.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                    <span className="truncate max-w-[100px]">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart: Subject Score Benchmarks */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-[32px] p-5 sm:p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-black text-[#09314F] dark:text-white tracking-tight flex items-center gap-2">
                    <Icon icon="lucide:bar-chart-3" className="w-4 h-4 text-emerald-500" />
                    <span>Average vs Highest Score (%)</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Pass Benchmark: 50%
                  </span>
                </div>

                {barData.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs">
                    <Icon icon="lucide:bar-chart" className="w-8 h-8 mb-2 opacity-40" />
                    <span>No performance records yet.</span>
                  </div>
                ) : (
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="subject" tick={{ fontSize: 10, fill: "#888" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#888" }} />
                        <RechartsTooltip content={<CustomBarTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                        <Bar dataKey="Average Score" fill="#09314F" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Highest Score" fill="#C5A97A" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-400 font-semibold pt-3 border-t border-gray-100 dark:border-gray-700">
                Scores compare your ward's average against their personal best mock result in each subject.
              </p>
            </div>

          </div>

          {/* ── SUBJECT QUESTION ACCURACY & BANK COVERAGE DEEP-DIVE ─────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#09314F] dark:text-white tracking-tight">
                  Subject Question Bank Coverage & Accuracy
                </h3>
                <p className="text-xs text-gray-400">
                  Tracking attempted questions over total syllabus question bank size.
                </p>
              </div>
              <span className="text-xs font-black text-[#C5A97A] uppercase">
                {subjects.length} Subjects Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub, idx) => {
                const isPassing = sub.average_score >= 50;
                return (
                  <div
                    key={sub.subject_id || idx}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        >
                          {sub.subject_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#09314F] dark:text-white leading-tight">
                            {sub.subject_name}
                          </h4>
                          <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                            {sub.total_attempts} Practice Attempts
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl font-mono ${
                          isPassing
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {sub.average_score}% Avg
                      </span>
                    </div>

                    {/* Metric 1: Accuracy (Correct vs Attempted) */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-500 dark:text-gray-400">Accuracy (Correct/Attempted):</span>
                        <strong className="text-gray-900 dark:text-white font-mono">
                          {sub.total_correct_answers} / {sub.total_questions_attempted} ({sub.accuracy_percentage}%)
                        </strong>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#09314F] dark:bg-[#C5A97A] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, sub.accuracy_percentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Metric 2: Question Bank Coverage */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-500 dark:text-gray-400">Question Bank Coverage:</span>
                        <strong className="text-[#E83831] font-mono">
                          {sub.unique_questions_answered} / {sub.total_questions_in_bank} ({sub.bank_coverage_percentage}%)
                        </strong>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E83831] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, sub.bank_coverage_percentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Footer */}
                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold pt-2 border-t border-gray-50 dark:border-gray-700/50">
                      <span>Highest: <strong className="text-emerald-600">{sub.highest_score}%</strong></span>
                      <span>Lowest: <strong className="text-rose-500">{sub.lowest_score}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── PAGINATED PRACTICE EXAM HISTORY TABLE ─────────────────────── */}
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-5 sm:p-6 lg:p-7 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-base font-black text-[#09314F] dark:text-white tracking-tight flex items-center gap-2">
                  <Icon icon="lucide:history" className="w-4 h-4 text-[#C5A97A]" />
                  <span>Exam Attempt History & Answers</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Detailed review of all practice submissions for {selectedWard?.name}.
                </p>
              </div>
              <span className="text-xs font-black text-gray-500 dark:text-gray-400">
                Page {pagination.current_page || 1} of {pagination.last_page || 1} ({pagination.total || history.length} total)
              </span>
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Icon icon="lucide:inbox" className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-bold">No exam attempts found for this ward.</p>
                <p className="text-xs">Once your ward starts practicing CBT questions, their detailed test papers will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-black uppercase text-[10px] tracking-wider">
                      <th className="pb-3">Subject & Year</th>
                      <th className="pb-3">Score & Percentage</th>
                      <th className="pb-3">Questions Correct</th>
                      <th className="pb-3">Duration</th>
                      <th className="pb-3">Date Submitted</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
                    {history.map((attempt) => {
                      const isPassing = attempt.percentage >= 50;
                      return (
                        <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                          <td className="py-3.5">
                            <span className="font-black text-[#09314F] dark:text-white">
                              {attempt.subject_name}
                            </span>
                            {attempt.year && (
                              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-500">
                                {attempt.year}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 font-mono">
                            <span className={`font-black text-sm ${isPassing ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {attempt.percentage}%
                            </span>
                            <span className="text-gray-400 text-[11px] ml-1">({attempt.score} pts)</span>
                          </td>

                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
                                ✓
                              </span>
                              <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                                {attempt.correct_answers} Right
                              </span>
                              <span className="text-gray-400 text-[11px] font-medium">
                                of {attempt.total_questions} Questions
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 text-gray-500 dark:text-gray-400 font-medium">
                            {attempt.duration_minutes ? `${attempt.duration_minutes} mins` : "< 1 min"}
                          </td>

                          <td className="py-3.5 text-gray-400 font-medium">
                            {attempt.date_formatted || attempt.submitted_at}
                          </td>

                          <td className="py-3.5 text-right">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isPassing
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-transparent"
                                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-transparent"
                              }`}
                            >
                              {isPassing ? "Passed" : "Needs Review"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => fetchDetailedPerformance(selectedStudentId, currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-gray-100 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => fetchDetailedPerformance(selectedStudentId, pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F]"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => fetchDetailedPerformance(selectedStudentId, currentPage + 1)}
                  disabled={currentPage >= pagination.last_page}
                  className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-gray-100 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <span>Next</span>
                  <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </GuardianDashboardLayout>
  );
}
