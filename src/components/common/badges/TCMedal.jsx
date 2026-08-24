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
  subtitle = ""
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
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-500 ease-out opacity-70 group-hover:opacity-100 group-hover:scale-110"
            style={{ 
              background: isDiamond 
                ? 'radial-gradient(circle, rgba(186, 230, 253, 0.8) 0%, rgba(56, 189, 248, 0.45) 50%, rgba(2, 132, 199, 0.15) 75%, transparent 100%)' 
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
          </defs>

          {/* ============================================================ */}
          {/* LAYER 1: BACK ACCENTS & WINGS (Attached firmly behind frame) */}
          {/* ============================================================ */}
          
          {/* --- BRONZE: 8-Pointed Starburst Backplate --- */}
          {tier === "bronze" && (
            <g fill={`url(#${id}_wing)`} filter={`url(#${id}_shadow)`}>
              <polygon points="100,12 120,42 162,32 145,72 188,95 145,118 162,158 120,148 100,178 80,148 38,158 55,118 12,95 55,72 38,32 80,42" />
            </g>
          )}

          {/* --- SILVER & GOLD: 3 Sleek Sculpted Metallic Wings --- */}
          {(tier === "silver" || tier === "gold") && (
            <g fill={`url(#${id}_wing)`} filter={`url(#${id}_shadow)`}>
              {/* Left Wing */}
              <path d="M 52,62 C 22,50 14,64 8,82 C 24,85 40,78 52,85 Z" />
              <path d="M 50,80 C 20,74 14,92 10,108 C 26,108 40,98 50,105 Z" />
              <path d="M 50,100 C 26,98 22,120 20,130 C 34,124 42,116 50,122 Z" />

              {/* Right Wing */}
              <path d="M 148,62 C 178,50 186,64 192,82 C 176,85 160,78 148,85 Z" />
              <path d="M 150,80 C 180,74 186,92 190,108 C 174,108 160,98 150,105 Z" />
              <path d="M 150,100 C 174,98 178,120 180,130 C 166,124 158,116 150,122 Z" />

              {/* Extra Gold Texture: Wing Ribbing */}
              {tier === "gold" && (
                <g fill="#fef08a" opacity="0.6">
                  <path d="M 46,70 Q 25,65 14,80 Q 30,76 46,74 Z" />
                  <path d="M 44,88 Q 24,84 16,104 Q 30,100 44,92 Z" />
                  <path d="M 154,70 Q 175,65 186,80 Q 170,76 154,74 Z" />
                  <path d="M 156,88 Q 176,84 184,104 Q 170,100 156,92 Z" />
                  <polygon points="100,20 106,30 94,30" fill={theme.rimLight} />
                </g>
              )}
            </g>
          )}

          {/* --- PLATINUM: 3 Grand Cybernetic Crystal Wings --- */}
          {tier === "platinum" && (
            <g fill={`url(#${id}_wing)`} filter={`url(#${id}_shadow)`}>
              {/* Top Crown Spikes */}
              <polygon points="100,16 108,30 92,30" fill="#ffffff" />
              <polygon points="84,22 92,32 78,32" fill={`url(#${id}_plate)`} />
              <polygon points="116,22 122,32 108,32" fill={`url(#${id}_plate)`} />

              {/* Left Wings */}
              <path d="M 52,56 C 20,38 8,52 -4,70 C 14,78 36,70 52,78 Z" />
              <path d="M 50,76 C 16,68 4,88 -8,104 C 12,110 34,98 50,100 Z" />
              <path d="M 48,98 C 18,98 8,120 4,134 C 20,136 34,120 48,122 Z" />

              {/* Right Wings */}
              <path d="M 148,56 C 180,38 192,52 204,70 C 186,78 164,70 148,78 Z" />
              <path d="M 150,76 C 184,68 196,88 208,104 C 188,110 166,98 150,100 Z" />
              <path d="M 152,98 C 182,98 192,120 196,134 C 180,136 166,120 152,122 Z" />
            </g>
          )}

          {/* --- DIAMOND: 5 Grand 3D Faceted Liquid Glass Wings on each side --- */}
          {isDiamond && (
            <g filter={`url(#${id}_shadow)`}>
              {/* Grand Diamond Tiara Crown (3D Faceted Glass) */}
              <polygon points="100,4 108,26 92,26" fill={`url(#${id}_glassFacetTop)`} />
              <polygon points="80,12 90,28 74,26" fill={`url(#${id}_glassFacetBottom)`} />
              <polygon points="120,12 126,26 110,28" fill={`url(#${id}_glassFacetBottom)`} />
              <polygon points="62,20 74,32 58,30" fill={`url(#${id}_glassFacetTop)`} />
              <polygon points="138,20 142,30 126,32" fill={`url(#${id}_glassFacetTop)`} />
              {/* Crown Brilliant Diamond Center */}
              <polygon points="100,12 106,19 100,26 94,19" fill="#ffffff" filter={`url(#${id}_neonGlow)`} />

              {/* 5 Left Liquid Glass Faceted Wings (Upper facet light, lower facet shadow for true 3D crystal depth) */}
              {/* Blade 1 */}
              <path d="M 52,48 L -8,46 L 52,54 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 52,54 L -8,46 C 8,62 32,56 52,62 Z" fill={`url(#${id}_glassWingBottom)`} />
              
              {/* Blade 2 */}
              <path d="M 50,60 L -16,76 L 50,70 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 50,70 L -16,76 C 4,88 28,78 50,80 Z" fill={`url(#${id}_glassWingBottom)`} />

              {/* Blade 3 */}
              <path d="M 48,78 L -20,108 L 48,88 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 48,88 L -20,108 C 0,116 26,102 48,98 Z" fill={`url(#${id}_glassWingBottom)`} />

              {/* Blade 4 */}
              <path d="M 48,96 L -10,138 L 48,106 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 48,106 L -10,138 C 10,142 28,124 48,116 Z" fill={`url(#${id}_glassWingBottom)`} />

              {/* Blade 5 */}
              <path d="M 48,114 L 6,158 L 48,124 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 48,124 L 6,158 C 22,158 36,138 48,132 Z" fill={`url(#${id}_glassWingBottom)`} />

              {/* 5 Right Liquid Glass Faceted Wings */}
              {/* Blade 1 */}
              <path d="M 148,48 L 208,46 L 148,54 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 148,54 L 208,46 C 192,62 168,56 148,62 Z" fill={`url(#${id}_glassWingBottom)`} />
              
              {/* Blade 2 */}
              <path d="M 150,60 L 216,76 L 150,70 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 150,70 L 216,76 C 196,88 172,78 150,80 Z" fill={`url(#${id}_glassWingBottom)`} />

              {/* Blade 3 */}
              <path d="M 152,78 L 220,108 L 152,88 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 152,88 L 220,108 C 200,116 174,102 152,98 Z" fill={`url(#${id}_glassWingBottom)`} />

              {/* Blade 4 */}
              <path d="M 152,96 L 210,138 L 152,106 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 152,106 L 210,138 C 190,142 172,124 152,116 Z" fill={`url(#${id}_glassWingBottom)`} />

              {/* Blade 5 */}
              <path d="M 152,114 L 194,158 L 152,124 Z" fill={`url(#${id}_glassWingTop)`} />
              <path d="M 152,124 L 194,158 C 178,158 164,138 152,132 Z" fill={`url(#${id}_glassWingBottom)`} />

              {/* Razor-sharp Specular Glass Spine Highlights */}
              <g stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
                <line x1="50" y1="51" x2="-6" y2="46" />
                <line x1="48" y1="67" x2="-14" y2="76" />
                <line x1="46" y1="85" x2="-18" y2="108" />
                <line x1="46" y1="103" x2="-8" y2="138" />
                <line x1="46" y1="121" x2="8" y2="158" />

                <line x1="150" y1="51" x2="206" y2="46" />
                <line x1="152" y1="67" x2="214" y2="76" />
                <line x1="154" y1="85" x2="218" y2="108" />
                <line x1="154" y1="103" x2="208" y2="138" />
                <line x1="154" y1="121" x2="192" y2="158" />
              </g>
            </g>
          )}

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
          {/* LAYER 5: BIOLUMINESCENT GLOWING CENTER CREST / EMBLEM */}
          {/* ============================================================ */}
          <g 
            transform="translate(100, 95)" 
            filter={isDiamond ? `url(#${id}_neonGlow)` : `url(#${id}_shadow)`}
          >
            {Icon ? (
              <foreignObject x="-24" y="-24" width="48" height="48">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <Icon 
                    size={34} 
                    strokeWidth={2.5} 
                    color={isDiamond ? "#ffffff" : theme.rimLight} 
                  />
                </div>
              </foreignObject>
            ) : (
              /* Iconic Ace of Spades (Glows with intense neon bloom on Diamond) */
              <path 
                d="M 0,-18 C 5,-10 16,-4 16,6 C 16,14 9,18 2,16 C 0,15 -1,13 -1,13 C -1,13 -2,15 -4,16 C -11,18 -18,14 -18,6 C -18,-4 -7,-10 0,-18 Z M -2,11 L -5,20 L 5,20 L 2,11 Z" 
                fill={isDiamond ? "#ffffff" : `url(#${id}_rim)`} 
                stroke={isDiamond ? "#e0f2fe" : "#ffffff"}
                strokeWidth={isDiamond ? "1.5" : "1"}
                strokeOpacity="0.95"
              />
            )}
          </g>
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
