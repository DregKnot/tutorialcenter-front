import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext";
import gsap from "gsap";
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

const ANGLE_STEP = 36; // degrees between each slot item
const RADIUS = 90; // tighter 3D radius for in-place cylinder translation

// ── Highlight Pill (Auto-scroll & GSAP 3D Slot Machine Popup) ────────────────
function HighlightPill({ highlights, onToggleExpand }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const wheelRef = useRef(null);
  const cardsRef = useRef([]);

  // Notify parent of expansion state to manage overflow/z-index
  useEffect(() => {
    if (onToggleExpand) {
      onToggleExpand(isExpanded);
    }
  }, [isExpanded, onToggleExpand]);

  // Auto-scroll logic (closed state)
  useEffect(() => {
    const currentWrapper = wrapperRef.current;
    if (isExpanded || !highlights || highlights.length <= 1) {
      if (currentWrapper) gsap.killTweensOf(currentWrapper);
      return;
    }
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % highlights.length;
      gsap.to(currentWrapper, {
        y: -currentIndex * 68,
        duration: 0.6,
        ease: "power3.inOut"
      });
    }, 4500);

    return () => {
      clearInterval(interval);
      if (currentWrapper) gsap.killTweensOf(currentWrapper);
    };
  }, [isExpanded, highlights]);

  // Initial spin animation when the slot machine expands
  useEffect(() => {
    if (isExpanded && wheelRef.current) {
      gsap.fromTo(
        wheelRef.current,
        { rotateX: -720 },
        {
          rotateX: -activeIndex * ANGLE_STEP,
          duration: 1.8,
          ease: "power4.out"
        }
      );
    }
  }, [isExpanded, activeIndex]);

  // Smooth rotation update helper
  const rotateTo = (index) => {
    let target = Math.max(0, Math.min(highlights.length - 1, index));
    setActiveIndex(target);
    if (wheelRef.current) {
      gsap.to(wheelRef.current, {
        rotateX: -target * ANGLE_STEP,
        duration: 0.4,
        ease: "power3.out"
      });
    }
  };

  // Drag / Swipe controls to rotate the slot machine wheel
  const dragStart = useRef(0);
  const isDragging = useRef(false);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const deltaY = e.clientY - dragStart.current;
    if (Math.abs(deltaY) > 20) {
      if (deltaY > 0) {
        rotateTo(activeIndex - 1);
      } else {
        rotateTo(activeIndex + 1);
      }
      dragStart.current = e.clientY;
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!highlights || highlights.length === 0) return;
    setIsExpanded(!isExpanded);
  };

  // Wheel scroll event to rotate drum
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      rotateTo(activeIndex + 1);
    } else {
      rotateTo(activeIndex - 1);
    }
  };

  if (!highlights || highlights.length === 0) return null;

  return (
    <>
      {/* Absolute Screen Backdrop Blur */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md transition-all duration-300"
          onDoubleClick={handleDoubleClick}
        />
      )}
      
      <div 
        ref={containerRef}
        onDoubleClick={handleDoubleClick}
        className={`transition-all duration-300 ${
          isExpanded 
            ? 'absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[260px] rounded-3xl bg-gradient-to-br from-[#0c2238] to-[#120a1c] border border-white/20 p-4 shadow-2xl z-[102] flex flex-col justify-between cursor-grab active:cursor-grabbing select-none'
            : 'relative w-full h-[68px] overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hidden lg:block transition-colors'
        }`}
        onPointerDown={isExpanded ? handlePointerDown : undefined}
        onPointerMove={isExpanded ? handlePointerMove : undefined}
        onPointerUp={isExpanded ? handlePointerUp : undefined}
        onWheel={isExpanded ? handleWheel : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {isExpanded ? (
          /* Expanded View: In-place 3D Slot Machine Drum */
          <>
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                <h3 className="text-white font-black text-[9px] uppercase tracking-[0.25em]">Highlights</h3>
              </div>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Double-click to close</span>
            </div>

            {/* Viewport for the 3D Drum */}
            <div 
              className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-2"
              style={{ height: "150px", perspective: "1000px" }}
            >
              {/* Highlight window frame */}
              <div 
                className="absolute left-0 right-0 h-[54px] bg-white/[0.02] border-y border-white/10 rounded-xl pointer-events-none z-10"
                style={{
                  background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0) 100%)"
                }}
              />

              {/* 3D Cylinder Container */}
              <div 
                ref={wheelRef}
                className="relative w-full h-[54px] transition-transform duration-100 ease-out"
                style={{ transformStyle: "preserve-3d" }}
              >
                {highlights.map((h, i) => {
                  const angle = i * ANGLE_STEP;
                  const isCurrent = i === activeIndex;
                  
                  let icon = "lucide:info";
                  let badgeColor = "text-blue-300 bg-blue-500/10 border-blue-500/20";
                  if (h.type === 'payment') {
                    icon = "lucide:credit-card";
                    badgeColor = "text-red-400 bg-red-500/10 border-red-500/20";
                  } else if (h.type === 'liveclass') {
                    icon = "lucide:video";
                    badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                  } else if (h.type === 'merit') {
                    icon = "lucide:award";
                    badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                  } else if (h.type === 'blog') {
                    icon = "lucide:book-open";
                    badgeColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
                  }

                  return (
                    <div 
                      key={i}
                      ref={el => cardsRef.current[i] = el}
                      className={`absolute left-2 right-2 h-[54px] border rounded-xl px-3 py-2 shadow-md flex items-center justify-between gap-3 transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-[#09314F] border-white/20 opacity-100 scale-100 shadow-[0_6px_15px_-3px_rgba(0,0,0,0.3)]' 
                          : 'bg-[#0a1829]/60 border-white/5 opacity-30 scale-90 pointer-events-none'
                      }`}
                      style={{ 
                        transform: `rotateX(${angle}deg) translateZ(${RADIUS}px)`,
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                        top: 0
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${badgeColor}`}>
                          <Icon icon={icon} className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-[7px] font-black uppercase tracking-widest ${isCurrent ? 'opacity-80' : 'opacity-40'}`}>
                            {h.type}
                          </span>
                          <span className="text-white font-bold text-[11px] truncate leading-tight">{h.text}</span>
                        </div>
                      </div>
                      
                      {isCurrent && (
                        <a 
                          href={h.actionUrl} 
                          className="shrink-0 px-3 py-1 bg-[#C5A97A] hover:bg-[#b09465] active:scale-95 text-[#0a1829] rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm"
                        >
                          {h.actionLabel}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation drum controllers */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 shrink-0 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              <span>
                {activeIndex + 1} / {highlights.length}
              </span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => rotateTo(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  className="w-6 h-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none text-white text-[8px]"
                >
                  ▲
                </button>
                <button 
                  onClick={() => rotateTo(activeIndex + 1)}
                  disabled={activeIndex === highlights.length - 1}
                  className="w-6 h-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none text-white text-[8px]"
                >
                  ▼
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Closed View: Auto-scrolling pill */
          <div ref={wrapperRef} className="absolute top-0 left-0 w-full">
            {highlights.map((h, i) => (
              <div 
                key={i}
                className="absolute left-0 right-0 w-full h-[68px] px-6 py-4 flex items-center justify-between gap-4"
                style={{ top: i * 68 }}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${h.type === 'payment' ? 'text-red-400' : 'text-blue-300'}`}>
                    {h.type}
                  </span>
                  <span className="text-white font-bold text-[13px] truncate leading-tight">{h.text}</span>
                </div>
                <span className="shrink-0 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors shadow-sm">
                  {h.actionLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`w-full rounded-2xl shadow-xl transition-all duration-300 ${isExpanded ? 'relative z-[101]' : 'overflow-hidden'}`}
      style={{ background: "linear-gradient(135deg, #0c2238 0%, #1a3a5c 55%, #241530 100%)" }}
    >
      <div className="flex flex-wrap items-center gap-6 md:gap-10 px-6 py-5 md:px-10 md:py-6">

        {/* ── Avatar + Name ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="relative w-[60px] h-[60px] flex-shrink-0">
            <RingProgress value={streak} max={MAX_STREAK} color="#bb9e7f" size={60} stroke={4} />
            <div className="absolute inset-[6px] rounded-full bg-[#09314F]/80 flex items-center justify-center text-white font-black text-base shadow-inner backdrop-blur-sm overflow-hidden">
              {student?.profile_picture ? (
                <img src={`${API_BASE_URL}/storage/${student.profile_picture}`} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-white font-black text-base leading-tight">
              {firstName} {lastName}
            </p>
            <p className="text-white/45 text-[12px] font-semibold mt-0.5">Student</p>
          </div>
        </div>

        <Divider />

        {/* ── Average Score ─────────────────────────────────────────────── */}
        <StatCell label="Avg Score">
          <span
            className="text-[38px] font-black leading-none"
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
          <div className="relative w-[54px] h-[54px]">
            <RingProgress value={streak} max={MAX_STREAK} color="#bb9e7f" size={54} stroke={4} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-white">{streak}</span>
            </div>
          </div>
        </StatCell>

        {/* ── Highlight Section Demarcation & Pill ──────────────────────── */}
        <div className="hidden lg:block w-px self-stretch bg-white/20 my-1" />
        <div className="flex-1 min-w-[280px] relative h-[68px]">
          <HighlightPill highlights={highlights} onToggleExpand={setIsExpanded} />
        </div>

      </div>
    </div>
  );
}

