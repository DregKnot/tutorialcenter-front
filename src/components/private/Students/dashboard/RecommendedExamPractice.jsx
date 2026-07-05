import { Icon } from "@iconify/react";

const EXAMS = [
  {
    id: 1,
    subject: "Biology",
    level: "Intermediate",
    modules: 12,
    topics: "Cells · Genetics · Ecology",
    icon: "noto:dna",
    gradient: "from-emerald-400/20 to-emerald-600/10",
    accent: "#10B981",
    borderColor: "border-emerald-200/60 dark:border-emerald-800/40",
  },
  {
    id: 2,
    subject: "Physics",
    level: "Advanced",
    modules: 15,
    topics: "Mechanics · Waves · Electricity",
    icon: "noto:atom-symbol",
    gradient: "from-blue-400/20 to-blue-600/10",
    accent: "#3B82F6",
    borderColor: "border-blue-200/60 dark:border-blue-800/40",
  },
  {
    id: 3,
    subject: "Further Maths",
    level: "Advanced",
    modules: 18,
    topics: "Calculus · Vectors · Statistics",
    icon: "noto:abacus",
    gradient: "from-violet-400/20 to-violet-600/10",
    accent: "#8B5CF6",
    borderColor: "border-violet-200/60 dark:border-violet-800/40",
  },
];

export default function RecommendedExamPractice() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
            Recommended Exam Practice
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Sharpen your skills with targeted practice</p>
        </div>
        <button className="text-[11px] font-black text-[#09314F] dark:text-blue-300 hover:underline flex items-center gap-1">
          View all <Icon icon="lucide:arrow-right" className="w-3 h-3" />
        </button>
      </div>

      {/* ── Cards row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {EXAMS.map((exam) => (
          <div
            key={exam.id}
            className={`relative overflow-hidden rounded-2xl border ${exam.borderColor} bg-gradient-to-br ${exam.gradient} p-5 flex flex-col gap-4 cursor-pointer group hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md`}
          >
            {/* ── Icon ───────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner"
                style={{ backgroundColor: `${exam.accent}22` }}
              >
                <Icon icon={exam.icon} className="w-6 h-6" />
              </div>
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${exam.accent}20`, color: exam.accent }}
              >
                {exam.level}
              </span>
            </div>

            {/* ── Info ───────────────────────────────────────────────── */}
            <div>
              <h4 className="text-base font-black text-[#09314F] dark:text-white mb-1">
                {exam.subject}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-1">
                {exam.topics}
              </p>
              <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                <Icon icon="lucide:layers" className="w-3 h-3" />
                {exam.modules} Modules
              </p>
            </div>

            {/* ── CTA ────────────────────────────────────────────────── */}
            <button
              className="mt-auto flex items-center gap-1.5 text-[11px] font-black transition-all duration-200 opacity-80 group-hover:opacity-100"
              style={{ color: exam.accent }}
            >
              Start Practice
              <Icon icon="lucide:arrow-right" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
