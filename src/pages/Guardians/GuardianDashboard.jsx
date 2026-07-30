import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';

export default function GuardianDashboard() {
  const navigate = useNavigate();
  const [guardian, setGuardian] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("all");
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "subjects", "exams", "schedule"
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("guardian_token");
    const info = localStorage.getItem("guardian_info");
    const storedStudents = localStorage.getItem("guardianStudents");

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

    // Fetch Guardian Profile & Registered Wards
    const fetchGuardianData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/guardians/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        console.log("🛡️ [GuardianDashboard] Profile API Response:", res.data);
        const data = res.data?.data || res.data?.guardian || res.data || {};
        if (data.firstname) setGuardian(data);
        
        let wards = data.students || data.wards || [];
        if (!wards || wards.length === 0) {
          if (storedStudents) {
            try {
              const parsed = JSON.parse(storedStudents);
              wards = Array.isArray(parsed) ? parsed : (parsed.students || [parsed]);
            } catch (err) {
              console.error("Failed to parse stored guardian students:", err);
            }
          }
        }
        setStudents(wards);
      } catch (error) {
        console.warn("Guardian profile fetch failed, using fallback cached info:", error);
        if (storedStudents) {
          try {
            const parsed = JSON.parse(storedStudents);
            const wards = Array.isArray(parsed) ? parsed : (parsed.students || [parsed]);
            setStudents(wards);
          } catch (e) {}
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGuardianData();
  }, [navigate, API_BASE_URL]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = localStorage.getItem("guardian_token");
      if (token) {
        await axios.post(`${API_BASE_URL}/api/guardians/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
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

  // Mock sample wards data if backend hasn't registered wards yet
  const activeStudents = students.length > 0 ? students : [
    {
      id: 101,
      firstname: "Chioma",
      surname: "Okonjo",
      email: "chioma.o@gmail.com",
      tel: "08034567890",
      program: "WAEC & JAMB Intensive Course",
      subjects_count: 8,
      subjects: [
        { name: "Mathematics", dept: "Science & Arts", progress: 85, teacher: "Dr. Alabi" },
        { name: "English Language", dept: "General", progress: 90, teacher: "Mrs. Benson" },
        { name: "Physics", dept: "Science", progress: 78, teacher: "Engr. David" },
        { name: "Chemistry", dept: "Science", progress: 82, teacher: "Dr. Kalu" },
        { name: "Biology", dept: "Science", progress: 88, teacher: "Mrs. Adeleke" },
        { name: "Further Mathematics", dept: "Science", progress: 72, teacher: "Mr. Okafor" },
        { name: "Economics", dept: "Commercial", progress: 80, teacher: "Mr. Chukwu" },
        { name: "Civic Education", dept: "General", progress: 95, teacher: "Mrs. Ibrahim" }
      ],
      exam_attempts: [
        { id: 1, subject: "Mathematics", exam: "JAMB 2024 Practice Test 1", score: 82, percentage: 82, date: "2026-07-28", status: "passed" },
        { id: 2, subject: "Physics", exam: "WAEC 2023 Mock Exam", score: 75, percentage: 75, date: "2026-07-26", status: "passed" },
        { id: 3, subject: "Chemistry", exam: "Chemistry Organic Review", score: 68, percentage: 68, date: "2026-07-25", status: "passed" },
        { id: 4, subject: "English Language", exam: "Use of English Practice", score: 91, percentage: 91, date: "2026-07-24", status: "passed" },
      ]
    }
  ];

  const currentDisplayedStudent = selectedStudentId === "all"
    ? null
    : activeStudents.find(s => String(s.id) === String(selectedStudentId));

  const totalExamsCount = activeStudents.reduce((acc, s) => acc + (s.exam_attempts?.length || 0), 0);
  const avgScoreCalc = activeStudents.flatMap(s => s.exam_attempts || [])
    .reduce((acc, curr, _, arr) => acc + (curr.percentage || 0) / (arr.length || 1), 0);

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
            {/* Add Ward Button */}
            <Link
              to="/guardian/add-students"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#09314F] hover:bg-[#0f446d] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Icon icon="lucide:user-plus" className="w-4 h-4" />
              <span>Add Student</span>
            </Link>

            {/* Guardian Info & Logout */}
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
                to="/guardian/add-students"
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
                Registered Wards & Students ({activeStudents.length})
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-400">
                Select a student below to inspect their detailed course, subject, and practice exam performance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeStudents.map((student) => {
              const isSelected = String(student.id) === String(selectedStudentId);
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
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
                        {student.firstname?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-[#09314F] dark:text-white leading-tight">
                          {student.firstname} {student.surname || ""}
                        </h4>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">
                          {student.email || student.tel || "Enrolled Student"}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Program:</span>
                      <span className="font-extrabold text-[#09314F] dark:text-white truncate max-w-[180px]">
                        {student.program || "Standard Tutorial"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Enrolled Subjects:</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">
                        {student.subjects_count || student.subjects?.length || 8} Subjects
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
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enrolled Subjects</p>
              <h4 className="text-2xl font-black text-[#09314F] dark:text-white mt-0.5">
                {currentDisplayedStudent ? (currentDisplayedStudent.subjects?.length || 8) : 8}
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Icon icon="lucide:file-text" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Practice Exams Taken</p>
              <h4 className="text-2xl font-black text-[#09314F] dark:text-white mt-0.5">
                {totalExamsCount || 4}
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Icon icon="lucide:award" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg Practice Score</p>
              <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {Math.round(avgScoreCalc || 80)}%
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
              <Icon icon="lucide:calendar-check" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subscription Status</p>
              <h4 className="text-base font-black text-green-600 dark:text-green-400 mt-0.5 uppercase">
                Active
              </h4>
            </div>
          </div>
        </section>

        {/* ── ENROLLED COURSES & SUBJECTS BREAKDOWN (STUDENT DASHBOARD STYLE) ────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-black text-[#09314F] dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Icon icon="lucide:graduation-cap" className="w-6 h-6 text-[#E83831]" />
                Enrolled Subjects & Academic Track
              </h3>
              <p className="text-xs font-medium text-gray-400 mt-1">
                Overview of subjects registered and being studied by {currentDisplayedStudent ? currentDisplayedStudent.firstname : "your wards"}.
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
                Subjects ({currentDisplayedStudent?.subjects?.length || 8})
              </button>
              <button
                onClick={() => setActiveTab("exams")}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${
                  activeTab === "exams"
                    ? "bg-[#09314F] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                Exam Practice ({totalExamsCount || 4})
              </button>
            </div>
          </div>

          {activeTab === "overview" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(currentDisplayedStudent?.subjects || activeStudents[0]?.subjects || []).map((sub, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/50 hover:border-[#BB9E7F]/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-white flex items-center justify-center font-black text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {sub.dept || "Core Subject"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-[#09314F] dark:text-white">
                      {sub.name}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      Teacher: {sub.teacher || "Subject Advisor"}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[10px] font-extrabold text-gray-400 uppercase">
                      <span>Curriculum Progress</span>
                      <span className="text-[#09314F] dark:text-white">{sub.progress || 80}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#09314F] to-[#BB9E7F]"
                        style={{ width: `${sub.progress || 80}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 uppercase font-black tracking-wider">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Exam / Practice Title</th>
                      <th className="py-3 px-4">Date Taken</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-semibold text-gray-700 dark:text-gray-200">
                    {(currentDisplayedStudent?.exam_attempts || activeStudents[0]?.exam_attempts || []).map((att) => (
                      <tr key={att.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-[#09314F] dark:text-white">
                          {att.subject}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-300">
                          {att.exam}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400">
                          {att.date}
                        </td>
                        <td className="py-3.5 px-4 font-black text-blue-600 dark:text-blue-400">
                          {att.percentage}%
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300">
                            {att.status || "Passed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

