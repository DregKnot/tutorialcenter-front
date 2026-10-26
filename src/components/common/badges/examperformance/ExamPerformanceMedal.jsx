import React, { useEffect, useRef, useState } from "react";
import { FINISHES, createMedalScene } from "./medalScene";
import bronze from "./renders/bronze.png";
import silver from "./renders/silver.png";
import gold from "./renders/gold.png";
import platinum from "./renders/platinum.png";
import diamond from "./renders/diamond.png";
import "./examCelebration.css";

const RENDERS = { bronze, silver, gold, platinum, diamond };

/** Real extruded geometry, studio reflections and enamel inlays; no remote assets. */
export default function ExamPerformanceMedal({ tier = "gold", size = 180, earned = true, animated = false, spin = false, sparkles = false, className = "" }) {
  const host = useRef(null);
  const [ready, setReady] = useState(false);
  const finish = FINISHES[tier] || FINISHES.gold;
  const premiumSparkles = earned && sparkles && ["gold", "platinum", "diamond"].includes(tier);
  const motion = useRef({ animated, spin, sparkles: premiumSparkles });
  const redraw = useRef(() => {});
  useEffect(() => {
    motion.current = { animated, spin, sparkles: premiumSparkles };
    redraw.current();
  }, [animated, spin, premiumSparkles]);

  useEffect(() => {
    const element = host.current;
    let disposed = false;
    let cleanup = () => {};
    setReady(false);
    // JSDOM and browsers without WebGL retain the pre-rendered version of this same medal.
    if (!earned || !window.WebGLRenderingContext) return undefined;
    Promise.all([import("three"), import("three/examples/jsm/environments/RoomEnvironment.js")]).then(([THREE, { RoomEnvironment }]) => {
      if (disposed) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch (_) { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(size, size);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      let model;
      try { model = createMedalScene(THREE, RoomEnvironment, renderer, finish); }
      catch (error) { renderer.dispose(); throw error; }
      const { scene, camera, medal, updateSparkles } = model;
      element.appendChild(renderer.domElement);
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      let targetX = 0.24, targetY = -0.48, frame = null, visible = true;
      medal.rotation.set(targetX, targetY, -0.12);
      let previousTime = null, rotation = 0, elapsed = 0, tiltX = targetX, tiltY = targetY;
      const draw = time => {
        frame = null;
        if (disposed || !visible) return;
        const delta = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        elapsed += delta;
        const active = !reduceMotion?.matches;
        const floating = earned && motion.current.animated && active;
        const rotating = earned && motion.current.spin && active;
        const glittering = motion.current.sparkles && active;
        rotation = rotating ? (rotation + delta * Math.PI * 2 / 16) % (Math.PI * 2) : 0;
        tiltX += (targetX - tiltX) * 0.1;
        tiltY += (targetY - tiltY) * 0.1;
        medal.rotation.set(tiltX, tiltY + rotation, -0.12);
        medal.position.y = -0.14 + (floating ? Math.sin(elapsed) * 0.035 : 0);
        updateSparkles(elapsed, glittering);
        renderer.render(scene, camera);
        if (floating || rotating || glittering || Math.abs(targetX - tiltX) + Math.abs(targetY - tiltY) > 0.001) frame = requestAnimationFrame(draw);
      };
      const requestDraw = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };
      redraw.current = requestDraw;
      const move = event => {
        if (reduceMotion?.matches || motion.current.spin) return;
        const rect = element.getBoundingClientRect();
        targetY = -0.48 + ((event.clientX - rect.left) / rect.width - 0.5) * 0.9;
        targetX = 0.24 + ((event.clientY - rect.top) / rect.height - 0.5) * 0.55;
        requestDraw();
      };
      const reset = () => { targetX = 0.24; targetY = -0.48; requestDraw(); };
      const lost = event => { event.preventDefault(); visible = false; setReady(false); };
      renderer.domElement.addEventListener("webglcontextlost", lost);
      element.addEventListener("pointermove", move); element.addEventListener("pointerleave", reset);
      const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; previousTime = null; requestDraw(); });
      observer.observe(element);
      reduceMotion?.addEventListener?.("change", requestDraw);
      requestDraw(); setReady(true);
      cleanup = () => {
        redraw.current = () => {};
        if (frame) cancelAnimationFrame(frame);
        observer.disconnect(); reduceMotion?.removeEventListener?.("change", requestDraw);
        element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", reset);
        renderer.domElement.removeEventListener("webglcontextlost", lost);
        model.dispose(); renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { if (!disposed) setReady(false); });
    return () => { disposed = true; cleanup(); };
  }, [finish, size, earned]);

  return <div className={className} data-motion={spin && earned ? "spin" : "still"} data-sparkles={premiumSparkles ? "true" : "false"} role="img" aria-label={`${finish.name} exam performance medal, ${finish.score}% mastery${earned ? "" : ", locked"}`} style={{ width: size, height: size, position: "relative", filter: earned ? undefined : "grayscale(1) contrast(.75)", opacity: earned ? 1 : 0.4 }}>
    <div className={!ready && spin && earned ? "exam-medal__fallback--spin" : undefined} style={{ position: "absolute", inset: 0, opacity: ready ? 0 : 1 }} aria-hidden="true">
      <img src={RENDERS[tier] || gold} alt="" width={size} height={size} style={{ width: "100%", height: "100%", opacity: ready ? 0 : 1 }} />
      {!ready && premiumSparkles && [[25,29],[76,48],[32,78],[72,22]].map(([left, top], index) =>
        <i key={index} className="exam-medal__glint" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -1.2}s` }} />)}
    </div>
    <div ref={host} aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: ready ? 1 : 0, transition: "opacity 200ms", cursor: "grab" }} />
  </div>;
}
