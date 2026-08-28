import React from 'react';

/**
 * QuestionExplorerMedal - Custom Standalone Medal for "Question Explorer" (50 Practice Questions)
 * 
 * Styled after the Open Reference Book with Magnifying Glass Lens & Glowing Edges:
 * - Upright open hardcover book with layered pages and a radiant neon glowing edge.
 * - Prominent 3D magnifying glass resting in the center with a coral-red handle and glowing blue convex lens.
 * - Bold, gleaming "50" prominently magnified inside the lens.
 * - 100% vector art with rich gradients, gloss reflections, and soft drop shadow.
 */
export default function QuestionExplorerMedal({
  size = 140,
  earned = true,
  count = 50,
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
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#0284c7" floodOpacity="0.4" />
          </filter>

          {/* Hardcover Outer Binding Gradient */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="50%" stopColor="#3730a3" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Left Page Gradient */}
          <linearGradient id={`${id}_leftPageGrad`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Right Page Gradient */}
          <linearGradient id={`${id}_rightPageGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Side Layered Pages (Blue Tint) */}
          <linearGradient id={`${id}_sideLeaves`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>

          {/* Magnifying Glass Bezel Ring Gradient */}
          <linearGradient id={`${id}_glassRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Glowing Blue Glass Convex Lens */}
          <radialGradient id={`${id}_lensGrad`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="35%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>

          {/* Coral Red Handle Gradient */}
          <linearGradient id={`${id}_handleGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* 50 Golden Glowing Number Gradient */}
          <linearGradient id={`${id}_numGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Ambient Search Sunlight Radiance */}
          <radialGradient id={`${id}_searchAura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Aura Glow */}
        <circle cx="50" cy="50" r="42" fill={`url(#${id}_searchAura)`} />

        {/* ── 1. GLOWING NEON CONTOUR AROUND BOOK EDGES ── */}
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
            stroke="#38bdf8" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />
        </g>

        {/* ── 2. OPEN HARDCOVER BOOK ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          
          {/* Main Hardcover Base (Royal Purple / Indigo) */}
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
            stroke="#1e1b4b" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />

          {/* ── SIDE LAYERED STACK OF PAGES (PASTEL BLUE/CYAN) ── */}
          {/* Left Stacked Leaves */}
          <path 
            d="M 12 20 L 12 80 C 12 83, 20 84, 26 84 L 26 24 C 20 24, 14 22, 12 20 Z" 
            fill={`url(#${id}_sideLeaves)`} 
            stroke="#1e1b4b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 18 14 L 18 78 C 18 80, 26 82, 32 82 L 32 18 C 26 18, 20 16, 18 14 Z" 
            fill="#e0e7ff" 
            stroke="#1e1b4b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />

          {/* Right Stacked Leaves */}
          <path 
            d="M 88 20 L 88 80 C 88 83, 80 84, 74 84 L 74 24 C 80 24, 86 22, 88 20 Z" 
            fill={`url(#${id}_sideLeaves)`} 
            stroke="#1e1b4b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 82 14 L 82 78 C 82 80, 74 82, 68 82 L 68 18 C 74 18, 80 16, 82 14 Z" 
            fill="#e0e7ff" 
            stroke="#1e1b4b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />

          {/* ── MAIN SPREAD OPEN PAGES (WHITE WITH SUBTLE SHADOWS) ── */}
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
            stroke="#1e1b4b" 
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
            stroke="#1e1b4b" 
            strokeWidth="2.6" 
            strokeLinejoin="round" 
          />

          {/* Center Vertical Spine Seam */}
          <line x1="50" y1="20" x2="50" y2="86" stroke="#312e81" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ── 3. MAGNIFYING GLASS (EXPLORER LENS RESTING ON BOOK) ── */}
        <g transform="translate(54, 46)" filter={`url(#${id}_dropShadow)`}>
          
          {/* ── CORAL RED / ORANGE HANDLE (POINTING DOWN-RIGHT) ── */}
          <g transform="rotate(45) translate(0, 18)">
            {/* Handle Main Cylinder Body */}
            <rect 
              x="-6" 
              y="0" 
              width="12" 
              height="26" 
              rx="6" 
              fill={`url(#${id}_handleGrad)`} 
              stroke="#1e1b4b" 
              strokeWidth="2.6" 
            />
            {/* Specular Highlight Pill on Handle */}
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
            stroke="#1e1b4b" 
            strokeWidth="2.8" 
          />

          {/* Inner Frame Shading Ring */}
          <circle 
            cx="0" 
            cy="0" 
            r="17.5" 
            fill="none" 
            stroke="#cbd5e1" 
            strokeWidth="1.2" 
          />

          {/* ── GLOWING BLUE CONVEX GLASS LENS ── */}
          <circle 
            cx="0" 
            cy="0" 
            r="16.5" 
            fill={`url(#${id}_lensGrad)`} 
            stroke="#1e1b4b" 
            strokeWidth="2.2" 
          />

          {/* Top-Left Lens Specular Bubble Highlight */}
          <ellipse 
            cx="-6" 
            cy="-6" 
            rx="4.5" 
            ry="3" 
            fill="#ffffff" 
            opacity="0.85" 
            transform="rotate(-25 -6 -6)" 
          />

          {/* ── BOLD GLOWING "50" MILESTONE NUMBER IN LENS ── */}
          <text 
            x="0" 
            y="6.2" 
            textAnchor="middle" 
            fontSize="18" 
            fontWeight="900" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fill={`url(#${id}_numGrad)`} 
            stroke="#0f172a" 
            strokeWidth="1.4" 
            style={{ letterSpacing: "-0.5px" }}
          >
            {count}
          </text>
        </g>

        {/* ── 4. SPARKLES OF KNOWLEDGE & EXPLORATION ── */}
        <g fill="#fef08a" stroke="#1e1b4b" strokeWidth="1.2">
          <polygon points="90,12 91,15 94,16 91,17 90,20 89,17 86,16 89,15" />
          <polygon points="10,26 11,28 13,29 11,30 10,32 9,30 7,29 9,28" />
        </g>
      </svg>
    </div>
  );
}
