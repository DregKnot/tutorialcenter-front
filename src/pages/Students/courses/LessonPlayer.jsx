import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../../../components/private/Students/DashboardLayout.jsx";
import { studentCurriculumApi } from "../../../services/curriculumService.js";
import {
  CheckCircle2,
  FileText,
  Download,
  Clock,
  ArrowLeft,
  Award,
  ExternalLink,
  BookOpen,
  AlertCircle,
  Video,
  Presentation
} from "lucide-react";

/**
 * Robust Video Parser
 * Handles YouTube (standard, shortened, embed, shorts, nocookie, query params),
 * Vimeo, and direct media URLs (MP4, WebM, etc.).
 */
export function parseVideoSource(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const url = rawUrl.trim();

  // 1. YouTube Regex: matches full URL, shortened, embed, shorts, nocookie, with any query params
  const ytMatch = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: "youtube",
      videoId,
      src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`,
      originalUrl: url.startsWith("http") ? url : `https://${url}`,
    };
  }

  // 2. Vimeo Regex
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(?:.*\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: "vimeo",
      videoId,
      src: `https://player.vimeo.com/video/${videoId}`,
      originalUrl: url.startsWith("http") ? url : `https://${url}`,
    };
  }

  // 3. Direct video file (mp4, webm, ogg, etc.)
  return {
    type: "file",
    src: url,
    originalUrl: url,
  };
}

