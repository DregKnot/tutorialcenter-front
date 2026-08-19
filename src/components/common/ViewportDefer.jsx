import React, { useState, useEffect, useRef } from "react";

/**
 * ViewportDefer
 * High-performance IntersectionObserver wrapper that defers the mounting,
 * script execution, and rendering of below-the-fold components until they
 * approach the user's viewport.
 * 
 * This drastically reduces main-thread work, TBT (Total Blocking Time),
 * and initial JavaScript evaluation on the Home Page.
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
    <div ref={containerRef} style={{ minHeight: isVisible ? undefined : minHeight }}>
      {isVisible ? children : fallback}
    </div>
  );
}
