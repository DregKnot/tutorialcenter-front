import React, { useState } from "react";
import { Icon } from "@iconify/react";

const calculateTimeDiff = (start, end) => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffInMs = endDate - startDate;
  if (diffInMs <= 0 || isNaN(diffInMs)) return null;

  const diffInSecs = Math.floor(diffInMs / 1000);
  const mins = Math.floor(diffInSecs / 60);
  const secs = diffInSecs % 60;

  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const getAttemptStats = (attempt) => {
  const scoreVal = attempt.score !== undefined ? Number(attempt.score) : (attempt.correct_answers !== undefined ? Number(attempt.correct_answers) : 0);
  const totalQ = attempt.total_questions !== undefined ? Number(attempt.total_questions) : (attempt.questions_count !== undefined ? Number(attempt.questions_count) : 0);
  
  const percentage = attempt.percentage !== undefined
    ? Math.round(Number(attempt.percentage))
    : (totalQ ? Math.round((scoreVal / totalQ) * 100) : 0);

  const correct = attempt.correct_answers !== undefined
    ? Number(attempt.correct_answers)
    : (attempt.correct_answers_count !== undefined ? Number(attempt.correct_answers_count) : (attempt.correct !== undefined ? Number(attempt.correct) : scoreVal));

  const wrong = attempt.wrong_answers !== undefined
    ? Number(attempt.wrong_answers)
    : (attempt.wrong_answers_count !== undefined ? Number(attempt.wrong_answers_count) : (attempt.wrong !== undefined ? Number(attempt.wrong) : 0));

  const subjectName = 
    attempt.subject?.name || 
    attempt.exam_year?.subject?.name || 
    attempt.examYear?.subject?.name ||
    attempt.subject_name || 
    "General Subject";

  const yearValue = 
    attempt.year || 
    attempt.exam_year?.year || 
    attempt.examYear?.year ||
    attempt.exam_year_name || 
    "N/A";

  return { percentage, correct, wrong, totalQ, subjectName, yearValue, score: scoreVal };
};

export default function ExamMerits({ attempt, allAttempts, onClose }) {
  const [showHistory, setShowHistory] = useState(false);

  const stats = getAttemptStats(attempt);
  
  // 1. Current Time Spent
  const startStamp = attempt.started_at || attempt.created_at;
  const endStamp = attempt.submitted_at || attempt.updated_at || attempt.ended_at;
  const timeSpentStr = calculateTimeDiff(startStamp, endStamp);
  
  // Calculate average time per question
  let avgTimePerQuestion = "N/A";
  const totalAnswered = stats.correct + stats.wrong;
  
  if (startStamp && endStamp && totalAnswered > 0) {
    const diffInMs = new Date(endStamp) - new Date(startStamp);
    if (diffInMs > 0) {
      const avgMs = diffInMs / totalAnswered;
      const avgSecs = Math.floor(avgMs / 1000);
      const mins = Math.floor(avgSecs / 60);
      const secs = avgSecs % 60;
      avgTimePerQuestion = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
  }

  // Find all attempts for the same subject & year
  const matchingHistory = allAttempts.filter(a => {
    if (a.id === attempt.id) return false; 
    const aStats = getAttemptStats(a);
    return aStats.subjectName === stats.subjectName && String(aStats.yearValue) === String(stats.yearValue);
  });

  // Calculate fastest time across all matching history
  let fastestTimeMs = Infinity;
  let fastestTimeStr = "N/A";
  
  const allMatching = [attempt, ...matchingHistory];
  allMatching.forEach(a => {
    const s = a.started_at || a.created_at;
    const e = a.submitted_at || a.updated_at || a.ended_at;
    if (s && e) {
      const diff = new Date(e) - new Date(s);
      if (diff > 0 && diff < fastestTimeMs) {
        fastestTimeMs = diff;
      }
    }
  });

  if (fastestTimeMs !== Infinity) {
    const diffInSecs = Math.floor(fastestTimeMs / 1000);
    const mins = Math.floor(diffInSecs / 60);
    const secs = diffInSecs % 60;
    fastestTimeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in p-4">
      <div 
        className="bg-white dark:bg-[#06243A] w-full max-w-lg rounded-[32px] p-6 md:p-8 shadow-2xl relative border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Icon icon="lucide:x" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <h2 className="text-xl md:text-2xl font-black text-[#09314F] dark:text-white mb-1 uppercase tracking-tight">
          Exam Merits
        </h2>
        <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-widest">
          {stats.subjectName} - {stats.yearValue}
        </p>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <span className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              <Icon icon="lucide:timer" className="w-3.5 h-3.5 text-blue-500" />
              Time Spent
            </span>
            <span className="text-lg md:text-xl font-black text-[#09314F] dark:text-white">
              {timeSpentStr || "N/A"}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <span className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              <Icon icon="lucide:zap" className="w-3.5 h-3.5 text-[#C5A97A]" />
              Avg Time/Question
            </span>
            <span className="text-lg md:text-xl font-black text-[#09314F] dark:text-white">
              {avgTimePerQuestion}
            </span>
          </div>
        </div>

        {/* View More Button */}
        {!showHistory && matchingHistory.length > 0 && (
          <button 
            onClick={() => setShowHistory(true)}
            className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-xs md:text-sm font-black text-gray-500 hover:text-[#09314F] dark:hover:text-white hover:border-[#09314F] dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <Icon icon="lucide:history" className="w-4 h-4" />
            View Historical Matches ({matchingHistory.length})
          </button>
        )}

        {!showHistory && matchingHistory.length === 0 && (
          <div className="w-full py-4 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 text-center uppercase tracking-widest">
            No previous history for this exam
          </div>
        )}

        {/* Historical List */}
        {showHistory && (
          <div className="mt-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] md:text-xs font-black text-[#09314F] dark:text-white uppercase tracking-widest">
                Historical Attempts
              </h3>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                Fastest: {fastestTimeStr}
              </span>
            </div>

            <div className="max-h-[200px] md:max-h-[250px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {allMatching.map((h, i) => {
                const hStats = getAttemptStats(h);
                const s = h.started_at || h.created_at;
                const e = h.submitted_at || h.updated_at || h.ended_at;
                const time = calculateTimeDiff(s, e);
                const isCurrent = h.id === attempt.id;
                
                // Check if this specific attempt is the fastest
                let isFastest = false;
                if (s && e) {
                  const diff = new Date(e) - new Date(s);
                  if (diff === fastestTimeMs) isFastest = true;
                }

                return (
                  <div 
                    key={h.id || i}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isCurrent 
                        ? 'border-[#C5A97A] bg-[#C5A97A]/5' 
                        : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-[#09314F] dark:text-white">
                        {formatDate(s)}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                        Score: {hStats.percentage}%
                        {isCurrent && <span className="text-[#C5A97A] ml-1 font-bold">(Current)</span>}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`block text-xs font-black ${isFastest ? 'text-green-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {time || "N/A"}
                      </span>
                      {isFastest && (
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-wider block mt-0.5">
                          Fastest
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
