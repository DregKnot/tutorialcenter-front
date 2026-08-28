import React from 'react';

/**
 * FirstStepBadge - Custom 3D Illustrated Vector Badge for "First Step" (onboarding.first_step)
 * 
 * Clean, iconic staircase with destination flag/star at the top:
 * - Exact shield path, 3D golden metallic rim gradient, and top specular glare reflection.
 * - Inside the shield: Crisp ascending staircase icon with glowing steps, ascending trail, 
 *   and a glowing golden victory flag / star destination at the summit.
 * - 100% Consistent in proportions, bevel, rim, and lighting with all other badges.
 */
export default function FirstStepBadge({
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
            <stop offset="75%" stopColor="#b45309" />
            <stop offset="92%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#2a1004" />
          </linearGradient>

          {/* Inner Bevel Shadow Filter */}
          <filter id={`${id}_filterShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Clean Midnight Portal Gradient */}
          <linearGradient id={`${id}_portalGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a192f" />
            <stop offset="50%" stopColor="#0f2b4c" />
            <stop offset="100%" stopColor="#071322" />
          </linearGradient>

          {/* Step 1 Golden Active Glow Gradient */}
          <linearGradient id={`${id}_step1Grad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Ascending Steps Base Gradients */}
          <linearGradient id={`${id}_stepGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="40%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Destination Flag Gradient */}
          <linearGradient id={`${id}_flagGrad`} x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Destination Beacon Radial Glow */}
          <radialGradient id={`${id}_beaconGlow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#fef08a" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── 1. EXACT OUTER METALLIC RIM (BEVEL) ── */}
        <path 
          d={shieldPath} 
          fill={`url(#${id}_rimGrad)`} 
          filter={`url(#${id}_filterShadow)`} 
        />

        {/* ── 2. INNER ILLUSTRATION PORTAL (CLIPPED TO EXACT SHIELD) ── */}
        <g clipPath={`url(#${id}_innerShieldClip)`}>
          
          {/* Backdrop */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${id}_portalGrad)`} />

          {/* Ambient Glow from Summit Goal */}
          <circle cx="68" cy="28" r="22" fill={`url(#${id}_beaconGlow)`} />

          {/* Background Ambient Star Dots */}
          <g fill="#ffffff" opacity="0.4">
            <circle cx="24" cy="30" r="0.9" />
            <circle cx="38" cy="22" r="1.1" />
            <circle cx="28" cy="48" r="0.7" />
            <circle cx="78" cy="55" r="0.8" />
          </g>

          {/* ── CLEAN ICONIC STAIRCASE ── */}
          
          {/* Ground Base Plate */}
          <path 
            d="M 12 88 L 88 88 L 88 92 L 12 92 Z" 
            fill="#0b1320" 
          />
          <line x1="12" y1="88" x2="88" y2="88" stroke="#1e293b" strokeWidth="1.2" />

          {/* STEP 1 (The First Step - Highlighted in Rich Gold) */}
          {/* Step 1 Body */}
          <path 
            d="M 20 74 L 38 74 L 38 88 L 20 88 Z" 
            fill={`url(#${id}_step1Grad)`} 
          />
          {/* Step 1 Top Tread Highlight */}
          <line x1="20" y1="74" x2="38" y2="74" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          {/* Step 1 Right Shadow */}
          <line x1="38" y1="74" x2="38" y2="88" stroke="#78350f" strokeWidth="1.2" />

          {/* STEP 2 (Middle Step) */}
          {/* Step 2 Body */}
          <path 
            d="M 38 60 L 56 60 L 56 88 L 38 88 Z" 
            fill={`url(#${id}_stepGrad)`} 
          />
          {/* Step 2 Top Tread Highlight */}
          <line x1="38" y1="60" x2="56" y2="60" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
          {/* Step 2 Right Shadow */}
          <line x1="56" y1="60" x2="56" y2="88" stroke="#0f172a" strokeWidth="1.2" />

          {/* STEP 3 (Top Step / Summit Platform) */}
          {/* Step 3 Body */}
          <path 
            d="M 56 46 L 76 46 L 76 88 L 56 88 Z" 
            fill={`url(#${id}_stepGrad)`} 
          />
          {/* Step 3 Top Tread Highlight */}
          <line x1="56" y1="46" x2="76" y2="46" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
          {/* Step 3 Right Shadow */}
          <line x1="76" y1="46" x2="76" y2="88" stroke="#0f172a" strokeWidth="1.2" />

          {/* ── ASCENDING PATH / STEP INDICATORS ── */}
          {/* Golden Step 1 Pulse Marker */}
          <circle cx="29" cy="70" r="2.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="29" cy="70" r="4.5" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.6" strokeDasharray="1.5 1.5" />

          {/* Ascending Dashed Progression Curve to Destination */}
          <path 
            d="M 29 66 Q 42 48, 62 40" 
            fill="none" 
            stroke="#fef08a" 
            strokeWidth="1.5" 
            strokeDasharray="2 2" 
            strokeLinecap="round" 
          />

          {/* Step 2 Marker */}
          <circle cx="47" cy="56" r="1.8" fill="#93c5fd" opacity="0.8" />

          {/* ── DESTINATION AT THE TOP (GOLDEN VICTORY FLAG & STAR) ── */}
          {/* Flagpole */}
          <line 
            x1="66" 
            y1="46" 
            x2="66" 
            y2="20" 
            stroke="#fef08a" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          {/* Flagpole Golden Finial Ball */}
          <circle cx="66" cy="19" r="2" fill="#ffffff" stroke="#f59e0b" strokeWidth="0.8" />

          {/* Golden Victory Pennant / Flag */}
          <path 
            d="M 66 21 L 84 28 L 66 35 Z" 
            fill={`url(#${id}_flagGrad)`} 
            stroke="#b45309" 
            strokeWidth="0.6" 
            strokeLinejoin="round" 
          />
          {/* Flag Shimmer Accent Line */}
          <path d="M 66 23 L 80 28 L 66 31 Z" fill="#ffffff" opacity="0.4" />

          {/* Shining Destination Star at Summit */}
          <g transform="translate(74, 18)">
            {/* 4-Point Sparkle Star */}
            <polygon 
              points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" 
              fill="#ffffff" 
            />
            <circle cx="0" cy="0" r="1.2" fill="#fef08a" />
          </g>

          {/* Smaller Accent Sparkles */}
          <g fill="#fef08a">
            <polygon points="56,26 57,27 58,28 57,29 56,30 55,29 54,28 55,27" transform="scale(0.8) translate(15, -4)" />
            <polygon points="82,38 83,39 84,40 83,41 82,42 81,41 80,40 81,39" transform="scale(0.8) translate(20, 2)" />
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
