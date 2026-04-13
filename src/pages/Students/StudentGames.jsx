import { useEffect, useState } from "react";
import DashboardLayout from "../../components/private/Students/DashboardLayout";
import Antigravity from "../../components/public/AntigravityBackground";

// Detects mobile at runtime — avoids heavy particle count on weak GPUs
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function StudentGames() {
  const isMobile = useIsMobile();

  // Mobile: fewer particles for GPU performance, larger magnetRadius for touch
  const particleConfig = isMobile
    ? { count: 120, magnetRadius: 12, particleSize: 1.2, ringRadius: 6 }
    : { count: 300, magnetRadius: 6,  particleSize: 1.5, ringRadius: 7 };

  return (
    <DashboardLayout pagetitle="Games & Fun" hideMobileTitle={false}>
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-gray-800"
        style={{ minHeight: isMobile ? "60vh" : "85vh" }}
      >

        {/* ── Antigravity Particle Background ── */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Antigravity
            count={particleConfig.count}
            magnetRadius={particleConfig.magnetRadius}
            ringRadius={particleConfig.ringRadius}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={particleConfig.particleSize}
            lerpSpeed={0.05}
            color="#09314F"
            autoAnimate
            particleVariance={1}
            rotationSpeed={0}
            depthFactor={1}
            pulseSpeed={3}
            particleShape="capsule"
            fieldStrength={10}
          />
        </div>

        {/* ── Foreground Content ── */}
        <div
          className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none"
          style={{ minHeight: isMobile ? "60vh" : "75vh" }}
        >
          <div className="flex flex-col items-center gap-3 select-none">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#5227FF]/60 dark:text-purple-400/60 mb-2">
              Games &amp; Fun
            </p>
            <h1 className="text-[38px] md:text-[56px] font-black uppercase tracking-tighter text-[#09314F] dark:text-white leading-none">
              C<span className="inline-block w-9 h-9 md:w-14 md:h-14 rounded-full border-[4px] border-[#09314F] dark:border-white align-middle mx-1 relative">
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-[2px] h-3 md:h-4 bg-[#09314F] dark:bg-white block" style={{ transform: "translateY(-1px)" }} />
                </span>
              </span>MING SOON
            </h1>
            <p className="text-[12px] md:text-[13px] font-medium text-gray-400 dark:text-gray-500 mt-1 tracking-wide text-center px-4">
              Team currently working on Games &amp; Fun
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
