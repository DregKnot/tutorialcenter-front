import React, { useEffect, useRef } from "react";

const ARTBOARD = 512;

// Deterministic PRNG to ensure reproducible starfields and particle scatters
const hash = (value) => {
  const sine = Math.sin(value * 12.9898) * 43758.5453;
  return sine - Math.floor(sine);
};

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * CosmicStreakCanvas
 * 
 * High-performance, parametric HTML5 2D Canvas engine for the Cosmic Streak Medal suite.
 * Supports:
 * - Deterministic cosmic starfields and optional planetary atmospheres/horizons
 * - Multi-layer turbulent plasma plumes and shockwave cones
 * - Dynamic primary asteroid with crater indentations & magma fissures
 * - Satellite escort rocks & debris shards (escalating with streak tiers)
 * - Zero-CPU static rendering when animated=false; smooth RAF loop when animated=true
 */
export default function CosmicStreakCanvas({
  size = 140,
  earned = true,
  count = 100,
  animated = false,
  className = "",
  label = null,
  config = {},
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = ARTBOARD * pixelRatio;
    canvas.height = ARTBOARD * pixelRatio;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const shouldAnimate = earned && animated && !reduceMotion;
    let frameId;

    // Destructure tier configurations with safe defaults
    const {
      direction = { x: -0.64, y: 0.77 },
      origin = { x: 288, y: 230 },
      spaceGradient = ["#122244", "#071329", "#020611"],
      starCount = 60,
      showHorizon = true,
      horizonColors = ["#123d70", "#071b41", "#02050d"],
      horizonGlow = rgba(85, 190, 255, 0.74),
      horizonGlowBlur = 18,
      mainRock = {
        baseRadius: 70,
        silhouette: [70, 65, 76, 62, 72, 58, 74, 66, 69, 77, 62, 71],
        gradient: ["#a59a87", "#5e5a59", "#272836", "#0d1220"],
        strokeColor: rgba(255, 122, 28, 0.82),
        strokeWidth: 8,
        shadowColor: "#ff671c",
        shadowBlur: 18,
        craters: [[-22, -22, 18, 12], [18, -31, 13, 9], [28, 24, 20, 13], [-23, 28, 12, 8]],
        fissurePath: [[-42, 5], [-18, 0], [-16, 18], [8, 10], [24, 5], [48, 9]],
        fissureColor: rgba(255, 158, 53, 0.86),
        fissureGlow: "#ff731d",
      },
      satelliteRocks = [],
      flames = [
        { width: 70, length: 330, opacity: 0.48, stops: [[0, rgba(255, 246, 190, 0.9)], [0.22, rgba(255, 115, 21, 0.78)], [0.72, rgba(208, 37, 24, 0.3)], [1, rgba(96, 12, 20, 0)]] },
        { width: 42, length: 285, opacity: 0.88, stops: [[0, rgba(255, 255, 220, 1)], [0.18, rgba(255, 190, 45, 0.95)], [0.65, rgba(255, 76, 18, 0.58)], [1, rgba(185, 28, 20, 0)]] },
        { width: 18, length: 245, opacity: 0.95, stops: [[0, rgba(255, 255, 245, 1)], [0.28, rgba(255, 226, 112, 0.96)], [0.75, rgba(255, 99, 24, 0.56)], [1, rgba(255, 64, 10, 0)]] },
      ],
      particles = {
        count: 28,
        speedMultiplier: 0.17,
        hotColor: rgba(255, 245, 174, 0.92),
        coolColorBase: [255, 93, 20],
      },
      shockwave = {
        offset: 44,
        radius: 112,
        stops: [[0, rgba(255, 253, 212, 0.95)], [0.18, rgba(255, 177, 43, 0.62)], [0.52, rgba(255, 65, 18, 0.19)], [1, rgba(255, 45, 10, 0)]],
      },
      cosmicRays = null, // Optional for high tiers (365 days / 180 days)
      labelColor = rgba(210, 236, 255, 0.86),
    } = config;

    const trail = { x: -direction.x, y: -direction.y };
    const normal = { x: -trail.y, y: trail.x };
    const angle = Math.atan2(direction.y, direction.x);

    const draw = (elapsed = 0) => {
      const seconds = elapsed / 1000;
      const surge = shouldAnimate ? Math.sin(seconds * 5.1) * 4 : 0;
      const drift = shouldAnimate ? Math.sin(seconds * 2.2) * 5 : 0;
      const meteorX = origin.x + drift;
      const meteorY = origin.y + surge;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, ARTBOARD, ARTBOARD);

      // ── 1. DEEP SPACE BACKGROUND ──
      const space = context.createRadialGradient(270, 220, 15, 260, 260, 410);
      space.addColorStop(0, spaceGradient[0]);
      space.addColorStop(0.55, spaceGradient[1]);
      space.addColorStop(1, spaceGradient[2]);
      context.fillStyle = space;
      context.fillRect(0, 0, ARTBOARD, ARTBOARD);

      // ── 2. COSMIC STARFIELD ──
      if (starCount > 0) {
        for (let i = 0; i < starCount; i += 1) {
          const x = hash(i + 1) * ARTBOARD;
          const y = hash(i + 50) * 430;
          const radius = 0.6 + hash(i + 90) * 1.8;
          const pulse = shouldAnimate
            ? 0.55 + 0.45 * Math.sin(seconds * (1.3 + hash(i) * 2) + i)
            : 0.85;
          context.beginPath();
          context.fillStyle = rgba(210, 235, 255, 0.25 + pulse * 0.55);
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      // ── 3. PLANETARY HORIZON ATMOSPHERE (if enabled) ──
      if (showHorizon) {
        context.beginPath();
        context.moveTo(-30, 525);
        context.quadraticCurveTo(256, 404, 550, 522);
        context.lineTo(550, 560);
        context.lineTo(-30, 560);
        context.closePath();
        const earth = context.createLinearGradient(0, 400, 0, 530);
        earth.addColorStop(0, horizonColors[0]);
        earth.addColorStop(0.14, horizonColors[1]);
        earth.addColorStop(1, horizonColors[2]);
        context.fillStyle = earth;
        context.fill();

        context.save();
        context.globalCompositeOperation = "lighter";
        context.beginPath();
        context.moveTo(-10, 504);
        context.quadraticCurveTo(256, 397, 530, 502);
        context.strokeStyle = horizonGlow;
        context.shadowColor = horizonGlow;
        context.shadowBlur = horizonGlowBlur;
        context.lineWidth = 4;
        context.stroke();
        context.restore();
      }

      // ── 4. COSMIC RAYS / SOLAR CORONA (High Tiers) ──
      if (cosmicRays) {
        context.save();
        context.globalCompositeOperation = "lighter";
        const rayCount = cosmicRays.count || 12;
        const rayLength = cosmicRays.length || 240;
        const rayColor = cosmicRays.color || rgba(255, 225, 120, 0.18);
        for (let r = 0; r < rayCount; r += 1) {
          const rayAngle = (Math.PI * 2 * r) / rayCount + (shouldAnimate ? seconds * 0.2 : 0);
          const rx = meteorX + Math.cos(rayAngle) * rayLength;
          const ry = meteorY + Math.sin(rayAngle) * rayLength;
          context.beginPath();
          context.moveTo(meteorX, meteorY);
          context.lineTo(rx, ry);
          context.strokeStyle = rayColor;
          context.lineWidth = cosmicRays.width || 3;
          context.stroke();
        }
        context.restore();
      }

      // ── 5. TURBULENT FLAME PLUMES ──
      context.save();
      context.globalCompositeOperation = "lighter";

      const drawFlameLayer = (originX, originY, width, length, opacity, colorStops, customNormal = normal, customTrail = trail) => {
        const endX = originX + customTrail.x * length;
        const endY = originY + customTrail.y * length;
        const flame = context.createLinearGradient(originX, originY, endX, endY);
        colorStops.forEach(([stop, color]) => flame.addColorStop(stop, color));

        context.beginPath();
        context.moveTo(originX + customNormal.x * width, originY + customNormal.y * width);
        context.quadraticCurveTo(
          originX + customTrail.x * (length * 0.42) + customNormal.x * width * 1.4,
          originY + customTrail.y * (length * 0.42) + customNormal.y * width * 1.4,
          endX + customNormal.x * width * 0.08,
          endY + customNormal.y * width * 0.08
        );
        context.quadraticCurveTo(
          originX + customTrail.x * (length * 0.52) - customNormal.x * width * 1.15,
          originY + customTrail.y * (length * 0.52) - customNormal.y * width * 1.15,
          originX - customNormal.x * width,
          originY - customNormal.y * width
        );
        context.closePath();
        context.globalAlpha = opacity;
        context.fillStyle = flame;
        context.fill();
      };

      // Draw primary flames
      flames.forEach((flame) => {
        drawFlameLayer(meteorX, meteorY, flame.width, flame.length, flame.opacity, flame.stops);
      });

      // ── 6. SATELLITE ESCORT ROCKS & MINI PLASMA TAILS ──
      if (satelliteRocks && satelliteRocks.length > 0) {
        satelliteRocks.forEach((sat, sIdx) => {
          const satPhase = sIdx * 1.8;
          const satDrift = shouldAnimate ? Math.sin(seconds * (1.8 + sat.speed || 2) + satPhase) * (sat.orbitRadius || 8) : 0;
          const satX = meteorX + sat.offset[0] + satDrift;
          const satY = meteorY + sat.offset[1] + satDrift * 0.6;

          // Mini flame tail for satellite
          if (sat.trailLength && sat.trailStops) {
            drawFlameLayer(satX, satY, sat.trailWidth || 10, sat.trailLength || 120, sat.trailOpacity || 0.7, sat.trailStops);
          }

          // Mini rock body
          context.save();
          context.translate(satX, satY);
          context.rotate(angle + (shouldAnimate ? seconds * (sat.spin || 0.4) : 0));
          context.beginPath();
          const satRad = sat.radius || 14;
          const points = sat.points || 7;
          for (let p = 0; p < points; p += 1) {
            const pAngle = (Math.PI * 2 * p) / points;
            const jitter = 0.8 + hash(p + sIdx * 13) * 0.4;
            const px = Math.cos(pAngle) * satRad * jitter;
            const py = Math.sin(pAngle) * satRad * jitter * 0.9;
            if (p === 0) context.moveTo(px, py);
            else context.lineTo(px, py);
          }
          context.closePath();

          const satGrad = context.createRadialGradient(-satRad * 0.3, -satRad * 0.3, 2, 0, 0, satRad);
          const rockGradStops = sat.gradient || ["#b5a593", "#5c5553", "#23242e", "#0e111a"];
          satGrad.addColorStop(0, rockGradStops[0]);
          satGrad.addColorStop(0.3, rockGradStops[1]);
          satGrad.addColorStop(0.7, rockGradStops[2]);
          satGrad.addColorStop(1, rockGradStops[3]);
          context.fillStyle = satGrad;
          context.shadowColor = sat.glow || "#ff731d";
          context.shadowBlur = sat.shadowBlur || 12;
          context.fill();

          context.lineWidth = sat.strokeWidth || 3;
          context.strokeStyle = sat.strokeColor || rgba(255, 140, 40, 0.75);
          context.stroke();
          context.restore();
        });
      }

      // ── 7. BURNING DEBRIS & EJECTA PARTICLES ──
      if (particles.count > 0) {
        for (let i = 0; i < particles.count; i += 1) {
          const seed = hash(i + 212);
          const progress = (seed + (shouldAnimate ? seconds * (particles.speedMultiplier + hash(i + 44) * 0.16) : 0)) % 1;
          const distance = 45 + progress * 290;
          const scatter = (hash(i + 77) - 0.5) * (20 + progress * 95);
          const px = meteorX + trail.x * distance + normal.x * scatter;
          const py = meteorY + trail.y * distance + normal.y * scatter;
          const radius = (1.5 + hash(i + 9) * 5.2) * (1 - progress * 0.45);

          context.beginPath();
          context.fillStyle = progress < 0.32
            ? particles.hotColor
            : rgba(particles.coolColorBase[0], particles.coolColorBase[1], particles.coolColorBase[2], 0.65 * (1 - progress));
          context.arc(px, py, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.restore();

      // ── 8. SHOCKWAVE / COMPRESSION CONE AT LEADING EDGE ──
      if (shockwave && shockwave.radius > 0) {
        context.save();
        context.globalCompositeOperation = "lighter";
        const impactX = meteorX + direction.x * shockwave.offset;
        const impactY = meteorY + direction.y * shockwave.offset;
        const impact = context.createRadialGradient(impactX, impactY, 4, impactX, impactY, shockwave.radius);
        shockwave.stops.forEach(([st, col]) => impact.addColorStop(st, col));
        context.fillStyle = impact;
        context.beginPath();
        context.arc(impactX, impactY, shockwave.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      // ── 9. MAIN ASTEROID ROCK SILHOUETTE ──
      context.save();
      context.translate(meteorX, meteorY);
      context.rotate(angle + (shouldAnimate ? seconds * 0.16 : 0));

      const silhouette = mainRock.silhouette || [70, 65, 76, 62, 72, 58, 74, 66, 69, 77, 62, 71];
      context.beginPath();
      silhouette.forEach((rad, index) => {
        const pointAngle = (Math.PI * 2 * index) / silhouette.length;
        const rx = Math.cos(pointAngle) * rad;
        const ry = Math.sin(pointAngle) * rad * 0.9;
        if (index === 0) context.moveTo(rx, ry);
        else context.lineTo(rx, ry);
      });
      context.closePath();

      const rockGrad = context.createRadialGradient(-26, -28, 4, 0, 0, mainRock.baseRadius * 1.25);
      mainRock.gradient.forEach((color, gIdx) => {
        const stops = [0, 0.24, 0.63, 1];
        rockGrad.addColorStop(stops[gIdx] ?? gIdx / (mainRock.gradient.length - 1), color);
      });
      context.fillStyle = rockGrad;
      context.shadowColor = mainRock.shadowColor;
      context.shadowBlur = mainRock.shadowBlur;
      context.fill();

      context.lineWidth = mainRock.strokeWidth;
      context.strokeStyle = mainRock.strokeColor;
      context.stroke();

      // Craters
      context.shadowBlur = 0;
      if (mainRock.craters && mainRock.craters.length > 0) {
        mainRock.craters.forEach(([cx, cy, cw, ch]) => {
          context.beginPath();
          context.ellipse(cx, cy, cw, ch, -0.45, 0, Math.PI * 2);
          context.fillStyle = "#151724";
          context.fill();
          context.strokeStyle = rgba(214, 115, 38, 0.38);
          context.lineWidth = 3;
          context.stroke();
        });
      }

      // Molten Magma Fissures
      if (mainRock.fissurePath && mainRock.fissurePath.length > 1) {
        context.beginPath();
        context.moveTo(mainRock.fissurePath[0][0], mainRock.fissurePath[0][1]);
        for (let f = 1; f < mainRock.fissurePath.length; f += 1) {
          const pt = mainRock.fissurePath[f];
          context.lineTo(pt[0], pt[1]);
        }
        context.strokeStyle = mainRock.fissureColor;
        context.shadowColor = mainRock.fissureGlow;
        context.shadowBlur = 8;
        context.lineWidth = 5;
        context.stroke();
      }
      context.restore();

      // ── 10. MILESTONE INSCRIPTION BADGE ──
      context.save();
      context.textAlign = "center";
      context.font = "800 18px Arial, sans-serif";
      context.letterSpacing = "3px";
      context.fillStyle = labelColor;
      const textToDisplay = label || `${count} DAY STREAK`;
      context.fillText(textToDisplay, 256, 482);
      context.restore();
    };

    const animate = (time) => {
      draw(time);
      frameId = window.requestAnimationFrame(animate);
    };

    draw(0);
    if (shouldAnimate) {
      frameId = window.requestAnimationFrame(animate);
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [animated, count, earned, size, config, label]);

  const dropShadow = config.shadowColor || "rgba(249,115,22,0.28)";

  return (
    <canvas
      ref={canvasRef}
      aria-label={`${count}-day streak badge`}
      className={`block rounded-[24%] transition-all duration-300 ${
        earned ? `drop-shadow-[0_18px_24px_${dropShadow}]` : "grayscale contrast-75 opacity-40"
      } ${className}`}
      role="img"
      style={{ height: size, width: size }}
    />
  );
}
