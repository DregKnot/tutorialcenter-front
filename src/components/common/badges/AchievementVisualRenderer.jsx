import React from 'react';
import { 
  UserPlus, UserCheck, BookOpen, Play, Target, Award, Flame,
  Clock, Zap, TrendingUp, Crown, Trophy, Sparkles,
  Lock, Compass, GraduationCap, CheckSquare
} from 'lucide-react';
import TCMedal from './TCMedal';
import BaseBadge3D from './BaseBadge3D';
import FirstStepBadge from './onboardingmedals/FirstStepBadge';
import WelcomeAboardBadge from './onboardingmedals/WelcomeAboardBadge';
import ProfileCompleteBadge from './onboardingmedals/ProfileCompleteBadge';
import ReadyToLearnBadge from './onboardingmedals/ReadyToLearnBadge';
import FirstAnswerBadge from './onboardingmedals/FirstAnswerBadge';
import PracticeStarterBadge from './onboardingmedals/PracticeStarterBadge';
import FirstAchievementBadge from './onboardingmedals/FirstAchievementBadge';
import LearningBeginsBadge from './streakmedals/LearningBeginsBadge';
import {
  ConsistentLearnerBadge,
  StudyHabitBuilderBadge,
  WeeklyWarriorBadge,
  MonthlyAchieverBadge,
  LearningMachineStreakBadge,
  AcademicMarathonerBadge,
  StudyLegendBadge,
  YearOfExcellenceBadge
} from './streakmedals';
import {
  QuestionExplorerMedal,
  QuestionChallengerMedal,
  KnowledgeHunterMedal,
  StudyWarriorMedal,
  AcademicHeroMedal,
  PracticeChampionMedal,
  LearningMachineMedal,
  MasterScholarMedal,
  EducationLegendMedal
} from './practicemedals';

/**
 * Achievement Category Metadata & Config
 */
export const CATEGORY_CONFIG = {
  onboarding: {
    label: "Onboarding",
    color: "primaryBlue",
    badgeShape: "shield",
    icon: Compass,
  },
  practice: {
    label: "Practice Milestones",
    color: "blue",
    badgeShape: "shield",
    icon: Target,
  },
  learning_streak: {
    label: "Learning Streaks",
    color: "primaryRed",
    badgeShape: "star",
    icon: Flame,
  },
  streak: {
    label: "Learning Streaks",
    color: "primaryRed",
    badgeShape: "star",
    icon: Flame,
  },
  exam_performance: {
    label: "Exam Performance",
    color: "yellow",
    badgeShape: "hexagon",
    icon: Trophy,
  },
  weekly_accuracy: {
    label: "Weekly Accuracy",
    color: "green",
    badgeShape: "hexagon",
    icon: Target,
  },
  time_investment: {
    label: "Time Investment",
    color: "blue",
    badgeShape: "hexagon",
    icon: Clock,
  },
  speed: {
    label: "Speed & Fluency",
    color: "yellow",
    badgeShape: "star",
    icon: Zap,
  },
  improvement: {
    label: "Improvement",
    color: "green",
    badgeShape: "shield",
    icon: TrendingUp,
  },
  rank: {
    label: "Academic Rank",
    color: "primaryBlue",
    badgeShape: "star",
    icon: Crown,
  },
  special_event: {
    label: "Special Events",
    color: "primaryRed",
    badgeShape: "star",
    icon: Sparkles,
  },
  exam_preparation: {
    label: "Exam Readiness",
    color: "primaryBlue",
    badgeShape: "shield",
    icon: GraduationCap,
  },
};

/**
 * Maps achievement code to specific icon component
 */
