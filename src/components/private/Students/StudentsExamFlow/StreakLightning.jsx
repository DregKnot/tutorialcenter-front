import React, { useEffect, useRef, useMemo } from "react";

// ---------------------------------------------------------------------------
// getStreakLightningStyles
// 4 voltage tiers + inactive level 0, matched to the design palette of StreakFire
// with deep atmospheric badge gradients, electric core highlights, and arc glow.
// ---------------------------------------------------------------------------
export const getStreakLightningStyles = (actualStreak) => {
  if (actualStreak <= 0) {
    return {
      outer: ["#475569", "#64748B"],
      middle: ["#64748B", "#94A3B8"],
      inner: ["#CBD5E1", "#F8FAFC"],
      glow: "rgba(100, 116, 139, 0.15)",
      ambientLight: "rgba(100, 116, 139, 0.05)",
      scale: 0.75,
      speed: "3s",
      level: 0,
      sparks: 0,
      sparkColor: "#64748B",
      arcColor: "rgba(148, 163, 184, 0.3)",
      title: "Discharged",
      bgClass: "bg-gray-950",
    };
  }

  let level = 1;
  let progress = 1;
  let t = 0;

  // Day 30 to 60+ progression (matching Fire palette across 30 days):
  // Days 30-36: Yellow / Gold (7 days)
  // Days 37-43: Orange (7 days)
  // Days 44-50: Red / Crimson (7 days)
  // Days 51-60+: Blue / Cyan (10+ days)
  if (actualStreak >= 30) {
    if (actualStreak <= 36) {
      level = 1;
      progress = actualStreak - 29; // 1 to 7
      t = (progress - 1) / 6;
    } else if (actualStreak <= 43) {
      level = 2;
      progress = actualStreak - 36; // 1 to 7
      t = (progress - 1) / 6;
    } else if (actualStreak <= 50) {
      level = 3;
      progress = actualStreak - 43; // 1 to 7
      t = (progress - 1) / 6;
    } else {
      level = 4;
      progress = Math.min(10, actualStreak - 50); // 1 to 10
      t = (progress - 1) / 9;
    }
  } else {
    // Relative scaling fallback for demo numbers (1-29)
    if (actualStreak <= 7) {
      level = 1;
      progress = actualStreak;
      t = (progress - 1) / 6;
    } else if (actualStreak <= 14) {
      level = 2;
      progress = actualStreak - 7;
      t = (progress - 1) / 6;
    } else if (actualStreak <= 21) {
      level = 3;
      progress = actualStreak - 14;
      t = (progress - 1) / 6;
    } else {
      level = 4;
      progress = Math.min(8, actualStreak - 21);
      t = (progress - 1) / 7;
    }
  }

  // Smooth everyday growth in scale & speed
  const scale = 0.78 + (level - 1) * 0.04 + t * 0.08;
  const speed = `${Math.max(0.65, 1.5 - (level - 1) * 0.2 - t * 0.2)}s`;

  let outer, middle, inner, glow, ambientLight, title, sparkColor, arcColor, bgClass;

  if (level === 1) {
    // Level 1: Volt Amber / Yellow (Days 30–36)
    outer = ["#D97706", "#F59E0B"];
    middle = ["#FBBF24", "#FEF08A"];
    inner = ["#FEF9C3", "#FFFFFF"];
    glow = `rgba(245, 158, 11, ${0.45 + t * 0.3})`;
    ambientLight = `rgba(245, 158, 11, ${0.32 + t * 0.2})`;
    sparkColor = "#FACC15";
    arcColor = "rgba(251, 191, 36, 0.9)";
    title = "Yellow Lightning";
    bgClass = "bg-amber-950/40";
  } else if (level === 2) {
    // Level 2: Volt Orange (Days 37–43)
    outer = ["#D6350F", "#F0501A"];
    middle = ["#F0501A", "#FF8A1E"];
    inner = ["#FFD199", "#FFF4E2"];
    glow = `rgba(240, 80, 26, ${0.5 + t * 0.3})`;
    ambientLight = `rgba(240, 80, 26, ${0.35 + t * 0.2})`;
    sparkColor = "#FF8A1E";
    arcColor = "rgba(240, 80, 26, 0.9)";
    title = "Orange Lightning";
    bgClass = "bg-orange-950/40";
  } else if (level === 3) {
    // Level 3: Crimson Lightning (Days 44–50)
    outer = ["#A6120F", "#DC2626"];
    middle = ["#DC2626", "#EF4444"];
    inner = ["#FCA5A5", "#FFF1F2"];
    glow = `rgba(220, 38, 38, ${0.55 + t * 0.35})`;
    ambientLight = `rgba(220, 38, 38, ${0.38 + t * 0.22})`;
    sparkColor = "#EF4444";
    arcColor = "rgba(239, 68, 68, 0.95)";
    title = "Crimson Lightning";
    bgClass = "bg-red-950/40";
  } else {
    // Level 4: Singularity Blue Lightning (Days 51–60+)
    outer = ["#0B3D91", "#1668C7"];
    middle = ["#1668C7", "#22B8D8"];
    inner = ["#9CEEF5", "#FFFFFF"];
    glow = `rgba(34, 184, 216, ${0.65 + t * 0.35})`;
    ambientLight = `rgba(34, 184, 216, ${0.42 + t * 0.25})`;
    sparkColor = "#22B8D8";
    arcColor = "rgba(34, 184, 216, 0.98)";
    title = "Singularity Blue Lightning";
    bgClass = "bg-cyan-950/40";
  }

  // Sparks count grows each mode and everyday (strictly more sparks than Fire)
  const sparks = level === 1 ? (4 + Math.floor(t * 2))
               : level === 2 ? (7 + Math.floor(t * 2))
               : level === 3 ? (10 + Math.floor(t * 3))
               : (14 + Math.floor(t * 4));

  return {
    outer,
    middle,
    inner,
    glow,
    ambientLight,
    scale,
    speed,
    level,
    sparks,
    sparkColor,
    arcColor,
    title,
    bgClass,
  };
};

