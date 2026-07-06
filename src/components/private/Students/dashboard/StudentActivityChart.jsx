import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Mock data ─────────────────────────────────────────────────────────────────
const DAY_DATA = Array.from({ length: 24 }, (_, i) => ({
  label: i === 0 ? "12am" : i === 12 ? "12pm" : i < 12 ? `${i}am` : `${i - 12}pm`,
  minutes: i >= 8 && i <= 22 ? Math.floor(Math.random() * 55 + 5) : 0,
}));

const MONTH_DATA = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
].map((m, i) => ({
  label: m,
  hours: i <= new Date().getMonth() ? parseFloat((Math.random() * 18 + 2).toFixed(1)) : 0,
}));

const YEAR_DATA = Array.from({ length: 7 }, (_, i) => ({
  label: `${new Date().getFullYear() - 6 + i}`,
  hours: parseFloat((Math.random() * 200 + 50).toFixed(0)),
}));

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, tab }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  const unit = tab === "day" ? "min" : "hrs";
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl px-3 py-2 text-xs">
      <p className="font-black text-[#09314F] dark:text-white">{label}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {value} {unit}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentActivityChart() {
  const [tab, setTab] = useState("month");

  const { data, dataKey, labelKey, unit } = useMemo(() => {
    if (tab === "day")   return { data: DAY_DATA,   dataKey: "minutes", labelKey: "label", unit: "min" };
    if (tab === "year")  return { data: YEAR_DATA,  dataKey: "hours",   labelKey: "label", unit: "hrs" };
    return                      { data: MONTH_DATA, dataKey: "hours",   labelKey: "label", unit: "hrs" };
  }, [tab]);

  const total = data.reduce((s, d) => s + (d[dataKey] || 0), 0);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
            Student Activity
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {tab === "day" ? "Today" : tab === "month" ? "This Year" : "All Years"} · {total.toLocaleString()} {unit}
          </p>
        </div>

        {/* ── Toggle tabs ─────────────────────────────────────────────── */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 gap-0.5">
          {["day", "month", "year"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-black capitalize transition-all duration-200 ${
                tab === t
                  ? "bg-[#09314F] text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ───────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-[200px] mt-4 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="35%">
            <defs>
              <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#09314F" stopOpacity={1} />
                <stop offset="100%" stopColor="#bb9e7f" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey={labelKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: "#9CA3AF" }}
              interval={tab === "day" ? 3 : 0}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: "#9CA3AF" }}
              width={30}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip content={<CustomTooltip tab={tab} />} cursor={{ fill: "rgba(9,49,79,0.04)" }} />
            <Bar
              dataKey={dataKey}
              fill="url(#activityGrad)"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
