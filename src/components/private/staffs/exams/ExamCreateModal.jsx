import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  XMarkIcon, 
  PlusIcon, 
  IdentificationIcon,
  CameraIcon,
  BookOpenIcon,
  RectangleGroupIcon
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ExamBodyCreateModal from "./ExamBodyCreateModal";
import ExamYearCreateModal from "./ExamYearCreateModal";

export default function ExamCreateModal({ isOpen, onClose, onSuccess }) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

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

  // Data Lists
  const [examBodies, setExamBodies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examYears, setExamYears] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Sub-modal visibility
  const [isExamBodyModalOpen, setIsExamBodyModalOpen] = useState(false);
  const [isExamYearModalOpen, setIsExamYearModalOpen] = useState(false);

  const fetchInitialData = useCallback(async () => {
    setFetchingData(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [bodiesRes, coursesRes, yearsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/exam-bodies/all`, config),
        axios.get(`${API_BASE_URL}/api/courses`, config),
        axios.get(`${API_BASE_URL}/api/admin/exam-years/all`, config)
      ]);

      setExamBodies(bodiesRes.data?.exam_bodies || bodiesRes.data?.data || bodiesRes.data || []);
      setCourses(coursesRes.data?.data || coursesRes.data?.courses || []);
      setExamYears(yearsRes.data?.data || yearsRes.data?.exam_years || yearsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setFetchingData(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen, fetchInitialData]);

  // Fetch subjects when course changes
  useEffect(() => {
    const selectedBody = examBodies.find(b => String(b.id) === String(examBodyId));
    const inferredCourseId = selectedBody?.course_id || "";
    setCourseId(inferredCourseId);

    const fetchSubjects = async () => {
      if (!inferredCourseId) {
        setSubjects([]);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_BASE_URL}/api/courses/${inferredCourseId}/subjects`, config);
        setSubjects(res.data?.data || res.data?.subjects || []);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      }
    };
    fetchSubjects();
  }, [courseId, examBodyId, examBodies, API_BASE_URL, token]);

  // Handle subject change to save to local storage
  const handleSubjectChange = (id) => {
    setSubjectId(id);
    if (id) {
      localStorage.setItem("selected_subject_id", id);
    } else {
      localStorage.removeItem("selected_subject_id");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("exam_year_id", examYearId);
      
      if (groupType === "none") {
        formData.append("type", "");
      } else {
        const plainGroupContent = groupContent.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");
        formData.append("type", groupType);
        formData.append("title", groupTitle);
        formData.append("content", plainGroupContent);
        formData.append("sort_order", sortOrder);
        if (groupImage) {
          formData.append("image", groupImage);
        }
      }

      console.log("Submitting Exam Group Data:", Object.fromEntries(formData));
      
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      const res = await axios.post(`${API_BASE_URL}/api/admin/past-question-groups`, formData, config);
      console.log("Group Creation Success:", res.data);
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Group Creation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-[#0F2843]/60 animate-in fade-in duration-300">
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="p-8 bg-[#0F2843] text-white flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
              <IdentificationIcon className="w-8 h-8 text-[#BB9E7F]" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Exam Setup</h2>
              <p className="text-[#BB9E7F] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Configure Examination Parameters</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-red-500 rounded-2xl transition-all group shadow-lg">
            <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Exam Body Selection */}
              <div className="space-y-3">
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
                <div className="relative">
                  <select 
                    value={examBodyId}
                    onChange={(e) => setExamBodyId(e.target.value)}
                    required
                    className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-3xl font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-sm"
                  >
                    <option value="">Select Exam Body</option>
                    {examBodies.map(body => (
                      <option key={body.id} value={body.id}>{body.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Subject Module</label>
                <div className="relative">
                  <select 
                    value={subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    required
                    disabled={!courseId}
                    className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-3xl font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-sm disabled:opacity-50"
                  >
                    <option value="">{courseId ? "Select Subject" : "Select a course first"}</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exam Year Selection */}
              <div className="space-y-3">
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
                <div className="relative">
                  <select 
                    value={examYearId}
                    onChange={(e) => setExamYearId(e.target.value)}
                    required
                    className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-3xl font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-sm"
                  >
                    <option value="">Select Exam Year</option>
                    {examYears.map(year => (
                      <option key={year.id} value={year.id}>{year.year} - {year.exam_body?.name || "Exam Body"}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exam Group Category Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Exam Group Category</label>
                <div className="relative">
                  <select 
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    required
                    className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-3xl font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-sm"
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

            {/* Conditional Exam Group Section */}
            {groupType !== "none" && (
              <div className="space-y-10 pt-10 border-t-2 border-dashed border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-10 duration-500">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#BB9E7F]/10 rounded-2xl flex items-center justify-center">
                    <RectangleGroupIcon className="w-6 h-6 text-[#BB9E7F]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0F2843] dark:text-white uppercase">Group Assets</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Provide shared context for multiple questions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Group Title */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Title</label>
                    <input 
                      type="text"
                      value={groupTitle}
                      onChange={(e) => setGroupTitle(e.target.value)}
                      placeholder="e.g. Passage A: The Industrial Revolution"
                      className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-3xl font-black text-[#0F2843] dark:text-white outline-none shadow-sm"
                    />
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Sort Order</label>
                    <input 
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-3xl font-black text-[#0F2843] dark:text-white outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Group Content (WYSIWYG) */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Content / Narrative</label>
                  <div className="quill-wrapper bg-gray-50 dark:bg-gray-800 rounded-[32px] border-2 border-transparent focus-within:border-[#BB9E7F]/30 overflow-hidden shadow-sm [&_.ql-editor]:min-h-[200px]">
                    <ReactQuill
                      theme="snow"
                      value={groupContent}
                      onChange={setGroupContent}
                      placeholder="Enter the comprehension text, instructions, or scenario details here..."
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
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Visual Aid (Optional)</label>
                  <div className={`relative group border-2 border-dashed rounded-[32px] overflow-hidden bg-gray-50 dark:bg-gray-800/50 transition-all ${
                    groupImagePreview ? "border-[#76D287]/30" : "border-gray-200 hover:border-[#BB9E7F]/40"
                  }`}>
                    {groupImagePreview ? (
                      <div className="relative aspect-video sm:aspect-[21/9]">
                        <img src={groupImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                          <CameraIcon className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 flex flex-col items-center justify-center text-center gap-4 cursor-pointer">
                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-[24px] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BookOpenIcon className="w-10 h-10 text-[#BB9E7F]" />
                        </div>
                        <div>
                          <p className="text-[#0F2843] dark:text-white font-black text-lg">Upload Group Image</p>
                          <p className="text-gray-400 text-sm font-bold mt-1">Illustrations or diagrams for the group</p>
                        </div>
                      </div>
                    )}
                    <input type="file" onChange={handleGroupImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-6 pt-10 border-t border-gray-100 dark:border-gray-800">
               <button 
                 type="button" 
                 onClick={onClose}
                 className="flex-1 py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
               >
                 Cancel
               </button>
               <button 
                 type="submit"
                 disabled={loading || fetchingData}
                 className="flex-[2] py-5 bg-[#0F2843] text-white font-black rounded-3xl shadow-2xl shadow-[#0F2843]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3"
               >
                 {loading ? "Processing..." : "Continue to Group Setup"}
               </button>
            </div>
          </form>
        </div>
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

    </div>
  );
}
