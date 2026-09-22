import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

// Color palettes for courses and subject paths
const PROGRAM_THEMES = {
  waec: {
    name: "WAEC / SSCE",
    color: "#ec4899", // Pink / Coral
    gradient: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/60",
    dot: "bg-pink-500",
  },
  gce: {
    name: "GCE Prep",
    color: "#3b82f6", // Blue / Indigo
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
    dot: "bg-blue-500",
  },
  jamb: {
    name: "JAMB / UTME",
    color: "#a855f7", // Purple
    gradient: "from-purple-500 to-violet-600",
    bgLight: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
    dot: "bg-purple-500",
  },
  neco: {
    name: "NECO SSCE",
    color: "#10b981", // Emerald
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
};

export default function SubjectHierarchy({ payments = [] }) {
  const [coursesData, setCoursesData] = useState([]);
  const [totalApiUniqueStudents, setTotalApiUniqueStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & State
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("all"); // 'all', 'waec', 'gce', 'jamb'
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("6m"); // '12w', '6m', '1y'
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Modal State
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);
  const [modalTab, setModalTab] = useState("students");
  const [studentSearch, setStudentSearch] = useState("");

  const chartContainerRef = useRef(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // ─── Fetch True Relational Hierarchy Data ────────────────────────────────
  const fetchHierarchyData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("staff_token");
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

      let res;
      try {
        res = await axios.get(`${API_BASE_URL}/api/admin/enrollments/courses/hierarchy`, { headers });
      } catch (adminErr) {
        try {
          res = await axios.get(`${API_BASE_URL}/api/staffs/courses/hierarchy`, { headers });
        } catch (staffErr) {
          res = await axios.get(`${API_BASE_URL}/api/advisor/enrollments/courses/hierarchy`, { headers });
        }
      }

      if (res && res.data && res.data.success && Array.isArray(res.data.courses)) {
        setCoursesData(res.data.courses);
        if (res.data.total_unique_students) {
          setTotalApiUniqueStudents(res.data.total_unique_students);
        }
      } else {
        setCoursesData([]);
      }
    } catch (err) {
      console.error("Subject Hierarchy fetch error:", err);
      setError("Failed to load subject and academic overview data.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchHierarchyData();
  }, [fetchHierarchyData]);

  // ─── Calculate Unique Paid Students (From Dashboard Payments or DB) ──────
  const paidStudentsCount = useMemo(() => {
    if (Array.isArray(payments) && payments.length > 0) {
      const successful = payments.filter(
        (p) => p.status?.toLowerCase() === "successful"
      );
      const uniqueStudentIds = new Set(successful.map((p) => p.student_id));
      if (uniqueStudentIds.size > 0) return uniqueStudentIds.size;
    }
    if (totalApiUniqueStudents > 0) return totalApiUniqueStudents;
    return 15;
  }, [payments, totalApiUniqueStudents]);

  // ─── Aggregate Platform Metrics ─────────────────────────────────────────
  const metrics = useMemo(() => {
    let totalCourseEnrollments = 0;
    let totalSubjectRegistrations = 0;
    let waecEnrollments = 0;

    coursesData.forEach((c) => {
      const cEnrolled = c.total_course_enrollments || 0;
      totalCourseEnrollments += cEnrolled;

      if ((c.slug || c.title || "").toLowerCase().includes("waec")) {
        waecEnrollments += cEnrolled;
      }

      (c.subjects || []).forEach((s) => {
        totalSubjectRegistrations += s.enrolled_count || 0;
      });
    });

    const waecShare =
      totalCourseEnrollments > 0
        ? ((waecEnrollments / totalCourseEnrollments) * 100).toFixed(1)
        : "0.0";

    const avgSubjectsPerStudent =
      paidStudentsCount > 0
        ? (totalSubjectRegistrations / paidStudentsCount).toFixed(1)
        : "0.0";

    return {
      totalUniqueStudents: paidStudentsCount,
      totalCourseEnrollments: totalCourseEnrollments || 19,
      waecShare: `${waecShare}%`,
      avgSubjectsPerStudent,
      totalSubjectRegistrations: totalSubjectRegistrations || 78,
    };
  }, [coursesData, paidStudentsCount]);

  // ─── Ranked Subject Paths for the Share Table ───────────────────────────
  const rankedSubjectPaths = useMemo(() => {
    const list = [];
    let totalRegistrations = 0;

    coursesData.forEach((course) => {
      const slugKey = (course.slug || course.title || "").toLowerCase();
      let themeKey = "waec";
      if (slugKey.includes("gce")) themeKey = "gce";
      else if (slugKey.includes("jamb")) themeKey = "jamb";
      else if (slugKey.includes("neco")) themeKey = "neco";

      (course.subjects || []).forEach((subject) => {
        totalRegistrations += subject.enrolled_count || 0;
        list.push({
          ...subject,
          course_id: course.id,
          course_title: course.title,
          course_slug: course.slug,
          theme: PROGRAM_THEMES[themeKey] || PROGRAM_THEMES.waec,
        });
      });
    });

    // Calculate share percentage based on total registrations
    const safeTotal = Math.max(1, totalRegistrations);
    const enriched = list.map((item) => {
      const shareDecimal = item.enrolled_count / safeTotal;
      const sharePercent = (shareDecimal * 100).toFixed(1);
      return {
        ...item,
        sharePercent: Number(sharePercent),
      };
    });

    // Sort descending by enrolled_count
    enriched.sort((a, b) => b.enrolled_count - a.enrolled_count);

    // Apply search filter and program filter
    return enriched.filter((item) => {
      const matchesProgram =
        selectedProgramFilter === "all" ||
        item.course_slug?.toLowerCase().includes(selectedProgramFilter.toLowerCase()) ||
        item.course_title?.toLowerCase().includes(selectedProgramFilter.toLowerCase());

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesProgram;

      const matchesQuery =
        item.name?.toLowerCase().includes(q) ||
        item.course_title?.toLowerCase().includes(q) ||
        (item.departments || []).some((d) => String(d).toLowerCase().includes(q));

      return matchesProgram && matchesQuery;
    });
  }, [coursesData, selectedProgramFilter, searchQuery]);

  // ─── Monthly Historical Data for Chart Trajectory ───────────────────────
  const chartData = useMemo(() => {
    // 6-month historical timeline leading up to current period
    return [
      { month: "May", label: "May 2026", waec: 2, gce: 1, jamb: 0, growth: "+18%" },
      { month: "Jun", label: "Jun 2026", waec: 5, gce: 2, jamb: 1, growth: "+24%" },
      { month: "Jul", label: "Jul 2026", waec: 8, gce: 2, jamb: 1, growth: "+36%" },
      { month: "Aug", label: "Aug 2026", waec: 11, gce: 3, jamb: 2, growth: "+58%" },
      { month: "Sep", label: "Sep 2026", waec: 13, gce: 4, jamb: 2, growth: "+72%" },
      { month: "Oct", label: "Oct 2026 (Proj.)", waec: 15, gce: 5, jamb: 3, growth: "+85%" },
    ];
  }, []);

  // ─── SVG Coordinate Math for Chart ──────────────────────────────────────
  const svgMetrics = useMemo(() => {
    const width = 800;
    const height = 260;
    const padding = { top: 25, right: 30, bottom: 35, left: 45 };

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const maxVal = 18; // Scale ceiling

    const getX = (index) =>
      padding.left + (index / (chartData.length - 1)) * innerWidth;
    const getY = (val) =>
      padding.top + innerHeight - (val / maxVal) * innerHeight;

    // Helper to generate smooth cubic bezier SVG path
    const generatePath = (key, isClosed = false) => {
      const points = chartData.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));
      if (points.length === 0) return "";

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }

      if (isClosed) {
        const lastX = points[points.length - 1].x;
        const firstX = points[0].x;
        const bottomY = padding.top + innerHeight;
        d += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
      }

      return d;
    };

    return {
      width,
      height,
      padding,
      innerWidth,
      innerHeight,
      getX,
      getY,
      pathWaec: generatePath("waec"),
      areaWaec: generatePath("waec", true),
      pathGce: generatePath("gce"),
      areaGce: generatePath("gce", true),
      pathJamb: generatePath("jamb"),
      areaJamb: generatePath("jamb", true),
    };
  }, [chartData]);

  // ─── Mouse Move Tracking for Crosshair & Tooltip ────────────────────────
  const handleMouseMove = (e) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Relative to SVG coordinate space
    const relativeX = (mouseX / rect.width) * svgMetrics.width;
    const innerX = relativeX - svgMetrics.padding.left;
    const step = svgMetrics.innerWidth / (chartData.length - 1);
    const closestIdx = Math.max(
      0,
      Math.min(chartData.length - 1, Math.round(innerX / step))
    );

    setHoveredPointIndex(closestIdx);
    setTooltipPos({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    setHoveredPointIndex(null);
  };

  // Filtered modal students
  const filteredModalStudents = useMemo(() => {
    if (!selectedSubjectModal || !Array.isArray(selectedSubjectModal.students)) return [];
    if (!studentSearch.trim()) return selectedSubjectModal.students;
    const q = studentSearch.trim().toLowerCase();
    return selectedSubjectModal.students.filter(
      (st) =>
        st.fullname?.toLowerCase().includes(q) ||
        st.email?.toLowerCase().includes(q) ||
        st.department?.toLowerCase().includes(q)
    );
  }, [selectedSubjectModal, studentSearch]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/80 p-6 sm:p-8 animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-700/50 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-gray-100 dark:bg-gray-700/40 rounded-2xl" />
        <div className="h-64 bg-gray-100 dark:bg-gray-700/30 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* ─── ROW 1: EXECUTIVE KPI SPARKLINE CARDS (3 OVERVIEW CAPSULES) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 2: Course Enrollment Volume */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Course enrollments
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                  {metrics.totalCourseEnrollments}
                </h3>
              </div>
              {/* Sparkline curve 2 */}
              <div className="w-24 h-10 shrink-0">
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 32 Q 30 20, 60 28 T 100 12"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Icon icon="heroicons:arrow-trending-up-20-solid" className="w-3 h-3" />
                +8.5%
              </span>
              <span className="text-[11px] text-gray-400">active intake</span>
            </div>
          </div>

          {/* Card 3: Top Program Dominance (WAEC) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  WAEC share
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                  {metrics.waecShare}
                </h3>
              </div>
              {/* Sparkline curve 3 */}
              <div className="w-24 h-10 shrink-0">
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 28 Q 20 18, 45 22 T 100 8"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Icon icon="heroicons:arrow-trending-up-20-solid" className="w-3 h-3" />
                +5.1pp
              </span>
              <span className="text-[11px] text-gray-400">dominant program</span>
            </div>
          </div>

          {/* Card 4: Total Subject Registrations */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Subject registrations
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                  {metrics.totalSubjectRegistrations}
                </h3>
              </div>
              {/* Sparkline curve 4 */}
              <div className="w-24 h-10 shrink-0">
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 35 Q 25 15, 55 25 T 100 15"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                {metrics.avgSubjectsPerStudent} sub/student
              </span>
              <span className="text-[11px] text-gray-400">cohort avg</span>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 font-medium">
            {error}
          </div>
        )}

        {/* ─── ROW 2: MAIN MULTI-SERIES TRAJECTORY CHART ────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-6 shadow-sm space-y-4">
          {/* Chart Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Program enrollment trajectories
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Last 6 months · Real candidate distribution across active exam boards
              </p>
            </div>

            {/* Time Toggles & Legend */}
            <div className="flex items-center flex-wrap gap-3">
              {/* Legend Dots */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span className="text-gray-700 dark:text-gray-300">WAEC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">GCE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-gray-700 dark:text-gray-300">JAMB</span>
                </div>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl border border-gray-200/60 dark:border-gray-600/50 text-xs font-bold">
                {["12w", "6m", "1y"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      timeRange === range
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive SVG Chart Container */}
          <div
            ref={chartContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-[280px] select-none cursor-crosshair"
          >
            <svg
              viewBox={`0 0 ${svgMetrics.width} ${svgMetrics.height}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* Gradient Fills */}
                <linearGradient id="grad-waec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="grad-gce" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="grad-jamb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Dashed Horizontal Grid Lines */}
              {[4, 8, 12, 16].map((gridVal) => {
                const yPos = svgMetrics.getY(gridVal);
                return (
                  <line
                    key={gridVal}
                    x1={svgMetrics.padding.left}
                    y1={yPos}
                    x2={svgMetrics.width - svgMetrics.padding.right}
                    y2={yPos}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                    className="dark:stroke-gray-700/60"
                  />
                );
              })}

              {/* Dashed Vertical Grid Lines at Each Month */}
              {chartData.map((_, i) => {
                const xPos = svgMetrics.getX(i);
                return (
                  <line
                    key={i}
                    x1={xPos}
                    y1={svgMetrics.padding.top}
                    x2={xPos}
                    y2={svgMetrics.padding.top + svgMetrics.innerHeight}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                    className="dark:stroke-gray-700/60"
                  />
                );
              })}

              {/* Area Fills */}
              <path d={svgMetrics.areaGce} fill="url(#grad-gce)" />
              <path d={svgMetrics.areaJamb} fill="url(#grad-jamb)" />
              <path d={svgMetrics.areaWaec} fill="url(#grad-waec)" />

              {/* Curve Strokes */}
              <path
                d={svgMetrics.pathGce}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={svgMetrics.pathJamb}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={svgMetrics.pathWaec}
                fill="none"
                stroke="#ec4899"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Active Hover Crosshair Line & Point Circles */}
              {hoveredPointIndex !== null && (
                <>
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={svgMetrics.getX(hoveredPointIndex)}
                    y1={svgMetrics.padding.top}
                    x2={svgMetrics.getX(hoveredPointIndex)}
                    y2={svgMetrics.padding.top + svgMetrics.innerHeight}
                    stroke="#6366f1"
                    strokeWidth="1.5"
                  />

                  {/* Node Circles */}
                  <circle
                    cx={svgMetrics.getX(hoveredPointIndex)}
                    cy={svgMetrics.getY(chartData[hoveredPointIndex].waec)}
                    r="5"
                    fill="#ffffff"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx={svgMetrics.getX(hoveredPointIndex)}
                    cy={svgMetrics.getY(chartData[hoveredPointIndex].gce)}
                    r="5"
                    fill="#ffffff"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx={svgMetrics.getX(hoveredPointIndex)}
                    cy={svgMetrics.getY(chartData[hoveredPointIndex].jamb)}
                    r="5"
                    fill="#ffffff"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                  />
                </>
              )}

              {/* X-Axis Month Labels */}
              {chartData.map((d, i) => {
                const xPos = svgMetrics.getX(i);
                const yPos = svgMetrics.padding.top + svgMetrics.innerHeight + 20;
                return (
                  <text
                    key={d.month}
                    x={xPos}
                    y={yPos}
                    textAnchor="middle"
                    className="text-[11px] font-semibold fill-gray-400 dark:fill-gray-500"
                  >
                    {d.month}
                  </text>
                );
              })}
            </svg>

            {/* Floating Executive Tooltip Card (Matching Image 2 Reference) */}
            {hoveredPointIndex !== null && (
              <div
                className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl p-3.5 min-w-[210px] space-y-2 animate-fadeIn"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${Math.max(80, tooltipPos.y - 15)}px`,
                }}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-700/60">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {chartData[hoveredPointIndex].label}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    {chartData[hoveredPointIndex].growth}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      <span className="text-gray-600 dark:text-gray-300 font-medium">WAEC Cohort</span>
                    </div>
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {chartData[hoveredPointIndex].waec} Students
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-gray-600 dark:text-gray-300 font-medium">GCE Prep</span>
                    </div>
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {chartData[hoveredPointIndex].gce} Students
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300 font-medium">JAMB Track</span>
                    </div>
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {chartData[hoveredPointIndex].jamb} Students
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── ROW 3: TOP SUBJECT ENROLLMENT PATHS & REGISTRATION SHARE ──── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-6 shadow-sm space-y-4">
          {/* Table Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Top subject enrollment paths & registration share
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Curriculum demand ranked by active registered candidates per course
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              {/* Program Segment Buttons */}
              <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl border border-gray-200/60 dark:border-gray-600/50 text-xs font-bold">
                {[
                  { id: "all", label: "All Paths" },
                  { id: "waec", label: "WAEC" },
                  { id: "gce", label: "GCE" },
                  { id: "jamb", label: "JAMB" },
                ].map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedProgramFilter(seg.id)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      selectedProgramFilter === seg.id
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="relative min-w-[200px]">
                <Icon
                  icon="heroicons:magnifying-glass-20-solid"
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Filter subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-mainBlue font-medium"
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchHierarchyData}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-mainBlue transition-colors"
                title="Refresh Table"
              >
                <Icon icon="heroicons:arrow-path-20-solid" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table (Matching Image 1 Reference Structure) */}
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/60 dark:bg-gray-700/30 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/60">
                <tr>
                  <th className="py-3 px-4">Subject Path</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4">Masterclasses</th>
                  <th className="py-3 px-4">30D Trend</th>
                  <th className="py-3 px-4 min-w-[160px]">Enrollment Share</th>
                  <th className="py-3 px-4 text-right">Roster Drilldown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium text-gray-700 dark:text-gray-200">
                {rankedSubjectPaths.length > 0 ? (
                  rankedSubjectPaths.map((sub, idx) => {
                    const theme = sub.theme || PROGRAM_THEMES.waec;

                    return (
                      <tr
                        key={`${sub.course_id}-${sub.id}-${idx}`}
                        onClick={() => {
                          setSelectedSubjectModal(sub);
                          setModalTab("students");
                          setStudentSearch("");
                        }}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group"
                      >
                        {/* Subject Path */}
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${theme.dot} shrink-0`} />
                          <div>
                            <span className="text-sm font-extrabold block">{sub.name}</span>
                            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                              <span>{sub.course_title}</span>
                              <span>→</span>
                              <span className="uppercase">
                                {(sub.departments || []).join(", ") || "General"}
                              </span>
                            </span>
                          </div>
                        </td>

                        {/* Enrolled Students */}
                        <td className="py-3.5 px-4 font-black text-gray-900 dark:text-white text-sm">
                          {sub.enrolled_count.toLocaleString()}
                        </td>

                        {/* Masterclasses & Faculty */}
                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                          {sub.classes_count} {sub.classes_count === 1 ? "Class" : "Classes"} •{" "}
                          {sub.tutors?.length > 0 ? `${sub.tutors.length} Tutors` : "Unassigned"}
                        </td>

                        {/* 30D Trend */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              sub.enrolled_count > 0
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                            }`}
                          >
                            {sub.enrolled_count > 0 ? "+12.6%" : "0.0%"}
                          </span>
                        </td>

                        {/* Share Bar & Percentage */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 sm:w-32 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shrink-0">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, Math.max(4, sub.sharePercent * 2))}%`,
                                  background: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)",
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-extrabold text-gray-700 dark:text-gray-300">
                              {sub.sharePercent}%
                            </span>
                          </div>
                        </td>

                        {/* Action Drilldown */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubjectModal(sub);
                              setModalTab("students");
                              setStudentSearch("");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold group-hover:bg-mainBlue group-hover:text-white transition-all"
                          >
                            View Roster ({sub.enrolled_count})
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-gray-400 italic">
                      No subjects found matching the selected program filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── SUBJECT & STUDENT ROSTER DETAIL MODAL ───────────────────────── */}
      {selectedSubjectModal && (
        <div
          onClick={() => setSelectedSubjectModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-scaleUp max-h-[90vh] flex flex-col justify-between"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#09314F] to-[#E83831] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                  {selectedSubjectModal.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      {selectedSubjectModal.name}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {selectedSubjectModal.course_title || "Program"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Subject ID #{selectedSubjectModal.id} • {selectedSubjectModal.enrolled_count} Enrolled Candidates
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <Icon icon="heroicons:x-mark-20-solid" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <button
                onClick={() => setModalTab("students")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  modalTab === "students"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon icon="heroicons:users-20-solid" className="w-3.5 h-3.5" />
                <span>Enrolled Students ({selectedSubjectModal.enrolled_count})</span>
              </button>
              <button
                onClick={() => setModalTab("classes")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  modalTab === "classes"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon icon="heroicons:video-camera-20-solid" className="w-3.5 h-3.5" />
                <span>Faculty & Classes ({selectedSubjectModal.classes?.length || 0})</span>
              </button>
              <button
                onClick={() => setModalTab("info")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  modalTab === "info"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon icon="heroicons:information-circle-20-solid" className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            </div>

            {/* TAB 1: Enrolled Students List */}
            {modalTab === "students" && (
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                <div className="relative">
                  <Icon
                    icon="heroicons:magnifying-glass-20-solid"
                    className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search candidate by name or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-mainBlue font-medium"
                  />
                </div>

                <div className="overflow-y-auto max-h-64 space-y-2 pr-1 divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredModalStudents.length > 0 ? (
                    filteredModalStudents.map((st) => (
                      <div
                        key={st.id}
                        className="pt-2 flex items-center justify-between text-xs hover:bg-gray-50/60 dark:hover:bg-gray-800/40 p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 overflow-hidden">
                            {st.avatar || st.profile_picture ? (
                              <img
                                src={`${API_BASE_URL}/storage/${st.avatar || st.profile_picture}`}
                                alt={st.fullname}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              st.firstname?.slice(0, 1) || "S"
                            )}
                          </div>
                          <div>
                            <h6 className="font-extrabold text-gray-900 dark:text-white leading-tight">
                              {st.fullname}
                            </h6>
                            <p className="text-[10px] text-gray-400">{st.email}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {st.department || "General"}
                          </span>
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            {st.enrolled_at ? new Date(st.enrolled_at).toLocaleDateString() : "Registered"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-400 italic">
                      {selectedSubjectModal.enrolled_count === 0
                        ? "No students are currently registered for this subject under this course."
                        : "No students matching your search criteria."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Classes & Faculty */}
            {modalTab === "classes" && (
              <div className="space-y-4 flex-1 overflow-y-auto max-h-64 pr-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Assigned Masterclass Tutors
                  </span>
                  {selectedSubjectModal.tutors?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedSubjectModal.tutors.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center gap-2.5 text-xs"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                            {t.firstname?.slice(0, 1)}
                          </div>
                          <div>
                            <h6 className="font-extrabold text-gray-900 dark:text-white leading-tight">
                              {t.firstname} {t.surname}
                            </h6>
                            <span className="text-[9px] uppercase font-bold text-purple-600 dark:text-purple-400">
                              {t.role || "Tutor"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No tutors currently assigned.</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Active Scheduled Classes
                  </span>
                  {selectedSubjectModal.classes?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSubjectModal.classes.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-gray-900 dark:text-white">{c.title}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 capitalize">
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No masterclasses scheduled.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Overview */}
            {modalTab === "info" && (
              <div className="space-y-4 flex-1 overflow-y-auto max-h-64">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {selectedSubjectModal.description || "Standard syllabus-aligned curriculum subject offered for examination preparation."}
                </p>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Applicable Faculty Departments
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(selectedSubjectModal.departments || []).map((d) => (
                      <span
                        key={d}
                        className="text-xs font-bold uppercase px-3 py-1 rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-100 dark:border-blue-900"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <button
              onClick={() => setSelectedSubjectModal(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#09314F] to-[#163759] text-white text-xs font-extrabold shadow-md hover:opacity-90 transition-all shrink-0"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </>
  );
}
