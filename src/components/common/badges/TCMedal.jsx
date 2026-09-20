import React from 'react';

/**
 * TCMedal - Ultra-High Fidelity 3D/Skeuomorphic Vector SVG Medal Component
 * 100% Pure Vector SVG for instant 60fps rendering, zero lag, and razor-sharp clarity.
 * 
 * Features True Optical Fluid Glass / Prismatic Diamond Architecture:
 * - Multi-faceted diamond crystal bevels & internal refraction cuts
 * - Translucent frosted glassmorphism with visible internal depth
 * - 5 Sculpted 3D diamond crystal wing blades with facet spine ridges
 * - Bioluminescent neon glowing center emblem
 * - Pristine Icy Blue & Crystal Diamond White palette (100% yellow-free)
 */
export default function TCMedal({
  tier = "gold", // "bronze" | "silver" | "gold" | "platinum" | "diamond"
  gemColor = "ruby", // "ruby" | "sapphire" | "emerald" | "diamond" | "gold" | "cyan" | "darkBlue"
  Icon,
  size = 180,
  glow = true,
  className = "",
  title = "",
  subtitle = "",
  useTrophyCup = true,
  animated = true,
}) {
  const id = React.useId().replace(/:/g, "_");

  // --- PALETTES & GRADIENTS ---
  const THEMES = {
    bronze: {
      rimLight: "#fcd34d",
      rimBase: "#b45309",
      rimDark: "#451a03",
      rimAccent: "#fde68a",
      plateLight: "#d97706",
      plateDark: "#3f1a04",
      rivet: "#fef3c7",
      aura: "rgba(180, 83, 9, 0.45)",
      wingLight: "#f59e0b",
      wingBase: "#b45309",
      wingDark: "#451a03",
      ribbonLight: "#15803d",
      ribbonDark: "#052e16",
      ribbonBorder: "#fcd34d"
    },
    silver: {
      rimLight: "#ffffff",
      rimBase: "#94a3b8",
      rimDark: "#334155",
      rimAccent: "#f8fafc",
      plateLight: "#cbd5e1",
      plateDark: "#1e293b",
      rivet: "#ffffff",
      aura: "rgba(148, 163, 184, 0.5)",
      wingLight: "#f8fafc",
      wingBase: "#94a3b8",
      wingDark: "#334155",
      ribbonLight: "#2563eb",
      ribbonDark: "#172554",
      ribbonBorder: "#93c5fd"
    },
    gold: {
      rimLight: "#fffbeb",
      rimBase: "#eab308",
      rimDark: "#713f12",
      rimAccent: "#fef08a",
      plateLight: "#fde047",
      plateDark: "#422006",
      rivet: "#ffffff",
      aura: "rgba(234, 179, 8, 0.6)",
      wingLight: "#fef08a",
      wingBase: "#eab308",
      wingDark: "#542a06",
      ribbonLight: "#dc2626",
      ribbonDark: "#450a0a",
      ribbonBorder: "#fde047"
    },
    platinum: {
      rimLight: "#ffffff",
      rimBase: "#0284c7",
      rimDark: "#082f49",
      rimAccent: "#e0f2fe",
      plateLight: "#38bdf8",
      plateDark: "#075985",
      rivet: "#e0f2fe",
      aura: "rgba(14, 165, 233, 0.65)",
      wingLight: "#e0f2fe",
      wingBase: "#38bdf8",
      wingDark: "#0c4a6e",
      ribbonLight: "#4338ca",
      ribbonDark: "#1e1b4b",
      ribbonBorder: "#7dd3fc"
    },
    diamond: {
      rimLight: "#ffffff",
      rimBase: "#38bdf8",
      rimDark: "#0c4a6e",
      rimAccent: "#e0f2fe",
      plateLight: "#e0f2fe",
      plateDark: "#0284c7",
      rivet: "#ffffff",
      aura: "rgba(56, 189, 248, 0.75)",
      hoverAura: "rgba(186, 230, 253, 0.95)", // Completely icy blue/white
      ribbonLight: "#0284c7",
      ribbonDark: "#082f49",
      ribbonBorder: "#e0f2fe"
    }
  };

  const GEMS = {
    ruby: { light: "#fb7185", base: "#e11d48", dark: "#4c0519", glow: "#fda4af" },
    sapphire: { light: "#38bdf8", base: "#0284c7", dark: "#082f49", glow: "#bae6fd" },
    emerald: { light: "#34d399", base: "#059669", dark: "#064e3b", glow: "#a7f3d0" },
    gold: { light: "#fef08a", base: "#eab308", dark: "#451a03", glow: "#fef9c3" },
    cyan: { light: "#67e8f9", base: "#0891b2", dark: "#164e63", glow: "#cffafe" },
    darkBlue: { light: "#60a5fa", base: "#09314F", dark: "#020c17", glow: "#93c5fd" },
    diamond: { light: "#ffffff", base: "#0284c7", dark: "#031d36", glow: "#38bdf8" }
  };

  const isDiamond = tier === "diamond";
  const theme = THEMES[tier] || THEMES.gold;
  const gem = GEMS[isDiamond ? "diamond" : gemColor] || GEMS.ruby;

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none group transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size }}
    >
      {/* --- SVG MEDAL --- */}
      <div className="relative w-full aspect-[200/220] flex items-center justify-center">
        
        {/* Icy Blue Glow Aura */}
        {glow && (
          <div 
            className={`absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-500 ease-out opacity-70 group-hover:opacity-100 group-hover:scale-110 ${isDiamond && animated ? 'animate-pulse' : ''}`}
            style={{ 
              background: isDiamond 
                ? 'radial-gradient(circle, rgba(186, 230, 253, 0.85) 0%, rgba(56, 189, 248, 0.5) 45%, rgba(2, 132, 199, 0.2) 70%, transparent 100%)' 
                : theme.aura, 
              transform: 'scale(0.88)' 
            }}
          />
        )}

        <svg 
          viewBox="0 0 200 220" 
          className="w-full h-full overflow-visible drop-shadow-[0_14px_24px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Metallic / Bevel Gradients */}
            <linearGradient id={`${id}_rim`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.rimLight} />
              <stop offset="25%" stopColor={theme.rimBase} />
              <stop offset="70%" stopColor={theme.rimDark} />
              <stop offset="100%" stopColor={theme.rimAccent} />
            </linearGradient>

            <linearGradient id={`${id}_plate`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.plateLight} />
              <stop offset="45%" stopColor={theme.rimBase} />
              <stop offset="100%" stopColor={theme.plateDark} />
            </linearGradient>

            <radialGradient id={`${id}_gem`} cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={gem.light} />
              <stop offset="50%" stopColor={gem.base} />
              <stop offset="100%" stopColor={gem.dark} />
            </radialGradient>

            <linearGradient id={`${id}_ribbon`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.ribbonLight} />
              <stop offset="100%" stopColor={theme.ribbonDark} />
            </linearGradient>

            <linearGradient id={`${id}_wing`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.wingLight} />
              <stop offset="40%" stopColor={theme.wingBase} />
              <stop offset="100%" stopColor={theme.wingDark} />
            </linearGradient>

            <linearGradient id={`${id}_featherLight`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.wingLight} />
              <stop offset="50%" stopColor={theme.wingBase} />
              <stop offset="100%" stopColor={theme.wingDark} />
            </linearGradient>

            <linearGradient id={`${id}_featherDark`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.wingBase} />
              <stop offset="100%" stopColor={theme.wingDark} />
            </linearGradient>

            <linearGradient id={`${id}_crownBase`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.rimLight} />
              <stop offset="30%" stopColor={theme.rimAccent} />
              <stop offset="70%" stopColor={theme.rimBase} />
              <stop offset="100%" stopColor={theme.rimDark} />
            </linearGradient>

            {/* ============================================================ */}
            {/* DIAMOND FLUID GLASS OPTICAL SHADERS & CAUSTICS */}
            {/* ============================================================ */}
            
            {/* Translucent Frosted Glass Base with Optical Depth */}
            <linearGradient id={`${id}_glassBody`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#e0f2fe" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0.95" />
            </linearGradient>

            {/* Glass Facet Refraction Top-Lit */}
            <linearGradient id={`${id}_glassFacetTop`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>

            {/* Glass Facet Refraction Bottom-Shadowed */}
            <linearGradient id={`${id}_glassFacetBottom`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0.85" />
            </linearGradient>

            {/* 3D Glass Wing Crystal Top Facet */}
            <linearGradient id={`${id}_glassWingTop`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#e0f2fe" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
            </linearGradient>

            {/* 3D Glass Wing Crystal Bottom Facet */}
            <linearGradient id={`${id}_glassWingBottom`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing Neon Emblem Filter for Diamond */}
            <filter id={`${id}_neonGlow`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#38bdf8" floodOpacity="0.95" />
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ffffff" floodOpacity="1" />
            </filter>

            {/* Bevel Drop Shadow Filter */}
            <filter id={`${id}_shadow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#000" floodOpacity="0.7" />
            </filter>

            {/* ============================================================ */}
            {/* 3D SCULPTED VICTORY CUP / CHALICE GRADIENTS */}
            {/* ============================================================ */}
            <linearGradient id={`${id}_cupBody`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={theme.rimLight} />
              <stop offset="22%" stopColor={theme.rimAccent} />
              <stop offset="50%" stopColor={theme.rimBase} />
              <stop offset="85%" stopColor={theme.rimDark} />
              <stop offset="100%" stopColor={theme.rimLight} />
            </linearGradient>

            <linearGradient id={`${id}_cupPedestal`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.rimAccent} />
              <stop offset="45%" stopColor={theme.rimBase} />
              <stop offset="100%" stopColor={theme.rimDark} />
            </linearGradient>

            <radialGradient id={`${id}_cupHighlight`} cx="35%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="40%" stopColor={theme.rimAccent} stopOpacity="0.6" />
              <stop offset="100%" stopColor={theme.rimBase} stopOpacity="0" />
            </radialGradient>

            {/* Diamond Diagonal Ice Caustic Shimmer Gradient */}
            <linearGradient id={`${id}_diamondSweep`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="30%" stopColor="#bae6fd" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Diamond Inner Plate ClipPath */}
            <clipPath id={`${id}_diamondPlateClip`}>
              <polygon points="100,34 152,62 152,128 100,156 48,128 48,62" />
            </clipPath>

            {/* Pure GPU-Accelerated Diamond Glistening & Carat Scintillation Animations */}
            {isDiamond && animated && (
              <style>{`
                @keyframes ${id}_sparkle_twinkle {
                  0%, 100% {
                    transform: scale(0) rotate(0deg);
                    opacity: 0;
                  }
                  20% {
                    transform: scale(0.25) rotate(15deg);
                    opacity: 0.35;
                  }
                  45% {
                    transform: scale(1.35) rotate(45deg);
                    opacity: 1;
                    filter: drop-shadow(0 0 5px #ffffff) drop-shadow(0 0 10px #38bdf8);
                  }
                  55% {
                    transform: scale(1.1) rotate(55deg);
                    opacity: 0.9;
                  }
                  75% {
                    transform: scale(0.25) rotate(80deg);
                    opacity: 0.25;
                  }
                  90% {
                    transform: scale(0) rotate(90deg);
                    opacity: 0;
                  }
                }
                @keyframes ${id}_shimmer_sweep {
                  0% {
                    transform: translateX(-120px) rotate(-35deg);
                    opacity: 0;
                  }
                  15% {
                    opacity: 1;
                  }
                  50% {
                    transform: translateX(180px) rotate(-35deg);
                    opacity: 0.95;
                  }
                  58%, 100% {
                    transform: translateX(180px) rotate(-35deg);
                    opacity: 0;
                  }
                }
                @keyframes ${id}_micro_ice_float {
                  0% {
                    transform: translateY(0px) scale(0.5);
                    opacity: 0;
                  }
                  50% {
                    transform: translateY(-9px) scale(1.2);
                    opacity: 0.85;
                  }
                  100% {
                    transform: translateY(-18px) scale(0.3);
                    opacity: 0;
                  }
                }
                .${id}_sparkle_elem {
                  transform-origin: 0px 0px;
                  animation: ${id}_sparkle_twinkle 2.8s infinite cubic-bezier(0.4, 0, 0.2, 1);
                }
                .${id}_shimmer_bar {
                  animation: ${id}_shimmer_sweep 3.5s infinite ease-in-out;
                  transform-origin: 100px 95px;
                }
                .${id}_ice_micro {
                  animation: ${id}_micro_ice_float 3s infinite ease-in-out;
                }
              `}</style>
            )}
          </defs>

          {/* ============================================================ */}
          {/* LAYER 1: AUTHENTIC FEATHERED AVIAN WINGS (Flight Plumage) */}
          {/* ============================================================ */}
          <g filter={`url(#${id}_shadow)`}>
            {/* Structural Wing Shoulder Armatures (Anchoring to hexagon lateral chassis) */}
            <path 
              d="M 44,58 C 30,66 26,90 28,124 L 44,132 Z" 
              fill={`url(#${id}_rim)`} 
            />
            <path 
              d="M 156,58 C 170,66 174,90 172,124 L 156,132 Z" 
              fill={`url(#${id}_rim)`} 
            />

            {/* --- LEFT WING: Sweeping Feathered Plumage --- */}
            <g>
              {/* Feather 1: High Grand Flight Feather (Sweeping Up and Out) */}
              <path 
                d="M 42,60 C 28,34 10,22 -14,20 C 4,32 20,48 36,66 Z" 
                fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_featherLight)`} 
              />
              <path 
                d="M 38,62 C 16,42 2,30 -14,20 C 4,34 20,50 36,66 Z" 
                fill={isDiamond ? `url(#${id}_glassWingBottom)` : `url(#${id}_featherDark)`} 
                opacity="0.85"
              />
              {/* Quill / Rachis Line */}
              <path 
                d="M 40,61 C 20,40 6,28 -14,20" 
                stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                strokeWidth={isDiamond ? "1.8" : "1.4"} 
                strokeLinecap="round" 
                fill="none" 
              />

              {/* Feather 2: Second Primary Flight Feather */}
              <path 
                d="M 36,66 C 14,50 -6,42 -24,48 C -4,60 14,72 34,80 Z" 
                fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_wing)`} 
              />
              <path 
                d="M 34,70 C 10,58 -8,52 -24,48 C -4,62 14,74 34,80 Z" 
                fill={isDiamond ? `url(#${id}_glassWingBottom)` : `url(#${id}_featherDark)`} 
                opacity="0.75"
              />
              <path 
                d="M 36,68 C 12,56 -4,48 -24,48" 
                stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                strokeWidth="1.4" 
                strokeLinecap="round" 
                fill="none" 
              />

              {/* Feather 3: Mid-Wing Power Feather */}
              <path 
                d="M 34,80 C 12,72 -6,72 -22,78 C -4,90 14,92 34,96 Z" 
                fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_featherLight)`} 
              />
              <path 
                d="M 32,84 C 10,80 -6,78 -22,78 C -4,90 14,92 34,96 Z" 
                fill={isDiamond ? `url(#${id}_glassWingBottom)` : `url(#${id}_featherDark)`} 
                opacity="0.75"
              />
              <path 
                d="M 34,82 C 12,77 -2,75 -22,78" 
                stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                strokeWidth="1.3" 
                strokeLinecap="round" 
                fill="none" 
              />

              {/* Feather 4: Lower Secondary Feather */}
              <path 
                d="M 34,96 C 16,96 2,98 -12,104 C 2,112 18,114 36,116 Z" 
                fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_wing)`} 
              />
              <path 
                d="M 34,99 C 14,102 0,104 -12,104 C 2,112 18,114 36,116 Z" 
                fill={isDiamond ? `url(#${id}_glassWingBottom)` : `url(#${id}_featherDark)`} 
                opacity="0.75"
              />
              <path 
                d="M 35,98 C 16,100 4,102 -12,104" 
                stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                strokeWidth="1.1" 
                strokeLinecap="round" 
                fill="none" 
              />

              {/* Feather 5: Bottom Plumage (Gold, Platinum, Diamond) */}
              {(tier === "gold" || tier === "platinum" || isDiamond) && (
                <>
                  <path 
                    d="M 36,116 C 22,118 12,120 2,124 C 14,128 28,128 40,126 Z" 
                    fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_featherLight)`} 
                  />
                  <path 
                    d="M 37,118 C 24,120 14,122 2,124" 
                    stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                    strokeWidth="1.0" 
                    strokeLinecap="round" 
                    fill="none" 
                  />
                </>
              )}
            </g>

            {/* --- RIGHT WING: Symmetrical Sweeping Feathered Plumage --- */}
            <g>
              {/* Feather 1: High Grand Flight Feather */}
              <path 
                d="M 158,60 C 172,34 190,22 214,20 C 196,32 180,48 164,66 Z" 
                fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_featherLight)`} 
              />
              <path 
                d="M 162,62 C 184,42 198,30 214,20 C 196,34 180,50 164,66 Z" 
                fill={isDiamond ? `url(#${id}_glassWingBottom)` : `url(#${id}_featherDark)`} 
                opacity="0.85"
              />
              <path 
                d="M 160,61 C 180,40 194,28 214,20" 
                stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                strokeWidth={isDiamond ? "1.8" : "1.4"} 
                strokeLinecap="round" 
                fill="none" 
              />

              {/* Feather 2: Second Primary Flight Feather */}
              <path 
                d="M 164,66 C 186,50 206,42 224,48 C 204,60 186,72 166,80 Z" 
                fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_wing)`} 
              />
              <path 
                d="M 166,70 C 190,58 208,52 224,48 C 204,62 186,74 166,80 Z" 
                fill={isDiamond ? `url(#${id}_glassWingBottom)` : `url(#${id}_featherDark)`} 
                opacity="0.75"
              />
              <path 
                d="M 164,68 C 188,56 204,48 224,48" 
                stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                strokeWidth="1.4" 
                strokeLinecap="round" 
                fill="none" 
              />

              {/* Feather 3: Mid-Wing Power Feather */}
              <path 
                d="M 166,80 C 188,72 206,72 222,78 C 204,90 186,92 166,96 Z" 
                fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_featherLight)`} 
              />
              <path 
                d="M 168,84 C 190,80 206,78 222,78 C 204,90 186,92 166,96 Z" 
                fill={isDiamond ? `url(#${id}_glassWingBottom)` : `url(#${id}_featherDark)`} 
                opacity="0.75"
              />
              <path 
                d="M 166,82 C 188,77 202,75 222,78" 
                stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                strokeWidth="1.3" 
                strokeLinecap="round" 
                fill="none" 
              />

              {/* Feather 4: Lower Secondary Feather */}
              <path 
                d="M 166,96 C 184,96 198,98 212,104 C 198,112 182,114 164,116 Z" 
                fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_wing)`} 
              />
              <path 
                d="M 166,99 C 186,102 200,104 212,104 C 198,112 182,114 164,116 Z" 
                fill={isDiamond ? `url(#${id}_glassWingBottom)` : `url(#${id}_featherDark)`} 
                opacity="0.75"
              />
              <path 
                d="M 165,98 C 184,100 196,102 212,104" 
                stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                strokeWidth="1.1" 
                strokeLinecap="round" 
                fill="none" 
              />

              {/* Feather 5: Bottom Plumage */}
              {(tier === "gold" || tier === "platinum" || isDiamond) && (
                <>
                  <path 
                    d="M 164,116 C 178,118 188,120 198,124 C 186,128 172,128 160,126 Z" 
                    fill={isDiamond ? `url(#${id}_glassWingTop)` : `url(#${id}_featherLight)`} 
                  />
                  <path 
                    d="M 163,118 C 176,120 186,122 198,124" 
                    stroke={isDiamond || tier === "platinum" ? "#ffffff" : theme.rimAccent} 
                    strokeWidth="1.0" 
                    strokeLinecap="round" 
                    fill="none" 
                  />
                </>
              )}
            </g>
          </g>

          {/* ============================================================ */}
          {/* LAYER 2: HANGING NOTCHED BOTTOM RIBBONS */}
          {/* ============================================================ */}
          <g filter={`url(#${id}_shadow)`}>
            {/* Left Ribbon Tail */}
            <path 
              d="M 75,145 L 58,198 L 75,186 L 92,198 L 86,150 Z" 
              fill={`url(#${id}_ribbon)`} 
              stroke={theme.ribbonBorder} 
              strokeWidth="2.5" 
            />
            {/* Right Ribbon Tail */}
            <path 
              d="M 125,145 L 142,198 L 125,186 L 108,198 L 114,150 Z" 
              fill={`url(#${id}_ribbon)`} 
              stroke={theme.ribbonBorder} 
              strokeWidth="2.5" 
            />
            {/* Center Fold */}
            <path 
              d="M 84,150 L 116,150 L 100,178 Z" 
              fill={theme.ribbonDark} 
            />
          </g>

          {/* ============================================================ */}
          {/* LAYER 3: 3D MULTI-FACETED BEVELED FRAME (FLUID GLASS SHELL) */}
          {/* ============================================================ */}
          <g filter={`url(#${id}_shadow)`}>
            
            {/* Outer Hexagon Bevel (Faceted Refractive Chamfer) */}
            <polygon 
              points="100,28 158,58 158,132 100,162 42,132 42,58" 
              fill={isDiamond ? `url(#${id}_glassBody)` : `url(#${id}_rim)`} 
            />

            {/* DIAMOND EXCLUSIVE: 3D Faceted Glass Chamfers (Prismatic Bevels) */}
            {isDiamond && (
              <g>
                {/* Top-Left Chamfer (Intense Specular White) */}
                <polygon points="100,28 42,58 48,62 100,34" fill={`url(#${id}_glassFacetTop)`} />
                {/* Top-Right Chamfer (Refraction Glare) */}
                <polygon points="100,28 158,58 152,62 100,34" fill={`url(#${id}_glassFacetTop)`} opacity="0.8" />
                {/* Bottom-Left Chamfer (Deep Refraction) */}
                <polygon points="42,132 100,162 100,156 48,128" fill={`url(#${id}_glassFacetBottom)`} />
                {/* Bottom-Right Chamfer (Deep Caustic Shadow) */}
                <polygon points="158,132 100,162 100,156 152,128" fill={`url(#${id}_glassFacetBottom)`} />
              </g>
            )}

            {/* Inner Metallic / Frosted Liquid Glass Plate */}
            <polygon 
              points="100,34 152,62 152,128 100,156 48,128 48,62" 
              fill={isDiamond ? `url(#${id}_glassBody)` : `url(#${id}_plate)`} 
              opacity={isDiamond ? "0.9" : "1"}
            />

            {/* Filigree / Inner Crystal Edge */}
            {tier === "gold" && (
              <polygon 
                points="100,38 148,64 148,124 100,150 52,124 52,64" 
                fill="none" 
                stroke="#fffbeb" 
                strokeWidth="1" 
                strokeOpacity="0.5" 
                strokeDasharray="4 2" 
              />
            )}
            {tier === "platinum" && (
              <polygon 
                points="100,38 148,64 148,124 100,150 52,124 52,64" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="1.5" 
                strokeOpacity="0.75" 
              />
            )}
            {isDiamond && (
              /* High-Gloss Liquid Glass Inner Border */
              <polygon 
                points="100,38 148,64 148,124 100,150 52,124 52,64" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="1.8" 
                strokeOpacity="0.9" 
              />
            )}

            {/* Shimmering Liquid Ice Glaze Sweep across Diamond Core */}
            {isDiamond && animated && (
              <g clipPath={`url(#${id}_diamondPlateClip)`} className="pointer-events-none">
                <rect 
                  x="-30" 
                  y="20" 
                  width="45" 
                  height="160" 
                  fill={`url(#${id}_diamondSweep)`} 
                  className={`${id}_shimmer_bar`} 
                />
              </g>
            )}

            {/* Corner Screws / Prisms (6 Vertices) */}
            <circle cx="100" cy="40" r="3.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="1" />
            <line x1="98" y1="40" x2="102" y2="40" stroke={theme.rimDark} strokeWidth="0.8" />

            <circle cx="145" cy="65" r="3.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="1" />
            <line x1="143" y1="64" x2="147" y2="66" stroke={theme.rimDark} strokeWidth="0.8" />

            <circle cx="145" cy="125" r="3.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="1" />
            <line x1="143" y1="124" x2="147" y2="126" stroke={theme.rimDark} strokeWidth="0.8" />

            <circle cx="100" cy="150" r="3.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="1" />
            <line x1="98" y1="150" x2="102" y2="150" stroke={theme.rimDark} strokeWidth="0.8" />

            <circle cx="55" cy="125" r="3.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="1" />
            <line x1="53" y1="126" x2="57" y2="124" stroke={theme.rimDark} strokeWidth="0.8" />

            <circle cx="55" cy="65" r="3.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="1" />
            <line x1="53" y1="64" x2="57" y2="66" stroke={theme.rimDark} strokeWidth="0.8" />
          </g>

          {/* ============================================================ */}
          {/* LAYER 3B: WING SHOULDER MOUNTS & COVERT PLUMAGE SCALES */}
          {/* Physically clasping over lateral hexagon bevels */}
          {/* ============================================================ */}
          <g filter={`url(#${id}_shadow)`}>
            {/* Left Shoulder Coverts (Clasping onto Hexagon's Left Bevel) */}
            <path 
              d="M 44,56 C 30,64 30,126 44,132 L 40,126 C 28,114 28,74 40,62 Z" 
              fill={`url(#${id}_rim)`} 
            />
            {/* Overlapping Covert Feather Plumage Scales */}
            <path 
              d="M 44,58 C 30,62 28,72 44,76 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_featherLight)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />
            <path 
              d="M 44,76 C 28,82 28,92 44,96 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_wing)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />
            <path 
              d="M 44,96 C 30,102 30,112 44,116 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_featherLight)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />
            <path 
              d="M 44,116 C 34,120 34,126 44,130 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetBottom)` : `url(#${id}_featherDark)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />
            {/* Shoulder Anchor Fastener Rivets */}
            <circle cx="39" cy="68" r="2.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="0.8" />
            <circle cx="39" cy="118" r="2.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="0.8" />

            {/* Right Shoulder Coverts (Clasping onto Hexagon's Right Bevel) */}
            <path 
              d="M 156,56 C 170,64 170,126 156,132 L 160,126 C 172,114 172,74 160,62 Z" 
              fill={`url(#${id}_rim)`} 
            />
            <path 
              d="M 156,58 C 170,62 172,72 156,76 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_featherLight)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />
            <path 
              d="M 156,76 C 172,82 172,92 156,96 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_wing)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />
            <path 
              d="M 156,96 C 170,102 170,112 156,116 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_featherLight)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />
            <path 
              d="M 156,116 C 166,120 166,126 156,130 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetBottom)` : `url(#${id}_featherDark)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />
            {/* Shoulder Anchor Fastener Rivets */}
            <circle cx="161" cy="68" r="2.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="0.8" />
            <circle cx="161" cy="118" r="2.2" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="0.8" />
          </g>

          {/* ============================================================ */}
          {/* LAYER 3C: IMPERIAL ATTACHED CROWN (Anchored to Hexagon Crest) */}
          {/* ============================================================ */}
          <g filter={`url(#${id}_shadow)`}>
            {/* 1. Base Headband Arch (Conforming precisely to roof slope of hexagon) */}
            <path 
              d="M 68,44 L 100,28 L 132,44 L 128,36 L 100,20 L 72,36 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_crownBase)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />

            {/* 2. Front Clasp Bracket (Clamping over the top hexagon apex) */}
            <path 
              d="M 74,44 L 100,31 L 126,44 L 122,49 L 100,36 L 78,49 Z" 
              fill={`url(#${id}_rim)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.6" 
            />
            {/* Clasp Mounting Anchor Rivets */}
            <circle cx="84" cy="43" r="1.8" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="0.6" />
            <circle cx="100" cy="33.5" r="1.8" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="0.6" />
            <circle cx="116" cy="43" r="1.8" fill={theme.rivet} stroke={theme.rimDark} strokeWidth="0.6" />

            {/* 3. Crown Spires (Rising above the Headband) */}
            {/* Central Imperial Spire / Fleur-de-lis Pinnacle */}
            <path 
              d="M 94,22 C 92,15 95,8 100,2 C 105,8 108,15 106,22 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_crownBase)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.8" 
            />
            {/* Central Spine Specular Highlight */}
            <line 
              x1="100" 
              y1="2" 
              x2="100" 
              y2="22" 
              stroke="#ffffff" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
            />
            {/* Top Pinnacle Finial Pearl / Diamond */}
            <circle 
              cx="100" 
              cy="2" 
              r="2.2" 
              fill="#ffffff" 
              stroke={theme.rimLight} 
              strokeWidth="0.6" 
            />

            {/* Left Flanking Spire */}
            <path 
              d="M 84,29 C 82,20 86,13 90,7 C 93,14 94,21 93,25 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_crownBase)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.6" 
            />
            <circle cx="90" cy="7" r="1.8" fill="#ffffff" stroke={theme.rimLight} strokeWidth="0.5" />

            {/* Right Flanking Spire */}
            <path 
              d="M 107,25 C 106,21 107,14 110,7 C 114,13 118,20 116,29 Z" 
              fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_crownBase)`} 
              stroke={theme.rimAccent} 
              strokeWidth="0.6" 
            />
            <circle cx="110" cy="7" r="1.8" fill="#ffffff" stroke={theme.rimLight} strokeWidth="0.5" />

            {/* Outer Finials (Gold, Platinum, Diamond) */}
            {(tier !== "bronze") && (
              <>
                <path 
                  d="M 74,37 C 72,29 76,21 81,16 C 83,22 84,28 83,33 Z" 
                  fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_crownBase)`} 
                  stroke={theme.rimAccent} 
                  strokeWidth="0.5" 
                />
                <circle cx="81" cy="16" r="1.5" fill="#ffffff" />

                <path 
                  d="M 117,33 C 116,28 117,22 119,16 C 124,21 128,29 126,37 Z" 
                  fill={isDiamond ? `url(#${id}_glassFacetTop)` : `url(#${id}_crownBase)`} 
                  stroke={theme.rimAccent} 
                  strokeWidth="0.5" 
                />
                <circle cx="119" cy="16" r="1.5" fill="#ffffff" />
              </>
            )}

            {/* 4. Imperial Brooch Gem (Mounting directly into center of Crown Headband) */}
            <circle 
              cx="100" 
              cy="24" 
              r="4.8" 
              fill={theme.rimDark} 
              stroke={theme.rimAccent} 
              strokeWidth="1" 
            />
            <circle 
              cx="100" 
              cy="24" 
              r="3.4" 
              fill={`url(#${id}_gem)`} 
            />
            {/* Brooch Sparkle Glint */}
            <circle cx="98.8" cy="22.8" r="1.1" fill="#ffffff" />
            <line x1="96" y1="24" x2="104" y2="24" stroke="#ffffff" strokeWidth="0.6" opacity="0.8" />
            <line x1="100" y1="20" x2="100" y2="28" stroke="#ffffff" strokeWidth="0.6" opacity="0.8" />
          </g>

          {/* ============================================================ */}
          {/* LAYER 4: INSET GEM CAVITY & OPTICAL CRYSTAL CORE */}
          {/* ============================================================ */}
          <g>
            {/* Gem Inset Cavity Border */}
            <polygon 
              points="100,48 138,68 138,122 100,142 62,122 62,68" 
              fill={theme.rimDark} 
            />

            {/* Gem Crystal Core */}
            <polygon 
              points="100,50 136,69 136,121 100,140 64,121 64,69" 
              fill={`url(#${id}_gem)`} 
              stroke={gem.glow}
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />

            {/* Liquid Glass Specular Reflection Glare (Curved Top Refraction) */}
            <path 
              d="M 64,69 L 100,50 L 136,69 L 136,88 Q 100,112 64,88 Z" 
              fill="#ffffff" 
              opacity={isDiamond ? "0.45" : "0.3"} 
            />

            {/* Diagonal Prismatic Glass Sheen Sweep (Diamond Exclusive) */}
            {isDiamond && (
              <path 
                d="M 75,55 L 95,50 L 125,135 L 105,140 Z" 
                fill="#ffffff" 
                opacity="0.2" 
              />
            )}

            {/* Bottom Specular Glass Rim */}
            <path 
              d="M 64,121 L 100,140 L 136,121" 
              stroke="#ffffff" 
              strokeWidth="1.8" 
              strokeOpacity="0.65" 
              fill="none" 
            />
          </g>

          {/* ============================================================ */}
          {/* LAYER 5: 3D SCULPTED VICTORY CUP OR CUSTOM ICON */}
          {/* ============================================================ */}
          <g 
            transform="translate(100, 95)" 
            filter={isDiamond ? `url(#${id}_neonGlow)` : `url(#${id}_shadow)`}
          >
            {useTrophyCup || !Icon ? (
              /* HANDCRAFTED 3D SCULPTED VICTORY CHALICE / CUP OF TRIUMPH */
              <g id={`${id}_victory_chalice`}>
                {/* 1. Stepped Pedestal Base */}
                {/* Lower Plinth */}
                <rect 
                  x="-12" 
                  y="16" 
                  width="24" 
                  height="4.5" 
                  rx="1.5" 
                  fill={`url(#${id}_cupPedestal)`} 
                  stroke={theme.rimAccent} 
                  strokeWidth="0.8" 
                />
                {/* Stepped Mid-Tier */}
                <polygon 
                  points="-8,16 8,16 6,13 -6,13" 
                  fill={`url(#${id}_cupBody)`} 
                />
                {/* Fluted Stem */}
                <path 
                  d="M -3.5,13 L -2.5,7 L 2.5,7 L 3.5,13 Z" 
                  fill={`url(#${id}_cupBody)`} 
                />

                {/* 2. Twin Sculpted Scroll Loop Handles */}
                {/* Left Handle Outer */}
                <path 
                  d="M -13,-9 C -24,-9 -24,4 -10,4 L -9,2 C -18,2 -18,-7 -11,-7 Z" 
                  fill={`url(#${id}_cupBody)`} 
                  stroke={theme.rimAccent} 
                  strokeWidth="0.6" 
                />
                {/* Right Handle Outer */}
                <path 
                  d="M 13,-9 C 24,-9 24,4 10,4 L 9,2 C 18,2 18,-7 11,-7 Z" 
                  fill={`url(#${id}_cupBody)`} 
                  stroke={theme.rimAccent} 
                  strokeWidth="0.6" 
                />

                {/* 3. Flared Chalice Body */}
                <path 
                  d="M -15,-10 C -15,5 0,8 0,8 C 0,8 15,5 15,-10 Z" 
                  fill={`url(#${id}_cupBody)`} 
                  stroke={theme.rimAccent} 
                  strokeWidth="0.8" 
                />
                {/* Specular Radial Glare on Chalice Belly */}
                <path 
                  d="M -13,-9 C -13,3 -2,6 0,6 C 2,6 13,3 13,-9 Z" 
                  fill={`url(#${id}_cupHighlight)`} 
                />

                {/* 4. Polished Chalice Top Rim */}
                <ellipse 
                  cx="0" 
                  cy="-10" 
                  rx="15" 
                  ry="3.8" 
                  fill={`url(#${id}_cupBody)`} 
                  stroke="#ffffff" 
                  strokeWidth="0.8" 
                />
                {/* Inner Cup Opening Shadow */}
                <ellipse 
                  cx="0" 
                  cy="-10" 
                  rx="12.5" 
                  ry="2.4" 
                  fill={theme.rimDark} 
                />

                {/* 5. Embossed Five-Point Star of Distinction */}
                <polygon 
                  points="0,-6 1.8,-1.5 6.5,-1.5 2.8,1.2 4.2,5.5 0,2.8 -4.2,5.5 -2.8,1.2 -6.5,-1.5 -1.8,-1.5" 
                  fill={isDiamond ? "#ffffff" : "#ffffff"} 
                  stroke={theme.rimLight} 
                  strokeWidth="0.5" 
                  opacity="0.95" 
                />
                {/* Specular Glint on Top-Left Cup Rim */}
                <circle cx="-10" cy="-11" r="1.5" fill="#ffffff" filter={`url(#${id}_neonGlow)`} />
              </g>
            ) : (
              /* Fallback to custom provided Icon component */
              <foreignObject x="-24" y="-24" width="48" height="48">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <Icon 
                    size={34} 
                    strokeWidth={2.5} 
                    color={isDiamond ? "#ffffff" : theme.rimLight} 
                  />
                </div>
              </foreignObject>
            )}
          </g>

          {/* ============================================================ */}
          {/* LAYER 7: CARATED DIAMOND ICE SPARKLES & SCINTILLATION FLURRIES */}
          {/* Glistening diamond carats sparking organically across facets */}
          {/* ============================================================ */}
          {isDiamond && animated && (
            <g className="pointer-events-none">
              {/* 1. Crown Apex Carat Glint (x=100, y=2) */}
              <g transform="translate(100, 2)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '0s' }}>
                  <path d="M 0,-9 Q 0,0 9,0 Q 0,0 0,9 Q 0,0 -9,0 Q 0,0 0,-9 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.6" fill="#ffffff" />
                  <circle cx="0" cy="0" r="3.6" fill="#38bdf8" opacity="0.6" />
                  <line x1="0" y1="-12" x2="0" y2="12" stroke="#ffffff" strokeWidth="0.7" />
                  <line x1="-12" y1="0" x2="12" y2="0" stroke="#ffffff" strokeWidth="0.7" />
                </g>
              </g>

              {/* 2. Left Wing High Flight Feather Tip (x=-14, y=20) */}
              <g transform="translate(-14, 20)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '0.4s' }}>
                  <path d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 -8,0 Q 0,0 0,-8 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.4" fill="#ffffff" />
                  <line x1="0" y1="-10" x2="0" y2="10" stroke="#bae6fd" strokeWidth="0.6" />
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#bae6fd" strokeWidth="0.6" />
                </g>
              </g>

              {/* 3. Right Wing High Flight Feather Tip (x=214, y=20) */}
              <g transform="translate(214, 20)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '1.2s' }}>
                  <path d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 -8,0 Q 0,0 0,-8 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.4" fill="#ffffff" />
                  <line x1="0" y1="-10" x2="0" y2="10" stroke="#bae6fd" strokeWidth="0.6" />
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#bae6fd" strokeWidth="0.6" />
                </g>
              </g>

              {/* 4. Crown Central Brooch Jewel (x=100, y=24) */}
              <g transform="translate(100, 24)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '0.75s' }}>
                  <path d="M 0,-9 Q 0,0 9,0 Q 0,0 0,9 Q 0,0 -9,0 Q 0,0 0,-9 Z" fill="#ffffff" />
                  <polygon points="0,-4 3,0 0,4 -3,0" fill="#38bdf8" />
                  <circle cx="0" cy="0" r="1.6" fill="#ffffff" />
                  <line x1="0" y1="-12" x2="0" y2="12" stroke="#ffffff" strokeWidth="0.7" />
                  <line x1="-12" y1="0" x2="12" y2="0" stroke="#ffffff" strokeWidth="0.7" />
                </g>
              </g>

              {/* 5. Left Shoulder Crystal Chamfer (x=42, y=58) */}
              <g transform="translate(42, 58)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '1.9s' }}>
                  <path d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.3" fill="#ffffff" />
                  <line x1="-8" y1="-8" x2="8" y2="8" stroke="#bae6fd" strokeWidth="0.5" />
                  <line x1="-8" y1="8" x2="8" y2="-8" stroke="#bae6fd" strokeWidth="0.5" />
                </g>
              </g>

              {/* 6. Right Shoulder Crystal Chamfer (x=158, y=58) */}
              <g transform="translate(158, 58)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '0.95s' }}>
                  <path d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.3" fill="#ffffff" />
                  <line x1="-8" y1="-8" x2="8" y2="8" stroke="#bae6fd" strokeWidth="0.5" />
                  <line x1="-8" y1="8" x2="8" y2="-8" stroke="#bae6fd" strokeWidth="0.5" />
                </g>
              </g>

              {/* 7. Victory Chalice Left Rim Glint (x=90, y=85) */}
              <g transform="translate(90, 85)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '1.5s' }}>
                  <path d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.3" fill="#ffffff" />
                </g>
              </g>

              {/* 8. Victory Chalice Star Brooch (x=100, y=95) */}
              <g transform="translate(100, 95)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '2.3s' }}>
                  <path d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 -8,0 Q 0,0 0,-8 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.4" fill="#ffffff" />
                  <line x1="0" y1="-10" x2="0" y2="10" stroke="#ffffff" strokeWidth="0.6" />
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#ffffff" strokeWidth="0.6" />
                </g>
              </g>

              {/* 9. Left Wing Mid Feather Tip (x=-22, y=78) */}
              <g transform="translate(-22, 78)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '1.65s' }}>
                  <path d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
                </g>
              </g>

              {/* 10. Right Wing Mid Feather Tip (x=222, y=78) */}
              <g transform="translate(222, 78)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '0.2s' }}>
                  <path d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
                </g>
              </g>

              {/* 11. Bottom Crystal Hexagon Apex (x=100, y=162) */}
              <g transform="translate(100, 162)">
                <g className={`${id}_sparkle_elem`} style={{ animationDelay: '1.35s' }}>
                  <path d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
                </g>
              </g>

              {/* 12. Floating Micro Ice Crystals around the Wings */}
              <g transform="translate(16, 45)" className={`${id}_ice_micro`} style={{ animationDelay: '0.3s' }}>
                <circle cx="0" cy="0" r="1.4" fill="#ffffff" opacity="0.9" />
              </g>
              <g transform="translate(184, 45)" className={`${id}_ice_micro`} style={{ animationDelay: '1.5s' }}>
                <circle cx="0" cy="0" r="1.4" fill="#ffffff" opacity="0.9" />
              </g>
              <g transform="translate(-4, 94)" className={`${id}_ice_micro`} style={{ animationDelay: '0.8s' }}>
                <circle cx="0" cy="0" r="1.2" fill="#bae6fd" opacity="0.85" />
              </g>
              <g transform="translate(204, 94)" className={`${id}_ice_micro`} style={{ animationDelay: '2.1s' }}>
                <circle cx="0" cy="0" r="1.2" fill="#bae6fd" opacity="0.85" />
              </g>
              <g transform="translate(60, 142)" className={`${id}_ice_micro`} style={{ animationDelay: '1.2s' }}>
                <circle cx="0" cy="0" r="1.3" fill="#ffffff" opacity="0.9" />
              </g>
              <g transform="translate(140, 142)" className={`${id}_ice_micro`} style={{ animationDelay: '2.5s' }}>
                <circle cx="0" cy="0" r="1.3" fill="#ffffff" opacity="0.9" />
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* --- TEXT LABELS --- */}
      {(title || subtitle) && (
        <div className="mt-3 text-center">
          {title && (
            <h4 className={`font-black text-xs sm:text-sm uppercase tracking-wider line-clamp-1 ${
              isDiamond 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-cyan-200 drop-shadow-[0_2px_8px_rgba(56,189,248,0.6)]' 
                : 'text-gray-800 dark:text-white'
            }`}>
              {title}
            </h4>
          )}
          {subtitle && (
            <p className={`text-[10px] font-semibold tracking-wide ${
              isDiamond ? 'text-sky-400 font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
