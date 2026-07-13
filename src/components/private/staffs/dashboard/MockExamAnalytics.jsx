import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

export default function MockExamAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const fetchMockAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("staff_token");

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/dashboard/mock-analytics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Mock Exam Analytics API Response:", response.data);

      setData(response.data?.data || response.data);
      setError("");
    } catch (err) {
      console.error("Mock Exam Analytics fetch error:", err);
      setError("Failed to load mock exam analytics.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchMockAnalytics();
  }, [fetchMockAnalytics]);

  // Handle outside click for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse h-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data || {};
  
  // Safe extraction based on provided payload structure
  const avgScore = stats.average_score ? Number(stats.average_score).toFixed(1) : 0;
  const passRate = stats.pass_rate ? Number(stats.pass_rate).toFixed(1) : 0;
  const completionRate = stats.completion_rate ? Number(stats.completion_rate).toFixed(0) : 0;
  const mostAttempted = stats.subjects?.most_attempted?.[0]?.name || "—";
  const highestAverage = stats.subjects?.highest_average?.[0]?.name || "—";

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-full flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Icon
                icon="heroicons:clipboard-document-check-20-solid"
                className="w-4 h-4 text-amber-600 dark:text-amber-400"
              />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
              Mock Exam Analytics
            </h3>
          </div>
          <button
            onClick={fetchMockAnalytics}
            className="text-gray-400 hover:text-mainBlue transition-colors"
          >
            <Icon icon="heroicons:arrow-path-20-solid" className="w-4 h-4" />
          </button>
        </div>

        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between gap-4">
            {/* Main Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 border border-gray-100 dark:border-gray-600/50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Avg. Score
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-gray-900 dark:text-white">
                    {avgScore}%
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 border border-gray-100 dark:border-gray-600/50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Pass Rate
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-gray-900 dark:text-white">
                    {passRate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 border border-gray-100 dark:border-gray-600/50">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Completion Rate
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-lightGreen rounded-full" 
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    {completionRate}%
                  </span>
                </div>
            </div>

            {/* Subject Highlights */}
            <div className="space-y-3 mt-2 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons:fire-20-solid" className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Most Attempted</span>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px] text-right">{mostAttempted}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons:star-20-solid" className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Highest Average</span>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px] text-right">{highestAverage}</span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute bottom-0 left-0 right-0 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-xs font-bold text-mainBlue dark:text-blue-400 border-t border-gray-100 dark:border-gray-700 transition-colors"
            >
              View Full Analytics
            </button>
          </div>
        )}
      </div>

      {/* ─── Modal ──────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <Icon icon="heroicons:chart-bar-square-20-solid" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wide">
                  Detailed Mock Exam Analytics
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Icon icon="heroicons:x-mark-20-solid" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Avg. Score</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{avgScore}%</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-900/50">
                  <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-1">Pass Rate</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{passRate}%</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-900/50">
                  <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-1">Avg. Attempts</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.average_attempts_per_student || 0}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-900/50">
                  <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase mb-1">Completion</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{completionRate}%</p>
                </div>
              </div>

              {/* Student Performance Segment */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Icon icon="heroicons:users-20-solid" className="w-4 h-4 text-gray-400" />
                  Student Performance Segments
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Students Above 80%</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">{stats.students?.above_80 || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Students Below 40%</span>
                    <span className="text-sm font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">{stats.students?.below_40 || 0}</span>
                  </div>
                </div>
              </div>

              {/* Subject Analytics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Most & Least Attempted */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <Icon icon="heroicons:chart-bar-20-solid" className="w-4 h-4" /> Most Attempted
                    </h4>
                    <div className="space-y-2">
                      {stats.subjects?.most_attempted?.map((subj) => (
                        <div key={subj.id} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/30">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{subj.name}</span>
                          <span className="text-[11px] font-black text-gray-500">{subj.attempts} attempts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <Icon icon="heroicons:arrow-trending-down-20-solid" className="w-4 h-4" /> Least Attempted
                    </h4>
                    <div className="space-y-2">
                      {stats.subjects?.least_attempted?.map((subj) => (
                        <div key={subj.id} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/30">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{subj.name}</span>
                          <span className="text-[11px] font-black text-gray-500">{subj.attempts} attempts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Highest & Lowest Average */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <Icon icon="heroicons:arrow-trending-up-20-solid" className="w-4 h-4" /> Highest Average Score
                    </h4>
                    <div className="space-y-2">
                      {stats.subjects?.highest_average?.map((subj) => (
                        <div key={subj.id} className="flex items-center justify-between p-2 rounded bg-emerald-50/50 dark:bg-emerald-900/10">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{subj.name}</span>
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">{Number(subj.average_score).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <Icon icon="heroicons:exclamation-circle-20-solid" className="w-4 h-4" /> Lowest Average Score
                    </h4>
                    <div className="space-y-2">
                      {stats.subjects?.lowest_average?.map((subj) => (
                        <div key={subj.id} className="flex items-center justify-between p-2 rounded bg-red-50/50 dark:bg-red-900/10">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{subj.name}</span>
                          <span className="text-[11px] font-black text-red-600 dark:text-red-400">{Number(subj.average_score).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
