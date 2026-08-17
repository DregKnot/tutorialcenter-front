import React from 'react';
import { 
  SparklesIcon, 
  TagIcon, 
  CheckCircleIcon, 
  ArrowTrendingUpIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/solid';

const DiscountCard = ({ 
  title, 
  slashedPrice, 
  actualPrice, 
  savingsText, 
  isPopular = false,
  durationMonths 
}) => {
  // Auto-detect 3-months plan if not explicitly passed
  const isTargetPlan = isPopular || title?.toLowerCase().includes("quarterly") || title?.toLowerCase().includes("3 month");
  
  // Calculate approximate monthly cost
  const months = durationMonths || (
    title?.toLowerCase().includes("monthly") ? 1 :
    title?.toLowerCase().includes("quarterly") ? 3 :
    title?.toLowerCase().includes("semi") ? 6 :
    title?.toLowerCase().includes("annual") ? 12 : 1
  );

  const monthlyBreakdown = Math.round(actualPrice / months);

  return (
    <div 
      className={`relative w-full rounded-3xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col ${
        isTargetPlan 
          ? "border-2 border-emerald-500 shadow-[0_16px_40px_rgba(5,150,105,0.22)] scale-[1.02] bg-[#06243A]" 
          : "border border-gray-100 dark:border-gray-800 shadow-lg bg-white dark:bg-[#06243A]/90 hover:shadow-xl"
      }`}
    >
      {/* ── TOP BADGE: MOST POPULAR (Quarterly Exclusive) ── */}
      {isTargetPlan && (
        <div className="w-full bg-gradient-to-r from-[#09314F] via-[#047857] to-[#09314F] py-2 px-4 flex items-center justify-center gap-2 text-white border-b border-emerald-400/30">
          <SparklesIcon className="w-4 h-4 text-[#C5A97A] animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#E5D2AE]">
            Most Popular • Best Value
          </span>
          <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-300" />
        </div>
      )}

      {/* ── TOP SECTION: EMERALD PROMO HEADER ── */}
      <div 
        className={`relative pt-7 pb-6 px-6 flex-grow overflow-hidden flex flex-col justify-center text-white ${
          isTargetPlan 
            ? "bg-gradient-to-br from-[#064E3B] via-[#059669] to-[#10B981]" 
            : "bg-gradient-to-br from-[#065F46] to-[#047857]"
        }`}
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Row: Title + Discount Tag */}
        <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
          <h4 className="text-white font-black text-sm uppercase tracking-wider">
            {title}
          </h4>

          <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/30 shadow-sm">
            <TagIcon className="w-3 h-3 text-emerald-200" />
            <span>80% OFF</span>
          </div>
        </div>

        {/* Slashed Pill Badge if Extra Savings */}
        {savingsText && (
          <div className="inline-flex items-center gap-1.5 bg-[#09314F] text-[#C5A97A] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg w-max mb-3 border border-[#C5A97A]/40 shadow-sm relative z-10">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{savingsText} Bundle Bonus</span>
          </div>
        )}

        {/* Main Actual Price */}
        <div className="relative z-10 mt-1 flex items-baseline">
          <span className="text-2xl mr-1 font-black text-emerald-200">₦</span>
          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-sm">
            {actualPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Monthly Breakdown Anchor */}
        <p className="text-xs font-bold text-emerald-100 mt-1 relative z-10 flex items-center gap-1">
          <span>≈ ₦{monthlyBreakdown.toLocaleString()} / month</span>
          {months > 1 && <span className="text-[10px] opacity-75 font-normal">({months} months total)</span>}
        </p>

        {/* ── 3-MONTH PERKS HIGHLIGHT (Exclusively displayed on target tier) ── */}
        {isTargetPlan && (
          <div className="mt-4 pt-3.5 border-t border-white/20 space-y-1.5 relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/95">
              <CheckCircleIcon className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>Full syllabus mastery & exam readiness</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/95">
              <CheckCircleIcon className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>Weekly live masterclasses & mock tests</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/95">
              <CheckCircleIcon className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>Dedicated tutor Q&A support</span>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM SECTION: OBSIDIAN ORIGINAL PRICE ── */}
      <div className="bg-[#09314F] px-6 py-4 relative z-10 flex items-center justify-between border-t border-[#09314F]">
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Original Value
          </p>
          <div className="text-lg font-black text-gray-400 line-through tracking-tight flex items-baseline mt-0.5">
            <span className="text-xs mr-0.5 font-bold">₦</span>
            {slashedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">
            You Save
          </span>
          <span className="text-xs font-black text-white">
            ₦{(slashedPrice - actualPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiscountCard;
