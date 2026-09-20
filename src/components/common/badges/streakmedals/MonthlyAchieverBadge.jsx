import React from "react";
import CosmicStreakCanvas from "./CosmicStreakCanvas";

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// Tier 4 (30 Days): Exactly 1 Big Rock (Radius 64) and 1 Small Rock (Radius 22) in Binary Gravitational Orbit with Electric Cyan Plume
const monthlyConfig = {
  direction: { x: -0.64, y: 0.77 },
  origin: { x: 290, y: 220 },
  spaceGradient: ["#122244", "#071329", "#020611"],
  starCount: 62,
  showHorizon: true,
  horizonColors: ["#123d70", "#071b41", "#02050d"],
  horizonGlow: rgba(85, 190, 255, 0.74),
  horizonGlowBlur: 16,
  mainRock: {
    baseRadius: 64,
    silhouette: [66, 60, 70, 56, 67, 54, 69, 61, 63, 72, 58, 65],
    gradient: ["#a59a87", "#5e5a59", "#272836", "#0d1220"],
    strokeColor: rgba(255, 122, 28, 0.84),
    strokeWidth: 8,
    shadowColor: "#ff671c",
    shadowBlur: 19,
    craters: [[-18, -18, 14, 10], [16, -24, 11, 8], [22, 20, 16, 11], [-20, 22, 9, 7]],
    fissurePath: [[-38, 5], [-17, 0], [-14, 16], [8, 8], [32, 9]],
    fissureColor: rgba(255, 158, 53, 0.9),
    fissureGlow: "#ff731d",
  },
  // ── EXACTLY 1 BIG ROCK & 1 SMALL ROCK: Binary Orbit with Electric Cyan / White-Hot Escort Plume ──
  satelliteRocks: [
    {
      radius: 22,
      offset: [-66, -56],
      trailWidth: 16,
      trailLength: 185,
      trailOpacity: 0.82,
      trailStops: [[0, rgba(224, 242, 254, 0.98)], [0.28, rgba(56, 189, 248, 0.85)], [0.72, rgba(2, 132, 199, 0.35)], [1, rgba(3, 105, 161, 0)]],
      glow: "#38bdf8",
      shadowBlur: 14,
      strokeWidth: 3.5,
      strokeColor: rgba(125, 211, 252, 0.88),
      speed: 2.1,
      orbitRadius: 9,
      spin: 0.5,
    },
  ],
  flames: [
    { width: 64, length: 320, opacity: 0.48, stops: [[0, rgba(255, 246, 190, 0.9)], [0.22, rgba(255, 115, 21, 0.78)], [0.72, rgba(208, 37, 24, 0.3)], [1, rgba(96, 12, 20, 0)]] },
    { width: 38, length: 275, opacity: 0.88, stops: [[0, rgba(255, 255, 220, 1)], [0.18, rgba(255, 190, 45, 0.95)], [0.65, rgba(255, 76, 18, 0.58)], [1, rgba(185, 28, 20, 0)]] },
    { width: 18, length: 235, opacity: 0.96, stops: [[0, rgba(255, 255, 245, 1)], [0.28, rgba(255, 226, 112, 0.96)], [0.75, rgba(255, 99, 24, 0.56)], [1, rgba(255, 64, 10, 0)]] },
  ],
  particles: {
    count: 30,
    speedMultiplier: 0.18,
    hotColor: rgba(255, 245, 174, 0.95),
    coolColorBase: [255, 93, 20],
  },
  shockwave: {
    offset: 42,
    radius: 104,
    stops: [[0, rgba(255, 253, 212, 0.95)], [0.18, rgba(255, 177, 43, 0.62)], [0.52, rgba(255, 65, 18, 0.19)], [1, rgba(255, 45, 10, 0)]],
  },
  labelColor: rgba(210, 236, 255, 0.88),
  shadowColor: "rgba(249,115,22,0.32)",
};

/**
 * MonthlyAchieverBadge — 30-Day Daily Practice Streak.
 * Tier 4: Exactly 1 Big Rock (Radius 64) and 1 Small Rock (Radius 22) in binary orbit with Electric Cyan plume.
 */
export default function MonthlyAchieverBadge({
  size = 140,
  earned = true,
  count = 30,
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
      config={monthlyConfig}
    />
  );
}
