import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { X, RotateCcw, ArrowLeft, Trophy, Sparkles } from "lucide-react";
import TCMedal from "../TCMedal";

const hash = (v) => {
  const sine = Math.sin(v * 12.9898) * 43758.5453;
  return sine - Math.floor(sine);
};

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// Tier configurations: scores, colors, descriptions, and auras
const TIER_CONFIG = {
  bronze: {
    tierName: "Bronze Master",
    minScore: "60%",
    title: "60%+ Exam Distinction",
    accentColor: "#f59e0b",
    pillBg: "bg-amber-900/40 border-amber-600/50 text-amber-300",
    auraRgb: [180, 83, 9],
    gemColor: "emerald",
    gradient: "from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-600/30",
    description: "You scored 60% or higher on your CBT practice exam, demonstrating solid exam readiness and consistent academic discipline.",
  },
  silver: {
    tierName: "Silver Master",
    minScore: "70%",
    title: "70%+ High Distinction",
    accentColor: "#94a3b8",
    pillBg: "bg-slate-800/60 border-slate-500/50 text-slate-200",
    auraRgb: [148, 163, 184],
    gemColor: "sapphire",
    gradient: "from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 shadow-slate-500/30",
    description: "You achieved 70% or higher on your CBT practice exam, establishing strong subject mastery and competitive speed.",
  },
  gold: {
    tierName: "Gold Master",
    minScore: "80%",
    title: "80%+ Honors Scholar",
    accentColor: "#eab308",
    pillBg: "bg-amber-500/20 border-amber-400/40 text-amber-300",
    auraRgb: [234, 179, 8],
    gemColor: "ruby",
    gradient: "from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-amber-500/30",
    description: "You scored 80% or higher on your CBT practice exam, earning high academic honors and elite placement among top performers.",
  },
  platinum: {
    tierName: "Platinum Master",
    minScore: "90%",
    title: "90%+ Master Scholar",
    accentColor: "#06b6d4",
    pillBg: "bg-cyan-900/40 border-cyan-400/50 text-cyan-300",
    auraRgb: [6, 182, 212],
    gemColor: "cyan",
    gradient: "from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/30",
    description: "You attained an extraordinary 90% or higher on your CBT practice exam, proving exceptional subject command and precision under exam conditions.",
  },
  diamond: {
    tierName: "Diamond Legend",
    minScore: "95%",
    title: "95%+ Valedictorian Honor",
    accentColor: "#38bdf8",
    pillBg: "bg-sky-500/20 border-sky-300/50 text-sky-200",
    auraRgb: [56, 189, 248],
    gemColor: "diamond",
    gradient: "from-sky-400 to-cyan-500 hover:from-sky-500 hover:to-cyan-600 shadow-sky-400/30",
    description: "You conquered 95% or higher on your CBT practice exam with near-flawless accuracy, enshrining your name as a true Academic Legend.",
  },
};

