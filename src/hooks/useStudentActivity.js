import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

const TARGET_MINUTES = 300; // 5 hours

/**
 * Returns the short day label for a Date object.
 */
function getDayLabel(date) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
}

/**
 * Formats a Date to "YYYY-MM-DD" for grouping.
 */
function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Given sorted login/logout events for a single day, pair them and
 * calculate total minutes. Unpaired logins (no matching logout) are ignored.
 */
function calculateDayMinutes(events) {
  let totalMinutes = 0;
  const sessions = [];
  let pendingLogin = null;

  for (const evt of events) {
    if (evt.type === "login") {
      pendingLogin = evt;
    } else if (evt.type === "logout" && pendingLogin) {
      const durationMs = evt.timestamp - pendingLogin.timestamp;
      const durationMin = Math.max(0, durationMs / 60000);
      totalMinutes += durationMin;
      sessions.push({
        loginTime: new Date(pendingLogin.timestamp),
        logoutTime: new Date(evt.timestamp),
        minutes: Math.round(durationMin),
      });
      pendingLogin = null;
    }
  }

  return { totalMinutes: Math.round(totalMinutes), sessions };
}

/**
 * Custom hook — fetches student notifications and computes
 * daily session durations for the last 7 days.
 *
 * Returns:
 *   { loading, error, weekData }
 *
 * weekData is an array of 7 objects (Mon → Sun of current week):
 *   { day: "Mon", date: "2026-07-14", minutes: 142, sessions: [...], percent: 47.3, overflow: false }
 */
const activityCache = {
  token: null,
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 5 * 60 * 1000;

export const clearActivityCache = () => {
  activityCache.token = null;
  activityCache.data = null;
  activityCache.timestamp = 0;
};

export default function useStudentActivity(token) {
  const [loading, setLoading] = useState(() => !(activityCache.token === token && activityCache.data && Date.now() - activityCache.timestamp < CACHE_TTL));
  const [error, setError] = useState(null);
  const [weekData, setWeekData] = useState(() => (activityCache.token === token && Date.now() - activityCache.timestamp < CACHE_TTL) ? activityCache.data : []);

  const compute = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (!(activityCache.token === token && activityCache.data && Date.now() - activityCache.timestamp < CACHE_TTL)) {
      setLoading(true);
    }
    setError(null);

    try {
      // Build the last 7 day keys (today → 6 days ago)
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const dayKeys = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        dayKeys.push({
          key: toDateKey(d),
          label: getDayLabel(d),
          dateObj: new Date(d),
        });
      }

      // Fetch notifications (paginated — grab enough to cover the week)
      // We fetch up to 200 to ensure we capture all login/logouts
      const res = await axios.get(`${API_BASE_URL}/api/students/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: { per_page: 200 },
      });

      const notifications = res.data?.data || res.data || [];

      // Extract login/logout events with timestamps
      const events = [];
      for (const notif of notifications) {
        const payload = notif.data || {};
        const eventType = payload.type;

        if (eventType !== "login" && eventType !== "logout") continue;

        // Use the notification created_at as the authoritative timestamp
        const timestamp = new Date(notif.created_at).getTime();
        if (isNaN(timestamp)) continue;

        events.push({
          type: eventType,
          timestamp,
          dateKey: toDateKey(new Date(timestamp)),
        });
      }

      // Group by day
      const grouped = {};
      for (const evt of events) {
        if (!grouped[evt.dateKey]) grouped[evt.dateKey] = [];
        grouped[evt.dateKey].push(evt);
      }

      // Sort each day's events chronologically
      for (const key of Object.keys(grouped)) {
        grouped[key].sort((a, b) => a.timestamp - b.timestamp);
      }

      // Calculate per-day
      const result = dayKeys.map(({ key, label }) => {
        const dayEvents = grouped[key] || [];
        const { totalMinutes, sessions } = calculateDayMinutes(dayEvents);
        const percent = Math.min((totalMinutes / TARGET_MINUTES) * 100, 100);
        const overflow = totalMinutes > TARGET_MINUTES;

        return {
          day: label,
          date: key,
          minutes: totalMinutes,
          sessions,
          percent,
          overflow,
        };
      });

      activityCache.token = token;
      activityCache.data = result;
      activityCache.timestamp = Date.now();
      setWeekData(result);
    } catch (err) {
      console.error("Failed to compute student activity:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    compute();
  }, [compute]);

  return { loading, error, weekData, TARGET_MINUTES };
}
