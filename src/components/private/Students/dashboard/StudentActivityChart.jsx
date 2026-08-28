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
} from "recharts";
import { Icon } from "@iconify/react";
import useExaminationAnalysis from "../../../../hooks/useExaminationAnalysis";

// Helper to format minutes nicely
function formatMins(min) {
  if (!min || min <= 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ── Custom Tooltip for BarChart showing Day/Hour + Subjects studied ──────────
function CustomBarTooltip({ active, payload, label, tab }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  const value = payload[0]?.value || 0;
  const unit = tab === "month" ? "hrs" : "min";
  const subjects = data?.subjects || [];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-3 text-xs max-w-[260px] z-50 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
        <p className="font-black text-[#09314F] dark:text-white text-sm">
          {data?.fullDate ? `${data.fullDate} (${label})` : label}
        </p>
        <span className="font-black text-[#C5A97A] bg-[#C5A97A]/10 px-2 py-0.5 rounded-lg text-[11px]">
          {value} {unit}
        </span>
      </div>

      {subjects.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Subjects Practiced:
          </p>
          <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1">
            {subjects.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800/60 px-2 py-1 rounded-lg text-[11px]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-[#09314F] dark:bg-[#C5A97A] shrink-0" />
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">
                    {sub.name}
                  </span>
                </div>
                <span className="font-mono font-black text-gray-600 dark:text-gray-400 shrink-0">
                  {formatMins(sub.minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-[11px] italic">No exam practice recorded</p>
      )}
    </div>
  );
}

// ── Custom Tooltip for PieChart ──────────────────────────────────────────────
function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl px-3 py-2 text-xs z-50">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
        <p className="font-black text-[#09314F] dark:text-white text-xs">{data.name}</p>
      </div>
      <div className="flex items-center justify-between gap-4 text-gray-500 dark:text-gray-400 text-[11px]">
        <span>Attempts: <strong className="text-gray-800 dark:text-white">{data.value}</strong></span>
        <span>Share: <strong className="text-gray-800 dark:text-white">{data.percentage}%</strong></span>
      </div>
      {data.totalTimeMinutes > 0 && (
        <p className="text-[10px] text-[#C5A97A] font-bold mt-1">
          Total Study: {formatMins(data.totalTimeMinutes)}
        </p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentActivityChart({ attempts = [] }) {
  const [tab, setTab] = useState("today"); // 'today', 'day', 'month'

  const { stats, charts } = useExaminationAnalysis(attempts);

  const barData =
    tab === "month"
      ? charts.monthData
      : tab === "day"
      ? charts.dayData
      : charts.todayData;

  const barDataKey = tab === "month" ? "hours" : "minutes";
  const barUnit = tab === "month" ? "hrs" : "min";

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/80 p-5 sm:p-6 shadow-sm h-full overflow-hidden">
      
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
            <Icon icon="lucide:bar-chart-3" className="w-4 h-4 text-[#C5A97A]" />
            Examination Analysis
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Track daily study consistency, subjects practiced, and exam readiness
          </p>
        </div>

        {/* ── Toggle tabs for time ─────────────────────────────────────────────── */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/80 rounded-xl p-1 gap-1 self-start">
          {[
            { id: "today", label: "Today" },
            { id: "day", label: "Last 7 Days" },
            { id: "month", label: "This Year" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all duration-200 ${
                tab === t.id
                  ? "bg-[#09314F] text-white shadow-sm dark:bg-[#C5A97A] dark:text-[#09314F]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Summary Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50/70 dark:bg-blue-900/20 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
          <p className="text-[10px] uppercase font-black tracking-widest text-blue-500 mb-1">
            Today's Attempts
          </p>
          <p className="text-2xl font-black text-[#09314F] dark:text-blue-100">
            {stats.todayAttempts}
          </p>
        </div>
        <div className="bg-emerald-50/70 dark:bg-emerald-900/20 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600 mb-1">
            Avg Score Today
          </p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {stats.todayAverageScore}%
          </p>
        </div>
        <div className="bg-amber-50/70 dark:bg-amber-900/20 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-800/30">
          <p className="text-[10px] uppercase font-black tracking-widest text-amber-600 mb-1">
            Total Exams Taken
          </p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
            {stats.totalAttempts}
          </p>
        </div>
        <div className="bg-purple-50/70 dark:bg-purple-900/20 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-800/30">
          <p className="text-[10px] uppercase font-black tracking-widest text-purple-600 mb-1">
            Subjects Covered
          </p>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
            {stats.totalSubjects}
          </p>
        </div>
      </div>

      {/* ── Charts Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 flex-1 min-h-[260px]">
        
        {/* Left: Time Spent Bar Chart with Subject Tooltip */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Time Spent ({barUnit})
            </h4>
            <span className="text-[10px] text-gray-400 font-medium italic">
              Hover bar to see subjects & time breakdown
            </span>
          </div>

          <div className="flex-1 min-h-[190px] -ml-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barCategoryGap="30%">
                <defs>
                  <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#09314F" stopOpacity={1} />
                    <stop offset="100%" stopColor="#bb9e7f" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} opacity={0.6} />
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

        {/* Right: Subjects Attempt Breakdown (With Overflow-Proof Scrollable List) */}
        <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700/80 pt-6 lg:pt-0 lg:pl-6 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Attempt Breakdown
            </h4>
            <span className="text-[10px] text-gray-400 font-bold">
              {charts.subjectPieData.length} Subjects
            </span>
          </div>

          {charts.subjectPieData.length > 0 ? (
            <div className="flex flex-col flex-1 justify-between gap-3 overflow-hidden">
              
              {/* Mini Donut Chart */}
              <div className="h-[120px] w-full shrink-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={charts.subjectPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={54}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {charts.subjectPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Overflow-Proof Scrollable Subject Breakdown List */}
              <div className="flex-1 max-h-[140px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                {charts.subjectPieData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-xs hover:bg-gray-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[11px]">
                      <span className="text-gray-400 font-medium">
                        {item.value} {item.value === 1 ? "test" : "tests"}
                      </span>
                      <span
                        className="px-1.5 py-0.2 rounded-md font-black text-[10px]"
                        style={{
                          backgroundColor: `${item.fill}15`,
                          color: item.fill,
                        }}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-6">
              <Icon icon="lucide:pie-chart" className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-xs font-bold">No exam attempts yet</p>
              <p className="text-[11px] text-gray-400 text-center mt-0.5">
                Practice exams will populate your breakdown
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
