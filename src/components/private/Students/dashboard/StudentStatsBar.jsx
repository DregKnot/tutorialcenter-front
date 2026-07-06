import { useAuth } from "../../../../context/AuthContext";

// ── Mock data (swap with real API when available) ────────────────────────────
const MOCK_ATTENDANCE = [
  { day: "Mon", present: true },
  { day: "Tue", present: true },
  { day: "Wed", present: true },
  { day: "Thu", present: false },
  { day: "Fri", present: true },
  { day: "Sat", present: false },
  { day: "Sun", present: false },
];
const MOCK_AVG_SCORE = 72.5;
const MOCK_STREAK = 5;
const MAX_STREAK = 30;

// ── Circular progress ring ────────────────────────────────────────────────────
function RingProgress({ value, max, color = "#E83831", size = 60, stroke = 5 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(value / max, 1));
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

// ── 7-bar Attendance mini-chart ───────────────────────────────────────────────
function AttendanceBars({ data }) {
  return (
    <div className="flex items-end gap-[5px]">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={`w-[7px] rounded-full transition-all duration-500 ${
              d.present
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                : "bg-white/15"
            }`}
            style={{ height: d.present ? "32px" : "16px" }}
          />
          <span className="text-[9px] font-bold text-white/35">{d.day[0]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Vertical divider ─────────────────────────────────────────────────────────
function Divider() {
  return <div className="hidden md:block w-px self-stretch bg-white/10 mx-2" />;
}

// ── Stat cell ────────────────────────────────────────────────────────────────
function StatCell({ label, children }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.12em]">{label}</span>
    </div>
  );
}

// ── Main Stats Bar ────────────────────────────────────────────────────────────
export default function StudentStatsBar({
  avgScore = MOCK_AVG_SCORE,
  attendance = MOCK_ATTENDANCE,
  streak = MOCK_STREAK,
}) {
  const { student } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const firstName = student?.firstname || "Student";
  const lastName = student?.surname || "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-xl"
      style={{ background: "linear-gradient(135deg, #0c2238 0%, #1a3a5c 55%, #241530 100%)" }}
    >
      <div className="flex flex-wrap items-center gap-6 md:gap-10 px-6 py-5 md:px-10 md:py-6">

        {/* ── Avatar + Name ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="relative w-[60px] h-[60px] flex-shrink-0">
            <RingProgress value={streak} max={MAX_STREAK} color="#bb9e7f" size={60} stroke={4} />
            <div className="absolute inset-[6px] rounded-full bg-[#09314F]/80 flex items-center justify-center text-white font-black text-base shadow-inner backdrop-blur-sm overflow-hidden">
              {student?.profile_picture ? (
                <img src={`${API_BASE_URL}/storage/${student.profile_picture}`} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-white font-black text-base leading-tight">
              {firstName} {lastName}
            </p>
            <p className="text-white/45 text-[12px] font-semibold mt-0.5">Student</p>
          </div>
        </div>

        <Divider />

        {/* ── Average Score ─────────────────────────────────────────────── */}
        <StatCell label="Avg Score">
          <span
            className="text-[38px] font-black leading-none"
            style={{ color: "#E83831", textShadow: "0 0 24px rgba(232,56,49,0.45)" }}
          >
            {avgScore}
          </span>
        </StatCell>

        <Divider />

        {/* ── Attendance ────────────────────────────────────────────────── */}
        <StatCell label="Attendance">
          <AttendanceBars data={attendance} />
        </StatCell>

        <Divider />

        {/* ── Streaks ───────────────────────────────────────────────────── */}
        <StatCell label="Streaks">
          <div className="relative w-[54px] h-[54px]">
            <RingProgress value={streak} max={MAX_STREAK} color="#bb9e7f" size={54} stroke={4} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-white">{streak}</span>
            </div>
          </div>
        </StatCell>

        {/* ── Spacer ────────────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── This week badge ───────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-3 bg-white/6 rounded-2xl px-5 py-3 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
          <div>
            <p className="text-white font-black text-base leading-tight">
              {attendance.filter((d) => d.present).length} / {attendance.length}
            </p>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">This Week</p>
          </div>
        </div>

      </div>
    </div>
  );
}
