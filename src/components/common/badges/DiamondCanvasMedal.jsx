import React, { useEffect, useRef } from 'react';

/**
 * DiamondCanvasMedal
 * Ultra-Premium "iOS Liquid Glass" Canvas Component.
 * Features translucent frosted glassmorphic shell, liquid glass wings,
 * electric blue chromatic accents, and an intensely glowing bioluminescent center crest.
 */
export default function DiamondCanvasMedal({
  size = 210,
  title = "Diamond Genius",
  subtitle = "100% Accuracy",
  Icon,
  className = ""
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const dpr = window.devicePixelRatio || 2;
    const width = 240;
    const height = 260;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Floating Stardust Glass Shards & Sparkles
    const particles = Array.from({ length: 26 }, () => ({
      x: 120 + (Math.random() - 0.5) * 150,
      y: 120 + Math.random() * 90,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.4 - Math.random() * 0.6,
      size: 0.8 + Math.random() * 2.2,
      alpha: Math.random(),
      twinkleSpeed: 0.025 + Math.random() * 0.04,
      color: Math.random() > 0.3 ? "#38bdf8" : "#ffffff"
    }));

    let startTime = performance.now();

    const render = (currentTime) => {
      const t = (currentTime - startTime) * 0.001;

      ctx.clearRect(0, 0, width, height);

      // 1. Levitation hover physics
      const levitateY = Math.sin(t * 2.0) * 6;
      const centerY = 116 + levitateY;
      const centerX = 120;

      // 2. Ambient Electric Blue Backlight Aura (Deep Glass Glow)
      const auraGrad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, 95);
      const auraPulse = 0.6 + Math.sin(t * 3) * 0.18;
      auraGrad.addColorStop(0, `rgba(56, 189, 248, ${auraPulse * 0.75})`);
      auraGrad.addColorStop(0.45, `rgba(14, 165, 233, ${auraPulse * 0.4})`);
      auraGrad.addColorStop(0.8, `rgba(37, 99, 235, ${auraPulse * 0.15})`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 95, 0, Math.PI * 2);
      ctx.fill();

      // 3. Stardust particles (Prismatic blue & white sparkles)
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.alpha += Math.sin(t * 4 + p.x) * p.twinkleSpeed;
        if (p.y < 20 || p.alpha <= 0) {
          p.y = centerY + 50 + Math.random() * 35;
          p.x = centerX + (Math.random() - 0.5) * 130;
          p.alpha = Math.random() * 0.9;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 6;

        // 4-point glass diamond sparkle
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - s * 2.2);
        ctx.lineTo(p.x + s * 0.4, p.y - s * 0.4);
        ctx.lineTo(p.x + s * 2.2, p.y);
        ctx.lineTo(p.x + s * 0.4, p.y + s * 0.4);
        ctx.lineTo(p.x, p.y + s * 2.2);
        ctx.lineTo(p.x - s * 0.4, p.y + s * 0.4);
        ctx.lineTo(p.x - s * 2.2, p.y);
        ctx.lineTo(p.x - s * 0.4, p.y - s * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // 4. LIQUID GLASS WINGS (Rendered firmly at the back)
      // Realistic, gentle trigonometric flapping physics
      const flapBase = Math.sin(t * 2.8);
      const flapAngle = flapBase * 0.11;
      const flapScaleX = 0.92 + Math.cos(t * 2.8) * 0.14;

      const drawLiquidGlassWing = (isLeft) => {
        const sign = isLeft ? -1 : 1;
        ctx.save();
      ctx.translate(centerX + sign * 38, centerY - 6);
        ctx.rotate(sign * flapAngle);
        ctx.scale(flapScaleX, 1);

        // Translucent Frosted Glass Wing Gradient with Blue Caustics
        const wingGrad = ctx.createLinearGradient(0, -30, sign * 65, 50);
        wingGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        wingGrad.addColorStop(0.3, 'rgba(224, 242, 254, 0.45)');
        wingGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.3)');
        wingGrad.addColorStop(1, 'rgba(14, 165, 233, 0.15)');

        ctx.fillStyle = wingGrad;
        ctx.shadowColor = 'rgba(14, 165, 233, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        // 3 Sculpted Glass Feather Blades
        // Feather 1 (Top)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(sign * 28, -18, sign * 58, -6);
        ctx.quadraticCurveTo(sign * 32, 10, 0, 8);
        ctx.closePath();
        ctx.fill();

        // Feather 2 (Mid)
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.quadraticCurveTo(sign * 32, 2, sign * 66, 18);
        ctx.quadraticCurveTo(sign * 34, 28, 0, 20);
        ctx.closePath();
        ctx.fill();

        // Feather 3 (Lower)
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.quadraticCurveTo(sign * 28, 18, sign * 54, 40);
        ctx.quadraticCurveTo(sign * 24, 42, 0, 30);
        ctx.closePath();
        ctx.fill();

        // High-Gloss Specular Glass Rim Outline (iOS Liquid Glass border)
        const strokeGrad = ctx.createLinearGradient(0, -20, sign * 60, 40);
        strokeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        strokeGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.6)');
        strokeGrad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');

        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = 1.5;

        // Feather 1 Stroke
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(sign * 28, -18, sign * 58, -6);
        ctx.quadraticCurveTo(sign * 32, 10, 0, 8);
        ctx.stroke();

        // Feather 2 Stroke
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.quadraticCurveTo(sign * 32, 2, sign * 66, 18);
        ctx.quadraticCurveTo(sign * 34, 28, 0, 20);
        ctx.stroke();

        // Feather 3 Stroke
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.quadraticCurveTo(sign * 28, 18, sign * 54, 40);
        ctx.quadraticCurveTo(sign * 24, 42, 0, 30);
        ctx.stroke();

        // Glass Refraction Inner Spines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(sign * 48, 0);
        ctx.moveTo(0, 14);
        ctx.lineTo(sign * 54, 20);
        ctx.moveTo(0, 25);
        ctx.lineTo(sign * 42, 38);
        ctx.stroke();

        ctx.restore();
      };

      drawLiquidGlassWing(true);
      drawLiquidGlassWing(false);

      // 5. Translucent Glass Hanging Ribbons (Bottom)
      ctx.save();
      ctx.shadowColor = 'rgba(14, 165, 233, 0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      const ribbonGrad = ctx.createLinearGradient(0, centerY + 30, 0, centerY + 80);
      ribbonGrad.addColorStop(0, 'rgba(14, 165, 233, 0.6)');
      ribbonGrad.addColorStop(0.6, 'rgba(2, 132, 199, 0.45)');
      ribbonGrad.addColorStop(1, 'rgba(8, 47, 73, 0.3)');
      ctx.fillStyle = ribbonGrad;

      const ribbonStroke = ctx.createLinearGradient(0, centerY + 30, 0, centerY + 80);
      ribbonStroke.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      ribbonStroke.addColorStop(1, 'rgba(56, 189, 248, 0.4)');
      ctx.strokeStyle = ribbonStroke;
      ctx.lineWidth = 1.6;

      // Left Ribbon
      ctx.beginPath();
      ctx.moveTo(centerX - 20, centerY + 32);
      ctx.lineTo(centerX - 36, centerY + 78);
      ctx.lineTo(centerX - 20, centerY + 68);
      ctx.lineTo(centerX - 6, centerY + 78);
      ctx.lineTo(centerX - 10, centerY + 36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Ribbon
      ctx.beginPath();
      ctx.moveTo(centerX + 20, centerY + 32);
      ctx.lineTo(centerX + 36, centerY + 78);
      ctx.lineTo(centerX + 20, centerY + 68);
      ctx.lineTo(centerX + 6, centerY + 78);
      ctx.lineTo(centerX + 10, centerY + 36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 6. Sculpted Liquid Glass Tiara Crown (Mounted on top of Hexagon)
      ctx.save();
      ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      const crownGrad = ctx.createLinearGradient(0, centerY - 65, 0, centerY - 25);
      crownGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      crownGrad.addColorStop(0.4, 'rgba(186, 230, 253, 0.55)');
      crownGrad.addColorStop(1, 'rgba(14, 165, 233, 0.25)');
      ctx.fillStyle = crownGrad;

      const drawCrownSpike = (x, y, w, h) => {
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x - w, y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      };
      // Center Grand Spike
      drawCrownSpike(centerX, centerY - 36, 8, 20);
      // Mid Spikes
      drawCrownSpike(centerX - 16, centerY - 34, 6, 14);
      drawCrownSpike(centerX + 16, centerY - 34, 6, 14);
      // Outer Spikes
      drawCrownSpike(centerX - 30, centerY - 30, 5, 10);
      drawCrownSpike(centerX + 30, centerY - 30, 5, 10);

      // Glowing Center Diamond Gem in Crown
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 48);
      ctx.lineTo(centerX + 5, centerY - 43);
      ctx.lineTo(centerX, centerY - 38);
      ctx.lineTo(centerX - 5, centerY - 43);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 7. SCULPTED LIQUID GLASS HEXAGON FRAME
      const hexOuter = (r) => {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          pts.push([centerX + r * Math.cos(angle), centerY + r * 1.08 * Math.sin(angle)]);
        }
        return pts;
      };

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 8;

      // Outer Liquid Glass Rim
      const hexOuterPts = hexOuter(50);
      const outerRimGrad = ctx.createLinearGradient(centerX - 50, centerY - 50, centerX + 50, centerY + 50);
      outerRimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      outerRimGrad.addColorStop(0.3, 'rgba(224, 242, 254, 0.45)');
      outerRimGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.35)');
      outerRimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
      ctx.fillStyle = outerRimGrad;
      ctx.beginPath();
      ctx.moveTo(hexOuterPts[0][0], hexOuterPts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(hexOuterPts[i][0], hexOuterPts[i][1]);
      ctx.closePath();
      ctx.fill();

      // Outer Glass Bevel Stroke (White top highlight, cyan bottom glow)
      const outerStrokeGrad = ctx.createLinearGradient(centerX, centerY - 50, centerX, centerY + 50);
      outerStrokeGrad.addColorStop(0, '#ffffff');
      outerStrokeGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.8)');
      outerStrokeGrad.addColorStop(1, 'rgba(14, 165, 233, 0.5)');
      ctx.strokeStyle = outerStrokeGrad;
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Inner Frosted Glass Plate
      const hexInnerPts = hexOuter(44);
      const innerPlateGrad = ctx.createLinearGradient(centerX, centerY - 44, centerX, centerY + 44);
      innerPlateGrad.addColorStop(0, 'rgba(240, 249, 255, 0.5)');
      innerPlateGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.3)');
      innerPlateGrad.addColorStop(1, 'rgba(3, 105, 161, 0.55)');
      ctx.fillStyle = innerPlateGrad;
      ctx.beginPath();
      ctx.moveTo(hexInnerPts[0][0], hexInnerPts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(hexInnerPts[i][0], hexInnerPts[i][1]);
      ctx.closePath();
      ctx.fill();

      // Inner Glass Chamfer Inset Line
      const hexFiligree = hexOuter(39);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(hexFiligree[0][0], hexFiligree[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(hexFiligree[i][0], hexFiligree[i][1]);
      ctx.closePath();
      ctx.stroke();

      // Glass Corner Screws/Prisms with Bright Glints (6 vertices)
      hexInnerPts.forEach(([rx, ry]) => {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.8)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
      ctx.restore();

      // 8. INSET DEEP SAPPHIRE GLASS CAVITY
      ctx.save();
      const hexGemPts = hexOuter(33);
      const gemGrad = ctx.createRadialGradient(centerX, centerY - 6, 2, centerX, centerY, 36);
      gemGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
      gemGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.7)');
      gemGrad.addColorStop(1, 'rgba(3, 30, 56, 0.95)');
      ctx.fillStyle = gemGrad;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hexGemPts[0][0], hexGemPts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(hexGemPts[i][0], hexGemPts[i][1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Liquid Glass Glare Reflection (Curved Top Specular)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(hexGemPts[5][0], hexGemPts[5][1]);
      ctx.lineTo(hexGemPts[0][0], hexGemPts[0][1]);
      ctx.lineTo(hexGemPts[1][0], hexGemPts[1][1]);
      ctx.quadraticCurveTo(centerX, centerY + 8, hexGemPts[5][0], hexGemPts[5][1]);
      ctx.closePath();
      ctx.fill();

      // Dynamic Liquid Light Sweep across Glass
      const shimmerPos = ((t * 0.4) % 1) * 140 - 70;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(hexGemPts[0][0], hexGemPts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(hexGemPts[i][0], hexGemPts[i][1]);
      ctx.closePath();
      ctx.clip();

      const sweepGrad = ctx.createLinearGradient(
        centerX + shimmerPos - 20, centerY - 40,
        centerX + shimmerPos + 20, centerY + 40
      );
      sweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      sweepGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.75)');
      sweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(centerX + shimmerPos - 30, centerY - 45, 60, 90);
      ctx.restore();
      ctx.restore();

      // ============================================================
      // 9. THE BIOLUMINESCENT GLOWING CENTER CREST / ICON
      // ============================================================
      ctx.save();
      ctx.translate(centerX, centerY - 1);

      // Pulsating Glow Breathing Intensity
      const glowIntensity = 0.85 + Math.sin(t * 3.5) * 0.15;

      // Outer Massive Cyan Bloom
      ctx.shadowColor = `rgba(56, 189, 248, ${0.9 * glowIntensity})`;
      ctx.shadowBlur = 24 * glowIntensity;
      ctx.shadowOffsetY = 0;

      // Draw Path Helper for Ace of Spades
      const drawSpade = () => {
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.bezierCurveTo(4, -8, 12, -3, 12, 5);
        ctx.bezierCurveTo(12, 11, 7, 14, 2, 12);
        ctx.lineTo(0, 10);
        ctx.lineTo(-2, 12);
        ctx.bezierCurveTo(-7, 14, -12, 11, -12, 5);
        ctx.bezierCurveTo(-12, -3, -4, -8, 0, -14);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-2, 9);
        ctx.lineTo(-4, 16);
        ctx.lineTo(4, 16);
        ctx.lineTo(2, 9);
        ctx.closePath();
        ctx.fill();
      };

      // Layer 1: Outer Cyan Bloom
      ctx.fillStyle = '#38bdf8';
      drawSpade();

      // Layer 2: Intense Electric Blue Core
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 12 * glowIntensity;
      ctx.fillStyle = '#e0f2fe';
      drawSpade();

      // Layer 3: Blinding Pure White Center
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ffffff';
      drawSpade();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{ width: size }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ width: size, height: size * 1.08 }} 
        className="drop-shadow-[0_20px_40px_rgba(14,165,233,0.45)]"
      />

      {(title || subtitle) && (
        <div className="mt-2 text-center">
          {title && (
            <h4 className="font-black text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-cyan-200 uppercase tracking-wider line-clamp-1 drop-shadow-[0_2px_8px_rgba(56,189,248,0.6)]">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-[10px] text-sky-400 font-bold tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
