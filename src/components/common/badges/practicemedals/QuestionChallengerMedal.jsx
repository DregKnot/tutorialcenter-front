import React from 'react';

/**
 * QuestionChallengerMedal - Custom Standalone Medal for "Question Challenger" (100 Practice Questions)
 * 
 * Styled after the Open Reference Book with Energy Lightning Bolts & Magnifying Glass ("100"):
 * - Twin crossed electric lightning bolts behind the open knowledge book.
 * - Open hardcover book with layered pages and a glowing cyan/emerald aura edge.
 * - Prominent 3D magnifying glass resting in front with a glowing convex lens magnifying "100".
 * - 100% vector art with rich gradients, gloss reflections, and soft drop shadow.
 */
export default function QuestionChallengerMedal({
  size = 140,
  earned = true,
  count = 100,
  className = ""
}) {
  const id = React.useId().replace(/:/g, "_");

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
          {/* Drop Shadow Filter */}
          <filter id={`${id}_dropShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Book Edge Neon Glow Filter */}
          <filter id={`${id}_edgeGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#22d3ee" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#06b6d4" floodOpacity="0.4" />
          </filter>

          {/* Lightning Bolt Gradient */}
          <linearGradient id={`${id}_boltGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          {/* Hardcover Outer Binding Gradient */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="50%" stopColor="#115e59" />
            <stop offset="100%" stopColor="#134e4a" />
          </linearGradient>

          {/* Left Page Gradient */}
          <linearGradient id={`${id}_leftPageGrad`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ccfbf1" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Right Page Gradient */}
          <linearGradient id={`${id}_rightPageGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ccfbf1" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Side Layered Pages */}
          <linearGradient id={`${id}_sideLeaves`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#99f6e4" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>

          {/* Magnifying Glass Bezel Ring Gradient */}
          <linearGradient id={`${id}_glassRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Glowing Cyan Glass Convex Lens */}
          <radialGradient id={`${id}_lensGrad`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#cffafe" />
            <stop offset="35%" stopColor="#22d3ee" />
            <stop offset="75%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#164e63" />
          </radialGradient>

          {/* Handle Gradient */}
          <linearGradient id={`${id}_handleGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="50%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>

          {/* 100 Golden Glowing Number Gradient */}
          <linearGradient id={`${id}_numGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Ambient Search Sunlight Radiance */}
          <radialGradient id={`${id}_searchAura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#0d9488" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Aura Glow */}
        <circle cx="50" cy="50" r="42" fill={`url(#${id}_searchAura)`} />

        {/* ── 1. CROSSED ELECTRIC LIGHTNING BOLTS (BEHIND BOOK) ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          {/* Bolt 1 (Top-Left to Bottom-Right) */}
          <polygon 
            points="24,10 32,8 26,26 34,25 18,50 22,32 16,33" 
            fill={`url(#${id}_boltGrad)`} 
            stroke="#0f172a" 
            strokeWidth="1.6" 
          />
          {/* Bolt 2 (Top-Right to Bottom-Left) */}
          <polygon 
            points="76,10 68,8 74,26 66,25 82,50 78,32 84,33" 
            fill={`url(#${id}_boltGrad)`} 
            stroke="#0f172a" 
            strokeWidth="1.6" 
          />
        </g>

        {/* ── 2. GLOWING NEON CONTOUR AROUND BOOK EDGES ── */}
        <g filter={`url(#${id}_edgeGlow)`}>
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
            stroke="#22d3ee" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />
        </g>

        {/* ── 3. OPEN HARDCOVER BOOK ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          
          {/* Main Hardcover Base (Emerald / Teal) */}
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
            stroke="#0f172a" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />

          {/* ── SIDE LAYERED STACK OF PAGES (TEAL TINT) ── */}
          {/* Left Stacked Leaves */}
          <path 
            d="M 12 20 L 12 80 C 12 83, 20 84, 26 84 L 26 24 C 20 24, 14 22, 12 20 Z" 
            fill={`url(#${id}_sideLeaves)`} 
            stroke="#0f172a" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 18 14 L 18 78 C 18 80, 26 82, 32 82 L 32 18 C 26 18, 20 16, 18 14 Z" 
            fill="#ccfbf1" 
            stroke="#0f172a" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />

          {/* Right Stacked Leaves */}
          <path 
            d="M 88 20 L 88 80 C 88 83, 80 84, 74 84 L 74 24 C 80 24, 86 22, 88 20 Z" 
            fill={`url(#${id}_sideLeaves)`} 
            stroke="#0f172a" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 82 14 L 82 78 C 82 80, 74 82, 68 82 L 68 18 C 74 18, 80 16, 82 14 Z" 
            fill="#ccfbf1" 
            stroke="#0f172a" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />

          {/* ── MAIN SPREAD OPEN PAGES ── */}
          {/* Left Open Page Leaf */}
          <path 
            d="
              M 50 20 
              L 26 6 
              C 26 6, 23 30, 23 75 
              C 30 75, 45 84, 50 86 
              Z
            " 
            fill={`url(#${id}_leftPageGrad)`} 
            stroke="#0f172a" 
            strokeWidth="2.6" 
            strokeLinejoin="round" 
          />

          {/* Right Open Page Leaf */}
          <path 
            d="
              M 50 20 
              L 74 6 
              C 74 6, 77 30, 77 75 
              C 70 75, 55 84, 50 86 
              Z
            " 
            fill={`url(#${id}_rightPageGrad)`} 
            stroke="#0f172a" 
            strokeWidth="2.6" 
            strokeLinejoin="round" 
          />

          {/* Center Vertical Spine Seam */}
          <line x1="50" y1="20" x2="50" y2="86" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ── 4. MAGNIFYING GLASS (EXPLORER LENS RESTING ON BOOK) ── */}
        <g transform="translate(54, 46)" filter={`url(#${id}_dropShadow)`}>
          
          {/* ── HANDLE (POINTING DOWN-RIGHT) ── */}
          <g transform="rotate(45) translate(0, 18)">
            <rect 
              x="-6" 
              y="0" 
              width="12" 
              height="26" 
              rx="6" 
              fill={`url(#${id}_handleGrad)`} 
              stroke="#0f172a" 
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

          {/* ── THICK WHITE CIRCULAR BEZEL RIM ── */}
          <circle 
            cx="0" 
            cy="0" 
            r="23" 
            fill={`url(#${id}_glassRingGrad)`} 
            stroke="#0f172a" 
            strokeWidth="2.8" 
          />

          <circle 
            cx="0" 
            cy="0" 
            r="17.5" 
            fill="none" 
            stroke="#cbd5e1" 
            strokeWidth="1.2" 
          />

          {/* ── GLOWING CONVEX GLASS LENS ── */}
          <circle 
            cx="0" 
            cy="0" 
            r="16.5" 
            fill={`url(#${id}_lensGrad)`} 
            stroke="#0f172a" 
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

          {/* ── BOLD GLOWING "100" MILESTONE NUMBER IN LENS ── */}
          <text 
            x="0" 
            y="5.8" 
            textAnchor="middle" 
            fontSize="15.5" 
            fontWeight="900" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fill={`url(#${id}_numGrad)`} 
            stroke="#0f172a" 
            strokeWidth="1.3" 
            style={{ letterSpacing: "-0.8px" }}
          >
            {count}
          </text>
        </g>

        {/* ── 5. SPARKLES OF CHALLENGE MASTERY ── */}
        <g fill="#fef08a" stroke="#0f172a" strokeWidth="1.2">
          <polygon points="90,12 91,15 94,16 91,17 90,20 89,17 86,16 89,15" />
          <polygon points="10,26 11,28 13,29 11,30 10,32 9,30 7,29 9,28" />
        </g>
      </svg>
    </div>
  );
}
