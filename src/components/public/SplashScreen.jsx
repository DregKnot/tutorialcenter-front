import React, { useEffect, useRef, useState } from 'react';
import LogoAnimation from './LogoAnimation.jsx';
import gsap from 'gsap';

const SplashScreen = ({ isGlobal = false, isVisible = true, onInitialLoadDone }) => {
  const containerRef = useRef(null);
  const [animationPlayed, setAnimationPlayed] = useState(false);

  useEffect(() => {
    if (!isGlobal) return;
    
    // If the user has already seen the splash in this session, dismiss immediately (0ms)
    const hasSeenSplash = sessionStorage.getItem("tc_splash_seen");
    if (hasSeenSplash) {
      if (onInitialLoadDone) onInitialLoadDone();
      return;
    }

    // On first visit, allow a swift, elegant 850ms logo flourish, then immediately reveal the page
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem("tc_splash_seen", "true");
      } catch (e) {}
      if (onInitialLoadDone) onInitialLoadDone();
    }, 850);

    return () => clearTimeout(timer);
  }, [isGlobal, onInitialLoadDone]);

  useEffect(() => {
    if (isGlobal) {
      if (!isVisible && animationPlayed) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          pointerEvents: "none",
          onComplete: () => {
            gsap.set(containerRef.current, { display: "none" });
          }
        });
      } else if (isVisible) {
        gsap.set(containerRef.current, { display: "flex", pointerEvents: "auto", opacity: 1 });
        setAnimationPlayed(true);
      }
    }
  }, [isVisible, animationPlayed, isGlobal]);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden ${!isGlobal ? 'opacity-100' : ''}`}
    >
      <div className="w-full h-full flex items-center justify-center p-0 md:p-4">
        { (isVisible || !isGlobal) && <LogoAnimation /> }
      </div>
    </div>
  );
};

export default SplashScreen;
