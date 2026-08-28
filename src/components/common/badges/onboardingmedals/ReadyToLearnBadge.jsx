import React from 'react';

/**
 * ReadyToLearnBadge - Custom 3D Vector Badge for "Ready To Learn" (onboarding.ready_to_learn)
 * 
 * Royal Amethyst / Indigo Theme with 3D Glowing Open Book & Rising Star of Knowledge:
 * - Exact shield path, 3D purple/indigo metallic rim gradient, and top specular glare reflection.
 * - Inside the shield: A glowing 3D open book of knowledge with layered pages, golden bookmark ribbon,
 *   and a radiant rising star / light beacon of wisdom streaming upward.
 * - 100% Consistent in proportions, bevel, rim, and lighting with all other badges.
 */
export default function ReadyToLearnBadge({
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

          {/* Outer Metallic Purple/Amethyst Rim Gradient */}
          <linearGradient id={`${id}_rimGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#d8b4fe" />
            <stop offset="45%" stopColor="#a855f7" />
            <stop offset="75%" stopColor="#7e22ce" />
            <stop offset="92%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#1e0a38" />
          </linearGradient>

          {/* Inner Bevel Shadow Filter */}
          <filter id={`${id}_filterShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Deep Indigo/Cosmic Backdrop Gradient */}
          <linearGradient id={`${id}_cosmicBg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f0728" />
            <stop offset="40%" stopColor="#1e1045" />
            <stop offset="80%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#0b031c" />
          </linearGradient>

          {/* Radiant Wisdom Core Flare */}
          <radialGradient id={`${id}_wisdomFlare`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#c084fc" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#7e22ce" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0f0728" stopOpacity="0" />
          </radialGradient>

          {/* Golden Star / Bookmark Gradient */}
          <linearGradient id={`${id}_goldGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Book Page Shading Gradient (Left Page) */}
          <linearGradient id={`${id}_leftPageGrad`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Book Page Shading Gradient (Right Page) */}
          <linearGradient id={`${id}_rightPageGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Book Cover Hardbound Gradient */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7e22ce" />
            <stop offset="50%" stopColor="#581c87" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
        </defs>

        {/* ── 1. EXACT OUTER METALLIC PURPLE RIM (BEVEL) ── */}
        <path 
          d={shieldPath} 
          fill={`url(#${id}_rimGrad)`} 
          filter={`url(#${id}_filterShadow)`} 
        />

        {/* ── 2. INNER ILLUSTRATION PORTAL (CLIPPED TO EXACT SHIELD) ── */}
        <g clipPath={`url(#${id}_innerShieldClip)`}>
          
          {/* Cosmic Backdrop */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${id}_cosmicBg)`} />

          {/* Upward Light Beam / Cone of Wisdom */}
          <polygon 
            points="50,22 18,92 82,92" 
            fill={`url(#${id}_wisdomFlare)`} 
            opacity="0.8" 
          />

          {/* Ambient Knowledge Sparkles & Star Particles */}
          <g fill="#ffffff" opacity="0.6">
            <circle cx="24" cy="24" r="0.9" />
            <circle cx="76" cy="24" r="0.9" />
            <circle cx="20" cy="42" r="0.7" />
            <circle cx="80" cy="42" r="0.7" />
            <circle cx="32" cy="15" r="1.1" />
            <circle cx="68" cy="15" r="1.1" />
          </g>

          {/* ── 3D OPEN BOOK OF KNOWLEDGE ── */}
          <g transform="translate(50, 60)">
            
            {/* Hardbound Book Base Cover */}
            <path 
              d="M -30 9 Q -15 15, 0 8 Q 15 15, 30 9 L 29 13 Q 15 19, 0 12 Q -15 19, -29 13 Z" 
              fill={`url(#${id}_coverGrad)`} 
              stroke="#a855f7" 
              strokeWidth="0.8" 
            />

            {/* Book Spine Center Notch */}
            <polygon points="-2,8 2,8 1,13 -1,13" fill="#a855f7" />

            {/* Stacked Pages Lower Shadow Block */}
            <path 
              d="M -28 7 Q -14 13, 0 6 Q 14 13, 28 7 L 29 10 Q 14 16, 0 9 Q -14 16, -29 10 Z" 
              fill="#94a3b8" 
            />

            {/* Left Open Book Leaf (Wings outward) */}
            <path 
              d="M 0 5 Q -14 11, -28 5 Q -22 -8, 0 -3 Z" 
              fill={`url(#${id}_leftPageGrad)`} 
              stroke="#a855f7" 
              strokeWidth="0.8" 
              strokeLinejoin="round" 
            />
            {/* Left Page Text Lines Simulation */}
            <g stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" opacity="0.7">
              <line x1="-22" y1="-1" x2="-6" y2="0" />
              <line x1="-24" y1="2" x2="-6" y2="3" />
              <line x1="-22" y1="5" x2="-8" y2="6" />
            </g>

            {/* Right Open Book Leaf (Wings outward) */}
            <path 
              d="M 0 5 Q 14 11, 28 5 Q 22 -8, 0 -3 Z" 
              fill={`url(#${id}_rightPageGrad)`} 
              stroke="#a855f7" 
              strokeWidth="0.8" 
              strokeLinejoin="round" 
            />
            {/* Right Page Text Lines Simulation */}
            <g stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" opacity="0.7">
              <line x1="6" y1="0" x2="22" y2="-1" />
              <line x1="6" y1="3" x2="24" y2="2" />
              <line x1="8" y1="6" x2="22" y2="5" />
            </g>

            {/* Center Book Spine Seam & Golden Highlight Line */}
            <line x1="0" y1="-3" x2="0" y2="6" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />

            {/* Golden Bookmark Ribbon Hanging Down from Bottom Spine */}
            <path 
              d="M -1.8 6 L 1.8 6 L 2.5 18 L 0 15 L -2.5 18 Z" 
              fill={`url(#${id}_goldGrad)`} 
              stroke="#b45309" 
              strokeWidth="0.4" 
            />
          </g>

          {/* ── RISING STAR OF WISDOM & INSPIRATION (ABOVE BOOK) ── */}
          <g transform="translate(50, 32)">
            
            {/* Radiant Ambient Core Behind Star */}
            <circle cx="0" cy="0" r="14" fill={`url(#${id}_wisdomFlare)`} />

            {/* 8-Point Golden Star */}
            {/* Primary Diamond Cardinal Cross */}
            <polygon 
              points="0,-11 3,-3 11,0 3,3 0,11 -3,3 -11,0 -3,-3" 
              fill={`url(#${id}_goldGrad)`} 
              stroke="#78350f" 
              strokeWidth="0.5" 
            />
            {/* Diagonal Secondary Points */}
            <polygon 
              points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" 
              transform="rotate(45)" 
              fill="#ffffff" 
            />
            {/* Center Radiant Core */}
            <circle cx="0" cy="0" r="2.2" fill="#ffffff" stroke="#f59e0b" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1" fill="#fef08a" />
          </g>

          {/* Knowledge Sparkle Particles Ascending */}
          <g fill="#fef08a">
            <polygon points="36,22 37,24 39,25 37,26 36,28 35,26 33,25 35,24" transform="scale(0.8) translate(5, 2)" />
            <polygon points="64,22 65,24 67,25 65,26 64,28 63,26 61,25 63,24" transform="scale(0.8) translate(15, 2)" />
            <polygon points="50,14 51,16 53,17 51,18 50,20 49,18 47,17 49,16" transform="scale(0.7) translate(22, 1)" />
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
