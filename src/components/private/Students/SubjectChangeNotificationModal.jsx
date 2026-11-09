import React, { useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

export default function SubjectChangeNotificationModal({ change, onClose, onAcknowledge, token, API_BASE_URL }) {
  const [loading, setLoading] = useState(false);

  if (!change) return null;

  const actionType = change.action_type || (change.old_subject_id && !change.new_subject_id ? "remove" : (!change.old_subject_id && change.new_subject_id ? "add" : "swap"));
  const courseTitle = change.course_enrollment?.course?.title || change.courseEnrollment?.course?.title || change.course_title || "";
  const rawOldName = change.old_subject?.name || change.oldSubject?.name || "Previous Subject";
  const rawNewName = change.new_subject?.name || change.newSubject?.name || "New Subject";

  const oldSubjectName = courseTitle ? `${courseTitle} — ${rawOldName}` : rawOldName;
  const newSubjectName = courseTitle ? `${courseTitle} — ${rawNewName}` : rawNewName;
  const adminName = change.changed_by_staff 
    ? `${change.changed_by_staff.firstname || ''} ${change.changed_by_staff.surname || ''}`.trim()
    : (change.changedByStaff 
        ? `${change.changedByStaff.firstname || ''} ${change.changedByStaff.surname || ''}`.trim()
        : "Administrator");

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/subject-changes/${change.id}/acknowledge`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onAcknowledge) onAcknowledge(change.id);
      if (onClose) onClose();
    } catch (err) {
      console.error("Failed to acknowledge subject change:", err);
      // Even if network fails, dismiss locally to not trap the student
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  const getHeaderInfo = () => {
    if (actionType === "add") {
      return {
        badgeText: "Subject Added",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        icon: "heroicons:plus-circle-20-solid",
        iconWrapClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        title: courseTitle ? `${courseTitle} — New Subject Enrolled` : "New Subject Enrolled",
        subtitle: courseTitle 
          ? `An administrator has added a new subject to your enrollment under ${courseTitle}.` 
          : "An administrator has added a new subject to your enrollment.",
        btnClass: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/20",
      };
    }
    if (actionType === "remove") {
      return {
        badgeText: "Subject Removed",
        badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        icon: "heroicons:minus-circle-20-solid",
        iconWrapClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        title: courseTitle ? `${courseTitle} — Subject Removed` : "Subject Removed from Enrollment",
        subtitle: courseTitle 
          ? `An administrator has removed a subject from your enrollment under ${courseTitle}.` 
          : "An administrator has removed a subject from your enrollment.",
        btnClass: "from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/20",
      };
    }
    return {
      badgeText: "Official Notice",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: "heroicons:arrow-path-rounded-square-20-solid",
      iconWrapClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      title: courseTitle ? `${courseTitle} — Subject Updated` : "Subject Combination Updated",
      subtitle: courseTitle 
        ? `An administrator has updated your enrolled subjects for ${courseTitle}.` 
        : "An administrator has updated your enrolled subjects.",
      btnClass: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20",
    };
  };

  const header = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B1E32] dark:bg-[#0B1E32] border border-blue-900/40 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white space-y-6">
        
        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div className={`w-13 h-13 p-3.5 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${header.iconWrapClass}`}>
            <Icon icon={header.icon} className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${header.badgeClass}`}>
                {header.badgeText}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
              {header.title}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {header.subtitle}
            </p>
          </div>
        </div>

        {/* Action Content Box */}
        {actionType === "swap" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#071524] rounded-2xl border border-gray-800">
            {/* Old Subject (Removed) */}
            <div className="p-3.5 bg-rose-950/30 border border-rose-900/40 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-400">
                <Icon icon="heroicons:minus-circle-solid" className="w-3.5 h-3.5" />
                <span>Subject Removed</span>
              </div>
              <p className="text-sm font-extrabold text-gray-300 line-through decoration-rose-500 decoration-2">
                {oldSubjectName}
              </p>
              <p className="text-[10px] text-gray-400">Disenrolled from past sessions</p>
            </div>

            {/* New Subject (Added) */}
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                <Icon icon="heroicons:check-circle-solid" className="w-3.5 h-3.5" />
                <span>Subject Added</span>
              </div>
              <p className="text-sm font-extrabold text-emerald-300">
                {newSubjectName}
              </p>
              <p className="text-[10px] text-gray-400">Classes & schedule active now</p>
            </div>
          </div>
        )}

        {actionType === "add" && (
          <div className="p-4 bg-[#071524] rounded-2xl border border-gray-800">
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                <Icon icon="heroicons:check-circle-solid" className="w-3.5 h-3.5" />
                <span>Newly Enrolled Subject</span>
              </div>
              <p className="text-base font-extrabold text-emerald-300">
                {newSubjectName}
              </p>
              <p className="text-[11px] text-gray-400">
                Live sessions, timetable, and study materials are active immediately.
              </p>
            </div>
          </div>
        )}

        {actionType === "remove" && (
          <div className="p-4 bg-[#071524] rounded-2xl border border-gray-800">
            <div className="p-3.5 bg-rose-950/30 border border-rose-900/40 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-400">
                <Icon icon="heroicons:minus-circle-solid" className="w-3.5 h-3.5" />
                <span>Subject Disenrolled</span>
              </div>
              <p className="text-base font-extrabold text-gray-300 line-through decoration-rose-500 decoration-2">
                {oldSubjectName}
              </p>
              <p className="text-[11px] text-gray-400">
                You have been disenrolled from upcoming sessions and unsubmitted assessments for this subject. Completed assessments and past grades remain on your permanent record.
              </p>
            </div>
          </div>
        )}

        {/* Administration Reason Box */}
        <div className="p-4 bg-[#071524] rounded-2xl border border-gray-800 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-amber-400">
            <Icon icon="heroicons:chat-bubble-bottom-center-text-solid" className="w-4 h-4" />
            <span>Reason from Administration</span>
            {adminName && (
              <span className="text-gray-400 font-normal lowercase tracking-normal">
                (by {adminName})
              </span>
            )}
          </div>
          <div className="pl-3 border-l-2 border-amber-500/50 py-1">
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic">
              "{change.reason || "Change requested by student."}"
            </p>
          </div>
        </div>

        {/* Notice Info */}
        <p className="text-[11px] text-gray-400 leading-normal">
          <span className="font-bold text-gray-300">Note:</span> Your class schedules, calendar, and learning modules have been automatically synchronized with this change.
        </p>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={handleAcknowledge}
            disabled={loading}
            className={`w-full py-3.5 px-6 bg-gradient-to-r ${header.btnClass} text-[#071524] font-black text-sm uppercase tracking-wider rounded-xl shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            <Icon icon="heroicons:check-badge-solid" className="w-5 h-5" />
            {loading ? "Confirming..." : "I Understand & Acknowledge"}
          </button>
        </div>

      </div>
    </div>
  );
}
