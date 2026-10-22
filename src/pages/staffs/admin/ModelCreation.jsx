import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { staffCurriculumApi } from "../../../services/curriculumService.js";
import {
  BookOpenIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  ArrowLeftIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://tutorialcenter-back.test" ||
  "http://localhost:8000";

export default function ModelCreation() {
  const { subjectId: routeSubjectId } = useParams();
  const navigate = useNavigate();

  // Subjects directory for switcher
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(routeSubjectId || "");
  const [currentSubject, setCurrentSubject] = useState(null);

  // Curriculum Data
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [modules, setModules] = useState([]);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [moduleLessons, setModuleLessons] = useState({});

  // Module creation/edit state
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [savingModule, setSavingModule] = useState(false);

  // Lesson creation/edit state
  const [lessonModal, setLessonModal] = useState(null); // { mode: 'create'|'edit', moduleId, lesson }
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonDuration, setLessonDuration] = useState(20);
  const [savingLesson, setSavingLesson] = useState(false);

  // Materials & Quizzes Manager Drawer for a lesson
  const [activeLesson, setActiveLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [matTitle, setMatTitle] = useState("");
  const [matType, setMatType] = useState("video");
  const [matUrl, setMatUrl] = useState("");
  const [matFile, setMatFile] = useState(null);
  const [uploadingMat, setUploadingMat] = useState(false);

  // Quizzes state for active lesson
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPassScore, setQuizPassScore] = useState(70);
  const [quizQuestions, setQuizQuestions] = useState([
    {
      question_text: "",
      options: [
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
      explanation: "",
    },
  ]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const token = localStorage.getItem("staff_token");

  // Load all subjects and courses on mount
  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        setLoadingSubjects(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        };

        const res = await axios.get(`${API_BASE_URL}/api/admin/subjects/all`, config);
        const loadedSubjs = res.data?.data || res.data?.subjects || [];
        setAllSubjects(loadedSubjs);

        // Determine active subject
        if (routeSubjectId) {
          const match = loadedSubjs.find((s) => String(s.id) === String(routeSubjectId));
          if (match) {
            setSelectedSubjectId(match.id);
            setCurrentSubject(match);
          }
        } else if (loadedSubjs.length > 0) {
          setSelectedSubjectId(loadedSubjs[0].id);
          setCurrentSubject(loadedSubjs[0]);
        }
      } catch (err) {
        console.error("Failed to fetch subjects directory:", err);
        showToast("error", "Failed to load subjects directory.");
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchDirectory();
  }, [token, routeSubjectId]);

  // When selectedSubjectId changes, update currentSubject and sync URL
  const handleSelectSubject = (id) => {
    setSelectedSubjectId(id);
    const match = allSubjects.find((s) => String(s.id) === String(id));
    setCurrentSubject(match || null);
    navigate(`/staffs/model-creation/${id}`, { replace: true });
  };

  // Load modules for the active subject
  const loadModules = useCallback(async () => {
    if (!selectedSubjectId) return;
    try {
      setLoadingModules(true);
      const res = await staffCurriculumApi.getModulesBySubject(selectedSubjectId);
      const fetched = res?.modules || [];
      setModules(fetched);
      if (fetched.length > 0 && !expandedModuleId) {
        setExpandedModuleId(fetched[0].id);
      }
    } catch (err) {
      console.error("Failed to load modules:", err);
      showToast("error", "Failed to load modules for this subject.");
    } finally {
      setLoadingModules(false);
    }
  }, [selectedSubjectId, expandedModuleId]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadModules();
    }
  }, [selectedSubjectId, loadModules]);

  // Load lessons for an expanded module
  const loadLessonsForModule = useCallback(async (moduleId) => {
    try {
      const res = await staffCurriculumApi.getLessonsByModule(moduleId);
      setModuleLessons((prev) => ({
        ...prev,
        [moduleId]: res?.lessons || [],
      }));
    } catch (err) {
      console.error("Failed to load lessons:", err);
    }
  }, []);

  useEffect(() => {
    if (expandedModuleId) {
      loadLessonsForModule(expandedModuleId);
    }
  }, [expandedModuleId, loadLessonsForModule]);

  // --- Module Handlers ---
  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim() || !selectedSubjectId) return;
    try {
      setSavingModule(true);
      if (editingModule) {
        await staffCurriculumApi.updateModule(editingModule.id, {
          title: moduleTitle.trim(),
          description: moduleDesc.trim(),
        });
        showToast("success", "Module updated successfully.");
      } else {
        await staffCurriculumApi.createModule(selectedSubjectId, {
          title: moduleTitle.trim(),
          description: moduleDesc.trim(),
          order: modules.length + 1,
        });
        showToast("success", "Module created successfully.");
      }
      setModuleTitle("");
      setModuleDesc("");
      setIsCreatingModule(false);
      setEditingModule(null);
      loadModules();
    } catch (err) {
      console.error("Failed to save module:", err);
      showToast("error", "Failed to save module.");
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Are you sure you want to delete this module and all its lessons?")) return;
    try {
      await staffCurriculumApi.deleteModule(moduleId);
      showToast("success", "Module deleted.");
      loadModules();
    } catch (err) {
      console.error("Failed to delete module:", err);
      showToast("error", "Failed to delete module.");
    }
  };

  // --- Lesson Handlers ---
  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonModal?.moduleId) return;
    try {
      setSavingLesson(true);
      if (lessonModal.mode === "edit" && lessonModal.lesson) {
        await staffCurriculumApi.updateLesson(lessonModal.lesson.id, {
          title: lessonTitle.trim(),
          description: lessonDesc.trim(),
          duration_minutes: parseInt(lessonDuration, 10) || 15,
        });
        showToast("success", "Lesson updated successfully.");
      } else {
        const currentLessons = moduleLessons[lessonModal.moduleId] || [];
        await staffCurriculumApi.createLesson(lessonModal.moduleId, {
          title: lessonTitle.trim(),
          description: lessonDesc.trim(),
          durationMinutes: parseInt(lessonDuration, 10) || 15,
          order: currentLessons.length + 1,
        });
        showToast("success", "Lesson added successfully.");
      }
      setLessonTitle("");
      setLessonDesc("");
      setLessonModal(null);
      loadLessonsForModule(lessonModal.moduleId);
    } catch (err) {
      console.error("Failed to save lesson:", err);
      showToast("error", "Failed to save lesson.");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await staffCurriculumApi.deleteLesson(lessonId);
      showToast("success", "Lesson removed.");
      loadLessonsForModule(moduleId);
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      showToast("error", "Failed to remove lesson.");
    }
  };

  // --- Materials Handlers ---
  const openLessonDrawer = async (lesson) => {
    setActiveLesson(lesson);
    loadLessonMaterials(lesson.id);
    loadLessonQuizzes(lesson.id);
  };

  const loadLessonMaterials = async (lessonId) => {
    try {
      setLoadingMaterials(true);
      const res = await staffCurriculumApi.getMaterialsByLesson(lessonId);
      setMaterials(res?.materials || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!matTitle.trim() || !activeLesson) return;
    try {
      setUploadingMat(true);
      const formData = new FormData();
      formData.append("title", matTitle.trim());
      formData.append("type", matType);
      if (matUrl) formData.append("url", matUrl.trim());
      if (matFile) formData.append("file", matFile);
      formData.append("order", materials.length + 1);

      await staffCurriculumApi.uploadMaterial(activeLesson.id, formData);
      showToast("success", "Material uploaded successfully.");
      setMatTitle("");
      setMatUrl("");
      setMatFile(null);
      loadLessonMaterials(activeLesson.id);
    } catch (err) {
      console.error("Failed to upload material:", err);
      showToast("error", "Failed to upload material.");
    } finally {
      setUploadingMat(false);
    }
  };

  const handleDeleteMaterial = async (matId) => {
    if (!window.confirm("Remove this material?")) return;
    try {
      await staffCurriculumApi.deleteMaterial(matId);
      showToast("success", "Material removed.");
      if (activeLesson) loadLessonMaterials(activeLesson.id);
    } catch (err) {
      console.error("Failed to remove material:", err);
      showToast("error", "Failed to remove material.");
    }
  };

  // --- Quiz Handlers ---
  const loadLessonQuizzes = async (lessonId) => {
    try {
      setLoadingQuizzes(true);
      const res = await staffCurriculumApi.getQuizzesByLesson(lessonId);
      setQuizzes(res?.quizzes || []);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        question_text: "",
        options: [
          { option_text: "", is_correct: true },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ],
        explanation: "",
      },
    ]);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim() || !activeLesson) return;
    try {
      setSavingQuiz(true);
      await staffCurriculumApi.createQuiz(activeLesson.id, {
        title: quizTitle.trim(),
        pass_percentage: parseInt(quizPassScore, 10) || 70,
        questions: quizQuestions,
      });
      showToast("success", "Practice quiz created successfully.");
      setIsCreatingQuiz(false);
      setQuizTitle("");
      loadLessonQuizzes(activeLesson.id);
    } catch (err) {
      console.error("Failed to create quiz:", err);
      showToast("error", "Failed to create practice quiz.");
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this practice quiz?")) return;
    try {
      await staffCurriculumApi.deleteQuiz(quizId);
      showToast("success", "Quiz deleted.");
      if (activeLesson) loadLessonQuizzes(activeLesson.id);
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      showToast("error", "Failed to delete quiz.");
    }
  };

  return (
    <StaffDashboardLayout pagetitle="Model Creation">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-3 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <XMarkIcon className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-8 pb-16 min-h-screen">
        {/* Navigation & Header Hero */}
        <div className="p-6 sm:p-10 bg-[#0F2843] rounded-[40px] text-white shadow-xl flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => navigate("/staffs/subject-modules")}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#BB9E7F] hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Subject Catalog
            </button>

            {/* Subject Switcher Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Active Subject:
              </span>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSelectSubject(e.target.value)}
                disabled={loadingSubjects}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black text-white outline-none cursor-pointer transition-all"
              >
                {allSubjects.map((s) => (
                  <option key={s.id} value={s.id} className="text-[#0F2843]">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-white/10">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BB9E7F]">
                Subject Modules & Curriculum Studio
              </span>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
                Model Creation
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 font-medium">
                Structure topic modules for{" "}
                <span className="text-white font-bold">{currentSubject?.name || "Subject"}</span>
                , attach animated video lectures, upload presentation slides and PDFs, and build lesson practice quizzes.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10 text-center">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                  Modules
                </span>
                <span className="text-xl font-black text-[#BB9E7F]">{modules.length}</span>
              </div>
              <button
                onClick={() => {
                  setEditingModule(null);
                  setModuleTitle("");
                  setModuleDesc("");
                  setIsCreatingModule(true);
                }}
                className="px-6 py-4 bg-white text-[#0F2843] hover:bg-[#BB9E7F] hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 active:scale-95"
              >
                <PlusIcon className="w-4 h-4" />
                Add Module
              </button>
            </div>
          </div>
        </div>

        {/* Create / Edit Module Form */}
        {isCreatingModule && (
          <div className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-xl space-y-5 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0F2843] dark:text-white">
                {editingModule ? "Edit Module (Topic)" : "Create New Module (Topic)"}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingModule(false);
                  setEditingModule(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 block">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Number and Numeration"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-[#0F2843] dark:text-white outline-none focus:border-[#0F2843]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 block">
                    Description / Learning Objectives
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of concepts covered in this module"
                    value={moduleDesc}
                    onChange={(e) => setModuleDesc(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-[#0F2843] dark:text-white outline-none focus:border-[#0F2843]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingModule(false);
                    setEditingModule(null);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModule}
                  className="px-6 py-2.5 bg-[#0F2843] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50"
                >
                  {savingModule ? "Saving..." : editingModule ? "Update Module" : "Save Module"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modules List */}
        <div className="space-y-6">
          {loadingModules ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-gray-100 dark:bg-gray-800/60 rounded-[28px] animate-pulse"
                />
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-gray-800/40 rounded-[36px] border-2 border-dashed border-gray-200 dark:border-gray-700 space-y-3">
              <BookOpenIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
              <h3 className="text-base font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                No Modules Created Yet
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Click &quot;Add Module&quot; above to create your first topic under{" "}
                <span className="font-bold text-[#0F2843] dark:text-white">
                  {currentSubject?.name || "this subject"}
                </span>
                .
              </p>
            </div>
          ) : (
            modules.map((mod, modIdx) => {
              const isExpanded = expandedModuleId === mod.id;
              const lessons = moduleLessons[mod.id] || [];

              return (
                <div
                  key={mod.id}
                  className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all"
                >
                  {/* Module Bar */}
                  <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/70 dark:bg-gray-800/80">
                    <button
                      onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                      className="flex items-center gap-4 flex-1 text-left min-w-0"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#0F2843] text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm">
                        {modIdx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BB9E7F]">
                            Topic Module
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#0F2843] dark:text-blue-300 text-[10px] font-black">
                            {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-[#0F2843] dark:text-white truncate mt-0.5">
                          {mod.title}
                        </h3>
                        {mod.description && (
                          <p className="text-xs text-gray-400 truncate max-w-xl">
                            {mod.description}
                          </p>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => {
                          setLessonModal({ mode: "create", moduleId: mod.id });
                          setLessonTitle("");
                          setLessonDesc("");
                          setLessonDuration(20);
                        }}
                        className="px-4 py-2 bg-[#0F2843] hover:bg-[#1a436e] text-white text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Lesson
                      </button>
                      <button
                        onClick={() => {
                          setEditingModule(mod);
                          setModuleTitle(mod.title);
                          setModuleDesc(mod.description || "");
                          setIsCreatingModule(true);
                        }}
                        className="p-2 text-gray-400 hover:text-[#0F2843] dark:hover:text-white rounded-xl transition-colors"
                        title="Edit module"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                        title="Delete module"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="w-6 h-6" />
                        ) : (
                          <ChevronRightIcon className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Lessons Inside Module */}
                  {isExpanded && (
                    <div className="p-6 sm:p-8 space-y-4 border-t border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-850">
                      {lessons.length === 0 ? (
                        <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-400 font-bold">
                            No lessons attached to this module. Click &quot;Add Lesson&quot; above to create learning steps.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lessons.map((lesson, lessonIdx) => (
                            <div
                              key={lesson.id}
                              className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#0F2843]"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-black text-gray-600 dark:text-gray-300 flex items-center justify-center">
                                  {modIdx + 1}.{lessonIdx + 1}
                                </span>
                                <div>
                                  <h4 className="text-sm font-black text-[#0F2843] dark:text-white">
                                    {lesson.title}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400 font-medium">
                                    <span className="flex items-center gap-1">
                                      <ClockIcon className="w-3.5 h-3.5" />
                                      {lesson.duration_minutes || 15} mins
                                    </span>
                                    {lesson.description && <span>• {lesson.description}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  onClick={() => openLessonDrawer(lesson)}
                                  className="px-4 py-2 bg-[#BB9E7F]/15 hover:bg-[#BB9E7F] text-[#0F2843] hover:text-white dark:text-[#BB9E7F] dark:hover:text-white text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all"
                                >
                                  <DocumentArrowUpIcon className="w-4 h-4" />
                                  Materials & Quizzes
                                </button>
                                <button
                                  onClick={() => {
                                    setLessonModal({
                                      mode: "edit",
                                      moduleId: mod.id,
                                      lesson,
                                    });
                                    setLessonTitle(lesson.title);
                                    setLessonDesc(lesson.description || "");
                                    setLessonDuration(lesson.duration_minutes || 15);
                                  }}
                                  className="p-2 text-gray-400 hover:text-[#0F2843] dark:hover:text-white rounded-xl transition-colors"
                                  title="Edit lesson"
                                >
                                  <PencilSquareIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                                  title="Delete lesson"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Lesson Creation / Edit Modal */}
      {lessonModal && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 backdrop-blur-md bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0F2843] dark:text-white">
                {lessonModal.mode === "edit" ? "Edit Lesson" : "Create New Lesson"}
              </h3>
              <button
                onClick={() => setLessonModal(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 block">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lesson 1: Number Bases and Place Value"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-[#0F2843] dark:text-white outline-none focus:border-[#0F2843]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 block">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-[#0F2843] dark:text-white outline-none focus:border-[#0F2843]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 block">
                  Description / Sub-topics
                </label>
                <textarea
                  rows="2"
                  placeholder="Brief note on what this lesson teaches"
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-[#0F2843] dark:text-white outline-none focus:border-[#0F2843]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setLessonModal(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="px-5 py-2.5 bg-[#0F2843] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50"
                >
                  {savingLesson ? "Saving..." : lessonModal.mode === "edit" ? "Update Lesson" : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Materials & Quizzes Manager Drawer */}
      {activeLesson && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-white dark:bg-gray-900 rounded-[36px] w-full max-w-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Drawer Header */}
            <div className="p-6 sm:p-8 bg-[#0F2843] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BB9E7F]">
                  Lesson Content Manager
                </span>
                <h3 className="text-lg sm:text-xl font-black truncate max-w-lg mt-0.5">
                  {activeLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveLesson(null)}
                className="p-2.5 hover:bg-white/10 rounded-2xl transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-300 hover:text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
              {/* Section 1: Materials (Videos, Documents, Slides) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0F2843] dark:text-white flex items-center gap-2">
                    <DocumentArrowUpIcon className="w-4 h-4 text-[#BB9E7F]" />
                    Materials ({materials.length})
                  </h4>
                </div>

                {loadingMaterials ? (
                  <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                ) : materials.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    No video lessons, slide decks, or documents uploaded yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-[#0F2843] text-[#BB9E7F] text-[9px] font-black uppercase">
                            {mat.type}
                          </span>
                          <span className="text-[#0F2843] dark:text-white">{mat.title}</span>
                          {mat.url && (
                            <a
                              href={mat.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                            >
                              <LinkIcon className="w-3 h-3" />
                              View Link
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Material Form */}
                <form
                  onSubmit={handleUploadMaterial}
                  className="p-5 bg-gray-50/80 dark:bg-gray-800/60 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-3"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    Upload New Lesson Material
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Material Title (e.g. Animated Video Lecture)"
                      value={matTitle}
                      onChange={(e) => setMatTitle(e.target.value)}
                      required
                      className="col-span-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold outline-none"
                    />
                    <select
                      value={matType}
                      onChange={(e) => setMatType(e.target.value)}
                      className="px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="video">Video (MP4 / YouTube / Vimeo)</option>
                      <option value="document">Document (PDF / Reading Notes / Worksheets)</option>
                      <option value="slides">Slides (Presentation Decks / PDF Slides)</option>
                      <option value="link">External Resource Link</option>
                    </select>
                    <input
                      type="text"
                      placeholder="URL (YouTube, Vimeo, Cloud Storage)"
                      value={matUrl}
                      onChange={(e) => setMatUrl(e.target.value)}
                      className="px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                      Or Upload Direct File (MP4, PDF, PPTX, DOCX)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setMatFile(e.target.files[0])}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#0F2843] file:text-white cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={uploadingMat}
                      className="px-5 py-2.5 bg-[#0F2843] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50"
                    >
                      {uploadingMat ? "Uploading..." : "Save Material"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Section 2: Lesson Practice Quizzes */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0F2843] dark:text-white flex items-center gap-2">
                    <QuestionMarkCircleIcon className="w-4 h-4 text-[#BB9E7F]" />
                    Practice Quizzes ({quizzes.length})
                  </h4>
                  {!isCreatingQuiz && (
                    <button
                      onClick={() => setIsCreatingQuiz(true)}
                      className="px-3 py-1.5 bg-[#0F2843] text-white text-[11px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Add Quiz
                    </button>
                  )}
                </div>

                {loadingQuizzes ? (
                  <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                ) : quizzes.length === 0 && !isCreatingQuiz ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    No quizzes attached to this lesson. Students can test their understanding with interactive questions.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs font-bold"
                      >
                        <div>
                          <span className="text-[#0F2843] dark:text-white font-bold">{quiz.title}</span>
                          <span className="text-gray-400 text-[10px] ml-2">
                            (Pass: {quiz.pass_percentage || 70}%)
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Create Quiz Form */}
                {isCreatingQuiz && (
                  <form
                    onSubmit={handleSaveQuiz}
                    className="p-5 bg-gray-50/80 dark:bg-gray-800/60 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Create Practice Quiz
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingQuiz(false)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Quiz Title (e.g. Quick Check: Number Systems)"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        required
                        className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Pass Percentage (e.g. 70)"
                        value={quizPassScore}
                        onChange={(e) => setQuizPassScore(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                      {quizQuestions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-4 bg-white dark:bg-gray-700/60 rounded-2xl border border-gray-200 dark:border-gray-600 space-y-3"
                        >
                          <span className="text-[10px] font-black uppercase text-[#BB9E7F]">
                            Question {qIdx + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="Enter question text..."
                            value={q.question_text}
                            onChange={(e) => {
                              const copy = [...quizQuestions];
                              copy[qIdx].question_text = e.target.value;
                              setQuizQuestions(copy);
                            }}
                            required
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold outline-none"
                          />

                          {/* Options */}
                          <div className="space-y-2">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct_${qIdx}`}
                                  checked={opt.is_correct}
                                  onChange={() => {
                                    const copy = [...quizQuestions];
                                    copy[qIdx].options = copy[qIdx].options.map((o, idx) => ({
                                      ...o,
                                      is_correct: idx === optIdx,
                                    }));
                                    setQuizQuestions(copy);
                                  }}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                  value={opt.option_text}
                                  onChange={(e) => {
                                    const copy = [...quizQuestions];
                                    copy[qIdx].options[optIdx].option_text = e.target.value;
                                    setQuizQuestions(copy);
                                  }}
                                  required
                                  className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-3 py-1.5 text-xs font-bold text-[#0F2843] dark:text-blue-300 hover:underline flex items-center gap-1"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Add Another Question
                      </button>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={savingQuiz}
                        className="px-5 py-2.5 bg-[#0F2843] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50"
                      >
                        {savingQuiz ? "Saving..." : "Save Quiz"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffDashboardLayout>
  );
}
