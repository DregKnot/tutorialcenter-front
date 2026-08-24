import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

export default function LeaderboardWidget() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("staff_token");

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/dashboard/leaderboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Leaderboard Widget API Response:", response.data);

      if (response.data && response.data.success) {
        setStudents(response.data.data || []);
      } else {
        setStudents(response.data?.data || []);
      }
      setError("");
    } catch (err) {
      console.error("Leaderboard Widget fetch error:", err);
      setError("Failed to load rankings.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = students[0] || null;
  const top2 = students[1] || null;
  const top3 = students[2] || null;

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-white/40 dark:border-gray-700/60 p-5 h-full flex flex-col overflow-hidden shadow-lg relative">
        {/* Subtle ambient light */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Icon
                icon="heroicons:trophy-20-solid"
                className="w-4 h-4"
              />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
              Student Leaderboard
            </h3>
          </div>
          <button 
            onClick={fetchLeaderboard}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            title="Refresh rankings"
          >
            <Icon
              icon="heroicons:arrow-path-20-solid"
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl mb-3">{error}</p>
        )}

        {loading && students.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center gap-2 py-10">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Loading rankings...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
            <Icon icon="heroicons:trophy" className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-2" />
            <p className="text-xs text-gray-400 font-bold">No exam attempts completed yet.</p>
          </div>
        ) : (
          <div className="flex-grow flex flex-col justify-between min-h-0 relative z-10">
            
            {/* Top 3 Podium (Quick Glass Layout) */}
            <div className="grid grid-cols-3 gap-1 items-end bg-gradient-to-b from-gray-50/80 to-gray-100/60 dark:from-gray-900/60 dark:to-gray-950/80 backdrop-blur-md rounded-2xl p-4 text-center my-auto border border-gray-100/80 dark:border-gray-700/50 shadow-inner">
              
              {/* Rank 2 */}
              <div className="flex flex-col items-center">
                {top2 ? (
                  <>
                    <div className="relative">
                      <span className="absolute -top-2.5 -right-1 bg-slate-300 text-slate-900 text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-sm">2</span>
                      {top2.profile_picture ? (
                        <img 
                          src={top2.profile_picture.startsWith("http") ? top2.profile_picture : `${API_BASE_URL}/storage/${top2.profile_picture}`} 
                          alt="" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 shadow-md ring-2 ring-slate-300/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs border-2 border-slate-300 shadow-md ring-2 ring-slate-300/30">
                          {getInitials(top2.name)}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate w-full mt-2">{top2.name.split(" ")[0]}</p>
                    <p className="text-[9px] font-black text-slate-500 mt-0.5">{top2.total_score} Pts</p>
                  </>
                ) : (
                  <div className="w-12 h-12 rounded-full border border-dashed border-gray-200 dark:border-gray-700"></div>
                )}
              </div>

              {/* Rank 1 */}
              <div className="flex flex-col items-center">
                {top1 ? (
                  <>
                    <div className="relative">
                      <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 text-sm">👑</span>
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white shadow-sm">1</span>
                      {top1.profile_picture ? (
                        <img 
                          src={top1.profile_picture.startsWith("http") ? top1.profile_picture : `${API_BASE_URL}/storage/${top1.profile_picture}`} 
                          alt="" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-lg ring-2 ring-amber-400/50"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 flex items-center justify-center font-black text-sm border-2 border-amber-400 shadow-lg ring-2 ring-amber-400/50">
                          {getInitials(top1.name)}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-black text-[#0F2843] dark:text-white truncate w-full mt-1.5">{top1.name.split(" ")[0]}</p>
                    <p className="text-[10px] font-black text-amber-500 mt-0.5">{top1.total_score} Pts</p>
                  </>
                ) : (
                  <div className="w-16 h-16 rounded-full border border-dashed border-gray-200 dark:border-gray-700"></div>
                )}
              </div>

              {/* Rank 3 */}
              <div className="flex flex-col items-center">
                {top3 ? (
                  <>
                    <div className="relative">
                      <span className="absolute -top-2.5 -right-1 bg-amber-700 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-sm">3</span>
                      {top3.profile_picture ? (
                        <img 
                          src={top3.profile_picture.startsWith("http") ? top3.profile_picture : `${API_BASE_URL}/storage/${top3.profile_picture}`} 
                          alt="" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-600 shadow-md ring-2 ring-amber-600/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs border-2 border-amber-600 shadow-md ring-2 ring-amber-600/30">
                          {getInitials(top3.name)}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate w-full mt-2">{top3.name.split(" ")[0]}</p>
                    <p className="text-[9px] font-black text-amber-700 mt-0.5">{top3.total_score} Pts</p>
                  </>
                ) : (
                  <div className="w-12 h-12 rounded-full border border-dashed border-gray-200 dark:border-gray-700"></div>
                )}
              </div>

            </div>

            {/* View Full Leaderboard Button */}
            <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700/50 flex justify-center flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-black text-[#0F2843] dark:text-blue-400 hover:underline tracking-wider uppercase transition-colors"
              >
                View Full Leaderboard
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ===== POPUP MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-4xl shadow-2xl relative max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <Icon icon="heroicons:x-mark-20-solid" className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center border border-amber-200/50">
                <Icon icon="heroicons:trophy-20-solid" className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Performance Leaderboard</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Global student rankings and analytics</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon icon="heroicons:magnifying-glass-20-solid" className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search student by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-[#BB9E7F] focus:bg-white text-gray-900 dark:text-white font-bold text-sm outline-none transition-all"
              />
            </div>

            {/* Scrollable Leaderboard Table */}
            <div className="flex-1 overflow-x-auto min-h-0 custom-scrollbar border border-gray-50 dark:border-gray-700 rounded-2xl">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-750 text-left sticky top-0 z-10">
                    <th className="py-4 px-6 text-[10px] font-black text-[#0F2843] dark:text-gray-300 uppercase tracking-widest text-center w-20">Rank</th>
                    <th className="py-4 px-6 text-[10px] font-black text-[#0F2843] dark:text-gray-300 uppercase tracking-widest">Student</th>
                    <th className="py-4 px-6 text-[10px] font-black text-[#0F2843] dark:text-gray-300 uppercase tracking-widest text-center">Avg Score</th>
                    <th className="py-4 px-6 text-[10px] font-black text-[#0F2843] dark:text-gray-300 uppercase tracking-widest text-center">Highest Score</th>
                    <th className="py-4 px-6 text-[10px] font-black text-[#0F2843] dark:text-gray-300 uppercase tracking-widest text-center">Attempts</th>
                    <th className="py-4 px-6 text-[10px] font-black text-[#0F2843] dark:text-gray-300 uppercase tracking-widest text-center">Correct Answers</th>
                    <th className="py-4 px-6 text-[10px] font-black text-[#0F2843] dark:text-gray-300 uppercase tracking-widest text-center">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr 
                        key={student.student_id} 
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-colors"
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center font-black text-xs ${
                            student.rank === 1 ? "bg-amber-100 text-amber-700" :
                            student.rank === 2 ? "bg-slate-100 text-slate-700" :
                            student.rank === 3 ? "bg-amber-50 text-amber-800" :
                            "bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}>
                            {student.rank}
                          </span>
                        </td>
                        {/* Student Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {student.profile_picture ? (
                              <img 
                                src={student.profile_picture.startsWith("http") ? student.profile_picture : `${API_BASE_URL}/storage/${student.profile_picture}`} 
                                alt="" 
                                className="w-9 h-9 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center font-black text-xs">
                                {getInitials(student.name)}
                              </div>
                            )}
                            <div>
                              <p className="font-black text-[#0F2843] dark:text-white text-xs">{student.name}</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">ID: #{student.student_id}</p>
                            </div>
                          </div>
                        </td>
                        {/* Avg Score */}
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-black text-[#0F2843] dark:text-white">{student.average_score}%</span>
                            <div className="w-14 h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${Math.min(100, student.average_score)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        {/* Highest Score */}
                        <td className="py-4 px-6 text-center">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{student.highest_score}%</span>
                        </td>
                        {/* Attempts */}
                        <td className="py-4 px-6 text-center">
                          <span className="text-xs font-black text-[#0F2843] dark:text-white">{student.total_attempts}</span>
                        </td>
                        {/* Correct Answers */}
                        <td className="py-4 px-6 text-center">
                          <span className="text-xs font-bold text-[#BB9E7F]">{student.total_correct_answers}</span>
                        </td>
                        {/* Total Points */}
                        <td className="py-4 px-6 text-center">
                          <span className="text-xs font-black text-[#0F2843] dark:text-white">{student.total_score}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        No students matching search query
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-[#0F2843] hover:bg-[#09314F] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
