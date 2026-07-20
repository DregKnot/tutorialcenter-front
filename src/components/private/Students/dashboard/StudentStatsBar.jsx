import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
// import gsap from "gsap";
import { Icon } from "@iconify/react";

const MOCK_AVG_SCORE = 72.5;
const MOCK_STREAK = 5;
const MAX_STREAK = 30;

// ── Circular progress ring ────────────────────────────────────────────────────
function RingProgress({ value, max, color = "#E83831", size = 60, stroke = 5 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(value / max, 1));
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

// ── Format minutes into human-readable string ────────────────────────────────
function formatMinutes(min) {
  if (min <= 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ── 7-bar Attendance mini-chart with expandable detail ────────────────────────
function AttendanceBars({ data, targetMinutes = 300 }) {
  const [expanded, setExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const getBarColor = (d) => {
    if (d.minutes <= 0) return "bg-white/10";
    if (d.overflow) return "bg-amber-400";
    return "bg-emerald-400";
  };

  const getBarGlow = (d) => {
    if (d.minutes <= 0) return "";
    if (d.overflow) return "shadow-[0_0_12px_rgba(251,191,36,0.8)]";
    return "shadow-[0_0_8px_rgba(52,211,153,0.7)]";
  };

  const getBarHeight = (d) => {
    if (d.minutes <= 0) return "14px";
    // Scale: 14px min → 36px max based on percent
    return `${Math.max(14, Math.round(14 + (d.percent / 100) * 22))}px`;
  };

  // ── Compact bars (always visible) ──
  const compactBars = (
    <div
      className="flex items-end gap-[5px] cursor-pointer relative"
      onClick={() => setExpanded(true)}
      title="Click to view activity details"
    >
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={`w-[7px] rounded-full transition-all duration-500 ${getBarColor(d)} ${getBarGlow(d)}`}
            style={{ height: getBarHeight(d) }}
          />
          <span className={`text-[9px] font-bold ${d.overflow ? "text-amber-400/80" : "text-white/35"}`}>
            {d.day[0]}
          </span>
        </div>
      ))}
    </div>
  );

  // ── Expanded detail panel ──
  const detailContent = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-white tracking-wide">Weekly Activity</h4>
          <p className="text-[10px] text-white/40 font-semibold mt-0.5">
            Target: {formatMinutes(targetMinutes)} per day
          </p>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all text-xs font-bold"
        >
          ✕
        </button>
      </div>

      {/* Horizontal bar chart */}
      <div className="space-y-2">
        {data.map((d, i) => {
          const fillPercent = Math.min((d.minutes / targetMinutes) * 100, 100);
          const overflowPercent = d.overflow
            ? Math.min(((d.minutes - targetMinutes) / targetMinutes) * 100, 40)
            : 0;

          return (
            <div key={i} className="flex items-center gap-3">
              {/* Day label */}
              <span className={`text-[11px] font-black w-8 shrink-0 ${d.overflow ? "text-amber-400" : d.minutes > 0 ? "text-white/70" : "text-white/25"}`}>
                {d.day}
              </span>

              {/* Bar track */}
              <div className="flex-1 h-[14px] bg-white/5 rounded-full overflow-hidden relative">
                {/* 5-hour scale markers */}
                {[1, 2, 3, 4].map((hr) => (
                  <div
                    key={hr}
                    className="absolute top-0 bottom-0 w-px bg-white/10"
                    style={{ left: `${(hr / 5) * 100}%` }}
                  />
                ))}

                {/* Main fill */}
                <div
                  className={`h-full rounded-full transition-all duration-700 relative ${
                    d.minutes <= 0
                      ? "bg-transparent"
                      : d.overflow
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  }`}
                  style={{ width: `${fillPercent}%` }}
                />

                {/* Overflow gold extension */}
                {d.overflow && (
                  <div
                    className="absolute top-0 bottom-0 rounded-r-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700"
                    style={{
                      left: "100%",
                      width: `${overflowPercent}%`,
                      marginLeft: "-2px",
                      boxShadow: "0 0 14px rgba(251,191,36,0.6)",
                    }}
                  />
                )}
              </div>

              {/* Time label */}
              <span className={`text-[11px] font-black w-14 text-right shrink-0 ${
                d.overflow ? "text-amber-400" : d.minutes > 0 ? "text-emerald-400" : "text-white/20"
              }`}>
                {d.minutes > 0 ? formatMinutes(d.minutes) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* 5-hour scale legend */}
      <div className="flex justify-between px-11 text-[8px] font-bold text-white/20 uppercase tracking-wider">
        <span>0h</span>
        <span>1h</span>
        <span>2h</span>
        <span>3h</span>
        <span>4h</span>
        <span>5h</span>
      </div>
    </div>
  );

  return (
    <>
      {compactBars}

      {/* Desktop: horizontal expanded overlay */}
      {expanded && !isMobile && (
        <>
          <div className="fixed inset-0 z-[98]" onClick={() => setExpanded(false)} />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99] w-[420px] p-5 rounded-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: "linear-gradient(135deg, #0c2238 0%, #1a3a5c 55%, #241530 100%)",
              boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            {detailContent}
          </div>
        </>
      )}

      {/* Mobile: popup modal */}
      {expanded && isMobile && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setExpanded(false)}>
          <div
            className="w-full max-w-md p-5 rounded-t-3xl rounded-b-2xl border border-white/10 animate-in slide-in-from-bottom duration-300"
            style={{
              background: "linear-gradient(135deg, #0c2238 0%, #1a3a5c 55%, #241530 100%)",
              boxShadow: "0 -10px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {detailContent}
          </div>
        </div>
      )}
    </>
  );
}

// ── Vertical divider ─────────────────────────────────────────────────────────
function Divider() {
  return <div className="hidden md:block w-px self-stretch bg-white/10 mx-2" />;
}

// ── Stat cell ────────────────────────────────────────────────────────────────
function StatCell({ label, children }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.12em]">{label}</span>
    </div>
  );
}

// ── Smart Assistant Widget (3D Roulette Liquid Glass Carousel) ───────────────
function SmartAssistantWidget() {
  const [activeIndex, setActiveIndex] = useState(0);

  const messages = [
    {
      title: "Streak reset?",
      desc: "Let's check your progress.",
      icon: "lucide:history",
      color: "text-orange-400",
      bg: "bg-orange-500/20 border-orange-500/30",
      action: "Review",
      actionBg: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Merit unlocked",
      desc: "Fulfill this challenge.",
      icon: "lucide:award",
      color: "text-emerald-400",
      bg: "bg-emerald-500/20 border-emerald-500/30",
      action: "Start",
      actionBg: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      title: "Biology 101",
      desc: "Score 45% to restore!",
      icon: "lucide:microscope",
      color: "text-blue-400",
      bg: "bg-blue-500/20 border-blue-500/30",
      action: "Practice",
      actionBg: "bg-blue-500 hover:bg-blue-600"
    }
  ];

  // 3D Roulette Rotation logic (CSS-based)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % messages.length);
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div 
      className="w-full xl:w-[300px] shrink-0 h-[80px] xl:h-auto relative rounded-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        perspective: "1000px"
      }}
    >
      {/* Decorative glass glare */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none z-10" />

      {/* 3D Roulette Cylinder Container */}
      <div className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }}>
        {messages.map((msg, i) => {
          const isCurrent = i === activeIndex;
          const isPrev = i === (activeIndex - 1 + messages.length) % messages.length;

          return (
            <div 
              key={i} 
              className="absolute inset-0 w-full px-4 flex items-center justify-between gap-3 shrink-0"
              style={{
                transform: isCurrent 
                  ? "translateY(0) rotateX(0deg)" 
                  : isPrev 
                    ? "translateY(-100%) rotateX(-90deg)" 
                    : "translateY(100%) rotateX(90deg)",
                transformOrigin: "center center -30px",
                backfaceVisibility: "hidden",
                transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease",
                opacity: isCurrent ? 1 : 0,
                transformStyle: "preserve-3d"
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border shadow-inner ${msg.bg}`}>
                  <Icon icon={msg.icon} className={`${msg.color} w-4 h-4`} />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-[12px] leading-tight truncate">{msg.title}</p>
                  <p className={`${msg.color} text-[9px] font-semibold uppercase tracking-wider truncate mt-0.5`}>{msg.desc}</p>
                </div>
              </div>

              {/* Action Button */}
              <button className={`shrink-0 px-3.5 py-1.5 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md ${msg.actionBg}`}>
                {msg.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}



// ── Main Stats Bar ────────────────────────────────────────────────────────────
// Default empty week for when data hasn't loaded yet
const EMPTY_WEEK = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => ({
  day, date: "", minutes: 0, sessions: [], percent: 0, overflow: false
}));

export default function StudentStatsBar({
  avgScore = MOCK_AVG_SCORE,
  weekActivity = EMPTY_WEEK,
  streak = MOCK_STREAK,
  highlights = [],
}) {
  const { student } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const firstName = student?.firstname || "Student";
  const lastName = student?.surname || "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  return (
    // Grandparent container spanning the entire stats area with dark radial gradient
    <div 
      className="w-full rounded-2xl shadow-2xl p-1.5 flex flex-col xl:flex-row gap-1 items-stretch relative overflow-hidden"
      style={{
        background: "radial-gradient(circle at center, #000000 20%, #09314F 150%)"
      }}
    >
      {/* Decorative inner wrapper border to match premium feel */}
      <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Main Stats Container (Parent) */}
      <div
        className="flex-1 rounded-xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #0c2238 0%, #1a3a5c 55%, #241530 100%)" }}
      >
        <div className="flex flex-wrap items-center justify-between xl:justify-start gap-4 md:gap-6 xl:gap-8 px-6 py-4 md:px-10 h-full">

          {/* ── Avatar + Name ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <div className="relative w-[50px] h-[50px] flex-shrink-0">
              <RingProgress value={streak} max={MAX_STREAK} color="#bb9e7f" size={50} stroke={4.5} />
              <div className="absolute inset-[5px] rounded-full bg-[#09314F]/80 flex items-center justify-center text-white font-black text-xs shadow-inner backdrop-blur-sm overflow-hidden">
                {student?.profile_picture ? (
                  <img src={`${API_BASE_URL}/storage/${student.profile_picture}`} alt="avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-white font-black text-sm leading-tight">
                {firstName} {lastName}
              </p>
              <p className="text-white/45 text-[11px] font-semibold mt-0.5">Student</p>
            </div>
          </div>

          <Divider />

          {/* ── Average Score ─────────────────────────────────────────────── */}
          <StatCell label="Avg Score">
            <span
              className="text-[32px] font-black leading-none"
              style={{ color: "#E83831", textShadow: "0 0 24px rgba(232,56,49,0.45)" }}
            >
              {avgScore}
            </span>
          </StatCell>

          <Divider />

          {/* ── Attendance ────────────────────────────────────────────────── */}
          <StatCell label="Attendance">
            <AttendanceBars data={weekActivity} />
          </StatCell>

          <Divider />

          {/* ── Streaks ───────────────────────────────────────────────────── */}
          <StatCell label="Streaks">
            <div className="relative w-[48px] h-[48px]">
              <RingProgress value={streak} max={MAX_STREAK} color="#bb9e7f" size={48} stroke={4.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-white">{streak}</span>
              </div>
            </div>
          </StatCell>

        </div>
      </div>

      {/* ── Cut-out Highlight Pill (Sits on Grandparent Gradient background) ───── */}
      <SmartAssistantWidget streak={streak} />
      
    </div>
  );
}

