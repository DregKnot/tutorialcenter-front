import React, { useState, useEffect } from 'react';

/**
 * OptimizedImage
 * High-performance image component with off-thread asynchronous decoding,
 * progressive blur-up skeleton placeholder, zero layout shift (CLS),
 * and priority resource hints (fetchpriority / loading).
 */
export default function OptimizedImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  priority = false, // If true, eager loads with high priority for LCP elements
  aspectRatio, // e.g. "4/3", "16/9", "1/1"
  style = {},
  onLoad,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check if image is already cached by browser
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    if (img.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleImageLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ 
        aspectRatio: aspectRatio || undefined,
        ...style 
      }}
    >
      {/* Progressive Shimmer / Skeleton Placeholder (Visible until image arrives) */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse"
          style={{ zIndex: 1 }}
        />
      )}

      {/* High-Resolution Streamed Image */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}

      {/* Fallback if image fails to load */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs">
          Image unavailable
        </div>
      )}
    </div>
  );
}
