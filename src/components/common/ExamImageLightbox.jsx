import React, { useEffect } from "react";
import { Icon } from "@iconify/react";

/**
 * Universal high-resolution image preview lightbox for exam diagrams and options.
 */
export default function ExamImageLightbox({ src, alt = "Exam diagram", onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="absolute -top-12 right-0 flex items-center gap-3">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center justify-center"
            title="Open original in new tab"
          >
            <Icon icon="lucide:external-link" className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-red-500/80 text-white rounded-full transition-colors flex items-center justify-center"
            title="Close (Esc)"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="bg-white dark:bg-gray-900 p-2 md:p-3 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl select-none"
          />
        </div>

        {alt && alt !== "Exam diagram" && (
          <p className="text-white/80 text-xs font-semibold mt-3 text-center px-4 bg-black/40 py-1 rounded-full backdrop-blur-sm">
            {alt}
          </p>
        )}
      </div>
    </div>
  );
}
