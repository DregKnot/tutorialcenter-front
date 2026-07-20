import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Icon } from "@iconify/react";
import useExaminationAnalysis from "../../../../hooks/useExaminationAnalysis";

// ── Custom Tooltip for BarChart ────────────────────────────────────────────────────────────
function CustomBarTooltip({ active, payload, label, tab }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  const unit = tab === "month" ? "hrs" : "min";
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl px-3 py-2 text-xs">
      <p className="font-black text-[#09314F] dark:text-white">{label}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {value} {unit}
      </p>
    </div>
  );
}

// ── Custom Tooltip for PieChart ────────────────────────────────────────────────────────────
function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl px-3 py-2 text-xs">
      <p className="font-black text-[#09314F] dark:text-white">{data.name}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {data.value} {data.value === 1 ? "attempt" : "attempts"}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentActivityChart({ attempts = [] }) {
  const [tab, setTab] = useState("today"); // 'today', 'day', 'month'

  const { stats, charts } = useExaminationAnalysis(attempts);
  
  const barData = tab === "month" ? charts.monthData : (tab === "day" ? charts.dayData : charts.todayData);
  const barDataKey = tab === "month" ? "hours" : "minutes";
  const barUnit = tab === "month" ? "hrs" : "min";

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm h-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
            <Icon icon="lucide:bar-chart-3" className="w-4 h-4 text-[#C5A97A]" />
            Examination Analysis
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Overview of your practice sessions and performance
          </p>
        </div>

        {/* ── Toggle tabs for time ─────────────────────────────────────────────── */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 gap-0.5 self-start">
          {["today", "day", "month"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-black capitalize transition-all duration-200 ${
                tab === t
                  ? "bg-[#09314F] text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t === "today" ? "Today" : t === "day" ? "Last 7 Days" : "This Year"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Summary Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
          <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mb-1">Today's Attempts</p>
          <p className="text-2xl font-black text-[#09314F] dark:text-blue-100">{stats.todayAttempts}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800/30">
          <p className="text-[10px] uppercase font-bold tracking-widest text-green-600 mb-1">Avg Score Today</p>
          <p className="text-2xl font-black text-green-700 dark:text-green-300">{stats.todayAverageScore}%</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30">
          <p className="text-[10px] uppercase font-bold tracking-widest text-amber-600 mb-1">Total Exams Taken</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{stats.totalAttempts}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800/30">
          <p className="text-[10px] uppercase font-bold tracking-widest text-purple-600 mb-1">Total Subjects</p>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300">{stats.totalSubjects}</p>
        </div>
      </div>

      {/* ── Charts Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 flex-1 min-h-[220px]">
        {/* Time Spent Bar Chart */}
        <div className="flex flex-col">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">Time Spent ({barUnit})</h4>
          <div className="flex-1 min-h-[180px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barCategoryGap="35%">
                <defs>
                  <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#09314F" stopOpacity={1} />
                    <stop offset="100%" stopColor="#bb9e7f" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#9CA3AF" }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#9CA3AF" }}
                  width={35}
                />
                <Tooltip content={<CustomBarTooltip tab={tab} />} cursor={{ fill: "rgba(9,49,79,0.04)" }} />
                <Bar
                  dataKey={barDataKey}
                  fill="url(#activityGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subjects Pie Chart */}
        <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700 pt-6 lg:pt-0 lg:pl-6">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 text-center">Attempt Breakdown</h4>
          {charts.subjectPieData.length > 0 ? (
            <div className="flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.subjectPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.subjectPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Icon icon="lucide:pie-chart" className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
