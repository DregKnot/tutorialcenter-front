import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import AchievementVisualRenderer, { getAchievementCondition } from './badges/AchievementVisualRenderer';

export default function AchievementCelebrationModal({
  achievement,
  onClose,
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (achievement) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [achievement]);

  if (!achievement || !active) return null;

  const condition = getAchievementCondition(achievement);
  const tier = achievement.tier || "";
  const name = achievement.name || "Achievement Unlocked!";
  const category = achievement.category || "Milestone";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden select-none animate-in fade-in duration-300">
      {/* Dark Blurred Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Rotating Sunburst Light Rays Behind Medal */}
      <div className="absolute inset-0 m-auto w-[600px] h-[600px] pointer-events-none opacity-40 animate-[spin_20s_linear_infinite]">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/40 via-cyan-500/20 to-transparent blur-2xl" />
      </div>

      {/* Confetti Particles (CSS Only, 0 CPU lag) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bounce opacity-70"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              backgroundColor: ['#f59e0b', '#38bdf8', '#e11d48', '#10b981', '#a855f7'][i % 5],
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 1}s`,
            }}
          />
        ))}
      </div>

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#0e1726] to-[#070b12] rounded-3xl p-8 border border-white/15 shadow-[0_0_50px_rgba(234,179,8,0.25)] text-center space-y-6 animate-in zoom-in-90 duration-300">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Achievement Unlocked!</span>
        </div>

        {/* Big 3D Medal Showcase with Full Live Animations */}
        <div className="py-2 flex justify-center transform hover:scale-105 transition-transform">
          <AchievementVisualRenderer 
            achievement={achievement} 
            size={180} 
            earned={true} 
            animated={true}
          />
        </div>

        {/* Title and Category */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            {name}
          </h2>
          
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
              {category.replace('_', ' ')}
            </span>
            {tier && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/30">
                {tier} Tier
              </span>
            )}
          </div>
        </div>

        {/* Requirement / Condition Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Requirement Completed:
          </p>
          <p className="text-xs text-gray-200 font-semibold leading-relaxed">
            {condition}
          </p>
        </div>

        {/* Continue & Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-[#E83831] to-[#09314F] text-white font-black text-sm uppercase tracking-wider shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Awesome! Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