export default function LessonPlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [activeTab, setActiveTab] = useState("video"); // "video" | "document" | "slides" | "quiz"
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [completing, setCompleting] = useState(false);

  // Video player state
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const heartbeatTimerRef = useRef(null);

  // Load lesson details
  const loadLesson = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentCurriculumApi.getLessonDetails(lessonId);
      if (res?.lesson) {
        setLessonData(res.lesson);
        const prog = res.progress || {};
        setIsCompleted(prog.status === "completed");
        setCompletionPercentage(prog.completion_percentage || 0);
        setTimeSpentSeconds(prog.time_spent_seconds || 0);
      } else {
        setError("Lesson details could not be found.");
      }
    } catch (err) {
      console.error("Failed to load lesson:", err);
      setError(err.response?.data?.message || "Failed to load lesson.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId, loadLesson]);

  // Video Heartbeat tracking while playing / on page
  useEffect(() => {
    if (isPlaying) {
      heartbeatTimerRef.current = setInterval(() => {
        setTimeSpentSeconds((prev) => {
          const updatedTime = prev + 15;
          let calculatedPercentage = completionPercentage;
          if (videoRef.current && videoRef.current.duration) {
            calculatedPercentage = Math.round(
              (videoRef.current.currentTime / videoRef.current.duration) * 100
            );
            setCompletionPercentage(calculatedPercentage);
          }

          // Send heartbeat to backend
          studentCurriculumApi
            .updateLessonProgress(lessonId, {
              timeSpentSeconds: updatedTime,
              completionPercentage: calculatedPercentage,
              status: isCompleted ? "completed" : "in_progress",
            })
            .catch((e) => console.warn("Progress heartbeat error:", e));

          return updatedTime;
        });
      }, 15000); // 15-second intervals
    } else {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    }

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };
  }, [isPlaying, lessonId, isCompleted, completionPercentage]);

  // Handle Mark as Complete
  const handleMarkComplete = async () => {
    try {
      setCompleting(true);
      const res = await studentCurriculumApi.completeLesson(lessonId);
      if (res?.status === "success" || res?.lesson || res?.progress) {
        setIsCompleted(true);
        setCompletionPercentage(100);
      }
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
    } finally {
      setCompleting(false);
    }
  };

  // Materials segregation
  const materials = lessonData?.materials || [];

  // 1. Detect video material
  let videoMat = materials.find((m) => m.type === "video");
  if (!videoMat) {
    // Fallback: search for any material with a video URL or video file extension
    videoMat = materials.find((m) => {
      const u = m.url || m.file_url || "";
      return /youtube\.com|youtu\.be|vimeo\.com|\.(mp4|webm|ogg|mov|mkv)(\?|$)/i.test(u);
    });
  }

  // Determine candidate video URL (checks url, file_url, and lesson fields)
  const candidateVideoUrl =
    videoMat?.url ||
    videoMat?.file_url ||
    lessonData?.video_url ||
    lessonData?.recording_link ||
    lessonData?.url ||
    null;

  const videoSource = candidateVideoUrl ? parseVideoSource(candidateVideoUrl) : null;

  // 2. Identify slide materials
  const isSlideMaterial = (m) => {
    if (m === videoMat) return false;
    if (m.type === "slides" || m.type === "slide") return true;
    const title = (m.title || "").toLowerCase();
    const url = (m.url || m.file_url || "").toLowerCase();
    return (
      title.includes("slide") ||
      title.includes("presentation") ||
      title.includes("deck") ||
      url.endsWith(".ppt") ||
      url.endsWith(".pptx") ||
      url.includes(".ppt?") ||
      url.includes(".pptx?")
    );
  };

  const slideMaterials = materials.filter(
    (m) => m !== videoMat && isSlideMaterial(m)
  );

  // 3. Document materials (all non-video, non-slide materials)
  const documentMaterials = materials.filter(
    (m) => m !== videoMat && !isSlideMaterial(m) && m.type !== "video"
  );

  const quizzes = lessonData?.quizzes || [];

  return (
    <DashboardLayout pagetitle={lessonData?.title ? `${lessonData.title} · Lesson` : "Lesson Player"}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#09314F] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Curriculum
          </button>

          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lesson Completed
            </span>
          ) : (
            <button
              onClick={handleMarkComplete}
              disabled={completing}
              className="px-4 py-2 bg-[#09314F] hover:bg-[#0A2239] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {completing ? "Updating..." : "Mark as Complete"}
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white dark:bg-[#101C2E] border border-gray-100 dark:border-[#1E2D42] rounded-3xl p-10 sm:p-14 text-center animate-pulse space-y-5 shadow-xl">
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded-md" />
            <div className="h-8 w-72 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl max-w-3xl mx-auto mt-4" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-3xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Lesson Unavailable</h3>
            <p className="text-sm text-red-600 dark:text-red-300 max-w-md mx-auto">{error}</p>
            <button
              onClick={loadLesson}
              className="mt-3 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Lesson Card */}
        {!loading && !error && lessonData && (
          <div className="bg-white dark:bg-[#101C2E] border border-gray-100 dark:border-[#1E2D42] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Lesson Header Information */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#E83831]">
                  Lesson {lessonData.order || 1}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] dark:text-white">
                  {lessonData.title}
                </h1>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {lessonData.duration_minutes > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {lessonData.duration_minutes} mins
                  </div>
                )}
                {timeSpentSeconds > 60 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shadow-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {Math.round(timeSpentSeconds / 60)}m studied
                  </div>
                )}
                {quizzes.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                    <Award className="w-4 h-4" />
                    {quizzes.length} Practice Quiz
                  </div>
                )}
              </div>
            </div>

            {/* Tabs Bar: Video -> Document -> Slides -> Practice Quiz */}
            <div className="flex items-center gap-2 sm:gap-4 border-b border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
              
              {/* Tab 1: Video */}
              <button
                onClick={() => setActiveTab("video")}
                className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "video"
                    ? "border-[#09314F] text-[#09314F] dark:border-blue-400 dark:text-white"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <Video className="w-4 h-4" />
                Video
              </button>

              {/* Tab 2: Document */}
              <button
                onClick={() => setActiveTab("document")}
                className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "document"
                    ? "border-[#09314F] text-[#09314F] dark:border-blue-400 dark:text-white"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <FileText className="w-4 h-4" />
                Document ({documentMaterials.length})
              </button>

              {/* Tab 3: Slides */}
              <button
                onClick={() => setActiveTab("slides")}
                className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "slides"
                    ? "border-[#09314F] text-[#09314F] dark:border-blue-400 dark:text-white"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <Presentation className="w-4 h-4" />
                Slides ({slideMaterials.length})
              </button>

              {/* Tab 4: Practice Quiz (Conditional) */}
              {quizzes.length > 0 && (
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === "quiz"
                      ? "border-[#09314F] text-[#09314F] dark:border-blue-400 dark:text-white"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Practice Quiz ({quizzes.length})
                </button>
              )}
            </div>

            {/* TAB CONTENT: VIDEO */}
            {activeTab === "video" && (
              <div className="space-y-6">
                
                {/* Embedded Video Box inside the Card */}
                <div className="bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative border border-gray-900 aspect-video flex items-center justify-center">
                  
                  {/* YouTube or Vimeo iframe embed */}
                  {(videoSource?.type === "youtube" || videoSource?.type === "vimeo") && (
                    <iframe
                      src={videoSource.src}
                      title={lessonData.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}

                  {/* Direct File (MP4, WebM) player */}
                  {videoSource?.type === "file" && (
                    <video
                      ref={videoRef}
                      src={videoSource.src}
                      controls
                      className="w-full h-full object-contain"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => {
                        setIsPlaying(false);
                        handleMarkComplete();
                      }}
                      onTimeUpdate={() => {
                        if (videoRef.current && videoRef.current.duration) {
                          const pct = Math.round(
                            (videoRef.current.currentTime / videoRef.current.duration) * 100
                          );
                          setCompletionPercentage(pct);
                        }
                      }}
                    />
                  )}

                  {/* Placeholder if no video attached */}
                  {!videoSource && (
                    <div className="p-8 text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-white">
                        <Video className="w-8 h-8 text-amber-300" />
                      </div>
                      <h3 className="text-lg font-bold text-white">No Video Lecture Attached</h3>
                      <p className="text-xs text-gray-400 max-w-md mx-auto">
                        This lesson focuses on readings, presentation slides, and practice assessments. Explore the Document and Slides tabs above!
                      </p>
                    </div>
                  )}
                </div>

                {/* Video Info Strip & External Link */}
                {videoSource && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {videoSource.type === "youtube" ? (
                        <span>Playing from YouTube</span>
                      ) : videoSource.type === "vimeo" ? (
                        <span>Playing from Vimeo</span>
                      ) : (
                        <span>Playing Video Stream</span>
                      )}
                    </div>

                    {videoSource.originalUrl && (
                      <a
                        href={videoSource.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-[#09314F] dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Video in New Tab
                      </a>
                    )}
                  </div>
                )}

                {/* Overview & Lesson Notes under the Video Player */}
                <div className="p-6 bg-gray-50/70 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#09314F] dark:text-gray-200">
                    <BookOpen className="w-4 h-4 text-[#E83831]" />
                    Overview & Lesson Notes
                  </div>
                  {lessonData.description ? (
                    <div
                      className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal"
                      dangerouslySetInnerHTML={{ __html: lessonData.description }}
                    />
                  ) : (
                    <p className="text-xs text-gray-400 italic">No additional summary provided for this lesson.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: DOCUMENT */}
            {activeTab === "document" && (
              <div className="space-y-4">
                {documentMaterials.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-3xl space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                      No Documents Attached
                    </h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      There are no additional PDF worksheets or reading notes attached to this lesson yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {documentMaterials.map((mat) => (
                      <div
                        key={mat.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/60 rounded-2xl hover:border-gray-200 dark:hover:border-gray-600 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shadow-sm flex-shrink-0 border border-red-100 dark:border-red-900/30">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#09314F] dark:text-white">
                              {mat.title}
                            </h4>
                            <span className="text-[11px] text-gray-400 capitalize">
                              {mat.type || "Document"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {mat.file_url && (
                            <a
                              href={mat.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#09314F] hover:bg-[#0A2239] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          )}
                          {mat.url && (
                            <a
                              href={mat.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 text-xs font-bold text-[#09314F] dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Open Link
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SLIDES */}
            {activeTab === "slides" && (
              <div className="space-y-4">
                {slideMaterials.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-3xl space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
                      <Presentation className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                      No Presentation Slides Attached
                    </h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Presentation slide decks for this lesson will appear here once uploaded by your tutor.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {slideMaterials.map((mat) => (
                      <div
                        key={mat.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/60 rounded-2xl hover:border-gray-200 dark:hover:border-gray-600 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm flex-shrink-0 border border-blue-100 dark:border-blue-900/30">
                            <Presentation className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#09314F] dark:text-white">
                              {mat.title}
                            </h4>
                            <span className="text-[11px] text-gray-400">
                              Presentation Slide Deck
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {mat.file_url && (
                            <a
                              href={mat.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#09314F] hover:bg-[#0A2239] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download Slides
                            </a>
                          )}
                          {mat.url && (
                            <a
                              href={mat.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 text-xs font-bold text-[#09314F] dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Slides
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PRACTICE QUIZ */}
            {activeTab === "quiz" && quizzes.length > 0 && (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-6 bg-gradient-to-br from-amber-50/60 to-orange-50/40 dark:from-gray-800 dark:to-gray-800/60 border border-amber-200/60 dark:border-gray-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        Practice Assessment
                      </div>
                      <h4 className="font-black text-lg text-[#09314F] dark:text-white">
                        {quiz.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {quiz.timer_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {quiz.timer_minutes} minutes
                          </span>
                        )}
                        <span>Pass Mark: {quiz.pass_mark}%</span>
                      </div>
                    </div>

                    <Link
                      to={`/student/courses/quizzes/${quiz.id}`}
                      className="px-6 py-3 bg-[#09314F] hover:bg-[#0A2239] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md self-start sm:self-center"
                    >
                      Take Practice Quiz
                    </Link>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
