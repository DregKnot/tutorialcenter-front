import React from "react";
import CosmicStreakCanvas from "./CosmicStreakCanvas";

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// Tier 5 (60 Days): 1 Large Rock (Radius 68) + 2 Trailing Fragment Rocks (18 & 14) with Ultraviolet / Magenta Escort Plumes
const machineConfig = {
  direction: { x: -0.64, y: 0.77 },
  origin: { x: 290, y: 220 },
  spaceGradient: ["#122244", "#071329", "#020611"],
  starCount: 68,
  showHorizon: true,
  horizonColors: ["#123d70", "#071b41", "#02050d"],
  horizonGlow: rgba(85, 190, 255, 0.74),
  horizonGlowBlur: 16,
  mainRock: {
    baseRadius: 68,
    silhouette: [69, 63, 73, 59, 70, 56, 72, 64, 66, 75, 61, 68],
    gradient: ["#a59a87", "#5e5a59", "#272836", "#0d1220"],
    strokeColor: rgba(255, 122, 28, 0.84),
    strokeWidth: 8.5,
    shadowColor: "#ff671c",
    shadowBlur: 19,
    craters: [[-20, -20, 16, 11], [17, -26, 12, 8], [24, 22, 17, 12], [-21, 24, 10, 7]],
    fissurePath: [[-40, 5], [-18, 0], [-15, 17], [8, 9], [34, 9]],
    fissureColor: rgba(255, 158, 53, 0.9),
    fissureGlow: "#ff731d",
  },
  // ── 1 LARGE ROCK + 2 TRAILING FRAGMENTS with Ultraviolet / Magenta Plumes ──
  satelliteRocks: [
    {
      radius: 18,
      offset: [-68, -58],
      trailWidth: 15,
      trailLength: 180,
      trailOpacity: 0.8,
      trailStops: [[0, rgba(245, 208, 254, 0.95)], [0.3, rgba(192, 132, 252, 0.8)], [0.75, rgba(147, 51, 234, 0.35)], [1, rgba(88, 28, 135, 0)]],
      glow: "#c084fc",
      shadowBlur: 13,
      strokeWidth: 3.5,
      strokeColor: rgba(216, 180, 254, 0.85),
      speed: 2.2,
      orbitRadius: 8,
      spin: 0.5,
    },
    {
      radius: 14,
      offset: [62, -72],
      trailWidth: 11,
      trailLength: 145,
      trailOpacity: 0.72,
      trailStops: [[0, rgba(250, 232, 255, 0.9)], [0.35, rgba(217, 70, 239, 0.75)], [1, rgba(112, 26, 117, 0)]],
      glow: "#d946ef",
      shadowBlur: 10,
      strokeWidth: 3,
      strokeColor: rgba(240, 171, 252, 0.8),
      speed: 1.8,
      orbitRadius: 6,
      spin: -0.6,
    },
  ],
  flames: [
    { width: 68, length: 330, opacity: 0.48, stops: [[0, rgba(255, 246, 190, 0.9)], [0.22, rgba(255, 115, 21, 0.78)], [0.72, rgba(208, 37, 24, 0.3)], [1, rgba(96, 12, 20, 0)]] },
    { width: 42, length: 285, opacity: 0.88, stops: [[0, rgba(255, 255, 220, 1)], [0.18, rgba(255, 190, 45, 0.95)], [0.65, rgba(255, 76, 18, 0.58)], [1, rgba(185, 28, 20, 0)]] },
    { width: 19, length: 245, opacity: 0.96, stops: [[0, rgba(255, 255, 245, 1)], [0.28, rgba(255, 226, 112, 0.96)], [0.75, rgba(255, 99, 24, 0.56)], [1, rgba(255, 64, 10, 0)]] },
  ],
  particles: {
    count: 32,
    speedMultiplier: 0.19,
    hotColor: rgba(255, 245, 174, 0.95),
    coolColorBase: [255, 93, 20],
  },
  shockwave: {
    offset: 44,
    radius: 110,
    stops: [[0, rgba(255, 253, 212, 0.95)], [0.18, rgba(255, 177, 43, 0.62)], [0.52, rgba(255, 65, 18, 0.19)], [1, rgba(255, 45, 10, 0)]],
  },
  labelColor: rgba(210, 236, 255, 0.88),
  shadowColor: "rgba(249,115,22,0.32)",
};

/**
 * LearningMachineStreakBadge — 60-Day Daily Practice Streak.
 * Tier 5: 1 Large Rock (Radius 68) + 2 Trailing Fragment Rocks with Ultraviolet / Magenta plumes.
 */
export default function LearningMachineStreakBadge({
  size = 140,
  earned = true,
  count = 60,
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
      config={machineConfig}
    />
  );
}
