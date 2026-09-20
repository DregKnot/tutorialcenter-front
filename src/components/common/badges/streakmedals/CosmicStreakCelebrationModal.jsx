import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { X, RotateCcw, ArrowLeft, Trophy, Sparkles } from "lucide-react";
import {
  ConsistentLearnerBadge,
  StudyHabitBuilderBadge,
  WeeklyWarriorBadge,
  MonthlyAchieverBadge,
  LearningMachineStreakBadge,
  AcademicMarathonerBadge,
  StudyLegendBadge,
  YearOfExcellenceBadge,
} from "./index";

const hash = (v) => {
  const sine = Math.sin(v * 12.9898) * 43758.5453;
  return sine - Math.floor(sine);
};

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// Map days to specific streak badge component
const getBadgeComponentForDays = (days) => {
  if (days >= 365) return YearOfExcellenceBadge;
  if (days >= 180) return StudyLegendBadge;
  if (days >= 100) return AcademicMarathonerBadge;
  if (days >= 60) return LearningMachineStreakBadge;
  if (days >= 30) return MonthlyAchieverBadge;
  if (days >= 14) return WeeklyWarriorBadge;
  if (days >= 7) return StudyHabitBuilderBadge;
  return ConsistentLearnerBadge;
};

// Tier flight configurations: rock sizes, escort formations, and companion flames
const getStreakFlightConfig = (days) => {
  if (days >= 365) {
    return {
      tierName: "Year of Excellence",
      mainRockRadius: 68,
      escorts: [
        { offset: [-64, -48], radius: 24, trailLen: 160, trailWidth: 24, glow: "#ffd700", trailStops: [[0, rgba(255, 255, 255, 1)], [0.35, rgba(255, 215, 0, 0.9)], [1, rgba(217, 119, 6, 0)]] },
        { offset: [58, -60], radius: 20, trailLen: 145, trailWidth: 20, glow: "#f59e0b", trailStops: [[0, rgba(255, 255, 255, 0.95)], [0.4, rgba(245, 158, 11, 0.85)], [1, rgba(180, 83, 9, 0)]] },
        { offset: [-54, 52], radius: 18, trailLen: 130, trailWidth: 18, glow: "#eab308", trailStops: [[0, rgba(255, 255, 255, 0.95)], [0.4, rgba(234, 179, 8, 0.85)], [1, rgba(146, 64, 14, 0)]] },
        { offset: [54, 46], radius: 15, trailLen: 115, trailWidth: 15, glow: "#d97706", trailStops: [[0, rgba(255, 240, 180, 0.9)], [0.5, rgba(217, 119, 6, 0.8)], [1, rgba(113, 63, 18, 0)]] },
        { offset: [-80, 12], radius: 13, trailLen: 105, trailWidth: 13, glow: "#fef08a", trailStops: [[0, rgba(255, 255, 255, 0.9)], [0.5, rgba(254, 240, 138, 0.75)], [1, rgba(180, 83, 9, 0)]] },
      ],
      hasCoronaRays: true,
      shockIntensity: 1.8,
    };
  }
  if (days >= 180) {
    return {
      tierName: "Study Legend",
      mainRockRadius: 62,
      escorts: [
        { offset: [-58, -44], radius: 21, trailLen: 150, trailWidth: 21, glow: "#10b981", trailStops: [[0, rgba(209, 250, 229, 1)], [0.35, rgba(16, 185, 129, 0.9)], [1, rgba(6, 78, 59, 0)]] },
        { offset: [52, -52], radius: 18, trailLen: 135, trailWidth: 18, glow: "#f59e0b", trailStops: [[0, rgba(254, 240, 138, 0.95)], [0.4, rgba(245, 158, 11, 0.85)], [1, rgba(180, 83, 9, 0)]] },
        { offset: [-46, 46], radius: 15, trailLen: 120, trailWidth: 15, glow: "#34d399", trailStops: [[0, rgba(209, 250, 229, 0.95)], [0.45, rgba(52, 211, 153, 0.85)], [1, rgba(4, 120, 87, 0)]] },
        { offset: [48, 38], radius: 13, trailLen: 105, trailWidth: 13, glow: "#d97706", trailStops: [[0, rgba(254, 243, 199, 0.9)], [0.5, rgba(217, 119, 6, 0.8)], [1, rgba(146, 64, 14, 0)]] },
      ],
      hasCoronaRays: false,
      shockIntensity: 1.5,
    };
  }
  if (days >= 100) {
    return {
      tierName: "Academic Marathoner",
      mainRockRadius: 58,
      escorts: [
        { offset: [-54, -40], radius: 20, trailLen: 140, trailWidth: 20, glow: "#ff822a", trailStops: [[0, rgba(255, 235, 160, 1)], [0.35, rgba(255, 110, 25, 0.9)], [1, rgba(140, 20, 10, 0)]] },
        { offset: [48, -48], radius: 16, trailLen: 125, trailWidth: 16, glow: "#f59e0b", trailStops: [[0, rgba(254, 240, 138, 0.95)], [0.4, rgba(245, 158, 11, 0.85)], [1, rgba(180, 83, 9, 0)]] },
        { offset: [-40, 44], radius: 13, trailLen: 110, trailWidth: 13, glow: "#38bdf8", trailStops: [[0, rgba(224, 242, 254, 0.95)], [0.45, rgba(56, 189, 248, 0.85)], [1, rgba(3, 105, 161, 0)]] },
      ],
      hasCoronaRays: false,
      shockIntensity: 1.35,
    };
  }
  if (days >= 60) {
    return {
      tierName: "Learning Machine",
      mainRockRadius: 54,
      escorts: [
        { offset: [-50, -38], radius: 18, trailLen: 130, trailWidth: 18, glow: "#c084fc", trailStops: [[0, rgba(245, 208, 254, 1)], [0.35, rgba(192, 132, 252, 0.9)], [1, rgba(88, 28, 135, 0)]] },
        { offset: [44, -44], radius: 14, trailLen: 115, trailWidth: 14, glow: "#d946ef", trailStops: [[0, rgba(250, 232, 255, 0.95)], [0.4, rgba(217, 70, 239, 0.85)], [1, rgba(112, 26, 117, 0)]] },
      ],
      hasCoronaRays: false,
      shockIntensity: 1.2,
    };
  }
  if (days >= 30) {
    return {
      tierName: "Monthly Achiever",
      mainRockRadius: 50,
      escorts: [
        { offset: [-48, -36], radius: 18, trailLen: 125, trailWidth: 18, glow: "#38bdf8", trailStops: [[0, rgba(224, 242, 254, 1)], [0.35, rgba(56, 189, 248, 0.9)], [1, rgba(3, 105, 161, 0)]] },
      ],
      hasCoronaRays: false,
      shockIntensity: 1.15,
    };
  }
  if (days >= 14) {
    return {
      tierName: "Weekly Warrior",
      mainRockRadius: 46,
      escorts: [
        { offset: [-44, -32], radius: 16, trailLen: 115, trailWidth: 16, glow: "#ef4444", trailStops: [[0, rgba(254, 202, 202, 1)], [0.35, rgba(239, 68, 68, 0.9)], [1, rgba(127, 29, 29, 0)]] },
        { offset: [40, -38], radius: 13, trailLen: 105, trailWidth: 13, glow: "#dc2626", trailStops: [[0, rgba(254, 202, 202, 0.95)], [0.4, rgba(220, 38, 38, 0.85)], [1, rgba(127, 29, 29, 0)]] },
      ],
      hasCoronaRays: false,
      shockIntensity: 1.05,
    };
  }
  if (days >= 7) {
    return {
      tierName: "Study Habit Builder",
      mainRockRadius: 42,
      escorts: [
        { offset: [-40, -30], radius: 15, trailLen: 110, trailWidth: 15, glow: "#f59e0b", trailStops: [[0, rgba(254, 240, 138, 1)], [0.35, rgba(245, 158, 11, 0.9)], [1, rgba(146, 64, 14, 0)]] },
      ],
      hasCoronaRays: false,
      shockIntensity: 1.0,
    };
  }
  // 3–5 Days: Consistent Learner - 1 single rock falling completely on its own!
  return {
    tierName: "Consistent Learner",
    mainRockRadius: 38,
    escorts: [],
    hasCoronaRays: false,
    shockIntensity: 0.85,
  };
};

