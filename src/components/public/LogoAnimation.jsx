import React, { useRef, useEffect } from "react";
import logoVideo from "../../assets/videos/TC Logo Animation Only.mp4";

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
    <div className="w-full max-w-2xl mx-auto flex justify-center items-center">
      <video
        ref={videoRef}
        src={logoVideo}
        className="w-full h-auto mix-blend-multiply"
        autoPlay
        muted
        loop
        playsInline
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default LogoAnimation;
