import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  XMarkIcon, 
  CheckIcon, 
  PlusIcon, 
  ListBulletIcon,
  DocumentTextIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function QuestionEditModal({ isOpen, onClose, question, onSuccess }) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (question) {
      console.log("[QuestionEditModal] Populating with question:", question);
      setQuestionText(question.question || "");
      setQuestionType(question.question_type || "multiple_choice");
      setMarks(question.marks || 1);
      setOptions(question.options || []);
      setExplanation(question.explanation || "");
    }
  }, [question]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Strip HTML tags for clean storage
    const stripHtml = (html) => html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");
    const plainQuestion = stripHtml(questionText);
    const plainExplanation = stripHtml(explanation);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        exam_year_id: question.exam_year_id,
        question: plainQuestion,
        question_type: questionType,
        marks,
        explanation: plainExplanation,
        options: options.map(o => ({
          id: o.id,
          label: o.label,
          option_text: o.option_text,
          is_correct: o.is_correct ? 1 : 0,
          sort_order: o.sort_order
        }))
      };

      console.log("[QuestionEditModal] Updating Question:", `${API_BASE_URL}/api/admin/past-questions/update/${question.id}`);
      await axios.put(`${API_BASE_URL}/api/admin/past-questions/update/${question.id}`, payload, config);
      setToast({ type: "success", message: "Question updated successfully!" });
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setToast(null);
      }, 1500);
    } catch (err) {
      console.error("Update failed:", err);
      setToast({ type: "error", message: "Failed to update question." });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <ReactQuill theme="snow" value={questionText} onChange={setQuestionText} className="[&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-[#0F2843] dark:[&_.ql-editor]:text-white" />
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
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center font-black text-[#0F2843] dark:text-white shrink-0">
                    {opt.label}
                  </div>
                  <input 
                    type="text"
                    value={opt.option_text}
                    onChange={(e) => handleOptionChange(idx, "option_text", e.target.value)}
                    className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none"
                  />
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOptionChange(idx, "is_correct", !opt.is_correct)}
                      className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        opt.is_correct 
                          ? "bg-green-500 text-white shadow-lg" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }`}
                    >
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
              <ReactQuill theme="snow" value={explanation} onChange={setExplanation} className="[&_.ql-editor]:min-h-[100px] [&_.ql-editor]:text-[#0F2843] dark:[&_.ql-editor]:text-white" />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-10 py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
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
  );
}
