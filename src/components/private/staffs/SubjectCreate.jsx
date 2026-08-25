import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { 
  XMarkIcon, 
  CameraIcon, 
  // BanknotesIcon,
  CheckIcon,
  PlusIcon,
  AcademicCapIcon,
  // BookOpenIcon
} from "@heroicons/react/24/outline";

export default function SubjectCreate({ isOpen, onClose, onSuccess, courses, showToast }) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localToast, setLocalToast] = useState(null);

  // Auto-dismiss local toast
  useEffect(() => {
    if (localToast) {
      const timer = setTimeout(() => setLocalToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [localToast]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Courses are no longer strictly compulsory based on user request, 
    // but we must send something to avoid NOT NULL constraint.

    setLoading(true);
    console.group("Subject Creation: Submit Form");
    
    const formData = new FormData();
    formData.append("name", subjectName);
    formData.append("description", description || "");
    departments.forEach(dept => {
      formData.append("departments[]", dept);
    });
    
    // The backend expects a real array structure in the multipart form data for multiple,
    // but for single we still just send it as a one-item array.
    if (selectedCourse) {
      formData.append("courses[]", selectedCourse);
      // Legacy support for single course_id
      formData.append("course_id", selectedCourse);
    } else {
      // If no courses are selected, we still need to send the key to avoid NOT NULL errors.
      // We append an empty string to the array so Laravel sees it as an array [''].
      formData.append("courses[]", "");
    }
    
    formData.append("status", "active");
    if (banner) {
      formData.append("banner", banner);
    } else {
      showToast({ type: "error", message: "Please upload a subject banner." });
      setLoading(false);
      return;
    }
    
    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      const res = await axios.post(`${API_BASE_URL}/api/admin/subjects`, formData, config);
      console.log("Subject Creation Response:", res?.data);
      
      setLocalToast({ type: "success", message: "Subject created successfully!" });
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
        // Reset state
        setSubjectName("");
        setDescription("");
        setDepartments([]);
        setSelectedCourse("");
        setBanner(null);
        setBannerPreview(null);
      }, 1500);
    } catch (error) {
      console.error("Subject Creation Error:", error);
      console.log("Error Full Response:", error.response?.data);
      
      let errorMessage = "Failed to create subject.";
      
      if (error.response?.data) {
        const data = error.response.data;
        // 1. Check for specific validation errors
        if (data.errors) {
          const messages = Object.values(data.errors).flat();
          if (messages.length > 0) errorMessage = messages[0];
        } 
        // 2. Check for explicit error message
        else if (data.error) {
          errorMessage = data.error;
        }
        // 3. Check for standard message
        else if (data.message) {
          errorMessage = data.message;
        }
      }

      setLocalToast({ 
        type: "error", 
        message: errorMessage 
      });
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-[#0F2843]/60 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Local Toast - High Z-Index to stay on top of the modal content */}
        {localToast && (
          <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[160] px-8 py-4 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 animate-in slide-in-from-top-10 transition-all ${
            localToast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          }`}>
            {localToast.type === "success" ? <CheckIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
            {localToast.message}
          </div>
        )}

        {/* Header */}
        <div className="p-8 sm:p-10 flex justify-between items-center bg-[#0F2843] text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner">
              <PlusIcon className="w-8 h-8 text-[#BB9E7F]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">FORGE SUBJECT</h2>
              <p className="text-[#BB9E7F] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Knowledge Module Architect</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-[#E83831] rounded-2xl transition-all group active:scale-90 shadow-lg hover:shadow-red-900/20">
            <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Banner Upload Section */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subject Display Banner</label>
              <div className={`relative group border-2 border-dashed rounded-[32px] overflow-hidden bg-gray-50 dark:bg-gray-800/50 transition-all ${
                bannerPreview ? "border-[#76D287]/30" : "border-gray-200 hover:border-[#BB9E7F]/40"
              }`}>
                {bannerPreview ? (
                  <div className="relative aspect-video sm:aspect-[21/9]">
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <CameraIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center gap-4 cursor-pointer">
                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-[24px] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AcademicCapIcon className="w-10 h-10 text-[#BB9E7F]" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-black text-lg">Upload Subject Banner</p>
                      <p className="text-gray-400 text-sm font-bold mt-1">High resolution editorial artwork (16:9)</p>
                    </div>
                  </div>
                )}
                <input type="file" onChange={handleBannerChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Selection (Single) */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Parent Curriculum (Select One)</label>
                <div className="relative group p-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus-within:border-[#BB9E7F]/30 rounded-2xl shadow-sm max-h-[160px] overflow-y-auto custom-scrollbar">
                  {courses.length === 0 ? (
                    <p className="text-sm font-bold text-gray-400">No courses available.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {courses.map((c) => (
                        <label key={c.id} className="flex items-center gap-3 cursor-pointer group/item">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedCourse === c.id.toString() 
                              ? "bg-[#0F2843] border-[#0F2843]" 
                              : "border-gray-300 dark:border-gray-600 group-hover/item:border-[#0F2843]"
                          }`}>
                            {selectedCourse === c.id.toString() && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className={`text-sm font-bold transition-all ${
                            selectedCourse === c.id.toString() ? "text-[#0F2843] dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover/item:text-[#0F2843] dark:group-hover/item:text-white"
                          }`}>
                            {c.title}
                          </span>
                          <input 
                            type="radio"
                            name="course_selection"
                            value={c.id}
                            checked={selectedCourse === c.id.toString()}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="hidden"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subject Designation</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-focus-within:bg-[#0F2843] transition-colors">
                    <AcademicCapIcon className="w-5 h-5 text-[#BB9E7F]" />
                  </div>
                  <input 
                    type="text" 
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Advanced Mathematics"
                    required
                    className="w-full pl-20 pr-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-700 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Department Selection (Multiple) */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Academic Department (Select Multiple)</label>
                <div className="relative group p-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus-within:border-[#BB9E7F]/30 rounded-2xl shadow-sm">
                  <div className="flex flex-col gap-3">
                    {["science", "art", "commercial"].map((dept) => (
                      <label key={dept} className="flex items-center gap-3 cursor-pointer group/item">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          departments.includes(dept) 
                            ? "bg-[#0F2843] border-[#0F2843]" 
                            : "border-gray-300 dark:border-gray-600 group-hover/item:border-[#0F2843]"
                        }`}>
                          {departments.includes(dept) && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm font-bold capitalize transition-all ${
                          departments.includes(dept) ? "text-[#0F2843] dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover/item:text-[#0F2843] dark:group-hover/item:text-white"
                        }`}>
                          {dept === "art" ? "Arts" : dept.charAt(0).toUpperCase() + dept.slice(1)}
                        </span>
                        <input 
                          type="checkbox"
                          value={dept}
                          checked={departments.includes(dept)}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDepartments(prev => 
                              prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]
                            );
                          }}
                          className="hidden"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Area — WYSIWYG */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Academic Syllabus & Description</label>
              <div className="quill-wrapper bg-gray-50 dark:bg-gray-800 rounded-[24px] border-2 border-transparent focus-within:border-[#BB9E7F]/30 overflow-hidden shadow-sm [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-base [&_.ql-editor]:text-[#0F2843] dark:[&_.ql-editor]:text-white">
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={setDescription}
                  placeholder="Elaborate on the modules, learning objectives, and scope of this subject..."
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ script: "sub" }, { script: "super" }],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["blockquote", "link"],
                      ["clean"],
                    ],
                  }}
                  formats={[
                    "header", "bold", "italic", "underline", "strike",
                    "script", "list", "blockquote", "link"
                  ]}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-6 pt-10 border-t border-gray-100 dark:border-gray-800">
               <button type="button" onClick={onClose} className="flex-1 py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 font-black rounded-3xl transition-all uppercase tracking-widest text-xs">Cancel</button>
               <button type="submit" disabled={loading} className="flex-[2] py-5 bg-[#0F2843] text-white font-black rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3">
                 {loading ? "Constructing Module..." : "Finalize & Forge Subject"}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
