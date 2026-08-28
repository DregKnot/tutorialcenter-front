import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * YearOfExcellenceBadge - 365-Day Daily Streak Badge (1 Full Year Masterpiece)
 *
 * The Supernova Solar God Comet (365-Day Masterpiece Milestone):
 * - Celestial Diamond White, Radiant Pure Gold & Galactic Purple god-tier palette.
 * - Constellation Crown of 7 Orbiting Radiant Diamond Stars (eternal 7-day cyclical mastery).
 * - Hypernova starlight core & galactic speed streams.
 * - High-velocity GSAP speed streams with protected negative space gaps.
 * - Shimmering starlight pulses & whole-body forward supersonic cruise.
 */
export default function YearOfExcellenceBadge({
  size = 140,
  earned = true,
  count = 365,
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

      // ── 2. TOP SPEED LINES: CELESTIAL GOLD & WHITE GROW/SHRINK ──
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

      // ── 3. MID-BACK SPEED LINES (BEHIND SUPERNOVA FIRE): GROW/SHRINK ──
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

      // ── 4. BOTTOM SPEED LINES: CELESTIAL GOLD & WHITE GROW/SHRINK ──
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

      // ── 5. STABLE INTERNAL LINES: HYPERNOVA STARLIGHT SHIMMER ──
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

      // ── 6. SUPERNOVA HYPER-LUMINOUS CORE PULSE ──
      gsap.to(coreRef.current, {
        scale: 1.06,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "96px 281px",
      });

      // ── 7. CONSTELLATION CROWN OF 7 DIAMOND STARS (365 DAYS = 7-STAR CROWN) ──
      if (starsRef.current) {
        Array.from(starsRef.current.children).forEach((starGroup, idx) => {
          const origin = starGroup.getAttribute("data-origin") || "50px 50px";
          const dir = idx % 2 === 0 ? 360 : -360;

          gsap.to(starGroup, {
            rotation: dir,
            duration: 6 + idx * 1.0,
            repeat: -1,
            ease: "none",
            transformOrigin: origin,
          });

          gsap.to(starGroup, {
            scale: 1.25,
            duration: 0.75 + idx * 0.12,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformOrigin: origin,
            delay: idx * 0.09,
          });
        });
      }

      // ── 8. SPEED STREAM HYPERNOVA GLOW PULSE ──
      gsap.fromTo(
        [streamTopRef.current, streamMidBackRef.current, streamBottomRef.current],
        { filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))" },
        {
          filter: "drop-shadow(0 0 14px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 26px rgba(255, 215, 0, 0.85)) drop-shadow(0 0 38px rgba(90, 24, 154, 0.6))",
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
          <filter id="yearOfExcellenceHypernovaGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* =====================================================
            1. TOP-LEFT CONSTELLATION CROWN OF 7 DIAMOND STARS (365 DAYS)
           ===================================================== */}
        <g ref={starsRef}>
          {/* Star 1 (Pure Gold) */}
          <g data-origin="28px 20px">
            <path
              d="
                M 28 4 
                C 28 11, 33 17, 41 19 
                L 46 20 
                C 50 21, 50 23, 46 24 
                L 41 25 
                C 33 27, 28 33, 28 40 
                C 28 43, 25 43, 25 40 
                C 25 33, 20 27, 12 25 
                L 7 24 
                C 3 23, 3 21, 7 20 
                L 12 19 
                C 20 17, 25 11, 25 4 
                C 25 1, 28 1, 28 4 
                Z
              "
              fill="#FFD700"
            />
            <polygon points="26.5,10 36,21 26.5,32 17,21" fill="#FFF3B0" />
            <polygon points="26.5,15 31,21 26.5,27 22,21" fill="#FFFFFF" />
          </g>

          {/* Star 2 (Diamond White) */}
          <g data-origin="64px 18px">
            <path
              d="
                M 64 2 
                C 64 10, 70 17, 79 19 
                L 85 20 
                C 89 21, 89 24, 85 25 
                L 79 26 
                C 70 28, 64 35, 64 43 
                C 64 47, 61 47, 61 43 
                C 61 35, 55 28, 46 26 
                L 40 25 
                C 36 24, 36 21, 40 20 
                L 46 19 
                C 55 17, 61 10, 61 2 
                C 61 -1, 64 -1, 64 2 
                Z
              "
              fill="#FFFFFF"
            />
            <polygon points="62.5,9 73,21 62.5,33 52,21" fill="#FFF3B0" />
            <polygon points="62.5,15 67,21 62.5,27 58,21" fill="#FFFFFF" />
          </g>

          {/* Star 3 (Pure Gold) */}
          <g data-origin="102px 22px">
            <path
              d="
                M 102 6 
                C 102 13, 107 19, 115 21 
                L 120 22 
                C 124 23, 124 25, 120 26 
                L 115 27 
                C 107 29, 102 35, 102 42 
                C 102 45, 99 45, 99 42 
                C 99 35, 94 29, 86 27 
                L 81 26 
                C 77 25, 77 23, 81 22 
                L 86 21 
                C 94 19, 99 13, 99 6 
                C 99 3, 102 3, 102 6 
                Z
              "
              fill="#FFD700"
            />
            <polygon points="100.5,11 110,23 100.5,35 91,23" fill="#FFF3B0" />
            <polygon points="100.5,16 105,23 100.5,30 96,23" fill="#FFFFFF" />
          </g>

          {/* Star 4 (Grand Center Celestial Star - Diamond White) */}
          <g data-origin="68px 52px">
            <path
              d="
                M 68 20 
                C 68 33, 78 46, 94 50 
                L 104 53 
                C 110 54, 110 57, 104 58 
                L 94 61 
                C 78 65, 68 78, 68 91 
                C 68 96, 64 96, 64 91 
                C 64 78, 54 65, 38 61 
                L 28 58 
                C 22 57, 22 54, 28 53 
                L 38 50 
                C 54 46, 64 33, 64 20 
                C 64 15, 68 15, 68 20 
                Z
              "
              fill="#FFFFFF"
            />
            <polygon points="66,32 80,54 66,76 52,54" fill="#FFF3B0" />
            <polygon points="66,41 74,54 66,67 58,54" fill="#FFD700" />
            <polygon points="66,47 71,54 66,61 61,54" fill="#FFFFFF" />
          </g>

          {/* Star 5 (Starlight Silver) */}
          <g data-origin="28px 58px">
            <path
              d="
                M 28 42 
                C 28 49, 33 55, 41 57 
                L 46 58 
                C 50 59, 50 61, 46 62 
                L 41 63 
                C 33 65, 28 71, 28 78 
                C 28 81, 25 81, 25 78 
                C 25 71, 20 65, 12 63 
                L 7 62 
                C 3 61, 3 59, 7 58 
                L 12 57 
                C 20 55, 25 49, 25 42 
                C 25 39, 28 39, 28 42 
                Z
              "
              fill="#E0AAFF"
            />
            <polygon points="26.5,47 36,59 26.5,71 17,59" fill="#F3E8FF" />
            <polygon points="26.5,52 31,59 26.5,66 22,59" fill="#FFFFFF" />
          </g>

          {/* Star 6 (Pure Gold) */}
          <g data-origin="108px 60px">
            <path
              d="
                M 108 44 
                C 108 51, 113 57, 121 59 
                L 126 60 
                C 130 61, 130 63, 126 64 
                L 121 65 
                C 113 67, 108 73, 108 80 
                C 108 83, 105 83, 105 80 
                C 105 73, 100 67, 92 65 
                L 87 64 
                C 83 63, 83 61, 87 60 
                L 92 59 
                C 100 57, 105 51, 105 44 
                C 105 41, 108 41, 108 44 
                Z
              "
              fill="#FFD700"
            />
            <polygon points="106.5,49 116,61 106.5,73 97,61" fill="#FFF3B0" />
            <polygon points="106.5,54 111,61 106.5,68 102,61" fill="#FFFFFF" />
          </g>

          {/* Star 7 (Starlight Silver) */}
          <g data-origin="68px 95px">
            <path
              d="
                M 68 80 
                C 68 87, 73 93, 81 95 
                L 86 96 
                C 90 97, 90 99, 86 100 
                L 81 101 
                C 73 103, 68 109, 68 116 
                C 68 119, 65 119, 65 116 
                C 65 109, 60 103, 52 101 
                L 47 100 
                C 43 99, 43 97, 47 96 
                L 52 95 
                C 60 93, 65 87, 65 80 
                C 65 77, 68 77, 68 80 
                Z
              "
              fill="#E0AAFF"
            />
            <polygon points="66.5,85 76,97 66.5,109 57,97" fill="#F3E8FF" />
            <polygon points="66.5,90 71,97 66.5,104 62,97" fill="#FFFFFF" />
          </g>
        </g>

        {/* =====================================================
            2. EXTERIOR SUPERNOVA SPEED STREAMS (GOLD & PURPLE)
           ===================================================== */}
        
        {/* ── TOP SPEED TRACKS ── */}
        <g ref={streamTopRef} filter="url(#yearOfExcellenceHypernovaGlow)">
          {/* Row 1 */}
          <g>
            <rect x="155" y="47" width="105" height="17" rx="8.5" fill="#5A189A" />
            <rect x="285" y="47" width="45" height="17" rx="8.5" fill="#FFD700" />
            <rect x="355" y="47" width="75" height="17" rx="8.5" fill="#FFFFFF" />
            <rect x="455" y="47" width="60" height="17" rx="8.5" fill="#E0AAFF" />
          </g>

          {/* Row 2 */}
          <g>
            <rect x="210" y="90" width="155" height="17" rx="8.5" fill="#FFD700" />
            <rect x="390" y="90" width="48" height="17" rx="8.5" fill="#FFFFFF" />
            <rect x="463" y="90" width="65" height="17" rx="8.5" fill="#5A189A" />
          </g>

          {/* Row 3 */}
          <g>
            <rect x="90" y="133" width="225" height="17" rx="8.5" fill="#FFFFFF" />
            <rect x="340" y="133" width="55" height="17" rx="8.5" fill="#FFD700" />
            <rect x="420" y="133" width="100" height="17" rx="8.5" fill="#5A189A" />
          </g>
        </g>

        {/* ── MID-BACK SPEED TRACKS (TRAILING BEHIND SUPERNOVA FIRE) ── */}
        <g ref={streamMidBackRef} filter="url(#yearOfExcellenceHypernovaGlow)">
          {/* Row Behind Top Fin */}
          <g>
            <rect x="440" y="195" width="75" height="17" rx="8.5" fill="#FFD700" />
            <rect x="540" y="195" width="45" height="17" rx="8.5" fill="#FFFFFF" />
          </g>

          {/* Row In-between Upper Fins */}
          <g>
            <rect x="330" y="240" width="100" height="17" rx="8.5" fill="#5A189A" />
            <rect x="455" y="240" width="60" height="17" rx="8.5" fill="#FFD700" />
            <rect x="540" y="240" width="70" height="17" rx="8.5" fill="#E0AAFF" />
          </g>

          {/* Row Behind Long Middle Fin */}
          <g>
            <rect x="490" y="285" width="85" height="17" rx="8.5" fill="#FFFFFF" />
            <rect x="600" y="285" width="50" height="17" rx="8.5" fill="#FFD700" />
          </g>

          {/* Row In-between Lower Fins */}
          <g>
            <rect x="415" y="330" width="95" height="17" rx="8.5" fill="#5A189A" />
            <rect x="535" y="330" width="65" height="17" rx="8.5" fill="#FFD700" />
          </g>
        </g>

        {/* ── BOTTOM SPEED TRACKS ── */}
        <g ref={streamBottomRef} filter="url(#yearOfExcellenceHypernovaGlow)">
          {/* Row 4 */}
          <g>
            <rect x="90" y="394" width="225" height="17" rx="8.5" fill="#FFFFFF" />
            <rect x="340" y="394" width="55" height="17" rx="8.5" fill="#FFD700" />
            <rect x="420" y="394" width="100" height="17" rx="8.5" fill="#5A189A" />
          </g>

          {/* Row 5 */}
          <g>
            <rect x="210" y="437" width="155" height="17" rx="8.5" fill="#FFD700" />
            <rect x="390" y="437" width="48" height="17" rx="8.5" fill="#FFFFFF" />
            <rect x="463" y="437" width="65" height="17" rx="8.5" fill="#5A189A" />
          </g>

          {/* Row 6 */}
          <g>
            <rect x="155" y="480" width="105" height="17" rx="8.5" fill="#5A189A" />
            <rect x="285" y="480" width="45" height="17" rx="8.5" fill="#FFD700" />
            <rect x="355" y="480" width="75" height="17" rx="8.5" fill="#FFFFFF" />
            <rect x="455" y="480" width="60" height="17" rx="8.5" fill="#E0AAFF" />
          </g>
        </g>

        {/* =====================================================
            3. MAIN SUPERNOVA GOD COMET BODY & CORE
           ===================================================== */}
        <g ref={cometRef}>

          {/* ── RADIANT WHITE & GOLD SUPERNOVA BODY ── */}
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
              fill="#FFFFFF"
            />

            {/* ── 4 STABLE INTERNAL SPEED STREAKS (GOLD & PURPLE) ── */}
            <g ref={innerStreaksRef} filter="url(#yearOfExcellenceHypernovaGlow)">
              {/* Top Internal Streak (Gold) */}
              <rect x="156" y="222" width="104" height="17" rx="8.5" fill="#FFD700" />

              {/* Middle Internal Streak (Purple) */}
              <rect x="174" y="265" width="104" height="17" rx="8.5" fill="#5A189A" />

              {/* Bottom Internal Streak 1 (Gold Long) */}
              <rect x="156" y="308" width="148" height="17" rx="8.5" fill="#FFD700" />

              {/* Bottom Internal Streak 2 (Starlight Silver Short) */}
              <rect x="322" y="308" width="42" height="17" rx="8.5" fill="#E0AAFF" />
            </g>
          </g>

          {/* ── HYPERNOVA GOD CORE ── */}
          <g ref={coreRef}>
            <circle
              cx="96"
              cy="281"
              r="52"
              fill="#240046"
            />

            {/* 2 Diagonal Pure Gold Indentations */}
            <rect
              x="69"
              y="256"
              width="15"
              height="25"
              rx="7.5"
              fill="#FFD700"
              transform="rotate(-40 76.5 268.5)"
            />
            <rect
              x="96"
              y="283"
              width="15"
              height="25"
              rx="7.5"
              fill="#FFD700"
              transform="rotate(-40 103.5 295.5)"
            />
          </g>

        </g>
      </svg>
    </div>
  );
}
