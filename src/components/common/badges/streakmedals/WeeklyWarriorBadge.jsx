import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * WeeklyWarriorBadge - 14-Day Daily Streak Badge
 *
 * The Binary Warrior Comet (14-Day Streak Milestone):
 * - Crimson Red, Steel Indigo & Sapphire Blue warrior battle palette.
 * - 2 Sparkling Cosmic Diamond Stars (representing 2 full weeks of warrior discipline).
 * - Dual-crested warrior flame tail with sapphire speed fins.
 * - High-velocity GSAP speed streams with protected negative space gaps.
 * - Thermal molten core shimmer & whole-body hypersonic forward cruise.
 */
export default function WeeklyWarriorBadge({
  size = 140,
  earned = true,
  count = 14,
  animated = false,
  className = "",
}) {
  const isPlaying = earned && animated;

  // DOM Refs for GSAP
  const containerRef = useRef(null);
  const cometRef = useRef(null);
  const starsRef = useRef(null);
  const coreRef = useRef(null);

  // Speed Line Stream Group Refs
  const streamTopRef = useRef(null);
  const streamMidBackRef = useRef(null);
  const streamBottomRef = useRef(null);

  // Internal Thermal Shimmer Line Refs
  const innerStreaksRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) return;

    const ctx = gsap.context(() => {
      // ── 1. COMET WHOLE-BODY CRUISE THRUST ──
      gsap.to(cometRef.current, {
        x: -7,
        duration: 0.68,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "96px 281px",
      });

      // ── 2. TOP SPEED LINES: ENERGETIC GROW/SHRINK (GAP ALWAYS PRESERVED) ──
      if (streamTopRef.current) {
        const topPills = Array.from(streamTopRef.current.querySelectorAll("rect"));
        topPills.forEach((rect, idx) => {
          gsap.fromTo(
            rect,
            { scaleX: 0.72, opacity: 0.8 },
            {
              scaleX: 1.26,
              opacity: 1,
              duration: 0.65 + (idx % 3) * 0.1,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformOrigin: "center",
              delay: idx * 0.08,
            }
          );
        });
      }

      // ── 3. MID-BACK SPEED LINES: ENERGETIC GROW/SHRINK ──
      if (streamMidBackRef.current) {
        const midPills = Array.from(streamMidBackRef.current.querySelectorAll("rect"));
        midPills.forEach((rect, idx) => {
          gsap.fromTo(
            rect,
            { scaleX: 0.7, opacity: 0.75 },
            {
              scaleX: 1.28,
              opacity: 1,
              duration: 0.6 + (idx % 3) * 0.09,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformOrigin: "center",
              delay: 0.08 + idx * 0.07,
            }
          );
        });
      }

      // ── 4. BOTTOM SPEED LINES: ENERGETIC GROW/SHRINK ──
      if (streamBottomRef.current) {
        const bottomPills = Array.from(streamBottomRef.current.querySelectorAll("rect"));
        bottomPills.forEach((rect, idx) => {
          gsap.fromTo(
            rect,
            { scaleX: 0.72, opacity: 0.8 },
            {
              scaleX: 1.26,
              opacity: 1,
              duration: 0.68 + (idx % 3) * 0.1,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformOrigin: "center",
              delay: 0.12 + idx * 0.08,
            }
          );
        });
      }

      // ── 5. STABLE INTERNAL LINES: LUMINOUS THERMAL SHIMMER ──
      if (innerStreaksRef.current) {
        gsap.to(innerStreaksRef.current.children, {
          opacity: 0.45,
          duration: 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: {
            each: 0.09,
            repeat: -1,
            yoyo: true,
          },
        });
      }

      // ── 6. SAPPHIRE/CRIMSON CORE HEAT PULSE ──
      gsap.to(coreRef.current, {
        scale: 1.04,
        duration: 0.45,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "96px 281px",
      });

      // ── 7. TWIN COSMIC DIAMOND STARS DUAL ROTATION & TWINKLE ──
      if (starsRef.current) {
        const [star1, star2] = starsRef.current.children;

        gsap.to(star1, {
          rotation: 360,
          duration: 8,
          repeat: -1,
          ease: "none",
          transformOrigin: "42px 45px",
        });
        gsap.to(star1, {
          scale: 1.18,
          duration: 0.9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          transformOrigin: "42px 45px",
        });

        gsap.to(star2, {
          rotation: -360,
          duration: 9.5,
          repeat: -1,
          ease: "none",
          transformOrigin: "96px 82px",
        });
        gsap.to(star2, {
          scale: 1.22,
          duration: 1.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          transformOrigin: "96px 82px",
          delay: 0.25,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center transition-transform duration-300 ${
        earned
          ? "hover:scale-110 drop-shadow-2xl"
          : "filter grayscale contrast-75 opacity-40"
      } ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full overflow-visible select-none"
        aria-hidden="true"
      >
        {/* =====================================================
            1. TOP-LEFT 2 COSMIC DIAMOND STARS (14 DAYS = 2 WEEKS)
           ===================================================== */}
        <g ref={starsRef}>
          {/* Star 1 (Main Sapphire Star) */}
          <g>
            <path
              d="
                M 44 10 
                C 44 22, 54 35, 70 39 
                L 80 41 
                C 86 42, 86 46, 80 47 
                L 70 49 
                C 54 54, 44 66, 44 78 
                C 44 84, 40 84, 40 78 
                C 40 66, 30 54, 14 49 
                L 4 47 
                C -1 46, -1 42, 4 41 
                L 14 39 
                C 30 35, 40 22, 40 10 
                C 40 4, 44 4, 44 10 
                Z
              "
              fill="#5B92E5"
            />
            {/* Solid Radiant Sapphire Inner Facet */}
            <polygon points="42,24 57,43 42,62 27,43" fill="#A8DADC" />
            <polygon points="42,34 50,43 42,52 34,43" fill="#FFFFFF" />
          </g>

          {/* Star 2 (Secondary Crimson Star) */}
          <g>
            <path
              d="
                M 97 52 
                C 97 61, 105 71, 117 74 
                L 125 76 
                C 130 77, 130 80, 125 81 
                L 117 83 
                C 105 86, 97 96, 97 105 
                C 97 110, 94 110, 94 105 
                C 94 96, 86 86, 74 83 
                L 66 81 
                C 62 80, 62 77, 66 76 
                L 74 74 
                C 86 71, 94 61, 94 52 
                C 94 48, 97 48, 97 52 
                Z
              "
              fill="#E63946"
            />
            {/* Solid Radiant Crimson Inner Facet */}
            <polygon points="95.5,62 108,78.5 95.5,95 83,78.5" fill="#FFAAA6" />
            <polygon points="95.5,71 102,78.5 95.5,86 89,78.5" fill="#FFFFFF" />
          </g>
        </g>

        {/* =====================================================
            2. EXTERIOR WARRIOR SPEED STREAMS (CRIMSON & SAPPHIRE)
           ===================================================== */}
        
        {/* ── TOP SPEED TRACKS ── */}
        <g ref={streamTopRef}>
          {/* Row 1 */}
          <g>
            <rect x="155" y="47" width="105" height="17" rx="8.5" fill="#1D3557" />
            <rect x="285" y="47" width="45" height="17" rx="8.5" fill="#457B9D" />
            <rect x="355" y="47" width="75" height="17" rx="8.5" fill="#E63946" />
            <rect x="455" y="47" width="60" height="17" rx="8.5" fill="#A8DADC" />
          </g>

          {/* Row 2 */}
          <g>
            <rect x="210" y="90" width="155" height="17" rx="8.5" fill="#E63946" />
            <rect x="390" y="90" width="48" height="17" rx="8.5" fill="#F4A261" />
            <rect x="463" y="90" width="65" height="17" rx="8.5" fill="#457B9D" />
          </g>

          {/* Row 3 */}
          <g>
            <rect x="90" y="133" width="225" height="17" rx="8.5" fill="#1D3557" />
            <rect x="340" y="133" width="55" height="17" rx="8.5" fill="#E63946" />
            <rect x="420" y="133" width="100" height="17" rx="8.5" fill="#457B9D" />
          </g>
        </g>

        {/* ── MID-BACK SPEED TRACKS (TRAILING DIRECTLY BEHIND WARRIOR FIRE) ── */}
        <g ref={streamMidBackRef}>
          {/* Row Behind Top Fin */}
          <g>
            <rect x="440" y="195" width="75" height="17" rx="8.5" fill="#457B9D" />
            <rect x="540" y="195" width="45" height="17" rx="8.5" fill="#E63946" />
          </g>

          {/* Row In-between Upper Fins */}
          <g>
            <rect x="330" y="240" width="100" height="17" rx="8.5" fill="#1D3557" />
            <rect x="455" y="240" width="60" height="17" rx="8.5" fill="#E63946" />
            <rect x="540" y="240" width="70" height="17" rx="8.5" fill="#A8DADC" />
          </g>

          {/* Row Behind Long Middle Fin */}
          <g>
            <rect x="490" y="285" width="85" height="17" rx="8.5" fill="#E63946" />
            <rect x="600" y="285" width="50" height="17" rx="8.5" fill="#457B9D" />
          </g>

          {/* Row In-between Lower Fins */}
          <g>
            <rect x="415" y="330" width="95" height="17" rx="8.5" fill="#1D3557" />
            <rect x="535" y="330" width="65" height="17" rx="8.5" fill="#E63946" />
          </g>
        </g>

        {/* ── BOTTOM SPEED TRACKS ── */}
        <g ref={streamBottomRef}>
          {/* Row 4 */}
          <g>
            <rect x="90" y="394" width="225" height="17" rx="8.5" fill="#1D3557" />
            <rect x="340" y="394" width="55" height="17" rx="8.5" fill="#E63946" />
            <rect x="420" y="394" width="100" height="17" rx="8.5" fill="#457B9D" />
          </g>

          {/* Row 5 */}
          <g>
            <rect x="210" y="437" width="155" height="17" rx="8.5" fill="#E63946" />
            <rect x="390" y="437" width="48" height="17" rx="8.5" fill="#F4A261" />
            <rect x="463" y="437" width="65" height="17" rx="8.5" fill="#457B9D" />
          </g>

          {/* Row 6 */}
          <g>
            <rect x="155" y="480" width="105" height="17" rx="8.5" fill="#1D3557" />
            <rect x="285" y="480" width="45" height="17" rx="8.5" fill="#457B9D" />
            <rect x="355" y="480" width="75" height="17" rx="8.5" fill="#E63946" />
            <rect x="455" y="480" width="60" height="17" rx="8.5" fill="#A8DADC" />
          </g>
        </g>

        {/* =====================================================
            3. MAIN WARRIOR COMET BODY & CORE
           ===================================================== */}
        <g ref={cometRef}>

          {/* ── CRIMSON WARRIOR BODY WITH DUAL-CRESTED SPEED PRONGS ── */}
          <g>
            <path
              d="
                M 105 186
                C 52 186, 9 229, 9 281
                C 9 333, 52 376, 105 376
                L 435 376
                A 18 18 0 0 0 435 340
                L 408 340
                A 18 18 0 0 1 408 304
                L 486 304
                A 18 18 0 0 0 486 268
                L 315 268
                A 18 18 0 0 1 315 232
                L 435 232
                A 23 23 0 0 0 435 186
                Z
              "
              fill="#E63946"
            />

            {/* ── 4 STABLE INTERNAL SPEED STREAKS (SAPPHIRE & INDIGO) ── */}
            <g ref={innerStreaksRef}>
              {/* Top Internal Streak (Steel Indigo) */}
              <rect x="156" y="222" width="104" height="17" rx="8.5" fill="#1D3557" />

              {/* Middle Internal Streak (Sapphire) */}
              <rect x="174" y="265" width="104" height="17" rx="8.5" fill="#457B9D" />

              {/* Bottom Internal Streak 1 (Steel Indigo Long) */}
              <rect x="156" y="308" width="148" height="17" rx="8.5" fill="#1D3557" />

              {/* Bottom Internal Streak 2 (Light Teal Short) */}
              <rect x="322" y="308" width="42" height="17" rx="8.5" fill="#A8DADC" />
            </g>
          </g>

          {/* ── SAPPHIRE & INDIGO WARRIOR SPHERE CORE ── */}
          <g ref={coreRef}>
            <circle
              cx="96"
              cy="281"
              r="52"
              fill="#1D3557"
            />

            {/* 2 Diagonal Crimson Crater Indentations */}
            <rect
              x="69"
              y="256"
              width="15"
              height="25"
              rx="7.5"
              fill="#E63946"
              transform="rotate(-40 76.5 268.5)"
            />
            <rect
              x="96"
              y="283"
              width="15"
              height="25"
              rx="7.5"
              fill="#E63946"
              transform="rotate(-40 103.5 295.5)"
            />
          </g>

        </g>
      </svg>
    </div>
  );
}
