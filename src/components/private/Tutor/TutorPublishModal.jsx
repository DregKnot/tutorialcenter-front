import React, { useState } from "react";
import axios from "axios";
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  BellAlertIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function TutorPublishModal({
  isOpen,
  onClose,
  assessment,
  onSuccess
}) {
  const [opensAt, setOpensAt] = useState(() => {
    // Default to current date/time in local format YYYY-MM-DDTHH:mm
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const [dueAt, setDueAt] = useState(() => {
    // Default to 3 days from now at 23:59
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !assessment) return null;

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!dueAt) {
      setError("Please specify a submission due date and time.");
      return;
    }

    if (opensAt && new Date(dueAt) <= new Date(opensAt)) {
      setError("Due date must be after the start/opening date.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format timestamps as YYYY-MM-DD HH:mm:ss for backend
      const formatToSql = (isoStr) => {
        if (!isoStr) return null;
        const d = new Date(isoStr);
        return d.toISOString().slice(0, 19).replace("T", " ");
      };

      const payload = {
        opens_at: formatToSql(opensAt),
        due_at: formatToSql(dueAt)
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/tutor/assessments/${assessment.id}/publish`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        }
      );

      if (onSuccess) {
        onSuccess(res.data?.assessment || assessment);
      }
      onClose();
    } catch (err) {
      console.error("Publish error:", err);
      const msg =
        err.response?.data?.errors?.due_at?.[0] ||
        err.response?.data?.errors?.opens_at?.[0] ||
        err.response?.data?.message ||
        "Failed to publish assessment. Please verify the dates and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#09314F] rounded-[28px] sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-[#0F2843] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#C5A97A]">
              <PaperAirplaneIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Publish Assessment</h2>
              <p className="text-xs text-gray-300 font-medium truncate max-w-[260px]">
                {assessment.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePublish} className="p-6 space-y-6">
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
              <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Assessment Summary Box */}
          <div className="p-4 rounded-2xl bg-[#0F2843]/5 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Subject / Class:</span>
              <span className="font-bold text-[#0F2843] dark:text-[#C5A97A]">
                {assessment.class?.title || assessment.class?.subject?.name || "Masterclass"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Total Questions / Marks:</span>
              <span className="font-bold text-[#0F2843] dark:text-white">
                {assessment.questions?.length || 0} Questions ({assessment.total_marks || 0} Marks)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Passing Standard:</span>
              <span className="font-bold text-[#0F2843] dark:text-white">
                {assessment.pass_mark || 50}%
              </span>
            </div>
          </div>

          {/* Date Picker & Duration Fields */}
          <div className="space-y-5">
            {/* Quick Duration in Days & Hours */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-[#0F2843] dark:text-[#C5A97A]" />
                  <span>Due Duration (Days & Hours)</span>
                </label>
                <span className="text-[11px] text-gray-400 font-medium">Quick Presets</span>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "2 Days", days: 2, hours: 0 },
                  { label: "3 Days", days: 3, hours: 0 },
                  { label: "5 Days", days: 5, hours: 0 },
                  { label: "1 Week", days: 7, hours: 0 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + preset.days);
                      d.setHours(d.getHours() + preset.hours, 59, 0, 0);
                      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                      setDueAt(d.toISOString().slice(0, 16));
                    }}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 hover:border-[#0F2843] dark:hover:border-[#C5A97A] hover:text-[#0F2843] dark:hover:text-[#C5A97A] transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Calculated Deadline Display */}
              {dueAt && (
                <div className="p-2.5 rounded-xl bg-[#0F2843]/5 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 text-xs font-semibold text-[#0F2843] dark:text-[#C5A97A] flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Deadline:{" "}
                    {new Date(dueAt).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Exact Datetime Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span>Opens At (Start Window)</span>
                </label>
                <input
                  type="datetime-local"
                  value={opensAt}
                  onChange={(e) => setOpensAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-red-500" />
                  <span>Due At (Exact Cutoff) <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0F2843] dark:focus:ring-[#C5A97A] outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Student Notification Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs">
            <BellAlertIcon className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Publishing will immediately send in-app and email notifications to all students enrolled in this subject.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-black text-white bg-[#0F2843] hover:bg-[#163a5f] dark:bg-[#C5A97A] dark:hover:bg-[#d6bc8f] dark:text-[#0F2843] rounded-2xl shadow-lg shadow-[#0F2843]/20 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>Publish & Notify Students</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
