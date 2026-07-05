import { Icon } from "@iconify/react";

const ACHIEVEMENTS = [
  {
    id: 1,
    icon: "noto:fire",
    label: "7-Day Streak",
    desc: "Logged in 7 days in a row",
    color: "#F97316",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    unlocked: true,
  },
  {
    id: 2,
    icon: "noto:trophy",
    label: "Top Scorer",
    desc: "Scored above 80% in a practice exam",
    color: "#EAB308",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    unlocked: true,
  },
  {
    id: 3,
    icon: "noto:graduation-cap",
    label: "First Exam",
    desc: "Completed your first practice exam",
    color: "#8B5CF6",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    unlocked: true,
  },
  {
    id: 4,
    icon: "noto:star",
    label: "Perfect Score",
    desc: "Score 100% on any exam attempt",
    color: "#bb9e7f",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    unlocked: false,
  },
  {
    id: 5,
    icon: "noto:books",
    label: "Scholar",
    desc: "Complete all subjects in a course",
    color: "#3B82F6",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    unlocked: false,
  },
  {
    id: 6,
    icon: "noto:alarm-clock",
    label: "Early Bird",
    desc: "Study before 7am for 3 days",
    color: "#10B981",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    unlocked: false,
  },
];

export default function AchievementsPanel() {
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm h-full flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
            Achievements
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {unlocked} / {ACHIEVEMENTS.length} unlocked
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <Icon icon="noto:trophy" className="w-5 h-5" />
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(unlocked / ACHIEVEMENTS.length) * 100}%`,
              background: "linear-gradient(90deg, #09314F, #bb9e7f)",
            }}
          />
        </div>
      </div>

      {/* ── Achievement badges ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 flex-1">
        {ACHIEVEMENTS.map((a) => (
          <div
            key={a.id}
            title={`${a.label} — ${a.desc}`}
            className={`relative flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 cursor-default
              ${a.unlocked
                ? `${a.bg} border-transparent shadow-sm hover:scale-105`
                : "bg-gray-50 dark:bg-gray-700/30 border-dashed border-gray-200 dark:border-gray-600/50 opacity-50"
              }`}
          >
            {/* Lock overlay for locked ones */}
            {!a.unlocked && (
              <div className="absolute top-1 right-1">
                <Icon icon="lucide:lock" className="w-2.5 h-2.5 text-gray-400" />
              </div>
            )}
            <Icon
              icon={a.icon}
              className="w-7 h-7"
              style={a.unlocked ? {} : { filter: "grayscale(1)" }}
            />
            <span
              className="text-[10px] font-black text-center leading-tight"
              style={{ color: a.unlocked ? a.color : "#9CA3AF" }}
            >
              {a.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
