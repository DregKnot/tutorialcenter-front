import React, { useState } from 'react';
import { 
  Sparkles, Lock, Unlock, Info
} from 'lucide-react';
import TCMedal from '../../components/common/badges/TCMedal';
import AchievementVisualRenderer, { getAchievementCondition } from '../../components/common/badges/AchievementVisualRenderer';
import { useAchievement } from '../../context/AchievementContext';

// Master list of all representative achievement definitions across all 10 categories
const SHOWCASE_ACHIEVEMENTS = [
  // 1. Onboarding
  { id: 1, code: "onboarding.welcome_aboard", name: "Welcome Aboard", category: "onboarding", type: "badge", tier: null, description: "Created an account on Tutorial Center Africa." },
  { id: 2, code: "onboarding.profile_complete", name: "Profile Complete", category: "onboarding", type: "badge", tier: null, description: "Completed profile and verified student contact info." },
  { id: 3, code: "onboarding.ready_to_learn", name: "Ready To Learn", category: "onboarding", type: "badge", tier: null, description: "Enrolled in first subject or prep course." },
  { id: 4, code: "onboarding.first_step", name: "First Step", category: "onboarding", type: "badge", tier: null, description: "Started first CBT practice exam attempt." },
  { id: 5, code: "onboarding.first_answer", name: "First Answer", category: "onboarding", type: "badge", tier: null, description: "Submitted first practice question response." },
  { id: 6, code: "onboarding.practice_starter", name: "Practice Starter", category: "onboarding", type: "badge", tier: null, description: "Completed and submitted first full practice exam." },
  { id: 7, code: "onboarding.first_achievement", name: "First Achievement", category: "onboarding", type: "badge", tier: null, description: "Unlocked first platform achievement milestone." },
  { id: 8, code: "streak.3_day_flame", name: "Learning Begins", category: "onboarding", type: "badge", tier: "bronze", requirements: { streak_days: 3 }, description: "Maintained a 3-day continuous daily practice streak." },

  // 2. Practice Milestones (Official 9-Tier Ladder)
  { id: 10, code: "practice.question_explorer", name: "Question Explorer", category: "practice", type: "badge", tier: "bronze", description: "Answered 50 practice questions." },
  { id: 11, code: "practice.question_challenger", name: "Question Challenger", category: "practice", type: "badge", tier: "bronze", description: "Answered 100 practice questions." },
  { id: 12, code: "practice.knowledge_hunter", name: "Knowledge Hunter", category: "practice", type: "badge", tier: "silver", description: "Answered 250 practice questions." },
  { id: 13, code: "practice.study_warrior", name: "Study Warrior", category: "practice", type: "badge", tier: "silver", description: "Answered 500 practice questions." },
  { id: 14, code: "practice.academic_hero", name: "Academic Hero", category: "practice", type: "badge", tier: "gold", description: "Answered 1,000 practice questions." },
  { id: 15, code: "practice.practice_champion", name: "Practice Champion", category: "practice", type: "badge", tier: "gold", description: "Answered 2,500 practice questions." },
  { id: 16, code: "practice.learning_machine", name: "Learning Machine", category: "practice", type: "badge", tier: "platinum", description: "Answered 5,000 practice questions." },
  { id: 17, code: "practice.master_scholar", name: "Master Scholar", category: "practice", type: "badge", tier: "diamond", description: "Answered 10,000 practice questions." },
  { id: 18, code: "practice.education_legend", name: "Education Legend", category: "practice", type: "badge", tier: "diamond", description: "Answered 25,000 practice questions." },

  // 3. Learning Streak (8 Official Streaks)
  { id: 20, code: "streak.consistent_learner", name: "Consistent Learner", category: "streak", type: "badge", tier: "bronze", requirements: { streak_days: 3 }, description: "Maintained a 3-day continuous daily practice streak." },
  { id: 21, code: "streak.study_habit_builder", name: "Study Habit Builder", category: "streak", type: "badge", tier: "bronze", requirements: { streak_days: 7 }, description: "Maintained a 7-day continuous daily practice streak." },
  { id: 22, code: "streak.weekly_warrior", name: "Weekly Warrior", category: "streak", type: "badge", tier: "silver", requirements: { streak_days: 14 }, description: "Maintained a 14-day continuous daily practice streak." },
  { id: 23, code: "streak.monthly_achiever", name: "Monthly Achiever", category: "streak", type: "badge", tier: "gold", requirements: { streak_days: 30 }, description: "Maintained a 30-day continuous daily practice streak." },
  { id: 24, code: "streak.learning_machine", name: "Learning Machine", category: "streak", type: "badge", tier: "gold", requirements: { streak_days: 60 }, description: "Maintained a 60-day continuous daily practice streak." },
  { id: 25, code: "streak.academic_marathoner", name: "Academic Marathoner", category: "streak", type: "badge", tier: "platinum", requirements: { streak_days: 100 }, description: "Maintained a 100-day continuous daily practice streak." },
  { id: 26, code: "streak.study_legend", name: "Study Legend", category: "streak", type: "badge", tier: "diamond", requirements: { streak_days: 180 }, description: "Maintained a 180-day continuous daily practice streak." },
  { id: 27, code: "streak.year_of_excellence", name: "Year of Excellence", category: "streak", type: "badge", tier: "diamond", requirements: { streak_days: 365 }, description: "Maintained a 365-day (1 full year) continuous daily practice streak." },

  // 4. Exam Performance (Medals)
  { id: 30, code: "exam_performance.bronze", name: "Bronze Master", category: "exam_performance", type: "medal", tier: "bronze", requirements: { min_score: 60 }, description: "Scored 60% or higher on a completed practice exam." },
  { id: 31, code: "exam_performance.silver", name: "Silver Master", category: "exam_performance", type: "medal", tier: "silver", requirements: { min_score: 70 }, description: "Scored 70% or higher on a completed practice exam." },
  { id: 32, code: "exam_performance.gold", name: "Gold Master", category: "exam_performance", type: "medal", tier: "gold", requirements: { min_score: 80 }, description: "Scored 80% or higher on a completed practice exam." },
  { id: 33, code: "exam_performance.platinum", name: "Platinum Master", category: "exam_performance", type: "medal", tier: "platinum", requirements: { min_score: 90 }, description: "Scored 90% or higher on a completed practice exam." },
  { id: 34, code: "exam_performance.diamond", name: "Diamond Legend", category: "exam_performance", type: "medal", tier: "diamond", requirements: { min_score: 95 }, description: "Scored 95% or higher on a completed practice exam." },

  // 5. Weekly Accuracy
  { id: 40, code: "weekly_accuracy.bronze", name: "Accuracy Bronze", category: "weekly_accuracy", type: "medal", tier: "bronze", requirements: { accuracy_percentage: 60 }, description: "Maintained 60% weekly accuracy." },
  { id: 41, code: "weekly_accuracy.silver", name: "Accuracy Silver", category: "weekly_accuracy", type: "medal", tier: "silver", requirements: { accuracy_percentage: 70 }, description: "Maintained 70% weekly accuracy." },
  { id: 42, code: "weekly_accuracy.gold", name: "Accuracy Gold", category: "weekly_accuracy", type: "medal", tier: "gold", requirements: { accuracy_percentage: 80 }, description: "Maintained 80% weekly accuracy." },
  { id: 43, code: "weekly_accuracy.platinum", name: "Accuracy Platinum", category: "weekly_accuracy", type: "medal", tier: "platinum", requirements: { accuracy_percentage: 90 }, description: "Maintained 90% weekly accuracy." },
  { id: 44, code: "weekly_accuracy.perfect_genius", name: "Perfect Genius", category: "weekly_accuracy", type: "medal", tier: "diamond", requirements: { accuracy_percentage: 100 }, description: "Achieved 100% flawless weekly accuracy." },

  // 6. Time Investment
  { id: 50, code: "time_investment.one_hour_learner", name: "1 Hour Focus", category: "time_investment", type: "badge", tier: "bronze", description: "Spent 1 hour of active exam practice." },
  { id: 51, code: "time_investment.ten_hours_scholar", name: "10 Hours Scholar", category: "time_investment", type: "badge", tier: "silver", description: "Spent 10 hours of active exam practice." },
  { id: 52, code: "time_investment.fifty_hours_scholar", name: "50 Hours Dedication", category: "time_investment", type: "badge", tier: "gold", description: "Spent 50 hours of active exam practice." },
  { id: 53, code: "time_investment.one_hundred_hour_academic_hero", name: "100 Hours Hero", category: "time_investment", type: "badge", tier: "platinum", description: "Spent 100 hours of active exam practice." },
  { id: 54, code: "time_investment.five_hundred_hours_education_legend", name: "500 Hours Legend", category: "time_investment", type: "badge", tier: "diamond", description: "Spent 500 hours of active exam practice." },

  // 7. Speed & Fluency
  { id: 60, code: "speed.quick_thinker", name: "Quick Thinker", category: "speed", type: "badge", tier: "bronze", description: "Completed questions with swift response time." },
  { id: 61, code: "speed.lightning_brain", name: "Lightning Brain", category: "speed", type: "badge", tier: "gold", description: "Answered questions accurately at high velocity." },
  { id: 62, code: "speed.speed_legend", name: "Speed Legend", category: "speed", type: "medal", tier: "diamond", description: "Mastered high speed with elite accuracy." },

  // 8. Improvement
  { id: 70, code: "improvement.rising_star", name: "Rising Star", category: "improvement", type: "badge", tier: "silver", description: "Improved score by 15% over consecutive attempts." },
  { id: 71, code: "improvement.comeback_student", name: "Comeback Student", category: "improvement", type: "badge", tier: "gold", description: "Overcame a difficult subject module with a passing grade." },

  // 9. Academic Rank
  { id: 80, code: "rank.beginner", name: "Beginner", category: "rank", type: "badge", tier: null, description: "Initiated academic progression path." },
  { id: 81, code: "rank.scholar", name: "Scholar", category: "rank", type: "badge", tier: "silver", description: "Reached Level 10 Scholar rank." },
  { id: 82, code: "rank.academic_champion", name: "Academic Champion", category: "rank", type: "badge", tier: "gold", description: "Reached Level 25 Academic Champion rank." },
  { id: 83, code: "rank.education_legend", name: "Grand Legend", category: "rank", type: "badge", tier: "diamond", description: "Attained Level 50 Grand Legend status." },

  // 10. Special Events & Exam Prep
  { id: 90, code: "special_event.independence_day_challenge", name: "Independence Challenge", category: "special_event", type: "badge", tier: "gold", description: "Completed holiday special challenge exam." },
  { id: 91, code: "special_event.christmas_learning_champion", name: "Christmas Champion", category: "special_event", type: "badge", tier: "gold", description: "Practiced during the festive holiday learning drive." },
  { id: 92, code: "exam_preparation.jamb_ready", name: "JAMB Ready", category: "exam_preparation", type: "badge", tier: "gold", description: "Unlocked complete JAMB UTME past questions package." },
  { id: 93, code: "exam_preparation.waec_ready", name: "WAEC Ready", category: "exam_preparation", type: "badge", tier: "gold", description: "Unlocked complete WAEC preparation package." },
];

