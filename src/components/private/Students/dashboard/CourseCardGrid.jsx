import { useState } from "react";
import { Icon } from "@iconify/react";

// ── Individual Course Card ────────────────────────────────────────────────────
function CourseCard({ course }) {
  const [open, setOpen] = useState(false);

  const subjects = course.subjects || [];
  const avgProgress =
    subjects.length > 0
      ? Math.round(subjects.reduce((s, sub) => s + (sub.progress || 0), 0) / subjects.length)
      : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Days remaining until expiry
  const daysLeft = (() => {
    if (!course.end_date) return null;
    const diff = new Date(course.end_date) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  return (
    <div className="bg-white dark:bg-[#09314F]/40 rounded-2xl border border-gray-100 dark:border-[#09314F]/50 shadow-[0_6px_24px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300">

      {/* ── Card Header ─────────────────────────────────────────────────── */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#09314F]/10 dark:bg-[#09314F]/60 flex items-center justify-center flex-shrink-0">
              <Icon icon="game-icons:graduation-cap" className="w-5 h-5 text-[#09314F] dark:text-blue-300" />
            </div>
            <h3 className="text-[13px] font-black text-[#09314F] dark:text-white uppercase tracking-tight leading-tight">
              {course.course?.title || "Course"}
            </h3>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Icon
              icon="lucide:chevron-down"
              className={`w-4 h-4 text-[#09314F] dark:text-white transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* ── Chip row: Enrolled + Clock ─────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-[#09314F] dark:text-blue-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <Icon icon="lucide:book-open" className="w-3 h-3" />
            {subjects.length} Subject{subjects.length !== 1 ? "s" : ""} Enrolled
          </span>
          {daysLeft !== null && (
            <span
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                daysLeft <= 7
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
              }`}
            >
              <Icon icon="lucide:clock" className="w-3 h-3" />
              {daysLeft}d left
            </span>
          )}
        </div>

        {/* ── Progress bar ──────────────────────────────────────────────── */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
            <span className="text-[10px] font-black text-[#09314F] dark:text-white">{avgProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${avgProgress}%`,
                background: "linear-gradient(90deg, #09314F, #E83831)",
              }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-gray-400 font-bold">Start</span>
            <span className="text-[9px] text-gray-400 font-bold">Finish · {formatDate(course.end_date)}</span>
          </div>
        </div>
      </div>

      {/* ── Expanded: Subjects in ROW (flex-wrap pills) ──────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-100 dark:border-white/10 px-5 py-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Subjects</p>
          <div className="flex flex-wrap gap-2">
            {subjects.length === 0 && (
              <span className="text-xs text-gray-400">No subjects yet.</span>
            )}
            {subjects.map((sub, idx) => (
              <div
                key={sub.id || idx}
                className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#09314F] dark:bg-blue-400 flex-shrink-0" />
                <span className="text-[11px] font-bold text-[#09314F] dark:text-gray-200 whitespace-nowrap">
                  {sub.name}
                </span>
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#09314F] to-[#E83831] rounded-full transition-all duration-500"
                    style={{ width: `${sub.progress || 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">
                  {Math.round(sub.progress || 0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Grid wrapper ──────────────────────────────────────────────────────────────
export default function CourseCardGrid({ courses = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#09314F]/20 rounded-2xl border border-dashed border-gray-200 dark:border-[#09314F]/40">
        <Icon icon="lucide:book-x" className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-bold text-gray-400 dark:text-gray-500">No courses enrolled</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${courses.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
      {courses.slice(0, 4).map((course, index) => (
        <CourseCard key={course.enrollment_id || index} course={course} />
      ))}
    </div>
  );
}
