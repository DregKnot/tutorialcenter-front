import React from 'react';

/**
 * ProfileCompleteBadge - Custom 3D Vector Badge for "Profile Complete" (onboarding.profile_complete)
 * 
 * Green Metallic Theme with Verified User Profile & Distinct Emerald Checkmark:
 * - Exact shield path, 3D emerald green metallic rim gradient, and top specular glare reflection.
 * - Inside the shield: Deep emerald ambient glow backdrop, a clean white student profile silhouette,
 *   and an illuminated green verification checkmark badge.
 * - 100% Consistent in proportions, bevel, rim, and lighting with all other badges.
 */
export default function ProfileCompleteBadge({
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

          {/* Outer Metallic Emerald Green Rim Gradient */}
          <linearGradient id={`${id}_rimGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#86efac" />
            <stop offset="45%" stopColor="#22c55e" />
            <stop offset="75%" stopColor="#15803d" />
            <stop offset="92%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* Inner Bevel Shadow Filter */}
          <filter id={`${id}_filterShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Deep Emerald Twilight Backdrop Gradient */}
          <linearGradient id={`${id}_emeraldBg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#021f17" />
            <stop offset="40%" stopColor="#064e3b" />
            <stop offset="80%" stopColor="#047857" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* Radiant Center Green Aura */}
          <radialGradient id={`${id}_greenAura`} cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#15803d" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#021f17" stopOpacity="0" />
          </radialGradient>

          {/* Green Verification Seal Gradient */}
          <linearGradient id={`${id}_sealGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="25%" stopColor="#4ade80" />
            <stop offset="65%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>

          {/* White Avatar 3D Shading Gradient */}
          <linearGradient id={`${id}_avatarGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f0fdf4" />
            <stop offset="100%" stopColor="#dcfce7" />
          </linearGradient>
        </defs>

        {/* ── 1. EXACT OUTER METALLIC EMERALD RIM (BEVEL) ── */}
        <path 
          d={shieldPath} 
          fill={`url(#${id}_rimGrad)`} 
          filter={`url(#${id}_filterShadow)`} 
        />

        {/* ── 2. INNER ILLUSTRATION PORTAL (CLIPPED TO EXACT SHIELD) ── */}
        <g clipPath={`url(#${id}_innerShieldClip)`}>
          
          {/* Deep Emerald Backdrop */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${id}_emeraldBg)`} />

          {/* Ambient Glowing Green Flare */}
          <circle cx="48" cy="46" r="30" fill={`url(#${id}_greenAura)`} />

          {/* Ambient Sparkles & Floating Particles */}
          <g fill="#ffffff" opacity="0.5">
            <circle cx="20" cy="22" r="0.9" />
            <circle cx="78" cy="22" r="0.9" />
            <circle cx="26" cy="38" r="0.7" />
            <circle cx="76" cy="38" r="0.7" />
            <circle cx="32" cy="16" r="1.1" />
            <circle cx="68" cy="16" r="1.1" />
          </g>

          {/* Subtle Ground Platform / Pedestal Curve */}
          <path 
            d="M 12 88 Q 50 82, 88 88 L 88 95 L 12 95 Z" 
            fill="#022c22" 
            opacity="0.8" 
          />
          <path 
            d="M 12 88 Q 50 82, 88 88" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="1.2" 
            opacity="0.5" 
          />

          {/* ── WHITE USER PROFILE SILHOUETTE ── */}
          <g transform="translate(46, 47)">
            
            {/* User Head */}
            <circle 
              cx="0" 
              cy="-14" 
              r="10.5" 
              fill={`url(#${id}_avatarGrad)`} 
              stroke="#064e3b" 
              strokeWidth="0.8" 
            />
            {/* Head Specular Highlight */}
            <ellipse 
              cx="-2.5" 
              cy="-17" 
              rx="5" 
              ry="3" 
              fill="#ffffff" 
              opacity="0.9" 
            />

            {/* User Torso / Shoulders */}
            <path 
              d="M -19 18 C -19 3, -11 -1, 0 -1 C 11 -1, 19 3, 19 18 Z" 
              fill={`url(#${id}_avatarGrad)`} 
              stroke="#064e3b" 
              strokeWidth="0.8" 
            />
            {/* Collar / V-Neck Detail */}
            <path 
              d="M -5 -1 L 0 5 L 5 -1" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
            />
          </g>

          {/* ── DISTINCT GREEN VERIFIED CHECKMARK BADGE ── */}
          <g transform="translate(64, 58)">
            
            {/* Outer Glow Halo */}
            <circle cx="0" cy="0" r="14" fill="#22c55e" opacity="0.35" filter="blur(2px)" />

            {/* 12-Point Scalloped Verification Rosette Seal */}
            <path 
              d="
                M 0 -11.5 
                L 2.6 -9.8 L 5.8 -10 L 7.4 -7.2 L 10.4 -6.1 L 10.3 -2.9 L 12 -0.8
                L 10.8 2.2 L 11.2 5.4 L 8.7 7.5 L 7.8 10.6 L 4.6 11.2 L 2.6 13.5
                L -0.5 12.6 L -3.2 13.8 L -5.7 11.8 L -8.8 11.5 L -10.1 8.5 L -12.4 6.7
                L -11.7 3.5 L -13.2 0.7 L -11.4 -2 L -11.8 -5.2 L -9.1 -7 L -8.5 -10.2
                L -5.3 -10.6 L -3.5 -12.8 Z
              " 
              fill={`url(#${id}_sealGrad)`} 
              stroke="#ffffff" 
              strokeWidth="0.8" 
            />

            {/* Inner Emerald Ring */}
            <circle cx="0" cy="0" r="8.5" fill="#15803d" stroke="#86efac" strokeWidth="0.8" />

            {/* Bold Crisp White Checkmark */}
            <path 
              d="M -4.5 0 L -1.5 3.2 L 5 -3.5" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2.4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </g>

          {/* Sparkle Glints around the Verification Seal */}
          <g fill="#ffffff">
            <polygon points="64,40 65,42 67,43 65,44 64,46 63,44 61,43 63,42" transform="scale(0.8) translate(15, -4)" />
            <polygon points="76,68 77,70 79,71 77,72 76,74 75,72 73,71 75,70" transform="scale(0.7) translate(28, 12)" />
            <polygon points="22,30 23,32 25,33 23,34 22,36 21,34 19,33 21,32" transform="scale(0.8) translate(2, 2)" />
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
