// Client-side cache for Student Dashboard to prevent reload blinks and re-fetching on navigation

const cache = {
  courses: null,
  attempts: null,
  leaderboardRank: null,
  unreadCount: 0,
  lastFetched: 0,
  studentId: null,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes validity

export const getDashboardCache = (studentId) => {
  if (!studentId) return null;

  // 1. Check in-memory cache
  if (
    cache.studentId === studentId &&
    Date.now() - cache.lastFetched < CACHE_TTL &&
    cache.courses
  ) {
    return {
      courses: cache.courses,
      attempts: cache.attempts || [],
      leaderboardRank: cache.leaderboardRank,
      unreadCount: cache.unreadCount || 0,
    };
  }

  // 2. Fallback check in sessionStorage
  try {
    const sessionData = sessionStorage.getItem(`student_dashboard_cache_${studentId}`);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed && Date.now() - parsed.timestamp < CACHE_TTL && parsed.courses) {
        // Sync back to memory cache
        cache.courses = parsed.courses;
        cache.attempts = parsed.attempts || [];
        cache.leaderboardRank = parsed.leaderboardRank;
        cache.unreadCount = parsed.unreadCount || 0;
        cache.lastFetched = parsed.timestamp;
        cache.studentId = studentId;

        return parsed;
      }
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }

  return null;
};

export const setDashboardCache = (studentId, data) => {
  if (!studentId) return;

  const timestamp = Date.now();
  cache.studentId = studentId;
  cache.courses = data.courses;
  cache.attempts = data.attempts || [];
  cache.leaderboardRank = data.leaderboardRank;
  cache.unreadCount = data.unreadCount || 0;
  cache.lastFetched = timestamp;

  try {
    sessionStorage.setItem(
      `student_dashboard_cache_${studentId}`,
      JSON.stringify({
        ...data,
        timestamp,
      })
    );
  } catch (e) {
    console.error("Cache write error:", e);
  }
};

export const clearDashboardCache = (studentId) => {
  cache.courses = null;
  cache.attempts = null;
  cache.leaderboardRank = null;
  cache.lastFetched = 0;
  cache.studentId = null;

  if (studentId) {
    try {
      sessionStorage.removeItem(`student_dashboard_cache_${studentId}`);
    } catch (e) {
      // Ignore cleanup error
    }
  }
};
