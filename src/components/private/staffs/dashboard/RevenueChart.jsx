import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Icon } from "@iconify/react";

// ─── Format Naira for Axis ──────────────────────────────────────────────────
function formatAxisNaira(value) {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(0)}K`;
  return `₦${value}`;
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 px-4 py-3 min-w-[180px] animate-in fade-in zoom-in-95 duration-150">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {entry.name}
            </span>
          </div>
          <span className="text-xs font-black text-gray-900 dark:text-white">
            {entry.name === "Revenue"
              ? `₦${Number(entry.value).toLocaleString()}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Custom Cursor: soft vertical band instead of a thin line ─────────────
function CursorBand({ points, height }) {
  if (!points?.length) return null;
  const { x } = points[0];
  return (
    <rect
      x={x - 20}
      y={0}
      width={40}
      height={height}
      rx={10}
      fill="#6C63FF"
      opacity={0.08}
    />
  );
}

// ─── Custom Dot: hides itself past the current month, pulses on "today" ──
function makeDotRenderer(color, currentMonthIndex) {
  return function CustomDot(props) {
    const { cx, cy, index, value } = props;
    if (value === null || value === undefined || index > currentMonthIndex) {
      return null;
    }
    const isCurrent = index === currentMonthIndex;
    return (
      <g key={`dot-${color}-${index}`}>
        {isCurrent && (
          <circle
            cx={cx}
            cy={cy}
            r={9}
            fill={color}
            opacity={0.25}
            className="animate-ping"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isCurrent ? 5 : 3.5}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
          filter={color === "#E83831" ? "url(#revenueGlow)" : undefined}
        />
      </g>
    );
  };
}

// ─── Month Names ────────────────────────────────────────────────────────────
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function RevenueChart({ payments = [], loading = false }) {
  const now = useMemo(() => new Date(), []);
  const currentMonthIndex = now.getMonth();

  // ─── Build monthly data from payments ─────────────────────────────────
  const { chartData, totals } = useMemo(() => {
    const currentYear = now.getFullYear();

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: MONTHS[i],
      revenue: 0,
      students: new Set(),
      paidCount: 0,
    }));

    const successful = payments.filter(
      (p) => p.status?.toLowerCase() === "successful"
    );

    successful.forEach((p) => {
      const date = new Date(p.paid_at || p.created_at);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].revenue += Number(p.amount || 0);
        monthlyData[monthIndex].students.add(p.student_id);
        monthlyData[monthIndex].paidCount += 1;
      }
    });

    // Past/current months carry real values. Future months are set to null
    // rather than 0, so the line doesn't nosedive — instead recharts just
    // stops drawing area/stroke past the last defined point, which reads as
    // "no data yet" rather than "revenue dropped to zero."
    const chartData = monthlyData.map((m, i) => ({
      month: m.month,
      Revenue: i <= currentMonthIndex ? Math.round(m.revenue) : null,
      Students: i <= currentMonthIndex ? m.students.size : null,
    }));

    const totalRevenue = successful.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const currentMonthRevenue = monthlyData[currentMonthIndex]?.revenue || 0;
    const yearRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);

    const lastMonthIndex = currentMonthIndex - 1;
    const lastMonthRevenue =
      lastMonthIndex >= 0 ? monthlyData[lastMonthIndex].revenue : 0;
    const monthChange =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : currentMonthRevenue > 0
        ? 100
        : 0;

    return {
      chartData,
      totals: {
        total: totalRevenue,
        currentMonth: currentMonthRevenue,
        yearTotal: yearRevenue,
        monthChange,
      },
    };
  }, [payments, now, currentMonthIndex]);

  const RevenueDot = useMemo(
    () => makeDotRenderer("#E83831", currentMonthIndex),
    [currentMonthIndex]
  );
  const StudentsDot = useMemo(
    () => makeDotRenderer("#bb9e7f", currentMonthIndex),
    [currentMonthIndex]
  );

  // ─── Skeleton Loader ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6" />
        <div className="h-[280px] bg-gray-100 dark:bg-gray-700/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
      {/* ─── Chart Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Icon
            icon="heroicons:chart-bar-20-solid"
            className="w-5 h-5 text-mainBlue dark:text-blue-400"
          />
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
            Revenue Overview
          </h3>
        </div>

        {/* Revenue Summary Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              Total
            </span>
            <span className="text-sm font-black text-mainBlue dark:text-blue-400">
              ₦{totals.total.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              This Month
            </span>
            <span className="text-sm font-black text-gray-900 dark:text-white">
              ₦{totals.currentMonth.toLocaleString()}
            </span>
            {totals.monthChange !== 0 && (
              <span
                className={`text-[11px] font-bold ${
                  totals.monthChange >= 0 ? "text-lightGreen" : "text-mainRed"
                }`}
              >
                {totals.monthChange >= 0 ? "↑" : "↓"}
                {Math.abs(totals.monthChange).toFixed(0)}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              This Year
            </span>
            <span className="text-sm font-black text-gray-900 dark:text-white">
              ₦{totals.yearTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Legend ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-mainRed" />
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Revenue
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#bb9e7f" }} />
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Students
          </span>
        </div>
      </div>

      {/* ─── Chart ─────────────────────────────────────────────────────── */}
      <div className="h-[280px] -ml-2 relative">
        {/* Dot-grid backdrop, like the reference screenshot */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #9CA3AF33 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E83831" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#E83831" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#bb9e7f" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#bb9e7f" stopOpacity={0} />
              </linearGradient>
              <filter id="revenueGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#E83831" floodOpacity="0.6"/>
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={(props) => {
                const { x, y, payload } = props;
                const isCurrent = payload.index === currentMonthIndex;
                return (
                  <text
                    x={x}
                    y={y + 12}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={isCurrent ? 900 : 700}
                    fill={isCurrent ? "#09314F" : "#9CA3AF"}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <YAxis
              yAxisId="revenue"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAxisNaira}
              tick={{ fontSize: 10, fontWeight: 600, fill: "#9CA3AF" }}
              width={55}
            />
            <YAxis
              yAxisId="students"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: "#9CA3AF" }}
              width={30}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={<CursorBand />} />

            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="Revenue"
              stroke="#E83831"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={RevenueDot}
              activeDot={{ r: 5, fill: "#E83831", stroke: "#fff", strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive
              animationDuration={1400}
              animationEasing="ease-out"
              filter="url(#revenueGlow)"
            />
            <Area
              yAxisId="students"
              type="monotone"
              dataKey="Students"
              stroke="#bb9e7f"
              strokeWidth={2}
              fill="url(#studentsGrad)"
              dot={StudentsDot}
              activeDot={{ r: 4, fill: "#bb9e7f", stroke: "#fff", strokeWidth: 2 }}
              strokeDasharray="5 5"
              connectNulls={false}
              isAnimationActive
              animationDuration={1400}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}