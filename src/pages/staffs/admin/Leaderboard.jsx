import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { 
  TrophyIcon, 
  SparklesIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FireIcon
} from "@heroicons/react/24/outline";

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      if (response.data && response.data.success) {
        setStudents(response.data.data || []);
      } else {
        setStudents(response.data?.data || []);
      }
      setError("");
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError("Failed to retrieve leaderboard statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top 3 Podium Students
  const top1 = students[0] || null;
  const top2 = students[1] || null;
  const top3 = students[2] || null;

  // Ranks 4+ for the table list
  const listStudents = filteredStudents.filter(s => s.rank > 3);

  // Helpers for user profile avatar fallback
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
    <StaffDashboardLayout pagetitle="Student Leaderboard">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 rounded-2xl flex items-center justify-center border border-amber-200/50">
              <TrophyIcon className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Performance Leaderboard</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Ranking students based on their exam attempt scores</p>
            </div>
          </div>
          <button 
            onClick={fetchLeaderboard}
            disabled={loading}
            className="flex items-center justify-center gap-2 self-start md:self-auto px-5 py-3 bg-[#0F2843] hover:bg-[#09314F] disabled:bg-gray-400 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh data
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4 text-sm text-red-500 font-bold flex items-center gap-3">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* loading state */}
        {loading && students.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 border-4 border-[#BB9E7F] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Rankings...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">No completed exam attempts found yet.</p>
          </div>
        ) : (
          <>
            {/* TOP 3 PODIUM */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto pt-10">
              
              {/* RANK 2: Silver (Left) */}
              <div className="order-2 md:order-1 flex flex-col items-center">
                {top2 ? (
                  <div className="w-full flex flex-col items-center bg-white dark:bg-gray-800 rounded-t-[32px] rounded-b-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group pb-8 pt-10 px-4 relative">
                    <div className="absolute -top-7 w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-black text-xl text-slate-500 border-4 border-[#E6E9EC] dark:border-gray-900 shadow-md">
                      2
                    </div>
                    {top2.profile_picture ? (
                      <img 
                        src={top2.profile_picture.startsWith("http") ? top2.profile_picture : `${API_BASE_URL}/storage/${top2.profile_picture}`} 
                        alt={top2.name} 
                        className="w-20 h-20 rounded-full object-cover border-4 border-slate-300 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center font-black text-2xl border-4 border-slate-300 shadow-sm">
                        {getInitials(top2.name)}
                      </div>
                    )}
                    <h3 className="font-black text-[#0F2843] dark:text-white text-base mt-4 text-center truncate w-full px-2">{top2.name}</h3>
                    <div className="mt-3 flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                      <SparklesIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-black text-slate-600 dark:text-slate-300">{top2.total_score} Pts</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 w-full text-center border-t border-gray-50 dark:border-gray-700/50 pt-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Attempts</p>
                        <p className="text-sm font-black text-[#0F2843] dark:text-white mt-0.5">{top2.total_attempts}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Highest</p>
                        <p className="text-sm font-black text-slate-500 mt-0.5">{top2.highest_score}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-50 dark:bg-gray-800/40 rounded-t-[32px] rounded-b-2xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-black text-gray-300 uppercase tracking-widest">
                    Empty Position
                  </div>
                )}
                <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-700 rounded-b-xl shadow-inner hidden md:block"></div>
              </div>

              {/* RANK 1: Gold (Center) */}
              <div className="order-1 md:order-2 flex flex-col items-center">
                {top1 ? (
                  <div className="w-full flex flex-col items-center bg-white dark:bg-gray-800 rounded-t-[36px] rounded-b-3xl border-2 border-amber-300 dark:border-amber-500/40 shadow-2xl hover:shadow-amber-200/20 dark:hover:shadow-amber-950/10 transition-all duration-300 group pb-10 pt-12 px-6 relative transform lg:-translate-y-4">
                    <div className="absolute -top-9 w-18 h-18 bg-amber-400 text-white rounded-full flex items-center justify-center font-black text-2xl border-4 border-[#E6E9EC] dark:border-gray-900 shadow-lg animate-bounce">
                      👑
                    </div>
                    {top1.profile_picture ? (
                      <img 
                        src={top1.profile_picture.startsWith("http") ? top1.profile_picture : `${API_BASE_URL}/storage/${top1.profile_picture}`} 
                        alt={top1.name} 
                        className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-md transform group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 flex items-center justify-center font-black text-3xl border-4 border-amber-400 shadow-md transform group-hover:scale-105 transition-transform">
                        {getInitials(top1.name)}
                      </div>
                    )}
                    <h3 className="font-black text-[#0F2843] dark:text-white text-lg mt-4 text-center truncate w-full px-2">{top1.name}</h3>
                    <div className="mt-3 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 px-4.5 py-1.5 rounded-full border border-amber-200/50">
                      <TrophyIcon className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-black text-amber-700 dark:text-amber-300">{top1.total_score} Pts</span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-4 w-full text-center border-t border-gray-50 dark:border-gray-700/50 pt-5">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Attempts</p>
                        <p className="text-sm font-black text-[#0F2843] dark:text-white mt-0.5">{top1.total_attempts}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Highest</p>
                        <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">{top1.highest_score}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-50 dark:bg-gray-800/40 rounded-t-[36px] rounded-b-3xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-black text-gray-300 uppercase tracking-widest">
                    Empty Position
                  </div>
                )}
                <div className="w-5/6 h-8 bg-amber-100 dark:bg-amber-950/60 rounded-b-xl shadow-inner hidden md:block"></div>
              </div>

              {/* RANK 3: Bronze (Right) */}
              <div className="order-3 flex flex-col items-center">
                {top3 ? (
                  <div className="w-full flex flex-col items-center bg-white dark:bg-gray-800 rounded-t-[32px] rounded-b-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group pb-8 pt-10 px-4 relative">
                    <div className="absolute -top-7 w-14 h-14 bg-amber-50 dark:bg-amber-900/40 rounded-full flex items-center justify-center font-black text-xl text-amber-700 dark:text-amber-300 border-4 border-[#E6E9EC] dark:border-gray-900 shadow-md">
                      3
                    </div>
                    {top3.profile_picture ? (
                      <img 
                        src={top3.profile_picture.startsWith("http") ? top3.profile_picture : `${API_BASE_URL}/storage/${top3.profile_picture}`} 
                        alt={top3.name} 
                        className="w-20 h-20 rounded-full object-cover border-4 border-amber-600 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-2xl border-4 border-amber-600 shadow-sm">
                        {getInitials(top3.name)}
                      </div>
                    )}
                    <h3 className="font-black text-[#0F2843] dark:text-white text-base mt-4 text-center truncate w-full px-2">{top3.name}</h3>
                    <div className="mt-3 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/40 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800/50">
                      <SparklesIcon className="w-4 h-4 text-amber-500/70" />
                      <span className="text-sm font-black text-amber-800 dark:text-amber-400">{top3.total_score} Pts</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 w-full text-center border-t border-gray-50 dark:border-gray-700/50 pt-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Attempts</p>
                        <p className="text-sm font-black text-[#0F2843] dark:text-white mt-0.5">{top3.total_attempts}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Highest</p>
                        <p className="text-sm font-black text-amber-700 dark:text-amber-500 mt-0.5">{top3.highest_score}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-50 dark:bg-gray-800/40 rounded-t-[32px] rounded-b-2xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-black text-gray-300 uppercase tracking-widest">
                    Empty Position
                  </div>
                )}
                <div className="w-3/4 h-6 bg-amber-50 dark:bg-amber-950/20 rounded-b-xl shadow-inner hidden md:block"></div>
              </div>

            </div>

            {/* SEARCH AND LIST TABLE */}
            <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mt-8">
              
              {/* Search Bar Panel */}
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Full Leaderboard Rankings</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Showing ranks 4 to {students.length}</p>
                </div>
                
                <div className="relative w-full md:max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search student by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-[#BB9E7F] focus:bg-white text-gray-900 dark:text-white font-bold text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Rankings Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/60 text-left">
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
                    {listStudents.length > 0 ? (
                      listStudents.map((student) => (
                        <tr 
                          key={student.student_id} 
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                        >
                          {/* Rank */}
                          <td className="py-5 px-6 text-center">
                            <span className="inline-flex w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 items-center justify-center font-black text-xs">
                              {student.rank}
                            </span>
                          </td>
                          {/* Profile & Name */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3.5">
                              {student.profile_picture ? (
                                <img 
                                  src={student.profile_picture.startsWith("http") ? student.profile_picture : `${API_BASE_URL}/storage/${student.profile_picture}`} 
                                  alt={student.name} 
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center font-black text-sm">
                                  {getInitials(student.name)}
                                </div>
                              )}
                              <div>
                                <p className="font-black text-[#0F2843] dark:text-white text-sm">{student.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Student ID: #{student.student_id}</p>
                              </div>
                            </div>
                          </td>
                          {/* Avg Score */}
                          <td className="py-5 px-6 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-sm font-black text-[#0F2843] dark:text-white">{student.average_score}%</span>
                              <div className="w-16 h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full" 
                                  style={{ width: `${Math.min(100, student.average_score)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          {/* Highest Score */}
                          <td className="py-5 px-6 text-center">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{student.highest_score}%</span>
                          </td>
                          {/* Attempts */}
                          <td className="py-5 px-6 text-center">
                            <span className="text-sm font-black text-[#0F2843] dark:text-white">{student.total_attempts}</span>
                          </td>
                          {/* Correct Answers */}
                          <td className="py-5 px-6 text-center">
                            <span className="text-sm font-bold text-[#BB9E7F]">{student.total_correct_answers}</span>
                          </td>
                          {/* Total Score */}
                          <td className="py-5 px-6 text-center">
                            <span className="text-sm font-black text-[#0F2843] dark:text-white">{student.total_score}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                          No students matching search filter
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
