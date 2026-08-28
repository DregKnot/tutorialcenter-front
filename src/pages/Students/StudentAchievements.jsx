import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/private/Students/DashboardLayout';
import AchievementVisualRenderer, { getAchievementCondition } from '../../components/common/badges/AchievementVisualRenderer';
import { useAchievement } from '../../context/AchievementContext';
import { 
  Trophy, Sparkles, Flame, Target, Clock,
  CheckCircle2, Lock, Unlock, Search, X
} from 'lucide-react';

export default function StudentAchievements() {
  const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test").replace(/\/$/, "");
  const token = localStorage.getItem("token") || localStorage.getItem("student_token");
  const { triggerCelebration } = useAchievement();

  // State
  const [achievementsByCategory, setAchievementsByCategory] = useState({});
  const [progressData, setProgressData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "earned" | "locked"
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectingItem, setInspectingItem] = useState(null);

  // Fetch student achievements catalog & progress
  const fetchAchievementsData = useCallback(async () => {
    try {
      setLoading(true);
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      const [catalogRes, progressRes, streakRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/students/achievements`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/api/students/achievements/progress`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/api/students/streak`, { headers: authHeaders }),
      ]);

      if (catalogRes.status === "fulfilled" && catalogRes.value.data?.data) {
        setAchievementsByCategory(catalogRes.value.data.data);
      }

      if (progressRes.status === "fulfilled" && progressRes.value.data?.data) {
        setProgressData(progressRes.value.data.data);
      }

      if (streakRes.status === "fulfilled" && streakRes.value.data?.data) {
        setStreakData(streakRes.value.data.data);
      }
    } catch (err) {
      console.error("Failed to load student achievements:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchAchievementsData();
  }, [fetchAchievementsData]);

  // Flatten all achievements across categories
  const allAchievements = Object.entries(achievementsByCategory).flatMap(([categoryKey, items]) => 
    items.map(item => ({ ...item, category: item.category || categoryKey }))
  );

  // Totals & Metrics
  const totalAchievements = allAchievements.length;
  const earnedAchievements = allAchievements.filter(a => a.earned).length;
  const completionPercentage = totalAchievements > 0 ? Math.round((earnedAchievements / totalAchievements) * 100) : 0;

  // Filtered list
  const filteredList = allAchievements.filter((a) => {
    const matchesCategory = activeCategory === "all" || a.category === activeCategory;
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "earned" && a.earned) || 
      (filterStatus === "locked" && !a.earned);
    const matchesSearch = 
      searchQuery === "" ||
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 select-none animate-in fade-in duration-300">
        
        {/* ── TOP HERO BANNER: TROPHY ROOM & LIVE PROGRESS ─────────────────── */}
        <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#09314F] via-[#0b3d63] to-[#124d7b] text-white shadow-xl overflow-hidden">
          
          {/* Subtle decorative glow rays */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Highlights */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[11px] font-black uppercase tracking-wider border border-white/10">
                <Trophy className="w-3.5 h-3.5" />
                <span>Student Hall of Trophies</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Achievements & Badges
              </h1>

              <p className="text-sm text-gray-200 leading-relaxed max-w-xl font-medium">
                Earn 3D medals, badges, and honors by mastering past questions, maintaining daily study streaks, and acing practice exams.
              </p>

              {/* Progress bar */}
              <div className="pt-2 space-y-2 max-w-md">
                <div className="flex justify-between text-xs font-bold text-gray-200">
                  <span>Catalogue Completion</span>
                  <span className="text-amber-300">{earnedAchievements} / {totalAchievements} Unlocked ({completionPercentage}%)</span>
                </div>
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 shadow-md"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Telemetry Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              
              {/* Daily Streak Card */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <Flame className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">Daily Streak</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {streakData?.ongoing_streak || progressData?.streak?.ongoing || 0} <span className="text-xs font-bold text-gray-300">Days</span>
                </div>
                <p className="text-[10px] text-gray-300 mt-1 font-medium truncate">
                  Max record: {streakData?.max_streak || progressData?.streak?.max || 0} days
                </p>
              </div>

              {/* Questions Mastered Card */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-cyan-400 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">Practice</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {progressData?.practice?.eligible_exam_answers || 0}
                </div>
                <p className="text-[10px] text-gray-300 mt-1 font-medium truncate">
                  Questions Answered
                </p>
              </div>

              {/* Active Practice Time */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">Active Study</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {progressData?.time_investment?.active_hours || 0} <span className="text-xs font-bold text-gray-300">Hours</span>
                </div>
                <p className="text-[10px] text-gray-300 mt-1 font-medium truncate">
                  Focused CBT Time
                </p>
              </div>

              {/* Medals Earned Card */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-300 mb-2">
                  <Trophy className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">Unlocked</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {earnedAchievements}
                </div>
                <p className="text-[10px] text-gray-300 mt-1 font-medium truncate">
                  Awards Collected
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* ── FILTER & CATEGORY NAVIGATION ────────────────────────────── */}
        <div className="space-y-4">
          
          {/* Top Bar: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#09314F]/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search achievement or milestone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A97A]"
              />
            </div>

            {/* Earned vs Locked Filter */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-full sm:w-auto justify-center">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === "all" ? "bg-white dark:bg-[#09314F] text-[#09314F] dark:text-white shadow-sm" : "text-gray-500"
                }`}
              >
                All ({totalAchievements})
              </button>
              <button
                onClick={() => setFilterStatus("earned")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === "earned" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500"
                }`}
              >
                <Unlock className="w-3 h-3" />
                <span>Earned ({earnedAchievements})</span>
              </button>
              <button
                onClick={() => setFilterStatus("locked")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === "locked" ? "bg-gray-800 text-white shadow-sm" : "text-gray-500"
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Locked ({totalAchievements - earnedAchievements})</span>
              </button>
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "all", label: "All Categories" },
              { id: "onboarding", label: "Onboarding" },
              { id: "practice", label: "Practice Milestones" },
              { id: "learning_streak", label: "Streaks" },
              { id: "exam_performance", label: "Exam Scores" },
              { id: "weekly_accuracy", label: "Weekly Accuracy" },
              { id: "time_investment", label: "Time Investment" },
              { id: "speed", label: "Speed & Fluency" },
              { id: "improvement", label: "Improvement" },
              { id: "rank", label: "Academic Rank" },
              { id: "special_event", label: "Events & Prep" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeCategory === tab.id
                    ? "bg-[#09314F] dark:bg-amber-500 text-white dark:text-[#09314F] shadow-md"
                    : "bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* ── ACHIEVEMENTS DIRECTORY GRID ──────────────────────────────── */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm font-bold">Fetching your trophies & badges...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 max-w-md mx-auto">
            <Trophy className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-lg font-black text-gray-800 dark:text-white">No Achievements Found</h3>
            <p className="text-xs text-gray-400">
              {filterStatus === "earned" 
                ? "You haven't unlocked achievements in this category yet. Keep practicing to earn your first medal!"
                : "No achievement matches your current search or category filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredList.map((item) => {
              const condition = getAchievementCondition(item);
              const isEarned = Boolean(item.earned);
              const awards = item.awards || [];
              const earnedCount = Number(item.earned_count ?? awards.length ?? 1);
              const latestAward = awards[0];

              return (
                <div
                  key={item.id || item.code}
                  onClick={() => setInspectingItem(item)}
                  className={`relative bg-white dark:bg-gray-800/60 rounded-3xl p-6 border transition-all flex flex-col justify-between cursor-pointer group ${
                    isEarned
                      ? "border-amber-400/30 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 dark:border-amber-500/20"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-300 opacity-70 hover:opacity-95"
                  }`}
                >
                  {/* Multiplier badge on top right of the card if unlocked more than once */}
                  {isEarned && earnedCount > 1 && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-black tracking-tight shadow-sm">
                        x{earnedCount}
                      </span>
                    </div>
                  )}

                  {/* Badge Display */}
                  <div className="py-4 flex justify-center">
                    <AchievementVisualRenderer
                      achievement={item}
                      size={135}
                      earned={isEarned}
                    />
                  </div>

                  {/* Info Section */}
                  <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#09314F] dark:text-amber-400">
                          {item.category?.replace('_', ' ')}
                        </span>
                        {item.tier && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-500 border border-amber-400/20">
                            {item.tier}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    {/* Condition Snippet */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-left">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                        {isEarned ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span>{isEarned ? "Requirement Met:" : "Unlock Requirement:"}</span>
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold leading-tight line-clamp-2">
                        {condition}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      {isEarned ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {earnedCount > 1 
                              ? `Unlocked (x${earnedCount})` 
                              : `Unlocked ${latestAward?.awarded_at ? new Date(latestAward.awarded_at).toLocaleDateString() : ''}`}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </span>
                      )}

                      <span className="text-xs font-bold text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0">
                        Inspect →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── INSPECT MODAL ───────────────────────────────────────────── */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0e1726] rounded-3xl p-8 border border-gray-100 dark:border-white/15 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setInspectingItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 3D Medal Showcase with Full Live Animations */}
            <div className="py-2 flex justify-center">
              <AchievementVisualRenderer
                achievement={inspectingItem}
                size={170}
                earned={Boolean(inspectingItem.earned)}
                earnedCount={Number(inspectingItem.earned_count ?? inspectingItem.awards?.length ?? 1)}
                animated={true}
              />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                  {inspectingItem.category?.replace('_', ' ')}
                </span>
                {inspectingItem.tier && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/30">
                    {inspectingItem.tier} Tier
                  </span>
                )}
                {inspectingItem.earned && (inspectingItem.earned_count > 1 || (inspectingItem.awards?.length || 0) > 1) && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/30">
                    Unlocked x{inspectingItem.earned_count || inspectingItem.awards?.length}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {inspectingItem.name}
              </h2>
            </div>

            {/* Requirement Condition */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-left space-y-1.5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                {inspectingItem.earned ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                )}
                <span>{inspectingItem.earned ? "Requirement Fulfilled:" : "How to Unlock:"}</span>
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-200 font-semibold leading-relaxed">
                {getAchievementCondition(inspectingItem)}
              </p>
            </div>

            {/* Awards History (if earned multiple times) */}
            {inspectingItem.earned && inspectingItem.awards && inspectingItem.awards.length > 1 && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-left space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Unlock History (*{inspectingItem.awards.length})
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {inspectingItem.awards.map((award, index) => (
                    <div key={award.id || index} className="flex items-center justify-between text-[11px] bg-white dark:bg-white/5 p-2 rounded-xl border border-gray-100 dark:border-white/5">
                      <span className="font-bold text-gray-700 dark:text-gray-200">
                        Award #{inspectingItem.awards.length - index} {award.subject?.name ? `(${award.subject.name})` : ''}
                      </span>
                      <span className="text-gray-400 font-medium">
                        {award.awarded_at ? new Date(award.awarded_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Trigger / Share Action */}
            <div className="flex items-center gap-3 pt-2">
              {inspectingItem.earned ? (
                <button
                  onClick={() => {
                    setInspectingItem(null);
                    triggerCelebration(inspectingItem);
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Replay Celebration</span>
                </button>
              ) : (
                <button
                  onClick={() => setInspectingItem(null)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
