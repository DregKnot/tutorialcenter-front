import { useState, useEffect, useMemo, useCallback } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const SHORT_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ── Mock avatar colors for participant avatars ────────────────────────────────
const AVATAR_COLORS = ["#E83831","#3B82F6","#10B981","#F59E0B","#8B5CF6","#EC4899"];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimeRange(start, end) {
  if (!start) return "";
  const format = (t) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "pm" : "am";
    const hr = hour % 12 === 0 ? 12 : hour % 12;
    return `${hr}:${m}${suffix}`;
  };
  return `${format(start)}${end ? `-${format(end)}` : ""}`;
}

function isPastSession(session) {
  if (!session || !session.session_date) return false;
  const now = new Date();
  const sDate = new Date(session.session_date);
  const sessionDay = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (sessionDay < today) return true;
  if (sessionDay > today) return false;

  const timeStr = session.ends_at || session.starts_at;
  if (timeStr) {
    const parts = timeStr.split(":");
    const sessionEndTime = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate(), parseInt(parts[0], 10), parseInt(parts[1], 10));
    if (sessionEndTime < now) return true;
  }
  return false;
}

// ── Session detail popup ──────────────────────────────────────────────────────
function SessionModal({ session, onClose }) {
  if (!session) return null;
  const isPast = isPastSession(session);
  const recUrl = session.recording_link || session.recording_url;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-sm p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <span className={`text-xs font-black px-3 py-1 rounded-full ${
            isPast ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          }`}>
            {isPast ? "Ended Class" : "Class Session"}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <Icon icon="lucide:x" className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <h3 className="text-lg font-black text-[#09314F] dark:text-white mb-4 leading-tight">
          {session.class?.title || session.title || "Class"}
        </h3>
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Icon icon="lucide:calendar" className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-semibold">
              {new Date(session.session_date).toLocaleDateString("en-GB", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Icon icon="lucide:clock" className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-semibold">
              {formatTimeRange(session.starts_at, session.ends_at)}
            </span>
          </div>
          {session.subject && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Icon icon="lucide:book-open" className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-semibold">{session.subject}</span>
            </div>
          )}
        </div>

        {isPast ? (
          recUrl ? (
            <a
              href={recUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-black text-sm transition-colors shadow-lg"
            >
              <Icon icon="lucide:play-circle" className="w-5 h-5" />
              Watch Recorded Class
            </a>
          ) : (
            <a
              href="/student/recorded-classes"
              className="flex items-center justify-center gap-2 w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-black text-sm transition-colors shadow-lg"
            >
              <Icon icon="lucide:film" className="w-5 h-5" />
              Recorded Classes
            </a>
          )
        ) : (
          session.class_link && (
            <a
              href={session.class_link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#09314F] hover:bg-[#0a426b] text-white rounded-xl font-black text-sm transition-colors shadow-lg"
            >
              <Icon icon="logos:zoom" className="w-4 h-4" />
              Join Zoom Meeting
            </a>
          )
        )}
      </div>
    </div>
  );
}

// ── Session card (matching image 2 style) ─────────────────────────────────────
function SessionCard({ session, onClick }) {
  const startDate = new Date(session.session_date);
  const isToday = isSameDay(startDate, new Date());
  const isPast = isPastSession(session);
  const recUrl = session.recording_link || session.recording_url;
  const participantCount = session.class?.staffs?.length || session.participants?.length || session.participant_count || 6;
  const visibleAvatars = Math.min(4, participantCount);
  const extra = participantCount > 4 ? participantCount - 4 : 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:bg-gray-700/60 rounded-2xl p-4 transition-all duration-150 group"
    >
      {/* Title + dots */}
      <div className="flex items-start justify-between mb-1">
        <p className="text-[14px] font-black text-gray-900 dark:text-white leading-snug">
          {session.class?.title || session.title || "Class Session"}
        </p>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5">
          <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
        </button>
      </div>

      {/* Date + time */}
      <p className="text-[12px] text-gray-400 font-semibold mb-3">
        {isToday ? "Today" : startDate.toLocaleDateString("en-GB", { weekday: "long" })}
        {" • "}
        {formatTimeRange(session.starts_at, session.ends_at)}
      </p>

      {/* Bottom row: Zoom / Recorded Class + Avatars */}
      <div className="flex items-center justify-between">
        {/* Zoom / Recorded Class pill */}
        {isPast ? (
          <a
            href={recUrl || "/student/recorded-classes"}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 rounded-full px-3 py-1.5 text-[11px] font-black text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors shadow-sm"
          >
            <Icon icon="lucide:play-circle" className="w-3.5 h-3.5" />
            Recorded Class
          </a>
        ) : session.class_link ? (
          <a
            href={session.class_link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-700 dark:text-gray-200 hover:border-blue-400 transition-colors shadow-sm"
          >
            <Icon icon="logos:zoom" className="w-10 h-3.5" />
          </a>
        ) : (
          <span className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-700 dark:text-gray-200 shadow-sm">
            <Icon icon="lucide:video" className="w-3.5 h-3.5 text-gray-400" />
            Online Class
          </span>
        )}

        {/* Participant avatars */}
        <div className="flex items-center -space-x-2">
          {Array.from({ length: visibleAvatars }).map((_, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center text-white text-[10px] font-black shadow-sm"
              style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], zIndex: visibleAvatars - i }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          {extra > 0 && (
            <div
              className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-700 bg-blue-600 flex items-center justify-center text-white text-[9px] font-black shadow-sm"
              style={{ zIndex: 0 }}
            >
              +{extra}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function MiniCalendarWidget() {
  const { token } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Selected day in the 5-day strip (default: today)
  const [selectedDay, setSelectedDay] = useState(today);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch schedule
  const fetchSessions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students/calendar/schedule`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const raw = res.data.sessions || res.data.schedule || res.data.data || res.data || [];
      setSessions(Array.isArray(raw) ? raw : []);
    } catch {
      setSessions([]);
    }
  }, [token, API_BASE_URL]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Build the 5-day strip centred on selectedDay
  const weekStrip = useMemo(() => {
    // We show today's week: start on the day 2 days before selectedDay
    const days = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDay]);

  // Month label from the middle of the strip (index 2)
  const monthLabel = MONTHS[weekStrip[2]?.getMonth()] || "";

  // Sessions for selected day
  const daysSessions = useMemo(() =>
    sessions.filter((s) => isSameDay(new Date(s.session_date), selectedDay)),
  [sessions, selectedDay]);

  // Shift strip by 1 week
  const shiftWeek = (dir) => {
    setSelectedDay((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + dir * 7);
      return d;
    });
  };

  return (
    <>
      {selectedSession && (
        <SessionModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex flex-col gap-5">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:calendar-days" className="w-5 h-5 text-[#09314F] dark:text-blue-300" />
            <h3 className="text-base font-black text-gray-900 dark:text-white">Calendar</h3>
          </div>
          <button className="flex items-center gap-1 text-sm font-black text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            {monthLabel}
            <Icon icon="lucide:chevron-down" className="w-4 h-4" />
          </button>
        </div>

        {/* ── 5-day strip ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1">
          {/* Prev week arrow */}
          <button
            onClick={() => shiftWeek(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Icon icon="lucide:chevron-left" className="w-4 h-4 text-gray-400" />
          </button>

          {/* Day tiles */}
          <div className="flex-1 grid grid-cols-5 gap-1">
            {weekStrip.map((d, i) => {
              const isSelected = isSameDay(d, selectedDay);
              const isToday = isSameDay(d, today);
              const hasSessions = sessions.some((s) => isSameDay(new Date(s.session_date), d));
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(d)}
                  className={`relative flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-200 font-bold
                    ${isSelected
                      ? "bg-[#09314F] text-white shadow-lg scale-105"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                    }
                  `}
                >
                  <span className={`text-[11px] font-semibold mb-1 ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                    {SHORT_DAYS[d.getDay()]}
                  </span>
                  <span className={`text-base font-black ${isToday && !isSelected ? "text-[#E83831]" : ""}`}>
                    {d.getDate()}
                  </span>
                  {hasSessions && (
                    <div className="absolute bottom-1 flex items-center justify-center">
                      <Icon icon="logos:zoom" className="w-6 h-2.5 drop-shadow-sm transition-transform hover:scale-110" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next week arrow */}
          <button
            onClick={() => shiftWeek(1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Icon icon="lucide:chevron-right" className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* ── Sessions for selected day ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {daysSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                <Icon icon="lucide:calendar-check" className="w-6 h-6 text-gray-300 dark:text-gray-500" />
              </div>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
                No classes{" "}
                {isSameDay(selectedDay, today) ? "today" : `on ${SHORT_DAYS[selectedDay.getDay()]} ${selectedDay.getDate()}`}
              </p>
            </div>
          ) : (
            daysSessions.map((s, i) => (
              <SessionCard
                key={i}
                session={s}
                onClick={() => setSelectedSession(s)}
              />
            ))
          )}
        </div>

      </div>
    </>
  );
}
