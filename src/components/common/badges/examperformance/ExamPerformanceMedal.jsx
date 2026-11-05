import React, { useEffect, useRef, useState } from "react";
import { FINISHES, createMedalScene } from "./medalScene";
import { rotationAt, choosePixelRatio } from "./medalMotion";
import bronze from "./renders/bronze.png";
import silver from "./renders/silver.png";
import gold from "./renders/gold.png";
import platinum from "./renders/platinum.png";
import diamond from "./renders/diamond.png";
import diamondPulse from "./renders/diamond-pulse.png";
import "./examCelebration.css";

const RENDERS = { bronze, silver, gold, platinum, diamond };

/** Cards use snapshots; only the open celebration opts into live rendering. */
export default function ExamPerformanceMedal({ tier = "gold", size = 180, earned = true, animated = false, spin = false, sparkles = false, interactive = false, className = "" }) {
  const host = useRef(null);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false);
  const finish = FINISHES[tier] || FINISHES.gold;
  const premiumSparkles = earned && sparkles && ["gold", "platinum", "diamond"].includes(tier);
  const motion = useRef({ animated, spin, sparkles: premiumSparkles });
  const redraw = useRef(() => {});

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query?.addEventListener?.("change", update);
    return () => query?.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    motion.current = { animated, spin, sparkles: premiumSparkles };
    redraw.current();
  }, [animated, spin, premiumSparkles]);

  useEffect(() => {
    const element = host.current;
    let disposed = false;
    let cleanup = () => {};
    setReady(false);
    if (!interactive || !earned || reducedMotion || !window.WebGLRenderingContext) return undefined;

    Promise.all([import("three"), import("three/examples/jsm/environments/RoomEnvironment.js")]).then(async ([THREE, { RoomEnvironment }]) => {
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      let cleaned = false;
      let model, observer, frame = null, visible = true, lostContext = false;
      let previousTime = null, elapsed = 0, spinTime = 0;
      let targetX = 0.24, targetY = -0.48, tiltX = targetX, tiltY = targetY;
      let sampleTotal = 0, sampleCount = 0;
      const limitedDevice = (navigator.deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4;
      let pixelRatio = Math.min(window.devicePixelRatio || 1, limitedDevice ? 1 : 1.5);
      const canDraw = () => !disposed && visible && !document.hidden && !lostContext;
      const draw = time => {
        frame = null;
        if (!canDraw()) return;
        const delta = previousTime === null ? 0 : (time - previousTime) / 1000;
        previousTime = time;
        elapsed += delta;
        spinTime = motion.current.spin ? spinTime + delta : 0;
        const ease = 1 - Math.exp(-12 * delta);
        tiltX += (targetX - tiltX) * ease;
        tiltY += (targetY - tiltY) * ease;
        model.medal.rotation.set(tiltX, tiltY + rotationAt(spinTime), -0.12);
        model.medal.position.y = -0.14;
        model.updateSparkles(elapsed, motion.current.sparkles);
        renderer.render(model.scene, model.camera);
        if (delta > 0 && elapsed > 0.5) {
          sampleTotal += delta * 1000; sampleCount += 1;
          if (sampleCount >= 24) {
            const averageMs = sampleTotal / sampleCount;
            // If reduced resolution is still too costly, let the compositor animate the image.
            if (pixelRatio <= 0.75 && averageMs > 45) {
              setReady(false); cleanup(); cleanup = () => {}; return;
            }
            const nextRatio = choosePixelRatio(pixelRatio, averageMs);
            if (nextRatio !== pixelRatio) { pixelRatio = nextRatio; renderer.setPixelRatio(pixelRatio); }
            sampleTotal = 0; sampleCount = 0;
          }
        }
        if (motion.current.animated || motion.current.spin || motion.current.sparkles || Math.abs(targetX - tiltX) + Math.abs(targetY - tiltY) > 0.001) requestDraw();
      };
      const requestDraw = () => { if (frame === null && model && canDraw()) frame = requestAnimationFrame(draw); };
      const pauseOrResume = () => {
        previousTime = null;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null; requestDraw();
      };
      const move = event => {
        if (motion.current.spin) return;
        const rect = element.getBoundingClientRect();
        targetY = -0.48 + ((event.clientX - rect.left) / rect.width - 0.5) * 0.9;
        targetX = 0.24 + ((event.clientY - rect.top) / rect.height - 0.5) * 0.55;
        requestDraw();
      };
      const reset = () => { targetX = 0.24; targetY = -0.48; requestDraw(); };
      const lost = event => { event.preventDefault(); lostContext = true; pauseOrResume(); setReady(false); };
      cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        redraw.current = () => {};
        if (frame !== null) cancelAnimationFrame(frame);
        observer?.disconnect();
        document.removeEventListener("visibilitychange", pauseOrResume);
        element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", reset);
        renderer.domElement.removeEventListener("webglcontextlost", lost);
        model?.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
      };
      renderer.setPixelRatio(pixelRatio); renderer.setSize(size, size);
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      model = createMedalScene(THREE, RoomEnvironment, renderer, finish);
      // Compile once before revealing the canvas; replay keeps this same renderer.
      await renderer.compileAsync(model.scene, model.camera);
      if (disposed) return;
      element.appendChild(renderer.domElement);
      renderer.render(model.scene, model.camera);
      renderer.domElement.addEventListener("webglcontextlost", lost);
      element.addEventListener("pointermove", move); element.addEventListener("pointerleave", reset);
      document.addEventListener("visibilitychange", pauseOrResume);
      observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; pauseOrResume(); });
      observer.observe(element);
      redraw.current = requestDraw;
      requestDraw(); setReady(true);
    }).catch(() => { cleanup(); cleanup = () => {}; if (!disposed) setReady(false); });
    return () => { disposed = true; cleanup(); };
  }, [finish, size, earned, interactive, reducedMotion]);

  return <div className={`${interactive ? "" : "exam-medal--static"} ${className}`} data-motion={spin && earned ? "spin" : "still"} data-sparkles={premiumSparkles ? "true" : "false"} role="img" aria-label={`${finish.name} exam performance medal, ${finish.score}% mastery${earned ? "" : ", locked"}`} style={{ width: size, height: size, position: "relative", filter: earned ? undefined : "grayscale(1) contrast(.75)", opacity: earned ? 1 : 0.4 }}>
    <div className={!ready && spin && earned ? "exam-medal__fallback--spin" : undefined} style={{ position: "absolute", inset: 0, opacity: ready ? 0 : 1 }} aria-hidden="true">
      <img src={RENDERS[tier] || gold} alt="" width={size} height={size} style={{ width: "100%", height: "100%", opacity: ready ? 0 : 1 }} />
      {!ready && tier === "diamond" && premiumSparkles && <img src={diamondPulse} alt="" className="exam-medal__diamond-pulse" width={size} height={size} />}
      {!ready && premiumSparkles && [[25,29],[76,48],[32,78],[72,22]].map(([left, top], index) =>
        <i key={index} className="exam-medal__glint" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -1.2}s` }} />)}
    </div>
    <div ref={host} aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: ready ? 1 : 0, transition: "opacity 200ms" }} />
  </div>;
}
