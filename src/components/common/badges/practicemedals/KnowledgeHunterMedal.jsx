import React from 'react';

/**
 * KnowledgeHunterMedal - Custom Standalone Medal for "Knowledge Hunter" (250 Practice Questions)
 * 
 * Styled with Hunter's Bow & Arrow where the Arrow Head IS the Magnifying Glass ("250"):
 * - Golden-tipped hunter's bow with wooden limbs, central leather grip, and taut bowstring.
 * - Feathered arrow shaft serving as the magnifying glass handle.
 * - Magnifying glass lens as the arrowhead, featuring a hunter crosshair and bold "250".
 * - Open hardcover book with layered pages and a glowing emerald hunter aura edge.
 * - 100% vector art with rich gradients, precision crosshairs, and soft drop shadow.
 */
export default function KnowledgeHunterMedal({
  size = 140,
  earned = true,
  count = 250,
  className = ""
}) {
  const id = React.useId().replace(/:/g, "_");

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
          {/* Drop Shadow Filter */}
          <filter id={`${id}_dropShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Book Edge Hunter Neon Glow Filter */}
          <filter id={`${id}_hunterGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#10b981" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#059669" floodOpacity="0.45" />
          </filter>

          {/* Bow Wooden Limb Gradient */}
          <linearGradient id={`${id}_bowWoodGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Bow Golden Limb Tips Gradient */}
          <linearGradient id={`${id}_goldTipGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Arrow Feather Fletching Gradient */}
          <linearGradient id={`${id}_featherGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Hardcover Outer Binding Gradient (Forest Emerald) */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="50%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* Left Page Gradient */}
          <linearGradient id={`${id}_leftPageGrad`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ecfdf5" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Right Page Gradient */}
          <linearGradient id={`${id}_rightPageGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ecfdf5" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Side Layered Pages */}
          <linearGradient id={`${id}_sideLeaves`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>

          {/* Magnifying Glass Bezel Ring Gradient */}
          <linearGradient id={`${id}_glassRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Glowing Emerald Glass Convex Lens */}
          <radialGradient id={`${id}_lensGrad`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="35%" stopColor="#34d399" />
            <stop offset="75%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>

          {/* 250 Golden Glowing Number Gradient */}
          <linearGradient id={`${id}_numGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Ambient Hunter Radiance */}
          <radialGradient id={`${id}_searchAura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Aura Glow */}
        <circle cx="50" cy="50" r="44" fill={`url(#${id}_searchAura)`} />

        {/* ── 1. GLOWING NEON CONTOUR AROUND BOOK EDGES ── */}
        <g filter={`url(#${id}_hunterGlow)`}>
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
            stroke="#10b981" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />
        </g>

        {/* ── 2. OPEN HARDCOVER BOOK ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          
          {/* Main Hardcover Base (Forest Emerald) */}
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
            stroke="#064e3b" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />

          {/* ── SIDE LAYERED STACK OF PAGES (MINT TINT) ── */}
          {/* Left Stacked Leaves */}
          <path 
            d="M 12 20 L 12 80 C 12 83, 20 84, 26 84 L 26 24 C 20 24, 14 22, 12 20 Z" 
            fill={`url(#${id}_sideLeaves)`} 
            stroke="#064e3b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 18 14 L 18 78 C 18 80, 26 82, 32 82 L 32 18 C 26 18, 20 16, 18 14 Z" 
            fill="#ecfdf5" 
            stroke="#064e3b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />

          {/* Right Stacked Leaves */}
          <path 
            d="M 88 20 L 88 80 C 88 83, 80 84, 74 84 L 74 24 C 80 24, 86 22, 88 20 Z" 
            fill={`url(#${id}_sideLeaves)`} 
            stroke="#064e3b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 82 14 L 82 78 C 82 80, 74 82, 68 82 L 68 18 C 74 18, 80 16, 82 14 Z" 
            fill="#ecfdf5" 
            stroke="#064e3b" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
          />

          {/* ── MAIN SPREAD OPEN PAGES ── */}
          {/* Left Open Page Leaf */}
          <path 
            d="
              M 50 20 
              L 26 6 
              C 26 6, 23 30, 23 75 
              C 30 75, 45 84, 50 86 
              Z
            " 
            fill={`url(#${id}_leftPageGrad)`} 
            stroke="#064e3b" 
            strokeWidth="2.6" 
            strokeLinejoin="round" 
          />

          {/* Right Open Page Leaf */}
          <path 
            d="
              M 50 20 
              L 74 6 
              C 74 6, 77 30, 77 75 
              C 70 75, 55 84, 50 86 
              Z
            " 
            fill={`url(#${id}_rightPageGrad)`} 
            stroke="#064e3b" 
            strokeWidth="2.6" 
            strokeLinejoin="round" 
          />

          {/* Center Vertical Spine Seam */}
          <line x1="50" y1="20" x2="50" y2="86" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ── 3. HUNTER'S RECURVE BOW & ARROW MAGNIFYING GLASS ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          
          {/* ── A. TAUT BOWSTRING ── */}
          {/* Line connecting Top-Left Tip (18, 16) to Bottom-Right Tip (82, 80) through arrow nock (24, 74) */}
          <polyline 
            points="18,16 26,72 82,80" 
            fill="none" 
            stroke="#0f172a" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />
          <polyline 
            points="18,16 26,72 82,80" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="1.2" 
            strokeLinejoin="round" 
          />

          {/* ── B. WOODEN RECURVE BOW STRUCTURE (CROSSING PERPENDICULAR TO ARROW) ── */}
          <g transform="translate(50, 48) rotate(-45)">
            {/* Wooden Limbs */}
            <rect x="-4" y="-42" width="8" height="84" rx="4" fill={`url(#${id}_bowWoodGrad)`} stroke="#0f172a" strokeWidth="2.4" />
            
            {/* Top Golden Limb Tip */}
            <path d="M -4 -34 L 4 -34 L 0 -44 Z" fill={`url(#${id}_goldTipGrad)`} stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
            
            {/* Bottom Golden Limb Tip */}
            <path d="M -4 34 L 4 34 L 0 44 Z" fill={`url(#${id}_goldTipGrad)`} stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />

            {/* Central Dark Leather Grip Band */}
            <rect x="-5.5" y="-10" width="11" height="20" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="2.2" />
            {/* Grip Wrap Stitch Lines */}
            <line x1="-5.5" y1="-5" x2="5.5" y2="-5" stroke="#64748b" strokeWidth="1.2" />
            <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke="#64748b" strokeWidth="1.2" />
            <line x1="-5.5" y1="5" x2="5.5" y2="5" stroke="#64748b" strokeWidth="1.2" />
          </g>

          {/* ── C. ARROW SHAFT (SERVING AS MAGNIFYING GLASS HANDLE) ── */}
          <g transform="translate(50, 48) rotate(45)">
            {/* Wooden Arrow Shaft / Handle */}
            <rect x="-3" y="-12" width="6" height="46" rx="2.5" fill={`url(#${id}_bowWoodGrad)`} stroke="#0f172a" strokeWidth="2.2" />
            
            {/* Feathered Arrow Fletching Tail (at Bottom-Left) */}
            <g transform="translate(0, 32)">
              <polygon points="0,0 -8,12 -3,14 0,8 3,14 8,12" fill={`url(#${id}_featherGrad)`} stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#0f172a" strokeWidth="1.2" />
            </g>
          </g>

          {/* ── D. MAGNIFYING GLASS LENS AS THE ARROWHEAD (AT TOP-RIGHT) ── */}
          <g transform="translate(56, 42)">
            
            {/* Thick White Circular Bezel Rim */}
            <circle 
              cx="0" 
              cy="0" 
              r="22.5" 
              fill={`url(#${id}_glassRingGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.8" 
            />

            {/* Inner Rim Accent */}
            <circle 
              cx="0" 
              cy="0" 
              r="17" 
              fill="none" 
              stroke="#cbd5e1" 
              strokeWidth="1.2" 
            />

            {/* Glowing Emerald Convex Glass Lens */}
            <circle 
              cx="0" 
              cy="0" 
              r="16" 
              fill={`url(#${id}_lensGrad)`} 
              stroke="#0f172a" 
              strokeWidth="2.2" 
            />

            {/* ── HUNTER PRECISION CROSSHAIR RETICLE ── */}
            {/* Center Circular Crosshair Ring */}
            <circle cx="0" cy="0" r="11" fill="none" stroke="#a7f3d0" strokeWidth="0.9" strokeDasharray="3,2" />
            
            {/* Crosshair Hairlines */}
            <line x1="0" y1="-16" x2="0" y2="-9" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="0" y1="9" x2="0" y2="16" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="-16" y1="0" x2="-9" y2="0" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="9" y1="0" x2="16" y2="0" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />

            {/* Top-Left Specular Bubble Highlight */}
            <ellipse 
              cx="-6" 
              cy="-6" 
              rx="4" 
              ry="2.6" 
              fill="#ffffff" 
              opacity="0.85" 
              transform="rotate(-25 -6 -6)" 
            />

            {/* ── BOLD GLOWING "250" MILESTONE NUMBER IN LENS ── */}
            <text 
              x="0" 
              y="5.8" 
              textAnchor="middle" 
              fontSize="15.5" 
              fontWeight="900" 
              fontFamily="system-ui, -apple-system, sans-serif" 
              fill={`url(#${id}_numGrad)`} 
              stroke="#0f172a" 
              strokeWidth="1.3" 
              style={{ letterSpacing: "-0.8px" }}
            >
              {count}
            </text>
          </g>
        </g>

        {/* ── 4. SPARKLES OF KNOWLEDGE HUNTING ── */}
        <g fill="#fef08a" stroke="#0f172a" strokeWidth="1.2">
          <polygon points="90,12 91,15 94,16 91,17 90,20 89,17 86,16 89,15" />
          <polygon points="10,26 11,28 13,29 11,30 10,32 9,30 7,29 9,28" />
        </g>
      </svg>
    </div>
  );
}
