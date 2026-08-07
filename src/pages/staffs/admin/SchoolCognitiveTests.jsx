import React, { useState, useEffect } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { Icon } from "@iconify/react";

const SchoolCognitiveTests = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");

  // Active Generated Link Info
  const [shareableLink, setShareableLink] = useState("");
  const [linkExpiryTime, setLinkExpiryTime] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchResults();
    loadExistingLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadExistingLink = () => {
    try {
      const storedToken = localStorage.getItem("active_cognitive_test_token");
      if (storedToken) {
        const decoded = JSON.parse(atob(storedToken));
        if (decoded.exp && decoded.exp > Date.now()) {
          const origin = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
          const generatedUrl = `${origin}/cognitive-test?token=${encodeURIComponent(storedToken)}`;
          setShareableLink(generatedUrl);
          setLinkExpiryTime(decoded.exp);
        }
      }
    } catch (e) {
      console.error("Error reading existing test link", e);
    }
  };

  const handleGenerateLink = () => {
    const expiryTimestamp = Date.now() + 60 * 60 * 1000; // 1 hour validity
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const payload = {
      code: randomCode,
      exp: expiryTimestamp,
      created_at: Date.now()
    };

    const token = btoa(JSON.stringify(payload));
    const origin = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
    const generatedUrl = `${origin}/cognitive-test?token=${encodeURIComponent(token)}`;

    localStorage.setItem("active_cognitive_test_token", token);
    setShareableLink(generatedUrl);
    setLinkExpiryTime(expiryTimestamp);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  const fetchResults = async () => {
    setLoading(true);
    let backendResults = [];
    let localResults = [];

    // 1. Fetch from backend API
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cognitive-tests`, {
        headers: { Accept: "application/json" },
      });
      const rawData = res.data?.data || [];
      console.log("🧠 [AdminCognitive] Backend results:", rawData);

      // Map backend fields to the display format
      backendResults = rawData.map((item) => {
        const startedAt = item.test_started_at ? new Date(item.test_started_at) : null;
        const endedAt = item.test_ended_at ? new Date(item.test_ended_at) : null;
        const score = item.score ?? 0;
        const total = 20;
        const percentage = Math.round((score / total) * 100);

        let timeTaken = "N/A";
        if (startedAt && endedAt) {
          const diffSecs = Math.round((endedAt - startedAt) / 1000);
          const mins = Math.floor(diffSecs / 60);
          const secs = diffSecs % 60;
          timeTaken = `${mins}m ${secs}s`;
        }

        return {
          id: item.id,
          student_name: item.student_name,
          school_name: item.school,
          email: "N/A",
          score,
          total,
          percentage,
          time_taken: timeTaken,
          date: startedAt
            ? startedAt.toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })
            : "Unknown",
          _source: "backend",
        };
      });
    } catch (err) {
      console.warn("🧠 [AdminCognitive] Backend fetch failed (using localStorage only):", err.message);
    }

    // 2. Read local storage fallback
    try {
      const stored = localStorage.getItem("cognitive_test_results");
      if (stored) {
        localResults = JSON.parse(stored).map((r) => ({ ...r, _source: "local" }));
      }
    } catch (e) {
      console.error("Error loading local JSON results", e);
    }

    // 3. Merge & deduplicate: backend takes priority
    const backendKeys = new Set(
      backendResults.map((r) => `${r.student_name}||${r.school_name}||${r.score}`)
    );
    const uniqueLocalResults = localResults.filter(
      (r) => !backendKeys.has(`${r.student_name}||${r.school_name}||${r.score}`)
    );

    const allResults = [...backendResults, ...uniqueLocalResults];

    // Sort by Percentage (highest first)
    allResults.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

    setResults(allResults);
    setLoading(false);
  };

  // Export current results as a downloadable JSON file
  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(results, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `cognitive_test_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Clear all stored test records
  const handleResetJSON = () => {
    if (window.confirm("Are you sure you want to clear all recorded test scores?")) {
      localStorage.setItem("cognitive_test_results", JSON.stringify([]));
      fetchResults();
    }
  };

  const uniqueSchools = Array.from(new Set(results.map(r => r.school_name).filter(Boolean)));

  const filteredResults = results.filter(r => {
    const matchesSearch =
      (r.student_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.school_name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSchool = selectedSchool === "all" || r.school_name === selectedSchool;

    return matchesSearch && matchesSchool;
  });

  const totalSubmissions = results.length;
  const totalSchools = uniqueSchools.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalSubmissions)
    : 0;
  const topPerformer = results[0];

  const getRemainingMinutes = () => {
    if (!linkExpiryTime) return 0;
    const diff = Math.max(0, linkExpiryTime - Date.now());
    return Math.ceil(diff / (1000 * 60));
  };

  return (
    <StaffDashboardLayout pagetitle="School Tests">
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 font-sans">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 bg-[#09314F]/10 dark:bg-blue-900/40 text-[#09314F] dark:text-blue-300 text-[10px] font-black uppercase tracking-wider rounded-md">
                Frontend Saved Scores (JSON)
              </span>
              <span className="text-xs font-semibold text-gray-400">• School Competition</span>
            </div>
            <h1 className="text-2xl font-black text-[#09314F] dark:text-white tracking-tight">
              School Tests
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage student cognitive test scores saved locally on the frontend as JSON data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow"
            >
              <Icon icon="lucide:download" className="w-4 h-4" />
              Export JSON
            </button>

            <button
              onClick={fetchResults}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#09314F] hover:bg-[#09314F]/90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow"
            >
              <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* 1-Hour Link Generator Card */}
        <div className="bg-gradient-to-r from-[#09314F] via-[#0F2843] to-[#1A3B5C] text-white p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="lucide:clock-3" className="w-5 h-5 text-[#BB9E7F]" />
                <h3 className="text-lg font-black tracking-tight text-white">
                  Generate Shareable Test Link (1-Hour Expiry)
                </h3>
              </div>
              <p className="text-xs text-gray-300 max-w-xl">
                Create a temporary access link for students and participating schools. The generated link automatically expires in 60 minutes.
              </p>
            </div>

            <button
              onClick={handleGenerateLink}
              className="px-5 py-3 bg-[#BB9E7F] hover:bg-white text-[#09314F] font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              <Icon icon="lucide:link" className="w-4 h-4" />
              <span>{shareableLink ? "Re-Generate Link" : "Generate 1-Hour Link"}</span>
            </button>
          </div>

          {/* Active Generated Link Area */}
          {shareableLink && (
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl flex items-center justify-between overflow-hidden">
                <span className="font-mono text-xs text-gray-200 truncate mr-2">{shareableLink}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded whitespace-nowrap">
                  Expires in {getRemainingMinutes()}m
                </span>
              </div>

              <button
                onClick={handleCopyLink}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                <Icon icon={copied ? "lucide:check" : "lucide:copy"} className="w-4 h-4" />
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#09314F] dark:text-blue-400">
              <Icon icon="lucide:users" className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Takers</span>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white">{totalSubmissions}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Icon icon="lucide:building-2" className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Schools Enrolled</span>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white">{totalSchools}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Icon icon="lucide:bar-chart-3" className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Score</span>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white">{avgScore}%</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Icon icon="lucide:trophy" className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Performer</span>
              <h3 className="text-sm font-black text-gray-800 dark:text-white truncate">
                {topPerformer ? `${topPerformer.student_name} (${topPerformer.percentage}%)` : "N/A"}
              </h3>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full md:w-96">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#09314F]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Filter School:
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full md:w-56 py-2.5 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="all">All Schools ({uniqueSchools.length})</option>
              {uniqueSchools.map((sch, i) => (
                <option key={i} value={sch}>
                  {sch}
                </option>
              ))}
            </select>

            <button
              onClick={handleResetJSON}
              title="Reset data to default JSON sample"
              className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold transition-all"
            >
              <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-[#09314F] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider mt-2">Loading test scores...</span>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">Rank</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">School Name</th>
                    <th className="py-4 px-6">Contact / Email</th>
                    <th className="py-4 px-6 text-center">Score</th>
                    <th className="py-4 px-6 text-center">Percentage</th>
                    <th className="py-4 px-6 text-right">Time Taken</th>
                    <th className="py-4 px-6 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs font-semibold">
                  {filteredResults.map((item, index) => {
                    const isTopThree = index < 3;
                    const rankColors = [
                      "bg-amber-400 text-black", // 1st
                      "bg-gray-300 text-black",  // 2nd
                      "bg-amber-700 text-white"   // 3rd
                    ];

                    return (
                      <tr
                        key={item.id || index}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          {isTopThree ? (
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${rankColors[index]}`}
                            >
                              #{index + 1}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-bold ml-2">#{index + 1}</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-gray-900 dark:text-white font-bold">
                          {item.student_name}
                        </td>

                        <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:building" className="w-3.5 h-3.5 text-gray-400" />
                            <span>{item.school_name}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                          {item.email || "N/A"}
                        </td>

                        <td className="py-4 px-6 text-center font-mono font-bold text-gray-700 dark:text-gray-300">
                          {item.score} / {item.total || 20}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-black ${
                              item.percentage >= 70
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : item.percentage >= 50
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            }`}
                          >
                            {item.percentage}%
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right font-mono text-gray-500 dark:text-gray-400">
                          {item.time_taken || "N/A"}
                        </td>

                        <td className="py-4 px-6 text-right text-gray-400 text-[11px]">
                          {item.date || "Just now"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-gray-400 flex flex-col items-center">
              <Icon icon="lucide:clipboard-x" className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
                No Cognitive Test Results Found
              </h3>
              <p className="text-xs text-gray-400 max-w-sm">
                {searchQuery
                  ? `No test entries match "${searchQuery}".`
                  : "When students complete the cognitive test link, their scores will automatically appear here."}
              </p>
            </div>
          )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
};

export default SchoolCognitiveTests;
