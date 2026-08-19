import { useState, useEffect, useRef } from "react";
import { MessageSquareText, ChevronUp, X } from "lucide-react";

import { useLocation } from "react-router-dom";

export default function StickyButtons() {
  const location = useLocation();
  const [openChat, setOpenChat] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const longPressTimer = useRef(null);

  // Hide buttons on classroom and exam screens
  const hideOnKeywords = ["classroom", "exam"];
  const shouldHide = hideOnKeywords.some(keyword => 
    location.pathname.toLowerCase().includes(keyword)
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 80;
      setIsScrolled(scrolled);
      // Show scroll-to-top button once user scrolls past 400px
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsChatDisabled(true);
    }, 800);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const containerGlassClass = isScrolled
    ? "bg-white/80 dark:bg-[#09314F]/80 backdrop-blur-md border-white/20 dark:border-white/10 shadow-lg"
    : "bg-white dark:bg-[#09314F] border-gray-100 dark:border-white/10 shadow-md";

  if (shouldHide) return null;

  return (
    <>
      <div className="fixed bottom-5 sm:bottom-7 right-4 sm:right-6 z-[60] flex flex-col items-center gap-2.5">
        {/* Back To Top (Icon Only) */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#BB9E7F] hover:bg-[#a88c6e] active:scale-95 text-white flex items-center justify-center shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}

        {/* CHAT WITH US (Compact Icon Button) */}
        {!isChatDisabled && (
          <button 
            onClick={() => setOpenChat(true)}
            onDoubleClick={() => setIsChatDisabled(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#09314F] hover:bg-[#0d3e64] active:scale-95 text-white flex items-center justify-center shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-white/10 group ${containerGlassClass}`}
            title="Chat with us (Double click to hide)"
            aria-label="Chat with us"
          >
            <MessageSquareText className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Pop Up */}
      {openChat && (
        <div className="fixed bottom-32 sm:bottom-36 right-3 sm:right-8 w-[260px] bg-white dark:bg-[#09314F] shadow-xl rounded-2xl z-[70] p-4 border border-gray-100 dark:border-white/10">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-[#09314F] dark:text-white text-sm">Chat with us</span>
            <button onClick={() => setOpenChat(false)} className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Chat with us is not available for now, please do well to send us an email.
          </p>
        </div>
      )}
    </>
  );
}
