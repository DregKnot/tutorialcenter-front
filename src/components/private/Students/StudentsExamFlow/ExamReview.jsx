import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

export default function ExamReview({ attemptId, onBack, hideHeader = false }) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("student_token") || "";

  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviewData = useCallback(async () => {
    if (!attemptId) return;
    setLoading(true);
    setError(null);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/students/exams/${attemptId}/review`,
        { headers }
      );

      console.log("Exam Review loaded:", response.data);
      const data = response.data;
      setAttempt(data?.attempt || null);
      setQuestions(data?.questions || []);
    } catch (err) {
      console.error("Failed to load attempt review data:", err);
      setError("Unable to load the exam review. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [attemptId, API_BASE_URL, token]);

  useEffect(() => {
    fetchReviewData();
  }, [fetchReviewData]);

  const cleanText = (htmlStr) => {
    if (!htmlStr) return "";
    return htmlStr.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  const cleanHtmlContent = (html) => {
    if (!html) return "";
    return html.replace(/&nbsp;/g, " ");
  };

  return (
    <div className="w-full animate-in fade-in duration-500 p-0 md:p-2">
      {/* Top Header Row */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 group text-gray-500 hover:text-[#09314F] dark:hover:text-white transition-colors"
          >
            <Icon
              icon="lucide:chevron-left"
              className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"
            />
            <span className="text-xs font-black uppercase tracking-widest">See My History</span>
          </button>

          <h2 className="text-xl md:text-2xl font-black text-[#09314F] dark:text-white uppercase tracking-tight">
            Exam Review
          </h2>
        </div>
      )}

      {/* Banner / Summary Card */}
      {attempt && (
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-[32px] border border-gray-100 dark:border-[#09314F] p-8 shadow-sm mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                <Icon icon="lucide:trophy" className="w-7 h-7 text-[#C5A97A]" />
              </div>
              <div>
                <h1 className="text-[#09314F] dark:text-white font-black text-xl uppercase tracking-tight">Practice Scorecard</h1>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Attempt Review Details</p>
              </div>
            </div>
            {/* Score & Percentage badge */}
            <div className="flex gap-4 items-center">
              <div className="bg-[#09314F] text-white px-5 py-3 rounded-xl font-black text-xs shadow-xl">
                Score: {attempt.score !== undefined ? attempt.score : attempt.correct_answers}
              </div>
              <div className="bg-[#C5A97A] text-white px-5 py-3 rounded-xl font-black text-xs shadow-xl">
                {attempt.percentage !== undefined ? Math.round(Number(attempt.percentage)) : 0}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-[#06243A] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mt-6 text-center">
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                Correct
              </span>
              <span className="text-base font-black text-green-500 block mt-1">
                {attempt.correct_answers}
              </span>
            </div>
            <div className="border-x border-gray-200/50 dark:border-gray-800/50">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                Wrong
              </span>
              <span className="text-base font-black text-red-500 block mt-1">
                {attempt.wrong_answers}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                Unanswered
              </span>
              <span className="text-base font-black text-gray-500 block mt-1">
                {(() => {
                  const total = questions.length;
                  const correct = Number(attempt.correct_answers || 0);
                  const wrong = Number(attempt.wrong_answers || 0);
                  const diff = total - (correct + wrong);
                  return diff > 0 ? diff : 0;
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Review Content List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-[#C5A97A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Review...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-white dark:bg-[#09314F]/40 border border-red-200 dark:border-red-950 rounded-3xl p-8 shadow-sm">
          <Icon icon="lucide:cloud-alert" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#09314F] dark:text-white mb-2">Review Error</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchReviewData}
            className="px-6 py-3 bg-[#09314F] text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#0a3d63] transition-all"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {questions.map((q, idx) => {
            const isCorrect = q.is_correct;
            return (
              <div 
                key={q.question_id || idx} 
                className="bg-white dark:bg-[#09314F]/40 rounded-[32px] p-6 border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" 
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Question Header Card */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-xs font-black text-[#09314F] dark:text-white uppercase tracking-[0.2em]">
                    Question {q.question_number || idx + 1}
                  </h3>
                  <div>
                    {isCorrect ? (
                      <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                        <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                        Correct
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                        <Icon icon="lucide:x-circle" className="w-3.5 h-3.5" />
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Group Content (If any) */}
                  {q.group && q.group.type !== 'none' && (
                    <div className="mb-8 p-6 bg-[#EDF0F3]/30 dark:bg-gray-900/40 rounded-[24px] border border-gray-200/50 dark:border-gray-700/30 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="px-2.5 py-1 bg-[#BB9E7F]/10 text-[#BB9E7F] text-[9px] font-black uppercase rounded-md tracking-wider">
                          Group: {cleanText(q.group.type).replace('_', ' ')}
                        </span>
                        {q.group.title && (
                          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            — {cleanText(q.group.title)}
                          </span>
                        )}
                      </div>
                      {q.group.image && (
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                          <img 
                            src={q.group.image.startsWith('http') ? q.group.image : `${API_BASE_URL}/storage/${q.group.image}`} 
                            alt="Group Diagram" 
                            className="w-full h-auto rounded-xl"
                          />
                        </div>
                      )}
                      <div 
                        className="text-[13px] text-[#09314F] dark:text-gray-300 leading-relaxed tracking-tight quill-content break-words whitespace-normal w-full overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: cleanHtmlContent(q.group.content) }}
                      />
                    </div>
                  )}

                  {/* Question Content */}
                  <div className="space-y-6">
                    <div 
                      className="text-[14px] text-[#09314F] dark:text-gray-200 leading-relaxed quill-content break-words whitespace-normal w-full overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: cleanHtmlContent(q.question) }}
                    />
                  </div>

                  {/* Options Grid (Matches Grid selection screen) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    {q.options?.map((opt) => {
                      // Use question-level student_answer/correct_answer for reliable mapping
                      const isOptionCorrect = opt.is_correct || (q.correct_answer && String(q.correct_answer.id) === String(opt.id));
                      const isOptionSelected = opt.selected || (q.student_answer && String(q.student_answer.id) === String(opt.id));

                      let optBorderColor = "border-gray-100 dark:border-[#09314F]";
                      let optBgColor = "bg-white dark:bg-[#09314F]/30 text-gray-700 dark:text-gray-200";

                      if (isOptionCorrect) {
                        // Correct option - always highlight green
                        optBgColor = "bg-green-500/10 dark:bg-green-950/20 text-green-600 dark:text-green-400";
                        optBorderColor = "border-green-500";
                      }
                      if (isOptionSelected && !isOptionCorrect) {
                        // User selected wrong option - highlight red
                        optBgColor = "bg-red-500/10 dark:bg-red-950/20 text-red-600 dark:text-red-400";
                        optBorderColor = "border-red-500";
                      }

                      return (
                        <div 
                          key={opt.id}
                          className={`flex items-center justify-between gap-4 px-6 py-4 rounded-2xl border-2 transition-all ${optBgColor} ${optBorderColor}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="font-black text-[12px] min-w-[20px]">{opt.label || 'A'}.</span>
                            <span className="text-[12px] font-black tracking-tight">
                              {opt.text || opt.option_text}
                            </span>
                          </div>

                          {/* Selection indicator icons */}
                          <div className="flex items-center gap-2">
                            {isOptionSelected && (
                              <span className={`px-2 py-0.5 text-[8px] font-black tracking-wider uppercase rounded-md ${
                                isOptionCorrect 
                                  ? 'bg-green-200/50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                  : 'bg-red-200/50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}>
                                Your Pick
                              </span>
                            )}
                            {isOptionCorrect ? (
                              <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-500" />
                            ) : isOptionSelected ? (
                              <Icon icon="lucide:x-circle" className="w-5 h-5 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Question Explanation if any */}
                  {q.explanation && (
                    <div className="mt-6 p-5 bg-[#C5A97A]/5 dark:bg-[#C5A97A]/10 rounded-[20px] border border-[#C5A97A]/20 space-y-2">
                      <p className="text-[10px] font-black text-[#C5A97A] uppercase tracking-widest flex items-center gap-1.5">
                        <Icon icon="lucide:info" className="w-3.5 h-3.5" />
                        Explanation
                      </p>
                      <div 
                        className="text-xs text-[#09314F] dark:text-gray-300 leading-relaxed quill-content break-words whitespace-normal w-full overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: cleanHtmlContent(q.explanation) }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
