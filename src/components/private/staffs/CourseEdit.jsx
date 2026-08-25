import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { 
  PencilIcon, 
  TrashIcon, 
  AcademicCapIcon, 
  BookOpenIcon, 
  XMarkIcon, 
  CheckIcon 
} from "@heroicons/react/24/outline";

export default function CourseEdit({ mode = "courses", showToast, initialEditItem, onClearInitialEditItem }) {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [description, setDescription] = useState("");
  const [departments, setDepartments] = useState([]);
  const [price, setPrice] = useState("");
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [localToast, setLocalToast] = useState(null);

  // Auto-dismiss local toast
  useEffect(() => {
    if (localToast) {
      const timer = setTimeout(() => setLocalToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [localToast]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");
  const config = { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } };

  const fetchData = useCallback(async () => {
    console.group("Course Edit: Fetch Data");
    setLoading(true);
    try {
      const courseRes = await axios.get(`${API_BASE_URL}/api/courses`);
      console.log("Courses Response:", courseRes.data);
      const allCourses = courseRes.data?.data || courseRes.data?.courses || [];
      setCourses(allCourses);

      if (mode === "subjects") {
        try {
          const subRes = await axios.get(`${API_BASE_URL}/api/admin/subjects/all`, {
                  headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        });
          console.log("Subjects Response:", subRes.data);
          const allSubjects = subRes.data?.subjects || subRes.data?.data || [];
          setSubjects(allSubjects);
        } catch (err) {
          console.error("Error fetching subjects:", err);
          console.log("Subject Fetch Error Details:", err.response?.data);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      console.log("Fetch Error Details:", error.response?.data);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [API_BASE_URL, mode, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle opening edit modal
  const handleEditClick = useCallback((type, item) => {
    if (!item) return;
    setEditingItem({ type, data: item });
    setNewName(type === "course" ? item.title : item.name);
    
    // Populate metadata
    setDescription(item.description || "");
    
    // Parse departments correctly
    let existingDepts = [];
    if (Array.isArray(item.departments)) {
      existingDepts = item.departments;
    } else if (item.departments && typeof item.departments === "string") {
      try {
        const parsed = JSON.parse(item.departments);
        existingDepts = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        existingDepts = item.departments.split(",").map(d => d.trim());
      }
    } else if (item.department) {
      existingDepts = [item.department];
    }
    setDepartments(existingDepts);
    
    setBannerPreview(item.banner ? (item.banner.startsWith('http') ? item.banner : `${API_BASE_URL}/storage/${item.banner}`) : null);
    setBanner(null);

    if (type === "course") {
      setPrice(item.price || "");
    } else {
      setPrice("");
    }
    
    setShowConfirmSave(false);
    setIsModalOpen(true);
  }, [API_BASE_URL]);

  // Automatically open the targeted course or subject modal when initialEditItem is provided
  useEffect(() => {
    if (initialEditItem && initialEditItem.data) {
      const type = initialEditItem.type || (mode === "subjects" ? "subject" : "course");
      handleEditClick(type, initialEditItem.data);
    }
  }, [initialEditItem, mode, handleEditClick]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
      setShowConfirmSave(true);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;
    console.group(`Course Edit: Save ${editingItem.type}`);
    
    let payload;
    let headers = { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    };

    // Preserve HTML description for storage
    const richDescription = description || "";

    if (editingItem.type === "course") {
      payload = new FormData();
      payload.append("title", newName);
      payload.append("description", richDescription);
      payload.append("price", price);
      if (banner) {
        payload.append("banner", banner);
      }
      payload.append("_method", "PUT");
    } else {
      payload = new FormData();
      payload.append("name", newName);
      payload.append("description", richDescription);
      payload.append("status", editingItem.data.status || "active");
      
      // Include course_id to ensure database integrity during update
      const cid = editingItem.data.course_id || editingItem.data.courses?.[0]?.id || editingItem.data.courses?.[0];
      if (cid) {
        payload.append("course_id", cid);
        payload.append("courses[]", cid);
      }

      // Backend expects 'department' key based on validator
      if (departments && departments.length > 0) {
        departments.forEach(dept => {
          payload.append("departments[]", dept);
        });
      } 

      if (banner) {
        payload.append("banner", banner);
      }
      payload.append("_method", "PUT");
    }

    const url = editingItem.type === "course" 
      ? `${API_BASE_URL}/api/admin/courses/update/${editingItem.data.id}` 
      : `${API_BASE_URL}/api/admin/subjects/update/${editingItem.data.id}`;
    
    try {
      // Use POST with _method=PUT for FormData support
      await axios.post(url, payload, { headers });
      
      setLocalToast({ type: "success", message: `${editingItem.type === "course" ? "Course" : "Subject"} updated!` });
      setTimeout(() => {
        setIsModalOpen(false);
        setShowConfirmSave(false);
        fetchData();
      }, 1500);
    } catch (error) {
      console.error("Update Error:", error);
      
      let errorMessage = "Failed to update.";
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors) {
          errorMessage = Object.values(data.errors).flat()[0] || errorMessage;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      setLocalToast({ type: "error", message: errorMessage });
    } finally {
      console.groupEnd();
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    console.group(`Course Edit: Delete ${type}`);
    const url = type === "course" 
      ? `${API_BASE_URL}/api/admin/courses/destroy/${id}`
      : `${API_BASE_URL}/api/admin/subjects/destroy/${id}`;
    
    try {
      await axios.delete(url, config);
      setLocalToast({ type: "success", message: `${type === "course" ? "Course" : "Subject"} deleted.` });
      fetchData();
    } catch (error) {
      console.error("Delete Error:", error);
      setLocalToast({ type: "error", message: "Failed to delete." });
    } finally {
      console.groupEnd();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-[#0F2843]/10 border-t-[#0F2843] rounded-full animate-spin"></div>
      </div>
    );
  }

  const getCourseTitle = (courseId) => {
    const c = courses.find(c => Number(c.id) === Number(courseId));
    return c?.title || "Unknown";
  };

  return (
    <div className="space-y-4">
      {/* Global Toast for deletions (since they happen in the list, not the modal) */}
      {localToast && !isModalOpen && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 animate-in slide-in-from-top-10 transition-all ${
          localToast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
        }`}>
          {localToast.type === "success" ? <CheckIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
          {localToast.message}
        </div>
      )}
      {/* ===== COURSES MODE ===== */}
      {mode === "courses" && (
        <>
          {courses.length > 0 ? courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-md p-6 rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#BB9E7F]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#BB9E7F] transition-all">
                  <BookOpenIcon className="w-6 h-6 text-[#BB9E7F] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-[#BB9E7F] uppercase tracking-widest">Course</span>
                  <h3 className="text-lg font-black text-[#0F2843] dark:text-white tracking-tight">{course.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditClick("course", course)}
                  className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-[#0F2843] dark:hover:text-white hover:bg-white dark:hover:bg-gray-600 hover:shadow-lg rounded-xl transition-all"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete("course", course.id)}
                  className="p-3 bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-16 text-center bg-white/30 dark:bg-gray-800/30 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
              <BookOpenIcon className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-black text-gray-300 dark:text-gray-500">No Courses</h4>
            </div>
          )}
        </>
      )}

      {/* ===== SUBJECTS MODE ===== */}
      {mode === "subjects" && (
        <>
          {subjects.length > 0 ? subjects.map((subject) => {
             const courseId = subject.courses?.[0]?.id || subject.courses?.[0] || subject.course_id;
             return (
              <div key={subject.id} className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-md p-6 rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0F2843]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0F2843] transition-all">
                    <AcademicCapIcon className="w-6 h-6 text-[#0F2843] dark:text-blue-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0F2843] dark:text-white tracking-tight">
                      {getCourseTitle(courseId)} - {subject.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditClick("subject", subject)}
                    className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-[#0F2843] dark:hover:text-white hover:bg-white dark:hover:bg-gray-600 hover:shadow-lg rounded-xl transition-all"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete("subject", subject.id)}
                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="py-16 text-center bg-white/30 dark:bg-gray-800/30 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
              <AcademicCapIcon className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-black text-gray-300 dark:text-gray-500">No Subjects</h4>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-[#0F2843]/60 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            
            {/* Modal Specific Toast */}
            {localToast && isModalOpen && (
              <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[210] px-8 py-4 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 animate-in slide-in-from-top-10 transition-all ${
                localToast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
              }`}>
                {localToast.type === "success" ? <CheckIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
                {localToast.message}
              </div>
            )}

            {/* Modal Header */}
            <div className="p-8 flex justify-between items-center bg-[#0F2843] text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <PencilIcon className="w-6 h-6 text-[#BB9E7F]" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase">Edit {editingItem.type}</h2>
                  <p className="text-[#BB9E7F] text-[9px] font-black uppercase tracking-widest">Update Information</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-red-500 rounded-xl transition-all">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-8">
                {editingItem.type === "course" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Title</label>
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          setShowConfirmSave(true);
                        }}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Pricing (₦)</label>
                      <input 
                        type="number" 
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          setShowConfirmSave(true);
                        }}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {editingItem.type === "subject" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Name</label>
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          setShowConfirmSave(true);
                        }}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Departments</label>
                      <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-transparent shadow-sm">
                        {["science", "art", "commercial"].map((dept) => (
                          <label key={dept} className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              departments.includes(dept) 
                                ? "bg-[#0F2843] border-[#0F2843]" 
                                : "border-gray-300 dark:border-gray-600"
                            }`}>
                              {departments.includes(dept) && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-xs font-bold capitalize">{dept}</span>
                            <input 
                              type="checkbox"
                              checked={departments.includes(dept)}
                              onChange={() => {
                                setDepartments(prev => 
                                  prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
                                );
                                setShowConfirmSave(true);
                              }}
                              className="hidden"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Banner Image</label>
                  <div className="relative group aspect-video rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpenIcon className="w-12 h-12 text-gray-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <CheckIcon className="w-8 h-8 text-white" />
                      <span className="text-white font-black text-xs uppercase tracking-widest ml-2">Update Image</span>
                    </div>
                    <input type="file" onChange={handleBannerChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Description / Syllabus</label>
                  <div className="quill-wrapper bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm [&_.ql-editor]:min-h-[150px]">
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={(content) => {
                        setDescription(content);
                        setShowConfirmSave(true);
                      }}
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
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black rounded-2xl uppercase text-[10px] tracking-widest">Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={!showConfirmSave}
                className="flex-[2] py-4 bg-[#0F2843] text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 uppercase text-[10px] tracking-widest"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
