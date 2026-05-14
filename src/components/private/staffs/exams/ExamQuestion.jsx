import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import StaffDashboardLayout from "../DashboardLayout.jsx";
import { 
  PlusIcon, 
  IdentificationIcon,
  CameraIcon,
  BookOpenIcon,
  RectangleGroupIcon,
  ArrowLeftIcon,
  ListBulletIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  TrashIcon,
  PaperClipIcon,
  XMarkIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ExamBodyCreateModal from "./ExamBodyCreateModal";
import ExamYearCreateModal from "./ExamYearCreateModal";
import SymbolPicker from "../../../common/SymbolPicker";

export default function ExamQuestion() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");
  const navigate = useNavigate();
  const { id: editQuestionId } = useParams();
  const isEditMode = Boolean(editQuestionId);

  // Edit mode tracking
  const [existingGroupId, setExistingGroupId] = useState(null);

  // Form State
  const [examBodyId, setExamBodyId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examYearId, setExamYearId] = useState("");
  
  // Exam Group State
  const [groupType, setGroupType] = useState("none");
  const [groupTitle, setGroupTitle] = useState("");
  const [groupContent, setGroupContent] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [groupImagePreview, setGroupImagePreview] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);

  // Questions Batch State
  const [questions, setQuestions] = useState([
    {
      tempId: Date.now(),
      questionNumber: "",
      questionText: "",
      questionType: "multiple_choice",
      marks: 1,
      explanation: "",
      status: "active",
      options: [
        { label: "A", option_text: "", is_correct: false, sort_order: 1 },
        { label: "B", option_text: "", is_correct: false, sort_order: 2 },
        { label: "C", option_text: "", is_correct: false, sort_order: 3 },
        { label: "D", option_text: "", is_correct: false, sort_order: 4 },
      ],
      files: [],
      captions: [],
      isExpanded: true,
      isSaved: false
    }
  ]);

  // Data Lists
  const [examBodies, setExamBodies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examYears, setExamYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [messageToast, setMessageToast] = useState(null);

  // Sub-modal visibility
  const [isExamBodyModalOpen, setIsExamBodyModalOpen] = useState(false);
  const [isExamYearModalOpen, setIsExamYearModalOpen] = useState(false);

  useEffect(() => {
    if (messageToast) {
      const timer = setTimeout(() => setMessageToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [messageToast]);

  const fetchInitialData = useCallback(async () => {
    setFetchingData(true);
    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        } 
      };
      console.log("[ExamQuestion] Fetching Initial Meta Data (Bodies, Courses, Years)");
      const [bodiesRes, coursesRes, yearsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/exam-bodies/all`, config),
        axios.get(`${API_BASE_URL}/api/courses`, config),
        axios.get(`${API_BASE_URL}/api/admin/exam-years/all`, config)
      ]);

      console.log("[ExamQuestion] Meta Response (Bodies):", bodiesRes.data);
      console.log("[ExamQuestion] Meta Response (Courses):", coursesRes.data);
      console.log("[ExamQuestion] Meta Response (Years):", yearsRes.data);

      setExamBodies(bodiesRes.data?.exam_bodies || bodiesRes.data?.data || bodiesRes.data || []);
      setCourses(coursesRes.data?.data || coursesRes.data?.courses || []);
      setExamYears(yearsRes.data?.data || yearsRes.data?.exam_years || yearsRes.data || []);
      setFilteredYears(yearsRes.data?.data || yearsRes.data?.exam_years || yearsRes.data || []);

      // Load saved selections
      const savedBodyId = localStorage.getItem("selected_exam_body_id");
      const savedSubjectId = localStorage.getItem("selected_subject_id");
      const savedYearId = localStorage.getItem("selected_exam_year_id");

      if (savedBodyId) setExamBodyId(savedBodyId);
      if (savedSubjectId) setSubjectId(savedSubjectId);
      if (savedYearId) setExamYearId(savedYearId);

    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setFetchingData(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Load existing question data in edit mode
  useEffect(() => {
    if (!isEditMode || !editQuestionId) return;
    const loadQuestion = async () => {
      try {
        const config = { 
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          } 
        };
        console.log("[ExamQuestion] Fetching Question for Edit:", `${API_BASE_URL}/api/admin/past-questions/${editQuestionId}`);
        const res = await axios.get(`${API_BASE_URL}/api/admin/past-questions/${editQuestionId}`, config);
        console.log("[ExamQuestion] Question Data Response:", res.data);
        const q = res.data?.data || res.data;

        const loadedOptions = (q.options && q.options.length > 0) 
          ? q.options.map((opt, i) => ({
              id: opt.id,
              label: opt.label || String.fromCharCode(65 + i),
              option_text: opt.option_text || "",
              is_correct: Boolean(opt.is_correct),
              sort_order: opt.sort_order || i + 1,
            }))
          : [
              { label: "A", option_text: "", is_correct: false, sort_order: 1 },
              { label: "B", option_text: "", is_correct: false, sort_order: 2 },
              { label: "C", option_text: "", is_correct: false, sort_order: 3 },
              { label: "D", option_text: "", is_correct: false, sort_order: 4 },
            ];

        setQuestions([{
          tempId: Date.now(),
          questionNumber: q.question_number || "",
          questionText: q.question || q.question_text || q.text || "",
          questionType: q.question_type || "multiple_choice",
          marks: q.marks || 1,
          explanation: q.explanation || q.explanation_text || "",
          status: q.status || "active",
          options: loadedOptions,
          files: [], // Files handling might need refinement for edit mode
          captions: [],
          isExpanded: true,
          isSaved: false
        }]);

        setExamYearId(String(q.exam_year_id || ""));
        
        // Load group info
        if (q.past_question_group_id && q.group) {
          setExistingGroupId(q.past_question_group_id);
          setGroupType(q.group.type || "none");
          setGroupTitle(q.group.title || "");
          setGroupContent(q.group.content || "");
          setSortOrder(q.group.sort_order || 1);
          if (q.group.image) setGroupImagePreview(q.group.image);
        }

        // Try to infer exam body from year
        if (q.exam_year?.exam_body_id) {
          setExamBodyId(String(q.exam_year.exam_body_id));
        }
      } catch (err) {
        console.error("Failed to load question:", err);
      }
    };
    loadQuestion();
  }, [isEditMode, editQuestionId, API_BASE_URL, token]);

  // Filter years and subjects when context changes
  useEffect(() => {
    const selectedBody = examBodies.find(b => String(b.id) === String(examBodyId));
    const inferredCourseId = selectedBody?.course_id || "";
    setCourseId(inferredCourseId);

    // Filter Subjects (Fetch from API)
    const fetchSubjects = async () => {
      if (!inferredCourseId) {
        setSubjects([]);
        return;
      }
      try {
        const config = { 
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          } 
        };
        const res = await axios.get(`${API_BASE_URL}/api/courses/${inferredCourseId}/subjects`, config);
        setSubjects(res.data?.data || res.data?.subjects || []);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      }
    };
    fetchSubjects();

    // Filter Years (In-memory)
    let filtered = [...examYears];
    if (examBodyId) {
      filtered = filtered.filter(y => String(y.exam_body_id) === String(examBodyId));
    }
    if (subjectId) {
      filtered = filtered.filter(y => String(y.subject_id) === String(subjectId));
    }
    setFilteredYears(filtered);

  }, [examBodyId, subjectId, examBodies, examYears, API_BASE_URL, token]);

  const handleSubjectChange = (id) => {
    setSubjectId(id);
    if (id) {
      localStorage.setItem("selected_subject_id", id);
    } else {
      localStorage.removeItem("selected_subject_id");
    }
  };

  const handleBodyChange = (id) => {
    setExamBodyId(id);
    if (id) {
      localStorage.setItem("selected_exam_body_id", id);
    } else {
      localStorage.removeItem("selected_exam_body_id");
    }
  };

  const handleYearChange = (id) => {
    setExamYearId(id);
    if (id) {
      localStorage.setItem("selected_exam_year_id", id);
    } else {
      localStorage.removeItem("selected_exam_year_id");
    }
  };

  const handleCreateSuccess = async (type, newData) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    if (type === "exam-body") {
      const res = await axios.get(`${API_BASE_URL}/api/admin/exam-bodies/all`, config);
      const bodies = res.data?.exam_bodies || res.data?.data || res.data || [];
      setExamBodies(bodies);
      setExamBodyId(newData.id);
    } else if (type === "exam-year") {
      const res = await axios.get(`${API_BASE_URL}/api/admin/exam-years/all`, config);
      const years = res.data?.data || res.data?.exam_years || res.data || [];
      setExamYears(years);
      setExamYearId(newData.id);
    }
  };

  const handleGroupImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(file);
      setGroupImagePreview(URL.createObjectURL(file));
    }
  };

  // Questions Batch Logic
  const addQuestion = () => {
    if (questions.length >= 5) {
      setMessageToast({ type: "error", message: "Maximum 5 questions per batch." });
      return;
    }
    const newQuestion = {
      tempId: Date.now(),
      questionNumber: "",
      questionText: "",
      questionType: "multiple_choice",
      marks: 1,
      explanation: "",
      status: "active",
      options: [
        { label: "A", option_text: "", is_correct: false, sort_order: 1 },
        { label: "B", option_text: "", is_correct: false, sort_order: 2 },
        { label: "C", option_text: "", is_correct: false, sort_order: 3 },
        { label: "D", option_text: "", is_correct: false, sort_order: 4 },
      ],
      files: [],
      captions: [],
      isExpanded: true,
      isSaved: false
    };

    setQuestions(prev => prev.map(q => ({ ...q, isExpanded: false })).concat(newQuestion));
  };

  const removeQuestion = (qIdx) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== qIdx));
  };

  const toggleExpand = (qIdx) => {
    setQuestions(prev => prev.map((q, i) => ({
      ...q,
      isExpanded: i === qIdx ? !q.isExpanded : false
    })));
  };

  const updateQuestionField = (qIdx, field, value) => {
    const newQuestions = [...questions];
    newQuestions[qIdx][field] = value;
    setQuestions(newQuestions);
  };

  const isDuplicateNumber = (qIdx, num) => {
    if (!num) return false;
    return questions.some((q, i) => i !== qIdx && q.questionNumber === num);
  };

  // Option Handlers
  const isScienceSubject = () => {
    const scienceKeywords = ["math", "physic", "chemist", "biolog", "science", "further maths", "geograph", "agric"];
    const currentSubject = subjects.find(s => String(s.id) === String(subjectId));
    const name = (currentSubject?.name || "").toLowerCase();
    return scienceKeywords.some(key => name.includes(key));
  };

  const insertSymbol = (qIdx, optIdx, symbol) => {
    const input = document.getElementById(`option-input-${qIdx}-${optIdx}`);
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = questions[qIdx].options[optIdx].option_text;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + symbol + after;

    handleOptionChange(qIdx, optIdx, "option_text", newText);

    // Reset cursor position after React re-render
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  const handleOptionChange = (qIdx, optIdx, field, value) => {
    const newQuestions = [...questions];
    const q = newQuestions[qIdx];
    const newOptions = [...q.options];

    if (field === "is_correct" && q.questionType === "multiple_choice") {
      newOptions.forEach((opt, i) => opt.is_correct = i === optIdx ? value : false);
    } else {
      newOptions[optIdx][field] = value;
    }

    q.options = newOptions;
    setQuestions(newQuestions);
  };

  const addOption = (qIdx) => {
    const newQuestions = [...questions];
    const q = newQuestions[qIdx];
    const nextLabel = String.fromCharCode(65 + q.options.length);
    q.options = [...q.options, { label: nextLabel, option_text: "", is_correct: false, sort_order: q.options.length + 1 }];
    setQuestions(newQuestions);
  };

  const removeOption = async (qIdx, optIdx) => {
    const q = questions[qIdx];
    if (q.options.length <= 2) return;
    const optToRemove = q.options[optIdx];

    if (isEditMode && optToRemove.id) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_BASE_URL}/api/admin/past-question-options/destroy/${optToRemove.id}`, config);
      } catch (err) {
        console.error("Failed to delete option:", err);
        return;
      }
    }

    const newQuestions = [...questions];
    newQuestions[qIdx].options = q.options.filter((_, i) => i !== optIdx).map((opt, i) => ({
      ...opt,
      label: String.fromCharCode(65 + i),
      sort_order: i + 1
    }));
    setQuestions(newQuestions);
  };

  // File Handlers
  const handleQuestionFilesChange = (qIdx, e) => {
    const files = Array.from(e.target.files);
    const newQuestions = [...questions];
    newQuestions[qIdx].files = [...newQuestions[qIdx].files, ...files];
    newQuestions[qIdx].captions = [...newQuestions[qIdx].captions, ...files.map(() => "")];
    setQuestions(newQuestions);
  };

  const removeFile = (qIdx, fIdx) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].files = newQuestions[qIdx].files.filter((_, i) => i !== fIdx);
    newQuestions[qIdx].captions = newQuestions[qIdx].captions.filter((_, i) => i !== fIdx);
    setQuestions(newQuestions);
  };

  const handleCaptionChange = (qIdx, fIdx, value) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].captions[fIdx] = value;
    setQuestions(newQuestions);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ") : "";
    const config = {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data"
      }
    };

    try {
      // 1. Create or Update Group (Shared for the batch)
      let currentGroupId = existingGroupId;
      if (groupType !== "none" && !currentGroupId) {
        const groupFormData = new FormData();
        groupFormData.append("exam_year_id", examYearId);
        groupFormData.append("type", groupType);
        groupFormData.append("title", groupTitle);
        groupFormData.append("content", stripHtml(groupContent));
        groupFormData.append("sort_order", sortOrder);
        if (groupImage) groupFormData.append("image", groupImage);

        const groupRes = await axios.post(`${API_BASE_URL}/api/admin/past-question-groups`, groupFormData, config);
        currentGroupId = groupRes.data?.data?.id || groupRes.data?.id;
        setExistingGroupId(currentGroupId);
      } else if (currentGroupId && groupType !== "none") {
        // Update existing group if needed (could be optimized)
        const groupFormData = new FormData();
        groupFormData.append("exam_year_id", examYearId);
        groupFormData.append("type", groupType);
        groupFormData.append("title", groupTitle);
        groupFormData.append("content", stripHtml(groupContent));
        groupFormData.append("sort_order", sortOrder);
        if (groupImage) groupFormData.append("image", groupImage);
        await axios.put(`${API_BASE_URL}/api/admin/past-question-groups/update/${currentGroupId}`, groupFormData, config);
      }

      // 2. Process Questions
      const unsavedQuestions = questions.filter(q => !q.isSaved);
      
      for (const q of unsavedQuestions) {
        const questionFormData = new FormData();
        questionFormData.append("exam_year_id", examYearId);
        if (currentGroupId) questionFormData.append("past_question_group_id", currentGroupId);
        questionFormData.append("question_number", q.questionNumber);
        questionFormData.append("question", stripHtml(q.questionText));
        questionFormData.append("question_type", q.questionType);
        questionFormData.append("marks", q.marks);
        questionFormData.append("explanation", stripHtml(q.explanation));
        questionFormData.append("status", q.status);

        // Options
        q.options.forEach((opt, index) => {
          questionFormData.append(`options[${index}][label]`, opt.label);
          questionFormData.append(`options[${index}][option_text]`, opt.option_text);
          questionFormData.append(`options[${index}][is_correct]`, opt.is_correct ? 1 : 0);
          questionFormData.append(`options[${index}][sort_order]`, opt.sort_order);
        });

        // Files
        q.files.forEach((file, index) => {
          questionFormData.append(`files[${index}]`, file);
          questionFormData.append(`captions[${index}]`, q.captions[index] || "");
        });

        if (isEditMode && editQuestionId) {
          console.log(`[ExamQuestion] Updating Question ${editQuestionId}`);
          await axios.put(`${API_BASE_URL}/api/admin/past-questions/update/${editQuestionId}`, questionFormData, config);
        } else {
          console.log(`[ExamQuestion] Creating Question ${q.questionNumber}`);
          await axios.post(`${API_BASE_URL}/api/admin/past-questions`, questionFormData, config);
        }

        // Mark as saved in local state
        setQuestions(prev => prev.map(item => item.tempId === q.tempId ? { ...item, isSaved: true } : item));
      }

      setMessageToast({ 
        type: "success", 
        message: isEditMode ? "Question updated successfully!" : `${unsavedQuestions.length} Question(s) processed successfully!` 
      });

      // Clear saved questions if not in edit mode
      if (!isEditMode) {
        setTimeout(() => {
          // Keep only unsaved questions (if any errors occurred) or reset if all saved
          setQuestions(prev => {
            const stillUnsaved = prev.filter(q => !q.isSaved);
            if (stillUnsaved.length === 0) {
              // Reset to one blank question if all were saved
              return [{
                tempId: Date.now(),
                questionNumber: "",
                questionText: "",
                questionType: "multiple_choice",
                marks: 1,
                explanation: "",
                status: "active",
                options: [
                  { label: "A", option_text: "", is_correct: false, sort_order: 1 },
                  { label: "B", option_text: "", is_correct: false, sort_order: 2 },
                  { label: "C", option_text: "", is_correct: false, sort_order: 3 },
                  { label: "D", option_text: "", is_correct: false, sort_order: 4 },
                ],
                files: [],
                captions: [],
                isExpanded: true,
                isSaved: false
              }];
            }
            return stillUnsaved;
          });
        }, 2000);
      }

    } catch (error) {
      console.error("Submit Error:", error);
      setMessageToast({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to save batch. Check for duplicate numbers." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasUnsaved = questions.some(q => !q.isSaved && (q.questionText || q.questionNumber));
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [questions]);

  return (
    <StaffDashboardLayout pagetitle="Exam Question">
      {/* Toast Notification */}
      {messageToast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[250] px-8 py-4 rounded-2xl shadow-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-10 transition-all ${
          messageToast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {messageToast.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
          {messageToast.message}
        </div>
      )}

      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        
        {/* Back Navigation */}
        <button 
          onClick={() => navigate("/staffs/manage-exams")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#0F2843] dark:hover:text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8 transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Page Header Card */}
        <div className="bg-[#0F2843] rounded-[40px] p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-[32px] flex items-center justify-center backdrop-blur-md">
                <IdentificationIcon className="w-8 h-8 md:w-10 md:h-10 text-[#BB9E7F]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase">{isEditMode ? "Edit Question" : "New Question"}</h1>
                <p className="text-[#BB9E7F] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mt-2">{isEditMode ? "Update Existing Question" : "Forge Questions & Groups"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-3xl backdrop-blur-sm border border-white/10">
              <div className={`w-3 h-3 rounded-full ${isEditMode ? 'bg-amber-400' : 'bg-green-400'} animate-pulse`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{isEditMode ? 'Edit Mode' : 'Create Mode'}</span>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#BB9E7F]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        </div>

        {/* Unified Form Container */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-gray-700 overflow-hidden">
          <div className="p-8 md:p-12 space-y-16">
            
            {/* Primary Configuration Section */}
            <div className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Exam Body Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Exam Body</label>
                  <button 
                    type="button" 
                    onClick={() => setIsExamBodyModalOpen(true)}
                    className="text-[10px] font-black text-[#BB9E7F] hover:text-[#0F2843] flex items-center gap-1 transition-colors uppercase"
                  >
                    <PlusIcon className="w-3 h-3" /> New Body
                  </button>
                </div>
                <div className="relative group">
                  <select 
                    value={examBodyId}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-inner"
                  >
                    <option value="">Select Exam Body</option>
                    {examBodies.map(body => (
                      <option key={body.id} value={body.id}>{body.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Selection */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Subject Module</label>
                <div className="relative group">
                  <select 
                    value={subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    required
                    disabled={!courseId}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-inner disabled:opacity-50"
                  >
                    <option value="">{courseId ? "Select Subject" : "Select a course first"}</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exam Year Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Exam Year</label>
                  <button 
                    type="button" 
                    onClick={() => setIsExamYearModalOpen(true)}
                    disabled={!examBodyId || !subjectId}
                    className="text-[10px] font-black text-[#BB9E7F] hover:text-[#0F2843] flex items-center gap-1 transition-colors uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-3 h-3" /> New Year
                  </button>
                </div>
                <div className="relative group">
                  <select 
                    value={examYearId}
                    onChange={(e) => handleYearChange(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-inner"
                  >
                    <option value="">Select Exam Year</option>
                    {filteredYears.map(year => (
                      <option key={year.id} value={year.id}>{year.year} - {year.exam_body?.name || "Exam Body"}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exam Group Category Selection */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Exam Group Category</label>
                <div className="relative group">
                  <select 
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-inner"
                  >
                    <option value="none">None (Single Question)</option>
                    <option value="comprehension">Comprehension</option>
                    <option value="instruction">Instruction</option>
                    <option value="diagram">Diagram</option>
                    <option value="case_study">Case Study</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

            {/* Conditional Exam Group Section */}
            {groupType !== "none" && (
              <div className="pt-16 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-8 duration-500">
              
              <div className="flex items-center gap-6 mb-12">
                <div className="w-14 h-14 bg-[#BB9E7F]/10 rounded-[24px] flex items-center justify-center">
                  <RectangleGroupIcon className="w-7 h-7 text-[#BB9E7F]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Group Assets</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Configure shared context for this question module</p>
                </div>
              </div>

              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Group Title */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Title</label>
                    <input 
                      type="text"
                      value={groupTitle}
                      onChange={(e) => setGroupTitle(e.target.value)}
                      placeholder="e.g. Passage A: The Industrial Revolution"
                      className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner"
                    />
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Sort Order</label>
                    <input 
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner"
                    />
                  </div>
                </div>

                {/* Group Content (WYSIWYG) */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Content / Narrative</label>
                  <div className="quill-wrapper bg-gray-50 dark:bg-gray-900 rounded-[32px] border-2 border-transparent focus-within:border-[#BB9E7F]/30 overflow-hidden shadow-inner [&_.ql-editor]:min-h-[250px] [&_.ql-toolbar]:bg-white dark:[&_.ql-toolbar]:bg-gray-800">
                    <ReactQuill
                      theme="snow"
                      value={groupContent || ""}
                      onChange={setGroupContent}
                      placeholder="Enter the comprehension text, instructions, or scenario details here..."
                      className="[&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["blockquote", "link"],
                          ["clean"],
                        ],
                      }}
                    />
                  </div>
                </div>

                {/* Group Image Upload */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Visual Aid (Optional)</label>
                  <div className={`relative group border-2 border-dashed rounded-[40px] overflow-hidden bg-gray-50 dark:bg-gray-900/50 transition-all ${
                    groupImagePreview ? "border-[#76D287]/30" : "border-gray-200 dark:border-gray-700 hover:border-[#BB9E7F]/40"
                  }`}>
                    {groupImagePreview ? (
                      <div className="relative aspect-video">
                        <img src={groupImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                          <CameraIcon className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-16 flex flex-col items-center justify-center text-center gap-6 cursor-pointer">
                        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[32px] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BookOpenIcon className="w-12 h-12 text-[#BB9E7F]" />
                        </div>
                        <div>
                          <p className="text-[#0F2843] dark:text-white font-black text-xl">Upload Visual Assets</p>
                          <p className="text-gray-400 text-sm font-bold mt-2">Diagrams, maps, or illustrations for this group</p>
                        </div>
                      </div>
                    )}
                    <input type="file" onChange={handleGroupImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Batch Section */}
          <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-12 px-8 md:px-12">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-[24px] flex items-center justify-center text-blue-500">
                    <DocumentTextIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Question Batch</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Design up to 5 questions for this group</p>
                  </div>
                </div>
                
                {!isEditMode && (
                  <button 
                    type="button"
                    onClick={addQuestion}
                    disabled={questions.length >= 5}
                    className="px-6 py-3 bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" /> Add Another Question
                  </button>
                )}
              </div>

              <div className="space-y-0">
                {questions.map((q, qIdx) => {
                  // Helper to strip HTML for summary
                  const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ") : "";
                  const textSnippet = stripHtml(q.questionText);

                  return (
                    <div key={q.tempId} className="border-t border-gray-100 dark:border-gray-700 first:border-t-0">
                      {/* Question Header / Toggle */}
                      <div 
                        onClick={() => toggleExpand(qIdx)}
                        className={`p-6 md:p-10 flex items-center justify-between cursor-pointer transition-all ${q.isExpanded ? 'bg-gray-50/80 dark:bg-gray-900/40' : 'hover:bg-gray-50 dark:hover:bg-gray-900/20'}`}
                      >
                        <div className="flex items-center gap-6 flex-1 overflow-hidden">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${q.isExpanded ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-[#0F2843] dark:text-white'}`}>
                            {q.questionNumber || qIdx + 1}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="text-sm md:text-base font-black text-[#0F2843] dark:text-white uppercase tracking-tight truncate">
                              {q.isExpanded ? (isEditMode ? 'Editing Question' : 'Question Configuration') : (textSnippet ? textSnippet.substring(0, 80) + '...' : 'Blank Question')}
                            </h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                              {q.isSaved ? (
                                <span className="text-green-500 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> Successfully Saved</span>
                              ) : (
                                <span>{q.isExpanded ? 'Filling Details' : 'Draft - Click to Expand'}</span>
                              )}
                              <span className="opacity-30">•</span>
                              <span>{q.questionType.replace('_', ' ')}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          {questions.length > 1 && !isEditMode && (
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); removeQuestion(qIdx); }}
                              className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                          <div className={`transform transition-transform duration-300 ${q.isExpanded ? 'rotate-180' : ''}`}>
                             <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Question Form Content */}
                      {q.isExpanded && (
                        <div className="p-8 md:p-12 space-y-10 animate-in slide-in-from-top-4 duration-300 bg-white dark:bg-gray-800">
                          {/* Question Header: Number & Type & Marks */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Q. Number</label>
                              <div className="relative">
                                <input 
                                  type="text"
                                  value={q.questionNumber}
                                  onChange={(e) => updateQuestionField(qIdx, "questionNumber", e.target.value)}
                                  placeholder="e.g. 01"
                                  className={`w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 rounded-[24px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner ${
                                    isDuplicateNumber(qIdx, q.questionNumber) ? "border-red-500/50 focus:border-red-500" : "border-transparent focus:border-blue-500/30"
                                  }`}
                                />
                                {isDuplicateNumber(qIdx, q.questionNumber) && (
                                  <p className="absolute -bottom-5 left-4 text-[8px] text-red-500 font-black uppercase tracking-widest">Duplicate Number</p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Question Type</label>
                              <select 
                                value={q.questionType}
                                onChange={(e) => updateQuestionField(qIdx, "questionType", e.target.value)}
                                className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/30 rounded-[24px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner appearance-none"
                              >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="true_false">True / False</option>
                                <option value="short_answer">Short Answer</option>
                                <option value="essay">Essay / Theory</option>
                              </select>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Marks</label>
                              <input 
                                type="number"
                                value={q.marks}
                                onChange={(e) => updateQuestionField(qIdx, "marks", e.target.value)}
                                className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/30 rounded-[24px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Multi-File Upload Section */}
                          <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center px-1">
                              <div className="flex items-center gap-3">
                                <PaperClipIcon className="w-5 h-5 text-blue-500" />
                                <label className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Question Attachments</label>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {q.files.map((file, fIdx) => (
                                <div key={fIdx} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[32px] border-2 border-gray-100 dark:border-gray-700 relative group animate-in zoom-in-95">
                                  <button 
                                    type="button"
                                    onClick={() => removeFile(qIdx, fIdx)}
                                    className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 text-red-500 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                                      <DocumentTextIcon className="w-6 h-6" />
                                    </div>
                                    <div className="overflow-hidden">
                                      <p className="text-xs font-black text-[#0F2843] dark:text-white truncate uppercase tracking-tight">{file.name}</p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase">{(file.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                  </div>
                                  <input 
                                    type="text"
                                    value={q.captions[fIdx]}
                                    onChange={(e) => handleCaptionChange(qIdx, fIdx, e.target.value)}
                                    placeholder="Add a caption for this file..."
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl text-[11px] font-bold outline-none"
                                  />
                                </div>
                              ))}
                              
                              <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[32px] hover:border-blue-500/40 transition-all group flex flex-col items-center justify-center p-8 min-h-[160px] cursor-pointer">
                                <div className="w-12 h-12 bg-blue-500/5 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                  <PlusIcon className="w-6 h-6 text-blue-500" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attach Diagram / File</p>
                                <input type="file" multiple onChange={(e) => handleQuestionFilesChange(qIdx, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                            </div>
                          </div>

                          {/* Question Text (WYSIWYG) */}
                          <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Question Text</label>
                            <div className="quill-wrapper bg-gray-50 dark:bg-gray-900 rounded-[32px] border-2 border-transparent focus-within:border-blue-500/30 overflow-hidden shadow-inner [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!">
                              <ReactQuill theme="snow" value={q.questionText} onChange={(val) => updateQuestionField(qIdx, "questionText", val)} placeholder="Type your question here..." />
                            </div>
                          </div>

                          {/* Options Section (Only for MCQ/TrueFalse) */}
                          {(q.questionType === "multiple_choice" || q.questionType === "true_false") && (
                            <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-3">
                                  <ListBulletIcon className="w-5 h-5 text-blue-500" />
                                  <label className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Options & Answers</label>
                                </div>
                                {q.questionType === "multiple_choice" && (
                                  <button 
                                    type="button" 
                                    onClick={() => addOption(qIdx)}
                                    className="text-[10px] font-black text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors uppercase"
                                  >
                                    <PlusIcon className="w-3 h-3" /> Add Option
                                  </button>
                                )}
                              </div>

                              <div className="space-y-4">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in duration-300">
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center font-black text-[#0F2843] dark:text-white shrink-0">
                                      {opt.label}
                                    </div>
                                    <div className="flex-1 relative group/input w-full">
                                      <input 
                                        id={`option-input-${qIdx}-${optIdx}`}
                                        type="text"
                                        value={opt.option_text}
                                        onChange={(e) => handleOptionChange(qIdx, optIdx, "option_text", e.target.value)}
                                        placeholder={`Option ${opt.label} text...`}
                                        className="w-full px-6 py-4 pr-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/30 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none shadow-inner"
                                      />
                                      {isScienceSubject() && (
                                        <SymbolPicker 
                                          onSelect={(sym) => insertSymbol(qIdx, optIdx, sym)} 
                                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-100 transition-opacity" 
                                        />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleOptionChange(qIdx, optIdx, "is_correct", !opt.is_correct)}
                                        className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                                          opt.is_correct 
                                            ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-200 dark:shadow-none" 
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-400 border-transparent hover:border-gray-200"
                                        }`}
                                      >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        {opt.is_correct ? "Correct" : "Mark Correct"}
                                      </button>
                                      {q.questionType === "multiple_choice" && q.options.length > 2 && (
                                        <button 
                                          type="button" 
                                          onClick={() => removeOption(qIdx, optIdx)}
                                          className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                          <TrashIcon className="w-5 h-5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Explanation Section */}
                          <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Explanation / Answer Key</label>
                            <div className="quill-wrapper bg-gray-50 dark:bg-gray-900 rounded-[32px] border-2 border-transparent focus-within:border-blue-500/30 overflow-hidden shadow-inner [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!">
                              <ReactQuill theme="snow" value={q.explanation} onChange={(val) => updateQuestionField(qIdx, "explanation", val)} placeholder="Explain why the answer is correct..." />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Batch Actions Footer */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-12 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => navigate("/staffs/manage-exams")}
                className="w-full md:flex-1 py-6 bg-white dark:bg-gray-700 text-gray-400 font-black rounded-[28px] hover:text-gray-600 transition-all uppercase tracking-[0.2em] text-xs border border-gray-100 dark:border-gray-600 shadow-sm"
              >
                Back to Dashboard
              </button>
              <button 
                type="submit"
                disabled={loading || fetchingData || questions.some((q, i) => isDuplicateNumber(i, q.questionNumber))}
                className="w-full md:flex-[2] py-6 bg-[#0F2843] text-white font-black rounded-[28px] shadow-2xl shadow-[#0F2843]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3"
              >
                {loading ? "Processing Batch..." : (isEditMode ? "Update Changes" : `Create ${questions.length} Question${questions.length > 1 ? 's' : ''}`)}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Sub-modals */}
      <ExamBodyCreateModal 
        isOpen={isExamBodyModalOpen}
        onClose={() => setIsExamBodyModalOpen(false)}
        onSuccess={(data) => handleCreateSuccess("exam-body", data)}
        initialCourses={courses}
      />

      <ExamYearCreateModal 
        isOpen={isExamYearModalOpen}
        onClose={() => setIsExamYearModalOpen(false)}
        onSuccess={(data) => handleCreateSuccess("exam-year", data)}
        examBodies={examBodies}
        courseId={courseId}
        selectedExamBodyId={examBodyId}
      />
    </StaffDashboardLayout>
  );
}
