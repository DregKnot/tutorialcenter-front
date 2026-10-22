import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../../../components/private/Students/DashboardLayout.jsx";
import { studentCurriculumApi } from "../../../services/curriculumService.js";
import {
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  FileText,
  Download,
  HelpCircle,
  Clock,
  ArrowLeft,
  Award,
  ExternalLink,
  BookOpen,
  Volume2,
  AlertCircle,
  RotateCcw
} from "lucide-react";

export default function LessonPlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "materials" | "quiz"
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

  // Video Heartbeat tracking while playing
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
      if (res?.status === "success") {
        setIsCompleted(true);
        setCompletionPercentage(100);
      }
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
    } finally {
      setCompleting(false);
    }
  };

  // Video materials selection
  const materials = lessonData?.materials || [];
  const videoMaterial = materials.find((m) => m.type === "video");
  const documentMaterials = materials.filter((m) => m.type !== "video");
  const quizzes = lessonData?.quizzes || [];

  // Determine video source
  const getVideoSource = () => {
    if (!videoMaterial) return null;
    if (videoMaterial.file_url) return { type: "file", src: videoMaterial.file_url };
    if (videoMaterial.url) {
      const url = videoMaterial.url;
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
        return { type: "embed", src: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` };
      }
      if (url.includes("vimeo.com")) {
        const vimeoId = url.split("/").pop();
        return { type: "embed", src: `https://player.vimeo.com/video/${vimeoId}` };
      }
      return { type: "file", src: url };
    }
    return null;
  };

  const videoSource = getVideoSource();

  return (
    <DashboardLayout pagetitle={lessonData?.title ? `${lessonData.title} · Lesson` : "Lesson Player"}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#09314F] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Curriculum
          </button>

          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
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

        {/* Loading */}
        {loading && (
          <div className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-3xl p-16 text-center animate-pulse space-y-4">
            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl max-w-2xl mx-auto" />
            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto" />
          </div>
        )}

        {/* Error */}
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

        {/* Lesson Player & Content */}
        {!loading && !error && lessonData && (
          <>
            {/* Primary Media Box */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-gray-900 aspect-video flex items-center justify-center">
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

              {videoSource?.type === "embed" && (
                <iframe
                  src={videoSource.src}
                  title={lessonData.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}

              {!videoSource && (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-white">
                    <BookOpen className="w-8 h-8 text-amber-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Study Notes & Document Lesson</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    This lesson focuses on readings, downloadable worksheets, and practice assessments. Access the materials tab below.
                  </p>
                </div>
              )}
            </div>

            {/* Lesson Title & Progress Strip */}
            <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#E83831]">
                    Lesson {lessonData.order || 1}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] dark:text-white">
                    {lessonData.title}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {lessonData.duration_minutes > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-xs font-bold text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {lessonData.duration_minutes} mins
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

              {/* Tabs Bar */}
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                    activeTab === "overview"
                      ? "border-[#09314F] text-[#09314F] dark:border-blue-400 dark:text-white"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  Overview & Notes
                </button>
                <button
                  onClick={() => setActiveTab("materials")}
                  className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 relative ${
                    activeTab === "materials"
                      ? "border-[#09314F] text-[#09314F] dark:border-blue-400 dark:text-white"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  Downloads ({documentMaterials.length})
                </button>
                {quizzes.length > 0 && (
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                      activeTab === "quiz"
                        ? "border-[#09314F] text-[#09314F] dark:border-blue-400 dark:text-white"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    Practice Quiz ({quizzes.length})
                  </button>
                )}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {lessonData.description ? (
                    <div
                      className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: lessonData.description }}
                    />
                  ) : (
                    <p className="text-xs text-gray-400 italic">No additional summary provided for this lesson.</p>
                  )}
                </div>
              )}

              {/* Tab 2: Downloads & Materials */}
              {activeTab === "materials" && (
                <div className="space-y-3">
                  {documentMaterials.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-4 text-center">
                      No additional worksheets or PDF files attached to this lesson.
                    </p>
                  ) : (
                    documentMaterials.map((mat) => (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
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

                        {mat.file_url ? (
                          <a
                            href={mat.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 text-xs font-bold text-[#09314F] dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        ) : mat.url ? (
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 text-xs font-bold text-[#09314F] dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open Link
                          </a>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Practice Quiz */}
              {activeTab === "quiz" && (
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
