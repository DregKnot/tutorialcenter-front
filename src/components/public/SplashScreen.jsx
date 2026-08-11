import React, { useEffect, useRef, useState } from 'react';
import LogoAnimation from './LogoAnimation.jsx';
import gsap from 'gsap';

const SplashScreen = ({ isGlobal = false, isVisible = true, onInitialLoadDone }) => {
  const containerRef = useRef(null);
  const [animationPlayed, setAnimationPlayed] = useState(false);

  useEffect(() => {
    if (!isGlobal) return;
    
    const handleLoad = () => {
      // Allow animation to play fully before signaling done
      setTimeout(() => {
        if (onInitialLoadDone) onInitialLoadDone();
      }, 4200); 
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
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
      <div className="w-full h-full flex items-center justify-center p-4">
        { (isVisible || !isGlobal) && <LogoAnimation /> }
      </div>
    </div>
  );
};

export default SplashScreen;
