import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

export default function RecommendedExamPractice({ courses = [], attempts = [] }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  useEffect(() => {
    const fetchAvailableExams = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/students/exams/available`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.exams || res.data?.data || [];
        setAvailableExams(data);
      } catch (err) {
        console.error("Failed to load available exams for recommendations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableExams();
  }, [token, API_BASE_URL]);

  const recommendedCards = useMemo(() => {
    if (loading || !courses.length) return [];

    // 1. Gather all available subjects from courses and availableExams
    // courses: array of active course objects. Some might have nested .course.subjects or .subjects
    const enrolledSubjectIds = new Set();
    const subjectMap = new Map(); // id -> name

    courses.forEach(c => {
      const subs = c.subjects || c.course?.subjects || [];
      subs.forEach(s => {
        enrolledSubjectIds.add(s.id);
        subjectMap.set(s.id, s.name);
      });
    });

    // Extract available years from availableExams
    const subjectYears = new Map(); // subjectId -> array of { yearId, yearName }
    availableExams.forEach(exam => {
      const sId = exam.subject_id;
      if (!subjectYears.has(sId)) subjectYears.set(sId, []);
      subjectYears.get(sId).push({ id: exam.id, year: exam.exam_year });
    });

    // 2. Calculate average and max scores per subject from attempts
    const stats = new Map(); // subjectId -> { totalScore: 0, count: 0, maxScore: 0, attemptsPerYear: map(yearId -> maxScore) }
    
    attempts.forEach(attempt => {
      const sId = attempt.subject?.id || attempt.subject_id;
      if (!sId) return;
      
      const scoreVal = attempt.score !== undefined ? Number(attempt.score) : (attempt.correct_answers !== undefined ? Number(attempt.correct_answers) : 0);
      const totalQ = attempt.total_questions !== undefined ? Number(attempt.total_questions) : (attempt.questions_count !== undefined ? Number(attempt.questions_count) : 0);
      const percentage = attempt.percentage !== undefined ? Number(attempt.percentage) : (totalQ ? (scoreVal / totalQ) * 100 : 0);
      
      const yearId = attempt.exam_year_id ? String(attempt.exam_year_id) : null;

      if (!stats.has(sId)) {
        stats.set(sId, { totalScore: 0, count: 0, maxScore: 0, attemptsPerYear: new Map() });
      }
      
      const sStats = stats.get(sId);
      sStats.totalScore += percentage;
      sStats.count += 1;
      if (percentage > sStats.maxScore) sStats.maxScore = percentage;
      
      if (yearId) {
        const yearMax = sStats.attemptsPerYear.get(yearId) || 0;
        if (percentage > yearMax) sStats.attemptsPerYear.set(yearId, percentage);
      }
    });

    // Compile list of subjects with their averages
    let subjectsData = Array.from(enrolledSubjectIds).map(id => {
      const s = stats.get(id);
      return {
        id,
        name: subjectMap.get(id) || `Subject ${id}`,
        average: s ? s.totalScore / s.count : null, // null if 0 attempts
        maxScore: s ? s.maxScore : 0,
        attemptsCount: s ? s.count : 0,
        yearsStats: s ? s.attemptsPerYear : new Map()
      };
    });

    // Separate attended vs unattended
    const attended = subjectsData.filter(s => s.attemptsCount > 0).sort((a, b) => a.average - b.average);
    const unattended = subjectsData.filter(s => s.attemptsCount === 0);

    const cards = [];

    // --- CARD 1: Weakness 1 (Lowest average score)
    let card1Subject = null;
    let card1Msg = "Review your weakest topics";
    let card1Label = "Focus Area";
    
    if (attended.length > 0) {
      card1Subject = attended[0]; // Lowest average
      if (card1Subject.average >= 30) {
        card1Label = "Needs Improvement";
        card1Msg = "Practice makes perfect";
      }
    } else if (unattended.length > 0) {
      card1Subject = unattended[0];
      card1Label = "Start Practicing";
      card1Msg = "Take your first test";
    }

    if (card1Subject) {
      cards.push({
        id: "weakness1",
        subjectId: card1Subject.id,
        subject: card1Subject.name,
        label: card1Label,
        message: card1Msg,
        icon: "lucide:target",
        gradient: "from-orange-400/20 to-orange-600/10",
        accent: "#F97316",
        borderColor: "border-orange-200/60 dark:border-orange-800/40",
      });
    }

    // --- CARD 2: Weakness 2 (Rarely Attended / Unattended)
    let card2Subject = null;
    
    // Prioritize 0 attempts, then the fewest attempts (excluding card 1)
    const remainingForCard2 = subjectsData.filter(s => s.id !== card1Subject?.id).sort((a, b) => a.attemptsCount - b.attemptsCount);
    
    if (remainingForCard2.length > 0) {
      card2Subject = remainingForCard2[0];
    } else if (subjectsData.length > 0) {
      // Fallback if they only have 1 subject
      card2Subject = subjectsData[0];
    }

    if (card2Subject) {
      cards.push({
        id: "weakness2",
        subjectId: card2Subject.id,
        subject: card2Subject.name,
        label: card2Subject.attemptsCount === 0 ? "Not Attended" : "Rarely Attended",
        message: "Try more questions here",
        icon: "lucide:activity",
        gradient: "from-amber-400/20 to-amber-600/10",
        accent: "#F59E0B",
        borderColor: "border-amber-200/60 dark:border-amber-800/40",
      });
    }

    // --- CARD 3: Challenge (Highest average score)
    let card3Subject = null;
    let card3Year = null;

    // Sort attended descending by average
    const strongSubjects = [...attended].sort((a, b) => b.average - a.average);

    for (const strongSub of strongSubjects) {
      const availYears = subjectYears.get(strongSub.id) || [];
      // Find a year they haven't scored >= 80% on
      const unmasteredYear = availYears.find(y => {
        const yearMax = strongSub.yearsStats.get(String(y.id)) || 0;
        return yearMax < 80;
      });

      if (unmasteredYear) {
        card3Subject = strongSub;
        card3Year = unmasteredYear;
        break; // found our challenge!
      }
    }

    // Fallback if they mastered everything or have no attended subjects
    if (!card3Subject && subjectsData.length > 0) {
      card3Subject = strongSubjects.length > 0 ? strongSubjects[0] : subjectsData[0];
      const availYears = subjectYears.get(card3Subject.id) || [];
      card3Year = availYears.length > 0 ? availYears[0] : null;
    }

    if (card3Subject) {
      cards.push({
        id: "strength1",
        subjectId: card3Subject.id,
        subject: card3Subject.name,
        yearId: card3Year?.id, // Passing the specific year id!
        yearName: card3Year?.year,
        label: "Challenge",
        message: card3Year ? `Score 80%+ in ${card3Year.year}` : "Can you score 100%?",
        icon: "lucide:award",
        gradient: "from-emerald-400/20 to-emerald-600/10",
        accent: "#10B981",
        borderColor: "border-emerald-200/60 dark:border-emerald-800/40",
      });
    }

    return cards;
  }, [courses, attempts, availableExams, loading]);

  const handleExamClick = (exam) => {
    navigate("/student/exams", { 
      state: { 
        prefillSubjectId: exam.subjectId,
        prefillYearId: exam.yearId || null
      } 
    });
  };

  if (loading && !recommendedCards.length) return null;
  if (!recommendedCards.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
            Recommended Practice
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Customized for your performance</p>
        </div>
        <button className="text-[11px] font-black text-[#09314F] dark:text-blue-300 hover:underline flex items-center gap-1">
          View all <Icon icon="lucide:arrow-right" className="w-3 h-3" />
        </button>
      </div>

      {/* ── Cards row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recommendedCards.map((exam) => (
          <div
            key={exam.id}
            onClick={() => handleExamClick(exam)}
            className={`relative overflow-hidden rounded-2xl border ${exam.borderColor} bg-gradient-to-br ${exam.gradient} p-5 flex flex-col gap-4 cursor-pointer group hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md`}
          >
            {/* ── Icon ───────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner"
                style={{ backgroundColor: `${exam.accent}22`, color: exam.accent }}
              >
                <Icon icon={exam.icon} className="w-6 h-6" />
              </div>
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: `${exam.accent}20`, color: exam.accent }}
              >
                {exam.label}
              </span>
            </div>

            {/* ── Info ───────────────────────────────────────────────── */}
            <div>
              <h4 className="text-base font-black text-[#09314F] dark:text-white mb-1">
                {exam.subject}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-1">
                {exam.message}
              </p>
            </div>

            {/* ── CTA ────────────────────────────────────────────────── */}
            <button
              className="mt-auto flex items-center gap-1.5 text-[11px] font-black transition-all duration-200 opacity-80 group-hover:opacity-100"
              style={{ color: exam.accent }}
            >
              Start Practice
              <Icon icon="lucide:arrow-right" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