/**
 * EXACT Badge Asteroid Silhouette & Feature Definitions
 * Matches the basalt asteroid in CosmicStreakCanvas.jsx:
 * - 12-point basalt polygon
 * - 4 distinct dark craters with warm rim lighting
 * - Molten magma fissure path with vibrant orange glow
 */
const BASELINE_RADIUS = 70;
const ASTEROID_SILHOUETTE = [70, 65, 76, 62, 72, 58, 74, 66, 69, 77, 62, 71];
const ASTEROID_CRATERS = [
  [-22, -22, 18, 12],
  [18, -31, 13, 9],
  [28, 24, 20, 13],
  [-23, 28, 12, 8],
];
const ASTEROID_FISSURE = [
  [-42, 5],
  [-18, 0],
  [-16, 18],
  [8, 10],
  [24, 5],
  [48, 9],
];

/**
 * Calculate the exact 12 polygon vertices for the asteroid at a given radius
 */
const getAsteroidVertices = (radius) => {
  const scale = radius / BASELINE_RADIUS;
  return ASTEROID_SILHOUETTE.map((r, i) => {
    const pAngle = (Math.PI * 2 * i) / ASTEROID_SILHOUETTE.length;
    return {
      x: Math.cos(pAngle) * r * scale,
      y: Math.sin(pAngle) * r * 0.9 * scale,
      angle: pAngle,
    };
  });
};

