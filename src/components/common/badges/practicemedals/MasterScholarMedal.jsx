import React from 'react';

/**
 * MasterScholarMedal - Custom Standalone Medal for "Master Scholar" (10,000 Practice Questions)
 * 
 * Styled with Graduation Mortarboard, Wisdom Scroll & Rotating Celestial Wisdom Rings:
 * - Swaying golden tassel hanging from the graduation mortarboard cap.
 * - Rotating glowing celestial wisdom orbital rings with orbiting star gems surrounding the magnifying glass.
 * - Twinkling scholarly diamond stars at the apex.
 * - Open hardcover book with layered pages and a glowing royal amethyst-indigo aura edge.
 * - Convex glowing lens proudly magnifying the "10,000" milestone.
 * - 100% vector art with rich gradients, scholarly reflections, and soft drop shadow.
 */
export default function MasterScholarMedal({
  size = 140,
  earned = true,
  count = "10,000",
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
            @keyframes ${id}_tasselSway {
              0%, 100% { transform: rotate(-8deg); }
              50% { transform: rotate(14deg); }
            }
            @keyframes ${id}_rotateRingCW {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes ${id}_rotateRingCCW {
              from { transform: rotate(0deg); }
              to { transform: rotate(-360deg); }
            }
            @keyframes ${id}_starTwinkle {
              0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.85; }
              50% { transform: scale(1.3) rotate(20deg); opacity: 1; filter: drop-shadow(0 0 4px #e9d5ff); }
            }
            .${id}_tasselAnim {
              transform-origin: 0px -5px;
              animation: ${id}_tasselSway 3.2s ease-in-out infinite;
            }
            .${id}_ringAnimCW {
              transform-origin: 54px 48px;
              animation: ${id}_rotateRingCW 16s linear infinite;
            }
            .${id}_ringAnimCCW {
              transform-origin: 54px 48px;
              animation: ${id}_rotateRingCCW 24s linear infinite;
            }
            .${id}_twinkleLeft {
              transform-origin: 10px 14px;
              animation: ${id}_starTwinkle 2.6s ease-in-out infinite;
            }
            .${id}_twinkleRight {
              transform-origin: 90px 14px;
              animation: ${id}_starTwinkle 2.6s ease-in-out infinite 0.9s;
            }
          `}</style>

          {/* Drop Shadow Filter */}
          <filter id={`${id}_dropShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Book Edge Scholar Neon Glow Filter */}
          <filter id={`${id}_scholarGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#c084fc" floodOpacity="0.9" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#9333ea" floodOpacity="0.5" />
          </filter>

          {/* Golden Cap & Tassel Gradient */}
          <linearGradient id={`${id}_goldCapGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Hardcover Outer Binding Gradient (Royal Amethyst) */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#581c87" />
            <stop offset="50%" stopColor="#3b0764" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Left Page Gradient */}
          <linearGradient id={`${id}_leftPageGrad`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#faf5ff" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Right Page Gradient */}
          <linearGradient id={`${id}_rightPageGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#faf5ff" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Side Layered Pages */}
          <linearGradient id={`${id}_sideLeaves`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#d8b4fe" />
          </linearGradient>

          {/* Magnifying Glass Bezel Ring Gradient */}
          <linearGradient id={`${id}_glassRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Glowing Scholar Convex Glass Lens */}
          <radialGradient id={`${id}_lensGrad`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#c084fc" />
            <stop offset="75%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>

          {/* Handle Gradient */}
          <linearGradient id={`${id}_handleGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>

          {/* 10,000 Golden Glowing Number Gradient */}
          <linearGradient id={`${id}_numGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Ambient Search Sunlight Radiance */}
          <radialGradient id={`${id}_searchAura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#7e22ce" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Aura Glow */}
        <circle cx="50" cy="50" r="44" fill={`url(#${id}_searchAura)`} />

        {/* ── 1. GLOWING NEON CONTOUR AROUND BOOK EDGES ── */}
        <g filter={`url(#${id}_scholarGlow)`}>
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
            stroke="#c084fc" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />
        </g>

        {/* ── 2. OPEN HARDCOVER BOOK ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          
          {/* Main Hardcover Base (Royal Amethyst) */}
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
          <path d="M 18 14 L 18 78 C 18 80, 26 82, 32 82 L 32 18 C 26 18, 20 16, 18 14 Z" fill="#faf5ff" stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 88 20 L 88 80 C 88 83, 80 84, 74 84 L 74 24 C 80 24, 86 22, 88 20 Z" fill={`url(#${id}_sideLeaves)`} stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 82 14 L 82 78 C 82 80, 74 82, 68 82 L 68 18 C 74 18, 80 16, 82 14 Z" fill="#faf5ff" stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />

          {/* Main Spread Open Pages */}
          <path d="M 50 20 L 26 6 C 26 6, 23 30, 23 75 C 30 75, 45 84, 50 86 Z" fill={`url(#${id}_leftPageGrad)`} stroke="#1e1b4b" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 50 20 L 74 6 C 74 6, 77 30, 77 75 C 70 75, 55 84, 50 86 Z" fill={`url(#${id}_rightPageGrad)`} stroke="#1e1b4b" strokeWidth="2.6" strokeLinejoin="round" />
          <line x1="50" y1="20" x2="50" y2="86" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ── 3. GRADUATION MORTARBOARD CAP & SWAYING TASSEL ── */}
        <g transform="translate(50, 15)" filter={`url(#${id}_dropShadow)`}>
          {/* Diamond Cap Top */}
          <polygon points="0,-12 18,-6 0,0 -18,-6" fill="#1e1b4b" stroke="#fef08a" strokeWidth="1.2" />
          <polygon points="0,-10 15,-5 0,0 -15,-5" fill="#3b0764" />
          
          {/* Cap Center Button */}
          <circle cx="0" cy="-5" r="1.5" fill="#fef08a" />
          
          {/* ── ANIMATED SWAYING TASSEL ── */}
          <g className={isPlaying ? `${id}_tasselAnim` : ""}>
            <path d="M 0 -5 Q 12 -4, 16 4" fill="none" stroke={`url(#${id}_goldCapGrad)`} strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="16" cy="4" r="1.6" fill="#f59e0b" />
            <polygon points="14,4 18,4 17,9 15,9" fill={`url(#${id}_goldCapGrad)`} />
          </g>
        </g>

        {/* ── 4. MAGNIFYING GLASS (EXPLORER LENS RESTING ON BOOK) ── */}
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
              stroke="#1e1b4b" 
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

          {/* Thick Golden Circular Bezel Rim */}
          <circle 
            cx="0" 
            cy="0" 
            r="23" 
            fill={`url(#${id}_glassRingGrad)`} 
            stroke="#1e1b4b" 
            strokeWidth="2.8" 
          />

          <circle 
            cx="0" 
            cy="0" 
            r="17.5" 
            fill="none" 
            stroke="#c084fc" 
            strokeWidth="1.2" 
          />

          {/* Glowing Convex Glass Lens */}
          <circle 
            cx="0" 
            cy="0" 
            r="16.5" 
            fill={`url(#${id}_lensGrad)`} 
            stroke="#1e1b4b" 
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

          {/* ── BOLD GLOWING "10,000" MILESTONE NUMBER IN LENS ── */}
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

        {/* ── 5. ROTATING CELESTIAL WISDOM ORBITAL RINGS & STAR GEMS (ON TOP OF EVERYTHING) ── */}
        {isPlaying && (
          <g filter={`url(#${id}_dropShadow)`}>
            
            {/* Outer Clockwise Rotating Orbital Ring */}
            <g className={`${id}_ringAnimCW`}>
              <circle 
                cx="54" 
                cy="48" 
                r="33" 
                fill="none" 
                stroke="#c084fc" 
                strokeWidth="2" 
                strokeDasharray="6,5" 
                opacity="0.9" 
              />
              {/* Top Golden Star Node */}
              <polygon points="54,11 55.5,14 59,15 55.5,16 54,19 52.5,16 49,15 52.5,14" fill="#fef08a" stroke="#1e1b4b" strokeWidth="1" />
              {/* Bottom Golden Star Node */}
              <polygon points="54,77 55.5,80 59,81 55.5,82 54,85 52.5,82 49,81 52.5,80" fill="#fef08a" stroke="#1e1b4b" strokeWidth="1" />
              {/* Right Diamond White Sphere */}
              <circle cx="87" cy="48" r="3.5" fill="#ffffff" stroke="#1e1b4b" strokeWidth="1.2" />
              <circle cx="87" cy="48" r="1.4" fill="#c084fc" />
              {/* Left Diamond White Sphere */}
              <circle cx="21" cy="48" r="3.5" fill="#ffffff" stroke="#1e1b4b" strokeWidth="1.2" />
              <circle cx="21" cy="48" r="1.4" fill="#c084fc" />
            </g>

            {/* Inner Counter-Clockwise Floating Orbital Ring */}
            <g className={`${id}_ringAnimCCW`}>
              <ellipse 
                cx="54" 
                cy="48" 
                rx="27" 
                ry="27" 
                fill="none" 
                stroke="#fef08a" 
                strokeWidth="1.4" 
                strokeDasharray="3,6" 
                opacity="0.75" 
              />
              <circle cx="73" cy="29" r="2.4" fill="#fef08a" stroke="#1e1b4b" strokeWidth="0.8" />
              <circle cx="35" cy="67" r="2.4" fill="#fef08a" stroke="#1e1b4b" strokeWidth="0.8" />
            </g>
          </g>
        )}

        {/* ── 6. ANIMATED SCHOLARLY DIAMOND SPARKLE STARS ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          <g className={isPlaying ? `${id}_twinkleLeft` : ""}>
            <polygon points="10,14 12,18 16,20 12,22 10,26 8,22 4,20 8,18" fill="#ffffff" stroke="#1e1b4b" strokeWidth="1.2" />
          </g>
          <g className={isPlaying ? `${id}_twinkleRight` : ""}>
            <polygon points="90,14 92,18 96,20 92,22 90,26 88,22 84,20 88,18" fill="#ffffff" stroke="#1e1b4b" strokeWidth="1.2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