export default function ExamPerformanceCelebrationModal({
  achievement,
  onClose,
}) {
  const canvasRef = useRef(null);
  const animStartTimeRef = useRef(null);
  const animFrameRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Derive tier
  const tierKey = useMemo(() => {
    const rawTier = (achievement?.tier || "").toLowerCase();
    if (["bronze", "silver", "gold", "platinum", "diamond"].includes(rawTier)) {
      return rawTier;
    }
    const code = (achievement?.code || "").toLowerCase();
    if (code.includes("diamond")) return "diamond";
    if (code.includes("platinum")) return "platinum";
    if (code.includes("gold")) return "gold";
    if (code.includes("silver")) return "silver";
    return "bronze";
  }, [achievement]);

  const config = TIER_CONFIG[tierKey] || TIER_CONFIG.gold;

  // Replay sequence
  const startCelebration = useCallback(() => {
    setIsRevealed(false);
    animStartTimeRef.current = null;
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    startCelebration();
  }, [startCelebration]);

  // ESC key dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Full-Screen Royal Academic Hall Canvas
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

    // Generate 45 celebratory confetti ribbons
    const confettiCount = 45;
    const confetti = [];
    for (let i = 0; i < confettiCount; i += 1) {
      confetti.push({
        x: hash(i * 3 + 1),
        y: -0.2 - hash(i * 7 + 3) * 0.8,
        vx: (hash(i * 11 + 5) - 0.5) * 0.08,
        vy: 0.18 + hash(i * 13 + 7) * 0.28,
        size: 5 + hash(i * 17 + 9) * 8,
        colorIndex: i % 4,
        rot: hash(i * 23) * Math.PI * 2,
        rotSpeed: (hash(i * 29) - 0.5) * 4,
      });
    }

    const renderFrame = (timestamp) => {
      if (!animStartTimeRef.current) animStartTimeRef.current = timestamp;
      const elapsed = (timestamp - animStartTimeRef.current) / 1000;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const logicalWidth = width / pixelRatio;
      const logicalHeight = height / pixelRatio;

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      // ── 1. ROYAL MIDNIGHT ACADEMIC HALL BACKDROP ──
      const hallGrad = ctx.createRadialGradient(
        logicalWidth * 0.5, logicalHeight * 0.45, 30,
        logicalWidth * 0.5, logicalHeight * 0.5, Math.max(logicalWidth, logicalHeight) * 0.85
      );
      hallGrad.addColorStop(0, "#13233f");
      hallGrad.addColorStop(0.5, "#081224");
      hallGrad.addColorStop(1, "#030712");
      ctx.fillStyle = hallGrad;
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // ── 2. ASCENDING STADIUM SPOTLIGHT BEAM CONES ──
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const beamCount = 6;
      for (let b = 0; b < beamCount; b += 1) {
        const beamX = logicalWidth * (0.15 + (0.7 * b) / (beamCount - 1));
        const sway = Math.sin(elapsed * 0.7 + b * 1.2) * 45;
        const targetX = logicalWidth * 0.5 + sway;

        const beamGrad = ctx.createLinearGradient(beamX, logicalHeight + 20, targetX, logicalHeight * 0.3);
        const beamAlpha = 0.08 + 0.05 * Math.sin(elapsed * 1.5 + b);
        beamGrad.addColorStop(0, rgba(config.auraRgb[0], config.auraRgb[1], config.auraRgb[2], beamAlpha * 1.2));
        beamGrad.addColorStop(0.7, rgba(config.auraRgb[0], config.auraRgb[1], config.auraRgb[2], beamAlpha * 0.4));
        beamGrad.addColorStop(1, rgba(255, 255, 255, 0));

        ctx.beginPath();
        ctx.moveTo(beamX - 35, logicalHeight);
        ctx.lineTo(beamX + 35, logicalHeight);
        ctx.lineTo(targetX + 90, logicalHeight * 0.2);
        ctx.lineTo(targetX - 90, logicalHeight * 0.2);
        ctx.closePath();
        ctx.fillStyle = beamGrad;
        ctx.fill();
      }
      ctx.restore();

      // ── 3. REVOLVING VICTORY SUNBURST LIGHT RAYS (Behind Medal) ──
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const centerX = logicalWidth * 0.5;
      const centerY = logicalHeight * 0.36;
      const rayCount = 16;
      const rayLength = Math.min(logicalWidth, logicalHeight) * 0.38;

      for (let r = 0; r < rayCount; r += 1) {
        const angle = (Math.PI * 2 * r) / rayCount + elapsed * 0.12;
        const widthHalf = 0.08;
        const rGrad = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, rayLength);
        rGrad.addColorStop(0, rgba(config.auraRgb[0], config.auraRgb[1], config.auraRgb[2], 0.22));
        rGrad.addColorStop(0.6, rgba(config.auraRgb[0], config.auraRgb[1], config.auraRgb[2], 0.08));
        rGrad.addColorStop(1, rgba(255, 255, 255, 0));

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle - widthHalf) * rayLength, centerY + Math.sin(angle - widthHalf) * rayLength);
        ctx.lineTo(centerX + Math.cos(angle + widthHalf) * rayLength, centerY + Math.sin(angle + widthHalf) * rayLength);
        ctx.closePath();
        ctx.fillStyle = rGrad;
        ctx.fill();
      }
      ctx.restore();

      // ── 4. FLOATING ACADEMIC GOLDEN SPARK MOTES (Upward drift) ──
      const sparkCount = 35;
      for (let s = 0; s < sparkCount; s += 1) {
        const seed = hash(s * 7 + 12);
        const life = (elapsed * 0.15 + seed) % 1;
        const sx = logicalWidth * hash(s * 13 + 42) + Math.sin(elapsed * 2 + s) * 15;
        const sy = logicalHeight * (1 - life * 0.85);
        const sRad = (1.2 + hash(s * 5) * 2.4) * (1 - life * 0.5);

        ctx.beginPath();
        ctx.fillStyle = rgba(config.auraRgb[0], config.auraRgb[1], config.auraRgb[2], (1 - life) * 0.85);
        ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 5. CELEBRATORY FALLING CONFETTI RIBBONS ──
      const palette = [
        rgba(255, 215, 0, 0.9), // Gold
        rgba(56, 189, 248, 0.9), // Cyan
        rgba(255, 255, 255, 0.95), // Silver / Diamond
        rgba(245, 158, 11, 0.9), // Amber
      ];

      confetti.forEach((c) => {
        const cy = ((c.y + c.vy * elapsed) % 1.4) * logicalHeight;
        const cx = (c.x * logicalWidth + Math.sin(elapsed * 2 + c.rot) * 25 + c.vx * elapsed * logicalWidth) % logicalWidth;
        const currentRot = c.rot + c.rotSpeed * elapsed;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(currentRot);
        ctx.fillStyle = palette[c.colorIndex];
        ctx.fillRect(-c.size * 0.5, -c.size * 0.25, c.size, c.size * 0.5);
        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [config]);

  const badgeTitle = achievement?.name || config.tierName;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden select-none bg-black">
      {/* Dynamic Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Exam Performance Milestone • {config.minScore} Mastery</span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-gray-300 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
          title="Return (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Centerpiece: Grand 3D Exam Performance Medal & Milestone Presentation */}
      <div
        className={`relative z-10 flex flex-col items-center text-center max-w-lg my-auto px-4 transition-all duration-700 ${
          isRevealed
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 -translate-y-8 pointer-events-none"
        }`}
      >
        {/* Floating Grand Medal with 3D Sculpted Victory Cup & Ordered Wings */}
        <div className="py-2 transform transition-transform hover:scale-105 duration-300 drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)]">
          <TCMedal
            tier={tierKey}
            gemColor={config.gemColor}
            useTrophyCup={true}
            size={220}
            glow={true}
          />
        </div>

        {/* Milestone Card Content */}
        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2">
            {/* Score Pill */}
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest shadow-inner ${config.pillBg}`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {config.title}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
              Congratulations!
            </h2>

            <p className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-400 drop-shadow-sm">
              You Unlocked {badgeTitle}!
            </p>

            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed font-medium">
              {achievement?.description || config.description}
            </p>
          </div>

          {/* Action Buttons: Return & Replay */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onClose}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r ${config.gradient} text-white font-black text-xs uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Trophy Room</span>
            </button>

            <button
              onClick={startCelebration}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Replay Celebration</span>
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
