import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";
import AchievementVisualRenderer, { getAchievementCondition } from "../../../common/badges/AchievementVisualRenderer";

export default function AchievementsPanel() {
  const navigate = useNavigate();
  const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000").replace(/\/$/, "");
  const token = localStorage.getItem("token") || localStorage.getItem("student_token");

  // Load cached achievements summary for 0ms initial render
  const cachedAchievements = useMemo(() => {
    try {
      const raw = localStorage.getItem("tc_student_achievements_summary");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [loading, setLoading] = useState(!cachedAchievements);
  const [achievementsData, setAchievementsData] = useState(() => cachedAchievements?.items || []);
  const [totalCount, setTotalCount] = useState(() => cachedAchievements?.total || 0);
  const [earnedCount, setEarnedCount] = useState(() => cachedAchievements?.earned || 0);

  useEffect(() => {
    let isMounted = true;

    const fetchAchievements = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/students/achievements`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (isMounted && res.data?.data) {
          const catData = res.data.data;
          const flattened = Object.entries(catData).flatMap(([catKey, items]) =>
            (Array.isArray(items) ? items : []).map((item) => ({
              ...item,
              category: item.category || catKey,
            }))
          );

          const total = flattened.length;
          const earned = flattened.filter((a) => a.earned);
          const locked = flattened.filter((a) => !a.earned);

          // Priority ordering for 6 preview items:
          // 1. Show all earned achievements first
          // 2. Fill remaining slots with the next locked milestones (onboarding, practice, streak, exam)
          const prioritized = [...earned, ...locked].slice(0, 6);

          setAchievementsData(prioritized);
          setTotalCount(total);
          setEarnedCount(earned.length);

          // Cache for instant render next visit
          try {
            localStorage.setItem(
              "tc_student_achievements_summary",
              JSON.stringify({
                items: prioritized,
                total,
                earned: earned.length,
                updatedAt: Date.now(),
              })
            );
          } catch {
            // localstorage quota safety
          }
        }
      } catch (err) {
        console.error("Failed to load student achievements on dashboard:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAchievements();
    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, token]);

  const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm h-full flex flex-col transition-all">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 
            onClick={() => navigate("/student/achievements")}
            className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide cursor-pointer hover:text-primary dark:hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            Achievements
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 font-bold">
            {loading && totalCount === 0 ? (
              <span className="inline-block w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <span className="text-amber-500 font-extrabold">{earnedCount}</span> / {totalCount} unlocked
                {totalCount > 0 && ` (${completionPercentage}%)`}
              </>
            )}
          </p>
        </div>

        <button
          onClick={() => navigate("/student/achievements")}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-xs"
          title="Open Trophy Room & Medal Studio"
        >
          <Icon icon="lucide:trophy" className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Trophy Room</span>
          <Icon icon="lucide:arrow-right" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full transition-all duration-700 shadow-sm"
            style={{
              width: `${Math.max(completionPercentage, totalCount > 0 && earnedCount > 0 ? 4 : 0)}%`,
              background: "linear-gradient(90deg, #09314F 0%, #C5A97A 100%)",
            }}
          />
        </div>
      </div>

      {/* ── Achievement badges grid (3x2 preview) ────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-[190px]">
        {loading && achievementsData.length === 0 ? (
          // Skeleton loading placeholders
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse flex flex-col items-center justify-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="w-14 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))
        ) : achievementsData.length > 0 ? (
          achievementsData.map((a) => {
            const condition = getAchievementCondition(a);
            const isEarned = Boolean(a.earned);

            return (
              <div
                key={a.id || a.code}
                onClick={() => navigate("/student/achievements")}
                title={`${a.name} (${a.category?.replace("_", " ")})\n${isEarned ? "Requirement Met:" : "Unlock Requirement:"} ${condition}`}
                className={`group relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all duration-200 cursor-pointer select-none
                  ${
                    isEarned
                      ? "bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-400/15 dark:to-transparent border-amber-300/40 dark:border-amber-400/30 shadow-xs hover:scale-[1.04] hover:shadow-md hover:border-amber-400"
                      : "bg-gray-50/60 dark:bg-gray-750/30 border-dashed border-gray-200 dark:border-gray-700/60 opacity-60 hover:opacity-100 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.02]"
                  }`}
              >
                {/* Earned Multiplier Count */}
                {isEarned && a.earned_count > 1 && (
                  <div className="absolute top-1 right-1 z-10">
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[9px] font-black leading-none shadow-xs">
                      x{a.earned_count}
                    </span>
                  </div>
                )}

                {/* Badge 3D Render from Official Medals Studio */}
                <div className="py-1 flex items-center justify-center transition-transform group-hover:scale-105">
                  <AchievementVisualRenderer
                    achievement={a}
                    size={46}
                    earned={isEarned}
                  />
                </div>

                {/* Achievement Name */}
                <span
                  className={`text-[10px] font-black text-center leading-tight truncate w-full mt-1 ${
                    isEarned
                      ? "text-gray-800 dark:text-gray-100 group-hover:text-amber-500 transition-colors"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {a.name}
                </span>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 py-8 text-center text-gray-400 dark:text-gray-500 text-xs font-bold">
            No achievements catalog available yet.
          </div>
        )}
      </div>

      {/* ── Footer Link ─────────────────────────────────────────────────── */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-center">
        <button
          onClick={() => navigate("/student/achievements")}
          className="text-[11px] font-bold text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-amber-300 transition-colors flex items-center gap-1"
        >
          <span>Explore all {totalCount > 0 ? totalCount : 70}+ awards in Trophy Room</span>
          <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
