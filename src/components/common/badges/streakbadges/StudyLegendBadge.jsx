import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * StudyLegendBadge - 180-Day Daily Streak Badge
 *
 * The Mythic Phoenix Star Comet (180-Day Half-Year Odyssey):
 * - Mythic Phoenix Ruby, Starlight Magenta & Sunfire Gold palette.
 * - 5 Radiant Phoenix Diamond Stars in a celestial ascending arc.
 * - Mythic Phoenix flame wings & shimmering cosmic core.
 * - High-velocity GSAP speed streams with protected negative space gaps.
 * - Forward cruise thrust & radiant stellar luminescence.
 */
export default function StudyLegendBadge({
  size = 140,
  earned = true,
  count = 180,
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
        duration: 0.65,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "96px 281px",
      });

      // ── 2. TOP SPEED LINES: PHOENIX FLAME GROW/SHRINK ──
      if (streamTopRef.current) {
        const topPills = Array.from(streamTopRef.current.querySelectorAll("rect"));
        topPills.forEach((rect, idx) => {
          gsap.fromTo(
            rect,
            { scaleX: 0.72, opacity: 0.8 },
            {
              scaleX: 1.26,
              opacity: 1,
              duration: 0.62 + (idx % 3) * 0.1,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformOrigin: "center",
              delay: idx * 0.07,
            }
          );
        });
      }

      // ── 3. MID-BACK SPEED LINES (BEHIND PHOENIX FIRE): GROW/SHRINK ──
      if (streamMidBackRef.current) {
        const midPills = Array.from(streamMidBackRef.current.querySelectorAll("rect"));
        midPills.forEach((rect, idx) => {
          gsap.fromTo(
            rect,
            { scaleX: 0.7, opacity: 0.75 },
            {
              scaleX: 1.28,
              opacity: 1,
              duration: 0.58 + (idx % 3) * 0.08,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformOrigin: "center",
              delay: 0.07 + idx * 0.06,
            }
          );
        });
      }

      // ── 4. BOTTOM SPEED LINES: PHOENIX FLAME GROW/SHRINK ──
      if (streamBottomRef.current) {
        const bottomPills = Array.from(streamBottomRef.current.querySelectorAll("rect"));
        bottomPills.forEach((rect, idx) => {
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
              delay: 0.1 + idx * 0.07,
            }
          );
        });
      }

      // ── 5. STABLE INTERNAL LINES: PHOENIX EMBERS SHIMMER ──
      if (innerStreaksRef.current) {
        gsap.to(innerStreaksRef.current.children, {
          opacity: 0.4,
          duration: 0.38,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: {
            each: 0.08,
            repeat: -1,
            yoyo: true,
          },
        });
      }

      // ── 6. SUNFIRE PHOENIX CORE PULSE ──
      gsap.to(coreRef.current, {
        scale: 1.05,
        duration: 0.42,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "96px 281px",
      });

      // ── 7. 5 PHOENIX DIAMOND STARS ROTATION & TWINKLE ──
      if (starsRef.current) {
        Array.from(starsRef.current.children).forEach((starGroup, idx) => {
          const origin = starGroup.getAttribute("data-origin") || "50px 50px";
          const dir = idx % 2 === 0 ? 360 : -360;

          gsap.to(starGroup, {
            rotation: dir,
            duration: 6.5 + idx * 1.3,
            repeat: -1,
            ease: "none",
            transformOrigin: origin,
          });

          gsap.to(starGroup, {
            scale: 1.22,
            duration: 0.8 + idx * 0.15,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformOrigin: origin,
            delay: idx * 0.12,
          });
        });
      }

      // ── 8. SPEED STREAM PHOENIX GLOW PULSE ──
      gsap.fromTo(
        [streamTopRef.current, streamMidBackRef.current, streamBottomRef.current],
        { filter: "drop-shadow(0 0 4px rgba(247, 37, 133, 0.6))" },
        {
          filter: "drop-shadow(0 0 12px rgba(247, 37, 133, 0.95)) drop-shadow(0 0 24px rgba(255, 183, 3, 0.6))",
          duration: 0.72,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }
      );
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
        <defs>
          <filter id="studyLegendPhoenixGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* =====================================================
            1. TOP-LEFT 5 PHOENIX DIAMOND STARS (180 DAYS)
           ===================================================== */}
        <g ref={starsRef}>
          {/* Star 1 */}
          <g data-origin="32px 30px">
            <path
              d="
                M 32 8 
                C 32 17, 39 26, 49 28 
                L 56 30 
                C 60 31, 60 34, 56 35 
                L 49 37 
                C 39 39, 32 48, 32 57 
                C 32 61, 29 61, 29 57 
                C 29 48, 22 39, 12 37 
                L 5 35 
                C 1 34, 1 31, 5 30 
                L 12 28 
                C 22 26, 29 17, 29 8 
                C 29 4, 32 4, 32 8 
                Z
              "
              fill="#F72585"
            />
            <polygon points="30.5,16 41,30 30.5,44 20,30" fill="#FFB7D5" />
            <polygon points="30.5,23 36,30 30.5,37 25,30" fill="#FFFFFF" />
          </g>

          {/* Star 2 */}
          <g data-origin="75px 24px">
            <path
              d="
                M 75 4 
                C 75 13, 82 22, 92 24 
                L 99 26 
                C 103 27, 103 30, 99 31 
                L 92 33 
                C 82 35, 75 44, 75 53 
                C 75 57, 72 57, 72 53 
                C 72 44, 65 35, 55 33 
                L 48 31 
                C 44 30, 44 27, 48 26 
                L 55 24 
                C 65 22, 72 13, 72 4 
                C 72 0, 75 0, 75 4 
                Z
              "
              fill="#FFB703"
            />
            <polygon points="73.5,12 84,26 73.5,40 63,26" fill="#FFF3B0" />
            <polygon points="73.5,19 79,26 73.5,33 68,26" fill="#FFFFFF" />
          </g>

          {/* Star 3 */}
          <g data-origin="115px 35px">
            <path
              d="
                M 115 18 
                C 115 25, 120 31, 128 33 
                L 133 34 
                C 137 35, 137 37, 133 38 
                L 128 39 
                C 120 41, 115 47, 115 54 
                C 115 57, 112 57, 112 54 
                C 112 47, 107 41, 99 39 
                L 94 38 
                C 90 37, 90 35, 94 34 
                L 99 33 
                C 107 31, 112 25, 112 18 
                C 112 15, 115 15, 115 18 
                Z
              "
              fill="#F72585"
            />
            <polygon points="113.5,22 123,35 113.5,48 104,35" fill="#FFB7D5" />
            <polygon points="113.5,28 118,35 113.5,42 109,35" fill="#FFFFFF" />
          </g>

          {/* Star 4 */}
          <g data-origin="45px 75px">
            <path
              d="
                M 45 58 
                C 45 66, 51 74, 61 77 
                L 67 78 
                C 71 79, 71 82, 67 83 
                L 61 84 
                C 51 87, 45 95, 45 103 
                C 45 107, 42 107, 42 103 
                C 42 95, 36 87, 26 84 
                L 20 83 
                C 16 82, 16 79, 20 78 
                L 26 77 
                C 36 74, 42 66, 42 58 
                C 42 54, 45 54, 45 58 
                Z
              "
              fill="#FFB703"
            />
            <polygon points="43.5,65 54,79 43.5,93 33,79" fill="#FFF3B0" />
            <polygon points="43.5,72 49,79 43.5,86 38,79" fill="#FFFFFF" />
          </g>

          {/* Star 5 */}
          <g data-origin="92px 80px">
            <path
              d="
                M 92 62 
                C 92 70, 98 78, 108 81 
                L 114 82 
                C 118 83, 118 86, 114 87 
                L 108 88 
                C 98 91, 92 99, 92 107 
                C 92 111, 89 111, 89 107 
                C 89 99, 83 91, 73 88 
                L 67 87 
                C 63 86, 63 83, 67 82 
                L 73 81 
                C 83 78, 89 70, 89 62 
                C 89 58, 92 58, 92 62 
                Z
              "
              fill="#F72585"
            />
            <polygon points="90.5,69 101,83 90.5,97 80,83" fill="#FFB7D5" />
            <polygon points="90.5,76 96,83 90.5,90 85,83" fill="#FFFFFF" />
          </g>
        </g>

        {/* =====================================================
            2. EXTERIOR PHOENIX SPEED STREAMS (MAGENTA & RUBY)
           ===================================================== */}
        
        {/* ── TOP SPEED TRACKS ── */}
        <g ref={streamTopRef} filter="url(#studyLegendPhoenixGlow)">
          {/* Row 1 */}
          <g>
            <rect x="155" y="47" width="105" height="17" rx="8.5" fill="#7209B7" />
            <rect x="285" y="47" width="45" height="17" rx="8.5" fill="#F72585" />
            <rect x="355" y="47" width="75" height="17" rx="8.5" fill="#FFB703" />
            <rect x="455" y="47" width="60" height="17" rx="8.5" fill="#B5179E" />
          </g>

          {/* Row 2 */}
          <g>
            <rect x="210" y="90" width="155" height="17" rx="8.5" fill="#F72585" />
            <rect x="390" y="90" width="48" height="17" rx="8.5" fill="#FFB703" />
            <rect x="463" y="90" width="65" height="17" rx="8.5" fill="#7209B7" />
          </g>

          {/* Row 3 */}
          <g>
            <rect x="90" y="133" width="225" height="17" rx="8.5" fill="#B5179E" />
            <rect x="340" y="133" width="55" height="17" rx="8.5" fill="#F72585" />
            <rect x="420" y="133" width="100" height="17" rx="8.5" fill="#FFB703" />
          </g>
        </g>

        {/* ── MID-BACK SPEED TRACKS (TRAILING BEHIND PHOENIX FIRE) ── */}
        <g ref={streamMidBackRef} filter="url(#studyLegendPhoenixGlow)">
          {/* Row Behind Top Fin */}
          <g>
            <rect x="440" y="195" width="75" height="17" rx="8.5" fill="#F72585" />
            <rect x="540" y="195" width="45" height="17" rx="8.5" fill="#FFB703" />
          </g>

          {/* Row In-between Upper Fins */}
          <g>
            <rect x="330" y="240" width="100" height="17" rx="8.5" fill="#7209B7" />
            <rect x="455" y="240" width="60" height="17" rx="8.5" fill="#F72585" />
            <rect x="540" y="240" width="70" height="17" rx="8.5" fill="#FFB703" />
          </g>

          {/* Row Behind Long Middle Fin */}
          <g>
            <rect x="490" y="285" width="85" height="17" rx="8.5" fill="#FFB703" />
            <rect x="600" y="285" width="50" height="17" rx="8.5" fill="#F72585" />
          </g>

          {/* Row In-between Lower Fins */}
          <g>
            <rect x="415" y="330" width="95" height="17" rx="8.5" fill="#B5179E" />
            <rect x="535" y="330" width="65" height="17" rx="8.5" fill="#F72585" />
          </g>
        </g>

        {/* ── BOTTOM SPEED TRACKS ── */}
        <g ref={streamBottomRef} filter="url(#studyLegendPhoenixGlow)">
          {/* Row 4 */}
          <g>
            <rect x="90" y="394" width="225" height="17" rx="8.5" fill="#B5179E" />
            <rect x="340" y="394" width="55" height="17" rx="8.5" fill="#F72585" />
            <rect x="420" y="394" width="100" height="17" rx="8.5" fill="#FFB703" />
          </g>

          {/* Row 5 */}
          <g>
            <rect x="210" y="437" width="155" height="17" rx="8.5" fill="#F72585" />
            <rect x="390" y="437" width="48" height="17" rx="8.5" fill="#FFB703" />
            <rect x="463" y="437" width="65" height="17" rx="8.5" fill="#7209B7" />
          </g>

          {/* Row 6 */}
          <g>
            <rect x="155" y="480" width="105" height="17" rx="8.5" fill="#7209B7" />
            <rect x="285" y="480" width="45" height="17" rx="8.5" fill="#F72585" />
            <rect x="355" y="480" width="75" height="17" rx="8.5" fill="#FFB703" />
            <rect x="455" y="480" width="60" height="17" rx="8.5" fill="#B5179E" />
          </g>
        </g>

        {/* =====================================================
            3. MAIN PHOENIX COMET BODY & CORE
           ===================================================== */}
        <g ref={cometRef}>

          {/* ── SUNFIRE MAGENTA PHOENIX BODY ── */}
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
              fill="#F72585"
            />

            {/* ── 4 STABLE INTERNAL SPEED STREAKS (RUBY & GOLD) ── */}
            <g ref={innerStreaksRef} filter="url(#studyLegendPhoenixGlow)">
              {/* Top Internal Streak (Phoenix Gold) */}
              <rect x="156" y="222" width="104" height="17" rx="8.5" fill="#FFB703" />

              {/* Middle Internal Streak (Magenta) */}
              <rect x="174" y="265" width="104" height="17" rx="8.5" fill="#7209B7" />

              {/* Bottom Internal Streak 1 (Phoenix Gold Long) */}
              <rect x="156" y="308" width="148" height="17" rx="8.5" fill="#FFB703" />

              {/* Bottom Internal Streak 2 (Ruby Short) */}
              <rect x="322" y="308" width="42" height="17" rx="8.5" fill="#B5179E" />
            </g>
          </g>

          {/* ── PHOENIX CORE ── */}
          <g ref={coreRef}>
            <circle
              cx="96"
              cy="281"
              r="52"
              fill="#B5179E"
            />

            {/* 2 Diagonal Sunfire Indentations */}
            <rect
              x="69"
              y="256"
              width="15"
              height="25"
              rx="7.5"
              fill="#FFB703"
              transform="rotate(-40 76.5 268.5)"
            />
            <rect
              x="96"
              y="283"
              width="15"
              height="25"
              rx="7.5"
              fill="#FFB703"
              transform="rotate(-40 103.5 295.5)"
            />
          </g>

        </g>
      </svg>
    </div>
  );
}