const DESIGN = 108;

export const StreakLightning = ({ streak = 1, size = 64 }) => {
  const canvasRef = useRef(null);

  const styles = useMemo(() => getStreakLightningStyles(streak), [streak]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    const renderSize = Math.round(size * 1.4);
    const k = renderSize / DESIGN;
    canvas.width = renderSize * dpr;
    canvas.height = renderSize * dpr;
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);

    const s = getStreakLightningStyles(streak);
    const isLit = streak > 0;

    let animationId;
    let time = 0;
    const baseSpeed = 0.05 + Math.min(streak * 0.003, 0.06);

    const cx = DESIGN / 2;
    const cy = DESIGN / 2;

    // Iconic 6-point lightning bolt coordinates in 108x108 design space (with breathing room)
    const BASE_BOLT = [
      [63, 14], // P0: Top needle tip
      [30, 52], // P1: Left outer elbow (prominent outward thrust)
      [49, 48], // P2: Left inner notch (crisp angled cut into waist)
      [43, 92], // P3: Bottom needle tip
      [78, 54], // P4: Right outer elbow (prominent outward thrust)
      [59, 58], // P5: Right inner notch (crisp angled cut into waist)
    ];

    // Helper: draw the lightning bolt polygon with scale, offset, and high-energy electric waver
    const boltPath = (scale, yOffset, jitterAmp, phase) => {
      const jx = (i) => Math.sin(phase * 2.2 + i * 1.5) * jitterAmp;
      const jy = (i) => Math.cos(phase * 2.6 + i * 1.8) * jitterAmp * 0.8;

      ctx.beginPath();
      BASE_BOLT.forEach(([bx, by], i) => {
        const x = cx + (bx - 54) * scale + jx(i);
        const y = cy + (by - 54) * scale + yOffset + jy(i);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    };

    // Helper to generate electric crackle arcs branching off the bolt
    const drawElectricArc = (startX, startY, endX, endY) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      const segments = 4;
      let currX = startX;
      let currY = startY;

      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const targetX = startX + (endX - startX) * t;
        const targetY = startY + (endY - startY) * t;

        // Perpendicular offset with electric randomness
        const perpX = -(endY - startY);
        const perpY = endX - startX;
        const len = Math.hypot(perpX, perpY) || 1;
        const disp = (Math.sin(time * 15 + i * 4) * 5 + (Math.random() - 0.5) * 3) * (1 - Math.abs(t - 0.5) * 1.5);

        currX = targetX + (perpX / len) * disp;
        currY = targetY + (perpY / len) * disp;
        ctx.lineTo(currX, currY);
      }

      ctx.stroke();
    };

    const render = () => {
      time += baseSpeed;
      ctx.clearRect(0, 0, DESIGN, DESIGN);

      // 1. Plasma core aura / corona behind the bolt
      if (isLit) {
        const coronaGrad = ctx.createRadialGradient(cx, cy + 2, 2, cx, cy + 2, 42);
        coronaGrad.addColorStop(0, s.glow);
        coronaGrad.addColorStop(0.65, s.glow.replace(/[\d.]+\)$/, "0.22)"));
        coronaGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(cx, cy + 2, 42, 0, Math.PI * 2);
        ctx.fill();
      }

      const amp = isLit ? 1 : 0.08;

      // 2. Outer bolt silhouette & dark stroke boundary
      boltPath(1, 0, 1.2 * amp, time);
      ctx.lineWidth = 4.8;
      ctx.strokeStyle = "#05070A";
      ctx.lineJoin = "round";
      ctx.stroke();

      const gOuter = ctx.createLinearGradient(cx - 24, cy - 42, cx + 24, cy + 44);
      gOuter.addColorStop(0, s.outer[1]);
      gOuter.addColorStop(0.5, s.outer[0]);
      gOuter.addColorStop(1, s.outer[1]);
      ctx.fillStyle = gOuter;
      ctx.fill();

      // 3. Chiseled 3D Bevel Facet on Left Side
      ctx.save();
      const p0 = [cx + (63 - 54), cy + (14 - 54)];
      const p1 = [cx + (30 - 54), cy + (52 - 54)];
      const p2 = [cx + (49 - 54), cy + (48 - 54)];
      const p3 = [cx + (43 - 54), cy + (92 - 54)];
      const pSpine = [cx, cy];
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.lineTo(pSpine[0], pSpine[1]);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fill();
      ctx.restore();

      // 4. Middle high-voltage electric body
      boltPath(0.72, 0.5, 0.8 * amp, time * 1.35 + 0.8);
      const gMid = ctx.createLinearGradient(cx - 15, cy - 25, cx + 15, cy + 30);
      gMid.addColorStop(0, s.middle[0]);
      gMid.addColorStop(0.5, s.middle[1]);
      gMid.addColorStop(1, s.middle[0]);
      ctx.fillStyle = gMid;
      ctx.fill();

      // 5. Inner white-hot plasma filament
      boltPath(0.44, 1.0, 0.5 * amp, time * 1.8 + 1.5);
      const gInner = ctx.createLinearGradient(cx - 8, cy - 18, cx + 8, cy + 20);
      gInner.addColorStop(0, s.inner[0]);
      gInner.addColorStop(1, s.inner[1]);
      ctx.fillStyle = gInner;
      ctx.fill();

      // 6. Glowing center spine ridge
      if (isLit) {
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(pSpine[0], pSpine[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 7. Electric crackle arcs branching off during active streak
      if (isLit && s.level >= 1) {
        ctx.save();
        ctx.strokeStyle = s.arcColor;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";

        // Arc 1: Leaping off left elbow (P1)
        const arcFlicker1 = Math.sin(time * 12);
        if (arcFlicker1 > 0.15) {
          ctx.globalAlpha = Math.min(1, arcFlicker1 * 1.1);
          drawElectricArc(cx - 24, cy - 2, cx - 40, cy - 14);
        }

        // Arc 2: Leaping off right elbow (P4)
        const arcFlicker2 = Math.cos(time * 14 + 1);
        if (arcFlicker2 > 0.2) {
          ctx.globalAlpha = Math.min(1, arcFlicker2 * 1.1);
          drawElectricArc(cx + 24, cy, cx + 40, cy + 12);
        }

        // Arc 3: Leaping off bottom ground tip (P3)
        if (s.level >= 2) {
          const arcFlicker3 = Math.sin(time * 16 + 2.5);
          if (arcFlicker3 > 0.25) {
            ctx.globalAlpha = Math.min(1, arcFlicker3 * 1.2);
            drawElectricArc(cx - 11, cy + 38, cx - 26, cy + 28);
          }
        }
        ctx.restore();
      }

      // 8. Orbiting & discharging electric spark particles
      if (isLit && s.sparks > 0) {
        ctx.fillStyle = s.sparkColor;
        for (let i = 0; i < s.sparks; i++) {
          const speedFactor = 2.2 + (i % 3) * 0.8;
          const angle = time * speedFactor + (i * (Math.PI * 2)) / s.sparks;
          const radiusX = 26 + (i % 2) * 8;
          const radiusY = 34 + (i % 2) * 6;
          const sx = cx + Math.cos(angle) * radiusX;
          const sy = cy + Math.sin(angle) * radiusY;

          // Spark pulse
          const sparkPulse = 0.5 + 0.5 * Math.sin(time * 8 + i * 2);
          ctx.globalAlpha = 0.4 + sparkPulse * 0.6;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2 + (i % 2) * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (isLit) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [streak, size]);

  const renderSize = Math.round(size * 1.35);

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Black rounded squircle badge tile that accepts the light of the lightning */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          backgroundColor: "#000000",
          boxShadow: `inset 0 0 20px ${styles.glow}, inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -3px 8px rgba(0,0,0,0.9)`,
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Ambient radial glow on black accepting the lightning's light */}
        <div
          className="absolute inset-0 transition-all duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${styles.ambientLight} 0%, rgba(0,0,0,0.55) 60%, #000000 100%)`,
          }}
        />
      </div>

      {/* Lightning canvas with drop-shadow glow bleeding past the badge */}
      <canvas
        ref={canvasRef}
        style={{
          width: renderSize,
          height: renderSize,
          transform: `scale(${styles.scale})`,
          filter: `drop-shadow(0 0 10px ${styles.glow})`,
        }}
        className="absolute pointer-events-none"
      />
    </div>
  );
};
