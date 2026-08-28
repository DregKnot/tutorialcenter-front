import React from 'react';

/**
 * WelcomeAboardBadge - "Door Opens to Your Workspace" concept
 *
 * Same shield geometry, rim gradient, and bevel/glare treatment as the
 * original badge for full visual consistency across the badge set.
 *
 * Inside the shield: a door swings open on the left, spilling light into
 * a simplified workspace silhouette (desk, chair, monitor). The monitor
 * screen is the one high-detail focal point, showing the Tutorial Center
 * "TC" emblem in navy/red - everything else stays flat silhouette so it
 * still reads clearly at small badge sizes.
 */
export default function WelcomeAboardBadge({
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
          <clipPath id={`${id}_innerShieldClip`}>
            <path
              d={shieldPath}
              transform="scale(0.85) translate(8.82, 8.82)"
            />
          </clipPath>

          {/* Outer Metallic Blue Rim Gradient */}
          <linearGradient id={`${id}_rimGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#7dd3fc" />
            <stop offset="45%" stopColor="#0284c7" />
            <stop offset="75%" stopColor="#0369a1" />
            <stop offset="92%" stopColor="#082f49" />
            <stop offset="100%" stopColor="#020817" />
          </linearGradient>

          <filter id={`${id}_filterShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Room backdrop */}
          <linearGradient id={`${id}_roomBg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#020817" />
            <stop offset="45%" stopColor="#081e3d" />
            <stop offset="100%" stopColor="#031024" />
          </linearGradient>

          {/* Door slab metallic gradient */}
          <linearGradient id={`${id}_doorGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0c2340" />
            <stop offset="55%" stopColor="#0284c7" />
            <stop offset="85%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>

          {/* Light spilling through the doorway gap */}
          <linearGradient id={`${id}_doorLight`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>

        </defs>

        {/* ── OUTER METALLIC RIM ── */}
        <path
          d={shieldPath}
          fill={`url(#${id}_rimGrad)`}
          filter={`url(#${id}_filterShadow)`}
        />

        {/* ── INNER SCENE (CLIPPED TO SHIELD) ── */}
        <g clipPath={`url(#${id}_innerShieldClip)`}>
          <rect x="0" y="0" width="100" height="100" fill={`url(#${id}_roomBg)`} />

          {/* Floor */}
          <polygon points="10,95 90,95 78,68 22,68" fill="#0a1d33" opacity="0.9" />

          {/* Ambient sparkles for continuity with the rest of the set */}
          <g fill="#ffffff" opacity="0.5">
            <circle cx="18" cy="18" r="0.8" />
            <circle cx="82" cy="16" r="0.8" />
            <circle cx="86" cy="34" r="0.6" />
          </g>

          {/* ── WELCOME PARTY (visible through the doorway) ── */}
          {/* A small crowd, arms up mid-clap, staggered for depth */}
          <g fill="#0c2340">
            {/* back row - slightly smaller, higher up */}
            <g transform="translate(43, 44) scale(0.85)">
              <circle cx="0" cy="0" r="3" />
              <path d="M -3 4 Q 0 2 3 4 L 3 13 Q 0 15 -3 13 Z" />
              <path d="M -3 5 L -6.5 0 M 3 5 L 6.5 0" stroke="#0c2340" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
            <g transform="translate(58, 42) scale(0.9)">
              <circle cx="0" cy="0" r="3" />
              <path d="M -3 4 Q 0 2 3 4 L 3 13 Q 0 15 -3 13 Z" />
              <path d="M -3 5 L -6.5 0 M 3 5 L 6.5 0" stroke="#0c2340" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
            <g transform="translate(73, 44) scale(0.85)">
              <circle cx="0" cy="0" r="3" />
              <path d="M -3 4 Q 0 2 3 4 L 3 13 Q 0 15 -3 13 Z" />
              <path d="M -3 5 L -6.5 0 M 3 5 L 6.5 0" stroke="#0c2340" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
            {/* front row - larger, closer to the door */}
            <g transform="translate(48, 56)">
              <circle cx="0" cy="0" r="3.4" />
              <path d="M -3.6 4.5 Q 0 2.3 3.6 4.5 L 3.6 15 Q 0 17 -3.6 15 Z" />
              <path d="M -3.6 5.5 L -7.5 -1 M 3.6 5.5 L 7.5 -1" stroke="#0c2340" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
            <g transform="translate(66, 57)">
              <circle cx="0" cy="0" r="3.4" />
              <path d="M -3.6 4.5 Q 0 2.3 3.6 4.5 L 3.6 15 Q 0 17 -3.6 15 Z" />
              <path d="M -3.6 5.5 L -7.5 -1 M 3.6 5.5 L 7.5 -1" stroke="#0c2340" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          </g>

          {/* Confetti bursting above the crowd */}
          <g>
            <rect x="41" y="30" width="1.6" height="1.6" fill="#f87171" transform="rotate(20 41 30)" />
            <rect x="52" y="26" width="1.6" height="1.6" fill="#38bdf8" transform="rotate(-15 52 26)" />
            <circle cx="62" cy="28" r="1" fill="#fef08a" />
            <rect x="70" y="27" width="1.6" height="1.6" fill="#f87171" transform="rotate(35 70 27)" />
            <circle cx="47" cy="36" r="0.9" fill="#bae6fd" />
            <rect x="76" y="33" width="1.4" height="1.4" fill="#fef08a" transform="rotate(10 76 33)" />
          </g>

          {/* ── DOORWAY FRAME ── */}
          <rect x="22" y="20" width="4" height="58" fill="#0c2340" />
          <rect x="22" y="18" width="34" height="4" fill="#0c2340" />

          {/* Light spilling out of the doorway gap */}
          <polygon points="26,22 40,50 26,78" fill={`url(#${id}_doorLight)`} opacity="0.8" />

          {/* Door slab, swung open toward the viewer on its left hinge */}
          <polygon
            points="26,20 38,26 34,74 26,78"
            fill={`url(#${id}_doorGrad)`}
          />
          {/* Door handle */}
          <circle cx="33" cy="52" r="1.1" fill="#fef08a" />

          {/* ── TOP SPECULAR GLARE ── */}
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