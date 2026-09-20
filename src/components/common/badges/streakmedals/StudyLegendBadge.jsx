import React from "react";
import CosmicStreakCanvas from "./CosmicStreakCanvas";

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// Tier 7 (180–200 Days): Exactly 1 Massive Rock (Radius 78) + 4 Escort Rocks (19, 15, 13, 10) with Emerald & Solar Amber Escort Plumes
const titanImpactorConfig = {
  direction: { x: -0.63, y: 0.77 },
  origin: { x: 285, y: 220 },
  spaceGradient: ["#122244", "#071329", "#020611"],
  starCount: 86,
  showHorizon: true,
  horizonColors: ["#123d70", "#071b41", "#02050d"],
  horizonGlow: rgba(85, 190, 255, 0.74),
  horizonGlowBlur: 18,
  mainRock: {
    baseRadius: 78,
    silhouette: [78, 72, 84, 69, 80, 65, 82, 74, 77, 85, 70, 79],
    gradient: ["#a59a87", "#5e5a59", "#272836", "#0d1220"],
    strokeColor: rgba(255, 122, 28, 0.86),
    strokeWidth: 9.5,
    shadowColor: "#ff671c",
    shadowBlur: 22,
    craters: [[-24, -24, 19, 13], [20, -32, 14, 9], [30, 25, 21, 14], [-24, 30, 13, 9]],
    fissurePath: [[-48, 6], [-22, 0], [-19, 21], [9, 11], [28, 6], [54, 10]],
    fissureColor: rgba(255, 158, 53, 0.92),
    fissureGlow: "#ff731d",
  },
  // ── 4 ORBITING ESCORT ROCKS with Emerald & Solar Amber Plumes ──
  satelliteRocks: [
    {
      radius: 19,
      offset: [-78, -62],
      trailWidth: 16,
      trailLength: 175,
      trailOpacity: 0.8,
      trailStops: [[0, rgba(209, 250, 229, 0.95)], [0.32, rgba(16, 185, 129, 0.8)], [0.75, rgba(4, 120, 87, 0.35)], [1, rgba(6, 78, 59, 0)]],
      glow: "#10b981",
      shadowBlur: 14,
      strokeWidth: 3.5,
      strokeColor: rgba(52, 211, 153, 0.85),
      speed: 2.3,
      orbitRadius: 9,
      spin: 0.5,
    },
    {
      radius: 15,
      offset: [72, -80],
      trailWidth: 13,
      trailLength: 155,
      trailOpacity: 0.76,
      trailStops: [[0, rgba(254, 240, 138, 0.95)], [0.38, rgba(245, 158, 11, 0.75)], [1, rgba(180, 83, 9, 0)]],
      glow: "#f59e0b",
      shadowBlur: 12,
      strokeWidth: 3,
      strokeColor: rgba(251, 191, 36, 0.85),
      speed: 1.7,
      orbitRadius: 7,
      spin: -0.55,
    },
    {
      radius: 13,
      offset: [-60, 68],
      trailWidth: 11,
      trailLength: 135,
      trailOpacity: 0.72,
      trailStops: [[0, rgba(209, 250, 229, 0.9)], [0.4, rgba(52, 211, 153, 0.7)], [1, rgba(4, 120, 87, 0)]],
      glow: "#34d399",
      shadowBlur: 10,
      strokeWidth: 2.5,
      strokeColor: rgba(110, 231, 183, 0.8),
      speed: 2.6,
      orbitRadius: 6,
      spin: 0.65,
    },
    {
      radius: 10,
      offset: [65, 52],
      trailWidth: 9,
      trailLength: 115,
      trailOpacity: 0.7,
      trailStops: [[0, rgba(254, 243, 199, 0.9)], [0.45, rgba(217, 119, 6, 0.65)], [1, rgba(146, 64, 14, 0)]],
      glow: "#d97706",
      shadowBlur: 8,
      strokeWidth: 2,
      strokeColor: rgba(251, 191, 36, 0.75),
      speed: 2.1,
      orbitRadius: 5,
      spin: -0.4,
    },
  ],
  flames: [
    { width: 76, length: 360, opacity: 0.5, stops: [[0, rgba(255, 246, 190, 0.9)], [0.22, rgba(255, 115, 21, 0.8)], [0.72, rgba(208, 37, 24, 0.32)], [1, rgba(96, 12, 20, 0)]] },
    { width: 46, length: 310, opacity: 0.88, stops: [[0, rgba(255, 255, 220, 1)], [0.18, rgba(255, 190, 45, 0.96)], [0.65, rgba(255, 76, 18, 0.6)], [1, rgba(185, 28, 20, 0)]] },
    { width: 22, length: 270, opacity: 0.96, stops: [[0, rgba(255, 255, 245, 1)], [0.28, rgba(255, 226, 112, 0.98)], [0.75, rgba(255, 99, 24, 0.58)], [1, rgba(255, 64, 10, 0)]] },
  ],
  particles: {
    count: 42,
    speedMultiplier: 0.2,
    hotColor: rgba(255, 245, 174, 0.96),
    coolColorBase: [255, 93, 20],
  },
  shockwave: {
    offset: 48,
    radius: 125,
    stops: [[0, rgba(255, 253, 212, 0.96)], [0.18, rgba(255, 177, 43, 0.68)], [0.52, rgba(255, 65, 18, 0.22)], [1, rgba(255, 45, 10, 0)]],
  },
  labelColor: rgba(210, 236, 255, 0.9),
  shadowColor: "rgba(249,115,22,0.36)",
};

/**
 * StudyLegendBadge — 180-Day / 200-Day Streak Milestone.
 * Tier 7: 1 Massive Rock (Radius 78) + 4 Escort Rocks with Emerald & Solar Amber companion plumes.
 */
export default function StudyLegendBadge({
  size = 140,
  earned = true,
  count = 180,
  animated = false,
  className = "",
}) {
  return (
    <CosmicStreakCanvas
      size={size}
      earned={earned}
      count={count}
      animated={animated}
      className={className}
      label={`${count} DAY STREAK`}
      config={titanImpactorConfig}
    />
  );
}
