import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import {
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import tcLogo from "../../assets/images/TC 1.webp";

/**
 * SubjectBookCard
 * -------------------------------------------------------------------------
 * Card  : a physical journal. Rounded top-right cover corner, blue back
 *         cover peeking out right + bottom, a stack of paper leaves between,
 *         and a pink swallowtail ribbon hanging out of the bottom.
 *         Spine tape is unchanged (black in light mode, white in dark mode).
 *
 * Click : a big stage pops up -> the cover swings open on the spine ->
 *         three pages flip -> the destination page is revealed -> onClick().
 *         Non-interruptible while it plays.
 *
 * The keyframes are injected by the component itself (see BOOK_KEYFRAMES),
 * so no tailwind.config changes are needed.
 */

// Total time before onClick fires. Page flips end at ~2.3s.
const OPEN_DURATION = 2700;

// One page-width of the popup book. The open spread is 2x this wide.
const BOOK_W = "clamp(150px, 40vw, 400px)";

// Leather grain: tiny SVG noise, multiplied over the cover.
const LEATHER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

// Faint ruled lines for paper
const PAPER_LINES = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, transparent 0, transparent 23px, rgba(120,120,120,0.13) 23px, rgba(120,120,120,0.13) 24px)",
};

const BOOK_KEYFRAMES = `
@keyframes sbc-fade   { from { opacity: 0 } to { opacity: 1 } }
@keyframes sbc-pop    {
  from { transform: scale(.5) translateY(60px) rotateX(16deg); }
  to   { transform: scale(1) translateY(0) rotateX(0deg); }
}
@keyframes sbc-shift  { from { transform: translateX(0) } to { transform: translateX(50%) } }
@keyframes sbc-rim    {
  from { width: calc(100% + var(--ex)); }
  to   { width: calc(200% + var(--ex)); }
}
@keyframes sbc-flip   {
  from { transform: translateZ(var(--z0)) rotateY(0deg); }
  to   { transform: translateZ(var(--z1)) rotateY(-180deg); }
}
@keyframes sbc-fill   { from { width: 0% } to { width: 100% } }
`;

