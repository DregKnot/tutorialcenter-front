import React from 'react';

/**
 * PracticeStarterBadge - Custom 3D Vector Badge for "Practice Starter" (onboarding.practice_starter)
 * 
 * Styled after the Flaticon Student Study & Active Practice Icon:
 * - Exact shield path, 3D cyan/sapphire metallic rim gradient, and top specular glare reflection.
 * - Inside the shield: A student actively practicing, holding a pen over an open workbook,
 *   with ambient radiant knowledge glow and focus sparkles.
 * - 100% Consistent in proportions, bevel, rim, and lighting with all other badges.
 */
export default function PracticeStarterBadge({
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

          {/* Outer Metallic Cyan / Sapphire Rim Gradient */}
          <linearGradient id={`${id}_rimGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#67e8f9" />
            <stop offset="45%" stopColor="#06b6d4" />
            <stop offset="75%" stopColor="#0891b2" />
            <stop offset="92%" stopColor="#164e63" />
            <stop offset="100%" stopColor="#041f2d" />
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

          {/* Radiant Center Amber/Cyan Aura */}
          <radialGradient id={`${id}_studyAura`} cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#67e8f9" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#030e1d" stopOpacity="0" />
          </radialGradient>

          {/* Student Shirt Gradient (Cyan / Blue) */}
          <linearGradient id={`${id}_shirtGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Hair Gradient */}
          <linearGradient id={`${id}_hairGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Skin Gradient */}
          <linearGradient id={`${id}_skinGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fba76c" />
          </linearGradient>

          {/* Pen Golden Gradient */}
          <linearGradient id={`${id}_penGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Open Book Left Page Gradient */}
          <linearGradient id={`${id}_leftPage`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Open Book Right Page Gradient */}
          <linearGradient id={`${id}_rightPage`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* ── 1. EXACT OUTER METALLIC CYAN RIM (BEVEL) ── */}
        <path 
          d={shieldPath} 
          fill={`url(#${id}_rimGrad)`} 
          filter={`url(#${id}_filterShadow)`} 
        />

        {/* ── 2. INNER ILLUSTRATION PORTAL (CLIPPED TO EXACT SHIELD) ── */}
        <g clipPath={`url(#${id}_innerShieldClip)`}>
          
          {/* Deep Navy Backdrop */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${id}_portalBg)`} />

          {/* Ambient Center Flare behind Student */}
          <circle cx="50" cy="46" r="32" fill={`url(#${id}_studyAura)`} />

          {/* Ambient Study Particles */}
          <g fill="#ffffff" opacity="0.4">
            <circle cx="20" cy="22" r="0.8" />
            <circle cx="80" cy="22" r="0.8" />
            <circle cx="16" cy="74" r="0.7" />
            <circle cx="84" cy="74" r="0.7" />
          </g>

          {/* ── CENTRAL STUDENT STUDYING FIGURE ── */}
          <g transform="translate(50, 48)">
            
            {/* 1. STUDENT SHOULDERS / TORSO */}
            <path 
              d="M -22 18 C -22 2, -14 -6, 0 -6 C 14 -6, 22 2, 22 18 Z" 
              fill={`url(#${id}_shirtGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.2" 
              strokeLinejoin="round" 
            />
            {/* Shirt Collar Accent Line */}
            <path 
              d="M -5 -6 L 0 2 L 5 -6" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="1.6" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* 2. STUDENT NECK & FACE */}
            {/* Neck */}
            <rect x="-4" y="-12" width="8" height="8" rx="1" fill={`url(#${id}_skinGrad)`} stroke="#0f172a" strokeWidth="1.6" />

            {/* Face */}
            <path 
              d="M -7 -20 L 7 -20 C 7 -20, 8 -11, 0 -11 C -8 -11, -7 -20, -7 -20 Z" 
              fill={`url(#${id}_skinGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2" 
              strokeLinejoin="round" 
            />

            {/* 3. MODERN GEOMETRIC HAIR */}
            <path 
              d="
                M -9 -20 
                L -9 -26 
                C -9 -28, -7 -29, 0 -29 
                C 7 -29, 9 -28, 9 -26 
                L 9 -18 
                L 7 -18 
                L 7 -23 
                L -7 -23 
                L -7 -18 
                L -9 -18 
                Z
              " 
              fill={`url(#${id}_hairGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2" 
              strokeLinejoin="round" 
            />
            {/* Hair Side Fringe Swish */}
            <path d="M 0 -29 L 5 -23 L 0 -23 Z" fill="#334155" />

            {/* 4. ACTIVE WRITING HAND WITH PEN (LEFT FOREGROUND) */}
            <g transform="translate(-16, 8)">
              {/* Hand Holding Pen */}
              <ellipse 
                cx="0" 
                cy="0" 
                rx="4.2" 
                ry="3.8" 
                fill={`url(#${id}_skinGrad)`} 
                stroke="#0f172a" 
                strokeWidth="1.8" 
              />
              
              {/* Tilted Pen / Pencil pointing to book */}
              <g transform="rotate(35)">
                {/* Pen Body */}
                <rect 
                  x="-2" 
                  y="-12" 
                  width="4" 
                  height="12" 
                  rx="1" 
                  fill={`url(#${id}_penGrad)`} 
                  stroke="#0f172a" 
                  strokeWidth="1.6" 
                />
                {/* Pen Grip Band */}
                <line x1="-2" y1="-4" x2="2" y2="-4" stroke="#0f172a" strokeWidth="1" />
                {/* Pen Nib Tip */}
                <polygon points="-2,0 2,0 0,4" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
              </g>
            </g>

            {/* 5. OPEN BOOK / PRACTICE WORKBOOK (BOTTOM SPREAD) */}
            <g transform="translate(0, 18)">
              
              {/* Hardbound Book Base Shelf */}
              <rect 
                x="-32" 
                y="8" 
                width="64" 
                height="6.5" 
                rx="2" 
                fill="#0369a1" 
                stroke="#0f172a" 
                strokeWidth="2" 
              />
              {/* Base Spine Highlight */}
              <line x1="-30" y1="9.5" x2="30" y2="9.5" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />

              {/* Left Page Leaf */}
              <path 
                d="M 0 7 Q -15 13, -30 7 Q -24 -6, 0 -1 Z" 
                fill={`url(#${id}_leftPage)`} 
                stroke="#0f172a" 
                strokeWidth="2" 
                strokeLinejoin="round" 
              />
              {/* Left Page Practice Question Lines */}
              <g stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" opacity="0.8">
                <line x1="-24" y1="1" x2="-6" y2="2" />
                <line x1="-26" y1="4" x2="-6" y2="5" />
                <line x1="-22" y1="7" x2="-8" y2="8" />
              </g>

              {/* Right Page Leaf */}
              <path 
                d="M 0 7 Q 15 13, 30 7 Q 24 -6, 0 -1 Z" 
                fill={`url(#${id}_rightPage)`} 
                stroke="#0f172a" 
                strokeWidth="2" 
                strokeLinejoin="round" 
              />
              {/* Right Page Practice Question Lines */}
              <g stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" opacity="0.8">
                <line x1="6" y1="2" x2="24" y2="1" />
                <line x1="6" y1="5" x2="26" y2="4" />
                <line x1="8" y1="8" x2="22" y2="7" />
              </g>

              {/* Center Book Spine Seam */}
              <line x1="0" y1="-1" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </g>

          {/* Sparkles of Focus / Active Practice */}
          <g fill="#fef08a">
            <polygon points="50,12 51,14 53,15 51,16 50,18 49,16 47,15 49,14" transform="scale(0.8) translate(12, 0)" />
            <polygon points="76,28 77,30 79,31 77,32 76,34 75,32 73,31 75,30" transform="scale(0.7) translate(26, 4)" />
            <polygon points="24,28 25,30 27,31 25,32 24,34 23,32 21,31 23,30" transform="scale(0.7) translate(4, 4)" />
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
