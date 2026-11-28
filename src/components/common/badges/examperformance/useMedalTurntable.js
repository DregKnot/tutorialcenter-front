import { useEffect, useRef, useState } from "react";
import { TURN_SECONDS } from "./medalMotion";
import { HD_TURNTABLE_SPEC, TURNTABLE_SPEC, getTierMedia } from "./tiers";

async function decodeSpriteSource(src, isDisposed, registerBitmap, registerImage) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;

  if (typeof img.decode === "function") {
    await img.decode();
  } else {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  }
  if (isDisposed()) {
    img.src = "";
    return null;
  }

  if (typeof window.createImageBitmap === "function") {
    try {
      const bitmap = await window.createImageBitmap(img);
      img.src = "";
      if (isDisposed()) {
        bitmap.close?.();
        return null;
      }
      registerBitmap(bitmap);
      return bitmap;
    } catch (_) {
      registerImage(img);
      return img;
    }
  }

  registerImage(img);
  return img;
}

/**
 * Loads, decodes, plays, scrubs, and deterministically disposes a single tier's
 * 360-degree 3D turntable sprite on a standard 2D <canvas> with zero WebGL dependency.
 * Serves 400x400 HD sprites on desktop/high-RAM devices and 220x220 sheets on <=4GB phones.
 */
export function useMedalTurntable({ canvasRef, containerRef, tier, size, earned, interactive, spin, animated, reducedMotion }) {
  const [ready, setReady] = useState(false);
  const motionRef = useRef({ spin, animated, reducedMotion });
  const redrawRef = useRef(() => {});

  useEffect(() => {
    motionRef.current = { spin, animated, reducedMotion };
    redrawRef.current();
  }, [spin, animated, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    setReady(false);

    if (!interactive || !earned || !canvas || !container || typeof canvas.getContext !== "function") {
      return undefined;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let disposed = false;
    let sources = [];
    const bitmaps = [];
    const images = [];
    let frameId = null;
    let observer = null;
    let visible = true;
    let previousTime = null;
    let spinElapsed = 0;
    let scrubAngle = 0;
    let targetScrubAngle = 0;

    const media = getTierMedia(tier);
    const constrainedMemory = (navigator.deviceMemory || 8) <= 4;
    const useHd = !constrainedMemory && typeof media.loadHdTurntable === "function";
    const activeSpec = useHd ? HD_TURNTABLE_SPEC : TURNTABLE_SPEC;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, constrainedMemory ? 1 : 2);
    const backingSize = Math.round(size * pixelRatio);

    canvas.width = backingSize;
    canvas.height = backingSize;

    const drawFrame = (angleRadians) => {
      if (!sources.length || disposed) return;
      const { frames, cols, framesPerSheet, frameSize } = activeSpec;
      const normalized = ((angleRadians % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const index = Math.floor((normalized / (Math.PI * 2)) * frames) % frames;
      const sheetIndex = Math.floor(index / framesPerSheet);
      const localIndex = index % framesPerSheet;
      const source = sources[sheetIndex] || sources[0];
      if (!source) return;

      const sx = (localIndex % cols) * frameSize;
      const sy = Math.floor(localIndex / cols) * frameSize;

      ctx.clearRect(0, 0, backingSize, backingSize);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, sx, sy, frameSize, frameSize, 0, 0, backingSize, backingSize);
    };

    const canAnimate = () => !disposed && visible && !document.hidden;

    const tick = (time) => {
      frameId = null;
      if (!sources.length || !canAnimate()) return;

      const delta = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.1);
      previousTime = time;
      const { spin: isSpinning, reducedMotion: isReduced } = motionRef.current;

      if (isSpinning && !isReduced) {
        spinElapsed = (spinElapsed + delta) % TURN_SECONDS;
      } else if (!isSpinning) {
        spinElapsed = 0;
      }

      const ease = delta > 0 ? 1 - Math.exp(-10 * delta) : 1;
      scrubAngle += (targetScrubAngle - scrubAngle) * ease;

      const spinAngle = (spinElapsed / TURN_SECONDS) * Math.PI * 2;
      drawFrame(spinAngle + scrubAngle);

      const activeMotion = (isSpinning && !isReduced) || Math.abs(targetScrubAngle - scrubAngle) > 0.002;
      if (activeMotion) {
        scheduleFrame();
      }
    };

    const scheduleFrame = () => {
      if (frameId === null && sources.length > 0 && canAnimate()) {
        frameId = requestAnimationFrame(tick);
      }
    };

    const pauseOrResume = () => {
      previousTime = null;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      scheduleFrame();
    };

    const handlePointerMove = (event) => {
      if (motionRef.current.spin || motionRef.current.reducedMotion) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width) return;
      const offsetRatio = (event.clientX - rect.left) / rect.width - 0.5;
      targetScrubAngle = offsetRatio * Math.PI * 2;
      scheduleFrame();
    };

    const handlePointerLeave = () => {
      targetScrubAngle = 0;
      scheduleFrame();
    };

    const loadSheets = useHd
      ? media.loadHdTurntable()
      : media.loadTurntable().then((mod) => [mod]);

    loadSheets
      .then(async (modules) => {
        if (disposed) return;
        const urls = (Array.isArray(modules) ? modules : [modules])
          .map((mod) => mod?.default || mod)
          .filter(Boolean);
        if (!urls.length) return;

        const decoded = await Promise.all(
          urls.map((url) =>
            decodeSpriteSource(
              url,
              () => disposed,
              (bitmap) => bitmaps.push(bitmap),
              (img) => images.push(img)
            )
          )
        );
        if (disposed || decoded.some((item) => !item)) return;

        sources = decoded;
        drawFrame(0);
        redrawRef.current = scheduleFrame;
        container.addEventListener("pointermove", handlePointerMove);
        container.addEventListener("pointerleave", handlePointerLeave);
        document.addEventListener("visibilitychange", pauseOrResume);
        if (typeof window.IntersectionObserver === "function") {
          observer = new IntersectionObserver((entries) => {
            visible = entries[0]?.isIntersecting ?? true;
            pauseOrResume();
          });
          observer.observe(container);
        }
        setReady(true);
        scheduleFrame();
      })
      .catch(() => {
        if (!disposed) setReady(false);
      });

    return () => {
      disposed = true;
      redrawRef.current = () => {};
      if (frameId !== null) cancelAnimationFrame(frameId);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", pauseOrResume);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bitmaps.forEach((bitmap) => bitmap.close?.());
      bitmaps.length = 0;
      images.forEach((img) => { img.src = ""; });
      images.length = 0;
      sources = [];
    };
  }, [canvasRef, containerRef, tier, size, earned, interactive]);

  return ready;
}
