import React from 'react';

/**
 * PracticeChampionMedal - Custom Standalone Medal for "Practice Champion" (2,500 Practice Questions)
 * 
 * Styled with Grand Golden Championship Trophy, Victory Laurels & Dynamic Micro-Animations:
 * - Grand golden championship trophy cup with victory handles & laurel wreath wrapping around the book.
 * - Rotating radiant sunburst beams of triumph behind the trophy.
 * - Subtly animated shimmering gold page glow and twinkling championship sparkle stars.
 * - Convex glowing lens proudly magnifying the "2,500" milestone.
 * - 100% vector art with rich gradients, trophy reflections, and soft drop shadow.
 */
export default function PracticeChampionMedal({
  size = 140,
  earned = true,
  count = "2,500",
  animated = false,
  className = ""
}) {
  const id = React.useId().replace(/:/g, "_");
  const isPlaying = earned && animated;

  return (
    <div 
      style={{ width: size, height: size }} 
      className={`relative flex items-center justify-center transition-transform duration-300 ${
        earned 
          ? "hover:scale-110 drop-shadow-2xl" 
          : "filter grayscale contrast-75 opacity-40"
      } ${className}`}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full drop-shadow-xl overflow-visible select-none"
      >
        <defs>
          <style>{`
            @keyframes ${id}_rotateRay {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes ${id}_shimmer {
              0%, 100% { opacity: 0.3; transform: scale(0.98); }
              50% { opacity: 0.85; transform: scale(1.03); }
            }
            @keyframes ${id}_starTwinkle {
              0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
              50% { transform: scale(1.25) rotate(15deg); opacity: 1; filter: drop-shadow(0 0 4px #facc15); }
            }
            .${id}_rayAnimation {
              transform-origin: 50px 50px;
              animation: ${id}_rotateRay 24s linear infinite;
            }
            .${id}_shimmerAnimation {
              transform-origin: 50px 50px;
              animation: ${id}_shimmer 3s ease-in-out infinite;
            }
            .${id}_twinkle1 {
              transform-origin: 12px 16px;
              animation: ${id}_starTwinkle 2.5s ease-in-out infinite;
            }
            .${id}_twinkle2 {
              transform-origin: 88px 16px;
              animation: ${id}_starTwinkle 2.5s ease-in-out infinite 0.7s;
            }
            .${id}_twinkle3 {
              transform-origin: 50px 8px;
              animation: ${id}_starTwinkle 2s ease-in-out infinite 1.2s;
            }
          `}</style>

          {/* Drop Shadow Filter */}
          <filter id={`${id}_dropShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Book Edge Champion Neon Glow Filter */}
          <filter id={`${id}_champGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#fbbf24" floodOpacity="0.9" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.5" />
          </filter>

          {/* Golden Trophy & Laurels Gradient */}
          <linearGradient id={`${id}_goldTrophyGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Hardcover Outer Binding Gradient (Royal Gold / Crimson Velvet) */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#1c0a00" />
          </linearGradient>

          {/* Left Page Gradient */}
          <linearGradient id={`${id}_leftPageGrad`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Right Page Gradient */}
          <linearGradient id={`${id}_rightPageGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Side Layered Pages */}
          <linearGradient id={`${id}_sideLeaves`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>

          {/* Magnifying Glass Bezel Ring Gradient */}
          <linearGradient id={`${id}_glassRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Glowing Convex Glass Lens */}
          <radialGradient id={`${id}_lensGrad`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#a5f3fc" />
            <stop offset="75%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Handle Gradient */}
          <linearGradient id={`${id}_handleGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* 2,500 Golden Glowing Number Gradient */}
          <linearGradient id={`${id}_numGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Ambient Sunburst Radiance */}
          <radialGradient id={`${id}_searchAura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Aura Glow */}
        <circle cx="50" cy="50" r="46" fill={`url(#${id}_searchAura)`} />

        {/* ── 0. ROTATING CHAMPIONSHIP SUNBURST RAYS (BACKGROUND ANIMATION) ── */}
        {isPlaying && (
          <g className={`${id}_rayAnimation`} opacity="0.45">
            <path d="M 50 50 L 46 0 L 54 0 Z" fill="#fde047" />
            <path d="M 50 50 L 96 14 L 100 22 Z" fill="#fde047" />
            <path d="M 50 50 L 100 46 L 100 54 Z" fill="#fde047" />
            <path d="M 50 50 L 86 96 L 78 100 Z" fill="#fde047" />
            <path d="M 50 50 L 54 100 L 46 100 Z" fill="#fde047" />
            <path d="M 50 50 L 4 86 L 0 78 Z" fill="#fde047" />
            <path d="M 50 50 L 0 54 L 0 46 Z" fill="#fde047" />
            <path d="M 50 50 L 14 4 L 22 0 Z" fill="#fde047" />
          </g>
        )}

        {/* ── 1. GRAND GOLDEN CHAMPIONSHIP LAUREL WREATH (WRAPPING AROUND BOOK) ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          {/* Left Laurel Branch */}
          <g transform="translate(18, 50)">
            <path d="M 6 36 C -6 20, -10 -10, 4 -28" fill="none" stroke={`url(#${id}_goldTrophyGrad)`} strokeWidth="2.8" strokeLinecap="round" />
            {/* Laurel Leaf Pairs */}
            <path d="M 2 -26 Q -6 -30, -10 -24 Q -4 -22, 2 -26" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1" />
            <path d="M -2 -14 Q -12 -16, -14 -8 Q -6 -8, -2 -14" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1" />
            <path d="M -6 0 Q -16 0, -16 8 Q -8 8, -6 0" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1" />
            <path d="M -4 14 Q -14 18, -12 26 Q -4 22, -4 14" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1" />
          </g>

          {/* Right Laurel Branch */}
          <g transform="translate(82, 50)">
            <path d="M -6 36 C 6 20, 10 -10, -4 -28" fill="none" stroke={`url(#${id}_goldTrophyGrad)`} strokeWidth="2.8" strokeLinecap="round" />
            {/* Laurel Leaf Pairs */}
            <path d="M -2 -26 Q 6 -30, 10 -24 Q 4 -22, -2 -26" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1" />
            <path d="M 2 -14 Q 12 -16, 14 -8 Q 6 -8, 2 -14" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1" />
            <path d="M 6 0 Q 16 0, 16 8 Q 8 8, 6 0" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1" />
            <path d="M 4 14 Q 14 18, 12 26 Q 4 22, 4 14" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1" />
          </g>
        </g>

        {/* ── 2. GLOWING NEON CONTOUR AROUND BOOK EDGES ── */}
        <g filter={`url(#${id}_champGlow)`}>
          <path 
            d="
              M 15 15 
              C 10 15, 6 20, 6 25 
              L 6 80 
              C 6 86, 12 90, 20 90 
              L 42 90 
              C 44 94, 47 96, 50 96 
              C 53 96, 56 94, 58 90 
              L 80 90 
              C 88 90, 94 86, 94 80 
              L 94 25 
              C 94 20, 90 15, 85 15 
              Z
            " 
            fill="none" 
            stroke="#fbbf24" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />
        </g>

        {/* ── 3. OPEN HARDCOVER BOOK ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          
          {/* Main Hardcover Base */}
          <path 
            d="
              M 15 15 
              C 10 15, 6 20, 6 25 
              L 6 80 
              C 6 86, 12 90, 20 90 
              L 42 90 
              C 44 94, 47 96, 50 96 
              C 53 96, 56 94, 58 90 
              L 80 90 
              C 88 90, 94 86, 94 80 
              L 94 25 
              C 94 20, 90 15, 85 15 
              Z
            " 
            fill={`url(#${id}_coverGrad)`} 
            stroke="#1c0a00" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />

          {/* Side Layered Stack of Leaves */}
          <path d="M 12 20 L 12 80 C 12 83, 20 84, 26 84 L 26 24 C 20 24, 14 22, 12 20 Z" fill={`url(#${id}_sideLeaves)`} stroke="#1c0a00" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 18 14 L 18 78 C 18 80, 26 82, 32 82 L 32 18 C 26 18, 20 16, 18 14 Z" fill="#fef3c7" stroke="#1c0a00" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 88 20 L 88 80 C 88 83, 80 84, 74 84 L 74 24 C 80 24, 86 22, 88 20 Z" fill={`url(#${id}_sideLeaves)`} stroke="#1c0a00" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 82 14 L 82 78 C 82 80, 74 82, 68 82 L 68 18 C 74 18, 80 16, 82 14 Z" fill="#fef3c7" stroke="#1c0a00" strokeWidth="2.2" strokeLinejoin="round" />

          {/* Main Spread Open Pages */}
          <path d="M 50 20 L 26 6 C 26 6, 23 30, 23 75 C 30 75, 45 84, 50 86 Z" fill={`url(#${id}_leftPageGrad)`} stroke="#1c0a00" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 50 20 L 74 6 C 74 6, 77 30, 77 75 C 70 75, 55 84, 50 86 Z" fill={`url(#${id}_rightPageGrad)`} stroke="#1c0a00" strokeWidth="2.6" strokeLinejoin="round" />
          <line x1="50" y1="20" x2="50" y2="86" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ── 4. GOLDEN CHAMPIONSHIP TROPHY AT THE TOP APEX ── */}
        <g transform="translate(50, 16)" filter={`url(#${id}_dropShadow)`}>
          {/* Trophy Base Pedestal */}
          <path d="M -8 10 L 8 10 L 6 7 L -6 7 Z" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1.2" />
          {/* Trophy Stem */}
          <rect x="-2" y="3" width="4" height="5" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1" />
          {/* Trophy Chalice Bowl */}
          <path d="M -11 -8 L 11 -8 C 11 2, 6 4, 0 4 C -6 4, -11 2, -11 -8 Z" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1.6" />
          {/* Trophy Left Handle */}
          <path d="M -11 -6 C -16 -6, -16 0, -11 1" fill="none" stroke="#1c0a00" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M -11 -6 C -16 -6, -16 0, -11 1" fill="none" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
          {/* Trophy Right Handle */}
          <path d="M 11 -6 C 16 -6, 16 0, 11 1" fill="none" stroke="#1c0a00" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 11 -6 C 16 -6, 16 0, 11 1" fill="none" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
          {/* Star of Triumph on Cup */}
          <polygon points="0,-4 1.2,-1.5 3.8,-1.5 1.8,0 2.5,2.5 0,1 -2.5,2.5 -1.8,0 -3.8,-1.5 -1.2,-1.5" fill="#ffffff" />
        </g>

        {/* ── 5. MAGNIFYING GLASS (EXPLORER LENS RESTING ON BOOK) ── */}
        <g transform="translate(54, 48)" filter={`url(#${id}_dropShadow)`}>
          
          {/* ── HANDLE (POINTING DOWN-RIGHT) ── */}
          <g transform="rotate(45) translate(0, 18)">
            <rect 
              x="-6" 
              y="0" 
              width="12" 
              height="26" 
              rx="6" 
              fill={`url(#${id}_handleGrad)`} 
              stroke="#1c0a00" 
              strokeWidth="2.6" 
            />
            <rect 
              x="-3" 
              y="4" 
              width="3.5" 
              height="16" 
              rx="1.75" 
              fill="#ffffff" 
              opacity="0.6" 
            />
          </g>

          {/* ── THICK GOLDEN CIRCULAR BEZEL RIM ── */}
          <circle 
            cx="0" 
            cy="0" 
            r="23" 
            fill={`url(#${id}_glassRingGrad)`} 
            stroke="#1c0a00" 
            strokeWidth="2.8" 
          />

          <circle 
            cx="0" 
            cy="0" 
            r="17.5" 
            fill="none" 
            stroke="#f59e0b" 
            strokeWidth="1.2" 
          />

          {/* ── GLOWING CONVEX GLASS LENS ── */}
          <circle 
            cx="0" 
            cy="0" 
            r="16.5" 
            fill={`url(#${id}_lensGrad)`} 
            stroke="#1c0a00" 
            strokeWidth="2.2" 
          />

          <ellipse 
            cx="-6" 
            cy="-6" 
            rx="4.5" 
            ry="3" 
            fill="#ffffff" 
            opacity="0.85" 
            transform="rotate(-25 -6 -6)" 
          />

          {/* ── BOLD GLOWING "2,500" MILESTONE NUMBER IN LENS ── */}
          <text 
            x="0" 
            y="5.6" 
            textAnchor="middle" 
            fontSize="13" 
            fontWeight="900" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fill={`url(#${id}_numGrad)`} 
            stroke="#0f172a" 
            strokeWidth="1.2" 
            style={{ letterSpacing: "-0.6px" }}
          >
            {count}
          </text>
        </g>

        {/* ── 6. ANIMATED TWINKLING CHAMPIONSHIP SPARKLE STARS ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          {/* Top Center Twinkling Star */}
          <g className={isPlaying ? `${id}_twinkle3` : ""}>
            <polygon points="50,2 52,6 56,8 52,10 50,14 48,10 44,8 48,6" fill="#ffffff" stroke="#1c0a00" strokeWidth="1.2" />
          </g>
          {/* Top Left Twinkling Star */}
          <g className={isPlaying ? `${id}_twinkle1` : ""}>
            <polygon points="12,10 14,14 18,16 14,18 12,22 10,18 6,16 10,14" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1.2" />
          </g>
          {/* Top Right Twinkling Star */}
          <g className={isPlaying ? `${id}_twinkle2` : ""}>
            <polygon points="88,10 90,14 94,16 90,18 88,22 86,18 82,16 86,14" fill={`url(#${id}_goldTrophyGrad)`} stroke="#1c0a00" strokeWidth="1.2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
