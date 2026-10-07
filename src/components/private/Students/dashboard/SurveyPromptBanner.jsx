import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Sparkles, ArrowRight, X } from "lucide-react";

export default function SurveyPromptBanner() {
  const { token } = useAuth();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  useEffect(() => {
    // Check if dismissed this session
    if (sessionStorage.getItem("tca_survey_banner_dismissed")) {
      setDismissed(true);
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/students/survey/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.has_submitted) {
          setHasSubmitted(true);
        }
      } catch (err) {
        // silent fail
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [token, API_BASE_URL]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("tca_survey_banner_dismissed", "true");
  };

  if (loading || dismissed || hasSubmitted) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2843] via-[#163a5f] to-[#0a2540] text-white p-5 sm:p-6 shadow-xl border border-[#C5A97A]/20 transition-all animate-fade-in">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-[#C5A97A]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C5A97A] to-[#ebd7b0] flex items-center justify-center text-[#0F2843] shrink-0 shadow-lg shadow-[#C5A97A]/20">
            <Sparkles className="w-6 h-6 fill-current animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C5A97A]/20 text-[#C5A97A] text-[10px] font-black uppercase tracking-wider border border-[#C5A97A]/30">
                Your Voice Shapes TCA
              </span>
              <span className="text-[11px] text-gray-300 font-medium hidden sm:inline">
                Takes ~3 mins
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
              Vote on Video Formats for Our New Recorded Courses! 🎬
            </h3>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Tell us how you like your live masterclasses and pick your preferred video styles
              (animated, whiteboard, tutor on screen, or slides) for the upcoming recorded lessons.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end shrink-0 pt-2 md:pt-0">
          <Link
            to="/student/survey"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#C5A97A] hover:bg-[#d6bc8e] text-[#0F2843] font-black text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>Take 3-Min Survey</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Dismiss banner for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
