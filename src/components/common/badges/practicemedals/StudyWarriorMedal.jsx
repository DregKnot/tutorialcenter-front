import React from 'react';

/**
 * StudyWarriorMedal - Custom Standalone Medal for "Study Warrior" (500 Practice Questions)
 * 
 * Styled after the Side-Profile Centurion Helmet with Integrated Magnifying Glass ("500") & Flanking Swords:
 * - Dual iconic warrior swords flanking the left and right edges of the open book, styled with circular-ring golden crossguards, fuller grooves, and ribbed grips.
 * - Side-profile Roman/Spartan centurion helmet with a sweeping crimson crest plume.
 * - Magnifying glass lens built directly into the helmet with handle extending down-right.
 * - Bold glowing "500" milestone displayed prominently inside the convex lens.
 * - Open hardcover book with layered pages and a glowing warrior aura edge.
 * - 100% vector art with rich gradients, steel reflections, and soft drop shadow.
 */
export default function StudyWarriorMedal({
  size = 140,
  earned = true,
  count = 500,
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

          {/* Book Edge Warrior Neon Glow Filter */}
          <filter id={`${id}_warriorGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f59e0b" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.45" />
          </filter>

          {/* Steel Sword Blade Gradient (Left / Right edge) */}
          <linearGradient id={`${id}_bladeLeft`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id={`${id}_bladeRight`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Side-Profile Steel Helmet Gradient */}
          <linearGradient id={`${id}_steelHelmGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Sweeping Crimson Crest Plume Gradient */}
          <linearGradient id={`${id}_plumeGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="30%" stopColor="#ef4444" />
            <stop offset="75%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Golden Crossguard & Pommel Gradient */}
          <linearGradient id={`${id}_goldGuardGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          {/* Hardcover Outer Binding Gradient */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4c0519" />
            <stop offset="50%" stopColor="#2e1065" />
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

          {/* Side Layered Pages */}
          <linearGradient id={`${id}_sideLeaves`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>

          {/* Magnifying Glass Bezel Ring Gradient */}
          <linearGradient id={`${id}_glassRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Glowing Amber / Cyan Convex Glass Lens */}
          <radialGradient id={`${id}_lensGrad`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="35%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Handle Gradient */}
          <linearGradient id={`${id}_handleGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="40%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>

          {/* 500 Golden Glowing Number Gradient */}
          <linearGradient id={`${id}_numGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Ambient Warrior Sunburst Radiance */}
          <radialGradient id={`${id}_warriorAura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Aura Glow */}
        <circle cx="50" cy="50" r="44" fill={`url(#${id}_warriorAura)`} />

        {/* ── 1. DUAL SWORDS FLANKING LEFT & RIGHT EDGES OF BOOK ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          
          {/* ── LEFT SWORD (ANGLED UP-LEFT AT -35 DEG) ── */}
          <g transform="translate(24, 48) rotate(-35)">
            {/* Blade with Fuller */}
            <path d="M -4.5 20 L -4.5 -48 Q 0 -58, 4.5 -48 L 4.5 20 Z" fill={`url(#${id}_bladeLeft)`} stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 0 20 L 0 -53 Q 2 -51, 4.5 -48 L 4.5 20 Z" fill={`url(#${id}_bladeRight)`} />
            {/* Center Fuller Groove */}
            <line x1="0" y1="-44" x2="0" y2="16" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />

            {/* Golden Ring Crossguard */}
            <g transform="translate(0, 20)">
              {/* Bar */}
              <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill={`url(#${id}_goldGuardGrad)`} stroke="#0f172a" strokeWidth="2.2" />
              {/* Left Ring Lobe */}
              <circle cx="-13" cy="0" r="3.8" fill={`url(#${id}_goldGuardGrad)`} stroke="#0f172a" strokeWidth="2" />
              <circle cx="-13" cy="0" r="1.4" fill="#0f172a" />
              {/* Right Ring Lobe */}
              <circle cx="13" cy="0" r="3.8" fill={`url(#${id}_goldGuardGrad)`} stroke="#0f172a" strokeWidth="2" />
              <circle cx="13" cy="0" r="1.4" fill="#0f172a" />
            </g>

            {/* Ribbed Grip */}
            <g transform="translate(0, 23.5)">
              <rect x="-3" y="0" width="6" height="15" rx="1.5" fill="#0f172a" />
              <line x1="-3" y1="3.5" x2="3" y2="3.5" stroke="#facc15" strokeWidth="1.6" />
              <line x1="-3" y1="7.5" x2="3" y2="7.5" stroke="#facc15" strokeWidth="1.6" />
              <line x1="-3" y1="11.5" x2="3" y2="11.5" stroke="#facc15" strokeWidth="1.6" />
            </g>

            {/* Golden Rounded Mushroom Pommel */}
            <g transform="translate(0, 40)">
              <ellipse cx="0" cy="0" rx="4.8" ry="3.8" fill={`url(#${id}_goldGuardGrad)`} stroke="#0f172a" strokeWidth="2" />
            </g>
          </g>

          {/* ── RIGHT SWORD (ANGLED UP-RIGHT AT 35 DEG) ── */}
          <g transform="translate(76, 48) rotate(35)">
            {/* Blade with Fuller */}
            <path d="M -4.5 20 L -4.5 -48 Q 0 -58, 4.5 -48 L 4.5 20 Z" fill={`url(#${id}_bladeLeft)`} stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 0 20 L 0 -53 Q 2 -51, 4.5 -48 L 4.5 20 Z" fill={`url(#${id}_bladeRight)`} />
            {/* Center Fuller Groove */}
            <line x1="0" y1="-44" x2="0" y2="16" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />

            {/* Golden Ring Crossguard */}
            <g transform="translate(0, 20)">
              {/* Bar */}
              <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill={`url(#${id}_goldGuardGrad)`} stroke="#0f172a" strokeWidth="2.2" />
              {/* Left Ring Lobe */}
              <circle cx="-13" cy="0" r="3.8" fill={`url(#${id}_goldGuardGrad)`} stroke="#0f172a" strokeWidth="2" />
              <circle cx="-13" cy="0" r="1.4" fill="#0f172a" />
              {/* Right Ring Lobe */}
              <circle cx="13" cy="0" r="3.8" fill={`url(#${id}_goldGuardGrad)`} stroke="#0f172a" strokeWidth="2" />
              <circle cx="13" cy="0" r="1.4" fill="#0f172a" />
            </g>

            {/* Ribbed Grip */}
            <g transform="translate(0, 23.5)">
              <rect x="-3" y="0" width="6" height="15" rx="1.5" fill="#0f172a" />
              <line x1="-3" y1="3.5" x2="3" y2="3.5" stroke="#facc15" strokeWidth="1.6" />
              <line x1="-3" y1="7.5" x2="3" y2="7.5" stroke="#facc15" strokeWidth="1.6" />
              <line x1="-3" y1="11.5" x2="3" y2="11.5" stroke="#facc15" strokeWidth="1.6" />
            </g>

            {/* Golden Rounded Mushroom Pommel */}
            <g transform="translate(0, 40)">
              <ellipse cx="0" cy="0" rx="4.8" ry="3.8" fill={`url(#${id}_goldGuardGrad)`} stroke="#0f172a" strokeWidth="2" />
            </g>
          </g>
        </g>

        {/* ── 2. GLOWING NEON CONTOUR AROUND BOOK EDGES ── */}
        <g filter={`url(#${id}_warriorGlow)`}>
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
            stroke="#1e1b4b" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />

          {/* Side Layered Stack of Leaves */}
          <path d="M 12 20 L 12 80 C 12 83, 20 84, 26 84 L 26 24 C 20 24, 14 22, 12 20 Z" fill={`url(#${id}_sideLeaves)`} stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 18 14 L 18 78 C 18 80, 26 82, 32 82 L 32 18 C 26 18, 20 16, 18 14 Z" fill="#fef3c7" stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 88 20 L 88 80 C 88 83, 80 84, 74 84 L 74 24 C 80 24, 86 22, 88 20 Z" fill={`url(#${id}_sideLeaves)`} stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 82 14 L 82 78 C 82 80, 74 82, 68 82 L 68 18 C 74 18, 80 16, 82 14 Z" fill="#fef3c7" stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />

          {/* Main Spread Open Pages */}
          <path d="M 50 20 L 26 6 C 26 6, 23 30, 23 75 C 30 75, 45 84, 50 86 Z" fill={`url(#${id}_leftPageGrad)`} stroke="#1e1b4b" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 50 20 L 74 6 C 74 6, 77 30, 77 75 C 70 75, 55 84, 50 86 Z" fill={`url(#${id}_rightPageGrad)`} stroke="#1e1b4b" strokeWidth="2.6" strokeLinejoin="round" />
          <line x1="50" y1="20" x2="50" y2="86" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ── 4. SIDE-FACING SPARTAN/CENTURION HELMET WITH INTEGRATED MAGNIFYING GLASS ── */}
        <g transform="translate(48, 44)" filter={`url(#${id}_dropShadow)`}>
          
          {/* ── A. SWEEPING CRIMSON CREST PLUME (PROFILE VIEW ARCHING ACROSS TOP) ── */}
          <path 
            d="
              M -34 -20
              C -38 -44, 18 -48, 38 -12
              C 26 -20, -10 -24, -28 -14
              Z
            " 
            fill={`url(#${id}_plumeGrad)`} 
            stroke="#0f172a" 
            strokeWidth="2.4" 
            strokeLinejoin="round" 
          />
          {/* Plume Hair Rib Lines */}
          <line x1="-24" y1="-32" x2="-20" y2="-22" stroke="#fca5a5" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="-12" y1="-36" x2="-9" y2="-24" stroke="#fca5a5" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="2" y1="-36" x2="2" y2="-24" stroke="#fca5a5" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="16" y1="-32" x2="14" y2="-20" stroke="#fca5a5" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="28" y1="-24" x2="22" y2="-16" stroke="#fca5a5" strokeWidth="1.4" strokeLinecap="round" />

          {/* ── B. CREST HOLDER BRACKET (STEEL ARCH) ── */}
          <path 
            d="
              M -26 -16
              C -10 -26, 16 -24, 24 -10
              L 20 -6
              C 12 -18, -10 -20, -22 -12
              Z
            " 
            fill={`url(#${id}_steelHelmGrad)`} 
            stroke="#0f172a" 
            strokeWidth="1.8" 
          />

          {/* ── C. HELMET MAIN DOME (PROFILE SHELL) ── */}
          <path 
            d="
              M -22 -12 
              C -22 -20, 16 -20, 20 -4 
              C 22 10, 26 24, 22 28 
              L 12 28 
              C 14 18, 12 4, 6 2 
              C -6 2, -18 6, -22 14 
              L -28 14 
              C -28 4, -28 -4, -22 -12 
              Z
            " 
            fill={`url(#${id}_steelHelmGrad)`} 
            stroke="#0f172a" 
            strokeWidth="2.4" 
            strokeLinejoin="round" 
          />

          {/* Golden Brow Visor & Trim (Facing Left) */}
          <path 
            d="M -28 10 L -12 10 L -12 4 L -28 4 Z" 
            fill={`url(#${id}_goldGuardGrad)`} 
            stroke="#0f172a" 
            strokeWidth="1.6" 
          />
          {/* Golden Ear Arch Trim */}
          <path 
            d="M -12 10 C -12 -6, 10 -6, 10 10" 
            fill="none" 
            stroke={`url(#${id}_goldGuardGrad)`} 
            strokeWidth="3.2" 
            strokeLinecap="round" 
          />

          {/* ── D. MAGNIFYING GLASS INTEGRATED IN THE HELMET CORE ── */}
          <g transform="translate(0, 4)">
            
            {/* Magnifying Glass Handle (Pointing Down-Right) */}
            <g transform="rotate(45) translate(0, 16)">
              <rect 
                x="-5" 
                y="0" 
                width="10" 
                height="22" 
                rx="5" 
                fill={`url(#${id}_handleGrad)`} 
                stroke="#0f172a" 
                strokeWidth="2.4" 
              />
              <rect 
                x="-2.5" 
                y="3" 
                width="3" 
                height="14" 
                rx="1.5" 
                fill="#ffffff" 
                opacity="0.6" 
              />
            </g>

            {/* Thick Golden Shield Bezel Ring */}
            <circle 
              cx="0" 
              cy="0" 
              r="21.5" 
              fill={`url(#${id}_goldGuardGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.8" 
            />

            {/* Shield Rivet Studs */}
            <circle cx="0" cy="-18" r="1.2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx="0" cy="18" r="1.2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx="-18" cy="0" r="1.2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx="18" cy="0" r="1.2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />

            {/* Inner Frame Ring */}
            <circle 
              cx="0" 
              cy="0" 
              r="16.2" 
              fill="none" 
              stroke="#fef08a" 
              strokeWidth="1.2" 
            />

            {/* Glowing Blue Convex Glass Lens */}
            <circle 
              cx="0" 
              cy="0" 
              r="15" 
              fill={`url(#${id}_lensGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2" 
            />

            {/* Top-Left Specular Reflection Bubble */}
            <ellipse 
              cx="-5.5" 
              cy="-5.5" 
              rx="4" 
              ry="2.6" 
              fill="#ffffff" 
              opacity="0.85" 
              transform="rotate(-25 -5.5 -5.5)" 
            />

            {/* ── BOLD GLOWING "500" MILESTONE NUMBER IN LENS ── */}
            <text 
              x="0" 
              y="5.6" 
              textAnchor="middle" 
              fontSize="15" 
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
        </g>

        {/* ── 5. SPARKLES OF WARRIOR VALOR & MASTERY ── */}
        <g fill="#fef08a" stroke="#1e1b4b" strokeWidth="1.2">
          <polygon points="88,14 89,17 92,18 89,19 88,22 87,19 84,18 87,17" />
          <polygon points="12,24 13,26 15,27 13,28 12,30 11,28 9,27 11,26" />
        </g>
      </svg>
    </div>
  );
}
