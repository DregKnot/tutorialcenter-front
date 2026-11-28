import React, { useEffect, useRef, useState } from "react";
import { FINISHES } from "./medalScene";
import { getTierMedia } from "./tiers";
import { useMedalTurntable } from "./useMedalTurntable";
import "./examCelebration.css";

/**
 * Cards use per-tier static snapshots; celebration & inspect modals lazily stream
 * that single tier's 360-degree 3D turntable onto a 2D <canvas> (zero WebGL required).
 */
export default function ExamPerformanceMedal({
  tier = "gold",
  size = 180,
  earned = true,
  animated = false,
  spin = false,
  sparkles = false,
  interactive = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false
  );

  const finish = FINISHES[tier] || FINISHES.gold;
  const media = getTierMedia(tier);
  const premiumSparkles = earned && sparkles && ["gold", "platinum", "diamond"].includes(tier);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query?.addEventListener?.("change", update);
    return () => query?.removeEventListener?.("change", update);
  }, []);

  const ready = useMedalTurntable({
    canvasRef,
    containerRef,
    tier,
    size,
    earned,
    interactive,
    spin,
    animated,
    reducedMotion,
  });

  return (
    <div
      ref={containerRef}
      className={`${interactive ? "" : "exam-medal--static"} ${className}`}
      data-motion={spin && earned ? "spin" : "still"}
      data-sparkles={premiumSparkles ? "true" : "false"}
      role="img"
      aria-label={`${finish.name} exam performance medal, ${finish.score}% mastery${earned ? "" : ", locked"}`}
      style={{
        width: size,
        height: size,
        position: "relative",
        filter: earned ? undefined : "grayscale(1) contrast(.75)",
        opacity: earned ? 1 : 0.4,
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: ready ? 0 : 1, transition: "opacity 160ms" }} aria-hidden="true">
        <img src={media.snapshot} alt="" width={size} height={size} style={{ width: "100%", height: "100%", opacity: ready ? 0 : 1 }} />
        {!ready && tier === "diamond" && premiumSparkles && media.pulse && (
          <img src={media.pulse} alt="" className="exam-medal__diamond-pulse" width={size} height={size} />
        )}
        {!ready && premiumSparkles && [[25, 29], [76, 48], [32, 78], [72, 22]].map(([left, top], index) => (
          <i key={index} className="exam-medal__glint" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -1.2}s` }} />
        ))}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          opacity: ready ? 1 : 0,
          transition: "opacity 160ms",
          pointerEvents: ready ? "auto" : "none",
          cursor: ready && !spin && !reducedMotion ? "grab" : undefined,
        }}
      />
    </div>
  );
}
