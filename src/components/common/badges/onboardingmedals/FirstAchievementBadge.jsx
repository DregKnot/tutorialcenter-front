import React from 'react';

/**
 * FirstAchievementBadge - Custom 3D Vector Badge for "First Achievement" (onboarding.first_achievement)
 * 
 * Styled after the Victorious Arm Raising a Golden Trophy Cup:
 * - Exact shield path, 3D golden metallic rim gradient, and top specular glare reflection.
 * - Inside the shield: A determined arm raising a gleaming golden trophy cup into the air,
 *   ambient victory sunburst flare, and sparkling 4-point achievement stars.
 * - 100% Consistent in proportions, bevel, rim, and lighting with all other badges.
 */
export default function FirstAchievementBadge({
  size = 140,
  earned = true,
  className = ""
}) {
  const id = React.useId().replace(/:/g, "_");

  // Exact shield geometry path from BaseBadge3D
  const shieldPath = "M50 5 L90 20 L90 60 C90 85 50 95 50 95 C50 95 10 85 10 60 L10 20 Z";

  return (
    <div 
      style={{ width: size, height: size }} 
      className={`relative flex items-center justify-center transition-transform duration-300 ${
        earned 
          ? "hover:scale-110 drop-shadow-xl" 
          : "filter grayscale contrast-75 opacity-40"
      } ${className}`}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full drop-shadow-xl overflow-visible select-none"
      >
        <defs>
          {/* Inner Shield Clipping Path (exact scaled shield geometry) */}
          <clipPath id={`${id}_innerShieldClip`}>
            <path 
              d={shieldPath} 
              transform="scale(0.85) translate(8.82, 8.82)" 
            />
          </clipPath>

          {/* Outer Metallic Gold Rim Gradient */}
          <linearGradient id={`${id}_rimGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#d97706" />
            <stop offset="92%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#2a1004" />
          </linearGradient>

          {/* Inner Bevel Shadow Filter */}
          <filter id={`${id}_filterShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Deep Royal Midnight Backdrop Gradient */}
          <linearGradient id={`${id}_portalBg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#030e1d" />
            <stop offset="40%" stopColor="#082245" />
            <stop offset="80%" stopColor="#0e3a6f" />
            <stop offset="100%" stopColor="#041328" />
          </linearGradient>

          {/* Golden Trophy Cup 3D Gradient */}
          <linearGradient id={`${id}_trophyGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* Trophy Shading Shadow */}
          <linearGradient id={`${id}_trophyShadow`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Skin Gradient */}
          <linearGradient id={`${id}_skinGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fba76c" />
          </linearGradient>

          {/* Arm Sleeve Gradient */}
          <linearGradient id={`${id}_sleeveGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Victory Ambient Radiant Flare */}
          <radialGradient id={`${id}_victoryGlow`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#fef08a" stopOpacity="0.6" />
            <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#030e1d" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── 1. EXACT OUTER METALLIC GOLD RIM (BEVEL) ── */}
        <path 
          d={shieldPath} 
          fill={`url(#${id}_rimGrad)`} 
          filter={`url(#${id}_filterShadow)`} 
        />

        {/* ── 2. INNER ILLUSTRATION PORTAL (CLIPPED TO EXACT SHIELD) ── */}
        <g clipPath={`url(#${id}_innerShieldClip)`}>
          
          {/* Deep Navy Backdrop */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${id}_portalBg)`} />

          {/* Radiant Victory Sunlight Flare */}
          <circle cx="52" cy="40" r="34" fill={`url(#${id}_victoryGlow)`} />

          {/* Ambient Particles */}
          <g fill="#ffffff" opacity="0.4">
            <circle cx="18" cy="22" r="0.8" />
            <circle cx="82" cy="20" r="0.8" />
            <circle cx="20" cy="45" r="0.7" />
            <circle cx="84" cy="74" r="0.7" />
          </g>

          {/* ── VICTORIOUS ARM RAISING GOLDEN TROPHY (ACCURATE PROPORTIONS) ── */}
          <g transform="translate(50, 48) rotate(26)">
            
            {/* 1. TROPHY LEFT & RIGHT HANDLES (BEHIND BOWL) */}
            {/* Left Handle */}
            <path 
              d="M -16 -28 C -27 -28, -27 -12, -12 -9" 
              fill="none" 
              stroke="#0f172a" 
              strokeWidth="4.2" 
              strokeLinecap="round" 
            />
            <path 
              d="M -16 -28 C -27 -28, -27 -12, -12 -9" 
              fill="none" 
              stroke={`url(#${id}_trophyGrad)`} 
              strokeWidth="2.2" 
              strokeLinecap="round" 
            />

            {/* Right Handle */}
            <path 
              d="M 16 -28 C 27 -28, 27 -12, 12 -9" 
              fill="none" 
              stroke="#0f172a" 
              strokeWidth="4.2" 
              strokeLinecap="round" 
            />
            <path 
              d="M 16 -28 C 27 -28, 27 -12, 12 -9" 
              fill="none" 
              stroke={`url(#${id}_trophyGrad)`} 
              strokeWidth="2.2" 
              strokeLinecap="round" 
            />

            {/* 2. TROPHY BASE & STEM (BELOW BOWL) */}
            {/* Stem passing behind hand */}
            <rect 
              x="-4.5" 
              y="-8" 
              width="9" 
              height="28" 
              fill={`url(#${id}_trophyGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.4" 
            />

            {/* Tapered Base Transition */}
            <polygon 
              points="-8,20 8,20 6,15 -6,15" 
              fill={`url(#${id}_trophyShadow)`} 
              stroke="#0f172a" 
              strokeWidth="2" 
            />
            {/* Wide Pedestal Base */}
            <rect 
              x="-13" 
              y="20" 
              width="26" 
              height="5.5" 
              rx="2" 
              fill={`url(#${id}_trophyGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.2" 
            />

            {/* 3. TROPHY GOBLET / BOWL */}
            {/* Main Cup Chalice */}
            <path 
              d="M -17 -30 C -17 -10, -10 -5, 0 -5 C 10 -5, 17 -10, 17 -30 Z" 
              fill={`url(#${id}_trophyGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.6" 
              strokeLinejoin="round" 
            />

            {/* Top Rim Oval */}
            <ellipse 
              cx="0" 
              cy="-30" 
              rx="17" 
              ry="5.5" 
              fill={`url(#${id}_trophyGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.4" 
            />
            {/* Inner Hollow Depth */}
            <ellipse 
              cx="0" 
              cy="-30" 
              rx="14" 
              ry="3.8" 
              fill="#b45309" 
            />

            {/* Specular White Gloss Arc on Bowl */}
            <path 
              d="M -12 -24 C -12 -12, -7 -7, 0 -7" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2" 
              strokeLinecap="round" 
              opacity="0.9" 
            />

            {/* 4. SLEEVE & WRIST CUFF (EXTENDING DOWN-LEFT) */}
            {/* Dark Slate Arm Sleeve */}
            <polygon 
              points="-18,-1 -48,-1 -48,19 -18,19" 
              fill={`url(#${id}_sleeveGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.4" 
              strokeLinejoin="round" 
            />
            {/* Cyan Cuff Accent */}
            <rect 
              x="-18" 
              y="-1" 
              width="6" 
              height="20" 
              fill="#0284c7" 
              stroke="#0f172a" 
              strokeWidth="2.2" 
            />

            {/* 5. FIST & FINGERS GRIPPING TROPHY STEM */}
            {/* Palm Base Block */}
            <rect 
              x="-12" 
              y="0" 
              width="9" 
              height="18" 
              rx="2" 
              fill={`url(#${id}_skinGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.2" 
            />

            {/* 4 Clenched Fingers Across the Stem */}
            <rect x="-4" y="-0.5" width="15" height="4.2" rx="2.1" fill={`url(#${id}_skinGrad)`} stroke="#0f172a" strokeWidth="2" />
            <rect x="-4" y="4.2" width="15" height="4.2" rx="2.1" fill={`url(#${id}_skinGrad)`} stroke="#0f172a" strokeWidth="2" />
            <rect x="-4" y="8.9" width="15" height="4.2" rx="2.1" fill={`url(#${id}_skinGrad)`} stroke="#0f172a" strokeWidth="2" />
            <rect x="-4" y="13.6" width="15" height="4.2" rx="2.1" fill={`url(#${id}_skinGrad)`} stroke="#0f172a" strokeWidth="2" />
          </g>

          {/* ── 3 RADIATING 4-POINT ACHIEVEMENT STARS (FROM REFERENCE) ── */}
          
          {/* Top-Right Large Sparkle Star */}
          <g transform="translate(73, 24)">
            <polygon 
              points="0,-8 2.2,-2.2 8,0 2.2,2.2 0,8 -2.2,2.2 -8,0 -2.2,-2.2" 
              fill="#fef08a" 
              stroke="#0f172a" 
              strokeWidth="1.8" 
              strokeLinejoin="round" 
            />
            <circle cx="0" cy="0" r="1.4" fill="#ffffff" />
          </g>

          {/* Mid-Right Medium Sparkle Star */}
          <g transform="translate(78, 52)">
            <polygon 
              points="0,-6.5 1.8,-1.8 6.5,0 1.8,1.8 0,6.5 -1.8,1.8 -6.5,0 -1.8,-1.8" 
              fill="#fef08a" 
              stroke="#0f172a" 
              strokeWidth="1.8" 
              strokeLinejoin="round" 
            />
            <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
          </g>

          {/* Mid-Left Medium Sparkle Star */}
          <g transform="translate(24, 50)">
            <polygon 
              points="0,-6.5 1.8,-1.8 6.5,0 1.8,1.8 0,6.5 -1.8,1.8 -6.5,0 -1.8,-1.8" 
              fill="#fef08a" 
              stroke="#0f172a" 
              strokeWidth="1.8" 
              strokeLinejoin="round" 
            />
            <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
          </g>

          {/* ── 3. TOP SPECULAR GLARE/REFLECTION (EXACT FROM BaseBadge3D) ── */}
          <path 
            d="M50 5 L90 20 L90 50 C70 40 30 40 10 50 L10 20 Z" 
            fill="#ffffff" 
            opacity="0.2" 
            transform="scale(0.85) translate(8.82, 8.82)" 
          />
        </g>
      </svg>
    </div>
  );
}
