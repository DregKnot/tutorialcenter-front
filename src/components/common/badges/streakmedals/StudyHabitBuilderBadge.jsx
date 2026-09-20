import React from "react";
import CosmicStreakCanvas from "./CosmicStreakCanvas";

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// Tier 2 (7 Days): Exactly 2 Rocks (Lead 46 + Companion 18 in tandem slipstream with Amber-Gold escort plume)
const habitConfig = {
  direction: { x: -0.65, y: 0.76 },
  origin: { x: 300, y: 220 },
  spaceGradient: ["#122244", "#071329", "#020611"],
  starCount: 48,
  showHorizon: true,
  horizonColors: ["#123d70", "#071b41", "#02050d"],
  horizonGlow: rgba(85, 190, 255, 0.74),
  horizonGlowBlur: 16,
  mainRock: {
    baseRadius: 46,
    silhouette: [48, 43, 50, 41, 47, 38, 51, 44, 45, 52, 42, 47],
    gradient: ["#a59a87", "#5e5a59", "#272836", "#0d1220"],
    strokeColor: rgba(255, 122, 28, 0.84),
    strokeWidth: 6,
    shadowColor: "#ff671c",
    shadowBlur: 16,
    craters: [[-13, -12, 10, 7], [12, -16, 7, 5], [-14, 15, 6, 5]],
    fissurePath: [[-26, 3], [-10, -2], [-7, 11], [6, 5], [22, 6]],
    fissureColor: rgba(255, 158, 53, 0.9),
    fissureGlow: "#ff731d",
  },
  // ── EXACTLY 2 ROCKS: 1 Lead + 1 Escort Satellite with Amber-Gold Fire Plume ──
  satelliteRocks: [
    {
      radius: 18,
      offset: [-56, -46],
      trailWidth: 14,
      trailLength: 170,
      trailOpacity: 0.8,
      trailStops: [[0, rgba(254, 240, 138, 0.95)], [0.3, rgba(245, 158, 11, 0.78)], [0.75, rgba(217, 119, 6, 0.35)], [1, rgba(146, 64, 14, 0)]],
      glow: "#f59e0b",
      shadowBlur: 12,
      strokeWidth: 3,
      strokeColor: rgba(251, 191, 36, 0.85),
      speed: 1.8,
      orbitRadius: 7,
      spin: 0.45,
    },
  ],
  flames: [
    { width: 50, length: 280, opacity: 0.46, stops: [[0, rgba(255, 246, 190, 0.9)], [0.22, rgba(255, 115, 21, 0.78)], [0.7, rgba(208, 37, 24, 0.3)], [1, rgba(96, 12, 20, 0)]] },
    { width: 30, length: 235, opacity: 0.86, stops: [[0, rgba(255, 255, 220, 1)], [0.2, rgba(255, 190, 45, 0.95)], [0.65, rgba(255, 76, 18, 0.58)], [1, rgba(185, 28, 20, 0)]] },
    { width: 14, length: 195, opacity: 0.96, stops: [[0, rgba(255, 255, 245, 1)], [0.28, rgba(255, 226, 112, 0.96)], [0.75, rgba(255, 99, 24, 0.56)], [1, rgba(255, 64, 10, 0)]] },
  ],
  particles: {
    count: 22,
    speedMultiplier: 0.19,
    hotColor: rgba(255, 245, 174, 0.94),
    coolColorBase: [255, 93, 20],
  },
  shockwave: {
    offset: 32,
    radius: 82,
    stops: [[0, rgba(255, 253, 212, 0.95)], [0.18, rgba(255, 177, 43, 0.62)], [0.52, rgba(255, 65, 18, 0.19)], [1, rgba(255, 45, 10, 0)]],
  },
  labelColor: rgba(210, 236, 255, 0.88),
  shadowColor: "rgba(249,115,22,0.3)",
};

/**
 * StudyHabitBuilderBadge — 7-Day Daily Practice Streak.
 * Tier 2: Exactly 2 Rocks (Lead rock + companion escort rock with Amber-Gold plasma trail).
 */
export default function StudyHabitBuilderBadge({
  size = 140,
  earned = true,
  count = 7,
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
      config={habitConfig}
    />
  );
}
