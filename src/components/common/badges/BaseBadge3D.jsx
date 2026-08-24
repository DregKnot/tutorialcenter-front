import React from 'react';

const SHAPES = {
  shield: "M50 5 L90 20 L90 60 C90 85 50 95 50 95 C50 95 10 85 10 60 L10 20 Z",
  hexagon: "M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z",
  star: "M50 5 L64 35 L98 40 L73 64 L79 98 L50 82 L21 98 L27 64 L2 40 L36 35 Z"
};

const getColors = (colorName) => {
  const colors = {
    green: { light: "#4ade80", base: "#22c55e", dark: "#14532d", rim: "#bbf7d0" },
    yellow: { light: "#fde047", base: "#eab308", dark: "#713f12", rim: "#fef08a" },
    blue: { light: "#60a5fa", base: "#3b82f6", dark: "#1e3a8a", rim: "#bfdbfe" },
    primaryBlue: { light: "#2c6b98", base: "#09314F", dark: "#020f1a", rim: "#5a9fc2" },
    primaryRed: { light: "#f87171", base: "#E83831", dark: "#450a0a", rim: "#fca5a5" }
  };
  return colors[colorName] || colors.blue;
};

export default function BaseBadge3D({ shape = "shield", color = "blue", Icon, size = 120 }) {
  const path = SHAPES[shape];
  const { light, base, dark, rim } = getColors(color);
  const filterId = `3d-shadow-${shape}-${color}`;
  const gradId = `3d-grad-${shape}-${color}`;
  const rimGradId = `3d-rim-${shape}-${color}`;

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center hover:scale-110 transition-transform duration-300">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-xl overflow-visible">
        <defs>
          {/* Main Metallic/3D Gradient */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={light} />
            <stop offset="50%" stopColor={base} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>

          {/* Shiny Metallic Rim Gradient */}
          <linearGradient id={rimGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor={rim} />
            <stop offset="80%" stopColor={dark} />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* Inner Bevel Shadow Filter */}
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Rim (Bevel) */}
        <path d={path} fill={`url(#${rimGradId})`} filter={`url(#${filterId})`} />
        
        {/* Inner Plaque */}
        <path d={path} fill={`url(#${gradId})`} transform="scale(0.85) translate(8.5, 8.5)" />
        
        {/* Top Glare/Reflection */}
        <path 
          d={shape === 'shield' 
              ? "M50 5 L90 20 L90 50 C70 40 30 40 10 50 L10 20 Z" 
              : "M50 5 L90 25 L90 40 C70 50 30 50 10 40 L10 25 Z"
            } 
          fill="#ffffff" 
          opacity="0.2" 
          transform="scale(0.85) translate(8.5, 8.5)" 
        />
      </svg>
      {/* Icon */}
      {Icon && (
        <div className="relative z-10 text-white pb-2" style={{ filter: 'drop-shadow(0px 3px 2px rgba(0,0,0,0.5))' }}>
          <Icon size={size * 0.35} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}
