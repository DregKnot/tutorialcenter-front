import React, { useEffect, useState } from 'react';

const PageLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress while the lazy chunk is downloading
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += (80 - currentProgress) * 0.15; // Slow down as it reaches 80%
      setProgress(currentProgress);
      
      if (currentProgress > 79.5) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[99999] pointer-events-none">
      <div 
        className="h-full bg-[#E83831] transition-all duration-100 ease-out shadow-[0_0_10px_#E83831]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default PageLoader;
