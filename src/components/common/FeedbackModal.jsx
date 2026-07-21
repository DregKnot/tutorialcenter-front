import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

export default function FeedbackModal({
  isOpen,
  onClose,
  prefilledType = null,
  prefilledId = null,
  prefilledTitle = null,
  onSubmitSuccess = () => {},
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Dynamic selection if not prefilled
  const [feedbackType] = useState(prefilledType || "course");
  const [feedbackId] = useState(prefilledId || "");

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setTitle("");
      setComment("");
      setWouldRecommend(true);
      setIsAnonymous(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    const typeToSubmit = prefilledType || feedbackType;
    const idToSubmit = prefilledId || feedbackId;

    if (!typeToSubmit || !idToSubmit) {
      setError("Please select what you are reviewing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const studentToken = localStorage.getItem("student_token");
      const staffToken = localStorage.getItem("staff_token");
      const token = studentToken || staffToken;

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000"}/api/feedback`,
        {
          feedbackable_type: typeToSubmit,
          feedbackable_id: idToSubmit,
          rating,
          title,
          comment,
          would_recommend: wouldRecommend,
          is_anonymous: isAnonymous,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      onSubmitSuccess(res.data.data);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || "Failed to submit feedback.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-[#2a2a2a] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Leave Feedback</h2>
            <p className="text-[#a0a0a0] text-sm mt-1">
              {prefilledType === "class"
                ? `How easy was it to connect and join: ${prefilledTitle}?`
                : prefilledTitle 
                ? `You are reviewing: ${prefilledTitle}` 
                : "Help us improve by sharing your experience."}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#808080] hover:text-white transition-colors bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full p-2"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Star Rating */}
          <div className="flex flex-col items-center justify-center py-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <p className="text-white text-sm font-semibold mb-3">Rate your experience</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Icon 
                    icon={(hoverRating || rating) >= star ? "mdi:star" : "mdi:star-outline"} 
                    className={`w-10 h-10 transition-colors duration-200 ${(hoverRating || rating) >= star ? "text-[#BB9E7F]" : "text-[#404040]"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#c0c0c0] mb-2">
              {prefilledType === "class" ? "Headline (e.g. Connection was smooth)" : "Headline"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Great class!"
              className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-xl focus:ring-2 focus:ring-[#BB9E7F] focus:border-[#BB9E7F] block p-3 transition-colors"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-[#c0c0c0] mb-2">
              Detailed Feedback <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              placeholder={prefilledType === "class" ? "Did you experience any issues joining or during the class?" : "What did you like? What could be improved?"}
              className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-xl focus:ring-2 focus:ring-[#BB9E7F] focus:border-[#BB9E7F] block p-3 transition-colors resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 bg-[#1a1a1a] p-4 rounded-xl border border-[#2a2a2a]">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-white">I would recommend this</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={wouldRecommend}
                  onChange={(e) => setWouldRecommend(e.target.checked)}
                />
                <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BB9E7F]"></div>
              </div>
            </label>
            
            <hr className="border-[#333]" />

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-white">Submit anonymously</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BB9E7F]"></div>
              </div>
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            type="button"
            className="px-6 py-2.5 text-sm font-semibold text-[#121212] bg-[#BB9E7F] hover:bg-[#a68a6d] rounded-xl transition-colors flex items-center justify-center gap-2 min-w-[120px]"
          >
            {loading ? (
              <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
