import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * MonthlyAchieverBadge - 30-Day Daily Streak Badge
 *
 * The Solar Corona Comet (30-Day Streak Milestone):
 * - Radiant Solar Gold, Royal Amber & Ruby solar storm palette.
 * - 4 Orbiting Cosmic Diamond Stars in a stellar arc (representing 4 weeks of unbroken dedication).
 * - Solar flare corona core with high-luminance molten gold heat.
 * - High-velocity GSAP speed streams with protected negative space gaps.
 * - Whole-body hypersonic forward cruise & shimmering solar radiation.
 */
export default function MonthlyAchieverBadge({
  size = 140,
  earned = true,
  count = 30,
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

      // ── 3. MID-BACK SPEED LINES (BEHIND CRATER FIRE): ENERGETIC GROW/SHRINK ──
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

      // ── 6. SOLAR CORONA CORE INTENSE HEAT PULSE ──
      gsap.to(coreRef.current, {
        scale: 1.045,
        duration: 0.45,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "96px 281px",
      });

      // ── 7. 4 ORBITING COSMIC DIAMOND STARS (30 DAYS = 4 WEEKS) ──
      if (starsRef.current) {
        Array.from(starsRef.current.children).forEach((starGroup, idx) => {
          const origin = starGroup.getAttribute("data-origin") || "50px 50px";
          const dir = idx % 2 === 0 ? 360 : -360;

          gsap.to(starGroup, {
            rotation: dir,
            duration: 7 + idx * 1.5,
            repeat: -1,
            ease: "none",
            transformOrigin: origin,
          });

          gsap.to(starGroup, {
            scale: 1.2,
            duration: 0.8 + idx * 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformOrigin: origin,
            delay: idx * 0.15,
          });
        });
      }

      // ── 8. SPEED STREAM SOLAR GLOW PULSE ──
      gsap.fromTo(
        [streamTopRef.current, streamMidBackRef.current, streamBottomRef.current],
        { filter: "drop-shadow(0 0 4px rgba(255, 183, 3, 0.6))" },
        {
          filter: "drop-shadow(0 0 11px rgba(255, 183, 3, 0.95)) drop-shadow(0 0 22px rgba(217, 4, 41, 0.55))",
          duration: 0.75,
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
          <filter id="monthlySolarGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* =====================================================
            1. TOP-LEFT 4 SOLAR DIAMOND STARS (30 DAYS = 4 WEEKS)
           ===================================================== */}
        <g ref={starsRef}>
          {/* Star 1 (Main Solar Star) */}
          <g data-origin="36px 36px">
            <path
              d="
                M 36 8 
                C 36 18, 44 28, 56 31 
                L 64 33 
                C 69 34, 69 38, 64 39 
                L 56 41 
                C 44 44, 36 54, 36 64 
                C 36 69, 33 69, 33 64 
                C 33 54, 25 44, 13 41 
                L 5 39 
                C 0 38, 0 34, 5 33 
                L 13 31 
                C 25 28, 33 18, 33 8 
                C 33 3, 36 3, 36 8 
                Z
              "
              fill="#FFD166"
            />
            <polygon points="34.5,18 48,34.5 34.5,51 21,34.5" fill="#FFF3B0" />
            <polygon points="34.5,27 41,34.5 34.5,42 28,34.5" fill="#FFFFFF" />
          </g>

          {/* Star 2 (Ruby Flare Star) */}
          <g data-origin="84px 38px">
            <path
              d="
                M 84 18 
                C 84 26, 90 34, 100 37 
                L 106 38 
                C 110 39, 110 42, 106 43 
                L 100 44 
                C 90 47, 84 55, 84 63 
                C 84 67, 81 67, 81 63 
                C 81 55, 75 47, 65 44 
                L 59 43 
                C 55 42, 55 39, 59 38 
                L 65 37 
                C 75 34, 81 26, 81 18 
                C 81 14, 84 14, 84 18 
                Z
              "
              fill="#EF476F"
            />
            <polygon points="82.5,25 93,39 82.5,53 72,39" fill="#FFAAA6" />
            <polygon points="82.5,33 88,39 82.5,45 77,39" fill="#FFFFFF" />
          </g>

          {/* Star 3 (Amber Star) */}
          <g data-origin="45px 82px">
            <path
              d="
                M 45 62 
                C 45 70, 51 78, 61 81 
                L 67 82 
                C 71 83, 71 86, 67 87 
                L 61 88 
                C 51 91, 45 99, 45 107 
                C 45 111, 42 111, 42 107 
                C 42 99, 36 91, 26 88 
                L 20 87 
                C 16 86, 16 83, 20 82 
                L 26 81 
                C 36 78, 42 70, 42 62 
                C 42 58, 45 58, 45 62 
                Z
              "
              fill="#FB8500"
            />
            <polygon points="43.5,69 54,83 43.5,97 33,83" fill="#FFE066" />
            <polygon points="43.5,77 49,83 43.5,89 38,83" fill="#FFFFFF" />
          </g>

          {/* Star 4 (Gold Crown Star) */}
          <g data-origin="98px 84px">
            <path
              d="
                M 98 64 
                C 98 72, 104 80, 114 83 
                L 120 84 
                C 124 85, 124 88, 120 89 
                L 114 90 
                C 104 93, 98 101, 98 109 
                C 98 113, 95 113, 95 109 
                C 95 101, 89 93, 79 90 
                L 73 89 
                C 69 88, 69 85, 73 84 
                L 79 83 
                C 89 80, 95 72, 95 64 
                C 95 60, 98 60, 98 64 
                Z
              "
              fill="#FFB703"
            />
            <polygon points="96.5,71 107,85 96.5,99 86,85" fill="#FFF3B0" />
            <polygon points="96.5,79 102,85 96.5,91 91,85" fill="#FFFFFF" />
          </g>
        </g>

        {/* =====================================================
            2. EXTERIOR SOLAR SPEED STREAMS (GOLD & RUBY)
           ===================================================== */}
        
        {/* ── TOP SPEED TRACKS ── */}
        <g ref={streamTopRef} filter="url(#monthlySolarGlow)">
          {/* Row 1 */}
          <g>
            <rect x="155" y="47" width="105" height="17" rx="8.5" fill="#D90429" />
            <rect x="285" y="47" width="45" height="17" rx="8.5" fill="#FB8500" />
            <rect x="355" y="47" width="75" height="17" rx="8.5" fill="#FFB703" />
            <rect x="455" y="47" width="60" height="17" rx="8.5" fill="#FFE066" />
          </g>

          {/* Row 2 */}
          <g>
            <rect x="210" y="90" width="155" height="17" rx="8.5" fill="#FB8500" />
            <rect x="390" y="90" width="48" height="17" rx="8.5" fill="#FFD166" />
            <rect x="463" y="90" width="65" height="17" rx="8.5" fill="#D90429" />
          </g>

          {/* Row 3 */}
          <g>
            <rect x="90" y="133" width="225" height="17" rx="8.5" fill="#FFB703" />
            <rect x="340" y="133" width="55" height="17" rx="8.5" fill="#D90429" />
            <rect x="420" y="133" width="100" height="17" rx="8.5" fill="#FB8500" />
          </g>
        </g>

        {/* ── MID-BACK SPEED TRACKS (TRAILING BEHIND SOLAR CORONA FIRE) ── */}
        <g ref={streamMidBackRef} filter="url(#monthlySolarGlow)">
          {/* Row Behind Top Finger */}
          <g>
            <rect x="440" y="195" width="75" height="17" rx="8.5" fill="#FB8500" />
            <rect x="540" y="195" width="45" height="17" rx="8.5" fill="#FFD166" />
          </g>

          {/* Row In-between Upper Fingers */}
          <g>
            <rect x="330" y="240" width="100" height="17" rx="8.5" fill="#D90429" />
            <rect x="455" y="240" width="60" height="17" rx="8.5" fill="#FFB703" />
            <rect x="540" y="240" width="70" height="17" rx="8.5" fill="#FFE066" />
          </g>

          {/* Row Behind Long Middle Finger */}
          <g>
            <rect x="490" y="285" width="85" height="17" rx="8.5" fill="#FFB703" />
            <rect x="600" y="285" width="50" height="17" rx="8.5" fill="#FB8500" />
          </g>

          {/* Row In-between Lower Fingers */}
          <g>
            <rect x="415" y="330" width="95" height="17" rx="8.5" fill="#D90429" />
            <rect x="535" y="330" width="65" height="17" rx="8.5" fill="#FFB703" />
          </g>
        </g>

        {/* ── BOTTOM SPEED TRACKS ── */}
        <g ref={streamBottomRef} filter="url(#monthlySolarGlow)">
          {/* Row 4 */}
          <g>
            <rect x="90" y="394" width="225" height="17" rx="8.5" fill="#FFB703" />
            <rect x="340" y="394" width="55" height="17" rx="8.5" fill="#D90429" />
            <rect x="420" y="394" width="100" height="17" rx="8.5" fill="#FB8500" />
          </g>

          {/* Row 5 */}
          <g>
            <rect x="210" y="437" width="155" height="17" rx="8.5" fill="#FB8500" />
            <rect x="390" y="437" width="48" height="17" rx="8.5" fill="#FFD166" />
            <rect x="463" y="437" width="65" height="17" rx="8.5" fill="#D90429" />
          </g>

          {/* Row 6 */}
          <g>
            <rect x="155" y="480" width="105" height="17" rx="8.5" fill="#D90429" />
            <rect x="285" y="480" width="45" height="17" rx="8.5" fill="#FB8500" />
            <rect x="355" y="480" width="75" height="17" rx="8.5" fill="#FFB703" />
            <rect x="455" y="480" width="60" height="17" rx="8.5" fill="#FFE066" />
          </g>
        </g>

        {/* =====================================================
            3. MAIN SOLAR CORONA COMET BODY & CORE
           ===================================================== */}
        <g ref={cometRef}>

          {/* ── SOLAR GOLD COMET BODY WITH 3 HORIZONTAL FINGERS ── */}
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
              fill="#FFB703"
            />

            {/* ── 4 STABLE INTERNAL SPEED STREAKS (RUBY & AMBER) ── */}
            <g ref={innerStreaksRef} filter="url(#monthlySolarGlow)">
              {/* Top Internal Streak (Amber) */}
              <rect x="156" y="222" width="104" height="17" rx="8.5" fill="#FB8500" />

              {/* Middle Internal Streak (Ruby) */}
              <rect x="174" y="265" width="104" height="17" rx="8.5" fill="#D90429" />

              {/* Bottom Internal Streak 1 (Amber Long) */}
              <rect x="156" y="308" width="148" height="17" rx="8.5" fill="#FB8500" />

              {/* Bottom Internal Streak 2 (Sunbeam Short) */}
              <rect x="322" y="308" width="42" height="17" rx="8.5" fill="#FFE066" />
            </g>
          </g>

          {/* ── SOLAR RUBY & MOLTEN GOLD CORE ── */}
          <g ref={coreRef}>
            <circle
              cx="96"
              cy="281"
              r="52"
              fill="#D90429"
            />

            {/* 2 Diagonal Solar Flare Indentations */}
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
