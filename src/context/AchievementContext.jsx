import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AchievementCelebrationModal from '../components/common/AchievementCelebrationModal';
import { Sparkles, X } from 'lucide-react';

const AchievementContext = createContext(null);

export const AchievementProvider = ({ children }) => {
  const [modalQueue, setModalQueue] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Process next modal in queue
  useEffect(() => {
    if (!activeModal && modalQueue.length > 0) {
      const next = modalQueue[0];
      setActiveModal(next);
      setModalQueue((prev) => prev.slice(1));
    }
  }, [activeModal, modalQueue]);

  // Trigger Celebration Modal
  const triggerCelebration = (achievement) => {
    if (!achievement) return;
    setModalQueue((prev) => [...prev, achievement]);
  };

  // Trigger Floating Toast
  const triggerToast = (achievement) => {
    if (!achievement) return;
    const toastId = `${Date.now()}_${Math.random()}`;
    const newToast = { id: toastId, achievement };
    
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 5000);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  // Axios Global Response Interceptor to catch unlocked achievements automatically
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // Check all common backend response payload shapes for single achievement
        const singleAch = 
          response?.data?.new_achievement ||
          response?.data?.data?.new_achievement ||
          response?.data?.achievement_unlocked ||
          response?.data?.data?.achievement_unlocked ||
          response?.data?.unlocked_achievement ||
          response?.data?.data?.unlocked_achievement;

        if (singleAch && typeof singleAch === "object") {
          triggerCelebration(singleAch);
        }

        // Check all common backend response payload shapes for multiple achievements
        const multipleAchs = 
          response?.data?.new_achievements ||
          response?.data?.data?.new_achievements ||
          response?.data?.achievements_unlocked ||
          response?.data?.data?.achievements_unlocked ||
          response?.data?.unlocked_achievements ||
          response?.data?.data?.unlocked_achievements;

        if (Array.isArray(multipleAchs) && multipleAchs.length > 0) {
          multipleAchs.forEach((ach, index) => {
            if (index === 0 && !singleAch) {
              triggerCelebration(ach);
            } else {
              triggerToast(ach);
            }
          });
        }

        return response;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AchievementContext.Provider
      value={{
        triggerCelebration,
        triggerToast,
      }}
    >
      {children}

      {/* Global Celebration Modal */}
      {activeModal && (
        <AchievementCelebrationModal
          achievement={activeModal}
          onClose={handleCloseModal}
        />
      )}

      {/* Global Non-blocking Achievement Toasts (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-[95] flex flex-col gap-3 pointer-events-none">
        {toasts.map(({ id, achievement }) => (
          <div
            key={id}
            className="pointer-events-auto p-4 rounded-2xl bg-[#09314F] text-white shadow-2xl border border-amber-400/40 flex items-center gap-3.5 max-w-sm animate-in slide-in-from-bottom-5 duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                Achievement Unlocked
              </p>
              <p className="text-xs font-bold truncate text-white">
                {achievement.name}
              </p>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== id))}
              className="p-1 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AchievementContext.Provider>
  );
};

export const useAchievement = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievement must be used within an AchievementProvider');
  }
  return context;
};