/* -------------------------------------------------------------------------- */
/* Spine tape: unchanged look, solid black (light) / solid white (dark)        */
/* -------------------------------------------------------------------------- */
function SpineTape({ label, className = "" }) {
  return (
    <>
      <div
        className={`bg-black dark:bg-white text-white dark:text-black flex flex-col justify-between items-center py-5 flex-shrink-0 relative z-30 transition-colors duration-300 shadow-[2px_0_6px_rgba(0,0,0,0.2)] ${className}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 dark:bg-black/30" />
        <span
          className="text-[9px] font-black uppercase tracking-[0.25em] rotate-180 opacity-70"
          style={{ writingMode: "vertical-rl" }}
        >
          {label || "TUTORIAL"}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 dark:bg-black/30" />
      </div>
      {/* Spine seam */}
      <div className="w-[1.5px] bg-black/40 dark:bg-black/20 pointer-events-none z-30 flex-shrink-0" />
    </>
  );
}

SpineTape.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
};

/* -------------------------------------------------------------------------- */
/* Ribbon: notched V-cut swallowtail                                           */
/* -------------------------------------------------------------------------- */
function Ribbon({ className = "", style }) {
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))", ...style }}
    >
      <div
        className="w-full h-full"
        style={{
          background: "linear-gradient(90deg, #FF6F88 0%, #FF5C77 55%, #E94A66 100%)",
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 78%, 0% 100%)",
        }}
      />
    </div>
  );
}

Ribbon.propTypes = { className: PropTypes.string, style: PropTypes.object };

/* -------------------------------------------------------------------------- */
/* One hinged sheet (cover or page) inside the 3D popup                        */
/* -------------------------------------------------------------------------- */
function Sheet({ z0, z1, delay, duration = 0.7, className = "", front, back }) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        "--z0": `${z0}px`,
        "--z1": `${z1}px`,
        transformStyle: "preserve-3d",
        transformOrigin: "left center",
        transform: `translateZ(${z0}px) rotateY(0deg)`,
        animation: `sbc-flip ${duration}s cubic-bezier(0.45,0.05,0.25,1) ${delay}s forwards`,
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
      >
        {front}
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        {back}
      </div>
    </div>
  );
}

Sheet.propTypes = {
  z0: PropTypes.number.isRequired,
  z1: PropTypes.number.isRequired,
  delay: PropTypes.number.isRequired,
  duration: PropTypes.number,
  className: PropTypes.string,
  front: PropTypes.node,
  back: PropTypes.node,
};

export default function SubjectBookCard({
  subject,
  courseTitle = "",
  role = "admin",
  progress = null,
  onClick,
  className = "",
}) {
  const [imageError, setImageError] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  // Resolve banner URL
  const getBannerSrc = () => {
    if (imageError || !subject?.banner) return null;
    if (subject.banner.startsWith("http")) return subject.banner;
    return `${API_BASE_URL}/storage/${subject.banner}`;
  };

  const bannerSrc = getBannerSrc();
  const subjectName = subject?.name || "Untitled Subject";
  const modulesCount = subject?.modules_count || subject?.total_modules || 0;
  const hasNoModules = modulesCount === 0;

  // Fallback palette when no banner is uploaded (first one matches the reference journal)
  const paletteIndex = ((subject?.id || 1) * 7) % 5;
  const fallbackGradients = [
    "from-[#FFC53A] via-[#FDB022] to-[#F59E0B]",
    "from-[#2B3A42] via-[#3F5866] to-[#1E292F]",
    "from-[#1F3A3D] via-[#2F565B] to-[#142628]",
    "from-[#3D2C2E] via-[#5C3D40] to-[#25191B]",
    "from-[#2E283D] via-[#483B60] to-[#1A1624]",
  ];
  const bgFallback = fallbackGradients[paletteIndex];

  const handleCardClick = () => {
    if (isOpening) return;
    setIsOpening(true);
  };

  // Run the sequence, then navigate. Both timers are cleaned up properly.
  useEffect(() => {
    if (!isOpening) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let resetTimer;
    const openTimer = setTimeout(() => {
      onClick?.();
      resetTimer = setTimeout(() => setIsOpening(false), 300);
    }, OPEN_DURATION);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(resetTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpening, onClick]);

  /* ------------------------------------------------------------------------ */
  /* Reusable cover artwork (card cover + popup cover share it)               */
  /* ------------------------------------------------------------------------ */
  const renderCoverArt = (withErrorHandler) => (
    <>
      <div className="absolute inset-0 z-0">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt={subjectName}
            onError={withErrorHandler ? () => setImageError(true) : undefined}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${bgFallback} flex flex-col items-center justify-center p-6 text-center text-white`}
          >
            <BookOpen className="w-10 h-10 text-white/90 mb-2 drop-shadow" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              {courseTitle}
            </span>
            <span className="text-sm font-black uppercase tracking-tight mt-1 px-2 line-clamp-3 drop-shadow">
              {subjectName}
            </span>
          </div>
        )}
      </div>

      {/* Leather grain */}
      <div
        className="absolute inset-0 z-[1] mix-blend-multiply opacity-60 pointer-events-none"
        style={{ backgroundImage: LEATHER_GRAIN, backgroundSize: "180px 180px" }}
      />
      {/* Soft sheen from the top-left, shade towards the bottom-right */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-br from-white/25 via-transparent to-black/20 pointer-events-none" />
    </>
  );

  /* ------------------------------------------------------------------------ */
  /* POPUP: pop up -> cover opens -> pages flip -> portal page                 */
  /* ------------------------------------------------------------------------ */
  const popup = isOpening && (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Opening ${subjectName}`}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-lg cursor-wait pointer-events-auto select-none px-4"
      style={{ animation: "sbc-fade 0.3s ease-out both" }}
    >
      <style>{BOOK_KEYFRAMES}</style>

      {/* Lock indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-black tracking-widest uppercase shadow-2xl animate-pulse">
        <Lock className="w-4 h-4 text-amber-400" />
        <span>
          {role === "admin" ? "Opening Curriculum Studio..." : "Opening Subject Modules..."}
        </span>
      </div>

      {/* Stage: one page wide, perspective lives here */}
      <div style={{ width: BOOK_W, aspectRatio: "1 / 1.4", perspective: "2600px" }}>
        {/* 1) pop-up scale */}
        <div
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            animation: "sbc-pop 0.55s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* 2) slide right by half a page so the open spread ends up centered */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              animation: "sbc-shift 0.9s cubic-bezier(0.45,0.05,0.25,1) 0.55s both",
            }}
          >
            {/* Back cover rim (blue), grows leftwards as the book opens */}
            <div
              className="absolute rounded-r-[44px] rounded-l-[14px] bg-[#09314F] dark:bg-[#07243A] shadow-[0_30px_80px_rgba(0,0,0,0.7)] border-r border-b border-blue-400/20"
              style={{
                top: 8,
                bottom: -12,
                right: -10,
                width: "calc(100% + 10px)",
                "--ex": "10px",
                transform: "translateZ(-3px)",
                animation: "sbc-rim 0.9s cubic-bezier(0.45,0.05,0.25,1) 0.55s forwards",
              }}
            />

            {/* Paper block peeking out behind the cover */}
            <div
              className="absolute rounded-r-[40px] rounded-l-[12px] bg-white dark:bg-[#F3EFE6] border border-gray-200 dark:border-gray-300"
              style={{
                top: 4,
                bottom: -6,
                right: -5,
                width: "calc(100% + 5px)",
                "--ex": "5px",
                transform: "translateZ(-2px)",
                animation: "sbc-rim 0.9s cubic-bezier(0.45,0.05,0.25,1) 0.55s forwards",
              }}
            />

            {/* Ribbon hanging out of the bottom, beneath the pages */}
            <Ribbon
              className="absolute"
              style={{
                left: "9%",
                bottom: -34,
                width: 30,
                height: 54,
                transform: "translateZ(-1px)",
              }}
            />

            {/* RIGHT PAGE: the destination portal, revealed once the pages flip */}
            <div
              className="absolute top-[5px] bottom-[5px] left-0 right-[7px] overflow-hidden rounded-r-[26px] rounded-l-sm bg-gradient-to-br from-[#0F2843] via-[#0E2033] to-[#081320] text-white p-4 sm:p-7 flex flex-col justify-between shadow-2xl"
              style={{ transform: "translateZ(0px)" }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/25 rounded-full blur-3xl animate-pulse pointer-events-none" />

              <div className="relative z-10 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                    {role === "admin" ? "Studio Window" : "Interactive Portal"}
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-3">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    Destination Live View
                  </span>
                  <h4 className="text-sm sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                    {role === "admin" ? "Curriculum & Lesson Studio" : "Subject Curriculum Modules"}
                  </h4>
                  <p className="hidden sm:block text-sm text-gray-300 font-medium leading-relaxed">
                    {role === "admin"
                      ? "Configuring topic modules, animated video uploads, lecture slides, and practice quiz sets..."
                      : "Loading animated video lectures, topic progression, and practice quizzes for this subject..."}
                  </p>
                </div>
              </div>

              <div className="relative z-10 space-y-2 pt-3">
                <div className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-300">
                  <ArrowRight className="w-3.5 h-3.5 mr-1.5 text-amber-400 animate-pulse" />
                  Entering
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 rounded-full"
                    style={{ width: 0, animation: "sbc-fill 1.4s ease-out 1.1s forwards" }}
                  />
                </div>
              </div>
            </div>

            {/* PAGE 3 (flips last). Its back is the LEFT page of the open spread. */}
            <Sheet
              z0={2}
              z1={7}
              delay={1.6}
              className="top-[5px] bottom-[5px] left-0 right-[7px]"
              front={
                <div
                  className="w-full h-full bg-[#FAF8F5] dark:bg-[#1E222B] rounded-r-[26px] rounded-l-sm border border-black/10"
                  style={PAPER_LINES}
                />
              }
              back={
                <div className="w-full h-full bg-[#FAF8F5] dark:bg-[#1E222B] rounded-l-[26px] rounded-r-sm border border-black/10 p-4 sm:p-7 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
                  <Ribbon
                    className="absolute left-8"
                    style={{ top: -2, width: 24, height: 64 }}
                  />
                  <div className="space-y-3 relative z-10 pt-6 sm:pt-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center shadow-sm">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#09314F] dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#BB9E7F]">
                        {courseTitle || "Tutorial Center"}
                      </span>
                      <h3 className="font-black text-base sm:text-2xl text-[#09314F] dark:text-white uppercase tracking-tight leading-tight mt-1 line-clamp-3">
                        {subjectName}
                      </h3>
                    </div>
                    <div className="h-1 w-16 bg-amber-400 rounded-full" />
                  </div>
                  <div className="space-y-2 relative z-10 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white uppercase text-[10px] sm:text-[11px] tracking-wider">
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span>{modulesCount} Interactive Topics</span>
                    </div>
                    <p className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400">
                      Animated instructional lectures, slide summaries, and practice quizzes.
                    </p>
                  </div>
                </div>
              }
            />

            {/* PAGE 2 */}
            <Sheet
              z0={4}
              z1={5}
              delay={1.4}
              className="top-[5px] bottom-[5px] left-0 right-[7px]"
              front={
                <div
                  className="w-full h-full bg-[#FAF8F5] dark:bg-[#1E222B] rounded-r-[26px] rounded-l-sm border border-black/10"
                  style={PAPER_LINES}
                />
              }
              back={
                <div
                  className="w-full h-full bg-[#FAF8F5] dark:bg-[#1E222B] rounded-l-[26px] rounded-r-sm border border-black/10 relative"
                  style={PAPER_LINES}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/15 to-transparent" />
                </div>
              }
            />

            {/* PAGE 1 */}
            <Sheet
              z0={6}
              z1={3}
              delay={1.2}
              className="top-[5px] bottom-[5px] left-0 right-[7px]"
              front={
                <div
                  className="w-full h-full bg-[#FAF8F5] dark:bg-[#1E222B] rounded-r-[26px] rounded-l-sm border border-black/10 relative"
                  style={PAPER_LINES}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/15 to-transparent" />
                </div>
              }
              back={
                <div
                  className="w-full h-full bg-[#FAF8F5] dark:bg-[#1E222B] rounded-l-[26px] rounded-r-sm border border-black/10 relative"
                  style={PAPER_LINES}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/15 to-transparent" />
                </div>
              }
            />

            {/* FRONT COVER: swings open on the spine */}
            <Sheet
              z0={8}
              z1={1}
              delay={0.55}
              duration={0.9}
              className="inset-0"
              front={
                <div className="w-full h-full flex rounded-tr-[44px] rounded-br-[28px] rounded-l-md overflow-hidden shadow-2xl border-t border-l border-b border-white/20">
                  <SpineTape label={courseTitle} className="w-10 sm:w-14" />
                  <div className="flex-1 relative h-full overflow-hidden">
                    {renderCoverArt(false)}
                  </div>
                </div>
              }
              back={
                <div className="w-full h-full bg-gradient-to-br from-[#09314F] via-[#0E3E66] to-[#07243A] dark:from-[#061D2F] dark:via-[#09314F] dark:to-[#041320] rounded-l-[44px] rounded-r-md border border-blue-400/30 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden shadow-2xl">
                  {/* Ambient soft glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_70%)] pointer-events-none" />

                  {/* Leather grain */}
                  <div
                    className="absolute inset-0 z-[1] mix-blend-overlay opacity-30 pointer-events-none"
                    style={{ backgroundImage: LEATHER_GRAIN, backgroundSize: "180px 180px" }}
                  />

                  {/* Emblem Container with Tutorial Center Logo */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.35)] border border-white/40 flex items-center justify-center p-2 sm:p-2.5 mb-3 backdrop-blur-sm">
                      <img
                        src={tcLogo}
                        alt="Tutorial Center Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-white/95 drop-shadow-md">
                      Tutorial Center
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-amber-300/90 mt-1">
                      Study That Stays
                    </span>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Portal so no transformed parent can trap the fixed overlay */}
      {popup && typeof document !== "undefined" ? createPortal(popup, document.body) : null}

      {/* ===================================================================== */}
      {/* THE JOURNAL CARD                                                       */}
      {/* ===================================================================== */}
      <div
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className={`group relative select-none cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/40 rounded-3xl transition-all duration-300 flex flex-col items-center ${className}`}
      >
        {/* Label + stats above the book */}
        <div className="w-full text-center space-y-0.5 mb-3 px-2">
          <h4 className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100 uppercase tracking-tight truncate group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
            {subjectName}
          </h4>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <Layers className="w-3 h-3 text-gray-400" />
            <span>
              {modulesCount} {modulesCount === 1 ? "Topic" : "Topics"}
              {courseTitle ? ` · ${courseTitle}` : ""}
            </span>
          </div>
        </div>

        {/* Book. The margins leave room for the rim + ribbon that poke out. */}
        <div className="relative w-full max-w-[240px] sm:max-w-[260px] aspect-[3/4.4] mb-7 mr-2.5 transition-transform duration-500 ease-out group-hover:-translate-y-2.5 group-hover:-rotate-1">
          {/* Ground shadow */}
          <div className="absolute inset-0 rounded-r-[34px] rounded-l-md bg-black/25 dark:bg-black/60 blur-xl translate-x-4 translate-y-7 group-hover:translate-x-5 group-hover:translate-y-9 group-hover:blur-2xl transition-all duration-500 pointer-events-none" />

          {/* 1. BACK COVER: blue, shifted down-right so it peeks out */}
          <div className="absolute inset-0 translate-x-[7px] translate-y-[9px] rounded-tr-[34px] rounded-br-[30px] rounded-l-md bg-[#09314F] dark:bg-[#07243A] shadow-[inset_0_-3px_5px_rgba(0,0,0,0.35),inset_-2px_0_4px_rgba(0,0,0,0.2)] border-r border-b border-blue-400/20 z-0 pointer-events-none" />

          {/* 2. PAPER BLOCK: sits between the back cover and the front cover */}
          <div className="absolute inset-0 translate-x-[3.5px] translate-y-[4.5px] rounded-tr-[32px] rounded-br-[28px] rounded-l-sm bg-[#FFFDF8] dark:bg-[#F3EFE6] border border-black/10 z-10 overflow-hidden pointer-events-none">
            {/* page edges, right side */}
            <div
              className="absolute right-0 top-0 bottom-0 w-[6px]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, transparent 0, transparent 1.5px, rgba(0,0,0,0.14) 1.5px, rgba(0,0,0,0.14) 2px)",
              }}
            />
            {/* page edges, bottom */}
            <div
              className="absolute left-0 right-0 bottom-0 h-[6px]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0, transparent 1.5px, rgba(0,0,0,0.14) 1.5px, rgba(0,0,0,0.14) 2px)",
              }}
            />
          </div>

          {/* 3. RIBBON: emerges from between the pages, hangs below the book */}
          <Ribbon className="absolute left-6 -bottom-6 w-6 h-10 z-20" />

          {/* 4. FRONT COVER */}
          <div className="relative w-full h-full flex rounded-tr-[34px] rounded-br-[20px] rounded-l-[6px] overflow-hidden z-30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.25)] border-t border-l border-b border-white/20">
            <SpineTape label={courseTitle} className="w-9 sm:w-11" />

            <div className="flex-1 relative h-full overflow-hidden bg-gray-50 dark:bg-gray-900 group-hover:[&_img]:scale-105 [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out">
              {renderCoverArt(true)}

              {/* Status pill, top right */}
              <div className="absolute top-0 right-0 z-10 p-3.5 flex items-start justify-end">
                {hasNoModules ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md">
                    Coming Soon
                  </span>
                ) : progress !== null ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-amber-300" />
                    {Math.round(progress)}%
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-wider">
                    {modulesCount} Topics
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

SubjectBookCard.propTypes = {
  subject: PropTypes.object.isRequired,
  courseTitle: PropTypes.string,
  role: PropTypes.oneOf(["admin", "student"]),
  progress: PropTypes.number,
  onClick: PropTypes.func,
  className: PropTypes.string,
};