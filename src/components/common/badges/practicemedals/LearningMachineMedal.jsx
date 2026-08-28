import React, { useEffect, useRef } from 'react';

/**
 * LearningMachineMedal - Custom Standalone Medal for "Learning Machine" (5,000 Practice Questions)
 * 
 * Styled with Open Reference Book, Cyber AI Nodes & Lightweight Matrix Binary Halo Canvas:
 * - High-performance HTML5 Canvas rendering floating, glowing binary bits (0s & 1s) orbiting the magnifying glass.
 * - Optimized with requestAnimationFrame & cleanup to ensure smooth 60fps with zero lag.
 * - Open hardcover book with glowing cyber neon cyan-purple edges and futuristic AI circuit gears.
 * - Convex glowing lens proudly magnifying the "5,000" milestone.
 * - 100% vector SVG + lightweight Canvas synergy.
 */
export default function LearningMachineMedal({
  size = 140,
  earned = true,
  count = "5,000",
  animated = false,
  className = ""
}) {
  const id = React.useId().replace(/:/g, "_");
  const canvasRef = useRef(null);

  // Lightweight Binary Matrix Halo Canvas Animation (Only runs when inspecting / animated)
  useEffect(() => {
    if (!earned || !animated) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const dpr = window.devicePixelRatio || 1;
    const w = size;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Center coordinates matching the Magnifying Glass Lens in SVG (54%, 48%)
    const centerX = w * 0.54;
    const centerY = h * 0.48;
    const baseRadius = w * 0.28;

    // 28 Lightweight Binary Bit Particles in Richer/Darker Cyber Tones
    const numBits = 28;
    const bits = Array.from({ length: numBits }, (_, i) => {
      const angle = (i / numBits) * Math.PI * 2;
      return {
        angle: angle,
        speed: 0.007 + (Math.random() * 0.005 - 0.0025),
        radiusOffset: (Math.random() - 0.5) * (w * 0.09),
        value: Math.random() > 0.5 ? '1' : '0',
        fadePhase: (i / numBits) * Math.PI * 2,
        fadeSpeed: 0.025 + Math.random() * 0.02,
        fontSize: Math.floor(w * 0.072),
        colorType: i % 3 // 0: Deep Cyan/Teal, 1: Rich Royal/Sky Blue, 2: Deep Cyber Violet
      };
    });

    let frameCount = 0;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      frameCount++;

      bits.forEach((bit) => {
        bit.angle += bit.speed;
        bit.fadePhase += bit.fadeSpeed;

        // Smooth sinusoidal opacity fade with higher minimum visibility (0.35 to 1.0)
        const rawWave = (Math.sin(bit.fadePhase) + 1) / 2;
        const opacity = 0.35 + rawWave * 0.65;

        // Occasionally switch between 0 and 1
        if (rawWave < 0.05 && Math.random() < 0.15) {
          bit.value = bit.value === '1' ? '0' : '1';
        }

        const r = baseRadius + bit.radiusOffset + Math.sin(frameCount * 0.035 + bit.angle) * 3;
        const x = centerX + Math.cos(bit.angle) * r;
        const y = centerY + Math.sin(bit.angle) * r;

        ctx.save();
        ctx.font = `900 ${bit.fontSize}px "JetBrains Mono", "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = opacity;

        // Rich, Darker Cyber Tones for High Contrast & Visibility
        if (bit.colorType === 0) {
          ctx.fillStyle = '#0891b2'; // Deep Cyan / Teal
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 3;
        } else if (bit.colorType === 1) {
          ctx.fillStyle = '#0284c7'; // Rich Electric Blue
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 3;
        } else {
          ctx.fillStyle = '#7c3aed'; // Deep Cyber Violet
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 3;
        }

        ctx.fillText(bit.value, x, y);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [earned, animated, size]);

  return (
    <div 
      style={{ width: size, height: size }} 
      className={`relative flex items-center justify-center transition-transform duration-300 ${
        earned 
          ? "hover:scale-110 drop-shadow-2xl" 
          : "filter grayscale contrast-75 opacity-40"
      } ${className}`}
    >
      {/* ── BASE SVG MEDAL ARTWORK ── */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full drop-shadow-xl overflow-visible select-none"
      >
        <defs>
          {/* Drop Shadow Filter */}
          <filter id={`${id}_dropShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Book Edge Cyber Neon Glow Filter */}
          <filter id={`${id}_cyberGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#06b6d4" floodOpacity="0.9" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#a855f7" floodOpacity="0.5" />
          </filter>

          {/* Cyber AI Gear & Circuit Gradient */}
          <linearGradient id={`${id}_circuitGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          {/* Hardcover Outer Binding Gradient (Cyber Night) */}
          <linearGradient id={`${id}_coverGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Left Page Gradient */}
          <linearGradient id={`${id}_leftPageGrad`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Right Page Gradient */}
          <linearGradient id={`${id}_rightPageGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Side Layered Pages */}
          <linearGradient id={`${id}_sideLeaves`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Magnifying Glass Bezel Ring Gradient */}
          <linearGradient id={`${id}_glassRingGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>

          {/* Glowing Cyber Convex Glass Lens */}
          <radialGradient id={`${id}_lensGrad`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#67e8f9" />
            <stop offset="75%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Handle Gradient */}
          <linearGradient id={`${id}_handleGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* 5,000 Golden/Cyan Glowing Number Gradient */}
          <linearGradient id={`${id}_numGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Ambient Cyber Sunlight Radiance */}
          <radialGradient id={`${id}_searchAura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Aura Glow */}
        <circle cx="50" cy="50" r="44" fill={`url(#${id}_searchAura)`} />

        {/* ── 1. FUTURISTIC AI CIRCUIT NODES & GEAR BEHIND BOOK ── */}
        <g transform="translate(50, 16)" filter={`url(#${id}_dropShadow)`}>
          {/* Center Cyber Gear Ring */}
          <circle cx="0" cy="-6" r="8" fill="none" stroke={`url(#${id}_circuitGrad)`} strokeWidth="2.2" strokeDasharray="3,2" />
          <circle cx="0" cy="-6" r="3.5" fill="#38bdf8" />
          {/* Circuit Lines */}
          <line x1="-8" y1="-6" x2="-20" y2="-6" stroke="#38bdf8" strokeWidth="1.6" />
          <circle cx="-20" cy="-6" r="2" fill="#c084fc" />
          <line x1="8" y1="-6" x2="20" y2="-6" stroke="#38bdf8" strokeWidth="1.6" />
          <circle cx="20" cy="-6" r="2" fill="#c084fc" />
        </g>

        {/* ── 2. GLOWING NEON CONTOUR AROUND BOOK EDGES ── */}
        <g filter={`url(#${id}_cyberGlow)`}>
          <path 
            d="
              M 15 15 
              C 10 15, 6 20, 6 25 
              L 6 80 
              C 6 86, 12 90, 20 90 
              L 42 90 
              C 44 94, 47 96, 50 96 
              C 53 96, 56 94, 58 90 
              L 80 90 
              C 88 90, 94 86, 94 80 
              L 94 25 
              C 94 20, 90 15, 85 15 
              Z
            " 
            fill="none" 
            stroke="#06b6d4" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />
        </g>

        {/* ── 3. OPEN HARDCOVER BOOK ── */}
        <g filter={`url(#${id}_dropShadow)`}>
          
          {/* Main Hardcover Base (Cyber Dark) */}
          <path 
            d="
              M 15 15 
              C 10 15, 6 20, 6 25 
              L 6 80 
              C 6 86, 12 90, 20 90 
              L 42 90 
              C 44 94, 47 96, 50 96 
              C 53 96, 56 94, 58 90 
              L 80 90 
              C 88 90, 94 86, 94 80 
              L 94 25 
              C 94 20, 90 15, 85 15 
              Z
            " 
            fill={`url(#${id}_coverGrad)`} 
            stroke="#020617" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />

          {/* Side Layered Stack of Leaves */}
          <path d="M 12 20 L 12 80 C 12 83, 20 84, 26 84 L 26 24 C 20 24, 14 22, 12 20 Z" fill={`url(#${id}_sideLeaves)`} stroke="#020617" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 18 14 L 18 78 C 18 80, 26 82, 32 82 L 32 18 C 26 18, 20 16, 18 14 Z" fill="#e0f2fe" stroke="#020617" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 88 20 L 88 80 C 88 83, 80 84, 74 84 L 74 24 C 80 24, 86 22, 88 20 Z" fill={`url(#${id}_sideLeaves)`} stroke="#020617" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 82 14 L 82 78 C 82 80, 74 82, 68 82 L 68 18 C 74 18, 80 16, 82 14 Z" fill="#e0f2fe" stroke="#020617" strokeWidth="2.2" strokeLinejoin="round" />

          {/* Main Spread Open Pages */}
          <path d="M 50 20 L 26 6 C 26 6, 23 30, 23 75 C 30 75, 45 84, 50 86 Z" fill={`url(#${id}_leftPageGrad)`} stroke="#020617" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 50 20 L 74 6 C 74 6, 77 30, 77 75 C 70 75, 55 84, 50 86 Z" fill={`url(#${id}_rightPageGrad)`} stroke="#020617" strokeWidth="2.6" strokeLinejoin="round" />
          <line x1="50" y1="20" x2="50" y2="86" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ── 4. MAGNIFYING GLASS (EXPLORER LENS RESTING ON BOOK) ── */}
        <g transform="translate(54, 48)" filter={`url(#${id}_dropShadow)`}>
          
          {/* Handle (Pointing Down-Right) */}
          <g transform="rotate(45) translate(0, 18)">
            <rect 
              x="-6" 
              y="0" 
              width="12" 
              height="26" 
              rx="6" 
              fill={`url(#${id}_handleGrad)`} 
              stroke="#020617" 
              strokeWidth="2.6" 
            />
            <rect 
              x="-3" 
              y="4" 
              width="3.5" 
              height="16" 
              rx="1.75" 
              fill="#ffffff" 
              opacity="0.6" 
            />
          </g>

          {/* Thick Cyber Circular Bezel Rim */}
          <circle 
            cx="0" 
            cy="0" 
            r="23" 
            fill={`url(#${id}_glassRingGrad)`} 
            stroke="#020617" 
            strokeWidth="2.8" 
          />

          <circle 
            cx="0" 
            cy="0" 
            r="17.5" 
            fill="none" 
            stroke="#67e8f9" 
            strokeWidth="1.2" 
          />

          {/* Glowing Convex Glass Lens */}
          <circle 
            cx="0" 
            cy="0" 
            r="16.5" 
            fill={`url(#${id}_lensGrad)`} 
            stroke="#020617" 
            strokeWidth="2.2" 
          />

          <ellipse 
            cx="-6" 
            cy="-6" 
            rx="4.5" 
            ry="3" 
            fill="#ffffff" 
            opacity="0.85" 
            transform="rotate(-25 -6 -6)" 
          />

          {/* ── BOLD GLOWING "5,000" MILESTONE NUMBER IN LENS ── */}
          <text 
            x="0" 
            y="5.6" 
            textAnchor="middle" 
            fontSize="13" 
            fontWeight="900" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fill={`url(#${id}_numGrad)`} 
            stroke="#0f172a" 
            strokeWidth="1.2" 
            style={{ letterSpacing: "-0.6px" }}
          >
            {count}
          </text>
        </g>

        {/* ── 5. SPARKLES OF NEURAL POWER ── */}
        <g fill="#67e8f9" stroke="#020617" strokeWidth="1.2">
          <polygon points="90,12 91,15 94,16 91,17 90,20 89,17 86,16 89,15" />
          <polygon points="10,26 11,28 13,29 11,30 10,32 9,30 7,29 9,28" />
        </g>
      </svg>

      {/* ── 6. DYNAMIC MATRIX BINARY BITS CANVAS HALO (0s & 1s) ── */}
      {earned && animated && (
        <canvas 
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="absolute inset-0 pointer-events-none z-10"
        />
      )}
    </div>
  );
}