export default function BadgeDemo() {
  const { triggerCelebration } = useAchievement();
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewState, setViewState] = useState("earned"); // "earned" | "locked"
  const [isLiveAnimated, setIsLiveAnimated] = useState(true);

  const filteredAchievements = SHOWCASE_ACHIEVEMENTS.filter((a) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "onboarding") return a.category === "onboarding";
    if (activeCategory === "practice") return a.category === "practice";
    if (activeCategory === "streak") return a.category.includes("streak");
    if (activeCategory === "exam_performance") return a.category === "exam_performance";
    if (activeCategory === "weekly_accuracy") return a.category === "weekly_accuracy";
    if (activeCategory === "time_investment") return a.category === "time_investment";
    if (activeCategory === "special_event") return a.category === "special_event" || a.category === "exam_preparation";
    return a.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-[#070b12] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* ── TOP HERO: 3D PRECISION VECTOR MEDAL TIERS SHOWCASE ──────────────── */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#131b2c]/90 to-[#0a0f1d]/95 border border-white/15 shadow-[0_0_60px_rgba(14,165,233,0.15)] backdrop-blur-2xl overflow-hidden">
          
          <div className="text-center mb-12 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black tracking-[0.25em] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Gamified Student Experience
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-gray-400">
              Achievement & Medal Studio
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
              100% Vector SVG 3D Medals and Badges engineered with crystal facets, gemstone cores, metallic bevels, and zero CPU animation lag.
            </p>
          </div>

          {/* 5 Core Metal Tiers Showcase */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 items-end justify-items-center pt-4">
            
            {/* Bronze Tier */}
            <div className="text-center space-y-2 group cursor-pointer" onClick={() => triggerCelebration({ name: "Bronze Master", category: "exam_performance", tier: "bronze", description: "Scored 60%+ on practice exam." })}>
              <TCMedal 
                tier="bronze" 
                gemColor="emerald" 
                title="Bronze Master" 
                subtitle="60% Score"
                size={165}
              />
              <span className="inline-block px-3 py-1 rounded-full bg-amber-900/40 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-800">
                Bronze Tier
              </span>
            </div>

            {/* Silver Tier */}
            <div className="text-center space-y-2 group cursor-pointer" onClick={() => triggerCelebration({ name: "Silver Master", category: "exam_performance", tier: "silver", description: "Scored 70%+ on practice exam." })}>
              <TCMedal 
                tier="silver" 
                gemColor="sapphire" 
                title="Silver Master" 
                subtitle="70% Score"
                size={175}
              />
              <span className="inline-block px-3 py-1 rounded-full bg-slate-700/50 text-slate-200 text-[10px] font-black uppercase tracking-wider border border-slate-600">
                Silver Tier
              </span>
            </div>

            {/* Gold Tier */}
            <div className="text-center space-y-2 group cursor-pointer" onClick={() => triggerCelebration({ name: "Gold Master", category: "exam_performance", tier: "gold", description: "Scored 80%+ on practice exam." })}>
              <TCMedal 
                tier="gold" 
                gemColor="ruby" 
                title="Gold Master" 
                subtitle="80% Score"
                size={190}
              />
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/40">
                Gold Tier
              </span>
            </div>

            {/* Platinum Tier */}
            <div className="text-center space-y-2 group cursor-pointer" onClick={() => triggerCelebration({ name: "Platinum Master", category: "exam_performance", tier: "platinum", description: "Scored 90%+ on practice exam." })}>
              <TCMedal 
                tier="platinum" 
                gemColor="cyan" 
                title="Platinum Master" 
                subtitle="90% Score"
                size={180}
              />
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-900/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-700">
                Platinum Tier
              </span>
            </div>

            {/* Diamond Tier */}
            <div className="text-center space-y-2 group cursor-pointer" onClick={() => triggerCelebration({ name: "Diamond Legend", category: "exam_performance", tier: "diamond", description: "Scored 95%+ on practice exam." })}>
              <TCMedal 
                tier="diamond" 
                gemColor="diamond" 
                title="Diamond Legend" 
                subtitle="95%+ Flawless"
                size={195}
              />
              <span className="inline-block px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-[10px] font-black uppercase tracking-wider border border-sky-300/40">
                Diamond Tier
              </span>
            </div>

          </div>
        </div>

        {/* ── INTERACTIVE CATALOG SHOWCASE ────────────────────────────── */}
        <div className="space-y-8">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
            
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: "all", label: "All Categories" },
                { id: "onboarding", label: "Onboarding" },
                { id: "practice", label: "Practice" },
                { id: "streak", label: "Streaks" },
                { id: "exam_performance", label: "Exam Scores" },
                { id: "weekly_accuracy", label: "Weekly Accuracy" },
                { id: "time_investment", label: "Time" },
                { id: "speed", label: "Speed" },
                { id: "special_event", label: "Events & Prep" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === tab.id
                      ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View State Toggle (Earned vs Locked) & Animation Toggle */}
            <div className="flex flex-wrap items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
              <button
                onClick={() => setViewState("earned")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewState === "earned" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Earned</span>
              </button>
              <button
                onClick={() => setViewState("locked")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewState === "locked" ? "bg-gray-700 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Locked</span>
              </button>
              <button
                onClick={() => setIsLiveAnimated(!isLiveAnimated)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isLiveAnimated 
                    ? "bg-gradient-to-r from-amber-500 to-cyan-500 text-white shadow-md" 
                    : "text-gray-400 hover:text-white bg-white/5"
                }`}
                title="Toggle live animations on grid (default is frozen snapshot for 0 CPU lag)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLiveAnimated ? "Live Animation: ON" : "List Snapshot (0 Lag)"}</span>
              </button>
            </div>

          </div>

          {/* Achievement Grid with Condition Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAchievements.map((item) => {
              const condition = getAchievementCondition(item);
              const isEarned = viewState === "earned";

              return (
                <div
                  key={item.id}
                  className="bg-gradient-to-b from-[#0f172a]/90 to-[#070b12]/90 rounded-3xl p-6 border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:border-cyan-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => triggerCelebration(item)}
                >
                  {/* Badge Display Area */}
                  <div className="py-4 flex justify-center">
                    <AchievementVisualRenderer
                      achievement={item}
                      size={140}
                      earned={isEarned}
                      animated={isLiveAnimated}
                    />
                  </div>

                  {/* Metadata & Condition */}
                  <div className="space-y-3 pt-3 border-t border-white/10 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                          {item.category.replace('_', ' ')}
                        </span>
                        {item.tier && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                            {item.tier}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    {/* Condition Box */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-left">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                        <Info className="w-3 h-3 text-cyan-400" />
                        Unlock Condition:
                      </p>
                      <p className="text-[11px] text-gray-300 font-medium leading-tight">
                        {condition}
                      </p>
                    </div>

                    {/* Live Test Trigger Button */}
                    <button
                      onClick={() => triggerCelebration(item)}
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Test Unlock Celebration</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
