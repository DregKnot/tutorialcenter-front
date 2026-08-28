import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * LearningMachineStreakBadge - 60-Day Daily Streak Badge
 *
 * The Cyber Plasma Comet (60-Day Streak Milestone):
 * - Electric Neon Cyan, Ultraviolet Purple & Cyber Blue bionic palette.
 * - 6 Cyan Circuit Stars arranged in a high-tech data constellation.
 * - Digital laser stream lines & glowing plasma core.
 * - High-velocity GSAP speed streams with protected negative space gaps.
 * - Shimmering cybernetic laser pulses & whole-body forward cruise.
 */
export default function LearningMachineStreakBadge({
  size = 140,
  earned = true,
  count = 60,
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

      // ── 2. TOP SPEED LINES: CYBER LASER GROW/SHRINK ──
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

      // ── 3. MID-BACK SPEED LINES (BEHIND PLASMA FIRE): CYBER GROW/SHRINK ──
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

      // ── 4. BOTTOM SPEED LINES: CYBER LASER GROW/SHRINK ──
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

      // ── 5. STABLE INTERNAL LINES: PLASMA GLOW SHIMMER ──
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

      // ── 6. ULTRAVIOLET PLASMA CORE HEAT PULSE ──
      gsap.to(coreRef.current, {
        scale: 1.05,
        duration: 0.42,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "96px 281px",
      });

      // ── 7. 6 CYAN CIRCUIT DIAMOND STARS PULSING & ROTATING ──
      if (starsRef.current) {
        Array.from(starsRef.current.children).forEach((starGroup, idx) => {
          const origin = starGroup.getAttribute("data-origin") || "50px 50px";
          const dir = idx % 2 === 0 ? 360 : -360;

          gsap.to(starGroup, {
            rotation: dir,
            duration: 6 + idx * 1.2,
            repeat: -1,
            ease: "none",
            transformOrigin: origin,
          });

          gsap.to(starGroup, {
            scale: 1.22,
            duration: 0.75 + idx * 0.15,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformOrigin: origin,
            delay: idx * 0.1,
          });
        });
      }

      // ── 8. SPEED STREAM CYBER PLASMA GLOW PULSE ──
      gsap.fromTo(
        [streamTopRef.current, streamMidBackRef.current, streamBottomRef.current],
        { filter: "drop-shadow(0 0 4px rgba(0, 245, 212, 0.6))" },
        {
          filter: "drop-shadow(0 0 12px rgba(0, 245, 212, 0.95)) drop-shadow(0 0 24px rgba(114, 9, 183, 0.6))",
          duration: 0.7,
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
          <filter id="learningMachinePlasmaGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* =====================================================
            1. TOP-LEFT 6 CYAN CIRCUIT STARS (60 DAYS)
           ===================================================== */}
        <g ref={starsRef}>
          {/* Star 1 */}
          <g data-origin="30px 24px">
            <path
              d="
                M 30 4 
                C 30 12, 36 20, 46 22 
                L 52 24 
                C 56 25, 56 28, 52 29 
                L 46 31 
                C 36 33, 30 41, 30 49 
                C 30 53, 27 53, 27 49 
                C 27 41, 21 33, 11 31 
                L 5 29 
                C 1 28, 1 25, 5 24 
                L 11 22 
                C 21 20, 27 12, 27 4 
                C 27 0, 30 0, 30 4 
                Z
              "
              fill="#00F5D4"
            />
            <polygon points="28.5,12 39,24 28.5,36 18,24" fill="#A0FFE6" />
            <polygon points="28.5,18 33,24 28.5,30 24,24" fill="#FFFFFF" />
          </g>

          {/* Star 2 */}
          <g data-origin="72px 22px">
            <path
              d="
                M 72 6 
                C 72 13, 77 19, 85 21 
                L 90 22 
                C 94 23, 94 25, 90 26 
                L 85 27 
                C 77 29, 72 35, 72 42 
                C 72 45, 69 45, 69 42 
                C 69 35, 64 29, 56 27 
                L 51 26 
                C 47 25, 47 23, 51 22 
                L 56 21 
                C 64 19, 69 13, 69 6 
                C 69 3, 72 3, 72 6 
                Z
              "
              fill="#4CC9F0"
            />
            <polygon points="70.5,12 80,22 70.5,32 61,22" fill="#BCEBFF" />
            <polygon points="70.5,17 75,22 70.5,27 66,22" fill="#FFFFFF" />
          </g>

          {/* Star 3 */}
          <g data-origin="110px 30px">
            <path
              d="
                M 110 14 
                C 110 21, 115 27, 123 29 
                L 128 30 
                C 132 31, 132 33, 128 34 
                L 123 35 
                C 115 37, 110 43, 110 50 
                C 110 53, 107 53, 107 50 
                C 107 43, 102 37, 94 35 
                L 89 34 
                C 85 33, 85 31, 89 30 
                L 94 29 
                C 102 27, 107 21, 107 14 
                C 107 11, 110 11, 110 14 
                Z
              "
              fill="#00F5D4"
            />
            <polygon points="108.5,20 118,30 108.5,40 99,30" fill="#A0FFE6" />
            <polygon points="108.5,25 113,30 108.5,35 104,30" fill="#FFFFFF" />
          </g>

          {/* Star 4 */}
          <g data-origin="36px 65px">
            <path
              d="
                M 36 49 
                C 36 56, 41 62, 49 64 
                L 54 65 
                C 58 66, 58 68, 54 69 
                L 49 70 
                C 41 72, 36 78, 36 85 
                C 36 88, 33 88, 33 85 
                C 33 78, 28 72, 20 70 
                L 15 69 
                C 11 68, 11 66, 15 65 
                L 20 64 
                C 28 62, 33 56, 33 49 
                C 33 46, 36 46, 36 49 
                Z
              "
              fill="#4CC9F0"
            />
            <polygon points="34.5,55 44,65 34.5,75 25,65" fill="#BCEBFF" />
            <polygon points="34.5,60 39,65 34.5,70 30,65" fill="#FFFFFF" />
          </g>

          {/* Star 5 */}
          <g data-origin="75px 68px">
            <path
              d="
                M 75 52 
                C 75 59, 80 65, 88 67 
                L 93 68 
                C 97 69, 97 71, 93 72 
                L 88 73 
                C 80 75, 75 81, 75 88 
                C 75 91, 72 91, 72 88 
                C 72 81, 67 75, 59 73 
                L 54 72 
                C 50 71, 50 69, 54 68 
                L 59 67 
                C 67 65, 72 59, 72 52 
                C 72 49, 75 49, 75 52 
                Z
              "
              fill="#00F5D4"
            />
            <polygon points="73.5,58 83,68 73.5,78 64,68" fill="#A0FFE6" />
            <polygon points="73.5,63 78,68 73.5,73 69,68" fill="#FFFFFF" />
          </g>

          {/* Star 6 */}
          <g data-origin="115px 78px">
            <path
              d="
                M 115 62 
                C 115 69, 120 75, 128 77 
                L 133 78 
                C 137 79, 137 81, 133 82 
                L 128 83 
                C 120 85, 115 91, 115 98 
                C 115 101, 112 101, 112 98 
                C 112 91, 107 85, 99 83 
                L 94 82 
                C 90 81, 90 79, 94 78 
                L 99 77 
                C 107 75, 112 69, 112 62 
                C 112 59, 115 59, 115 62 
                Z
              "
              fill="#4CC9F0"
            />
            <polygon points="113.5,68 123,78 113.5,88 104,78" fill="#BCEBFF" />
            <polygon points="113.5,73 118,78 113.5,83 109,78" fill="#FFFFFF" />
          </g>
        </g>

        {/* =====================================================
            2. EXTERIOR CYBER SPEED STREAMS (CYAN & VIOLET)
           ===================================================== */}
        
        {/* ── TOP SPEED TRACKS ── */}
        <g ref={streamTopRef} filter="url(#learningMachinePlasmaGlow)">
          {/* Row 1 */}
          <g>
            <rect x="155" y="47" width="105" height="17" rx="8.5" fill="#7209B7" />
            <rect x="285" y="47" width="45" height="17" rx="8.5" fill="#3A0CA3" />
            <rect x="355" y="47" width="75" height="17" rx="8.5" fill="#00F5D4" />
            <rect x="455" y="47" width="60" height="17" rx="8.5" fill="#4CC9F0" />
          </g>

          {/* Row 2 */}
          <g>
            <rect x="210" y="90" width="155" height="17" rx="8.5" fill="#00F5D4" />
            <rect x="390" y="90" width="48" height="17" rx="8.5" fill="#7209B7" />
            <rect x="463" y="90" width="65" height="17" rx="8.5" fill="#4CC9F0" />
          </g>

          {/* Row 3 */}
          <g>
            <rect x="90" y="133" width="225" height="17" rx="8.5" fill="#3A0CA3" />
            <rect x="340" y="133" width="55" height="17" rx="8.5" fill="#00F5D4" />
            <rect x="420" y="133" width="100" height="17" rx="8.5" fill="#7209B7" />
          </g>
        </g>

        {/* ── MID-BACK SPEED TRACKS (TRAILING BEHIND PLASMA FIRE) ── */}
        <g ref={streamMidBackRef} filter="url(#learningMachinePlasmaGlow)">
          {/* Row Behind Top Fin */}
          <g>
            <rect x="440" y="195" width="75" height="17" rx="8.5" fill="#00F5D4" />
            <rect x="540" y="195" width="45" height="17" rx="8.5" fill="#7209B7" />
          </g>

          {/* Row In-between Upper Fins */}
          <g>
            <rect x="330" y="240" width="100" height="17" rx="8.5" fill="#3A0CA3" />
            <rect x="455" y="240" width="60" height="17" rx="8.5" fill="#00F5D4" />
            <rect x="540" y="240" width="70" height="17" rx="8.5" fill="#4CC9F0" />
          </g>

          {/* Row Behind Long Middle Fin */}
          <g>
            <rect x="490" y="285" width="85" height="17" rx="8.5" fill="#00F5D4" />
            <rect x="600" y="285" width="50" height="17" rx="8.5" fill="#7209B7" />
          </g>

          {/* Row In-between Lower Fins */}
          <g>
            <rect x="415" y="330" width="95" height="17" rx="8.5" fill="#3A0CA3" />
            <rect x="535" y="330" width="65" height="17" rx="8.5" fill="#00F5D4" />
          </g>
        </g>

        {/* ── BOTTOM SPEED TRACKS ── */}
        <g ref={streamBottomRef} filter="url(#learningMachinePlasmaGlow)">
          {/* Row 4 */}
          <g>
            <rect x="90" y="394" width="225" height="17" rx="8.5" fill="#3A0CA3" />
            <rect x="340" y="394" width="55" height="17" rx="8.5" fill="#00F5D4" />
            <rect x="420" y="394" width="100" height="17" rx="8.5" fill="#7209B7" />
          </g>

          {/* Row 5 */}
          <g>
            <rect x="210" y="437" width="155" height="17" rx="8.5" fill="#00F5D4" />
            <rect x="390" y="437" width="48" height="17" rx="8.5" fill="#7209B7" />
            <rect x="463" y="437" width="65" height="17" rx="8.5" fill="#4CC9F0" />
          </g>

          {/* Row 6 */}
          <g>
            <rect x="155" y="480" width="105" height="17" rx="8.5" fill="#7209B7" />
            <rect x="285" y="480" width="45" height="17" rx="8.5" fill="#3A0CA3" />
            <rect x="355" y="480" width="75" height="17" rx="8.5" fill="#00F5D4" />
            <rect x="455" y="480" width="60" height="17" rx="8.5" fill="#4CC9F0" />
          </g>
        </g>

        {/* =====================================================
            3. MAIN CYBER PLASMA COMET BODY & CORE
           ===================================================== */}
        <g ref={cometRef}>

          {/* ── ELECTRIC CYAN COMET BODY ── */}
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
              fill="#00F5D4"
            />

            {/* ── 4 STABLE INTERNAL SPEED STREAKS (ULTRAVIOLET & CYBER BLUE) ── */}
            <g ref={innerStreaksRef} filter="url(#learningMachinePlasmaGlow)">
              {/* Top Internal Streak (Ultraviolet) */}
              <rect x="156" y="222" width="104" height="17" rx="8.5" fill="#7209B7" />

              {/* Middle Internal Streak (Cyber Violet) */}
              <rect x="174" y="265" width="104" height="17" rx="8.5" fill="#3A0CA3" />

              {/* Bottom Internal Streak 1 (Ultraviolet Long) */}
              <rect x="156" y="308" width="148" height="17" rx="8.5" fill="#7209B7" />

              {/* Bottom Internal Streak 2 (Neon Blue Short) */}
              <rect x="322" y="308" width="42" height="17" rx="8.5" fill="#4CC9F0" />
            </g>
          </g>

          {/* ── ULTRAVIOLET & CYBER CORE ── */}
          <g ref={coreRef}>
            <circle
              cx="96"
              cy="281"
              r="52"
              fill="#7209B7"
            />

            {/* 2 Diagonal Cyber Neon Indentations */}
            <rect
              x="69"
              y="256"
              width="15"
              height="25"
              rx="7.5"
              fill="#00F5D4"
              transform="rotate(-40 76.5 268.5)"
            />
            <rect
              x="96"
              y="283"
              width="15"
              height="25"
              rx="7.5"
              fill="#00F5D4"
              transform="rotate(-40 103.5 295.5)"
            />
          </g>

        </g>
      </svg>
    </div>
  );
}
