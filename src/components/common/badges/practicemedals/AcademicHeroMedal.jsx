import React from 'react';

/**
 * AcademicHeroMedal - Custom Standalone Medal for "Academic Hero" (1,000 Practice Questions)
 * 
 * Cohesive Heroic Series Design:
 * - A billowing crimson superhero cape and golden victory laurel crown crowning the open knowledge book.
 * - Open hardcover book with glowing golden hero aura edges.
 * - Prominent 3D magnifying glass lens proudly displaying the "1,000" milestone.
 * - 100% vector art with rich gradients, fabric folds, and soft drop shadow.
 */
export default function AcademicHeroMedal({
  size = 140,
  earned = true,
  count = "1,000",
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

          {/* Book Edge Heroic Neon Glow Filter */}
          <filter id={`${id}_heroGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f59e0b" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.45" />
          </filter>

          {/* Billowing Cape Gradient */}
          <linearGradient id={`${id}_capeGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="35%" stopColor="#ef4444" />
            <stop offset="75%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Golden Laurel Crown & Clasp Gradient */}
          <linearGradient id={`${id}_goldLaurelGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Hardcover Outer Binding Gradient (Royal Heroic Indigo / Crimson) */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4c0519" />
            <stop offset="50%" stopColor="#311042" />
            <stop offset="100%" stopColor="#1e1b4b" />
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

          {/* Side Layered Pages (Golden Hero Leaves) */}
          <linearGradient id={`${id}_sideLeaves`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>

          {/* Magnifying Glass Bezel Ring Gradient */}
          <linearGradient id={`${id}_glassRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Glowing Hero Convex Glass Lens */}
          <radialGradient id={`${id}_lensGrad`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#a5f3fc" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Handle Gradient (Heroic Crimson / Gold Trim) */}
          <linearGradient id={`${id}_handleGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* 1,000 Golden Glowing Number Gradient */}
          <linearGradient id={`${id}_numGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Ambient Hero Sunburst Radiance */}
          <radialGradient id={`${id}_heroAura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Aura Glow */}
        <circle cx="50" cy="50" r="46" fill={`url(#${id}_heroAura)`} />

        {/* ── 1. BILLOWING SUPERHERO CAPE SPREAD BEHIND THE BOOK ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          {/* Left Flowing Wing of Cape */}
          <path 
            d="
              M 25 24 
              C 10 20, 2 34, 4 52 
              C 6 62, 14 66, 18 58 
              C 22 50, 26 58, 30 56 
              Z
            " 
            fill={`url(#${id}_capeGrad)`} 
            stroke="#1e1b4b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />
          {/* Right Flowing Wing of Cape */}
          <path 
            d="
              M 75 24 
              C 90 20, 98 34, 96 52 
              C 94 62, 86 66, 82 58 
              C 78 50, 74 58, 70 56 
              Z
            " 
            fill={`url(#${id}_capeGrad)`} 
            stroke="#1e1b4b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />
          {/* Cape Wind Crease Accents */}
          <path d="M 22 28 Q 12 40, 10 50" fill="none" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 78 28 Q 88 40, 90 50" fill="none" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* ── 2. GLOWING NEON CONTOUR AROUND BOOK EDGES ── */}
        <g filter={`url(#${id}_heroGlow)`}>
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
            stroke="#f59e0b" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />
        </g>

        {/* ── 3. OPEN HARDCOVER KNOWLEDGE BOOK ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          
          {/* Main Hardcover Base (Crimson / Indigo) */}
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

          {/* ── SIDE LAYERED STACK OF PAGES (WARM GOLDEN HERO TINT) ── */}
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
            fill="#fef3c7" 
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
            fill="#fef3c7" 
            stroke="#1e1b4b" 
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
          <line x1="50" y1="20" x2="50" y2="86" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ── 4. GOLDEN LAUREL CROWN OF VICTORY (ON TOP OF BOOK) ── */}
        <g transform="translate(50, 16)" filter={`url(#${id}_dropShadow)`}>
          {/* Center Golden Hero Star */}
          <polygon 
            points="0,-6 1.8,-1.8 6,-1.8 2.6,1 4,5.2 0,2.6 -4,5.2 -2.6,1 -6,-1.8 -1.8,-1.8" 
            fill={`url(#${id}_goldLaurelGrad)`} 
            stroke="#1e1b4b" 
            strokeWidth="1.2" 
          />
          {/* Left Laurel Leaves */}
          <path d="M -6 -2 Q -12 -5, -16 -2 Q -12 2, -6 -2" fill={`url(#${id}_goldLaurelGrad)`} stroke="#1e1b4b" strokeWidth="1" />
          <path d="M -10 3 Q -16 2, -19 6 Q -14 8, -10 3" fill={`url(#${id}_goldLaurelGrad)`} stroke="#1e1b4b" strokeWidth="1" />
          
          {/* Right Laurel Leaves */}
          <path d="M 6 -2 Q 12 -5, 16 -2 Q 12 2, 6 -2" fill={`url(#${id}_goldLaurelGrad)`} stroke="#1e1b4b" strokeWidth="1" />
          <path d="M 10 3 Q 16 2, 19 6 Q 14 8, 10 3" fill={`url(#${id}_goldLaurelGrad)`} stroke="#1e1b4b" strokeWidth="1" />
        </g>

        {/* ── 5. MAGNIFYING GLASS (EXPLORER LENS RESTING ON BOOK) ── */}
        <g transform="translate(54, 48)" filter={`url(#${id}_dropShadow)`}>
          
          {/* ── CORAL RED / CRIMSON HANDLE (POINTING DOWN-RIGHT) ── */}
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

          {/* ── THICK GOLDEN CIRCULAR BEZEL RIM ── */}
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
            stroke="#f59e0b" 
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

          {/* ── BOLD GLOWING "1,000" MILESTONE NUMBER IN LENS ── */}
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

        {/* ── 6. FLOATING HEROIC 3D STARS & RADIANT SPARKLES ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          {/* Top-Left 5-Point Hero Star */}
          <polygon 
            points="10,6 12.5,12 18,12 13.5,16 15,22 10,18 5,22 6.5,16 2,12 7.5,12" 
            fill={`url(#${id}_goldLaurelGrad)`} 
            stroke="#1e1b4b" 
            strokeWidth="1.6" 
            strokeLinejoin="round" 
          />
          {/* Top-Right 5-Point Hero Star */}
          <polygon 
            points="90,6 92.5,12 98,12 93.5,16 95,22 90,18 85,22 86.5,16 82,12 87.5,12" 
            fill={`url(#${id}_goldLaurelGrad)`} 
            stroke="#1e1b4b" 
            strokeWidth="1.6" 
            strokeLinejoin="round" 
          />

          {/* Mid-Left 5-Point Floating Star */}
          <polygon 
            points="5,44 6.8,48 11,48 7.6,51 8.8,55 5,52 1.2,55 2.4,51 -1,48 3.2,48" 
            fill={`url(#${id}_goldLaurelGrad)`} 
            stroke="#1e1b4b" 
            strokeWidth="1.4" 
            strokeLinejoin="round" 
          />

          {/* Mid-Right 5-Point Floating Star */}
          <polygon 
            points="95,44 96.8,48 101,48 97.6,51 98.8,55 95,52 91.2,55 92.4,51 89,48 93.2,48" 
            fill={`url(#${id}_goldLaurelGrad)`} 
            stroke="#1e1b4b" 
            strokeWidth="1.4" 
            strokeLinejoin="round" 
          />

          {/* Upper Sparkle Diamonds */}
          <g fill="#ffffff" stroke="#1e1b4b" strokeWidth="1.2">
            <polygon points="26,6 27,9 30,10 27,11 26,14 25,11 22,10 25,9" />
            <polygon points="74,6 75,9 78,10 75,11 74,14 73,11 70,10 73,9" />
          </g>

          {/* Bottom Flanking Sparkles */}
          <g fill="#fef08a" stroke="#1e1b4b" strokeWidth="1.2">
            <polygon points="12,82 13,85 16,86 13,87 12,90 11,87 8,86 11,85" />
            <polygon points="88,82 89,85 92,86 89,87 88,90 87,87 84,86 87,85" />
          </g>
        </g>
      </svg>
    </div>
  );
}
