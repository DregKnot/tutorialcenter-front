import React from 'react';

/**
 * LearningBeginsBadge - Custom 3D Vector Badge for "Learning Begins" (streak.3_day_flame)
 * Condition: 3 Consecutive Days Practice Streak
 * 
 * Styled with a Fiery Streak Checklist & Blazing Target:
 * - Exact shield path, 3D fiery magma/amber metallic rim gradient, and top specular glare reflection.
 * - Inside the shield: A glowing checklist form enveloped in dynamic leaping flames representing the streak,
 *   3 verified daily streak checkmarks (Days 1, 2, 3), and a burning bullseye target pierced by an arrow.
 * - 100% Consistent in proportions, bevel, rim, and lighting with all other badges.
 */
export default function LearningBeginsBadge({
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

          {/* Outer Metallic Fiery Crimson/Orange Rim Gradient */}
          <linearGradient id={`${id}_rimGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="15%" stopColor="#fef08a" />
            <stop offset="38%" stopColor="#fb923c" />
            <stop offset="65%" stopColor="#ef4444" />
            <stop offset="85%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#350808" />
          </linearGradient>

          {/* Inner Bevel Shadow Filter */}
          <filter id={`${id}_filterShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.55" />
          </filter>

          {/* Deep Dark Magma/Ember Backdrop Gradient */}
          <linearGradient id={`${id}_portalBg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a0404" />
            <stop offset="40%" stopColor="#2c0808" />
            <stop offset="80%" stopColor="#3b0b0b" />
            <stop offset="100%" stopColor="#120202" />
          </linearGradient>

          {/* Intense Radial Flame Glow */}
          <radialGradient id={`${id}_flameGlow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#fde047" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#ea580c" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#991b1b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1a0404" stopOpacity="0" />
          </radialGradient>

          {/* Main Flame Tongues Gradient (Outer Flame) */}
          <linearGradient id={`${id}_outerFlameGrad`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="40%" stopColor="#ea580c" />
            <stop offset="75%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>

          {/* Inner Flame Core Gradient (Hot Yellow/White) */}
          <linearGradient id={`${id}_innerFlameGrad`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Clipboard Parchment Body Gradient */}
          <linearGradient id={`${id}_formBodyGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="50%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>

          {/* Golden Clip Gradient */}
          <linearGradient id={`${id}_goldClipGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Target Gradient */}
          <linearGradient id={`${id}_targetGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* ── 1. EXACT OUTER METALLIC FIERY RIM (BEVEL) ── */}
        <path 
          d={shieldPath} 
          fill={`url(#${id}_rimGrad)`} 
          filter={`url(#${id}_filterShadow)`} 
        />

        {/* ── 2. INNER ILLUSTRATION PORTAL (CLIPPED TO EXACT SHIELD) ── */}
        <g clipPath={`url(#${id}_innerShieldClip)`}>
          
          {/* Deep Dark Magma Backdrop */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${id}_portalBg)`} />

          {/* Radiant Center Flame Flare */}
          <circle cx="50" cy="50" r="36" fill={`url(#${id}_flameGlow)`} />

          {/* Floating Fire Embers & Spark Particles */}
          <g fill="#fef08a">
            <circle cx="20" cy="22" r="0.9" opacity="0.8" />
            <circle cx="78" cy="18" r="1.1" opacity="0.9" />
            <circle cx="84" cy="42" r="0.8" opacity="0.7" />
            <circle cx="16" cy="45" r="0.8" opacity="0.7" />
            <circle cx="18" cy="74" r="0.7" opacity="0.5" />
            <polygon points="50,11 51,13 53,14 51,15 50,17 49,15 47,14 49,13" fill="#ffffff" opacity="0.9" />
          </g>

          {/* ── 3. LEAPING FIRE TONGUES SURROUNDING THE FORM (STREAK FLAME) ── */}
          <g>
            {/* Outer Flame Silhouette */}
            <path 
              d="
                M 24 72
                C 16 64, 14 48, 22 40
                C 18 34, 22 24, 30 20
                C 32 12, 42 8, 48 4
                C 52 10, 58 8, 64 14
                C 72 16, 78 26, 74 36
                C 82 44, 82 60, 74 72
                C 68 82, 32 82, 24 72 Z
              " 
              fill={`url(#${id}_outerFlameGrad)`} 
              opacity="0.95" 
            />

            {/* Inner Hot Yellow Fire Core */}
            <path 
              d="
                M 28 68
                C 22 60, 20 46, 28 38
                C 26 30, 34 22, 42 16
                C 46 12, 52 14, 56 18
                C 64 20, 70 30, 68 40
                C 74 48, 72 62, 66 68
                C 58 76, 36 76, 28 68 Z
              " 
              fill={`url(#${id}_innerFlameGrad)`} 
              opacity="0.85" 
            />
          </g>

          {/* ── 4. THE CLIPBOARD FORM (WITH FIERY TEXTURE & BORDER GLOW) ── */}
          <g transform="translate(26, 18)">
            
            {/* Clipboard Back Shadow */}
            <rect 
              x="0" 
              y="0" 
              width="42" 
              height="58" 
              rx="4" 
              fill="#0c0a09" 
              stroke="#ea580c" 
              strokeWidth="2.2" 
            />

            {/* Inner Glowing Slate Sheet */}
            <rect 
              x="2" 
              y="2" 
              width="38" 
              height="54" 
              rx="2.5" 
              fill={`url(#${id}_formBodyGrad)`} 
            />

            {/* Neon Fiery Edge Highlight Line */}
            <rect 
              x="3" 
              y="3" 
              width="36" 
              height="52" 
              rx="2" 
              fill="none" 
              stroke="#f97316" 
              strokeWidth="0.8" 
              opacity="0.8" 
            />

            {/* ── TOP CLIP MECHANISM ── */}
            {/* Clip Base */}
            <rect 
              x="12" 
              y="-3.5" 
              width="18" 
              height="7" 
              rx="2" 
              fill={`url(#${id}_goldClipGrad)`} 
              stroke="#0f172a" 
              strokeWidth="1.6" 
            />
            {/* Clip Curved Ring Fastener */}
            <path 
              d="M 17 -3.5 L 17 -7 C 17 -9, 25 -9, 25 -7 L 25 -3.5" 
              fill="none" 
              stroke={`url(#${id}_goldClipGrad)`} 
              strokeWidth="2" 
              strokeLinecap="round" 
            />

            {/* ── 3 CONSECUTIVE DAILY STREAK CHECKLIST ROWS ── */}
            
            {/* Day 1 Streak Row */}
            <g transform="translate(6, 12)">
              {/* Glowing Golden Checkmark */}
              <path 
                d="M 0 3.5 L 2.5 6 L 7 1" 
                fill="none" 
                stroke="#facc15" 
                strokeWidth="2.4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M 0 3.5 L 2.5 6 L 7 1" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Task/Day Line */}
              <line x1="11" y1="3.5" x2="28" y2="3.5" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Day 2 Streak Row */}
            <g transform="translate(6, 22)">
              {/* Glowing Golden Checkmark */}
              <path 
                d="M 0 3.5 L 2.5 6 L 7 1" 
                fill="none" 
                stroke="#facc15" 
                strokeWidth="2.4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M 0 3.5 L 2.5 6 L 7 1" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Task/Day Line */}
              <line x1="11" y1="3.5" x2="26" y2="3.5" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Day 3 Streak Row (Active Completion Flame!) */}
            <g transform="translate(6, 32)">
              {/* Glowing Golden Checkmark */}
              <path 
                d="M 0 3.5 L 2.5 6 L 7 1" 
                fill="none" 
                stroke="#facc15" 
                strokeWidth="2.4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M 0 3.5 L 2.5 6 L 7 1" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Task/Day Line */}
              <line x1="11" y1="3.5" x2="22" y2="3.5" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>

          {/* ── 5. BLAZING BULLSEYE TARGET & ARROW (BOTTOM-RIGHT OVERLAP) ── */}
          <g transform="translate(66, 64)">
            
            {/* Target Ambient Halo Glow */}
            <circle cx="0" cy="0" r="16" fill="#f97316" opacity="0.4" filter="blur(2px)" />

            {/* Outer Concentric Target Ring */}
            <circle 
              cx="0" 
              cy="0" 
              r="12" 
              fill="#1c1917" 
              stroke={`url(#${id}_targetGrad)`} 
              strokeWidth="2.4" 
            />

            {/* Middle Golden Concentric Ring */}
            <circle 
              cx="0" 
              cy="0" 
              r="8" 
              fill="none" 
              stroke="#facc15" 
              strokeWidth="1.8" 
            />

            {/* Bullseye Solid Glowing Core */}
            <circle 
              cx="0" 
              cy="0" 
              r="4.2" 
              fill={`url(#${id}_targetGrad)`} 
              stroke="#ffffff" 
              strokeWidth="1" 
            />

            {/* ── FIERY ARROW PIERCING BULLSEYE ── */}
            <g transform="rotate(45)">
              
              {/* Arrow Flame Trail */}
              <path 
                d="M 0 -18 Q -3 -12, -1.5 -8 Q 0 -4, 0 0" 
                stroke="#facc15" 
                strokeWidth="2" 
                strokeLinecap="round" 
                opacity="0.8" 
              />

              {/* Arrow Shaft */}
              <line 
                x1="0" 
                y1="-16" 
                x2="0" 
                y2="0" 
                stroke="#ffffff" 
                strokeWidth="2" 
                strokeLinecap="round" 
              />

              {/* Arrow Fletching Feathers */}
              <line x1="-3" y1="-14" x2="0" y2="-12" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="-14" x2="0" y2="-12" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="-3" y1="-17" x2="0" y2="-15" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="-17" x2="0" y2="-15" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />

              {/* Arrowhead Point (Hitting center) */}
              <polygon points="-2.5,-3 2.5,-3 0,1" fill="#fef08a" stroke="#ea580c" strokeWidth="0.8" />
            </g>
          </g>

          {/* Sparkles of Achievement & Streak Fire */}
          <g fill="#fef08a">
            <polygon points="76,14 77,16 79,17 77,18 76,20 75,18 73,17 75,16" transform="scale(0.8) translate(16, 0)" />
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
