import React from 'react';

/**
 * SurveyPioneerBadge - Custom 3D Vector Badge for "Survey Pioneer" (special_event.survey_pioneer)
 * 
 * Styled after the golden medallion in the survey completion view:
 * - Golden metallic rim with rich specular reflection
 * - Deep midnight navy core with ambient sunburst rays
 * - Golden trophy with embossed stars and laurel accents
 * - Responsive sizing and locked/earned styling
 */
export default function SurveyPioneerBadge({
  size = 140,
  earned = true,
  className = "",
  animated = false,
}) {
  const id = React.useId().replace(/:/g, "_");

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center transition-transform duration-300 ${
        earned
          ? "hover:scale-110 drop-shadow-2xl"
          : "filter grayscale contrast-75 opacity-40 hover:opacity-60"
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className={`absolute inset-0 w-full h-full overflow-visible select-none ${
          animated && earned ? "animate-pulse" : ""
        }`}
      >
        <defs>
          {/* Outer Metallic Gold Rim Gradient */}
          <linearGradient id={`${id}_goldRim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#ca8a04" />
            <stop offset="90%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#422006" />
          </linearGradient>

          {/* Deep Royal Midnight Core Gradient */}
          <radialGradient id={`${id}_coreBg`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="60%" stopColor="#0f2843" />
            <stop offset="100%" stopColor="#061524" />
          </radialGradient>

          {/* Trophy Cup Gold Gradient */}
          <linearGradient id={`${id}_trophyGold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* Radial Ambient Glow */}
          <radialGradient id={`${id}_ambientGlow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>

          {/* Shadow Filter */}
          <filter id={`${id}_dropShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Ambient Glow Aura */}
        {earned && (
          <circle cx="50" cy="50" r="48" fill={`url(#${id}_ambientGlow)`} />
        )}

        {/* Outer Golden Beveled Ring */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill={`url(#${id}_goldRim)`}
          filter={`url(#${id}_dropShadow)`}
        />

        {/* Inner Groove Ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="#1c1917"
          opacity="0.3"
        />
        <circle
          cx="50"
          cy="50"
          r="40.5"
          fill={`url(#${id}_goldRim)`}
        />

        {/* Inner Core Dial */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill={`url(#${id}_coreBg)`}
        />

        {/* Decorative Rays / Sunburst */}
        <g opacity="0.15" stroke="#fde047" strokeWidth="0.5">
          <line x1="50" y1="12" x2="50" y2="20" />
          <line x1="50" y1="80" x2="50" y2="88" />
          <line x1="12" y1="50" x2="20" y2="50" />
          <line x1="80" y1="50" x2="88" y2="50" />
          <line x1="23" y1="23" x2="29" y2="29" />
          <line x1="71" y1="71" x2="77" y2="77" />
          <line x1="23" y1="77" x2="29" y2="71" />
          <line x1="71" y1="29" x2="77" y2="23" />
        </g>

        {/* Central Trophy Icon Graphics */}
        <g transform="translate(25, 23) scale(0.5)" filter={`url(#${id}_dropShadow)`}>
          {/* Trophy Cup Bowl */}
          <path
            d="M25 15 C25 45 75 45 75 15 Z"
            fill={`url(#${id}_trophyGold)`}
          />
          {/* Trophy Rim */}
          <ellipse cx="50" cy="15" rx="25" ry="5" fill="#fef08a" />
          <ellipse cx="50" cy="15" rx="23" ry="3.5" fill="#92400e" />

          {/* Left Handle */}
          <path
            d="M25 20 C10 20 8 36 24 40 L26 36 C14 33 16 23 25 23 Z"
            fill={`url(#${id}_trophyGold)`}
          />
          {/* Right Handle */}
          <path
            d="M75 20 C90 20 92 36 76 40 L74 36 C86 33 84 23 75 23 Z"
            fill={`url(#${id}_trophyGold)`}
          />

          {/* Trophy Stem */}
          <path
            d="M45 42 L42 62 L58 62 L55 42 Z"
            fill={`url(#${id}_trophyGold)`}
          />

          {/* Trophy Base Riser */}
          <ellipse cx="50" cy="62" rx="14" ry="4" fill="#fbbf24" />
          <path
            d="M34 62 L30 76 L70 76 L66 62 Z"
            fill={`url(#${id}_trophyGold)`}
          />
          {/* Base Bottom Pedestal */}
          <rect x="25" y="75" width="50" height="9" rx="2.5" fill="#f59e0b" />
          <rect x="23" y="82" width="54" height="4" rx="1.5" fill="#78350f" />

          {/* Star Embellishment on Cup */}
          <path
            d="M50 22 L52 28 L58 28 L53 32 L55 38 L50 34 L45 38 L47 32 L42 28 L48 28 Z"
            fill="#ffffff"
            opacity="0.9"
          />
        </g>

        {/* Small 5 Stars under Trophy */}
        <g fill="#fde047" opacity="0.85" transform="translate(0, 70)">
          <polygon points="34,4 35,6 37,6 35.5,7.5 36,9.5 34,8 32,9.5 32.5,7.5 31,6 33,6" />
          <polygon points="42,2 43,4 45,4 43.5,5.5 44,7.5 42,6 40,7.5 40.5,5.5 39,4 41,4" />
          <polygon points="50,1 51,3 53,3 51.5,4.5 52,6.5 50,5 48,6.5 48.5,4.5 47,3 49,3" />
          <polygon points="58,2 59,4 61,4 59.5,5.5 60,7.5 58,6 56,7.5 56.5,5.5 55,4 57,4" />
          <polygon points="66,4 67,6 69,6 67.5,7.5 68,9.5 66,8 64,9.5 64.5,7.5 63,6 65,6" />
        </g>

        {/* Top Glare Reflection */}
        <path
          d="M20 28 A38 38 0 0 1 80 28 A37 32 0 0 0 20 28 Z"
          fill="#ffffff"
          opacity="0.12"
        />
      </svg>
    </div>
  );
}
