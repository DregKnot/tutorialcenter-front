import React, { useRef, useEffect } from "react";
import logoVideo from "../../assets/videos/TC Logo Animation Only.mp4";
import tutorialLogo from "../../assets/images/tutorial_logo.webp";

const LogoAnimation = ({ onComplete }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // If an onComplete callback is provided, trigger it when the video ends
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleEnded = () => {
      if (onComplete) onComplete();
    };

    videoElement.addEventListener("ended", handleEnded);
    return () => {
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* DESKTOP VIEW: Logo Animation Video */}
      <div className="hidden md:flex w-full max-w-2xl mx-auto justify-center items-center">
        <video
          ref={videoRef}
          src={logoVideo}
          className="w-full h-auto mix-blend-multiply"
          autoPlay
          muted
          loop
          playsInline
          style={{ pointerEvents: "none" }}
        />
      </div>

      {/* MOBILE VIEW: Clean Fullscreen Tutorial Center Logo */}
      <div className="flex md:hidden w-full h-full flex-col items-center justify-center px-6 py-12 text-center select-none animate-in fade-in zoom-in-95 duration-500">
        <div className="relative flex items-center justify-center mb-6">
          {/* Subtle Ambient Pulse Glow */}
          <div className="absolute w-48 h-48 rounded-full bg-[#09314F]/5 blur-2xl animate-pulse pointer-events-none" />

          {/* Tutorial Center Logo */}
          <img
            src={tutorialLogo}
            alt="Tutorial Center Logo"
            className="w-40 h-40 sm:w-48 sm:h-48 object-contain relative z-10 drop-shadow-sm transition-transform duration-700 animate-pulse"
          />
        </div>

        {/* Brand Typography */}
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-black text-[#09314F] tracking-tight uppercase">
            Tutorial Center
          </h2>
          <p className="text-xs font-black text-[#C5A97A] uppercase tracking-widest">
            Study That Stays
          </p>
        </div>

        {/* Sleek Minimalist Loading Indicator */}
        <div className="mt-8 w-32 h-1 bg-gray-100 rounded-full overflow-hidden relative z-10 shadow-inner">
          <div className="w-full h-full bg-gradient-to-r from-[#09314F] via-[#C5A97A] to-[#09314F] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default LogoAnimation;
