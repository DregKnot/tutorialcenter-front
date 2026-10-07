import React from "react";
import { Icon } from "@iconify/react";

/**
 * Helpers to check session status
 */
export const isSessionCancelled = (session) => {
  if (!session) return false;
  if (session.is_cancelled === true) return true;
  const status = String(session.status || session.class?.status || "").toLowerCase().trim();
  return status === "cancelled" || status === "canceled";
};

export const isSessionProposed = (session) => {
  if (!session) return false;
  if (session.is_proposed === true) return true;
  const status = String(session.status || session.class?.status || "").toLowerCase().trim();
  return status === "proposed" || status === "rescheduled";
};

export const isSessionRescheduled = (session) => {
  if (!session) return false;
  if (session.is_rescheduled === true) return true;
  const status = String(session.status || session.class?.status || "").toLowerCase().trim();
  return status === "rescheduled" || status === "proposed";
};

export const hasSessionRecording = (session) => {
  if (!session) return false;
  const status = String(session.status || "").toLowerCase().trim();
  const link = session.recording_link || session.recording_url || session.recorded_url || session.video_url;
  return status === "recorded" || (typeof link === "string" && link.trim().length > 0);
};

/**
 * Returns dynamic color classes for calendar cells (Red for Cancelled, Yellow for Proposed, Default for Active)
 */
export const getSessionCellStyles = (session, defaultColors = null) => {
  if (isSessionCancelled(session)) {
    return {
      bg: "bg-rose-50/95 dark:bg-rose-950/40",
      border: "border-rose-300 dark:border-rose-900/60",
      text: "text-rose-800 dark:text-rose-200",
      badge: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200",
      isCancelled: true,
      isProposed: false,
    };
  }
  if (isSessionProposed(session)) {
    return {
      bg: "bg-amber-50/95 dark:bg-amber-950/40",
      border: "border-amber-300 dark:border-amber-800/70",
      text: "text-amber-900 dark:text-amber-200",
      badge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200",
      isCancelled: false,
      isProposed: true,
    };
  }
  return {
    bg: defaultColors?.bg || "bg-blue-50/80 dark:bg-blue-950/30",
    border: defaultColors?.border || "border-blue-200 dark:border-blue-800/50",
    text: defaultColors?.text || "text-blue-800 dark:text-blue-200",
    badge: defaultColors?.border || "bg-blue-100 text-blue-700",
    isCancelled: false,
    isProposed: false,
  };
};

/**
 * Universal Class Session Status Badge
 * Handles: Cancelled, Proposed, Rescheduled, Recording Uploaded, Scheduled, Completed
 */
export default function ClassSessionStatusBadge({
  session,
  status: propStatus,
  hasRecording: propHasRecording,
  size = "md",
  className = "",
  showScheduled = false,
}) {
  const isCancelled = propStatus ? (propStatus === "cancelled" || propStatus === "canceled") : isSessionCancelled(session);
  const isProposed = propStatus ? (propStatus === "proposed") : isSessionProposed(session);
  const isRescheduled = propStatus ? (propStatus === "rescheduled") : isSessionRescheduled(session);
  const hasRecording = propHasRecording !== undefined ? propHasRecording : hasSessionRecording(session);

  const shouldShowScheduled = showScheduled && !isCancelled && !isProposed && !isRescheduled && !hasRecording;

  if (!isCancelled && !isProposed && !isRescheduled && !hasRecording && !shouldShowScheduled) {
    return null;
  }

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[9px] gap-1",
    sm: "px-2.5 py-0.5 text-[10px] gap-1",
    md: "px-3 py-1 text-[11px] gap-1.5",
    lg: "px-3.5 py-1.5 text-xs gap-2",
  }[size] || "px-2.5 py-0.5 text-[10px] gap-1";

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size] || "w-3.5 h-3.5";

  return (
    <div className={`inline-flex items-center flex-wrap gap-1.5 ${className}`}>
      {isCancelled && (
        <span
          className={`inline-flex items-center font-black uppercase tracking-wider rounded-md bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 shadow-xs ${sizeClasses}`}
          title="This session has been cancelled"
        >
          <Icon icon="lucide:x-circle" className={`${iconSizes} text-rose-600 dark:text-rose-400 shrink-0`} />
          <span>Cancelled</span>
        </span>
      )}

      {isProposed && !isCancelled && (
        <span
          className={`inline-flex items-center font-black uppercase tracking-wider rounded-md bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60 shadow-xs ${sizeClasses}`}
          title="Session is proposed"
        >
          <Icon icon="lucide:clock" className={`${iconSizes} text-amber-600 dark:text-amber-400 shrink-0`} />
          <span>Proposed</span>
        </span>
      )}

      {isRescheduled && !isCancelled && !isProposed && (
        <span
          className={`inline-flex items-center font-black uppercase tracking-wider rounded-md bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60 shadow-xs ${sizeClasses}`}
          title="Session has been rescheduled to an updated date/time"
        >
          <Icon icon="lucide:calendar-clock" className={`${iconSizes} text-amber-600 dark:text-amber-400 shrink-0`} />
          <span>Rescheduled</span>
        </span>
      )}

      {hasRecording && (
        <span
          className={`inline-flex items-center font-black uppercase tracking-wider rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60 shadow-xs ${sizeClasses}`}
          title="Session recording has been uploaded and is ready to watch"
        >
          <Icon icon="lucide:video" className={`${iconSizes} text-purple-600 dark:text-purple-400 shrink-0`} />
          <span>Recording Uploaded</span>
        </span>
      )}

      {showScheduled && !isCancelled && !isRescheduled && !hasRecording && (
        <span
          className={`inline-flex items-center font-black uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 shadow-xs ${sizeClasses}`}
        >
          <Icon icon="lucide:calendar-check" className={`${iconSizes} text-emerald-600 dark:text-emerald-400 shrink-0`} />
          <span>Scheduled</span>
        </span>
      )}
    </div>
  );
}
