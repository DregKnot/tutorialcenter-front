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
    ? "bg-white/10 dark:bg-black/25 border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]"
    : "bg-white/95 dark:bg-[#09314F] border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)]";

  const btnStyle = `backdrop-blur-[14px] w-[60px] h-[60px] sm:w-[92px] sm:h-[92px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-1.5 border hover:-translate-y-1 transition-all duration-300 group ${containerGlassClass}`;

  if (shouldHide) return null;

  return (
    <>
      <div className="fixed bottom-6 sm:bottom-8 right-3 sm:right-8 z-[60] flex flex-col gap-2.5 sm:gap-3">
        {/* CHAT WITH US */}
        {!isChatDisabled && (
          <button 
            onClick={() => setOpenChat(true)}
            onDoubleClick={() => setIsChatDisabled(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={btnStyle}
            title="Double click or long press to hide"
          >
            <span className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#09314F] text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-sm">
              <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="text-[7px] sm:text-[10px] text-gray-800 dark:text-white font-black uppercase tracking-wider text-center leading-none">
              Chat with us
            </span>
          </button>
        )}

        {/* Back To Top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={btnStyle}
          >
            <span className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#BB9E7F] text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-sm">
              <ChevronUp className="w-4 h-4 sm:w-6 sm:h-6" />
            </span>
            <span className="text-[7px] sm:text-[10px] text-gray-800 dark:text-white font-black uppercase tracking-wider text-center leading-none">
              Back to Top
            </span>
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
