import React, { useState, useEffect, useRef } from "react";
import { CalendarIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

/**
 * Validates whether a day, month, and year form a valid date in the past.
 */
const isValidBirthDate = (day, month, year) => {
  const currentYear = new Date().getFullYear();
  if (year < 1910 || year > currentYear) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  const dateObj = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dateObj < today;
};

/**
 * Converts standard ISO date (YYYY-MM-DD) to display format (DD/MM/YYYY).
 */
const isoToDisplay = (isoStr) => {
  if (!isoStr || typeof isoStr !== "string") return "";
  const parts = isoStr.split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};

/**
 * Formats raw digits with automated slashes:
 * 2 digits -> DD/
 * 4 digits -> DD/MM/
 * 8 digits -> DD/MM/YYYY
 */
const formatWithSlashes = (digits) => {
  if (!digits) return "";
  if (digits.length <= 2) {
    return digits.length === 2 ? `${digits}/` : digits;
  }
  if (digits.length <= 4) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2);
    return digits.length === 4 ? `${day}/${month}/` : `${day}/${month}`;
  }
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return `${day}/${month}/${year}`;
};

export default function DateOfBirthPicker({
  name = "date_of_birth",
  value = "", // Expected in canonical YYYY-MM-DD format
  onChange,
  error = null,
  onFocus,
  onBlur,
  required = true,
  label = "Date of Birth",
}) {
  const [activeMode, setActiveMode] = useState("manual"); // 'manual' | 'calendar'
  const [manualText, setManualText] = useState(() => isoToDisplay(value));
  const [localError, setLocalError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const textInputRef = useRef(null);
  const calendarInputRef = useRef(null);
  const containerRef = useRef(null);

  // Sync external value (e.g. from parent/localStorage) to manual input display
  useEffect(() => {
    if (value) {
      const formatted = isoToDisplay(value);
      setManualText((prev) => (formatted && formatted !== prev ? formatted : prev));
    } else {
      setManualText((prev) => (prev.length === 10 ? "" : prev));
    }
  }, [value]);

  // Today's date in YYYY-MM-DD for native picker max limit
  const todayIso = new Date().toISOString().split("T")[0];

  // Helper to emit standard synthetic event to parent form
  const propagateChange = (isoVal) => {
    if (typeof onChange === "function") {
      onChange({
        target: {
          name,
          value: isoVal,
        },
      });
    }
  };

  // Validate manual input text and propagate when 8 digits are reached
  const validateAndSync = (text) => {
    const digits = text.replace(/\D/g, "");
    if (digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year = parseInt(digits.slice(4, 8), 10);

      if (isValidBirthDate(day, month, year)) {
        setLocalError("");
        const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        propagateChange(iso);
      } else {
        const currentYear = new Date().getFullYear();
        if (month < 1 || month > 12) {
          setLocalError("Invalid month (01-12)");
        } else if (year > currentYear) {
          setLocalError("Date cannot be in the future");
        } else if (year < 1910) {
          setLocalError("Please enter a valid year");
        } else {
          setLocalError("Invalid date of birth");
        }
        propagateChange("");
      }
    } else {
      setLocalError("");
      if (value) {
        propagateChange("");
      }
    }
  };

  // Handle typing numbers with automated slashes
  const handleManualChange = (e) => {
    const inputVal = e.target.value;
    const digits = inputVal.replace(/\D/g, "").slice(0, 8);
    const formatted = formatWithSlashes(digits);
    setManualText(formatted);
    validateAndSync(formatted);
  };

  // Handle backspace gracefully over slashes
  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      const input = e.target;
      const selStart = input.selectionStart;
      const selEnd = input.selectionEnd;

      // When cursor is right after an automated slash (index 3 or index 6)
      if (selStart === selEnd && (selStart === 3 || selStart === 6)) {
        e.preventDefault();
        // Remove both the slash and the preceding digit
        const newVal = manualText.slice(0, selStart - 2) + manualText.slice(selStart);
        const digits = newVal.replace(/\D/g, "");

        let formatted = "";
        if (digits.length <= 2) {
          formatted = digits;
        } else if (digits.length <= 4) {
          formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        } else {
          formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
        }

        setManualText(formatted);
        validateAndSync(formatted);

        setTimeout(() => {
          if (input) {
            const newPos = Math.max(0, selStart - 2);
            input.setSelectionRange(newPos, newPos);
          }
        }, 0);
      }
    }
  };

  // Handle calendar picker selection
  const handleCalendarChange = (e) => {
    const selectedIso = e.target.value;
    if (selectedIso) {
      setLocalError("");
      const formatted = isoToDisplay(selectedIso);
      setManualText(formatted);
      propagateChange(selectedIso);
    }
  };

  // Mode switchers
  const switchToManual = () => {
    setActiveMode("manual");
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 50);
  };

  const switchToCalendar = () => {
    setActiveMode("calendar");
    // Trigger native picker on browsers supporting showPicker()
    setTimeout(() => {
      try {
        if (calendarInputRef.current?.showPicker) {
          calendarInputRef.current.showPicker();
        } else {
          calendarInputRef.current?.focus();
        }
      } catch (err) {
        calendarInputRef.current?.focus();
      }
    }, 50);
  };

  const hasError = !!error || !!localError;
  const displayError = error || localError;

  return (
    <div className="space-y-2 w-full">
      {/* Label */}
      {label && (
        <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </span>
          <span className="text-[10px] lowercase font-normal text-gray-400">
            {activeMode === "manual" ? "manual entry (DD/MM/YYYY)" : "calendar picker"}
          </span>
        </label>
      )}

      {/* Unified Split Container */}
      <div
        ref={containerRef}
        className={`flex items-center bg-[#F7EFEF] rounded-2xl p-1.5 border-2 transition-all duration-300 relative min-h-[58px] ${
          hasError
            ? "border-red-400 bg-red-50/60 shadow-xs"
            : isFocused
            ? "border-[#09314F] bg-white shadow-lg shadow-[#09314F11]"
            : "border-transparent"
        }`}
      >
        {/* ================= 1. MANUAL ENTRY SECTION ================= */}
        <div
          className={`transition-all duration-300 ease-in-out min-w-0 ${
            activeMode === "manual" ? "flex-[68] shrink-0" : "flex-[32] shrink-0"
          }`}
        >
          {activeMode === "manual" ? (
            /* ACTIVE: Expanded Input with Auto-Slash */
            <div className="h-11 w-full bg-white rounded-xl px-2.5 sm:px-3 shadow-xs border border-black/5 flex items-center gap-2 transition-all">
              <PencilSquareIcon className="h-4 w-4 text-[#09314F] shrink-0 stroke-[2.2]" />
              <input
                ref={textInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="DD / MM / YYYY"
                value={manualText}
                onChange={handleManualChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsFocused(true);
                  if (typeof onFocus === "function") onFocus();
                }}
                onBlur={() => {
                  setIsFocused(false);
                  if (typeof onBlur === "function") onBlur();
                }}
                className="bg-transparent w-full text-xs sm:text-sm font-semibold text-[#09314F] tracking-wider placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal outline-none"
              />
              {manualText && (
                <button
                  type="button"
                  onClick={() => {
                    setManualText("");
                    setLocalError("");
                    propagateChange("");
                    textInputRef.current?.focus();
                  }}
                  className="text-gray-300 hover:text-gray-500 text-xs px-1"
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            /* INACTIVE: Compact Button docked by side */
            <button
              type="button"
              onClick={switchToManual}
              className="h-11 w-full rounded-xl px-2 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-gray-500 hover:text-[#09314F] hover:bg-white/70 transition-all cursor-pointer truncate"
              title="Click to fill manually"
            >
              <PencilSquareIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{manualText ? manualText : "Fill"}</span>
            </button>
          )}
        </div>

        {/* Subtle Divider */}
        <div className="h-6 w-[1px] bg-gray-200/80 shrink-0 mx-0.5" />

        {/* ================= 2. CALENDAR PICKER SECTION ================= */}
        <div
          className={`transition-all duration-300 ease-in-out min-w-0 ${
            activeMode === "calendar" ? "flex-[68] shrink-0" : "flex-[32] shrink-0"
          }`}
        >
          {activeMode === "calendar" ? (
            /* ACTIVE: Expanded Calendar Trigger */
            <div
              onClick={switchToCalendar}
              className="h-11 w-full bg-white rounded-xl px-2.5 sm:px-3 shadow-xs border border-black/5 flex items-center justify-between gap-2 transition-all cursor-pointer relative group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CalendarIcon className="h-4 w-4 text-[#09314F] shrink-0 stroke-[2.2]" />
                <span className="text-xs sm:text-sm font-semibold text-[#09314F] truncate">
                  {value ? manualText || value : "Select Date"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#09314F] bg-[#F7EFEF] px-2 py-0.5 rounded-md shrink-0">
                Pick
              </span>

              {/* Invisible native date input overlaid for reliable cross-browser picker */}
              <input
                ref={calendarInputRef}
                type="date"
                max={todayIso}
                value={value || ""}
                onChange={handleCalendarChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                aria-label="Pick date from calendar"
              />
            </div>
          ) : (
            /* INACTIVE: Compact Companion docked by side */
            <div
              onClick={switchToCalendar}
              className="h-11 w-full rounded-xl px-2 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#09314F] bg-white/70 hover:bg-white shadow-2xs transition-all cursor-pointer truncate relative"
              title="Click to select from calendar"
            >
              <CalendarIcon className="h-4 w-4 shrink-0 stroke-[2.2]" />
              <span className="truncate">Cal</span>

              {/* Overlaid invisible input to enable single-tap popup on mobile */}
              <input
                type="date"
                max={todayIso}
                value={value || ""}
                onChange={(e) => {
                  setActiveMode("calendar");
                  handleCalendarChange(e);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Select from calendar"
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Feedback */}
      {displayError && (
        <p className="text-xs text-red-500 font-bold px-1 animate-in fade-in slide-in-from-top-1">
          {displayError}
        </p>
      )}
    </div>
  );
}
