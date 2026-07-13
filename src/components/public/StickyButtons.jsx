import { useState, useEffect } from "react";
import { MessageSquareText, ChevronUp, X } from "lucide-react";

export default function StickyButtons() {
  const [openChat, setOpenChat] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed bottom-8 sm:right-8 right-4 z-[60] flex flex-col gap-3">
        {/* CHAT WITH US */}
        <button 
          onClick={() => setOpenChat(true)}
          className="bg-white/95 backdrop-blur-sm px-3 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center gap-1.5 border border-gray-100 hover:-translate-y-1 transition-transform group"
        >
          <span className="w-10 h-10 rounded-full bg-[#09314F] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquareText className="w-5 h-5" />
          </span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Chat with us</span>
        </button>

        {/* Back To Top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-white/95 backdrop-blur-sm px-3 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center gap-1.5 border border-gray-100 hover:-translate-y-1 transition-transform group"
          >
            <span className="w-10 h-10 rounded-full bg-[#BB9E7F] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChevronUp className="w-6 h-6" />
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Back to Top</span>
          </button>
        )}
      </div>

      {/* Pop Up */}
      {openChat && (
        <div className="fixed bottom-36 right-4 sm:right-8 w-[260px] bg-white shadow-xl rounded-2xl z-[70] p-4 border border-gray-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-[#09314F] text-sm">Chat with us</span>
            <button onClick={() => setOpenChat(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <p className="text-xs text-gray-600 leading-relaxed">
            Chat with us is not available for now, please do well to send us an email.
          </p>
        </div>
      )}
    </>
  );
}
