import React from "react";
import {
  XMarkIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import MathRenderer from "../../common/MathRenderer.jsx";

export default function StudentAssessmentResultModal({
  isOpen,
  onClose,
  assessmentData // Full assessment detail object with questions, submission, answers
}) {
  if (!isOpen || !assessmentData) return null;

  const assessment = assessmentData.assessment || assessmentData;
  const submission = assessmentData.submission || {};
  const questions = assessmentData.questions || [];
  const answers = assessmentData.answers || [];

  const answersMap = new Map();
  answers.forEach((ans) => {
    answersMap.set(String(ans.question_id), ans);
  });

  const isGraded = submission.status === "graded";
  const isSubmitted = submission.status === "submitted";
  const score = submission.score || 0;
  const totalMarks = submission.total_marks || assessment.total_marks || 0;
  const percentage = Math.round(submission.percentage || (totalMarks > 0 ? (score / totalMarks) * 100 : 0));
  const passMark = assessment.pass_mark || 50;
  const isPassed = percentage >= passMark;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl bg-white dark:bg-[#09314F] rounded-none sm:rounded-[36px] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden my-auto flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-white/10 bg-[#0F2843] text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#C5A97A] flex-shrink-0">
              <TrophyIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{assessment.title}</h2>
              <p className="text-xs text-gray-300 font-medium">
                Assessment Results & Review
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* SCORE HERO BANNER */}
          <div
            className={`p-6 rounded-3xl border text-center space-y-3 ${
              isGraded
                ? isPassed
                  ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-300 dark:border-emerald-600/40"
                  : "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-300 dark:border-red-600/40"
                : "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-600/40"
            }`}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white dark:bg-black/20 shadow-sm">
              {isGraded ? (
                isPassed ? (
                  <span className="text-emerald-600 dark:text-emerald-400">🎉 Passed Assessment</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Needs Improvement</span>
                )
              ) : isSubmitted ? (
                <span className="text-amber-600 dark:text-amber-400">⏳ Essays Pending Tutor Grading</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-300">Submitted</span>
              )}
            </div>

            <div className="text-4xl sm:text-5xl font-black text-[#0F2843] dark:text-white tracking-tight">
              {score} <span className="text-2xl text-gray-400 font-normal">/ {totalMarks} pts</span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">
              Overall Percentage: <span className="font-bold text-gray-900 dark:text-white">{percentage}%</span> • Pass Standard: {passMark}%
              {isSubmitted && !isGraded && (
                <span className="block text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  (Score currently reflects auto-graded MCQs. Final grade will update once tutor grades written essay questions.)
                </span>
              )}
            </p>
          </div>

          {/* QUESTIONS & ANSWERS REVIEW */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-[#0F2843] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-[#C5A97A]" />
              <span>Questions & Answers Review ({questions.length})</span>
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const ans = answersMap.get(String(q.id)) || {};
                const isMcq = q.type === "mcq";

                return (
                  <div
                    key={q.id || idx}
                    className="p-5 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#0F2843] dark:text-[#C5A97A]">
                            Question #{idx + 1}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isMcq
                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                            }`}
                          >
                            {isMcq ? "MCQ" : "Essay"}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          <MathRenderer text={q.question} />
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-[#0F2843] dark:text-[#C5A97A]">
                          {ans.marks_awarded !== null && ans.marks_awarded !== undefined ? ans.marks_awarded : (ans.is_correct ? q.marks : 0)} / {q.marks} pts
                        </span>
                      </div>
                    </div>

                    {/* Student Answer */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">Your Answer:</span>
                      {isMcq ? (
                        <div
                          className={`p-3 rounded-2xl border flex items-center justify-between font-bold ${
                            ans.is_correct
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                              : "bg-red-50 dark:bg-red-950/30 border-red-300 text-red-800 dark:text-red-200"
                          }`}
                        >
                          <span className="flex-1">
                            <MathRenderer text={ans.option?.option_text || (q.options?.find((o) => o.id === ans.question_option_id)?.option_text) || "No Option Chosen"} />
                          </span>
                          <span className="text-[10px] font-black uppercase flex-shrink-0 ml-2">
                            {ans.is_correct ? "✓ Correct" : "✗ Incorrect"}
                          </span>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {ans.answer || <span className="italic text-gray-400">No written answer provided.</span>}
                        </div>
                      )}
                    </div>

                    {/* Tutor Feedback Note */}
                    {ans.feedback && (
                      <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <span className="font-bold">Tutor Feedback: </span>
                          <span>{ans.feedback}</span>
                        </div>
                      </div>
                    )}

                    {/* Model Explanation (if graded or revealed) */}
                    {q.explanation && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 text-xs text-amber-900 dark:text-amber-300">
                        <span className="font-bold">Model Explanation: </span>
                        <MathRenderer text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CLOSE FOOTER */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-2xl bg-[#0F2843] text-white dark:bg-[#C5A97A] dark:text-[#0F2843] text-xs font-black shadow-lg transition"
            >
              Close Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