export const getAchievementIcon = (code = "", category = "") => {
  const c = code.toLowerCase();
  
  if (c.includes("welcome")) return UserPlus;
  if (c.includes("profile_complete")) return UserCheck;
  if (c.includes("ready_to_learn")) return BookOpen;
  if (c.includes("first_step")) return Play;
  if (c.includes("first_answer")) return CheckSquare;
  if (c.includes("practice_starter")) return Target;
  if (c.includes("first_achievement")) return Award;
  
  if (c.includes("streak") || category.includes("streak")) return Flame;
  if (c.includes("time") || category.includes("time")) return Clock;
  if (c.includes("speed") || category.includes("speed")) return Zap;
  if (c.includes("improvement") || category.includes("improvement")) return TrendingUp;
  if (c.includes("rank") || category.includes("rank")) return Crown;
  if (c.includes("leaderboard")) return Trophy;
  if (c.includes("special_event")) return Sparkles;
  if (c.includes("ready") || category.includes("exam_prep")) return GraduationCap;
  
  return CATEGORY_CONFIG[category]?.icon || Award;
};

/**
 * Human-readable Condition / Requirement extractor
 */
export const getAchievementCondition = (achievement) => {
  if (!achievement) return "Complete the required milestone.";
  
  const code = (achievement.code || "").toLowerCase();
  const desc = achievement.description;
  const reqs = achievement.requirements || {};

  if (reqs.min_score) return `Score at least ${reqs.min_score}% on any practice exam`;
  if (reqs.threshold) return `Reach ${reqs.threshold} eligible practice answers`;
  if (reqs.streak_days) return `Maintain a continuous ${reqs.streak_days}-day daily practice streak`;
  if (reqs.active_seconds) return `Accumulate ${Math.round(reqs.active_seconds / 3600)} hours of active CBT practice`;
  if (reqs.accuracy_percentage) return `Achieve ${reqs.accuracy_percentage}% accuracy across weekly practice`;

  // Fallback map based on standard catalog codes
  if (code === "onboarding.welcome_aboard") return "Register your student account";
  if (code === "onboarding.profile_complete") return "Verify your email and complete your student profile";
  if (code === "onboarding.ready_to_learn") return "Enroll in your first subject or course";
  if (code === "onboarding.first_step") return "Start your first exam practice session";
  if (code === "onboarding.first_answer") return "Submit your first practice question answer";
  if (code === "onboarding.practice_starter") return "Complete and submit your first full practice exam";
  if (code === "onboarding.first_achievement") return "Unlock your first platform achievement";

  if (code === "practice.question_explorer") return "Answer 50 practice questions";
  if (code === "practice.question_challenger") return "Answer 100 practice questions";
  if (code === "practice.knowledge_hunter") return "Answer 250 practice questions";
  if (code === "practice.study_warrior") return "Answer 500 practice questions";
  if (code === "practice.academic_hero") return "Answer 1,000 practice questions";
  if (code === "practice.practice_champion") return "Answer 2,500 practice questions";
  if (code === "practice.learning_machine") return "Answer 5,000 practice questions";
  if (code === "practice.master_scholar") return "Answer 10,000 practice questions";
  if (code === "practice.education_legend") return "Answer 25,000 practice questions";

  if (code === "exam_performance.bronze") return "Score 60% or higher on a practice exam";
  if (code === "exam_performance.silver") return "Score 70% or higher on a practice exam";
  if (code === "exam_performance.gold") return "Score 80% or higher on a practice exam";
  if (code === "exam_performance.platinum") return "Score 90% or higher on a practice exam";
  if (code === "exam_performance.diamond") return "Score 95% or higher on a practice exam";

  if (code === "weekly_accuracy.bronze") return "Achieve 60% accuracy in weekly practice";
  if (code === "weekly_accuracy.silver") return "Achieve 70% accuracy in weekly practice";
  if (code === "weekly_accuracy.gold") return "Achieve 80% accuracy in weekly practice";
  if (code === "weekly_accuracy.platinum") return "Achieve 90% accuracy in weekly practice";
  if (code === "weekly_accuracy.diamond") return "Achieve 95% accuracy in weekly practice";
  if (code === "weekly_accuracy.perfect_genius") return "Achieve 100% accuracy in weekly practice";

  if (code === "time_investment.one_hour_learner") return "Spend 1 hour actively practicing questions";
  if (code === "time_investment.ten_hours_scholar") return "Spend 10 hours actively practicing questions";
  if (code === "time_investment.twenty_five_hours_learner") return "Spend 25 hours actively practicing questions";
  if (code === "time_investment.fifty_hours_scholar") return "Spend 50 hours actively practicing questions";
  if (code === "time_investment.one_hundred_hour_academic_hero") return "Spend 100 hours actively practicing questions";
  if (code === "time_investment.two_hundred_fifty_hours_study_master") return "Spend 250 hours actively practicing questions";
  if (code === "time_investment.five_hundred_hours_education_legend") return "Spend 500 hours actively practicing questions";

  if (code.includes("jamb_ready")) return "Enroll and complete JAMB prep package payment";
  if (code.includes("waec_ready")) return "Enroll and complete WAEC prep package payment";
  if (code.includes("neco_ready")) return "Enroll and complete NECO prep package payment";
  if (code.includes("gce_ready")) return "Enroll and complete GCE prep package payment";

  return desc || "Complete the academic milestone to unlock.";
};