/**
 * Render the intact basalt asteroid with exact badge graphics
 */
const drawIntactAsteroid = (ctx, x, y, radius, angle) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const scale = radius / BASELINE_RADIUS;
  const vertices = getAsteroidVertices(radius);

  // 1. Basalt rock body polygon
  ctx.beginPath();
  vertices.forEach((pt, i) => {
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.closePath();

  // 2. Basalt gradient lighting (sunlight from top-left, charred basalt in shadow)
  const grad = ctx.createRadialGradient(-radius * 0.37, -radius * 0.4, 4, 0, 0, radius * 1.25);
  grad.addColorStop(0, "#a59a87");
  grad.addColorStop(0.24, "#5e5a59");
  grad.addColorStop(0.63, "#272836");
  grad.addColorStop(1, "#0d1220");
  ctx.fillStyle = grad;
  ctx.shadowColor = "#ff671c";
  ctx.shadowBlur = Math.min(22, radius * 0.45);
  ctx.fill();

  // 3. Glowing molten outer edge
  ctx.lineWidth = Math.max(3, radius * 0.11);
  ctx.strokeStyle = rgba(255, 122, 28, 0.85);
  ctx.stroke();

  // 4. Craters
  ctx.shadowBlur = 0;
  ASTEROID_CRATERS.forEach(([cx, cy, cw, ch]) => {
    ctx.beginPath();
    ctx.ellipse(cx * scale, cy * scale, cw * scale, ch * scale, -0.45, 0, Math.PI * 2);
    ctx.fillStyle = "#151724";
    ctx.fill();
    ctx.strokeStyle = rgba(214, 115, 38, 0.4);
    ctx.lineWidth = Math.max(1.5, 3 * scale);
    ctx.stroke();
  });

  // 5. Molten Magma Fissure
  ctx.beginPath();
  ctx.moveTo(ASTEROID_FISSURE[0][0] * scale, ASTEROID_FISSURE[0][1] * scale);
  for (let f = 1; f < ASTEROID_FISSURE.length; f += 1) {
    ctx.lineTo(ASTEROID_FISSURE[f][0] * scale, ASTEROID_FISSURE[f][1] * scale);
  }
  ctx.strokeStyle = rgba(255, 158, 53, 0.95);
  ctx.shadowColor = "#ff731d";
  ctx.shadowBlur = 10;
  ctx.lineWidth = Math.max(2.5, radius * 0.08);
  ctx.stroke();

  ctx.restore();
};

/**
 * Procedural Fracture Chunks:
 * Divides the authentic rock into 6 primary fractured basalt chunks meeting at the core,
 * retaining basalt gradient texture and exposing incandescent magma fracture seams.
 */
const getFracturePieces = (radius) => {
  const scale = radius / BASELINE_RADIUS;
  const vertices = getAsteroidVertices(radius);
  const chunkCount = 6;
  const pieces = [];

  for (let c = 0; c < chunkCount; c += 1) {
    const vStart = c * 2;
    const vMid = (vStart + 1) % 12;
    const vEnd = (vStart + 2) % 12;

    const p0 = vertices[vStart];
    const p1 = vertices[vMid];
    const p2 = vertices[vEnd];

    // Compute centroid of the chunk
    const centerOffsetX = (p0.x + p1.x + p2.x) / 4;
    const centerOffsetY = (p0.y + p1.y + p2.y) / 4;

    // Outward blast trajectory angle (biased upwards away from the ground)
    const blastAngle = -Math.PI * 0.92 + (Math.PI * 0.84 * (c / (chunkCount - 1))) + (hash(c * 7) - 0.5) * 0.25;
    const speed = 260 + hash(c * 13) * 320;
    const vx = Math.cos(blastAngle) * speed;
    const vy = Math.sin(blastAngle) * speed;
    const rotSpeed = (hash(c * 19) - 0.5) * 11;

    pieces.push({
      polygon: [
        { x: p0.x - centerOffsetX, y: p0.y - centerOffsetY },
        { x: p1.x - centerOffsetX, y: p1.y - centerOffsetY },
        { x: p2.x - centerOffsetX, y: p2.y - centerOffsetY },
        { x: -centerOffsetX, y: -centerOffsetY },
      ],
      centroidOffset: { x: centerOffsetX, y: centerOffsetY },
      vx,
      vy,
      rotSpeed,
      scale,
    });
  }

  return pieces;
};

export default function CosmicStreakCelebrationModal({
  achievement,
  days: propDays = null,
  onClose,
}) {
  const canvasRef = useRef(null);

  const days = Number(
    propDays ??
    achievement?.streak_days ??
    achievement?.requirements?.streak_days ??
    achievement?.count ??
    (achievement?.code?.includes("365") ? 365 :
     achievement?.code?.includes("180") || achievement?.code?.includes("200") ? 180 :
     achievement?.code?.includes("100") ? 100 :
     achievement?.code?.includes("60") || achievement?.code?.includes("50") ? 60 :
     achievement?.code?.includes("30") ? 30 :
     achievement?.code?.includes("14") ? 14 :
     achievement?.code?.includes("7") ? 7 : 3)
  );

  const flightConfig = useMemo(() => getStreakFlightConfig(days), [days]);

  const [phase, setPhase] = useState("flying"); // "flying" | "shattered" | "celebrate"
  const [rumbleOffset, setRumbleOffset] = useState({ x: 0, y: 0 });
  const animStartTimeRef = useRef(null);
  const animFrameRef = useRef(null);

  // Play / Replay Animation sequence
  const startAnimation = useCallback(() => {
    setPhase("flying");
    setRumbleOffset({ x: 0, y: 0 });
    animStartTimeRef.current = null;
  }, []);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Full-Screen Canvas Flight & Physical Shattering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    let width = (canvas.width = window.innerWidth * pixelRatio);
    let height = (canvas.height = window.innerHeight * pixelRatio);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * pixelRatio;
      height = canvas.height = window.innerHeight * pixelRatio;
    };
    window.addEventListener("resize", handleResize);

    const FLIGHT_DURATION = 1.9; // seconds until impact
    const BREAK_DURATION = 0.8; // seconds of rock shattering into flying chunks
    const TOTAL_SEQUENCE = FLIGHT_DURATION + BREAK_DURATION;

    const renderFrame = (timestamp) => {
      if (!animStartTimeRef.current) animStartTimeRef.current = timestamp;
      const elapsed = (timestamp - animStartTimeRef.current) / 1000;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const logicalWidth = width / pixelRatio;
      const logicalHeight = height / pixelRatio;
      const responsiveScale = Math.min(logicalWidth, logicalHeight) / 800;

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      // ── 1. DEEP SPACE COSMIC SKY ──
      const spaceGrad = ctx.createRadialGradient(
        logicalWidth * 0.5, logicalHeight * 0.35, 40,
        logicalWidth * 0.5, logicalHeight * 0.5, Math.max(logicalWidth, logicalHeight) * 0.85
      );
      spaceGrad.addColorStop(0, "#16284e");
      spaceGrad.addColorStop(0.5, "#08142c");
      spaceGrad.addColorStop(1, "#020612");
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // ── 2. STARRY FIELD (Twinkling Stars) ──
      const starCount = Math.min(180, Math.floor(logicalWidth / 9));
      for (let i = 0; i < starCount; i += 1) {
        const sx = hash(i * 3 + 1) * logicalWidth;
        const sy = hash(i * 7 + 42) * (logicalHeight * 0.82);
        const sr = 0.8 + hash(i * 11 + 9) * 2.2;
        const twinkle = 0.4 + 0.6 * Math.sin(elapsed * 2.5 + i);
        ctx.beginPath();
        ctx.fillStyle = rgba(210, 235, 255, 0.3 + twinkle * 0.6);
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 3. EARTH ATMOSPHERIC HORIZON ──
      const horizonY = logicalHeight * 0.74;
      ctx.beginPath();
      ctx.moveTo(-40, logicalHeight + 40);
      ctx.lineTo(-40, horizonY + 80);
      ctx.quadraticCurveTo(logicalWidth * 0.5, horizonY, logicalWidth + 40, horizonY + 80);
      ctx.lineTo(logicalWidth + 40, logicalHeight + 40);
      ctx.closePath();

      const earthGrad = ctx.createLinearGradient(0, horizonY, 0, logicalHeight);
      earthGrad.addColorStop(0, "#123d70");
      earthGrad.addColorStop(0.2, "#081f44");
      earthGrad.addColorStop(1, "#020712");
      ctx.fillStyle = earthGrad;
      ctx.fill();

      // Atmospheric Rim Glow
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.moveTo(-40, horizonY + 80);
      ctx.quadraticCurveTo(logicalWidth * 0.5, horizonY, logicalWidth + 40, horizonY + 80);
      ctx.strokeStyle = rgba(85, 190, 255, 0.82);
      ctx.shadowColor = "#55beff";
      ctx.shadowBlur = 24;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // ── 4. FLIGHT TRAJECTORY & METEOR KINEMATICS ──
      const startX = logicalWidth * 1.15;
      const startY = -logicalHeight * 0.15;
      const impactX = logicalWidth * 0.5;
      const impactY = horizonY + 12;

      // Make the rock prominent and large
      const mainRockRadius = flightConfig.mainRockRadius * Math.max(0.85, responsiveScale * 1.25);

      if (elapsed < FLIGHT_DURATION) {
        // FLIGHT PHASE
        const t = Math.min(1, elapsed / FLIGHT_DURATION);
        const progress = Math.pow(t, 1.32); // Acceleration under gravity

        const currentX = (1 - progress) * startX + progress * impactX;
        const currentY = (1 - progress) * startY + progress * impactY;

        const dirX = impactX - startX;
        const dirY = impactY - startY;
        const len = Math.hypot(dirX, dirY);
        const normDirX = dirX / len;
        const normDirY = dirY / len;
        const trailX = -normDirX;
        const trailY = -normDirY;
        const normalX = -trailY;
        const normalY = trailX;
        const flightAngle = Math.atan2(dirY, dirX);

        // ── A. DRAW ESCORT ROCKS & COMPANION FLUID FLAMES ──
        if (flightConfig.escorts && flightConfig.escorts.length > 0) {
          flightConfig.escorts.forEach((escort, eIdx) => {
            const wobble = Math.sin(elapsed * 4.5 + eIdx * 2) * 6 * responsiveScale;
            const escortX = currentX + (escort.offset[0] + wobble) * responsiveScale * 1.3;
            const escortY = currentY + (escort.offset[1] + wobble * 0.6) * responsiveScale * 1.3;
            const escortRad = escort.radius * Math.max(0.85, responsiveScale * 1.15);
            const escortTrailLen = escortRad * 3.4 * (0.9 + progress * 0.4);
            const escortTrailW = escortRad * 1.1;

            // Escort fluid flame plume
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            const escortFlame = ctx.createLinearGradient(
              escortX, escortY,
              escortX + trailX * escortTrailLen,
              escortY + trailY * escortTrailLen
            );
            escort.trailStops.forEach(([st, col]) => escortFlame.addColorStop(st, col));

            ctx.beginPath();
            ctx.moveTo(escortX + normalX * escortTrailW, escortY + normalY * escortTrailW);
            ctx.quadraticCurveTo(
              escortX + trailX * (escortTrailLen * 0.42) + normalX * (escortTrailW * 1.25),
              escortY + trailY * (escortTrailLen * 0.42) + normalY * (escortTrailW * 1.25),
              escortX + trailX * escortTrailLen,
              escortY + trailY * escortTrailLen
            );
            ctx.quadraticCurveTo(
              escortX + trailX * (escortTrailLen * 0.5) - normalX * (escortTrailW * 1.15),
              escortY + trailY * (escortTrailLen * 0.5) - normalY * (escortTrailW * 1.15),
              escortX - normalX * escortTrailW,
              escortY - normalY * escortTrailW
            );
            ctx.closePath();
            ctx.fillStyle = escortFlame;
            ctx.fill();
            ctx.restore();

            // Escort craggy rock
            drawIntactAsteroid(ctx, escortX, escortY, escortRad, flightAngle + elapsed * 1.2);
          });
        }

        // ── B. PROPORTIONAL AERODYNAMIC FLAIR (Strictly scaled to the rock) ──
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // Flame width is strictly proportional to the rock (not an oversized triangle wedge)
        const flameWidth = mainRockRadius * 1.14;
        const flameLen = mainRockRadius * (3.4 + progress * 1.8);

        // 1. Atmospheric Blue Ionization Sheath (Hugging the rock boundary)
        const ionLen = flameLen * 1.1;
        const ionWidth = flameWidth * 1.22;
        const ionGrad = ctx.createLinearGradient(
          currentX, currentY,
          currentX + trailX * ionLen,
          currentY + trailY * ionLen
        );
        ionGrad.addColorStop(0, rgba(125, 211, 252, 0.7));
        ionGrad.addColorStop(0.3, rgba(56, 189, 248, 0.28));
        ionGrad.addColorStop(0.7, rgba(14, 165, 233, 0.08));
        ionGrad.addColorStop(1, rgba(2, 132, 199, 0));

        ctx.beginPath();
        ctx.moveTo(currentX + normalX * ionWidth, currentY + normalY * ionWidth);
        ctx.quadraticCurveTo(
          currentX + trailX * (ionLen * 0.45) + normalX * (ionWidth * 1.3),
          currentY + trailY * (ionLen * 0.45) + normalY * (ionWidth * 1.3),
          currentX + trailX * ionLen,
          currentY + trailY * ionLen
        );
        ctx.quadraticCurveTo(
          currentX + trailX * (ionLen * 0.52) - normalX * (ionWidth * 1.2),
          currentY + trailY * (ionLen * 0.52) - normalY * (ionWidth * 1.2),
          currentX - normalX * ionWidth,
          currentY - normalY * ionWidth
        );
        ctx.closePath();
        ctx.fillStyle = ionGrad;
        ctx.fill();

        // 2. Main Fiery Plasma Tongue
        const flameGrad = ctx.createLinearGradient(
          currentX, currentY,
          currentX + trailX * flameLen,
          currentY + trailY * flameLen
        );
        flameGrad.addColorStop(0, rgba(255, 255, 245, 1));
        flameGrad.addColorStop(0.22, rgba(255, 190, 45, 0.95));
        flameGrad.addColorStop(0.68, rgba(255, 75, 18, 0.55));
        flameGrad.addColorStop(1, rgba(185, 28, 20, 0));

        ctx.beginPath();
        ctx.moveTo(currentX + normalX * flameWidth, currentY + normalY * flameWidth);
        ctx.quadraticCurveTo(
          currentX + trailX * (flameLen * 0.42) + normalX * (flameWidth * 1.18),
          currentY + trailY * (flameLen * 0.42) + normalY * (flameWidth * 1.18),
          currentX + trailX * flameLen,
          currentY + trailY * flameLen
        );
        ctx.quadraticCurveTo(
          currentX + trailX * (flameLen * 0.5) - normalX * (flameWidth * 1.1),
          currentY + trailY * (flameLen * 0.5) - normalY * (flameWidth * 1.1),
          currentX - normalX * flameWidth,
          currentY - normalY * flameWidth
        );
        ctx.closePath();
        ctx.fillStyle = flameGrad;
        ctx.fill();

        // 3. White-Hot Core Stream
        const innerLen = flameLen * 0.58;
        const innerW = flameWidth * 0.46;
        ctx.beginPath();
        ctx.moveTo(currentX + normalX * innerW, currentY + normalY * innerW);
        ctx.quadraticCurveTo(
          currentX + trailX * (innerLen * 0.45) + normalX * (innerW * 1.15),
          currentY + trailY * (innerLen * 0.45) + normalY * (innerW * 1.15),
          currentX + trailX * innerLen,
          currentY + trailY * innerLen
        );
        ctx.quadraticCurveTo(
          currentX + trailX * (innerLen * 0.5) - normalX * (innerW * 1.1),
          currentY + trailY * (innerLen * 0.5) - normalY * (innerW * 1.1),
          currentX - normalX * innerW,
          currentY - normalY * innerW
        );
        ctx.closePath();
        ctx.fillStyle = rgba(255, 255, 255, 0.96);
        ctx.fill();

        // 4. Trailing Burning Sparks
        for (let p = 0; p < 20; p += 1) {
          const pFrac = (hash(p + elapsed * 6) + p) / 20;
          const px = currentX + trailX * (flameLen * pFrac) + normalX * (hash(p * 7) - 0.5) * flameWidth * 1.1;
          const py = currentY + trailY * (flameLen * pFrac) + normalY * (hash(p * 7) - 0.5) * flameWidth * 1.1;
          ctx.beginPath();
          ctx.fillStyle = rgba(255, 235, 160, 0.85 * (1 - pFrac));
          ctx.arc(px, py, (2 + hash(p * 3) * 2.8) * responsiveScale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // ── C. DRAW THE AUTHENTIC BADGE ASTEROID (Not a generic circle!) ──
        drawIntactAsteroid(ctx, currentX, currentY, mainRockRadius, flightAngle + elapsed * 0.25);

      } else if (elapsed < TOTAL_SEQUENCE) {
        // ── 5. PHYSICAL ROCK SHATTERING ON EARTH IMPACT (NO RIPPLE RING!) ──
        if (phase !== "shattered") {
          setPhase("shattered");
        }

        const impactTime = elapsed - FLIGHT_DURATION;
        const impactProg = impactTime / BREAK_DURATION;

        // Damped physical seismic rumble (shakes screen during impact)
        const shakeDecay = Math.exp(-impactTime * 9);
        const shakeAmp = 16 * shakeDecay;
        const shakeX = Math.sin(impactTime * 52) * shakeAmp;
        const shakeY = Math.cos(impactTime * 44) * (shakeAmp * 0.7);
        setRumbleOffset({ x: shakeX, y: shakeY });

        ctx.save();

        // A. Scorched Molten Crater on Impact Site (Dark rock & glowing orange magma)
        const craterW = mainRockRadius * (1.2 + impactProg * 0.6);
        const craterH = craterW * 0.35;
        const craterGrad = ctx.createRadialGradient(
          impactX, impactY, 4,
          impactX, impactY, craterW
        );
        craterGrad.addColorStop(0, rgba(255, 175, 45, Math.max(0, 0.9 - impactProg * 0.5)));
        craterGrad.addColorStop(0.35, rgba(220, 60, 15, Math.max(0, 0.7 - impactProg * 0.4)));
        craterGrad.addColorStop(0.8, rgba(25, 20, 30, Math.max(0, 0.6 - impactProg * 0.3)));
        craterGrad.addColorStop(1, rgba(0, 0, 0, 0));

        ctx.beginPath();
        ctx.ellipse(impactX, impactY, craterW, craterH, 0, 0, Math.PI * 2);
        ctx.fillStyle = craterGrad;
        ctx.fill();

        // B. Blinding Flash at Instant of Contact (first 120ms only)
        if (impactTime < 0.18) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          const flashAlpha = Math.max(0, 1 - impactTime / 0.18);
          const flashR = mainRockRadius * (2.5 + impactTime * 15);
          const flash = ctx.createRadialGradient(impactX, impactY, 8, impactX, impactY, flashR);
          flash.addColorStop(0, rgba(255, 255, 255, flashAlpha));
          flash.addColorStop(0.35, rgba(255, 210, 110, flashAlpha * 0.8));
          flash.addColorStop(0.7, rgba(255, 95, 20, flashAlpha * 0.3));
          flash.addColorStop(1, rgba(255, 45, 10, 0));
          ctx.fillStyle = flash;
          ctx.beginPath();
          ctx.arc(impactX, impactY, flashR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // C. PHYSICAL ROCK BREAK: FRACTURED BASALT CHUNKS FLYING OUTWARDS
        // Derives real polygon pieces from the authentic rock
        const fracturePieces = getFracturePieces(mainRockRadius);
        const gravity = 320 * responsiveScale; // Downward gravity on shards

        fracturePieces.forEach((piece) => {
          const chunkX = impactX + piece.vx * impactTime * responsiveScale;
          const chunkY = impactY + piece.vy * impactTime * responsiveScale + 0.5 * gravity * impactTime * impactTime;
          const chunkAngle = piece.rotSpeed * impactTime;
          const fadeAlpha = Math.max(0, 1 - impactProg * 0.6);

          ctx.save();
          ctx.translate(chunkX, chunkY);
          ctx.rotate(chunkAngle);

          // Draw the jagged basalt rock chunk
          ctx.beginPath();
          piece.polygon.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();

          // Basalt rock texture
          const chunkGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, mainRockRadius * 0.5);
          chunkGrad.addColorStop(0, "#7a7469");
          chunkGrad.addColorStop(0.4, "#454345");
          chunkGrad.addColorStop(0.85, "#1c1d29");
          chunkGrad.addColorStop(1, "#0a0d17");
          ctx.fillStyle = chunkGrad;
          ctx.globalAlpha = fadeAlpha;
          ctx.fill();

          // Outer broken edges with glowing molten fracture lines
          ctx.lineWidth = Math.max(2, mainRockRadius * 0.08);
          ctx.strokeStyle = rgba(255, 145, 45, fadeAlpha);
          ctx.shadowColor = "#ff731d";
          ctx.shadowBlur = 10;
          ctx.stroke();

          ctx.restore();

          // Molten ember trail following each flying chunk
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.beginPath();
          ctx.moveTo(chunkX, chunkY);
          ctx.lineTo(chunkX - piece.vx * 0.035, chunkY - piece.vy * 0.035);
          ctx.strokeStyle = rgba(255, 175, 55, fadeAlpha);
          ctx.lineWidth = Math.max(1.5, 3 * responsiveScale);
          ctx.shadowColor = "#ff731d";
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.restore();
        });

        // D. Violent Upward Spray of Molten Sparks & Flying Debris
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const sparkCount = 32;
        for (let s = 0; s < sparkCount; s += 1) {
          const sAngle = -Math.PI * 0.94 + (Math.PI * 0.88 * (s / (sparkCount - 1))) + (hash(s * 9) - 0.5) * 0.2;
          const sSpeed = (340 + hash(s * 17) * 450) * responsiveScale;
          const sx = impactX + Math.cos(sAngle) * sSpeed * impactTime;
          const sy = impactY + Math.sin(sAngle) * sSpeed * impactTime + 0.5 * gravity * impactTime * impactTime;
          const sRad = (2.2 + hash(s * 3) * 3.5) * responsiveScale * Math.max(0.2, 1 - impactProg);

          ctx.beginPath();
          ctx.fillStyle = rgba(255, 220, 130, Math.max(0, 1 - impactProg * 1.15));
          ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        ctx.restore();

      } else {
        // ── 6. POST-IMPACT: RESTING SCORCHED GLOW ──
        if (phase !== "celebrate") {
          setPhase("celebrate");
          setRumbleOffset({ x: 0, y: 0 });
        }

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const restGrad = ctx.createRadialGradient(
          impactX, impactY, 10,
          impactX, impactY, 240 * responsiveScale
        );
        restGrad.addColorStop(0, rgba(255, 180, 80, 0.4));
        restGrad.addColorStop(0.35, rgba(255, 100, 20, 0.18));
        restGrad.addColorStop(1, rgba(255, 50, 10, 0));
        ctx.fillStyle = restGrad;
        ctx.beginPath();
        ctx.arc(impactX, impactY, 240 * responsiveScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, flightConfig]);

  const BadgeComponent = getBadgeComponentForDays(days);
  const badgeTitle = achievement?.name || `${days}-Day Daily Practice Streak`;

  return (
    <div
      style={{
        transform: `translate3d(${rumbleOffset.x}px, ${rumbleOffset.y}px, 0)`,
      }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden select-none bg-black"
    >
      {/* Background Full-Screen Cosmic Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Header Controls */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Cosmic Streak Milestone • {flightConfig.tierName}</span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-gray-300 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
          title="Return (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Centerpiece: Badge & Congratulations Announcement (ONLY REVEALED AFTER CRASH & PHYSICAL SHATTERING!) */}
      <div
        className={`relative z-10 flex flex-col items-center text-center max-w-lg my-auto px-4 transition-all duration-700 ${
          phase === "celebrate"
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        {/* Floating Streak Badge Token */}
        <div className="py-3 transform transition-transform hover:scale-105 duration-300 drop-shadow-[0_20px_40px_rgba(249,115,22,0.45)]">
          <BadgeComponent
            size={180}
            earned={true}
            count={days}
            animated={true}
          />
        </div>

        {/* Celebratory Milestone Card */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Impact Confirmed
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
              Congratulations!
            </h2>

            <p className="text-base sm:text-lg font-extrabold text-amber-300 drop-shadow-sm">
              You Reached Your {days}-Day Daily Practice Streak!
            </p>

            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed font-medium">
              {achievement?.description || `By practicing CBT questions continuously for ${days} days, you have earned the official ${badgeTitle} honor.`}
            </p>
          </div>

          {/* Action Buttons: Return & Replay */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Trophy Room</span>
            </button>

            <button
              onClick={startAnimation}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Replay Animation</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 pb-2 text-center">
        <p className="text-[11px] font-bold text-gray-400/80 tracking-wide">
          Tutorial Center Africa • Academic Excellence Rewards
        </p>
      </div>
    </div>
  );
}

