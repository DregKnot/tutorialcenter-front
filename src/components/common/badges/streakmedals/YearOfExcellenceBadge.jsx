import React from "react";
import CosmicStreakCanvas from "./CosmicStreakCanvas";

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

const apexNovaConfig = {
  direction: { x: -0.63, y: 0.77 },
  origin: { x: 282, y: 220 },
  spaceGradient: ["#122244", "#071329", "#020611"],
  starCount: 95,
  showHorizon: true,
  horizonColors: ["#123d70", "#071b41", "#02050d"],
  horizonGlow: rgba(85, 190, 255, 0.78),
  horizonGlowBlur: 20,
  mainRock: {
    baseRadius: 82,
    silhouette: [82, 75, 88, 72, 84, 68, 86, 78, 80, 89, 73, 82],
    gradient: ["#a59a87", "#5e5a59", "#272836", "#0d1220"],
    strokeColor: rgba(254, 240, 138, 0.95),
    strokeWidth: 10,
    shadowColor: "#ffd700",
    shadowBlur: 24,
    craters: [[-26, -26, 21, 14], [22, -35, 15, 10], [32, 28, 22, 15], [-26, 32, 14, 10]],
    fissurePath: [[-50, 7], [-23, 0], [-20, 22], [10, 12], [30, 7], [56, 11]],
    fissureColor: rgba(255, 255, 255, 0.98),
    fissureGlow: "#ffd700",
  },
  // ── THE 365-DAY APEX NOVA (5+ Satellite Escort Shards) ──
  satelliteRocks: [
    {
      radius: 20,
      offset: [-84, -68],
      trailWidth: 18,
      trailLength: 190,
      trailOpacity: 0.82,
      trailStops: [[0, rgba(255, 255, 255, 0.98)], [0.32, rgba(250, 204, 21, 0.85)], [0.75, rgba(217, 119, 6, 0.4)], [1, rgba(146, 64, 14, 0)]],
      glow: "#ffd700",
      shadowBlur: 16,
      strokeWidth: 4,
      strokeColor: rgba(254, 240, 138, 0.9),
      speed: 2.4,
      orbitRadius: 10,
      spin: 0.55,
    },
    {
      radius: 16,
      offset: [78, -86],
      trailWidth: 14,
      trailLength: 165,
      trailOpacity: 0.75,
      trailStops: [[0, rgba(254, 240, 138, 0.95)], [0.4, rgba(245, 158, 11, 0.75)], [1, rgba(180, 83, 9, 0)]],
      glow: "#f59e0b",
      shadowBlur: 13,
      strokeWidth: 3.5,
      strokeColor: rgba(253, 224, 71, 0.85),
      speed: 1.8,
      orbitRadius: 8,
      spin: -0.55,
    },
    {
      radius: 14,
      offset: [-66, 74],
      trailWidth: 12,
      trailLength: 145,
      trailOpacity: 0.7,
      trailStops: [[0, rgba(255, 255, 255, 0.95)], [0.45, rgba(234, 179, 8, 0.7)], [1, rgba(146, 64, 14, 0)]],
      glow: "#ffd700",
      shadowBlur: 11,
      strokeWidth: 3,
      strokeColor: rgba(254, 240, 138, 0.8),
      speed: 2.7,
      orbitRadius: 7,
      spin: 0.7,
    },
    {
      radius: 12,
      offset: [70, 58],
      trailWidth: 10,
      trailLength: 125,
      trailOpacity: 0.68,
      trailStops: [[0, rgba(254, 240, 138, 0.9)], [0.5, rgba(217, 119, 6, 0.65)], [1, rgba(113, 63, 18, 0)]],
      glow: "#d97706",
      shadowBlur: 9,
      strokeWidth: 2.5,
      strokeColor: rgba(251, 191, 36, 0.75),
      speed: 2.2,
      orbitRadius: 6,
      spin: -0.45,
    },
    {
      radius: 10,
      offset: [-96, 12],
      trailWidth: 9,
      trailLength: 115,
      trailOpacity: 0.65,
      trailStops: [[0, rgba(255, 255, 255, 0.92)], [0.5, rgba(245, 158, 11, 0.6)], [1, rgba(180, 83, 9, 0)]],
      glow: "#f59e0b",
      shadowBlur: 8,
      strokeWidth: 2,
      strokeColor: rgba(254, 240, 138, 0.75),
      speed: 3.0,
      orbitRadius: 5,
      spin: 0.8,
    },
  ],
  // ── 16 CELESTIAL SOLAR CORONA RAYS ──
  cosmicRays: {
    count: 16,
    length: 260,
    width: 3.5,
    color: rgba(254, 240, 138, 0.22),
  },
  flames: [
    { width: 80, length: 380, opacity: 0.52, stops: [[0, rgba(255, 255, 255, 0.98)], [0.22, rgba(250, 204, 21, 0.85)], [0.72, rgba(217, 119, 6, 0.35)], [1, rgba(113, 63, 18, 0)]] },
    { width: 50, length: 330, opacity: 0.9, stops: [[0, rgba(255, 255, 255, 1)], [0.2, rgba(254, 240, 138, 0.98)], [0.65, rgba(234, 179, 8, 0.65)], [1, rgba(180, 83, 9, 0)]] },
    { width: 24, length: 285, opacity: 0.98, stops: [[0, rgba(255, 255, 255, 1)], [0.28, rgba(255, 255, 255, 1)], [0.75, rgba(250, 204, 21, 0.65)], [1, rgba(217, 119, 6, 0)]] },
  ],
  particles: {
    count: 48,
    speedMultiplier: 0.22,
    hotColor: rgba(255, 255, 255, 0.98),
    coolColorBase: [250, 204, 21],
  },
  shockwave: {
    offset: 50,
    radius: 135,
    stops: [[0, rgba(255, 255, 255, 0.98)], [0.18, rgba(254, 240, 138, 0.75)], [0.52, rgba(234, 179, 8, 0.25)], [1, rgba(180, 83, 9, 0)]],
  },
  labelColor: rgba(254, 240, 138, 0.95),
  shadowColor: "rgba(250,204,21,0.4)",
};

/**
 * YearOfExcellenceBadge — 365-Day Daily Practice Streak.
 * The Cosmic Titan Nova: Apex milestone with 5+ orbiting escort shards and 16 solar corona rays.
 */
export default function YearOfExcellenceBadge({
  size = 140,
  earned = true,
  count = 365,
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
      config={apexNovaConfig}
    />
  );
}
