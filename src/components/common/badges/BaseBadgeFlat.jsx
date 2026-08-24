import React from 'react';

const SHAPES = {
  shield: "M50 5 L90 20 L90 60 C90 85 50 95 50 95 C50 95 10 85 10 60 L10 20 Z",
  hexagon: "M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z",
  star: "M50 5 L64 35 L98 40 L73 64 L79 98 L50 82 L21 98 L27 64 L2 40 L36 35 Z"
};

const getColors = (colorName) => {
  const colors = {
    green: { primary: "#22c55e", dark: "#166534" },
    yellow: { primary: "#eab308", dark: "#854d0e" },
    blue: { primary: "#3b82f6", dark: "#1e3a8a" },
    primaryBlue: { primary: "#09314F", dark: "#041523" },
    primaryRed: { primary: "#E83831", dark: "#7f1d1a" }
  };
  return colors[colorName] || colors.blue;
};

export default function BaseBadgeFlat({ shape = "shield", color = "blue", Icon, size = 120 }) {
  const path = SHAPES[shape];
  const { primary, dark } = getColors(color);

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center hover:scale-110 transition-transform duration-300">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-md">
        {/* Background layer (dark border/depth) */}
        <path d={path} fill={dark} transform="translate(0, 4)" />
        {/* Main layer */}
        <path d={path} fill={primary} />
        {/* Subtle top highlight for flat design */}
        <path d={path} fill="white" opacity="0.15" transform="scale(0.9) translate(5, 5)" />
      </svg>
      {/* Icon */}
      {Icon && (
        <div className="relative z-10 text-white drop-shadow-md pb-2">
          <Icon size={size * 0.35} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}
