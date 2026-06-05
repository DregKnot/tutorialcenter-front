import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  XMarkIcon, 
  CheckIcon, 
  PlusIcon, 
  ListBulletIcon,
  DocumentTextIcon,
  TrashIcon,
  PaperClipIcon,
  PhotoIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import SymbolPicker from "../../../common/SymbolPicker";
import { Icon } from "@iconify/react";

// Quill configuration matching QuestionItem.jsx — includes superscript/subscript support
const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'indent', 'link', 'image', 'video', 'script'
];

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

export default function QuestionEditModal({ isOpen, onClose, question, onSuccess, existingQuestions }) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const [questionText, setQuestionText] = useState(() => question ? (question.question || question.question_text || question.text || "") : "");
  const [questionNumber, setQuestionNumber] = useState(() => question ? (question.question_number || question.questionNumber || "") : "");
  const [questionType, setQuestionType] = useState(() => question ? (question.question_type || "true_false") : "true_false");
  const [marks, setMarks] = useState(() => question ? (question.marks || 1) : 1);
  const [options, setOptions] = useState(() => question ? (question.options || []) : []);
  const [explanation, setExplanation] = useState(() => question ? (question.explanation || question.explanation_text || "") : "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // File/Image states
  const [existingFiles, setExistingFiles] = useState([]); // Files already on the server
  const [newFiles, setNewFiles] = useState([]);            // New File objects to upload
  const [newCaptions, setNewCaptions] = useState([]);      // Captions for new files
  const [filesToDelete, setFilesToDelete] = useState([]);   // IDs of existing files to remove

  // Group Details States
  const [groupTitle, setGroupTitle] = useState("");
  const [groupContent, setGroupContent] = useState("");
  const [groupSortOrder, setGroupSortOrder] = useState(1);
  const [groupType, setGroupType] = useState("comprehension");
  const [groupImagePreview, setGroupImagePreview] = useState(null);
  const [groupImageFile, setGroupImageFile] = useState(null);

  // Group selection states
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isGroupCreationMode, setIsGroupCreationMode] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const fetchGroups = async () => {
      try {
        const config = { 
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          } 
        };
        const res = await axios.get(`${API_BASE_URL}/api/admin/past-question-groups/all`, config);
        const fetchedGroups = res.data?.groups?.data || res.data?.data || res.data || [];
        setAllGroups(Array.isArray(fetchedGroups) ? fetchedGroups : []);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };
    fetchGroups();
  }, [isOpen, API_BASE_URL, token]);

  useEffect(() => {
    if (question) {
      console.log("[QuestionEditModal] Populating with question:", question);
      const text = question.question || question.question_text || question.text || "";
      setQuestionText(text);
      setQuestionNumber(question.question_number || question.questionNumber || "");
      setQuestionType(question.question_type || "true_false");
      setMarks(question.marks || 1);
      setOptions(question.options || []);
      setExplanation(question.explanation || question.explanation_text || "");

      // Populate existing files/images from the question data
      const questionFiles = question.files || question.images || question.attachments || [];
      setExistingFiles(questionFiles.map(f => ({
        id: f.id,
        file_path: f.file_path || f.path || f.url || "",
        caption: f.caption || "",
        original_name: f.original_name || f.name || f.file_path || "Attachment"
      })));
      setNewFiles([]);
      setNewCaptions([]);
      setFilesToDelete([]);

      // Populate group details if the question belongs to a group
      const groupData = question.group || question.past_question_group;
      if (question.past_question_group_id && groupData) {
        setSelectedGroupId(question.past_question_group_id || groupData.id);
        setGroupSearchTerm(groupData.title || "");
        setIsGroupCreationMode(false);
        setGroupTitle(groupData.title || "");
        setGroupContent(groupData.content || "");
        setGroupSortOrder(groupData.sort_order || 1);
        setGroupType(groupData.type || "comprehension");
        if (groupData.image) {
          setGroupImagePreview(groupData.image.startsWith('http') ? groupData.image : `${API_BASE_URL}/storage/${groupData.image}`);
        } else {
          setGroupImagePreview(null);
        }
        setGroupImageFile(null);
      } else {
        setSelectedGroupId("");
        setGroupSearchTerm("");
        setIsGroupCreationMode(false);
        setGroupTitle("");
        setGroupContent("");
        setGroupSortOrder(1);
        setGroupType("comprehension");
        setGroupImagePreview(null);
        setGroupImageFile(null);
      }
    }
  }, [question, API_BASE_URL]);

  const handleGroupImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImageFile(file);
      setGroupImagePreview(URL.createObjectURL(file));
    }
  };

  // File handlers for question attachments
  const handleNewFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
    setNewCaptions(prev => [...prev, ...files.map(() => "")]);
  };

  const removeNewFile = (fIdx) => {
    setNewFiles(prev => prev.filter((_, i) => i !== fIdx));
    setNewCaptions(prev => prev.filter((_, i) => i !== fIdx));
  };

  const updateNewCaption = (fIdx, value) => {
    setNewCaptions(prev => prev.map((c, i) => i === fIdx ? value : c));
  };

  const removeExistingFile = (fileId) => {
    setFilesToDelete(prev => [...prev, fileId]);
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateExistingCaption = (fileId, value) => {
    setExistingFiles(prev => prev.map(f => f.id === fileId ? { ...f, caption: value } : f));
  };

  const getFilePreviewUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    return `${API_BASE_URL}/storage/${filePath}`;
  };

  const isImageFile = (filePath) => {
    if (!filePath) return false;
    const ext = filePath.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  };

  const isScienceSubject = () => {
    const scienceKeywords = ["math", "physic", "chemist", "biolog", "science", "further maths", "geograph", "agric"];
    const name = (question?.subject?.name || "").toLowerCase();
    const courseTitle = (question?.course?.title || "").toLowerCase();
    return scienceKeywords.some(key => name.includes(key) || courseTitle.includes(key));
  };

  const insertSymbol = (index, symbol) => {
    const input = document.getElementById(`option-input-${index}`);
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = options[index].option_text;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + symbol + after;

    handleOptionChange(index, "option_text", newText);

    // Reset cursor position after React re-render
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    if (field === "is_correct" && value === true) {
      // Ensure only one is correct for MCQ
      newOptions.forEach((opt, idx) => {
        opt.is_correct = idx === index;
      });
    } else {
      newOptions[index][field] = value;
    }
    setOptions(newOptions);
  };

  const addOption = () => {
    const lastLabel = options.length > 0 ? options[options.length - 1].label : "@";
    const nextLabel = String.fromCharCode(lastLabel.charCodeAt(0) + 1);
    setOptions([...options, { label: nextLabel, option_text: "", is_correct: false, sort_order: options.length + 1 }]);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const groupData = question ? (question.group || question.past_question_group) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const plainQuestion = questionText;
    const plainExplanation = explanation;

    // 1. Validation: Correct option check (for multiple_choice and true_false)
    const hasCorrectOption = options.some(o => o.is_correct || o.is_correct === 1);
    if (!hasCorrectOption) {
      setToast({ type: "error", message: "You must choose a correct option." });
      setTimeout(() => setToast(null), 3000);
      setLoading(false);
      return;
    }

    // 2. Validation: Question Number check
    if (!questionNumber || String(questionNumber).trim() === "") {
      setToast({ type: "error", message: "Question number is required." });
      setTimeout(() => setToast(null), 3000);
      setLoading(false);
      return;
    }

    const numVal = parseInt(questionNumber, 10);
    if (isNaN(numVal) || numVal <= 0) {
      setToast({ type: "error", message: "Question number must be a valid positive integer." });
      setTimeout(() => setToast(null), 3000);
      setLoading(false);
      return;
    }

    // 3. Validation: Duplicate check in DB (excluding current question)
    if (existingQuestions && Array.isArray(existingQuestions)) {
      const duplicate = existingQuestions.find(q => 
        String(q.id) !== String(question.id) && 
        parseInt(q.question_number || q.questionNumber, 10) === numVal
      );
      if (duplicate) {
        setToast({ type: "error", message: `Question #${numVal} already exists in this exam year.` });
        setTimeout(() => setToast(null), 3000);
        setLoading(false);
        return;
      }
    }

    try {
      
      // 1. Create or Update Group details if group title is filled
      let groupId = selectedGroupId || question.past_question_group_id || (groupData?.id);
      
      if (groupTitle.trim()) {
        const groupFormData = new FormData();
        groupFormData.append("exam_year_id", question.exam_year_id);
        groupFormData.append("type", groupType);
        groupFormData.append("title", groupTitle);
        groupFormData.append("content", groupContent);
        groupFormData.append("sort_order", groupSortOrder);
        if (groupImageFile) {
          groupFormData.append("image", groupImageFile);
        }

        const groupConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data"
          }
        };

        if (groupId) {
          console.log(`[QuestionEditModal] Updating Group ${groupId} details...`);
          groupFormData.append("_method", "PUT");
          await axios.post(`${API_BASE_URL}/api/admin/past-question-groups/update/${groupId}`, groupFormData, groupConfig);
        } else {
          console.log("[QuestionEditModal] Creating a new Group for this question...");
          const res = await axios.post(`${API_BASE_URL}/api/admin/past-question-groups`, groupFormData, groupConfig);
          groupId = res.data?.data?.id || res.data?.id;
          console.log(`[QuestionEditModal] New Group created with ID: ${groupId}`);
        }
      }

      // 2. Update Question details using FormData to support file uploads
      const questionFormData = new FormData();
      questionFormData.append("_method", "PUT");
      questionFormData.append("exam_year_id", question.exam_year_id);
      questionFormData.append("past_question_group_id", groupId || "");
      questionFormData.append("question_number", String(questionNumber));
      questionFormData.append("question", plainQuestion);
      questionFormData.append("question_type", questionType);
      questionFormData.append("marks", marks);
      questionFormData.append("explanation", plainExplanation);
      questionFormData.append("status", question.status || "active");

      // Options
      options.forEach((o, index) => {
        questionFormData.append(`options[${index}][label]`, o.label);
        questionFormData.append(`options[${index}][option_text]`, o.option_text);
        questionFormData.append(`options[${index}][is_correct]`, o.is_correct ? 1 : 0);
        questionFormData.append(`options[${index}][sort_order]`, o.sort_order || index + 1);
      });

      // New files + captions
      newFiles.forEach((file, index) => {
        questionFormData.append(`files[${index}]`, file);
        questionFormData.append(`captions[${index}]`, newCaptions[index] || "");
      });

      // Existing file caption updates
      existingFiles.forEach((ef, index) => {
        questionFormData.append(`existing_files[${index}][id]`, ef.id);
        questionFormData.append(`existing_files[${index}][caption]`, ef.caption || "");
      });

      // Files to delete
      filesToDelete.forEach((fileId, index) => {
        questionFormData.append(`delete_files[${index}]`, fileId);
      });

      const uploadConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data"
        }
      };

      console.log("[QuestionEditModal] Updating Question via POST (_method=PUT):", `${API_BASE_URL}/api/admin/past-questions/update/${question.id}`);
      await axios.post(`${API_BASE_URL}/api/admin/past-questions/update/${question.id}`, questionFormData, uploadConfig);
      
      setToast({ type: "success", message: "Question updated successfully!" });
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setToast(null);
      }, 1500);
    } catch (err) {
      console.error("Update failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to update question.";
      setToast({ type: "error", message: errorMsg });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // const handleDeleteQuestion = async () => {
  //   if (!window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         Accept: "application/json"
  //       }
  //     };
  //     console.log(`[QuestionEditModal] Deleting question ${question.id}...`);
  //     await axios.delete(`${API_BASE_URL}/api/admin/past-questions/destroy/${question.id}`, config);
  //     setToast({ type: "success", message: "Question deleted successfully!" });
  //     setTimeout(() => {
  //       onSuccess?.();
  //       onClose();
  //       setToast(null);
  //     }, 1500);
  //   } catch (err) {
  //     console.error("Deletion failed:", err);
  //     const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to delete question.";
  //     setToast({ type: "error", message: errorMsg });
  //     setTimeout(() => setToast(null), 3000);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-200">
      
      {toast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[210] px-8 py-4 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 animate-in slide-in-from-top-10 transition-all ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {toast.type === "success" ? <CheckIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-10 py-8 bg-[#0F2843] text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-[#BB9E7F]" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Edit Question Details</h2>
              <p className="text-[#BB9E7F] text-[9px] font-black uppercase tracking-widest mt-0.5">Modify parameters for this module</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          
          {/* Group Details section (always visible) */}
          {true && (
            <div className="space-y-8 pb-10 border-b border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#BB9E7F]/10 rounded-xl flex items-center justify-center text-[#BB9E7F]">
                  <Icon icon="heroicons:rectangle-group" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Group Assets / Context</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Shared comprehension text or diagram details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Selected Group Info Card - Shows when a group is selected */}
                {selectedGroupId && !isGroupCreationMode && (
                  <div className="md:col-span-2 bg-gradient-to-r from-[#BB9E7F]/5 to-[#76D287]/5 border-2 border-[#BB9E7F]/20 rounded-2xl p-5 mb-2 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Currently Selected Group</p>
                      <p className="text-sm font-black text-[#0F2843] dark:text-white mb-2">{groupTitle}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                        <span className="text-[#BB9E7F]">Type:</span> {groupType} | <span className="text-[#BB9E7F]">Sort Order:</span> {groupSortOrder}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGroupId("");
                        setGroupSearchTerm("");
                        setGroupTitle("");
                        setGroupContent("");
                        setGroupImagePreview(null);
                        setGroupSortOrder(1);
                        setGroupType("comprehension");
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Group Title selection/creation */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Group Title</label>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsGroupCreationMode(true);
                        setSelectedGroupId("");
                        setGroupTitle("");
                        setGroupContent("");
                        setGroupImagePreview(null);
                        setGroupSortOrder(1);
                        setGroupType("comprehension");
                      }}
                      className="text-[9px] font-black text-[#BB9E7F] hover:text-[#0F2843] flex items-center gap-1 transition-colors uppercase"
                    >
                      <PlusIcon className="w-3 h-3" /> Create New
                    </button>
                  </div>

                  {!isGroupCreationMode ? (
                    <div className="relative group/search">
                      <input 
                        type="text"
                        placeholder="Search existing groups..."
                        value={groupSearchTerm}
                        onChange={(e) => {
                          setGroupSearchTerm(e.target.value);
                          if (selectedGroupId) {
                            setSelectedGroupId("");
                            setGroupTitle("");
                            setGroupContent("");
                            setGroupImagePreview(null);
                            setGroupSortOrder(1);
                            setGroupType("comprehension");
                          }
                        }}
                        className={`w-full px-6 py-4 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none shadow-inner transition-all ${
                          selectedGroupId 
                            ? "bg-[#76D287]/10 border-2 border-[#76D287]/40 dark:bg-[#76D287]/20" 
                            : "bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30"
                        }`}
                      />

                      {/* Dropdown */}
                      {!selectedGroupId && groupSearchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-[120] max-h-[200px] overflow-y-auto custom-scrollbar">
                          {allGroups.filter(g => g.title?.toLowerCase().includes(groupSearchTerm.toLowerCase())).length > 0 ? (
                            allGroups.filter(g => g.title?.toLowerCase().includes(groupSearchTerm.toLowerCase())).map(group => (
                              <button
                                key={group.id}
                                type="button"
                                onClick={() => {
                                  setSelectedGroupId(group.id);
                                  setGroupSearchTerm(group.title || "");
                                  setGroupTitle(group.title || "");
                                  setGroupContent(group.content || "");
                                  setGroupSortOrder(group.sort_order || 1);
                                  setGroupType(group.type || "comprehension");
                                  if (group.image) {
                                    setGroupImagePreview(group.image.startsWith('http') ? group.image : `${API_BASE_URL}/storage/${group.image}`);
                                  } else {
                                    setGroupImagePreview(null);
                                  }
                                }}
                                className="w-full px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-black text-[#0F2843] dark:text-white text-xs">{group.title}</p>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{group.type || "comprehension"}</p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-gray-400 text-xs font-bold">No groups found</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="text"
                        value={groupTitle}
                        onChange={(e) => setGroupTitle(e.target.value)}
                        placeholder="Enter new group title..."
                        className="w-full px-6 py-4 bg-white dark:bg-gray-800 border-2 border-[#BB9E7F] rounded-2xl font-black text-[#0F2843] dark:text-white outline-none shadow-md"
                      />
                      <button 
                        type="button"
                        onClick={() => setIsGroupCreationMode(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500"
                      >
                        <XMarkIcon className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Type</label>
                  <select 
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none appearance-none"
                  >
                    <option value="comprehension">Comprehension</option>
                    <option value="instruction">Instruction</option>
                    <option value="diagram">Diagram</option>
                    <option value="case_study">Case Study</option>
                  </select>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Sort Order</label>
                  <input 
                    type="number"
                    value={groupSortOrder}
                    onChange={(e) => setGroupSortOrder(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Content / Narrative</label>
                <div className="quill-wrapper bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-transparent focus-within:border-[#BB9E7F]/30 overflow-hidden shadow-inner text-[#0F2843] dark:text-white">
                  <ReactQuill 
                    theme="snow" 
                    value={groupContent || ""} 
                    onChange={setGroupContent}
                    modules={quillModules}
                    formats={quillFormats}
                    className="[&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Visual Aid (Optional)</label>
                <div className={`relative group border-2 border-dashed rounded-[32px] overflow-hidden bg-gray-50 dark:bg-gray-800/30 transition-all ${
                  groupImagePreview ? "border-green-500/30" : "border-gray-200 dark:border-gray-700 hover:border-[#BB9E7F]/40"
                }`}>
                  {groupImagePreview ? (
                    <div className="relative aspect-video max-h-[250px] overflow-hidden">
                      <img src={groupImagePreview} alt="Group Visual Aid" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                        <Icon icon="heroicons:camera" className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
                      <Icon icon="heroicons:photo" className="w-8 h-8 text-[#BB9E7F]" />
                      <div>
                        <p className="text-[#0F2843] dark:text-white font-black text-sm">Upload Diagram / Map</p>
                        <p className="text-gray-400 text-[10px] font-bold mt-1">Illustrations for this group context</p>
                      </div>
                    </div>
                  )}
                  <input type="file" onChange={handleGroupImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Question Number</label>
              <input 
                type="number"
                required
                value={questionNumber}
                onChange={(e) => setQuestionNumber(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Question Type</label>
              <select 
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none appearance-none"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Marks</label>
              <input 
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Question Text</label>
            <div className="quill-wrapper bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-transparent focus-within:border-[#BB9E7F]/30 overflow-hidden shadow-inner text-[#0F2843] dark:text-white">
              <ReactQuill 
                theme="snow" 
                value={questionText || ""} 
                onChange={setQuestionText}
                modules={quillModules}
                formats={quillFormats}
                className="[&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!" 
              />
            </div>
          </div>

          {/* Question Attachments / Images Section */}
          <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 px-1">
              <PaperClipIcon className="w-5 h-5 text-[#BB9E7F]" />
              <label className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Question Attachments</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Existing files from the server */}
              {existingFiles.map((ef) => (
                <div key={`existing-${ef.id}`} className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-[28px] border-2 border-emerald-500/20 relative group animate-in zoom-in-95">
                  <button 
                    type="button"
                    onClick={() => removeExistingFile(ef.id)}
                    className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 text-red-500 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Image preview or file icon */}
                  {isImageFile(ef.file_path) ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700">
                      <img 
                        src={getFilePreviewUrl(ef.file_path)} 
                        alt={ef.caption || "Question attachment"} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                        <DocumentTextIcon className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-[#0F2843] dark:text-white truncate uppercase tracking-tight">{ef.original_name}</p>
                        <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">Saved on Server</p>
                      </div>
                    </div>
                  )}

                  {/* Caption editor for existing file */}
                  <input 
                    type="text"
                    value={ef.caption}
                    onChange={(e) => updateExistingCaption(ef.id, e.target.value)}
                    placeholder="Update caption for this attachment..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-xl text-[11px] font-bold outline-none"
                  />
                </div>
              ))}

              {/* New files to upload */}
              {newFiles.map((file, fIdx) => (
                <div key={`new-${fIdx}`} className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-[28px] border-2 border-[#BB9E7F]/20 relative group animate-in zoom-in-95">
                  <button 
                    type="button"
                    onClick={() => removeNewFile(fIdx)}
                    className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 text-red-500 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  {/* Preview for new image files */}
                  {file.type?.startsWith('image/') ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#BB9E7F]/10 rounded-2xl flex items-center justify-center text-[#BB9E7F] shrink-0">
                        <DocumentTextIcon className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-[#0F2843] dark:text-white truncate uppercase tracking-tight">{file.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  )}

                  {/* Caption input for new file */}
                  <input 
                    type="text"
                    value={newCaptions[fIdx]}
                    onChange={(e) => updateNewCaption(fIdx, e.target.value)}
                    placeholder="Add a caption for this file..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-xl text-[11px] font-bold outline-none"
                  />
                </div>
              ))}

              {/* Upload new files button */}
              <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[28px] hover:border-[#BB9E7F]/40 transition-all group flex flex-col items-center justify-center p-8 min-h-[160px] cursor-pointer">
                <div className="w-12 h-12 bg-[#BB9E7F]/5 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <PhotoIcon className="w-6 h-6 text-[#BB9E7F]" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Image / Attachment</p>
                <p className="text-[9px] text-gray-300 dark:text-gray-500 font-bold mt-1">Diagrams, charts, or supporting files</p>
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleNewFilesChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                <ListBulletIcon className="w-5 h-5 text-[#BB9E7F]" />
                <label className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Options</label>
              </div>
              <button 
                type="button" 
                onClick={addOption}
                className="text-[10px] font-black text-[#BB9E7F] hover:text-[#0F2843] flex items-center gap-1 transition-colors uppercase"
              >
                <PlusIcon className="w-3 h-3" /> Add Option
              </button>
            </div>

            <div className="space-y-4">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <input 
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleOptionChange(idx, "label", e.target.value)}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center font-black text-[#0F2843] dark:text-white shrink-0 text-center outline-none focus:ring-2 focus:ring-[#BB9E7F]/30"
                  />
                  <div className="flex-1 relative group/input">
                    <input 
                      id={`option-input-${idx}`}
                      type="text"
                      value={opt.option_text}
                      onChange={(e) => handleOptionChange(idx, "option_text", e.target.value)}
                      className="w-full px-6 py-4 pr-12 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none"
                    />
                    {isScienceSubject() && (
                      <SymbolPicker 
                        onSelect={(sym) => insertSymbol(idx, sym)} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-100 transition-opacity" 
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOptionChange(idx, "is_correct", !opt.is_correct)}
                      className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                        opt.is_correct 
                          ? "bg-green-500 text-white shadow-lg" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }`}
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      {opt.is_correct ? "Correct" : "Mark"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => removeOption(idx)}
                      className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Explanation</label>
            <div className="quill-wrapper bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-transparent focus-within:border-[#BB9E7F]/30 overflow-hidden shadow-inner text-[#0F2843] dark:text-white">
              <ReactQuill 
                theme="snow" 
                value={explanation} 
                onChange={setExplanation}
                modules={quillModules}
                formats={quillFormats}
                className="[&_.ql-editor]:min-h-[100px] [&_.ql-editor]:text-[#0F2843] dark:[&_.ql-editor]:text-white" 
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-10 py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          {/* Delete button — commented out for now
          <button 
            type="button"
            onClick={handleDeleteQuestion}
            disabled={loading}
            className="px-8 py-4 border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Delete Question
          </button>
          */}
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-4 bg-[#0F2843] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#0F2843]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
