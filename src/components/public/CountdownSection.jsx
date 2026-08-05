import React, { useState, useEffect } from 'react';
import { SparklesIcon, RocketLaunchIcon } from "@heroicons/react/24/solid";
import Orb from "./Orb";

const CountdownSection = () => {
  const targetDate = new Date("2026-07-30T12:20:00+01:00").getTime();

  const [isLive, setIsLive] = useState(() => new Date().getTime() >= targetDate);
  const [timeLeft, setTimeLeft] = useState(() => {
    const difference = targetDate - new Date().getTime();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  });

  useEffect(() => {
    if (isLive) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setIsLive(true);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, targetDate]);

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.03)] hover:border-[#BB9E7F]/40 hover:bg-white/10 transition-all duration-300 w-24 h-24 md:w-32 md:h-32">
      <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-1 font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-[10px] md:text-xs font-black text-[#BB9E7F] uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(187,158,127,0.5)]">
        {label}
      </div>
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden bg-[#0F2843] min-h-[600px] py-24 border-b border-white/5 flex items-center justify-center">
      {/* Orb Background */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-70">
        <Orb
          hoverIntensity={0.4}
          rotateOnHover={true}
          hue={0}
          forceHoverState={isLive}
          isLive={isLive}
          backgroundColor="#0F2843"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0F2843] via-transparent to-[#0F2843] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center">
        {isLive ? (
          <div className="flex flex-col items-center animate-in zoom-in-75 duration-700 ease-out">
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-[#76D287] blur-[40px] opacity-60 rounded-full animate-pulse" />
               <div className="relative w-28 h-28 bg-gradient-to-br from-[#76D287] to-[#4ade80] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(118,210,135,0.6)] border-4 border-[#0F2843]">
                 <RocketLaunchIcon className="w-14 h-14 text-white animate-bounce" />
               </div>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#BB9E7F] to-white tracking-tighter text-center mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              TUTORIAL CENTER IS NOW LIVE!
            </h2>
            <p className="text-lg md:text-xl text-white/90 font-bold text-center max-w-2xl mb-10 leading-relaxed drop-shadow-md">
              The wait is over. Dive into the leading digital tutorial center and start your journey to academic excellence today.
            </p>
            <a href="/register" className="px-10 py-4 bg-[#BB9E7F] hover:bg-white text-[#0F2843] font-black uppercase tracking-widest text-sm rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(187,158,127,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)]">
              Get Started Now
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-[#BB9E7F]/30 mb-8 shadow-[0_0_20px_rgba(187,158,127,0.2)]">
               <SparklesIcon className="w-4 h-4 text-[#BB9E7F]" />
               <span className="text-xs font-black text-[#BB9E7F] uppercase tracking-widest">Launching Soon</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white text-center tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              The Countdown Begins
            </h2>
            <p className="text-gray-300 font-medium text-center max-w-xl mb-12 text-sm md:text-base drop-shadow-md">
              We are preparing something extraordinary. Join us today at 12:20 PM for the official launch of Tutorial Center.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 w-full">
               <TimeUnit value={timeLeft.days} label="Days" />
               <div className="text-3xl text-white/20 font-light hidden sm:block mb-4">:</div>
               <TimeUnit value={timeLeft.hours} label="Hours" />
               <div className="text-3xl text-white/20 font-light hidden sm:block mb-4">:</div>
               <TimeUnit value={timeLeft.minutes} label="Minutes" />
               <div className="text-3xl text-white/20 font-light hidden sm:block mb-4">:</div>
               <TimeUnit value={timeLeft.seconds} label="Seconds" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CountdownSection;
