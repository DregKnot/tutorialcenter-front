import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * ConsistentLearnerBadge - 3-Day Daily Streak Badge
 *
 * The Bronze Ember Comet (3-Day Streak Milestone):
 * - Warm Bronze, Deep Copper, Amber & Gold flame palette.
 * - 1 Solid Glowing Amber Diamond Star (ignition of the streak journey).
 * - Hypersonic horizontal comet cruise with 3 speed prongs.
 * - Dynamic grow/shrink speed streams with permanent negative space gaps.
 * - Thermal core shimmer & whole-body forward cruise.
 */
export default function ConsistentLearnerBadge({
  size = 140,
  earned = true,
  count = 3,
  animated = false,
  className = "",
}) {
  const isPlaying = earned && animated;

  // DOM Refs for GSAP
  const containerRef = useRef(null);
  const cometRef = useRef(null);
  const starRef = useRef(null);
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

      // ── 5. STABLE INTERNAL LINES: THERMAL EMBERS SHIMMER ──
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

      // ── 6. EMBER CORE HEAT PULSE ──
      gsap.to(coreRef.current, {
        scale: 1.04,
        duration: 0.45,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "96px 281px",
      });

      // ── 7. SOLID AMBER DIAMOND STAR ROTATION & TWINKLE ──
      if (starRef.current) {
        gsap.to(starRef.current, {
          rotation: 360,
          duration: 8.5,
          repeat: -1,
          ease: "none",
          transformOrigin: "52px 54px",
        });
        gsap.to(starRef.current, {
          scale: 1.2,
          duration: 0.95,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          transformOrigin: "52px 54px",
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
            1. TOP-LEFT 1 SOLID AMBER DIAMOND STAR (3 DAYS)
           ===================================================== */}
        <g ref={starRef}>
          {/* Main Star Body */}
          <path
            d="
              M 53 14 
              C 53 28, 64 43, 82 48 
              L 94 51 
              C 100 52, 100 56, 94 57 
              L 82 60 
              C 64 65, 53 80, 53 94 
              C 53 100, 49 100, 49 94 
              C 49 80, 38 65, 20 60 
              L 8 57 
              C 2 56, 2 52, 8 51 
              L 20 48 
              C 38 43, 49 28, 49 14 
              C 49 8, 53 8, 53 14 
              Z
            "
            fill="#F4A261"
          />

          {/* Solid Radiant Inner Facet */}
          <polygon
            points="51,32 68,54 51,76 34,54"
            fill="#FFF3B0"
          />

          {/* Solid White Center Gem Core */}
          <polygon
            points="51,43 59,54 51,65 43,54"
            fill="#FFFFFF"
          />
        </g>

        {/* =====================================================
            2. EXTERIOR BRONZE SPEED STREAMS (CRISP GAP PRESERVED)
           ===================================================== */}
        
        {/* ── TOP SPEED TRACKS ── */}
        <g ref={streamTopRef}>
          {/* Row 1 */}
          <g>
            <rect x="145" y="47" width="110" height="17" rx="8.5" fill="#9C412E" />
            <rect x="280" y="47" width="45" height="17" rx="8.5" fill="#E76F51" />
            <rect x="350" y="47" width="75" height="17" rx="8.5" fill="#9C412E" />
            <rect x="450" y="47" width="60" height="17" rx="8.5" fill="#F4A261" />
          </g>

          {/* Row 2 */}
          <g>
            <rect x="205" y="90" width="160" height="17" rx="8.5" fill="#E76F51" />
            <rect x="390" y="90" width="48" height="17" rx="8.5" fill="#E9C46A" />
            <rect x="463" y="90" width="65" height="17" rx="8.5" fill="#E76F51" />
          </g>

          {/* Row 3 */}
          <g>
            <rect x="85" y="133" width="230" height="17" rx="8.5" fill="#9C412E" />
            <rect x="340" y="133" width="55" height="17" rx="8.5" fill="#E76F51" />
            <rect x="420" y="133" width="100" height="17" rx="8.5" fill="#9C412E" />
          </g>
        </g>

        {/* ── MID-BACK SPEED TRACKS (TRAILING BEHIND CRATER FIRE) ── */}
        <g ref={streamMidBackRef}>
          {/* Row Behind Top Finger */}
          <g>
            <rect x="440" y="195" width="75" height="17" rx="8.5" fill="#E76F51" />
            <rect x="540" y="195" width="45" height="17" rx="8.5" fill="#E9C46A" />
          </g>

          {/* Row In-between Upper Fingers */}
          <g>
            <rect x="330" y="240" width="100" height="17" rx="8.5" fill="#9C412E" />
            <rect x="455" y="240" width="60" height="17" rx="8.5" fill="#E76F51" />
            <rect x="540" y="240" width="70" height="17" rx="8.5" fill="#F4A261" />
          </g>

          {/* Row Behind Long Middle Finger */}
          <g>
            <rect x="490" y="285" width="85" height="17" rx="8.5" fill="#E76F51" />
            <rect x="600" y="285" width="50" height="17" rx="8.5" fill="#9C412E" />
          </g>

          {/* Row In-between Lower Fingers */}
          <g>
            <rect x="415" y="330" width="95" height="17" rx="8.5" fill="#9C412E" />
            <rect x="535" y="330" width="65" height="17" rx="8.5" fill="#E76F51" />
          </g>
        </g>

        {/* ── BOTTOM SPEED TRACKS ── */}
        <g ref={streamBottomRef}>
          {/* Row 4 */}
          <g>
            <rect x="85" y="394" width="230" height="17" rx="8.5" fill="#9C412E" />
            <rect x="340" y="394" width="55" height="17" rx="8.5" fill="#E76F51" />
            <rect x="420" y="394" width="100" height="17" rx="8.5" fill="#9C412E" />
          </g>

          {/* Row 5 */}
          <g>
            <rect x="205" y="437" width="160" height="17" rx="8.5" fill="#E76F51" />
            <rect x="390" y="437" width="48" height="17" rx="8.5" fill="#E9C46A" />
            <rect x="463" y="437" width="65" height="17" rx="8.5" fill="#E76F51" />
          </g>

          {/* Row 6 */}
          <g>
            <rect x="145" y="480" width="110" height="17" rx="8.5" fill="#9C412E" />
            <rect x="280" y="480" width="45" height="17" rx="8.5" fill="#E76F51" />
            <rect x="350" y="480" width="75" height="17" rx="8.5" fill="#9C412E" />
            <rect x="450" y="480" width="60" height="17" rx="8.5" fill="#F4A261" />
          </g>
        </g>

        {/* =====================================================
            3. MAIN BRONZE COMET BODY & CORE
           ===================================================== */}
        <g ref={cometRef}>

          {/* ── WARM BRONZE BODY WITH 3 HORIZONTAL FINGERS ── */}
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
              fill="#E76F51"
            />

            {/* ── 4 STABLE INTERNAL SPEED STREAKS ── */}
            <g ref={innerStreaksRef}>
              {/* Top Internal Streak (Copper) */}
              <rect x="156" y="222" width="104" height="17" rx="8.5" fill="#9C412E" />

              {/* Middle Internal Streak (Amber) */}
              <rect x="174" y="265" width="104" height="17" rx="8.5" fill="#F4A261" />

              {/* Bottom Internal Streak 1 (Copper Long) */}
              <rect x="156" y="308" width="148" height="17" rx="8.5" fill="#9C412E" />

              {/* Bottom Internal Streak 2 (Gold Short) */}
              <rect x="322" y="308" width="42" height="17" rx="8.5" fill="#E9C46A" />
            </g>
          </g>

          {/* ── EARTH BRONZE CORE & CRATERS ── */}
          <g ref={coreRef}>
            <circle
              cx="96"
              cy="281"
              r="52"
              fill="#452A20"
            />

            {/* 2 Diagonal Warm Amber Crater Indentations */}
            <rect
              x="69"
              y="256"
              width="15"
              height="25"
              rx="7.5"
              fill="#E76F51"
              transform="rotate(-40 76.5 268.5)"
            />
            <rect
              x="96"
              y="283"
              width="15"
              height="25"
              rx="7.5"
              fill="#E76F51"
              transform="rotate(-40 103.5 295.5)"
            />
          </g>

        </g>
      </svg>
    </div>
  );
}
