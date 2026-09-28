import React, { useEffect, useRef, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// getStreakFlameStyles
// Same level system as your original (4 tiers, 7 days each), tuned so the
// level-1 palette sits closer to the reference flame icon, plus a `badge`
// color pair for the dark tile behind the flame.
//
// API change to flag: `sparks` is now a count (0–6) instead of a boolean,
// so spark density scales with level. Update any code that treats it as
// truthy/falsy — `styles.sparks > 0` instead of `styles.sparks`.
// ---------------------------------------------------------------------------
export const getStreakFlameStyles = (actualStreak) => {
  if (actualStreak <= 0) {
    return {
      outer: ["#4A5568", "#718096"],
      middle: ["#718096", "#A0AEC0"],
      inner: ["#CBD5E0", "#F1F5F9"],
      glow: "rgba(113, 128, 150, 0.15)",
      badge: ["#1D2027", "#111318"],
      scale: 0.78,
      speed: "3s",
      level: 0,
      sparks: 0,
      sparkColor: null,
      title: "Inactive",
      bgClass: "bg-gray-50 dark:bg-gray-900/30",
    };
  }

  let level = 1;
  let progress = 1; // 1 to 7/8 within tier
  let t = 0;

  // Exact 4-color progression:
  // Days 1-7: Yellow, grows everyday
  // Days 8-14: Orange, turns on day 8 and grows until day 14
  // Days 15-21: Red, turns on day 15 and increases until day 21
  // Days 22-29: Blue, turns on day 22 and increases with more sparks
  if (actualStreak <= 7) {
    level = 1;
    progress = actualStreak; // 1 to 7
    t = (progress - 1) / 6; // 0 to 1
  } else if (actualStreak <= 14) {
    level = 2;
    progress = actualStreak - 7; // 1 to 7
    t = (progress - 1) / 6; // 0 to 1
  } else if (actualStreak <= 21) {
    level = 3;
    progress = actualStreak - 14; // 1 to 7
    t = (progress - 1) / 6; // 0 to 1
  } else {
    level = 4;
    progress = Math.min(8, actualStreak - 21); // 1 to 8 (Days 22 to 29)
    t = (progress - 1) / 7; // 0 to 1
  }

  // Smooth everyday growth in scale & speed
  const scale = 0.82 + (level - 1) * 0.05 + t * 0.12;
  const speed = `${Math.max(0.65, 1.6 - (level - 1) * 0.2 - t * 0.2)}s`;

  let outer, middle, inner, glow, title, sparkColor, bgClass, badge;

  if (level === 1) {
    // 1. Yellow / Gold Fire (Days 1–7)
    outer = ["#D97706", "#F59E0B"];
    middle = ["#FBBF24", "#FEF08A"];
    inner = ["#FEF9C3", "#FFFFFF"];
    glow = `rgba(245, 158, 11, ${0.35 + t * 0.3})`;
    sparkColor = "#FACC15";
    badge = ["#241E10", "#141006"];
    title = "Golden Spark";
    bgClass = "bg-amber-50 dark:bg-amber-950/20";
  } else if (level === 2) {
    // 2. Orange Fire (Days 8–14)
    outer = ["#D6350F", "#F0501A"];
    middle = ["#F0501A", "#FF8A1E"];
    inner = ["#FFD199", "#FFF4E2"];
    glow = `rgba(240, 80, 26, ${0.4 + t * 0.35})`;
    sparkColor = "#FF8A1E";
    badge = ["#261510", "#170E0A"];
    title = "Orange Ember";
    bgClass = "bg-orange-50 dark:bg-orange-950/20";
  } else if (level === 3) {
    // 3. Red Fire (Days 15–21)
    outer = ["#A6120F", "#DC2626"];
    middle = ["#DC2626", "#EF4444"];
    inner = ["#FCA5A5", "#FFF1F2"];
    glow = `rgba(220, 38, 38, ${0.45 + t * 0.4})`;
    sparkColor = "#EF4444";
    badge = ["#241010", "#150808"];
    title = "Crimson Blaze";
    bgClass = "bg-red-50 dark:bg-red-950/20";
  } else {
    // 4. Blue Fire (Days 22–29)
    outer = ["#0B3D91", "#1668C7"];
    middle = ["#1668C7", "#22B8D8"];
    inner = ["#9CEEF5", "#EAFDFF"];
    glow = `rgba(22, 104, 199, ${0.5 + t * 0.4})`;
    sparkColor = "#22B8D8";
    badge = ["#0E1A24", "#0A1219"];
    title = "Cyan Singularity";
    bgClass = "bg-cyan-50 dark:bg-cyan-950/20";
  }

  // Sparks count grows each mode and everyday!
  // Level 1: 2 to 3 sparks
  // Level 2: 4 to 5 sparks
  // Level 3: 6 to 7 sparks
  // Level 4: 8 to 10 sparks
  const sparks = level === 1 ? (2 + Math.floor(t * 2))
               : level === 2 ? (4 + Math.floor(t * 2))
               : level === 3 ? (6 + Math.floor(t * 2))
               : (8 + Math.floor(t * 3));

  return {
    outer,
    middle,
    inner,
    glow,
    badge,
    scale,
    speed,
    level,
    sparks,
    sparkColor,
    title,
    bgClass,
  };
};

// Calculate continuous daily practice streak from an array of exam attempts
export const calculatePracticeStreak = (allAttempts) => {
  if (!allAttempts || allAttempts.length === 0) return 0;
  const dates = allAttempts
    .map((a) => {
      const dateStr = a.started_at || a.created_at;
      return dateStr ? new Date(dateStr).toDateString() : null;
    })
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .map((d) => new Date(d));

  if (dates.length === 0) return 0;

  // Sort dates descending (newest first)
  dates.sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let currentStreak = 0;
  let expectedDate = new Date(today);

  const firstDate = new Date(dates[0]);
  firstDate.setHours(0, 0, 0, 0);

  if (firstDate.getTime() === today.getTime()) {
    currentStreak = 1;
    expectedDate = yesterday;
  } else if (firstDate.getTime() === yesterday.getTime()) {
    currentStreak = 1;
    expectedDate = new Date(yesterday);
    expectedDate.setDate(expectedDate.getDate() - 1);
  } else {
    return 0; // No active daily streak
  }

  for (let i = 1; i < dates.length; i++) {
    const d = new Date(dates[i]);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === expectedDate.getTime()) {
      currentStreak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (d.getTime() < expectedDate.getTime()) {
      break;
    }
  }
  return currentStreak;
};

// All the bezier magic numbers below are tuned for this coordinate space.
// The canvas is scaled up/down to fit whatever `size` prop is passed in,
// so the shape never needs to be re-tuned per size.
const DESIGN = 108;

export const StreakFire = ({ streak = 1, size = 64 }) => {
  const canvasRef = useRef(null);

  // Used for the wrapper's CSS transform + drop-shadow glow. Cheap pure
  // function, fine to call on every render.
  const styles = useMemo(() => getStreakFlameStyles(streak), [streak]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // --- Bug fix #1: crisp rendering on retina/high-DPI screens ----------
    // The original canvas had a 1:1 buffer-to-CSS-pixel ratio, so it looked
    // soft on any 2x/3x display. We size the backing buffer by devicePixelRatio
    // and let CSS keep the on-screen size the same.
    //
    // We use setTransform (absolute) rather than scale (relative) below.
    // scale() multiplies the existing matrix, so if this effect re-runs
    // (e.g. streak or size changes) while reusing the same canvas element,
    // repeated scale() calls would compound and the drawing would shrink
    // or grow unexpectedly. setTransform always resets to the same matrix,
    // so it's safe to call every time this effect re-fires.
    const dpr = window.devicePixelRatio || 1;
    const renderSize = Math.round(size * 1.4); // on-screen px, allows glow to bleed past the badge
    const k = renderSize / DESIGN; // fit the tuned DESIGN-space shape to renderSize
    canvas.width = renderSize * dpr;
    canvas.height = renderSize * dpr;
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);

    // Recomputed locally so this effect only needs to depend on primitives
    // (see bug fix #2 below) instead of the `styles` object.
    const s = getStreakFlameStyles(streak);
    const isLit = streak > 0;

    let animationId;
    let time = 0;
    const baseSpeed = 0.045 + Math.min(streak * 0.0025, 0.05);

    const cx = DESIGN / 2;
    const cy = DESIGN / 2 + 16;

    // Parametric flame silhouette. `scale`/`yOffset` size and nest the
    // outer/middle/inner layers; `waveAmp` controls how much this layer
    // flickers; `wobble` is that layer's own time phase, offset from the
    // others so the three layers don't move in lockstep.
    const flamePath = (scale, yOffset, waveAmp, wobble) => {
      const w1 = Math.sin(wobble) * waveAmp;
      const w2 = Math.cos(wobble * 1.15) * waveAmp * 0.8;
      const w3 = Math.sin(wobble * 0.85 + 1.3) * waveAmp * 1.1;
      const w4 = Math.cos(wobble * 0.7 + 2.1) * waveAmp * 0.6;

      const x = (v) => cx + v * scale;
      const y = (v) => cy + v * scale + yOffset;

      ctx.beginPath();
      ctx.moveTo(x(0), y(24));
      // left belly up to the shoulder (now wavers slightly too, via w4 —
      // in the original code only the tip and right bump moved, so the
      // left edge looked a little stiff next to them)
      ctx.bezierCurveTo(x(-30), y(24), x(-36), y(-6), x(-19) + w4, y(-24));
      // shoulder to the pointed, curling tip
      ctx.bezierCurveTo(x(-8), y(-34), cx + w1, y(-50) + w2, cx + w1, y(-50) + w2);
      // tip down through the right-side lobe
      ctx.bezierCurveTo(x(6), y(-28), x(18), y(-16), x(12) + w3, y(-10));
      // lobe back down to the base
      ctx.bezierCurveTo(x(28), y(-4), x(27), y(18), x(0), y(24));
      ctx.closePath();
    };

    const render = () => {
      time += baseSpeed;
      ctx.clearRect(0, 0, DESIGN, DESIGN);

      // glowing ember bed peeking out from under the flame's base
      if (isLit) {
        const emberGrad = ctx.createRadialGradient(cx, cy + 20, 1, cx, cy + 20, 28);
        emberGrad.addColorStop(0, s.glow);
        emberGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 20, 28, 11, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const amp = isLit ? 1 : 0.12; // near-still silhouette for the inactive state

      // outer layer
      flamePath(1, 0, 5 * amp, time);
      ctx.lineWidth = 5.5;
      ctx.strokeStyle = "#1A1310";
      ctx.lineJoin = "round";
      ctx.stroke();
      const gOuter = ctx.createLinearGradient(cx, cy + 24, cx, cy - 50);
      gOuter.addColorStop(0, s.outer[0]);
      gOuter.addColorStop(1, s.outer[1]);
      ctx.fillStyle = gOuter;
      ctx.fill();

      // middle layer
      flamePath(0.68, 5, 3.3 * amp, time * 1.25 + 0.6);
      const gMid = ctx.createLinearGradient(cx, cy + 18, cx, cy - 30);
      gMid.addColorStop(0, s.middle[0]);
      gMid.addColorStop(1, s.middle[1]);
      ctx.fillStyle = gMid;
      ctx.fill();

      // inner highlight
      flamePath(0.38, 9, 2.2 * amp, time * 1.5 + 1.2);
      const gInner = ctx.createLinearGradient(cx, cy + 10, cx, cy - 12);
      gInner.addColorStop(0, s.inner[0]);
      gInner.addColorStop(1, s.inner[1]);
      ctx.fillStyle = gInner;
      ctx.fill();

      // rising sparks — count scales with level
      if (isLit && s.sparks > 0) {
        ctx.fillStyle = s.sparkColor;
        for (let i = 0; i < s.sparks; i++) {
          const riseSpeed = 13 + (i % 3) * 4;
          const phase = i * 17.3;
          const travel = (time * riseSpeed + phase) % 58;
          const sx = cx + (i % 2 === 0 ? -11 : 11) + Math.sin(time * 2 + i) * (6 + (i % 3) * 2);
          const sy = cy - 18 - travel;
          const alpha = Math.max(0, 1 - travel / 58);
          ctx.globalAlpha = alpha * 0.9;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5 + (i % 2) * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (isLit) animationId = requestAnimationFrame(render);
    };

    render(); // draw at least one frame even when inactive (still flame, no loop)

    return () => cancelAnimationFrame(animationId);
    // --- Bug fix #2: unnecessary effect restarts -------------------------
    // The original depended on [streak, styles]. getStreakFlameStyles(streak)
    // returns a brand-new object/array literal every render, so `styles`
    // never has stable identity — this effect (and the whole animation:
    // rAF loop, `time`, canvas setup) was tearing down and restarting on
    // *every* re-render of the parent, not just when streak actually
    // changed. Depending only on primitives (streak, size) and recomputing
    // styles locally fixes that.
  }, [streak, size]);

  const renderSize = Math.round(size * 1.4);

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {/* dark rounded badge — sized to `size`, clips only its own gradient */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${styles.badge[0]}, ${styles.badge[1]})`,
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.06), inset 0 -3px 8px rgba(0,0,0,0.45)",
        }}
      />

      {/* flame canvas — deliberately NOT clipped, so its glow can bleed
          past the badge edge the way the reference icon's does */}
      <canvas
        ref={canvasRef}
        style={{
          width: renderSize,
          height: renderSize,
          transform: `scale(${styles.scale})`,
          filter: `drop-shadow(0 0 7px ${styles.glow})`,
        }}
        className="absolute"
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Demo / showcase — this is the piece you'd delete once StreakFire is wired
// into your own streak card. Slider + level gallery so you can eyeball the
// whole progression at once.
// ---------------------------------------------------------------------------
const GALLERY = [0, 1, 3, 7, 10, 14, 17, 21, 25, 28];

export default function StreakFireShowcase() {
  const [streak, setStreak] = useState(9);
  const styles = useMemo(() => getStreakFlameStyles(streak), [streak]);

  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-8 rounded-3xl p-10"
      style={{ background: "#0B0C10", minHeight: 460 }}
    >
      <div className="flex flex-col items-center gap-3">
        <StreakFire streak={streak} size={100} />
        <div className="text-center">
          <div className="text-white text-2xl font-semibold tabular-nums">
            {streak} day{streak === 1 ? "" : "s"}
          </div>
          <div
            className="text-sm tracking-wide font-medium"
            style={{ color: streak === 0 ? "#94a3b8" : styles.outer[1] }}
          >
            {styles.title}
          </div>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={30}
        value={streak}
        onChange={(e) => setStreak(Number(e.target.value))}
        className="w-64 accent-orange-500"
      />

      <div className="flex flex-wrap justify-center gap-5 max-w-md">
        {GALLERY.map((n) => (
          <button
            key={n}
            onClick={() => setStreak(n)}
            className="flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
          >
            <StreakFire streak={n} size={44} />
            <span className="text-xs text-slate-400">{n}d</span>
          </button>
        ))}
      </div>
    </div>
  );
}