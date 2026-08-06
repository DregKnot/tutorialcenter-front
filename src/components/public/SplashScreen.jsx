import React from 'react';
import TC_logo from "../../assets/images/TC 1.webp";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden">
      <style>{`
        @keyframes splashPulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-splash {
          animation: splashPulse 1.5s ease-in-out infinite alternate;
        }
      `}</style>
      <div className="flex flex-col items-center animate-splash">
        <img 
          src={TC_logo} 
          alt="Tutorial Center Logo" 
          className="h-[100px] md:h-[150px] w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default SplashScreen;
