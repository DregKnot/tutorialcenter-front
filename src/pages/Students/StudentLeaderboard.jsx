import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext";

// Fallback high-energy mock leaderboard data in case API endpoint is empty/initializing
const FALLBACK_LEADERBOARD = [
  {
    id: 101,
    name: "Amina Yusuf",
    department: "Science Dept - UTME Prep",
    points: 3420,
    examsCount: 48,
    avgAccuracy: 96,
    streakDays: 14,
    avatar: null,
    badge: "Master Scholar",
  },
  {
    id: 102,
    name: "Chidubem Okafor",
    department: "Engineering Pathway",
    points: 3180,
    examsCount: 42,
    avgAccuracy: 93,
    streakDays: 11,
    avatar: null,
    badge: "Speed Demon",
  },
  {
    id: 103,
    name: "Fatima Bello",
    department: "Medicine & Health Science",
    points: 2950,
    examsCount: 39,
    avgAccuracy: 91,
    streakDays: 9,
    avatar: null,
    badge: "Accuracy Queen",
  },
  {
    id: 104,
    name: "Emmanuel Adebayo",
    department: "Commercial & Economics",
    points: 2740,
    examsCount: 35,
    avgAccuracy: 89,
    streakDays: 7,
    avatar: null,
    badge: "Rising Star",
  },
  {
    id: 105,
    name: "Zainab Mohammed",
    department: "Arts & Humanities",
    points: 2560,
    examsCount: 33,
    avgAccuracy: 88,
    streakDays: 8,
    avatar: null,
    badge: "Consistent Learner",
  },
  {
    id: 106,
    name: "David Nwachukwu",
    department: "Computer Science & ICT",
    points: 2410,
    examsCount: 30,
    avgAccuracy: 86,
    streakDays: 5,
    avatar: null,
    badge: "Code Crusader",
  },
  {
    id: 107,
    name: "Grace Kalu",
    department: "Biological Sciences",
    points: 2280,
    examsCount: 29,
    avgAccuracy: 85,
    streakDays: 6,
    avatar: null,
    badge: "Bio Expert",
  },
  {
    id: 108,
    name: "Tunde Bakare",
    department: "Physical Sciences",
    points: 2150,
    examsCount: 27,
    avgAccuracy: 84,
    streakDays: 4,
    avatar: null,
    badge: "Formula Wizard",
  },
  {
    id: 109,
    name: "Precious Ogbonna",
    department: "Law & Social Studies",
    points: 2020,
    examsCount: 25,
    avgAccuracy: 83,
    streakDays: 5,
    avatar: null,
    badge: "Debate Champ",
  },
  {
    id: 110,
    name: "Ibrahim Garba",
    department: "Management Sciences",
    points: 1910,
    examsCount: 24,
    avgAccuracy: 82,
    streakDays: 3,
    avatar: null,
    badge: "Strategist",
  },
];

