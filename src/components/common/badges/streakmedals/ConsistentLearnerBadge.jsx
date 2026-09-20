import React from "react";
import CosmicStreakCanvas from "./CosmicStreakCanvas";

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// Tier 1 (3–5 Days): 1 Small Single Rock (Radius 34), solitary aerodynamic bullet
const sparkConfig = {
  direction: { x: -0.66, y: 0.75 },
  origin: { x: 305, y: 215 },
  spaceGradient: ["#122244", "#071329", "#020611"],
  starCount: 38,
  showHorizon: true,
  horizonColors: ["#123d70", "#071b41", "#02050d"],
  horizonGlow: rgba(85, 190, 255, 0.74),
  horizonGlowBlur: 15,
  mainRock: {
    baseRadius: 34,
    silhouette: [36, 32, 38, 31, 37, 29, 39, 33, 35, 40, 31, 36],
    gradient: ["#a59a87", "#5e5a59", "#272836", "#0d1220"],
    strokeColor: rgba(255, 122, 28, 0.82),
    strokeWidth: 5,
    shadowColor: "#ff671c",
    shadowBlur: 15,
    craters: [[-10, -10, 8, 6], [11, -14, 6, 4], [-11, 11, 5, 4]],
    fissurePath: [[-20, 2], [-8, -2], [-5, 9], [5, 4], [16, 5]],
    fissureColor: rgba(255, 158, 53, 0.88),
    fissureGlow: "#ff731d",
  },
  // ── EXACTLY 1 ROCK (0 Escorts) ──
  satelliteRocks: [],
  flames: [
    { width: 38, length: 240, opacity: 0.46, stops: [[0, rgba(255, 246, 190, 0.9)], [0.22, rgba(255, 115, 21, 0.76)], [0.7, rgba(208, 37, 24, 0.3)], [1, rgba(96, 12, 20, 0)]] },
    { width: 22, length: 200, opacity: 0.86, stops: [[0, rgba(255, 255, 220, 1)], [0.2, rgba(255, 190, 45, 0.95)], [0.65, rgba(255, 76, 18, 0.56)], [1, rgba(185, 28, 20, 0)]] },
    { width: 10, length: 165, opacity: 0.96, stops: [[0, rgba(255, 255, 245, 1)], [0.3, rgba(255, 226, 112, 0.96)], [0.75, rgba(255, 99, 24, 0.56)], [1, rgba(255, 64, 10, 0)]] },
  ],
  particles: {
    count: 16,
    speedMultiplier: 0.22,
    hotColor: rgba(255, 245, 174, 0.92),
    coolColorBase: [255, 93, 20],
  },
  shockwave: {
    offset: 26,
    radius: 68,
    stops: [[0, rgba(255, 253, 212, 0.95)], [0.18, rgba(255, 177, 43, 0.6)], [0.52, rgba(255, 65, 18, 0.18)], [1, rgba(255, 45, 10, 0)]],
  },
  labelColor: rgba(210, 236, 255, 0.86),
  shadowColor: "rgba(249,115,22,0.28)",
};

/**
 * ConsistentLearnerBadge — 3-Day Daily Practice Streak.
 * Tier 1: Exactly 1 Small Rock (Radius 34) with signature fiery core and aerodynamic plasma trail.
 */
export default function ConsistentLearnerBadge({
  size = 140,
  earned = true,
  count = 3,
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
      config={sparkConfig}
    />
  );
}
