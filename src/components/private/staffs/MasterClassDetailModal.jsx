import React, { useState } from "react";
import { Icon } from "@iconify/react";

// Helper date/time formatters
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? "pm" : "am";
  const h12 = hour % 12 || 12;
  return `${h12}:${m}${ampm}`;
};

const calculateEndTime = (startTimeStr, durationMinutes) => {
  if (!startTimeStr) return "13:00";
  const [hStr, mStr] = startTimeStr.split(":");
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const total = h * 60 + m + Number(durationMinutes || 60);
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
};

const getStaffName = (cls) => {
  if (!cls) return "Unassigned";
  const staff = cls.staffs?.[0];
  if (!staff) return "Unassigned";
  const s = staff.staff || staff;
  if (s.firstname && s.surname) return `${s.firstname} ${s.surname}`;
  return s.name || "Unassigned";
};

/**
 * MasterClassDetailModal
 * Displays detailed overview of a Master Class.
 * Class condition tags prominently indicate if a class is Active,
 * Proposed, Rescheduled, or Cancelled without cluttering the view
 * with inline action buttons (modifications are handled via Edit Master Class).
 */
export default function MasterClassDetailModal({
  cls,
  onClose,
  onEdit,
}) {
  const [classData] = useState(cls);

  if (!classData) return null;

  const currentStatus = String(classData.status || "active").toLowerCase().trim();
  const isCancelled = currentStatus === "cancelled" || currentStatus === "canceled";

  // Identify if this is explicitly a rescheduled class
  const isExplicitRescheduled = 
    currentStatus === "rescheduled" || 
    Boolean(classData.is_rescheduled) || 
    Boolean(classData.rescheduled_from) ||
    Boolean(classData.rescheduled_at) ||
    (typeof classData.description === "string" && /\[(?:Rescheduled|Proposed Schedule Note)/i.test(classData.description));

  // Both proposed and rescheduled share the tentative/proposed cohort nature
  const isProposed = currentStatus === "proposed" || currentStatus === "rescheduled" || isExplicitRescheduled;
  const isRescheduled = isExplicitRescheduled;
  const isActive = currentStatus === "active" && !isProposed && !isCancelled;
  const isInactive = currentStatus === "inactive";

  // Detailed tag label for badges
  const statusTagLabel = isCancelled
    ? "Cancelled"
    : isRescheduled
    ? "Rescheduled"
    : isProposed
    ? "Proposed"
    : isActive
    ? "Active"
    : isInactive
    ? "Inactive"
    : (classData.status ? classData.status.charAt(0).toUpperCase() + classData.status.slice(1) : "Active");

  const startDate = classData.start_date || classData.schedules?.[0]?.start_date;
  const endDate = classData.end_date || classData.schedules?.[0]?.end_date;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F2843]/50 dark:bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className={`relative bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] ${
        isProposed
          ? "border-2 border-[#C5A97A] dark:border-[#C5A97A] shadow-[0_0_35px_rgba(197,169,122,0.25)] shadow-2xl"
          : isCancelled
          ? "border-2 border-rose-400 dark:border-rose-900 shadow-2xl"
          : "border border-gray-100 dark:border-gray-700"
      }`}>
        
        {/* Modal Header */}
        <div className={`p-6 sm:p-8 text-white relative shrink-0 transition-all ${
          isProposed 
            ? "bg-gradient-to-r from-[#826435] via-[#5a4421] to-[#1e1e1e] border-b-2 border-[#C5A97A]/50" 
            : isCancelled 
            ? "bg-gradient-to-r from-rose-900 via-rose-800 to-[#1e1e1e]" 
            : "bg-[#0F2843]"
        }`}>
          <button 
            onClick={onClose}
            className={`absolute top-6 right-6 p-2 rounded-xl transition-all ${
              isProposed ? "text-[#fff5e1] hover:bg-white/10 hover:text-[#C5A97A]" : "hover:bg-white/10 text-white/80 hover:text-white"
            }`}
            title="Close"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0 ${
              isCancelled 
                ? "bg-gradient-to-tr from-rose-600 to-rose-800" 
                : isRescheduled || isProposed
                ? "bg-gradient-to-tr from-[#9c783e] to-[#C5A97A]" 
                : "bg-gradient-to-tr from-blue-500 to-indigo-500"
            }`}>
              {classData.title?.[0]?.toUpperCase() || "M"}
            </div>
            <div className="min-w-0 pr-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight leading-tight truncate ${
                  isCancelled 
                    ? "line-through text-rose-200" 
                    : isProposed 
                    ? "text-[#fff5e1]" 
                    : "text-white"
                }`}>
                  {classData.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
                  {classData.subject?.name || "Master Class Overview"}
                </span>
                <span className="text-white/40">•</span>
                
                {/* Header Condition Badge / Tag */}
                {isCancelled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40">
                    <Icon icon="mdi:close-circle" className="w-3 h-3" />
                    Cancelled
                  </span>
                )}
                {isRescheduled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C5A97A]/25 text-[#fcedc7] border border-[#C5A97A]/50">
                    <Icon icon="mdi:calendar-sync" className="w-3 h-3 text-[#C5A97A]" />
                    Rescheduled Class
                  </span>
                )}
                {isProposed && !isRescheduled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C5A97A]/25 text-[#fcedc7] border border-[#C5A97A]/50">
                    <Icon icon="mdi:calendar-clock" className="w-3 h-3 text-[#C5A97A]" />
                    Proposed Class
                  </span>
                )}
                {isActive && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                )}
                {!isCancelled && !isProposed && !isActive && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-500/20 text-gray-300 border border-gray-400/40 capitalize">
                    {currentStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Condition Alert Banners */}
        {isCancelled && (
          <div className="mx-6 sm:mx-8 mt-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
            <Icon icon="mdi:cancel" className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-200">
                Class Condition: Cancelled
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                This master class has been marked as cancelled. Upcoming classroom sessions are paused and student live classroom links are currently disabled.
              </p>
            </div>
          </div>
        )}

        {isRescheduled && (
          <div className="mx-6 sm:mx-8 mt-5 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-[#C5A97A]/50 flex items-start gap-3">
            <Icon icon="mdi:calendar-sync" className="w-5 h-5 text-amber-600 dark:text-[#C5A97A] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span>Class Condition: Rescheduled Class</span>
                <span className="px-2 py-0.5 text-[9px] bg-[#C5A97A]/30 text-amber-900 dark:text-[#fcedc7] rounded-md font-black uppercase">
                  Proposed Schedule
                </span>
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                This master class has been rescheduled and is liable to change. Students can still view and attend sessions.
              </p>
            </div>
          </div>
        )}

        {isProposed && !isRescheduled && (
          <div className="mx-6 sm:mx-8 mt-5 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-[#C5A97A]/50 flex items-start gap-3">
            <Icon icon="mdi:calendar-clock" className="w-5 h-5 text-amber-600 dark:text-[#C5A97A] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span>Class Condition: Proposed Class</span>
                <span className="px-2 py-0.5 text-[9px] bg-[#C5A97A]/30 text-amber-900 dark:text-[#fcedc7] rounded-md font-black uppercase">
                  Tentative
                </span>
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                This master class is proposed and liable to change. Students can still view and attend sessions until finalized.
              </p>
            </div>
          </div>
        )}

        {/* Modal Content Scrollable Area */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar dark:bg-gray-800 space-y-6 flex-1">
          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Instructor, Status/Condition Tag, Created, Description */}
            <div className="space-y-6">
              
              {/* Assigned Instructor */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Assigned Instructor
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[#0F2843] dark:text-white font-black text-xs shrink-0 shadow-xs">
                    {getStaffName(classData)[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {getStaffName(classData)}
                    </p>
                    <span className="text-[11px] text-gray-400 font-medium">Lead Faculty Tutor</span>
                  </div>
                </div>
              </div>

              {/* Class Condition & Status Tag Section */}
              <div className="bg-gray-50/70 dark:bg-gray-700/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-2">
                <h4 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Class Condition
                </h4>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Pill Tag */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs ${
                    isCancelled 
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60" 
                      : isRescheduled
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60" 
                      : isProposed 
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60" 
                      : isActive 
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}>
                    {isCancelled && <Icon icon="mdi:cancel" className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                    {isRescheduled && <Icon icon="mdi:calendar-sync" className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                    {isProposed && !isRescheduled && <Icon icon="mdi:calendar-clock" className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                    {isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                    <span>{statusTagLabel}</span>
                  </span>

                  {isProposed && (
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-[#C5A97A]">
                      {isRescheduled ? "• Rescheduled Session" : "• Liable to Change"}
                    </span>
                  )}
                </div>
              </div>

              {/* Created On */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Created On
                </h4>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Icon icon="mdi:calendar-clock" className="w-4 h-4 text-gray-400 shrink-0" />
                  <p className="text-sm font-semibold">{formatDate(classData.created_at)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Description
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {classData.description || "No description provided for this master class."}
                </p>
              </div>

            </div>

            {/* Right Column: Duration & Schedule, Class Link */}
            <div className="space-y-6">
              
              {/* Duration & Schedule Card */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Duration & Schedule
                </h4>
                <div className={`rounded-2xl p-5 space-y-3 border transition-all ${
                  isProposed 
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40" 
                    : isCancelled
                    ? "bg-rose-50/30 dark:bg-rose-950/15 border-rose-100 dark:border-rose-900/30 opacity-75"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700/60"
                }`}>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Start Date</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {formatDate(startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">End Date</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {formatDate(endDate)}
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block mb-2">Weekly Days:</span>
                    {classData.schedules && classData.schedules.length > 0 ? (
                      classData.schedules.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 text-xs">
                          <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {s.day_of_week}s
                          </span>
                          <span className={`font-bold ${
                            isCancelled 
                              ? "text-gray-400 line-through" 
                              : isProposed
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}>
                            {formatTime(s.start_time)} - {formatTime(s.end_time || calculateEndTime(s.start_time, s.duration_minutes))}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No weekly schedule set</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Class Link */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Class Link
                </h4>
                {isCancelled ? (
                  <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <Icon icon="mdi:video-off-outline" className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>Meeting link disabled (Class Cancelled)</span>
                  </div>
                ) : classData.class_link ? (
                  <a 
                    href={classData.class_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all group border border-blue-100 dark:border-blue-900/30"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon icon="mdi:link-variant" className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 truncate max-w-[200px]">
                        {classData.class_link}
                      </span>
                    </div>
                    <Icon icon="mdi:arrow-right" className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </a>
                ) : (
                  <p className="text-xs text-gray-400 italic">No meeting link provided</p>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/80 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700 shrink-0">
          {onEdit && (
            <button 
              type="button"
              onClick={() => {
                onClose();
                onEdit({
                  ...classData,
                  status: isProposed ? (isRescheduled ? "rescheduled" : "proposed") : classData.status,
                });
              }}
              className={`px-5 py-2.5 font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm flex items-center gap-2 ${
                isProposed
                  ? "bg-gradient-to-r from-[#8C5E24] via-[#A87431] to-[#7B4E1A] hover:from-[#9E6C2C] hover:to-[#8E5A1E] text-white shadow-[#8C5E24]/30 ring-1 ring-[#C5A97A]"
                  : "bg-[#0F2843] dark:bg-blue-600 hover:bg-[#1a3d60] text-white"
              }`}
            >
              <Icon icon="mdi:pencil" className="w-3.5 h-3.5" />
              <span>Edit Master Class</span>
            </button>
          )}
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
