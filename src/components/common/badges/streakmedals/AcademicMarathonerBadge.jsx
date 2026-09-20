import React from "react";
import CosmicStreakCanvas from "./CosmicStreakCanvas";

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

const marathonConfig = {
  direction: { x: -0.64, y: 0.77 },
  origin: { x: 288, y: 220 },
  spaceGradient: ["#122244", "#071329", "#020611"],
  starCount: 78,
  showHorizon: true,
  horizonColors: ["#123d70", "#071b41", "#02050d"],
  horizonGlow: rgba(85, 190, 255, 0.74),
  horizonGlowBlur: 18,
  mainRock: {
    baseRadius: 72,
    silhouette: [72, 66, 78, 63, 74, 59, 76, 68, 71, 79, 64, 73],
    gradient: ["#a59a87", "#5e5a59", "#272836", "#0d1220"],
    strokeColor: rgba(255, 122, 28, 0.84),
    strokeWidth: 9,
    shadowColor: "#ff671c",
    shadowBlur: 20,
    craters: [[-22, -22, 18, 12], [18, -31, 13, 9], [28, 24, 20, 13], [-23, 28, 12, 8]],
    fissurePath: [[-44, 5], [-20, 0], [-17, 19], [8, 10], [25, 5], [49, 9]],
    fissureColor: rgba(255, 158, 53, 0.88),
    fissureGlow: "#ff731d",
  },
  // ── THE 100-DAY CENTURION ESCORT SWARM (3 Orbiting Rocks with Tricolor Escort Plumes) ──
  satelliteRocks: [
    {
      radius: 18,
      offset: [-72, -58],
      trailWidth: 15,
      trailLength: 175,
      trailOpacity: 0.8,
      trailStops: [[0, rgba(255, 235, 160, 0.95)], [0.35, rgba(255, 110, 25, 0.78)], [1, rgba(140, 20, 10, 0)]],
      glow: "#ff822a",
      shadowBlur: 14,
      strokeWidth: 3.5,
      strokeColor: rgba(255, 150, 45, 0.85),
      speed: 2.1,
      orbitRadius: 9,
      spin: 0.5,
    },
    {
      radius: 14,
      offset: [68, -75],
      trailWidth: 12,
      trailLength: 150,
      trailOpacity: 0.76,
      trailStops: [[0, rgba(254, 240, 138, 0.95)], [0.38, rgba(245, 158, 11, 0.75)], [1, rgba(180, 83, 9, 0)]],
      glow: "#f59e0b",
      shadowBlur: 12,
      strokeWidth: 3,
      strokeColor: rgba(251, 191, 36, 0.85),
      speed: 1.6,
      orbitRadius: 7,
      spin: -0.6,
    },
    {
      radius: 11,
      offset: [-55, 62],
      trailWidth: 10,
      trailLength: 130,
      trailOpacity: 0.75,
      trailStops: [[0, rgba(224, 242, 254, 0.95)], [0.4, rgba(56, 189, 248, 0.75)], [1, rgba(3, 105, 161, 0)]],
      glow: "#38bdf8",
      shadowBlur: 10,
      strokeWidth: 2.5,
      strokeColor: rgba(125, 211, 252, 0.85),
      speed: 2.7,
      orbitRadius: 6,
      spin: 0.7,
    },
  ],
  flames: [
    { width: 72, length: 345, opacity: 0.48, stops: [[0, rgba(255, 246, 190, 0.9)], [0.22, rgba(255, 115, 21, 0.78)], [0.72, rgba(208, 37, 24, 0.3)], [1, rgba(96, 12, 20, 0)]] },
    { width: 44, length: 295, opacity: 0.88, stops: [[0, rgba(255, 255, 220, 1)], [0.18, rgba(255, 190, 45, 0.95)], [0.65, rgba(255, 76, 18, 0.58)], [1, rgba(185, 28, 20, 0)]] },
    { width: 20, length: 255, opacity: 0.95, stops: [[0, rgba(255, 255, 245, 1)], [0.28, rgba(255, 226, 112, 0.96)], [0.75, rgba(255, 99, 24, 0.56)], [1, rgba(255, 64, 10, 0)]] },
  ],
  particles: {
    count: 36,
    speedMultiplier: 0.19,
    hotColor: rgba(255, 245, 174, 0.95),
    coolColorBase: [255, 93, 20],
  },
  shockwave: {
    offset: 46,
    radius: 118,
    stops: [[0, rgba(255, 253, 212, 0.96)], [0.18, rgba(255, 177, 43, 0.65)], [0.52, rgba(255, 65, 18, 0.2)], [1, rgba(255, 45, 10, 0)]],
  },
  labelColor: rgba(210, 236, 255, 0.88),
  shadowColor: "rgba(249,115,22,0.32)",
};

/**
 * AcademicMarathonerBadge — 100-Day Streak Milestone.
 * The Centurion Asteroid Swarm: Massive central magma rock with 3 orbiting escort satellites.
 */
export default function AcademicMarathonerBadge({
  size = 140,
  earned = true,
  count = 100,
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
      config={marathonConfig}
    />
  );
}
