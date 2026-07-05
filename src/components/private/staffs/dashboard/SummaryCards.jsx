import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";

// ─── Mini Sparkline Component ───────────────────────────────────────────────
function MiniSparkline({ data = [], color = "#7FD093", height = 40 }) {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const step = width / (data.length - 1 || 1);

  const points = data
    .map((val, i) => {
      const x = i * step;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ─── Mini Bar Chart Component ───────────────────────────────────────────────
function MiniBarChart({ data = [], color = "#E83831", height = 40 }) {
  if (!data.length) return null;

  const max = Math.max(...data) || 1;
  const barWidth = 8;
  const gap = 4;
  const width = data.length * (barWidth + gap);

  return (
    <svg width={width} height={height} className="opacity-70">
      {data.map((val, i) => {
        const barHeight = (val / max) * (height - 4);
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx="2"
            fill={color}
          />
        );
      })}
    </svg>
  );
}

// ─── Animated Counter Hook ──────────────────────────────────────────────────
function useAnimatedCount(target, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

// ─── Percentage Change Badge ────────────────────────────────────────────────
function ChangeBadge({ value, label = "vs last month" }) {
  if (value === null || value === undefined) return null;

  const isPositive = value >= 0;

  return (
    <div className="flex items-center gap-1 mt-1">
      <span
        className={`flex items-center gap-0.5 text-xs font-bold ${
          isPositive ? "text-lightGreen" : "text-mainRed"
        }`}
      >
        <Icon
          icon={isPositive ? "heroicons:arrow-trending-up-20-solid" : "heroicons:arrow-trending-down-20-solid"}
          className="w-3.5 h-3.5"
        />
        {Math.abs(value).toFixed(0)}%
      </span>
      <span className="text-[11px] text-gray-400 font-medium">{label}</span>
    </div>
  );
}

// ─── Format Naira ───────────────────────────────────────────────────────────
function formatNaira(amount) {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(amount >= 100_000 ? 0 : 1)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function SummaryCards({ payments = [], loading = false }) {
  // ─── Compute Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!payments.length) {
      return {
        totalRevenue: 0,
        paidStudents: 0,
        topCourse: "—",
        topCourseCount: 0,
        revenueSparkline: [],
        studentsBars: [],
        revenueChange: null,
        studentsChange: null,
      };
    }

    // Filter successful payments
    const successful = payments.filter(
      (p) => p.status?.toLowerCase() === "successful"
    );

    // Total Revenue
    const totalRevenue = successful.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    // Unique Paid Students
    const uniqueStudentIds = [
      ...new Set(successful.map((p) => p.student_id)),
    ];
    const paidStudents = uniqueStudentIds.length;

    // Top Purchased Course
    const courseCounts = {};
    successful.forEach((p) => {
      const title = p.enrollment?.course?.title || "Unknown";
      courseCounts[title] = (courseCounts[title] || 0) + 1;
    });

    const sortedCourses = Object.entries(courseCounts).sort(
      (a, b) => b[1] - a[1]
    );
    const topCourse = sortedCourses[0]?.[0] || "—";
    const topCourseCount = sortedCourses[0]?.[1] || 0;

    // ─── Monthly Revenue Sparkline Data (last 6 months) ─────────────────
    const now = new Date();
    const revenueByMonth = [];
    const studentsByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        1
      );
      const monthEnd = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const monthPayments = successful.filter((p) => {
        const paidDate = new Date(p.paid_at || p.created_at);
        return paidDate >= monthStart && paidDate <= monthEnd;
      });

      revenueByMonth.push(
        monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
      );
      studentsByMonth.push(
        new Set(monthPayments.map((p) => p.student_id)).size
      );
    }

    // % Change vs last month
    const currentMonthRevenue = revenueByMonth[5] || 0;
    const lastMonthRevenue = revenueByMonth[4] || 0;
    const revenueChange =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : currentMonthRevenue > 0
        ? 100
        : null;

    const currentMonthStudents = studentsByMonth[5] || 0;
    const lastMonthStudents = studentsByMonth[4] || 0;
    const studentsChange =
      lastMonthStudents > 0
        ? ((currentMonthStudents - lastMonthStudents) / lastMonthStudents) * 100
        : currentMonthStudents > 0
        ? 100
        : null;

    return {
      totalRevenue,
      paidStudents,
      topCourse,
      topCourseCount,
      revenueSparkline: revenueByMonth,
      studentsBars: studentsByMonth,
      revenueChange,
      studentsChange,
    };
  }, [payments]);

  // Animated values
  const animatedRevenue = useAnimatedCount(Math.round(stats.totalRevenue));
  const animatedStudents = useAnimatedCount(stats.paidStudents);
  const animatedCourseCount = useAnimatedCount(stats.topCourseCount);

  // ─── Skeleton Loader ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse"
          >
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  // ─── Card Configs ─────────────────────────────────────────────────────────
  const cards = [
    {
      label: "Total Revenue",
      value: formatNaira(animatedRevenue),
      subtitle: "Successful payments",
      change: stats.revenueChange,
      icon: "heroicons:banknotes-20-solid",
      iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      chart: (
        <MiniSparkline data={stats.revenueSparkline} color="#7FD093" />
      ),
    },
    {
      label: "Paid Students",
      value: animatedStudents,
      subtitle: "Unique paying students",
      change: stats.studentsChange,
      icon: "heroicons:user-group-20-solid",
      iconBg: "bg-red-50 dark:bg-red-900/30",
      iconColor: "text-mainRed",
      chart: <MiniBarChart data={stats.studentsBars} color="#E83831" />,
    },
    {
      label: "Top Course",
      value: stats.topCourse,
      subtitle: `${animatedCourseCount} enrollment${animatedCourseCount !== 1 ? "s" : ""}`,
      change: null,
      icon: "heroicons:academic-cap-20-solid",
      iconBg: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-mainBlue dark:text-blue-400",
      chart: null,
      isText: true,
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 
                     hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 
                     hover:border-gray-200 dark:hover:border-gray-600
                     transition-all duration-300 cursor-default"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          {/* Top Row: Label + Icon */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}
              >
                <Icon icon={card.icon} className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {card.label}
              </span>
            </div>
          </div>

          {/* Middle Row: Value + Chart */}
          <div className="flex items-end justify-between">
            <div>
              <h3
                className={`font-black tracking-tight text-gray-900 dark:text-white ${
                  card.isText ? "text-xl" : "text-2xl lg:text-3xl"
                }`}
              >
                {card.value}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                {card.subtitle}
              </p>
              <ChangeBadge value={card.change} />
            </div>

            {/* Mini Chart */}
            {card.chart && (
              <div className="hidden sm:block flex-shrink-0 ml-3">
                {card.chart}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
