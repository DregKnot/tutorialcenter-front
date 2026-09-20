import React from "react";
import CosmicStreakCanvas from "./CosmicStreakCanvas";

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// Tier 3 (14 Days): Exactly 3 Rocks (Lead 52 + 2 Escorts 18 & 14 in Arrowhead Formation with Ruby-Crimson Escort Plumes)
const warriorConfig = {
  direction: { x: -0.65, y: 0.76 },
  origin: { x: 295, y: 220 },
  spaceGradient: ["#122244", "#071329", "#020611"],
  starCount: 54,
  showHorizon: true,
  horizonColors: ["#123d70", "#071b41", "#02050d"],
  horizonGlow: rgba(85, 190, 255, 0.74),
  horizonGlowBlur: 16,
  mainRock: {
    baseRadius: 52,
    silhouette: [54, 48, 56, 45, 53, 42, 57, 49, 51, 58, 46, 52],
    gradient: ["#a59a87", "#5e5a59", "#272836", "#0d1220"],
    strokeColor: rgba(255, 122, 28, 0.84),
    strokeWidth: 7,
    shadowColor: "#ff671c",
    shadowBlur: 18,
    craters: [[-15, -15, 12, 8], [14, -20, 9, 6], [18, 16, 13, 8], [-16, 18, 7, 5]],
    fissurePath: [[-30, 4], [-13, -1], [-10, 13], [6, 5], [25, 7]],
    fissureColor: rgba(255, 158, 53, 0.9),
    fissureGlow: "#ff731d",
  },
  // ── EXACTLY 3 ROCKS: 1 Lead + 2 Escorts in Arrowhead Formation with Ruby-Crimson Plumes ──
  satelliteRocks: [
    {
      radius: 18,
      offset: [-58, -48],
      trailWidth: 15,
      trailLength: 185,
      trailOpacity: 0.8,
      trailStops: [[0, rgba(254, 202, 202, 0.95)], [0.28, rgba(239, 68, 68, 0.8)], [0.72, rgba(185, 28, 28, 0.35)], [1, rgba(127, 29, 29, 0)]],
      glow: "#ef4444",
      shadowBlur: 13,
      strokeWidth: 3.5,
      strokeColor: rgba(248, 113, 113, 0.85),
      speed: 2.0,
      orbitRadius: 8,
      spin: 0.5,
    },
    {
      radius: 14,
      offset: [55, -60],
      trailWidth: 12,
      trailLength: 155,
      trailOpacity: 0.75,
      trailStops: [[0, rgba(254, 202, 202, 0.9)], [0.32, rgba(220, 38, 38, 0.75)], [0.75, rgba(153, 27, 27, 0.3)], [1, rgba(127, 29, 29, 0)]],
      glow: "#dc2626",
      shadowBlur: 11,
      strokeWidth: 3,
      strokeColor: rgba(252, 165, 165, 0.8),
      speed: 1.7,
      orbitRadius: 6,
      spin: -0.55,
    },
  ],
  flames: [
    { width: 56, length: 295, opacity: 0.46, stops: [[0, rgba(255, 246, 190, 0.9)], [0.22, rgba(255, 115, 21, 0.78)], [0.7, rgba(208, 37, 24, 0.3)], [1, rgba(96, 12, 20, 0)]] },
    { width: 34, length: 250, opacity: 0.86, stops: [[0, rgba(255, 255, 220, 1)], [0.2, rgba(255, 190, 45, 0.95)], [0.65, rgba(255, 76, 18, 0.58)], [1, rgba(185, 28, 20, 0)]] },
    { width: 16, length: 210, opacity: 0.96, stops: [[0, rgba(255, 255, 245, 1)], [0.28, rgba(255, 226, 112, 0.96)], [0.75, rgba(255, 99, 24, 0.56)], [1, rgba(255, 64, 10, 0)]] },
  ],
  particles: {
    count: 26,
    speedMultiplier: 0.19,
    hotColor: rgba(255, 245, 174, 0.94),
    coolColorBase: [255, 93, 20],
  },
  shockwave: {
    offset: 36,
    radius: 92,
    stops: [[0, rgba(255, 253, 212, 0.95)], [0.18, rgba(255, 177, 43, 0.62)], [0.52, rgba(255, 65, 18, 0.19)], [1, rgba(255, 45, 10, 0)]],
  },
  labelColor: rgba(210, 236, 255, 0.88),
  shadowColor: "rgba(249,115,22,0.32)",
};

/**
 * WeeklyWarriorBadge — 14-Day Daily Practice Streak.
 * Tier 3: Exactly 3 Rocks (Lead rock + 2 escorts in Delta-V formation with Ruby-Crimson escort trails).
 */
export default function WeeklyWarriorBadge({
  size = 140,
  earned = true,
  count = 14,
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
      config={warriorConfig}
    />
  );
}
