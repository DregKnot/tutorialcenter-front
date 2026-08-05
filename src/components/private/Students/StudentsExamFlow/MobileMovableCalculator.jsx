import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import CalculatorRightbar from "./CalculatorRightbar";

export default function MobileMovableCalculator({ isScience }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const timerRef = useRef(null);

  // Long press detection on mobile trigger button
  const handleTouchStartTrigger = () => {
    timerRef.current = setTimeout(() => {
      setIsDismissed(true);
      showToast("Calculator widget removed from screen");
    }, 850);
  };

  const handleTouchEndTrigger = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Drag Handlers for Movable Popup Header
  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragRef.current.startX;
    const deltaY = clientY - dragRef.current.startY;

    const newX = Math.max(10, Math.min(window.innerWidth - 310, dragRef.current.initialX + deltaX));
    const newY = Math.max(10, Math.min(window.innerHeight - 450, dragRef.current.initialY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (isDismissed) {
    return toastMessage ? (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[3000] bg-[#09314F] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl border border-[#BB9E7F] animate-fade-in">
        {toastMessage}
      </div>
    ) : null;
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-28 right-4 z-[3000] bg-[#09314F] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-[#BB9E7F]">
          {toastMessage}
        </div>
      )}

      {/* Floating Trigger Button (Mobile / Tablet view) */}
      {!isOpen && (
        <div className="fixed bottom-24 right-4 z-[999] lg:hidden flex flex-col items-end">
          <button
            onClick={() => setIsOpen(true)}
            onTouchStart={handleTouchStartTrigger}
            onTouchEnd={handleTouchEndTrigger}
            onMouseDown={handleTouchStartTrigger}
            onMouseUp={handleTouchEndTrigger}
            className="flex items-center gap-2 bg-[#09314F] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-[#BB9E7F] active:scale-95 transition-transform"
          >
            <Icon icon="lucide:calculator" className="w-5 h-5 text-[#BB9E7F]" />
            <span className="text-xs font-black uppercase tracking-wider">Calculator</span>
          </button>
          <span className="text-[9px] font-bold text-gray-400 mt-1 pr-1 bg-black/60 px-2 py-0.5 rounded text-white/80">
            Hold to remove
          </span>
        </div>
      )}

      {/* Movable Calculator Popup Modal */}
      {isOpen && (
        <div
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          className="fixed z-[2000] w-[310px] bg-white dark:bg-[#071927] border-2 border-[#09314F] dark:border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden select-none animate-in zoom-in-95 duration-200"
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
        >
          {/* Draggable Header */}
          <div
            onTouchStart={handleDragStart}
            onMouseDown={handleDragStart}
            className="bg-[#09314F] text-white px-4 py-3 flex items-center justify-between cursor-move"
          >
            <div className="flex items-center gap-2">
              <Icon icon="lucide:grip-horizontal" className="w-4 h-4 text-[#BB9E7F]" />
              <span className="text-xs font-black uppercase tracking-wider">Movable Calculator</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsDismissed(true);
                  showToast("Calculator hidden completely");
                }}
                title="Remove widget from screen"
                className="text-[10px] font-black text-red-300 hover:text-red-100 uppercase tracking-widest px-2 py-0.5 bg-red-900/50 rounded"
              >
                Hide
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Calculator */}
          <div className="p-3 max-h-[460px] overflow-y-auto">
            <CalculatorRightbar />
          </div>
        </div>
      )}
    </>
  );
}
