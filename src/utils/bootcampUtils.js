import { getLeadTutorName } from "./classStaffUtils";

export const BOOTCAMP_TRACKS = [
  {
    key: "jamb_english",
    day: "Monday",
    dayKey: "monday",
    label: "JAMB Use of English",
    shortLabel: "JAMB English",
    examTag: "JAMB",
    subjectKeywords: ["use of english", "english"],
    courseKeywords: ["jamb", "utme"],
    accent: "from-[#09314F] to-[#1a4a75]",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  },
  {
    key: "olevel_english",
    day: "Tuesday",
    dayKey: "tuesday",
    label: "O'Level English",
    shortLabel: "O'Level English",
    examTag: "O-LEVELS",
    subjectKeywords: ["english"],
    courseKeywords: ["o-level", "olevel", "waec", "neco", "gce"],
    accent: "from-[#0F2843] to-[#235383]",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  {
    key: "jamb_maths",
    day: "Wednesday",
    dayKey: "wednesday",
    label: "JAMB Mathematics",
    shortLabel: "JAMB Maths",
    examTag: "JAMB",
    subjectKeywords: ["mathematics", "maths", "math"],
    courseKeywords: ["jamb", "utme"],
    accent: "from-[#7c2d12] to-[#E83831]",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  },
  {
    key: "olevel_maths",
    day: "Thursday",
    dayKey: "thursday",
    label: "O'Level Mathematics",
    shortLabel: "O'Level Maths",
    examTag: "O-LEVELS",
    subjectKeywords: ["mathematics", "maths", "math"],
    courseKeywords: ["o-level", "olevel", "waec", "neco", "gce"],
    accent: "from-[#6b4f1d] to-[#C5A97A]",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
];

export const isGroupMasterClass = (cls) => {
  if (!cls || typeof cls !== "object") return false;
  const isPrivate = Boolean(
    cls.is_private === true ||
      cls.is_private === 1 ||
      cls.is_private === "1" ||
      cls.is_private === "true" ||
      cls.private_student_id
  );
  if (isPrivate) return false;
  const status = String(cls.status || "active").toLowerCase().trim();
  return status !== "cancelled" && status !== "canceled" && status !== "inactive";
};

export const extractClassJoinLink = (cls) => {
  if (!cls) return "";
  if (cls.zoom_join_url) return cls.zoom_join_url;
  if (cls.class_link) return cls.class_link;
  if (Array.isArray(cls.schedules)) {
    for (const sched of cls.schedules) {
      if (Array.isArray(sched.sessions)) {
        const found = sched.sessions.find((s) => s.zoom_join_url || s.class_link);
        if (found) return found.zoom_join_url || found.class_link;
      }
    }
  }
  return "";
};

export const formatScheduleTime = (timeStr) => {
  if (!timeStr) return "";
  const [hRaw, mRaw] = String(timeStr).split(":");
  const h = parseInt(hRaw, 10);
  if (Number.isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${(mRaw || "00").slice(0, 2)} ${ampm}`;
};

export const getTrackScheduleSummary = (cls, preferredDayKey) => {
  if (!cls || !Array.isArray(cls.schedules) || cls.schedules.length === 0) {
    return "Schedule pending";
  }
  const match =
    cls.schedules.find(
      (s) => String(s.day_of_week || "").toLowerCase().trim() === preferredDayKey
    ) || cls.schedules[0];

  const day = match.day_of_week
    ? match.day_of_week.charAt(0).toUpperCase() + match.day_of_week.slice(1)
    : "";
  const start = formatScheduleTime(match.start_time);
  const end = match.end_time ? formatScheduleTime(match.end_time) : "";
  return `${day}${start ? ` • ${start}` : ""}${end ? ` - ${end}` : ""}`.trim();
};

/**
 * Scores and picks the best matching non-private Master Class for a given Bootcamp track.
 */
export const matchClassForBootcampTrack = (classes, track, overrideClassId = null) => {
  const eligible = (Array.isArray(classes) ? classes : []).filter(isGroupMasterClass);
  if (overrideClassId) {
    const manual = eligible.find((c) => String(c.id) === String(overrideClassId));
    if (manual) return manual;
  }

  let best = null;
  let bestScore = 0;

  for (const cls of eligible) {
    const title = String(cls.title || "").toLowerCase();
    const subjectName = String(cls.subject?.name || cls.subject_name || "").toLowerCase();
    const courseTitle = String(
      cls.course?.title || cls.course?.name || cls.subject?.courses?.map((c) => c.title).join(" ") || ""
    ).toLowerCase();
    const combinedText = `${title} ${subjectName} ${courseTitle}`;

    const matchesSubject = track.subjectKeywords.some((kw) => combinedText.includes(kw));
    if (!matchesSubject) continue;

    const matchesCourse = track.courseKeywords.some((kw) => combinedText.includes(kw));
    if (!matchesCourse) continue;

    let score = 10;
    if (title.includes("bootcamp")) score += 8;
    if (
      Array.isArray(cls.schedules) &&
      cls.schedules.some(
        (s) => String(s.day_of_week || "").toLowerCase().trim() === track.dayKey
      )
    ) {
      score += 5;
    }
    if (extractClassJoinLink(cls)) score += 2;

    if (score > bestScore) {
      bestScore = score;
      best = cls;
    }
  }

  return best;
};

export const getBootcampCardSummary = (cls, track) => {
  if (!cls) return null;
  return {
    id: cls.id,
    title: cls.title || track.label,
    tutorName: getLeadTutorName(cls, "Unassigned Tutor"),
    scheduleText: getTrackScheduleSummary(cls, track.dayKey),
    joinLink: extractClassJoinLink(cls),
    status: cls.status || "active",
    raw: cls,
  };
};

/**
 * Returns the Monday YYYY-MM-DD of the current week in Africa/Lagos.
 */
export const getCurrentWeekMondayYMD = () => {
  const lagosNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })
  );
  const day = lagosNow.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = (day + 6) % 7;
  lagosNow.setDate(lagosNow.getDate() - diffToMonday);
  const y = lagosNow.getFullYear();
  const m = String(lagosNow.getMonth() + 1).padStart(2, "0");
  const d = String(lagosNow.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatDurationClock = (totalSeconds) => {
  const secs = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};