export default function StudentLeaderboard() {
  const navigate = useNavigate();
  const { token, student } = useAuth();
  
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all"); // 'all' | 'month' | 'week'
  const [searchQuery, setSearchQuery] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  // Fetch leaderboard data from GET /api/students/leaderboard
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/api/students/leaderboard`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: "application/json" 
          },
          params: { timeframe }
        });

        console.log("🏆 [Student Leaderboard Backend Response]:", response.data);

        let rawData = [];
        if (Array.isArray(response.data)) {
          rawData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          rawData = response.data.data;
        } else if (response.data?.leaderboard && Array.isArray(response.data.leaderboard)) {
          rawData = response.data.leaderboard;
        }

        if (rawData.length > 0) {
          // Normalize items exactly as per backend response
          const normalized = rawData.map((item, idx) => ({
            id: item.student_id || item.id || idx + 1,
            name: item.name || "Student",
            points: Number(item.total_score || 0),
            avgAccuracy: Number(item.average_score || 0),
            avatar: item.profile_picture || null,
            rank: item.rank || idx + 1,
            totalAttempts: Number(item.total_attempts || 0),
            highestScore: Number(item.highest_score || 0),
            totalCorrectAnswers: Number(item.total_correct_answers || 0)
          }));
          setLeaderboardData(normalized);
        } else {
          setLeaderboardData(FALLBACK_LEADERBOARD);
        }
      } else {
        setLeaderboardData(FALLBACK_LEADERBOARD);
      }
    } catch (err) {
      console.warn("Using fallback leaderboard data due to API notice:", err?.message);
      setLeaderboardData(FALLBACK_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL, timeframe]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Filter list by search query
  const filteredList = useMemo(() => {
    return leaderboardData.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [leaderboardData, searchQuery]);

  // Top 3 Podium
  const top1 = filteredList[0] || null;
  const top2 = filteredList[1] || null;
  const top3 = filteredList[2] || null;

  // Ranks 4+
  const rankersList = useMemo(() => filteredList.slice(3), [filteredList]);

  // Find logged-in user position
  const currentStudentName = student ? `${student.firstname || ''} ${student.surname || ''}`.trim().toLowerCase() : "";
  const myRankIndex = leaderboardData.findIndex(
    (item) => item.id === student?.id || item.name.toLowerCase() === currentStudentName
  );

  const myStats = myRankIndex !== -1 ? {
    rank: myRankIndex + 1,
    data: leaderboardData[myRankIndex]
  } : {
    rank: 12,
    data: {
      name: currentStudentName ? `${student.firstname} ${student.surname}` : "You",
      points: 1840,
      examsCount: 22,
      avgAccuracy: 84,
      streakDays: 4
    }
  };

  return (
    <DashboardLayout
      pagetitle="Student Leaderboard"
      hideRightPanel={true}
      hideHeader={false}
    >
      <div className="min-h-screen text-white space-y-8 pb-24 relative overflow-hidden">
        
        {/* ── Ambient Background Glows ────────────────────────────────────────── */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-40 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

        {/* ── Header Section ───────────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[#09314F]/90 via-[#0c263d]/80 to-[#191635]/90 p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 text-black">
                <Icon icon="lucide:trophy" className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-black uppercase tracking-widest border border-amber-500/30">
                Hall of Fame
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-white">
              Student Leadership <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Board</span>
            </h1>
            <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-xl font-medium">
              Compete with fellow students, solve practice exams, keep your streak alive, and climb to the top of the leaderboard!
            </p>
          </div>

          {/* Timeframe Filter Pills */}
          <div className="flex items-center p-1.5 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-md self-stretch md:self-auto">
            {[
              { id: "all", label: "All Time", icon: "lucide:globe" },
              { id: "month", label: "This Month", icon: "lucide:calendar" },
              { id: "week", label: "This Week", icon: "lucide:flame" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  timeframe === t.id
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon icon={t.icon} className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search & Filter Controls ────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholar by name or department..."
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#0c2238]/80 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-all shadow-sm backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={fetchLeaderboard}
              className="px-6 py-3.5 bg-white dark:bg-[#0c2238]/80 border border-gray-200 dark:border-white/10 hover:border-amber-500/50 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-amber-500 transition-all backdrop-blur-md shadow-sm flex items-center gap-2 font-bold uppercase tracking-wider text-xs"
              title="Refresh Leaderboard"
            >
              <Icon icon="lucide:rotate-cw" className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── 3D ANIMATED PODIUM SECTION (Ranks #1, #2, #3) ────────────────────── */}
        <div className="relative z-10 p-6 md:p-10 bg-gradient-to-b from-[#08233a] via-[#09314F] to-[#121c2e] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl text-white">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3 md:gap-6 items-end">

            {/* ── #2 SILVER PODIUM (LEFT) ────────────────────────────────────── */}
            {top2 ? (
              <div className="flex flex-col items-center group animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                {/* Avatar & Crown */}
                <div className="relative mb-3 flex flex-col items-center">
                  <span className="px-3 py-1 bg-slate-200/20 text-slate-100 border border-slate-300/40 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1 shadow-md backdrop-blur-md">
                    <Icon icon="lucide:shield" className="w-3.5 h-3.5 text-slate-200" /> 2 Silver
                  </span>
                  <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-slate-300 shadow-[0_0_25px_rgba(203,213,225,0.4)] p-1 bg-gradient-to-br from-slate-300 to-slate-600 transition-transform group-hover:scale-105 duration-300">
                    <div className="w-full h-full rounded-full bg-[#0c2238] flex items-center justify-center text-white font-black text-base md:text-xl overflow-hidden shadow-inner">
                      {top2.avatar ? (
                        <img src={`${API_BASE_URL}/storage/${top2.avatar}`} alt={top2.name} className="w-full h-full object-cover" />
                      ) : (
                        top2.name.split(" ").map(n => n[0]).join("")
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="text-center mb-3 min-h-[50px]">
                  <h3 className="font-black text-sm md:text-base text-white drop-shadow-md truncate max-w-[120px] md:max-w-[180px]">
                    {top2.name}
                  </h3>
                  <p className="text-[10px] text-slate-300 font-bold tracking-wider truncate max-w-[120px]">
                    {top2.totalAttempts} Attempts
                  </p>
                </div>

                {/* 3D Pedestal Pillar */}
                <div 
                  className="w-full h-36 md:h-48 rounded-t-3xl border-t-2 border-slate-300/60 p-4 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, rgba(203, 213, 225, 0.35) 0%, rgba(30, 41, 59, 0.95) 100%)"
                  }}
                >
                  <div className="absolute inset-0 bg-slate-300/5 pointer-events-none" />
                  <span className="text-3xl md:text-5xl font-black text-slate-200/50">2</span>
                  <div className="text-center">
                    <span className="block text-sm md:text-xl font-black text-slate-100">{top2.points.toLocaleString()} pts</span>
                    <span className="text-[9px] md:text-[11px] font-bold text-slate-300">Highest: {top2.highestScore}%</span>
                  </div>
                </div>
              </div>
            ) : <div className="h-48" />}

            {/* ── #1 GOLD PODIUM (CENTER, ELEVATED) ────────────────────────── */}
            {top1 ? (
              <div className="flex flex-col items-center group animate-in fade-in slide-in-from-bottom duration-700">
                {/* Crown Header */}
                <div className="relative mb-3 flex flex-col items-center">
                  <div className="animate-bounce duration-1000">
                    <Icon icon="lucide:crown" className="w-8 h-8 md:w-11 md:h-11 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]" />
                  </div>
                  <span className="px-3.5 py-1 bg-amber-400 text-black font-black rounded-full text-[10px] md:text-xs uppercase tracking-widest my-1 shadow-lg shadow-amber-500/40 border border-amber-300">
                    1 Champion
                  </span>
                  
                  {/* Glowing Avatar */}
                  <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.7)] p-1 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 transition-transform group-hover:scale-105 duration-300">
                    <div className="w-full h-full rounded-full bg-[#0c2238] flex items-center justify-center text-white font-black text-lg md:text-2xl overflow-hidden shadow-inner">
                      {top1.avatar ? (
                        <img src={`${API_BASE_URL}/storage/${top1.avatar}`} alt={top1.name} className="w-full h-full object-cover" />
                      ) : (
                        top1.name.split(" ").map(n => n[0]).join("")
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="text-center mb-3 min-h-[50px]">
                  <h3 className="font-black text-base md:text-xl text-amber-300 drop-shadow-md truncate max-w-[130px] md:max-w-[200px]">
                    {top1.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-amber-200/90 font-bold tracking-wider truncate max-w-[130px]">
                    {top1.totalAttempts} Attempts
                  </p>
                </div>

                {/* 3D Gold Pillar */}
                <div 
                  className="w-full h-48 md:h-64 rounded-t-3xl border-t-4 border-amber-400 p-4 flex flex-col items-center justify-between shadow-[0_0_50px_rgba(251,191,36,0.3)] relative overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, rgba(251, 191, 36, 0.45) 0%, rgba(20, 30, 45, 0.98) 100%)"
                  }}
                >
                  <div className="absolute inset-0 bg-amber-400/10 pointer-events-none animate-pulse" style={{ animationDuration: '3s' }} />
                  <span className="text-4xl md:text-6xl font-black text-amber-300/50">1</span>
                  <div className="text-center">
                    <span className="block text-base md:text-2xl font-black text-amber-300">{top1.points.toLocaleString()} pts</span>
                    <span className="text-[10px] md:text-xs font-black text-amber-200">Highest: {top1.highestScore}%</span>
                  </div>
                </div>
              </div>
            ) : <div className="h-64" />}

            {/* ── #3 BRONZE PODIUM (RIGHT) ───────────────────────────────────── */}
            {top3 ? (
              <div className="flex flex-col items-center group animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                {/* Avatar */}
                <div className="relative mb-3 flex flex-col items-center">
                  <span className="px-3 py-1 bg-amber-800/40 text-amber-200 border border-amber-700/50 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1 shadow-md backdrop-blur-md">
                    <Icon icon="lucide:award" className="w-3.5 h-3.5 text-amber-400" /> 3 Bronze
                  </span>
                  <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-amber-700 shadow-[0_0_25px_rgba(180,83,9,0.5)] p-1 bg-gradient-to-br from-amber-600 to-yellow-900 transition-transform group-hover:scale-105 duration-300">
                    <div className="w-full h-full rounded-full bg-[#0c2238] flex items-center justify-center text-white font-black text-base md:text-xl overflow-hidden shadow-inner">
                      {top3.avatar ? (
                        <img src={`${API_BASE_URL}/storage/${top3.avatar}`} alt={top3.name} className="w-full h-full object-cover" />
                      ) : (
                        top3.name.split(" ").map(n => n[0]).join("")
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="text-center mb-3 min-h-[50px]">
                  <h3 className="font-black text-sm md:text-base text-white drop-shadow-md truncate max-w-[120px] md:max-w-[180px]">
                    {top3.name}
                  </h3>
                  <p className="text-[10px] text-amber-300/80 font-bold tracking-wider truncate max-w-[120px]">
                    {top3.totalAttempts} Attempts
                  </p>
                </div>

                {/* 3D Pedestal Pillar */}
                <div 
                  className="w-full h-28 md:h-40 rounded-t-3xl border-t-2 border-amber-700/70 p-4 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, rgba(180, 83, 9, 0.35) 0%, rgba(30, 30, 45, 0.95) 100%)"
                  }}
                >
                  <div className="absolute inset-0 bg-amber-700/5 pointer-events-none" />
                  <span className="text-3xl md:text-5xl font-black text-amber-600/40">3</span>
                  <div className="text-center">
                    <span className="block text-sm md:text-xl font-black text-amber-200">{top3.points.toLocaleString()} pts</span>
                    <span className="text-[9px] md:text-[11px] font-bold text-amber-300/90">Highest: {top3.highestScore}%</span>
                  </div>
                </div>
              </div>
            ) : <div className="h-40" />}

          </div>
        </div>

        {/* ── RANKS 4+ LEADERBOARD LIST ────────────────────────────────────────── */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-xs font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Icon icon="lucide:list-ordered" className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Full Scholar Rankings ({filteredList.length})
            </h2>
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Updated in real-time</span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white dark:bg-[#0c2238]/60 rounded-3xl border border-gray-200 dark:border-white/10 backdrop-blur-md shadow-sm">
              <div className="w-10 h-10 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Calculating scholar rankings...</p>
            </div>
          ) : rankersList.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0c2238]/60 rounded-3xl border border-gray-200 dark:border-white/10 backdrop-blur-md shadow-sm">
              <Icon icon="lucide:user-x" className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No scholars found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Try clearing your search query or department filter.</p>
            </div>
          ) : (
            rankersList.map((ranker, index) => {
              const rankNum = index + 4;
              const isCurrentUser = student && (ranker.id === student.id || ranker.name.toLowerCase() === currentStudentName);

              return (
                <div
                  key={ranker.id}
                  className={`group relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 backdrop-blur-xl ${
                    isCurrentUser
                      ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/60 shadow-[0_0_30px_rgba(251,191,36,0.15)] scale-[1.01]"
                      : "bg-white dark:bg-[#0c2238]/70 hover:bg-gray-50 dark:hover:bg-[#122e4c]/90 border-gray-200 dark:border-white/10 hover:border-amber-400/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
                  }`}
                >
                  {/* Left: Rank # + Avatar + Name */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-sm font-black text-gray-700 dark:text-gray-300 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                      {rankNum}
                    </div>

                    <div className="relative w-11 h-11 shrink-0 rounded-full border border-gray-300 dark:border-white/20 overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-gray-800 dark:text-white font-black text-sm">
                      {ranker.avatar ? (
                        <img src={`${API_BASE_URL}/storage/${ranker.avatar}`} alt={ranker.name} className="w-full h-full object-cover" />
                      ) : (
                        ranker.name.split(" ").map(n => n[0]).join("")
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm md:text-base font-black text-gray-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                          {ranker.name}
                        </h4>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5 flex gap-3">
                        <span>Attempts: {ranker.totalAttempts}</span>
                        <span>Correct: {ranker.totalCorrectAnswers}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Stats + Points */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden md:block text-right">
                      <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400">{ranker.highestScore}%</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Highest</span>
                    </div>

                    {/* Points */}
                    <div className="text-right min-w-[80px]">
                      <span className="block text-base font-black text-amber-600 dark:text-amber-300">
                        {ranker.points.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── STICKY PERSONAL RANK BAR (FLOATING AT BOTTOM) ───────────────────── */}
        <div className="sticky bottom-4 z-50 w-full max-w-5xl mx-auto mt-8 px-2 md:px-0">
          <div className="bg-gradient-to-r from-[#09314F] via-[#102d4a] to-[#1d163a] border border-amber-400/40 p-3 md:p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left: Your Position Info */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black flex items-center justify-center font-black text-base md:text-lg shadow-lg shadow-amber-500/20">
                {myStats.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5 md:mb-0">
                  <span className="text-[10px] md:text-xs font-black text-amber-300 uppercase tracking-wider truncate">Your Ranking Position</span>
                  <span className="px-1.5 md:px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[8px] md:text-[9px] font-black uppercase shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-white font-bold text-xs md:text-sm truncate">
                  {myStats.data.name} — <span className="text-amber-400 font-black">{myStats.data.points.toLocaleString()} pts</span>
                </p>
              </div>
            </div>

            {/* Right: CTA to practice more */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-white/10 sm:border-transparent pt-3 sm:pt-0">
              <span className="text-[11px] md:text-xs text-gray-300 font-semibold truncate">
                Want to rank higher?
              </span>
              <button
                onClick={() => navigate("/student/exams")}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black rounded-xl text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Icon icon="lucide:zap" className="w-4 h-4" />
                Practice Now
              </button>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
