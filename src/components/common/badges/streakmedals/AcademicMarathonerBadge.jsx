import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * AcademicMarathonerBadge - 100-Day Daily Streak Badge
 *
 * The Grand Centurion Golden Comet (100-Day Streak Milestone):
 * - Olympic Gold, Platinum White & Emerald Jade centurion prestige palette.
 * - 3 Grand Constellation Diamond Stars with central Master Diamond Star.
 * - Royal 5-tier golden speed tail & emerald core.
 * - High-velocity GSAP speed streams with protected negative space gaps.
 * - Shimmering platinum radiant pulses & whole-body forward cruise.
 */
export default function AcademicMarathonerBadge({
  size = 140,
  earned = true,
  count = 100,
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

      // ── 2. TOP SPEED LINES: GOLD & EMERALD GROW/SHRINK ──
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

      // ── 3. MID-BACK SPEED LINES (BEHIND GOLD FIRE): GROW/SHRINK ──
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

      // ── 4. BOTTOM SPEED LINES: GOLD & EMERALD GROW/SHRINK ──
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

      // ── 5. STABLE INTERNAL LINES: GOLDEN RADIANCE SHIMMER ──
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

      // ── 6. EMERALD / GOLD CORE PULSE ──
      gsap.to(coreRef.current, {
        scale: 1.05,
        duration: 0.42,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "96px 281px",
      });

      // ── 7. 3 GRAND CONSTELLATION DIAMOND STARS ──
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
            scale: 1.22,
            duration: 0.8 + idx * 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformOrigin: origin,
            delay: idx * 0.15,
          });
        });
      }

      // ── 8. SPEED STREAM CENTURION GOLD GLOW PULSE ──
      gsap.fromTo(
        [streamTopRef.current, streamMidBackRef.current, streamBottomRef.current],
        { filter: "drop-shadow(0 0 4px rgba(212, 175, 55, 0.6))" },
        {
          filter: "drop-shadow(0 0 12px rgba(212, 175, 55, 0.95)) drop-shadow(0 0 24px rgba(46, 196, 182, 0.6))",
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
          <filter id="academicGoldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* =====================================================
            1. TOP-LEFT 3 GRAND CONSTELLATION STARS (100 DAYS)
           ===================================================== */}
        <g ref={starsRef}>
          {/* Star 1: Emerald Star */}
          <g data-origin="34px 44px">
            <path
              d="
                M 34 16 
                C 34 26, 42 36, 54 39 
                L 62 41 
                C 67 42, 67 46, 62 47 
                L 54 49 
                C 42 52, 34 62, 34 72 
                C 34 77, 31 77, 31 72 
                C 31 62, 23 52, 11 49 
                L 3 47 
                C -2 46, -2 42, 3 41 
                L 11 39 
                C 23 36, 31 26, 31 16 
                C 31 11, 34 11, 34 16 
                Z
              "
              fill="#2EC4B6"
            />
            <polygon points="32.5,24 45,39 32.5,54 20,39" fill="#B4FFF7" />
            <polygon points="32.5,31 39,39 32.5,47 26,39" fill="#FFFFFF" />
          </g>

          {/* Star 2: Grand Center Platinum Star */}
          <g data-origin="84px 48px">
            <path
              d="
                M 84 10 
                C 84 24, 95 39, 113 44 
                L 125 47 
                C 131 48, 131 52, 125 53 
                L 113 56 
                C 95 61, 84 76, 84 90 
                C 84 96, 80 96, 80 90 
                C 80 76, 69 61, 51 56 
                L 39 53 
                C 33 52, 33 48, 39 47 
                L 51 44 
                C 69 39, 80 24, 80 10 
                C 80 4, 84 4, 84 10 
                Z
              "
              fill="#FFFFFF"
            />
            <polygon points="82,22 100,48 82,74 64,48" fill="#FFF3B0" />
            <polygon points="82,34 92,48 82,62 72,48" fill="#D4AF37" />
            <polygon points="82,40 88,48 82,56 76,48" fill="#FFFFFF" />
          </g>

          {/* Star 3: Royal Gold Star */}
          <g data-origin="75px 95px">
            <path
              d="
                M 75 72 
                C 75 80, 81 88, 91 91 
                L 97 92 
                C 101 93, 101 96, 97 97 
                L 91 98 
                C 81 101, 75 109, 75 117 
                C 75 121, 72 121, 72 117 
                C 72 109, 66 101, 56 98 
                L 50 97 
                C 46 96, 46 93, 50 92 
                L 56 91 
                C 66 88, 72 80, 72 72 
                C 72 68, 75 68, 75 72 
                Z
              "
              fill="#D4AF37"
            />
            <polygon points="73.5,78 84,92 73.5,106 63,92" fill="#FFF3B0" />
            <polygon points="73.5,84 79,92 73.5,100 68,92" fill="#FFFFFF" />
          </g>
        </g>

        {/* =====================================================
            2. EXTERIOR CENTURION SPEED STREAMS (GOLD & EMERALD)
           ===================================================== */}
        
        {/* ── TOP SPEED TRACKS ── */}
        <g ref={streamTopRef} filter="url(#academicGoldGlow)">
          {/* Row 1 */}
          <g>
            <rect x="155" y="47" width="105" height="17" rx="8.5" fill="#9A7B38" />
            <rect x="285" y="47" width="45" height="17" rx="8.5" fill="#2EC4B6" />
            <rect x="355" y="47" width="75" height="17" rx="8.5" fill="#D4AF37" />
            <rect x="455" y="47" width="60" height="17" rx="8.5" fill="#FFFFFF" />
          </g>

          {/* Row 2 */}
          <g>
            <rect x="210" y="90" width="155" height="17" rx="8.5" fill="#D4AF37" />
            <rect x="390" y="90" width="48" height="17" rx="8.5" fill="#2EC4B6" />
            <rect x="463" y="90" width="65" height="17" rx="8.5" fill="#FFFFFF" />
          </g>

          {/* Row 3 */}
          <g>
            <rect x="90" y="133" width="225" height="17" rx="8.5" fill="#2EC4B6" />
            <rect x="340" y="133" width="55" height="17" rx="8.5" fill="#D4AF37" />
            <rect x="420" y="133" width="100" height="17" rx="8.5" fill="#9A7B38" />
          </g>
        </g>

        {/* ── MID-BACK SPEED TRACKS (TRAILING BEHIND GOLD FIRE) ── */}
        <g ref={streamMidBackRef} filter="url(#academicGoldGlow)">
          {/* Row Behind Top Fin */}
          <g>
            <rect x="440" y="195" width="75" height="17" rx="8.5" fill="#D4AF37" />
            <rect x="540" y="195" width="45" height="17" rx="8.5" fill="#2EC4B6" />
          </g>

          {/* Row In-between Upper Fins */}
          <g>
            <rect x="330" y="240" width="100" height="17" rx="8.5" fill="#9A7B38" />
            <rect x="455" y="240" width="60" height="17" rx="8.5" fill="#D4AF37" />
            <rect x="540" y="240" width="70" height="17" rx="8.5" fill="#FFFFFF" />
          </g>

          {/* Row Behind Long Middle Fin */}
          <g>
            <rect x="490" y="285" width="85" height="17" rx="8.5" fill="#D4AF37" />
            <rect x="600" y="285" width="50" height="17" rx="8.5" fill="#2EC4B6" />
          </g>

          {/* Row In-between Lower Fins */}
          <g>
            <rect x="415" y="330" width="95" height="17" rx="8.5" fill="#9A7B38" />
            <rect x="535" y="330" width="65" height="17" rx="8.5" fill="#D4AF37" />
          </g>
        </g>

        {/* ── BOTTOM SPEED TRACKS ── */}
        <g ref={streamBottomRef} filter="url(#academicGoldGlow)">
          {/* Row 4 */}
          <g>
            <rect x="90" y="394" width="225" height="17" rx="8.5" fill="#2EC4B6" />
            <rect x="340" y="394" width="55" height="17" rx="8.5" fill="#D4AF37" />
            <rect x="420" y="394" width="100" height="17" rx="8.5" fill="#9A7B38" />
          </g>

          {/* Row 5 */}
          <g>
            <rect x="210" y="437" width="155" height="17" rx="8.5" fill="#D4AF37" />
            <rect x="390" y="437" width="48" height="17" rx="8.5" fill="#2EC4B6" />
            <rect x="463" y="437" width="65" height="17" rx="8.5" fill="#FFFFFF" />
          </g>

          {/* Row 6 */}
          <g>
            <rect x="155" y="480" width="105" height="17" rx="8.5" fill="#9A7B38" />
            <rect x="285" y="480" width="45" height="17" rx="8.5" fill="#2EC4B6" />
            <rect x="355" y="480" width="75" height="17" rx="8.5" fill="#D4AF37" />
            <rect x="455" y="480" width="60" height="17" rx="8.5" fill="#FFFFFF" />
          </g>
        </g>

        {/* =====================================================
            3. MAIN CENTURION GOLDEN COMET BODY & CORE
           ===================================================== */}
        <g ref={cometRef}>

          {/* ── OLYMPIC GOLD COMET BODY ── */}
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
              fill="#D4AF37"
            />

            {/* ── 4 STABLE INTERNAL SPEED STREAKS (EMERALD & PLATINUM) ── */}
            <g ref={innerStreaksRef} filter="url(#academicGoldGlow)">
              {/* Top Internal Streak (Emerald) */}
              <rect x="156" y="222" width="104" height="17" rx="8.5" fill="#2EC4B6" />

              {/* Middle Internal Streak (Bronze Gold) */}
              <rect x="174" y="265" width="104" height="17" rx="8.5" fill="#9A7B38" />

              {/* Bottom Internal Streak 1 (Emerald Long) */}
              <rect x="156" y="308" width="148" height="17" rx="8.5" fill="#2EC4B6" />

              {/* Bottom Internal Streak 2 (Platinum Short) */}
              <rect x="322" y="308" width="42" height="17" rx="8.5" fill="#FFFFFF" />
            </g>
          </g>

          {/* ── EMERALD & BRONZE CORE ── */}
          <g ref={coreRef}>
            <circle
              cx="96"
              cy="281"
              r="52"
              fill="#2EC4B6"
            />

            {/* 2 Diagonal Gold Crater Indentations */}
            <rect
              x="69"
              y="256"
              width="15"
              height="25"
              rx="7.5"
              fill="#D4AF37"
              transform="rotate(-40 76.5 268.5)"
            />
            <rect
              x="96"
              y="283"
              width="15"
              height="25"
              rx="7.5"
              fill="#D4AF37"
              transform="rotate(-40 103.5 295.5)"
            />
          </g>

        </g>
      </svg>
    </div>
  );
}
