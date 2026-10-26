import React, { useEffect, useRef, useState } from "react";
import { X, RotateCcw, ArrowLeft, Trophy } from "lucide-react";
import ExamPerformanceMedal from "./ExamPerformanceMedal";
import "./examCelebration.css";

const TIER_CONFIG = {
  bronze: {
    tierName: "Bronze Master",
    minScore: "60%",
    title: "60%+ Exam Distinction",
    accentColor: "#f59e0b",
    auraRgb: [180, 83, 9],
    description: "You scored 60% or higher on your CBT practice exam, demonstrating solid exam readiness and consistent academic discipline.",
  },
  silver: {
    tierName: "Silver Master",
    minScore: "70%",
    title: "70%+ High Distinction",
    accentColor: "#94a3b8",
    auraRgb: [148, 163, 184],
    description: "You achieved 70% or higher on your CBT practice exam, establishing strong subject mastery and competitive speed.",
  },
  gold: {
    tierName: "Gold Master",
    minScore: "80%",
    title: "80%+ Honors Scholar",
    accentColor: "#eab308",
    auraRgb: [234, 179, 8],
    description: "You scored 80% or higher on your CBT practice exam, earning high academic honors and elite placement among top performers.",
  },
  platinum: {
    tierName: "Platinum Master",
    minScore: "90%",
    title: "90%+ Master Scholar",
    accentColor: "#06b6d4",
    auraRgb: [6, 182, 212],
    description: "You attained an extraordinary 90% or higher on your CBT practice exam, proving exceptional subject command and precision under exam conditions.",
  },
  diamond: {
    tierName: "Diamond Legend",
    minScore: "95%",
    title: "95%+ Valedictorian Honor",
    accentColor: "#38bdf8",
    auraRgb: [56, 189, 248],
    description: "You conquered 95% or higher on your CBT practice exam with near-flawless accuracy, enshrining your name as a true Academic Legend.",
  },
};

export default function ExamPerformanceCelebrationModal({ achievement, onClose }) {
  const [replay, setReplay] = useState(0);
  const [phase, setPhase] = useState("anticipation");
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false
  );
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const requestedTier = (achievement?.tier || "").toLowerCase();
  const code = (achievement?.code || "").toLowerCase();
  const tier = TIER_CONFIG[requestedTier] ? requestedTier :
    ["diamond", "platinum", "gold", "silver"].find(value => code.includes(value)) || "bronze";
  const config = TIER_CONFIG[tier];
  const premium = ["gold", "platinum", "diamond"].includes(tier);
  const showcasing = phase === "display";

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query?.addEventListener?.("change", update);
    return () => query?.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) { setPhase("display"); return undefined; }
    setPhase("anticipation");
    const reveal = setTimeout(() => setPhase("reveal"), 600);
    const settle = setTimeout(() => setPhase("display"), 4200);
    return () => { clearTimeout(reveal); clearTimeout(settle); };
  }, [replay, tier, achievement?.id, reducedMotion]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = event => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const buttons = [...dialogRef.current.querySelectorAll("button:not([disabled])")];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="exam-award-title"
      className="exam-ceremony" data-phase={phase} data-tier={tier}
      style={{ "--award-accent": config.accentColor, "--award-rgb": config.auraRgb.join(",") }}>
      <div className="exam-ceremony__ambience" aria-hidden="true" />
      <header className="exam-ceremony__header">
        <span className="exam-ceremony__eyebrow"><Trophy size={15} />
          Exam Performance Milestone • {config.minScore} Mastery
        </span>
        <button ref={closeRef} onClick={onClose} className="exam-ceremony__close" title="Return (Esc)" aria-label="Close celebration"><X size={22} /></button>
      </header>

      <main className="exam-ceremony__main">
        <div key={replay} className="exam-ceremony__stage" aria-hidden="true">
          <div className="exam-ceremony__beam exam-ceremony__beam--left" />
          <div className="exam-ceremony__beam exam-ceremony__beam--right" />
          <div className="exam-ceremony__halo" />
          <div className="exam-ceremony__orbit" />
          <div className="exam-ceremony__burst" />
          <div className="exam-ceremony__medal">
            <ExamPerformanceMedal tier={tier} size={360} animated={showcasing}
              spin={showcasing} sparkles={showcasing && premium} />
          </div>
          <div className="exam-ceremony__plinth" />
          <span className="exam-ceremony__stage-label">{phase === "anticipation" ? "A moment earned." : "Academic excellence"}</span>
        </div>

        <section className="exam-ceremony__copy">
          <p className="exam-ceremony__kicker">Achievement unlocked</p>
          <h2 id="exam-award-title">{achievement?.name || config.tierName}</h2>
          <p className="exam-ceremony__distinction">{config.title}</p>
          <p className="exam-ceremony__description">{achievement?.description || config.description}</p>
          <div className="exam-ceremony__actions">
            <button onClick={onClose} className="exam-ceremony__return"><ArrowLeft size={16} />Return to Trophy Room</button>
            <button onClick={() => setReplay(value => value + 1)} className="exam-ceremony__replay"><RotateCcw size={15} />Replay Celebration</button>
          </div>
        </section>
      </main>
      <footer className="exam-ceremony__footer">Tutorial Center Africa <span>✦</span> Excellence, earned.</footer>
    </div>
  );
}
