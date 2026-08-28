import React from 'react';

/**
 * FirstAnswerBadge - Custom 3D Vector Badge for "First Answer" (onboarding.first_answer)
 * 
 * Styled after the 3D Q&A Speech Bubbles with Top-Right Verified Checkmark:
 * - Exact shield path, 3D golden/amber metallic rim gradient, and top specular glare reflection.
 * - Inside the shield: Vibrant 3D Yellow "Q" bubble and Coral Red "A" bubble with depth extrusions,
 *   radiating conversation burst pills, and an illuminated green verified checkmark badge at the top right.
 * - 100% Consistent in proportions, bevel, rim, and lighting with all other badges.
 */
export default function FirstAnswerBadge({
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

          {/* Outer Metallic Amber/Gold Rim Gradient */}
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

          {/* Deep Navy/Twilight Backdrop Gradient */}
          <linearGradient id={`${id}_portalBg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#081426" />
            <stop offset="40%" stopColor="#0f294a" />
            <stop offset="80%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#071120" />
          </linearGradient>

          {/* Q Bubble Yellow Face Gradient */}
          <linearGradient id={`${id}_qBubbleGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          {/* A Bubble Red Face Gradient */}
          <linearGradient id={`${id}_aBubbleGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="30%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>

          {/* Green Checkmark Badge Gradient */}
          <linearGradient id={`${id}_greenCheckGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="30%" stopColor="#22c55e" />
            <stop offset="80%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>

          {/* Radiant Center Glow */}
          <radialGradient id={`${id}_ambientGlow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#081426" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── 1. EXACT OUTER METALLIC AMBER RIM (BEVEL) ── */}
        <path 
          d={shieldPath} 
          fill={`url(#${id}_rimGrad)`} 
          filter={`url(#${id}_filterShadow)`} 
        />

        {/* ── 2. INNER ILLUSTRATION PORTAL (CLIPPED TO EXACT SHIELD) ── */}
        <g clipPath={`url(#${id}_innerShieldClip)`}>
          
          {/* Deep Navy Backdrop */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${id}_portalBg)`} />

          {/* Ambient Warm Center Glow */}
          <circle cx="50" cy="50" r="34" fill={`url(#${id}_ambientGlow)`} />

          {/* Ambient Cosmic Particles */}
          <g fill="#ffffff" opacity="0.4">
            <circle cx="20" cy="20" r="0.8" />
            <circle cx="82" cy="52" r="0.8" />
            <circle cx="16" cy="74" r="0.8" />
            <circle cx="36" cy="14" r="1" />
          </g>

          {/* ── RADIATING BURST ACCENT PILLS ── */}
          {/* Top-Right Burst Pills */}
          <g fill="#334155" stroke="#1e293b" strokeWidth="1.2">
            <rect x="58" y="14" width="4" height="9.5" rx="2" transform="rotate(25 60 18)" />
            <rect x="74" y="16" width="4" height="9.5" rx="2" transform="rotate(50 76 20)" />
            <rect x="80" y="44" width="4" height="9.5" rx="2" transform="rotate(75 82 48)" />
          </g>
          {/* Bottom-Left Burst Pills */}
          <g fill="#334155" stroke="#1e293b" strokeWidth="1.2">
            <rect x="18" y="65" width="4" height="9.5" rx="2" transform="rotate(-45 20 70)" />
            <rect x="23" y="77" width="4" height="9.5" rx="2" transform="rotate(-25 25 82)" />
            <rect x="32" y="86" width="4" height="9.5" rx="2" transform="rotate(-5 34 91)" />
          </g>

          {/* ── 3D QUESTION BUBBLE (YELLOW - TOP LEFT) ── */}
          <g transform="translate(19, 25) scale(0.88)">
            
            {/* 3D Bottom Extrusion Shadow Layer */}
            <path 
              d="
                M 8 0 L 28 0 A 8 8 0 0 1 36 8 L 36 24 A 8 8 0 0 1 28 32 L 13 32 L 8 39 L 8 32 A 8 8 0 0 1 0 24 L 0 8 A 8 8 0 0 1 8 0 Z
              " 
              transform="translate(0, 4.5)" 
              fill="#b45309" 
              stroke="#0f172a" 
              strokeWidth="2.2" 
              strokeLinejoin="round" 
            />

            {/* Front Bubble Face */}
            <path 
              d="
                M 8 0 L 28 0 A 8 8 0 0 1 36 8 L 36 24 A 8 8 0 0 1 28 32 L 13 32 L 8 39 L 8 32 A 8 8 0 0 1 0 24 L 0 8 A 8 8 0 0 1 8 0 Z
              " 
              fill={`url(#${id}_qBubbleGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.2" 
              strokeLinejoin="round" 
            />

            {/* Top-Left Gloss Pill / Specular Arc */}
            <path 
              d="M 5 10 C 5 6, 8 4, 14 4" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              opacity="0.9" 
            />

            {/* Bold Letter "Q" */}
            <g transform="translate(18, 16)">
              {/* Outer Q Ring */}
              <ellipse 
                cx="0" 
                cy="-1" 
                rx="6.8" 
                ry="7.5" 
                fill="none" 
                stroke="#0f172a" 
                strokeWidth="4.8" 
              />
              <ellipse 
                cx="0" 
                cy="-1" 
                rx="6.8" 
                ry="7.5" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="2.4" 
              />
              {/* Q Tail */}
              <line 
                x1="2" 
                y1="2" 
                x2="6.5" 
                y2="6.5" 
                stroke="#0f172a" 
                strokeWidth="4.8" 
                strokeLinecap="round" 
              />
              <line 
                x1="2" 
                y1="2" 
                x2="6.5" 
                y2="6.5" 
                stroke="#ffffff" 
                strokeWidth="2.4" 
                strokeLinecap="round" 
              />
            </g>
          </g>

          {/* ── 3D ANSWER BUBBLE (RED - BOTTOM RIGHT) ── */}
          <g transform="translate(42, 45) scale(0.88)">
            
            {/* 3D Bottom Extrusion Shadow Layer */}
            <path 
              d="
                M 8 0 L 28 0 A 8 8 0 0 1 36 8 L 36 24 A 8 8 0 0 1 28 32 L 28 39 L 23 32 L 8 32 A 8 8 0 0 1 0 24 L 0 8 A 8 8 0 0 1 8 0 Z
              " 
              transform="translate(0, 4.5)" 
              fill="#991b1b" 
              stroke="#0f172a" 
              strokeWidth="2.2" 
              strokeLinejoin="round" 
            />

            {/* Front Bubble Face */}
            <path 
              d="
                M 8 0 L 28 0 A 8 8 0 0 1 36 8 L 36 24 A 8 8 0 0 1 28 32 L 28 39 L 23 32 L 8 32 A 8 8 0 0 1 0 24 L 0 8 A 8 8 0 0 1 8 0 Z
              " 
              fill={`url(#${id}_aBubbleGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.2" 
              strokeLinejoin="round" 
            />

            {/* Top-Left Gloss Pill / Specular Arc */}
            <path 
              d="M 5 10 C 5 6, 8 4, 14 4" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              opacity="0.9" 
            />

            {/* Bold Letter "A" */}
            <g transform="translate(18, 16)">
              {/* Outer Outline */}
              <path 
                d="M -5.5 7 L 0 -8 L 5.5 7 M -3.5 1.5 L 3.5 1.5" 
                fill="none" 
                stroke="#0f172a" 
                strokeWidth="4.8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* White Core Letter */}
              <path 
                d="M -5.5 7 L 0 -8 L 5.5 7 M -3.5 1.5 L 3.5 1.5" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="2.4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </g>
          </g>

          {/* ── TOP-RIGHT VERIFIED GREEN CHECKMARK BADGE (BROUGHT DOWN & BALANCED) ── */}
          <g transform="translate(68, 29) scale(0.92)">
            
            {/* Ambient Green Aura Glow */}
            <circle cx="0" cy="0" r="14" fill="#22c55e" opacity="0.45" filter="blur(2px)" />

            {/* 3D Beveled Outer Ring */}
            <circle 
              cx="0" 
              cy="0" 
              r="9.5" 
              fill={`url(#${id}_greenCheckGrad)`} 
              stroke="#ffffff" 
              strokeWidth="1.4" 
            />
            {/* Inner Emerald Shading */}
            <circle cx="0" cy="0" r="7.5" fill="#15803d" stroke="#86efac" strokeWidth="0.6" />

            {/* Bold Crisp White Checkmark */}
            <path 
              d="M -4 -0.2 L -1.2 2.8 L 4.2 -3.2" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2.4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </g>

          {/* Sparkles around Checkmark & Bubbles */}
          <g fill="#fef08a">
            <polygon points="68,14 69,16 71,17 69,18 68,20 67,18 65,17 67,16" transform="scale(0.8) translate(15, 0)" />
            <polygon points="18,34 19,36 21,37 19,38 18,40 17,38 15,37 17,36" transform="scale(0.7) translate(2, 6)" />
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
