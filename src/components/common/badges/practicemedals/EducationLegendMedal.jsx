import React from 'react';

/**
 * EducationLegendMedal - Apex Milestone Medal for "Education Legend" (25,000 Questions)
 * 
 * "The Grand Celestial Ascendant" - God-Tier Aesthetic & Performance:
 * - When animated=false (Grid/List View): Displays a crisp, majestic frozen snapshot with 0 CPU/GPU load.
 * - When animated=true (Detail Inspection Modal & Celebration): Fires up an epic, extraordinary celestial ascension!
 *   * Breathing 3D levitation ascension.
 *   * Dual rotating mythic celestial constellation zodiac rings with orbiting diamond stars.
 *   * Pulsing multi-speed celestial starlight wings with radiant feather auras.
 *   * Radiant starlight beacon erupting from the imperial crown sapphire.
 *   * Twinkling celestial supernova diamond bursts.
 * - 100% vector art with rich gradients, crystal reflections, and soft drop shadows.
 */
export default function EducationLegendMedal({
  size = 140,
  earned = true,
  count = "25,000",
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
        className="absolute inset-0 w-full h-full drop-shadow-2xl overflow-visible select-none"
      >
        <defs>
          <style>{`
            @keyframes ${id}_levitate {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-4.5px); }
            }
            @keyframes ${id}_auroraPulse {
              0%, 100% { opacity: 0.4; transform: scale(0.96) rotate(0deg); }
              50% { opacity: 0.95; transform: scale(1.08) rotate(15deg); }
            }
            @keyframes ${id}_wingFlapLeft {
              0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 4px #38bdf8); }
              50% { transform: rotate(-5deg) scale(1.04); filter: drop-shadow(0 0 12px #38bdf8) drop-shadow(0 0 18px #facc15); }
            }
            @keyframes ${id}_wingFlapRight {
              0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 4px #38bdf8); }
              50% { transform: rotate(5deg) scale(1.04); filter: drop-shadow(0 0 12px #38bdf8) drop-shadow(0 0 18px #facc15); }
            }
            @keyframes ${id}_rotateCW {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes ${id}_rotateCCW {
              from { transform: rotate(0deg); }
              to { transform: rotate(-360deg); }
            }
            @keyframes ${id}_gemFlare {
              0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
              50% { transform: scale(1.45) rotate(30deg); opacity: 1; filter: drop-shadow(0 0 8px #67e8f9) drop-shadow(0 0 14px #ffffff); }
            }
            @keyframes ${id}_supernovaTwinkle {
              0%, 100% { transform: scale(0.9) rotate(0deg); opacity: 0.7; }
              50% { transform: scale(1.4) rotate(45deg); opacity: 1; filter: drop-shadow(0 0 6px #ffffff); }
            }
            .${id}_levitateAnim {
              animation: ${id}_levitate 3.2s ease-in-out infinite;
            }
            .${id}_auroraAnim {
              transform-origin: 50px 50px;
              animation: ${id}_auroraPulse 4s ease-in-out infinite;
            }
            .${id}_wingLeftAnim {
              transform-origin: 24px 48px;
              animation: ${id}_wingFlapLeft 3.2s ease-in-out infinite;
            }
            .${id}_wingRightAnim {
              transform-origin: 76px 48px;
              animation: ${id}_wingFlapRight 3.2s ease-in-out infinite;
            }
            .${id}_orbitCW {
              transform-origin: 54px 48px;
              animation: ${id}_rotateCW 12s linear infinite;
            }
            .${id}_orbitCCW {
              transform-origin: 54px 48px;
              animation: ${id}_rotateCCW 18s linear infinite;
            }
            .${id}_gemAnim {
              transform-origin: 50px 10px;
              animation: ${id}_gemFlare 2s ease-in-out infinite;
            }
            .${id}_twinkle1 {
              transform-origin: 6px 10px;
              animation: ${id}_supernovaTwinkle 2.4s ease-in-out infinite;
            }
            .${id}_twinkle2 {
              transform-origin: 94px 10px;
              animation: ${id}_supernovaTwinkle 2.4s ease-in-out infinite 0.8s;
            }
          `}</style>

          {/* Drop Shadow Filter */}
          <filter id={`${id}_dropShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
          </filter>

          {/* Celestial Neon Edge Glow */}
          <filter id={`${id}_legendGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.95" />
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#fbbf24" floodOpacity="0.6" />
          </filter>

          {/* Grand Diamond Wings Gradient */}
          <linearGradient id={`${id}_wingDiamondGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#bae6fd" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Wing Golden Trim Feathers Gradient */}
          <linearGradient id={`${id}_wingGoldGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Imperial Crown Gradient */}
          <linearGradient id={`${id}_crownGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Cyan Diamond Gem Gradient */}
          <linearGradient id={`${id}_gemGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>

          {/* Hardcover Outer Binding Gradient (Mythic Platinum Navy) */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#082f49" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Left Page Gradient */}
          <linearGradient id={`${id}_leftPageGrad`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Right Page Gradient */}
          <linearGradient id={`${id}_rightPageGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Side Layered Pages */}
          <linearGradient id={`${id}_sideLeaves`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>

          {/* Magnifying Glass Bezel Ring Gradient */}
          <linearGradient id={`${id}_glassRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Glowing Legend Convex Glass Lens */}
          <radialGradient id={`${id}_lensGrad`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#7dd3fc" />
            <stop offset="75%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#082f49" />
          </radialGradient>

          {/* Handle Gradient */}
          <linearGradient id={`${id}_handleGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="45%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>

          {/* 25,000 Golden Glowing Number Gradient */}
          <linearGradient id={`${id}_numGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Ambient Celestial Sunburst Radiance */}
          <radialGradient id={`${id}_celestialAura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── 0. PULSING CELESTIAL AURORA BOREALIS BEAMS ── */}
        <circle cx="50" cy="50" r="48" fill={`url(#${id}_celestialAura)`} className={isPlaying ? `${id}_auroraAnim` : ""} />

        {/* ── LEVITATING MASTER GROUP (CARRIES ENTIRE MEDAL IN SMOOTH ASCENSION) ── */}
        <g className={isPlaying ? `${id}_levitateAnim` : ""}>

          {/* ── 1. MAJESTIC SPANNING CELESTIAL WINGS (SPREADING OUTWARD) ── */}
          <g filter={`url(#${id}_dropShadow)`}>
            
            {/* ── LEFT MAJESTIC WING (3-TIERED FEATHERS) ── */}
            <g className={isPlaying ? `${id}_wingLeftAnim` : ""}>
              {/* Primary Outer Flight Feather */}
              <path 
                d="M 28 56 C 10 44, -2 24, -4 10 C 2 22, 10 32, 26 44 Z" 
                fill={`url(#${id}_wingDiamondGrad)`} 
                stroke="#082f49" 
                strokeWidth="1.6" 
                strokeLinejoin="round" 
              />
              {/* Secondary Mid Feather */}
              <path 
                d="M 30 64 C 14 52, 2 38, -2 26 C 6 36, 14 44, 28 52 Z" 
                fill={`url(#${id}_wingDiamondGrad)`} 
                stroke="#082f49" 
                strokeWidth="1.6" 
                strokeLinejoin="round" 
              />
              {/* Tertiary Golden Feather */}
              <path 
                d="M 30 72 C 18 62, 8 50, 4 40 C 10 48, 18 56, 28 60 Z" 
                fill={`url(#${id}_wingGoldGrad)`} 
                stroke="#082f49" 
                strokeWidth="1.4" 
                strokeLinejoin="round" 
              />
              {/* Wing Feather Shaft Accent Lines */}
              <path d="M 26 44 Q 8 28, -2 14" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
              <path d="M 28 52 Q 12 40, 2 30" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
            </g>

            {/* ── RIGHT MAJESTIC WING (3-TIERED FEATHERS) ── */}
            <g className={isPlaying ? `${id}_wingRightAnim` : ""}>
              {/* Primary Outer Flight Feather */}
              <path 
                d="M 72 56 C 90 44, 102 24, 104 10 C 98 22, 90 32, 74 44 Z" 
                fill={`url(#${id}_wingDiamondGrad)`} 
                stroke="#082f49" 
                strokeWidth="1.6" 
                strokeLinejoin="round" 
              />
              {/* Secondary Mid Feather */}
              <path 
                d="M 70 64 C 86 52, 98 38, 102 26 C 94 36, 86 44, 72 52 Z" 
                fill={`url(#${id}_wingDiamondGrad)`} 
                stroke="#082f49" 
                strokeWidth="1.6" 
                strokeLinejoin="round" 
              />
              {/* Tertiary Golden Feather */}
              <path 
                d="M 70 72 C 82 62, 92 50, 96 40 C 90 48, 82 56, 72 60 Z" 
                fill={`url(#${id}_wingGoldGrad)`} 
                stroke="#082f49" 
                strokeWidth="1.4" 
                strokeLinejoin="round" 
              />
              {/* Wing Feather Shaft Accent Lines */}
              <path d="M 74 44 Q 92 28, 102 14" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
              <path d="M 72 52 Q 88 40, 98 30" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
            </g>
          </g>

          {/* ── 2. GLOWING NEON CONTOUR AROUND BOOK EDGES ── */}
          <g filter={`url(#${id}_legendGlow)`}>
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

          {/* ── 3. OPEN HARDCOVER BOOK ── */}
          <g filter={`url(#${id}_dropShadow)`}>
            
            {/* Main Hardcover Base (Mythic Navy) */}
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
              stroke="#082f49" 
              strokeWidth="2.8" 
              strokeLinejoin="round" 
            />

            {/* Side Layered Stack of Leaves */}
            <path d="M 12 20 L 12 80 C 12 83, 20 84, 26 84 L 26 24 C 20 24, 14 22, 12 20 Z" fill={`url(#${id}_sideLeaves)`} stroke="#082f49" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 18 14 L 18 78 C 18 80, 26 82, 32 82 L 32 18 C 26 18, 20 16, 18 14 Z" fill="#f0f9ff" stroke="#082f49" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 88 20 L 88 80 C 88 83, 80 84, 74 84 L 74 24 C 80 24, 86 22, 88 20 Z" fill={`url(#${id}_sideLeaves)`} stroke="#082f49" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 82 14 L 82 78 C 82 80, 74 82, 68 82 L 68 18 C 74 18, 80 16, 82 14 Z" fill="#f0f9ff" stroke="#082f49" strokeWidth="2.2" strokeLinejoin="round" />

            {/* Main Spread Open Pages */}
            <path d="M 50 20 L 26 6 C 26 6, 23 30, 23 75 C 30 75, 45 84, 50 86 Z" fill={`url(#${id}_leftPageGrad)`} stroke="#082f49" strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M 50 20 L 74 6 C 74 6, 77 30, 77 75 C 70 75, 55 84, 50 86 Z" fill={`url(#${id}_rightPageGrad)`} stroke="#082f49" strokeWidth="2.6" strokeLinejoin="round" />
            <line x1="50" y1="20" x2="50" y2="86" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {/* ── 4. GRAND IMPERIAL CROWN OF IMMORTALITY (CROWNING APEX) ── */}
          <g transform="translate(50, 14)" filter={`url(#${id}_dropShadow)`}>
            
            {/* Crown Arch Base */}
            <path d="M -16 6 L 16 6 L 14 3 L -14 3 Z" fill={`url(#${id}_crownGrad)`} stroke="#082f49" strokeWidth="1.2" />
            
            {/* 5-Pointed Imperial Crown Peaks */}
            <polygon 
              points="-16,3 -14,-6 -8,-1 -4,-12 0,-3 4,-12 8,-1 14,-6 16,3" 
              fill={`url(#${id}_crownGrad)`} 
              stroke="#082f49" 
              strokeWidth="1.8" 
              strokeLinejoin="round" 
            />

            {/* Crown Peak Pearl Spheres */}
            <circle cx="-14" cy="-6" r="1.4" fill="#ffffff" stroke="#082f49" strokeWidth="0.6" />
            <circle cx="-4" cy="-12" r="1.6" fill="#fef08a" stroke="#082f49" strokeWidth="0.6" />
            <circle cx="4" cy="-12" r="1.6" fill="#fef08a" stroke="#082f49" strokeWidth="0.6" />
            <circle cx="14" cy="-6" r="1.4" fill="#ffffff" stroke="#082f49" strokeWidth="0.6" />

            {/* Central Glowing Cyan Sapphire / Diamond Gem */}
            <g className={isPlaying ? `${id}_gemAnim` : ""}>
              <polygon points="0,-4 3.5,0 0,4 -3.5,0" fill={`url(#${id}_gemGrad)`} stroke="#ffffff" strokeWidth="0.9" />
            </g>
          </g>

          {/* ── 5. DIAMOND-STUDDED MAGNIFYING GLASS ── */}
          <g transform="translate(54, 48)" filter={`url(#${id}_dropShadow)`}>
            
            {/* Handle (Pointing Down-Right) */}
            <g transform="rotate(45) translate(0, 18)">
              <rect 
                x="-6" 
                y="0" 
                width="12" 
                height="26" 
                rx="6" 
                fill={`url(#${id}_handleGrad)`} 
                stroke="#082f49" 
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

            {/* Thick Mythic Gold & Diamond Bezel Rim */}
            <circle 
              cx="0" 
              cy="0" 
              r="23" 
              fill={`url(#${id}_glassRingGrad)`} 
              stroke="#082f49" 
              strokeWidth="2.8" 
            />

            {/* 4 Diamond Stars Studded on Bezel */}
            <polygon points="0,-21 1.2,-19 0,-17 -1.2,-19" fill="#ffffff" stroke="#082f49" strokeWidth="0.6" />
            <polygon points="0,17 1.2,19 0,21 -1.2,19" fill="#ffffff" stroke="#082f49" strokeWidth="0.6" />
            <polygon points="-19,0 -17,1.2 -15,0 -17,-1.2" fill="#ffffff" stroke="#082f49" strokeWidth="0.6" />
            <polygon points="17,0 19,1.2 21,0 19,-1.2" fill="#ffffff" stroke="#082f49" strokeWidth="0.6" />

            {/* Inner Frame Ring */}
            <circle 
              cx="0" 
              cy="0" 
              r="17" 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth="1.2" 
            />

            {/* Glowing Convex Glass Lens */}
            <circle 
              cx="0" 
              cy="0" 
              r="16" 
              fill={`url(#${id}_lensGrad)`} 
              stroke="#082f49" 
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

            {/* ── BOLD GLOWING "25,000" MILESTONE NUMBER IN LENS ── */}
            <text 
              x="0" 
              y="5.4" 
              textAnchor="middle" 
              fontSize="11.5" 
              fontWeight="900" 
              fontFamily="system-ui, -apple-system, sans-serif" 
              fill={`url(#${id}_numGrad)`} 
              stroke="#0f172a" 
              strokeWidth="1.1" 
              style={{ letterSpacing: "-0.5px" }}
            >
              {count}
            </text>
          </g>

          {/* ── 6. DUAL ROTATING MYTHIC ZODIAC / CELESTIAL ORBIT RINGS (ON TOP) ── */}
          {isPlaying && (
            <g filter={`url(#${id}_dropShadow)`}>
              {/* Outer Clockwise Celestial Ring */}
              <g className={`${id}_orbitCW`}>
                <circle 
                  cx="54" 
                  cy="48" 
                  r="34" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="1.8" 
                  strokeDasharray="6,4" 
                  opacity="0.9" 
                />
                {/* 4 Celestial Star Nodes */}
                <polygon points="54,12 55.5,14.5 58.5,14.5 56,16.5 57,19.5 54,17.5 51,19.5 52,16.5 49.5,14.5 52.5,14.5" fill="#fef08a" stroke="#082f49" strokeWidth="0.8" />
                <polygon points="54,84 55.5,86.5 58.5,86.5 56,88.5 57,91.5 54,89.5 51,91.5 52,88.5 49.5,86.5 52.5,86.5" fill="#fef08a" stroke="#082f49" strokeWidth="0.8" />
                <circle cx="88" cy="48" r="3.2" fill="#ffffff" stroke="#082f49" strokeWidth="1" />
                <circle cx="88" cy="48" r="1.4" fill="#38bdf8" />
                <circle cx="20" cy="48" r="3.2" fill="#ffffff" stroke="#082f49" strokeWidth="1" />
                <circle cx="20" cy="48" r="1.4" fill="#38bdf8" />
              </g>

              {/* Inner Counter-Clockwise Floating Stardust Ring */}
              <g className={`${id}_orbitCCW`}>
                <circle 
                  cx="54" 
                  cy="48" 
                  r="27.5" 
                  fill="none" 
                  stroke="#fef08a" 
                  strokeWidth="1.3" 
                  strokeDasharray="3,5" 
                  opacity="0.8" 
                />
                <circle cx="73.5" cy="28.5" r="2.2" fill="#fef08a" stroke="#082f49" strokeWidth="0.6" />
                <circle cx="34.5" cy="67.5" r="2.2" fill="#fef08a" stroke="#082f49" strokeWidth="0.6" />
              </g>
            </g>
          )}

          {/* ── 7. ANIMATED CELESTIAL STARDUST & SPARKLING SUPERNOVAS ── */}
          <g filter={`url(#${id}_dropShadow)`}>
            <g className={isPlaying ? `${id}_twinkle1` : ""}>
              <polygon points="6,10 8,14 12,16 8,18 6,22 4,18 0,16 4,14" fill="#ffffff" stroke="#082f49" strokeWidth="1.2" />
            </g>
            <g className={isPlaying ? `${id}_twinkle2` : ""}>
              <polygon points="94,10 96,14 100,16 96,18 94,22 92,18 88,16 92,14" fill="#ffffff" stroke="#082f49" strokeWidth="1.2" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
