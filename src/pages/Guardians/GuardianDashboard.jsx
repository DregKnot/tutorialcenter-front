import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';

export default function GuardianDashboard() {
  const navigate = useNavigate();
  const [guardian, setGuardian] = useState(null);
  const [dashboardWards, setDashboardWards] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState("all");
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "exams", "schedule"
  const [loading, setLoading] = useState(true);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showAddWardPopup, setShowAddWardPopup] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("guardian_token");
    const info = localStorage.getItem("guardian_info");

    if (!token) {
      navigate("/guardian/login");
      return;
    }

    if (info) {
      try {
        setGuardian(JSON.parse(info));
      } catch (e) {
        console.error("Failed to parse guardian info:", e);
      }
    }

    // Fetch Guardian Profile & Dashboard Wards
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const profileRes = await axios.get(`${API_BASE_URL}/api/guardians/profile`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = profileRes.data?.data || profileRes.data?.guardian || profileRes.data || {};
        if (data.firstname) setGuardian(data);

        // Fetch dashboard wards
        const wardsRes = await axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const wardsList = wardsRes.data.data || [];
        setDashboardWards(wardsList);
        if (wardsList.length === 0) {
          setShowAddWardPopup(true);
        }
      } catch (error) {
        console.warn("Guardian dashboard fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, API_BASE_URL]);

  // Fetch performance and attendance when tab or student changes
  useEffect(() => {
    if (selectedStudentId === "all") return;

    const token = localStorage.getItem("guardian_token");
    if (!token) return;

    const fetchTabDetails = async () => {
      setFetchingDetails(true);
      try {
        if (activeTab === "exams" && !performanceData[selectedStudentId]) {
          const res = await axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/performance`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          });
          setPerformanceData(prev => ({ ...prev, [selectedStudentId]: res.data.data }));
        } else if (activeTab === "schedule" && !attendanceData[selectedStudentId]) {
          const res = await axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedStudentId}/attendance`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          });
          setAttendanceData(prev => ({ ...prev, [selectedStudentId]: res.data.data }));
        }
      } catch (error) {
        console.error("Failed to fetch tab details:", error);
      } finally {
        setFetchingDetails(false);
      }
    };

    fetchTabDetails();
  }, [activeTab, selectedStudentId, performanceData, attendanceData, API_BASE_URL]);


  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = localStorage.getItem("guardian_token");
      if (token) {
        await axios.post(`${API_BASE_URL}/api/guardians/logout`, {}, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("guardian_token");
      localStorage.removeItem("guardian_info");
      setLoggingOut(false);
      navigate("/guardian/login");
    }
  };

  const currentDisplayedStudent = selectedStudentId === "all"
    ? null
    : dashboardWards.find(s => String(s.student_id) === String(selectedStudentId));

  const totalCoursesCount = currentDisplayedStudent 
    ? currentDisplayedStudent.active_courses?.length || 0
    : dashboardWards.reduce((acc, s) => acc + (s.active_courses?.length || 0), 0);

  const getStatusColor = (avg) => {
      if (avg >= 70) return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/60";
      if (avg >= 40) return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60";
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071927] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
          <p className="text-xs font-extrabold text-[#09314F] dark:text-white uppercase tracking-wider">
            Loading Guardian Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071927] text-gray-800 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* ── TOPBAR NAV ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#09314F]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/10 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#09314F] to-[#A92429] flex items-center justify-center text-white shadow-md">
              <Icon icon="lucide:shield-check" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-[#09314F] dark:text-white uppercase">
                Tutorial Center
              </h1>
              <p className="text-[10px] font-bold text-[#BB9E7F] tracking-widest uppercase">
                Guardian Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/register/guardian/addstudent"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#09314F] hover:bg-[#0f446d] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Icon icon="lucide:user-plus" className="w-4 h-4" />
              <span>Add Student</span>
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-white/10">
              <div className="w-9 h-9 rounded-full bg-[#BB9E7F]/20 text-[#BB9E7F] border border-[#BB9E7F]/40 flex items-center justify-center font-black text-sm">
                {guardian?.firstname?.[0]?.toUpperCase() || "G"}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-extrabold text-[#09314F] dark:text-white leading-tight">
                  {guardian?.firstname ? `${guardian.firstname} ${guardian.surname || ''}` : "Guardian Account"}
                </p>
                <p className="text-[10px] font-medium text-gray-400">
                  {guardian?.email || guardian?.tel || "Guardian"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Logout"
                className="p-2 text-gray-400 hover:text-[#E83831] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
              >
                <Icon icon="lucide:log-out" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#09314F] via-[#0F2843] to-[#A92429] p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-[#BB9E7F] mb-3">
              <Icon icon="lucide:sparkles" className="w-3.5 h-3.5" />
              Guardian Control Hub
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              Welcome back, {guardian?.firstname || "Guardian"}! 👋
            </h2>
            <p className="text-sm text-gray-200 font-medium leading-relaxed mb-6">
              Track your registered students' academic progress, course enrollments, subject breakdowns, and practice examination performance in real-time.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/register/guardian/addstudent"
                className="px-5 py-2.5 bg-[#BB9E7F] hover:bg-[#c9ad8e] text-[#09314F] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <Icon icon="lucide:user-plus" className="w-4 h-4" />
                Register Additional Student
              </Link>
            </div>
          </div>
          <div className="absolute right-[-40px] bottom-[-40px] w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* ── REGISTERED WARDS ROSTER & SELECTOR ────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#09314F] dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Icon icon="lucide:users" className="w-5 h-5 text-[#BB9E7F]" />
                Registered Wards & Students ({dashboardWards.length})
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-400">
                Select a student below to inspect their detailed course, subject, and practice exam performance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dashboardWards.map((ward) => {
              const isSelected = String(ward.student_id) === String(selectedStudentId);
              return (
                <div
                  key={ward.student_id}
                  onClick={() => setSelectedStudentId(ward.student_id)}
                  className={`
                    cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between
                    ${isSelected
                      ? "bg-white dark:bg-[#09314F] border-[#09314F] dark:border-[#BB9E7F] shadow-xl scale-[1.01]"
                      : "bg-white/80 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700 hover:border-[#BB9E7F]/50 shadow-sm"
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#09314F] to-[#BB9E7F] text-white flex items-center justify-center font-black text-lg shadow-md">
                        {ward.name?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-[#09314F] dark:text-white leading-tight">
                          {ward.name}
                        </h4>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">
                          {ward.email}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Phone:</span>
                      <span className="font-extrabold text-[#09314F] dark:text-white truncate">
                        {ward.phone || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Active Courses:</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">
                        {ward.active_courses?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Active:</span>
                      <span className="font-extrabold text-gray-700 dark:text-gray-300">
                        {ward.last_active_date ? new Date(ward.last_active_date).toLocaleDateString() : "Never"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── METRICS SUMMARY CARDS ────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Icon icon="lucide:book-open" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Courses</p>
              <h4 className="text-2xl font-black text-[#09314F] dark:text-white mt-0.5">
                {totalCoursesCount}
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
              <Icon icon="lucide:calendar-check" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Wards</p>
              <h4 className="text-2xl font-black text-[#09314F] dark:text-white mt-0.5">
                {dashboardWards.length}
              </h4>
            </div>
          </div>
        </section>

        {/* ── DYNAMIC TABS AREA ────────────────────────── */}
        {selectedStudentId !== "all" && currentDisplayedStudent && (
          <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-black text-[#09314F] dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Icon icon="lucide:graduation-cap" className="w-6 h-6 text-[#E83831]" />
                  {currentDisplayedStudent.name}'s Academic Track
                </h3>
                <p className="text-xs font-medium text-gray-400 mt-1">
                  Detailed breakdown of courses, performance, and attendance.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${
                    activeTab === "overview"
                      ? "bg-[#09314F] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  Courses ({currentDisplayedStudent.active_courses?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("exams")}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${
                    activeTab === "exams"
                      ? "bg-[#09314F] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  Exam Practice
                </button>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${
                    activeTab === "schedule"
                      ? "bg-[#09314F] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  Live Classes
                </button>
              </div>
            </div>

            {fetchingDetails ? (
              <div className="py-10 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* COURSES TAB */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(currentDisplayedStudent.active_courses || []).length > 0 ? (
                      currentDisplayedStudent.active_courses.map((course, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/50 flex flex-col justify-center">
                          <h4 className="text-base font-extrabold text-[#09314F] dark:text-white">
                            {course}
                          </h4>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No active courses found.</p>
                    )}
                  </div>
                )}

                {/* EXAMS PERFORMANCE TAB */}
                {activeTab === "exams" && performanceData[selectedStudentId] && (
                  <div className="space-y-6">
                    {/* Merits By Subject Grid */}
                    <h4 className="text-sm font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest border-b pb-2">Subject Performance Merits</h4>
                    {performanceData[selectedStudentId].merits_by_subject?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {performanceData[selectedStudentId].merits_by_subject.map((merit, idx) => (
                          <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                            <h5 className="font-extrabold text-[#09314F] dark:text-white text-base truncate">{merit.subject}</h5>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Exams Taken:</span>
                              <span className="font-bold">{merit.total_exams_taken}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Highest Score:</span>
                              <span className="font-bold text-green-600">{merit.highest_score}%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Lowest Score:</span>
                              <span className="font-bold text-red-600">{merit.lowest_score}%</span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-gray-400">Average</span>
                              <span className={`px-2 py-1 rounded text-xs font-black ${getStatusColor(merit.average_score)}`}>
                                {merit.average_score}%
                              </span>
                            </div>
                            {merit.needs_improvement && (
                              <div className="text-[10px] bg-red-50 text-red-600 p-1 rounded font-bold text-center uppercase mt-2">
                                Needs Improvement
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No exam practices taken yet.</p>
                    )}

                    {/* Recent History Table */}
                    <h4 className="text-sm font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest border-b pb-2 mt-8">Recent Practice History</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 uppercase font-black tracking-wider">
                            <th className="py-3 px-4">Exam Body</th>
                            <th className="py-3 px-4">Subject</th>
                            <th className="py-3 px-4">Score</th>
                            <th className="py-3 px-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-semibold text-gray-700 dark:text-gray-200">
                          {(performanceData[selectedStudentId].recent_history || []).map((history, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <td className="py-3.5 px-4 text-[#09314F] dark:text-white">{history.exam_body}</td>
                              <td className="py-3.5 px-4 font-extrabold">{history.subject}</td>
                              <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">{history.percentage}%</td>
                              <td className="py-3.5 px-4 text-gray-400">{new Date(history.date).toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {(performanceData[selectedStudentId].recent_history || []).length === 0 && (
                            <tr>
                              <td colSpan="4" className="py-4 text-center text-gray-500">No recent history available.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* LIVE CLASSES ATTENDANCE TAB */}
                {activeTab === "schedule" && attendanceData[selectedStudentId] && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 uppercase font-black tracking-wider">
                            <th className="py-3 px-4">Class Topic</th>
                            <th className="py-3 px-4">Joined At</th>
                            <th className="py-3 px-4">Left At</th>
                            <th className="py-3 px-4">Duration Stayed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-semibold text-gray-700 dark:text-gray-200">
                          {(attendanceData[selectedStudentId].attendance || []).map((att, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <td className="py-3.5 px-4 font-extrabold text-[#09314F] dark:text-white">
                                {att.class_topic}
                              </td>
                              <td className="py-3.5 px-4 text-gray-500 dark:text-gray-300">
                                {new Date(att.joined_at).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 text-gray-400">
                                {att.left_at ? new Date(att.left_at).toLocaleString() : "N/A (Active/Did not log out)"}
                              </td>
                              <td className="py-3.5 px-4 font-black text-blue-600 dark:text-blue-400">
                                {att.duration_minutes > 0 ? `${att.duration_minutes} mins` : "Pending..."}
                              </td>
                            </tr>
                          ))}
                          {(attendanceData[selectedStudentId].attendance || []).length === 0 && (
                            <tr>
                              <td colSpan="4" className="py-4 text-center text-gray-500">No live class attendance records found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}
        {/* ── EMPTY STATE POPUP ────────────────────────── */}
        {showAddWardPopup && dashboardWards.length === 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
            <div className="bg-white dark:bg-[#09314F] p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-[#BB9E7F]/30 text-center relative animate-in fade-in zoom-in duration-300">
              <button 
                onClick={() => setShowAddWardPopup(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-[#0f446d] text-blue-600 dark:text-[#BB9E7F] flex items-center justify-center mx-auto mb-6">
                <Icon icon="lucide:user-plus" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#09314F] dark:text-white mb-2 tracking-tight">
                Welcome to the Guardian Dashboard!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-8 leading-relaxed">
                It looks like you haven't linked any students to your account yet. Register your wards to track their academic progress, view exam merits, and monitor class attendance.
              </p>
              <Link
                to="/register/guardian/addstudent"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#09314F] hover:bg-[#0f446d] dark:bg-[#BB9E7F] dark:hover:bg-[#c9ad8e] dark:text-[#09314F] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95"
              >
                <Icon icon="lucide:plus" className="w-5 h-5" />
                Add Wards Now
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