/**
 * Master Achievement Visual Component
 * 
 * Renders Medals, Badges, or Awards dynamically with locked/earned states.
 */
export default function AchievementVisualRenderer({
  achievement,
  size = 140,
  earned = true,
  showLabel = false,
  animated = false,
  onClick = null,
  className = "",
}) {
  if (!achievement) return null;

  const category = (achievement.category || "onboarding").toLowerCase();
  const type = (achievement.type || "badge").toLowerCase();
  const tier = (achievement.tier || "").toLowerCase();
  const code = achievement.code || "";
  const name = achievement.name || "Achievement";
  const condition = getAchievementCondition(achievement);
  const IconComponent = getAchievementIcon(code, category);

  // Determine renderer style:
  // 1. Medals (exam_performance, weekly_accuracy, speed, medals)
  const isMedal = type === "medal" || category === "exam_performance" || category === "weekly_accuracy";

  // Tier mapping for medals
  const medalTier = ["bronze", "silver", "gold", "platinum", "diamond"].includes(tier) ? tier : "gold";
  const gemColor = tier === "diamond" ? "diamond" : tier === "platinum" ? "cyan" : tier === "gold" ? "ruby" : tier === "silver" ? "sapphire" : "emerald";

  // Category shape & color for 3D Badges
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.onboarding;

  return (
    <div 
      onClick={onClick}
      title={`${name} — ${condition}`}
      className={`group relative flex flex-col items-center justify-center transition-transform duration-300 ${
        onClick ? "cursor-pointer hover:scale-105 active:scale-95" : ""
      } ${className}`}
      style={{ width: size }}
    >
      {/* ── UNLOCKED / EARNED RENDERING ── */}
      {earned ? (
        <div className="relative flex items-center justify-center">
          {code === "practice.education_legend" ? (
            <EducationLegendMedal size={size} earned={true} count="25,000" animated={animated} />
          ) : code === "practice.master_scholar" ? (
            <MasterScholarMedal size={size} earned={true} count="10,000" animated={animated} />
          ) : code === "practice.learning_machine" ? (
            <LearningMachineMedal size={size} earned={true} count="5,000" animated={animated} />
          ) : code === "practice.practice_champion" ? (
            <PracticeChampionMedal size={size} earned={true} count="2,500" animated={animated} />
          ) : code === "practice.academic_hero" ? (
            <AcademicHeroMedal size={size} earned={true} count="1,000" animated={animated} />
          ) : code === "practice.study_warrior" ? (
            <StudyWarriorMedal size={size} earned={true} count={500} animated={animated} />
          ) : code === "practice.knowledge_hunter" ? (
            <KnowledgeHunterMedal size={size} earned={true} count={250} animated={animated} />
          ) : code === "practice.question_challenger" ? (
            <QuestionChallengerMedal size={size} earned={true} count={100} animated={animated} />
          ) : code === "practice.question_explorer" ? (
            <QuestionExplorerMedal size={size} earned={true} count={50} animated={animated} />
          ) : (code === "streak.year_of_excellence" || code === "streak.365_day_excellence" || code === "year_of_excellence") ? (
            <YearOfExcellenceBadge size={size} earned={true} count={365} animated={animated} />
          ) : (code === "streak.study_legend" || code === "streak.180_day_legend" || code === "study_legend") ? (
            <StudyLegendBadge size={size} earned={true} count={180} animated={animated} />
          ) : (code === "streak.academic_marathoner" || code === "streak.100_day_marathon" || code === "academic_marathoner") ? (
            <AcademicMarathonerBadge size={size} earned={true} count={100} animated={animated} />
          ) : (code === "streak.learning_machine" || code === "streak.60_day_machine" || code === "streak_learning_machine") ? (
            <LearningMachineStreakBadge size={size} earned={true} count={60} animated={animated} />
          ) : (code === "streak.monthly_achiever" || code === "streak.30_day_blaze" || code === "monthly_achiever") ? (
            <MonthlyAchieverBadge size={size} earned={true} count={30} animated={animated} />
          ) : (code === "streak.weekly_warrior" || code === "streak.14_day_warrior" || code === "weekly_warrior") ? (
            <WeeklyWarriorBadge size={size} earned={true} count={14} animated={animated} />
          ) : (code === "streak.study_habit_builder" || code === "streak.7_day_blaze" || code === "study_habit_builder") ? (
            <StudyHabitBuilderBadge size={size} earned={true} count={7} animated={animated} />
          ) : (code === "streak.consistent_learner" || code === "streak.3_day_flame" || code === "consistent_learner") ? (
            <ConsistentLearnerBadge size={size} earned={true} count={3} animated={animated} />
          ) : (code === "onboarding.learning_begins" || code === "learning_begins") ? (
            <LearningBeginsBadge size={size} earned={true} />
          ) : code === "onboarding.first_achievement" ? (
            <FirstAchievementBadge size={size} earned={true} />
          ) : code === "onboarding.practice_starter" ? (
            <PracticeStarterBadge size={size} earned={true} />
          ) : code === "onboarding.first_answer" ? (
            <FirstAnswerBadge size={size} earned={true} />
          ) : code === "onboarding.ready_to_learn" ? (
            <ReadyToLearnBadge size={size} earned={true} />
          ) : code === "onboarding.profile_complete" ? (
            <ProfileCompleteBadge size={size} earned={true} />
          ) : code === "onboarding.welcome_aboard" ? (
            <WelcomeAboardBadge size={size} earned={true} />
          ) : code === "onboarding.first_step" ? (
            <FirstStepBadge size={size} earned={true} />
          ) : isMedal ? (
            <TCMedal 
              tier={medalTier} 
              gemColor={gemColor} 
              Icon={IconComponent} 
              size={size} 
              glow={true}
            />
          ) : (
            <BaseBadge3D 
              shape={config.badgeShape} 
              color={config.color} 
              Icon={IconComponent} 
              size={size} 
            />
          )}

          {/* Sparkle overlay badge for diamond/platinum */}
          {(tier === "diamond" || tier === "platinum") && (
            <div className="absolute top-1 right-1 pointer-events-none animate-pulse">
              <Sparkles className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
          )}
        </div>
      ) : (
        /* ── LOCKED / FROSTED GLASS RENDERING ── */
        <div 
          className="relative flex items-center justify-center filter grayscale contrast-75 opacity-40 hover:opacity-75 transition-all duration-300"
          style={{ width: size, height: size }}
        >
          {code === "practice.education_legend" ? (
            <EducationLegendMedal size={size} earned={false} count="25,000" />
          ) : code === "practice.master_scholar" ? (
            <MasterScholarMedal size={size} earned={false} count="10,000" />
          ) : code === "practice.learning_machine" ? (
            <LearningMachineMedal size={size} earned={false} count="5,000" />
          ) : code === "practice.practice_champion" ? (
            <PracticeChampionMedal size={size} earned={false} count="2,500" />
          ) : code === "practice.academic_hero" ? (
            <AcademicHeroMedal size={size} earned={false} count="1,000" />
          ) : code === "practice.study_warrior" ? (
            <StudyWarriorMedal size={size} earned={false} count={500} />
          ) : code === "practice.knowledge_hunter" ? (
            <KnowledgeHunterMedal size={size} earned={false} count={250} />
          ) : code === "practice.question_challenger" ? (
            <QuestionChallengerMedal size={size} earned={false} count={100} />
          ) : code === "practice.question_explorer" ? (
            <QuestionExplorerMedal size={size} earned={false} count={50} />
          ) : (code === "streak.year_of_excellence" || code === "streak.365_day_excellence" || code === "year_of_excellence") ? (
            <YearOfExcellenceBadge size={size} earned={false} count={365} />
          ) : (code === "streak.study_legend" || code === "streak.180_day_legend" || code === "study_legend") ? (
            <StudyLegendBadge size={size} earned={false} count={180} />
          ) : (code === "streak.academic_marathoner" || code === "streak.100_day_marathon" || code === "academic_marathoner") ? (
            <AcademicMarathonerBadge size={size} earned={false} count={100} />
          ) : (code === "streak.learning_machine" || code === "streak.60_day_machine" || code === "streak_learning_machine") ? (
            <LearningMachineStreakBadge size={size} earned={false} count={60} />
          ) : (code === "streak.monthly_achiever" || code === "streak.30_day_blaze" || code === "monthly_achiever") ? (
            <MonthlyAchieverBadge size={size} earned={false} count={30} />
          ) : (code === "streak.weekly_warrior" || code === "streak.14_day_warrior" || code === "weekly_warrior") ? (
            <WeeklyWarriorBadge size={size} earned={false} count={14} />
          ) : (code === "streak.study_habit_builder" || code === "streak.7_day_blaze" || code === "study_habit_builder") ? (
            <StudyHabitBuilderBadge size={size} earned={false} count={7} />
          ) : (code === "streak.consistent_learner" || code === "streak.3_day_flame" || code === "consistent_learner") ? (
            <ConsistentLearnerBadge size={size} earned={false} count={3} />
          ) : (code === "onboarding.learning_begins" || code === "learning_begins") ? (
            <LearningBeginsBadge size={size} earned={false} />
          ) : code === "onboarding.first_achievement" ? (
            <FirstAchievementBadge size={size} earned={false} />
          ) : code === "onboarding.practice_starter" ? (
            <PracticeStarterBadge size={size} earned={false} />
          ) : code === "onboarding.first_answer" ? (
            <FirstAnswerBadge size={size} earned={false} />
          ) : code === "onboarding.ready_to_learn" ? (
            <ReadyToLearnBadge size={size} earned={false} />
          ) : code === "onboarding.profile_complete" ? (
            <ProfileCompleteBadge size={size} earned={false} />
          ) : code === "onboarding.welcome_aboard" ? (
            <WelcomeAboardBadge size={size} earned={false} />
          ) : code === "onboarding.first_step" ? (
            <FirstStepBadge size={size} earned={false} />
          ) : isMedal ? (
            <TCMedal 
              tier={medalTier} 
              gemColor="darkBlue" 
              Icon={IconComponent} 
              size={size} 
              glow={false}
            />
          ) : (
            <BaseBadge3D 
              shape={config.badgeShape} 
              color="primaryBlue" 
              Icon={IconComponent} 
              size={size} 
            />
          )}

          {/* Central Frosted Lock Overlay */}
          <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl z-20">
            <Lock className="w-5 h-5 text-gray-300" />
          </div>
        </div>
      )}

      {/* Optional Below Label */}
      {showLabel && (
        <div className="text-center mt-2 space-y-0.5 max-w-full">
          <p className={`text-xs font-bold truncate ${earned ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
            {name}
          </p>
          <p className="text-[10px] text-gray-400 font-medium truncate">
            {config.label}
          </p>
        </div>
      )}
    </div>
  );
}
