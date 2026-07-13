import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
// import gsap from "gsap";
import { Icon } from "@iconify/react";

// ── Mock data (swap with real API when available) ────────────────────────────
const MOCK_ATTENDANCE = [
  { day: "Mon", present: true },
  { day: "Tue", present: true },
  { day: "Wed", present: true },
  { day: "Thu", present: false },
  { day: "Fri", present: true },
  { day: "Sat", present: false },
  { day: "Sun", present: false },
];
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

// ── 7-bar Attendance mini-chart ───────────────────────────────────────────────
function AttendanceBars({ data }) {
  return (
    <div className="flex items-end gap-[5px]">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={`w-[7px] rounded-full transition-all duration-500 ${
              d.present
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                : "bg-white/15"
            }`}
            style={{ height: d.present ? "32px" : "16px" }}
          />
          <span className="text-[9px] font-bold text-white/35">{d.day[0]}</span>
        </div>
      ))}
    </div>
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
export default function StudentStatsBar({
  avgScore = MOCK_AVG_SCORE,
  attendance = MOCK_ATTENDANCE,
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
            <AttendanceBars data={attendance} />
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

