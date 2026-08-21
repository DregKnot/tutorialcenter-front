import React, { useState, useEffect, useRef, Suspense } from "react";

/**
 * ViewportDefer
 * High-performance IntersectionObserver wrapper that defers the mounting,
 * script execution, and rendering of below-the-fold components until they
 * approach the user's viewport.
 * 
 * This drastically reduces main-thread work, TBT (Total Blocking Time),
 * and initial JavaScript evaluation on the Home Page.
 * 
 * Scroll-stability guarantees:
 * - minHeight is always kept as a floor so the container never collapses.
 * - overflowAnchor: "none" prevents browser scroll-anchoring adjustments.
 * - Each deferred section gets its own Suspense boundary so lazy-loading
 *   one section doesn't displace the rest of the page.
 */
export default function ViewportDefer({
  children,
  fallback = null,
  rootMargin = "250px",
  minHeight = "80px",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // If IntersectionObserver is not supported (e.g. legacy browsers or SSR), mount immediately
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight,
        overflowAnchor: "none",
      }}
    >
      {isVisible ? (
        <Suspense
          fallback={
            fallback || (
              <div
                style={{ minHeight }}
                className="w-full animate-pulse bg-gray-50/50 dark:bg-[#06243A]/20"
              />
            )
          }
        >
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
