import React, { useState, useEffect, useCallback } from "react";
import { staffCurriculumApi } from "../../../services/curriculumService.js";
import {
  XMarkIcon,
  PlusIcon,
  BookOpenIcon,
  PlayCircleIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";

export default function AdminCurriculumStudio({ isOpen, onClose, subject, showToast }) {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [moduleLessons, setModuleLessons] = useState({}); // { [moduleId]: lessons[] }

  // Modal sub-actions
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");

  const [activeLessonModal, setActiveLessonModal] = useState(null); // { mode: 'create'|'materials', moduleId, lesson }
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState(20);
  const [newLessonDesc, setNewLessonDesc] = useState("");

  // Materials modal state
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [matTitle, setMatTitle] = useState("");
  const [matType, setMatType] = useState("video");
  const [matUrl, setMatUrl] = useState("");
  const [matFile, setMatFile] = useState(null);
  const [uploadingMat, setUploadingMat] = useState(false);

  // Load subject modules
  const loadModules = useCallback(async () => {
    if (!subject?.id) return;
    try {
      setLoading(true);
      const res = await staffCurriculumApi.getModulesBySubject(subject.id);
      const fetched = res?.modules || [];
      setModules(fetched);
      if (fetched.length > 0 && !expandedModuleId) {
        setExpandedModuleId(fetched[0].id);
      }
    } catch (err) {
      console.error("Failed to load modules:", err);
      showToast?.({ type: "error", message: "Failed to load modules for this subject." });
    } finally {
      setLoading(false);
    }
  }, [subject?.id, showToast, expandedModuleId]);

  useEffect(() => {
    if (isOpen && subject?.id) {
      loadModules();
    }
  }, [isOpen, subject?.id, loadModules]);

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

  // Create Module
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      const res = await staffCurriculumApi.createModule(subject.id, {
        title: newModuleTitle.trim(),
        description: newModuleDesc.trim(),
        order: modules.length + 1,
      });
      if (res?.module) {
        showToast?.({ type: "success", message: "Module created successfully!" });
        setNewModuleTitle("");
        setNewModuleDesc("");
        setIsCreatingModule(false);
        loadModules();
      }
    } catch (err) {
      console.error("Failed to create module:", err);
      showToast?.({ type: "error", message: "Failed to create module." });
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Are you sure you want to delete this module and all its lessons?")) return;
    try {
      await staffCurriculumApi.deleteModule(moduleId);
      showToast?.({ type: "success", message: "Module deleted." });
      loadModules();
    } catch (err) {
      console.error("Failed to delete module:", err);
      showToast?.({ type: "error", message: "Failed to delete module." });
    }
  };

  // Create Lesson
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !activeLessonModal?.moduleId) return;
    try {
      const currentLessons = moduleLessons[activeLessonModal.moduleId] || [];
      const res = await staffCurriculumApi.createLesson(activeLessonModal.moduleId, {
        title: newLessonTitle.trim(),
        description: newLessonDesc.trim(),
        durationMinutes: parseInt(newLessonDuration, 10) || 15,
        order: currentLessons.length + 1,
      });
      if (res?.lesson) {
        showToast?.({ type: "success", message: "Lesson added successfully!" });
        setNewLessonTitle("");
        setNewLessonDesc("");
        setActiveLessonModal(null);
        loadLessonsForModule(activeLessonModal.moduleId);
      }
    } catch (err) {
      console.error("Failed to create lesson:", err);
      showToast?.({ type: "error", message: "Failed to create lesson." });
    }
  };

  // Open Materials Modal for a Lesson
  const openMaterialsModal = async (lesson) => {
    setSelectedLesson(lesson);
    try {
      const res = await staffCurriculumApi.getMaterialsByLesson(lesson.id);
      setMaterials(res?.materials || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
    }
  };

  // Upload Material
  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!matTitle.trim() || !selectedLesson) return;
    try {
      setUploadingMat(true);
      const formData = new FormData();
      formData.append("title", matTitle.trim());
      formData.append("type", matType);
      if (matUrl) formData.append("url", matUrl.trim());
      if (matFile) formData.append("file", matFile);
      formData.append("order", materials.length + 1);

      const res = await staffCurriculumApi.uploadMaterial(selectedLesson.id, formData);
      if (res?.material) {
        showToast?.({ type: "success", message: "Material uploaded!" });
        setMatTitle("");
        setMatUrl("");
        setMatFile(null);
        openMaterialsModal(selectedLesson);
      }
    } catch (err) {
      console.error("Failed to upload material:", err);
      showToast?.({ type: "error", message: "Upload failed." });
    } finally {
      setUploadingMat(false);
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (matId) => {
    if (!window.confirm("Remove this material?")) return;
    try {
      await staffCurriculumApi.deleteMaterial(matId);
      showToast?.({ type: "success", message: "Material removed." });
      if (selectedLesson) openMaterialsModal(selectedLesson);
    } catch (err) {
      console.error("Failed to remove material:", err);
    }
  };

  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-[#0F2843]/60 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[92vh] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col z-10">
        
        {/* Header */}
        <div className="p-6 sm:p-8 flex items-center justify-between bg-[#0F2843] text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
              <AcademicCapIcon className="w-8 h-8 text-[#BB9E7F]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BB9E7F]">
                Curriculum Architect
              </span>
              <h2 className="text-xl sm:text-2xl font-black truncate max-w-md sm:max-w-xl">
                {subject.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-[#E83831] rounded-2xl transition-all group"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Top Actions */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#0F2843] dark:text-white uppercase tracking-wider text-xs">
                Modules ({modules.length})
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Organize learning topics and attach videos, slide PDFs, and quizzes.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingModule(true)}
              className="px-5 py-2.5 bg-[#0F2843] hover:bg-[#153457] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Module
            </button>
          </div>

          {/* Create Module Form */}
          {isCreatingModule && (
            <form
              onSubmit={handleCreateModule}
              className="p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4 animate-in slide-in-from-top-4 duration-300"
            >
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0F2843] dark:text-white">
                New Module (Topic)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Module Title (e.g. Number and Numeration)"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  required
                  className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold text-[#0F2843] dark:text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Brief description / scope (optional)"
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold text-[#0F2843] dark:text-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModule(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F2843] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm"
                >
                  Save Module
                </button>
              </div>
            </form>
          )}

          {/* Modules List */}
          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="p-12 text-center bg-gray-50 dark:bg-gray-800/40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 space-y-2">
                <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto" />
                <h4 className="font-bold text-gray-600 dark:text-gray-300">No Modules Created</h4>
                <p className="text-xs text-gray-400">Click "Add Module" to start crafting your curriculum.</p>
              </div>
            ) : (
              modules.map((mod, modIdx) => {
                const isExpanded = expandedModuleId === mod.id;
                const lessons = moduleLessons[mod.id] || [];

                return (
                  <div
                    key={mod.id}
                    className="border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800/70 overflow-hidden shadow-sm"
                  >
                    {/* Module Title Bar */}
                    <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-gray-50/60 dark:bg-gray-800">
                      <button
                        onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                        className="flex items-center gap-3 flex-1 text-left min-w-0"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#0F2843] text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                          {modIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-sm text-[#0F2843] dark:text-white truncate">
                            {mod.title}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveLessonModal({ mode: "create", moduleId: mod.id })}
                          className="px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-[11px] font-black uppercase tracking-wider text-[#0F2843] dark:text-white rounded-lg flex items-center gap-1 transition-all"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                          Add Lesson
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete module"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                          className="p-1 text-gray-400"
                        >
                          {isExpanded ? (
                            <ChevronDownIcon className="w-5 h-5" />
                          ) : (
                            <ChevronRightIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Lessons Drawer */}
                    {isExpanded && (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700/60 p-4 space-y-3 bg-white dark:bg-gray-850">
                        {lessons.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-2">
                            No lessons in this module. Click "Add Lesson" above to attach content.
                          </p>
                        ) : (
                          lessons.map((lesson, lessonIdx) => (
                            <div
                              key={lesson.id}
                              className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400">
                                  {modIdx + 1}.{lessonIdx + 1}
                                </span>
                                <div>
                                  <h5 className="font-bold text-xs sm:text-sm text-[#0F2843] dark:text-white">
                                    {lesson.title}
                                  </h5>
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    {lesson.duration_minutes || 15} mins
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                  onClick={() => openMaterialsModal(lesson)}
                                  className="px-3 py-1.5 bg-[#BB9E7F]/10 hover:bg-[#BB9E7F]/20 text-[#0F2843] dark:text-[#BB9E7F] text-[11px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all"
                                >
                                  <DocumentArrowUpIcon className="w-3.5 h-3.5" />
                                  Materials & Video
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lesson Creation Modal */}
      {activeLessonModal?.mode === "create" && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-black uppercase tracking-wider text-[#0F2843] dark:text-white">
              Create New Lesson
            </h3>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lesson 1: Number Bases and Conversion"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  required
                  className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-[#0F2843] dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Duration (Minutes)</label>
                <input
                  type="number"
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-[#0F2843] dark:text-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveLessonModal(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F2843] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                  Create Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Materials Management Drawer */}
      {selectedLesson && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 backdrop-blur-md bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#BB9E7F]">Materials Manager</span>
                <h3 className="text-base font-black text-[#0F2843] dark:text-white truncate max-w-sm">
                  {selectedLesson.title}
                </h3>
              </div>
              <button onClick={() => setSelectedLesson(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Existing Materials */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Attached Materials</h4>
              {materials.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No video or documents attached yet.</p>
              ) : (
                materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#0F2843] text-white text-[9px] uppercase font-black">
                        {mat.type}
                      </span>
                      <span className="text-[#0F2843] dark:text-white truncate max-w-xs">{mat.title}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMaterial(mat.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Material Form */}
            <form onSubmit={handleUploadMaterial} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0F2843] dark:text-white">
                Upload New Material
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Material Title"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  required
                  className="col-span-2 px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold outline-none"
                />
                <select
                  value={matType}
                  onChange={(e) => setMatType(e.target.value)}
                  className="px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="video">Video (MP4 / YouTube / Vimeo)</option>
                  <option value="document">Document (PDF / Reading Notes)</option>
                  <option value="slides">Slides (Presentation Decks / PDF Slides)</option>
                  <option value="link">External Web Link</option>
                </select>
                <input
                  type="text"
                  placeholder="External URL (YouTube, Vimeo)"
                  value={matUrl}
                  onChange={(e) => setMatUrl(e.target.value)}
                  className="px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Or Upload Local File (Video MP4 or PDF)
                </label>
                <input
                  type="file"
                  onChange={(e) => setMatFile(e.target.files[0])}
                  className="mt-1 w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0F2843] file:text-white cursor-pointer"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploadingMat}
                  className="px-5 py-2 bg-[#0F2843] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50"
                >
                  {uploadingMat ? "Uploading..." : "Save Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
