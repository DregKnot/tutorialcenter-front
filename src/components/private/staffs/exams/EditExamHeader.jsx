import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import StaffDashboardLayout from "../DashboardLayout.jsx";
import { 
  ArrowLeftIcon,
  IdentificationIcon,
  CheckCircleIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  AcademicCapIcon,
  PencilSquareIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import ExamYearCreateModal from "./ExamYearCreateModal";

export default function EditExamHeader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "year" ? "year" : "body";

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  // Exam Body Form States
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState("active");
  const [courses, setCourses] = useState([]);
  
  // Exam Years States
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  
  // Edit Year Form States
  const [editYearVal, setEditYearVal] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [savingYear, setSavingYear] = useState(false);

  // Common UI States
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [messageToast, setMessageToast] = useState(null);
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);

  useEffect(() => {
    if (messageToast) {
      const timer = setTimeout(() => setMessageToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [messageToast]);

  // Fetch Exam Years List
  const fetchYears = useCallback(async () => {
    setLoadingYears(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_BASE_URL}/api/admin/exam-years/all`, config);
      const allYears = res.data?.data || res.data?.exam_years || [];
      const filtered = allYears.filter(y => String(y.exam_body_id) === String(id));
      
      // Sort by year descending
      filtered.sort((a, b) => parseInt(b.year) - parseInt(a.year));
      setYears(filtered);
    } catch (err) {
      console.error("Failed to fetch exam years:", err);
    } finally {
      setLoadingYears(false);
    }
  }, [id, API_BASE_URL, token]);

  // Fetch Initial Data (Exam Body details and Course list)
  const fetchData = useCallback(async () => {
    setFetching(true);
    const fetchExam = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_BASE_URL}/api/admin/exam-bodies/all`, config);
        const bodies = res.data?.exam_bodies || res.data?.data || res.data || [];
        const exam = bodies.find(b => String(b.id) === String(id));
        if (exam) {
          setName(exam.name || "");
          setCourseId(String(exam.course_id || ""));
          setStatus(exam.status || "active");
        }
      } catch (err) {
        console.error("Failed to fetch exam details:", err);
      }
    };

    const fetchCourses = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_BASE_URL}/api/courses`, config);
        setCourses(res.data?.data || res.data?.courses || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };

    try {
      await Promise.all([fetchExam(), fetchCourses()]);
    } finally {
      setFetching(false);
    }
  }, [id, API_BASE_URL, token]);

  // Fetch subjects of the selected course
  const fetchSubjects = useCallback(async () => {
    if (!courseId) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_BASE_URL}/api/courses/${courseId}/subjects`, config);
      setSubjects(res.data?.data || res.data?.subjects || []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  }, [courseId, API_BASE_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (courseId) {
      fetchSubjects();
    }
  }, [courseId, fetchSubjects]);

  useEffect(() => {
    if (activeTab === "year") {
      fetchYears();
    }
  }, [activeTab, fetchYears]);

  // Handle Exam Body form submission
  const handleSubmitBody = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      };

      const payload = {
        name,
        course_id: courseId,
        status
      };

      const res = await axios.put(`${API_BASE_URL}/api/admin/exam-bodies/update/${id}`, payload, config);
      const msg = res.data?.message || "Exam body updated successfully!";
      setMessageToast({ type: "success", message: msg });
      setTimeout(() => {
        navigate("/staffs/manage-exams");
      }, 1500);
    } catch (err) {
      console.error("Failed to update exam:", err);
      const msg = err.response?.data?.message || "Failed to update exam body.";
      setMessageToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Handle Exam Body Deletion
  const handleDeleteBody = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone and will remove all associated exam years, subjects, and questions.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.delete(`${API_BASE_URL}/api/admin/exam-bodies/destroy/${id}`, config);
      const msg = res.data?.message || "Exam body deleted successfully!";
      setMessageToast({ type: "success", message: msg });
      setTimeout(() => navigate("/staffs/manage-exams"), 1500);
    } catch (err) {
      console.error("Failed to delete exam body:", err);
      const msg = err.response?.data?.message || "Failed to delete exam body.";
      setMessageToast({ type: "error", message: msg });
    } finally {
      setDeleting(false);
    }
  };

  // Open Edit Year Modal Overlay
  const startEditYear = (yearItem) => {
    setEditingYear(yearItem);
    setEditYearVal(yearItem.year.toString());
    setEditSubjectId(yearItem.subject_id?.toString() || "");
    setEditStatus(yearItem.status || "active");
  };

  // Save Exam Year Changes
  const handleUpdateYearSubmit = async (e) => {
    e.preventDefault();
    setSavingYear(true);
    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      };

      const payload = {
        exam_body_id: id,
        subject_id: editSubjectId,
        year: parseInt(editYearVal),
        status: editStatus
      };

      const res = await axios.put(`${API_BASE_URL}/api/admin/exam-years/update/${editingYear.id}`, payload, config);
      const msg = res.data?.message || "Exam Year updated successfully!";
      setMessageToast({ type: "success", message: msg });
      setEditingYear(null);
      fetchYears();
    } catch (error) {
      console.error("Failed to update exam year:", error);
      const msg = error.response?.data?.message || "Failed to update exam year.";
      setMessageToast({ type: "error", message: msg });
    } finally {
      setSavingYear(false);
    }
  };

  // Delete Exam Year
  const handleDeleteYear = async (yearItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete year "${yearItem.year}" for this subject? All questions inside this year will be permanently deleted.`
    );
    if (!confirmed) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.delete(`${API_BASE_URL}/api/admin/exam-years/destroy/${yearItem.id}`, config);
      const msg = res.data?.message || "Exam Year deleted successfully!";
      setMessageToast({ type: "success", message: msg });
      fetchYears();
    } catch (error) {
      console.error("Failed to delete exam year:", error);
      const msg = error.response?.data?.message || "Failed to delete exam year.";
      setMessageToast({ type: "error", message: msg });
    }
  };

  // Generate Year range
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => (currentYear - i).toString());

  return (
    <StaffDashboardLayout pagetitle="Edit Exam Setup">
      {/* Toast Notification */}
      {messageToast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[250] px-8 py-4 rounded-2xl shadow-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-10 transition-all ${
          messageToast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {messageToast.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
          {messageToast.message}
        </div>
      )}

      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate("/staffs/manage-exams")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#0F2843] dark:hover:text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8 transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-[#0F2843] rounded-[40px] p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-[32px] flex items-center justify-center backdrop-blur-md">
              <IdentificationIcon className="w-8 h-8 md:w-10 md:h-10 text-[#BB9E7F]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase">Edit Exam Setup</h1>
              <p className="text-[#BB9E7F] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mt-2">
                Manage Exam Body & Years for {name || "Exam"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-[24px] p-2 mb-8 gap-2 shadow-inner">
          <button
            type="button"
            onClick={() => setSearchParams({ tab: "body" })}
            className={`flex-1 py-4 rounded-[18px] font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === "body"
                ? "bg-white dark:bg-gray-700 text-[#0F2843] dark:text-white shadow-md"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
            }`}
          >
            Exam Body Details
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ tab: "year" })}
            className={`flex-1 py-4 rounded-[18px] font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === "year"
                ? "bg-white dark:bg-gray-700 text-[#0F2843] dark:text-white shadow-md"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
            }`}
          >
            Exam Year Settings
          </button>
        </div>

        {/* Main Content Pane */}
        <div className="bg-white dark:bg-gray-800 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-gray-700 overflow-hidden min-h-[400px]">
          {fetching ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-[#BB9E7F] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Setup Data...</p>
            </div>
          ) : activeTab === "body" ? (
            /* EXAM BODY FORM */
            <form onSubmit={handleSubmitBody} className="p-8 md:p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Exam Name */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Exam Body Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. JAMB"
                    required
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner"
                  />
                </div>

                {/* Course Selection */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Associated Course</label>
                  <select 
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-inner"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Visibility Status</label>
                <div className="flex gap-4">
                  {["active", "inactive"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                        status === s 
                          ? "bg-[#0F2843] text-white border-[#0F2843]" 
                          : "bg-gray-50 dark:bg-gray-900 text-gray-400 border-transparent hover:border-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col md:flex-row items-center gap-6 pt-10 pb-6 border-t border-gray-100 dark:border-gray-700">
                <button 
                  type="button" 
                  onClick={() => navigate("/staffs/manage-exams")}
                  className="w-full md:flex-1 py-6 bg-gray-50 dark:bg-gray-700 text-gray-400 font-black rounded-[28px] hover:text-gray-600 transition-all uppercase tracking-[0.2em] text-xs"
                >
                  Cancel Edit
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full md:flex-[2] py-6 bg-[#0F2843] text-white font-black rounded-[28px] shadow-2xl shadow-[#0F2843]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3"
                >
                  {loading ? "Saving Changes..." : "Save Exam Details"}
                  {!loading && <CheckCircleIcon className="w-5 h-5 text-[#BB9E7F]" />}
                </button>
              </div>

              {/* Danger Zone */}
              <div className="pt-8 border-t border-red-100 dark:border-red-900/30">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-[32px] p-8 border-2 border-red-100 dark:border-red-900/20">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Danger Zone</h3>
                      <p className="text-xs text-gray-400 font-bold mt-1">Permanently delete this exam body and all its associated data.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleDeleteBody}
                      disabled={deleting}
                      className="px-8 py-4 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 active:scale-[0.97] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/20 shrink-0"
                    >
                      <TrashIcon className="w-4 h-4" />
                      {deleting ? "Deleting..." : "Delete Exam Body"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* EXAM YEAR SETTINGS */
            <div className="p-8 md:p-12 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Exam Years</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage subject temporal units</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddYearModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0F2843] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#0F2843]/20 hover:scale-105 transition-all"
                >
                  <PlusIcon className="w-4 h-4 text-[#BB9E7F]" />
                  Add Year
                </button>
              </div>

              {loadingYears ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#BB9E7F] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Loading Years...</p>
                </div>
              ) : years.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[32px] bg-gray-50/30">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">No years found</h4>
                  <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">Get started by creating a new exam year</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {years.map((y) => {
                    const subjName = y.subject?.title || y.subject?.name || subjects.find(s => String(s.id) === String(y.subject_id))?.name || "Unknown Subject";
                    return (
                      <div 
                        key={y.id}
                        className="p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#BB9E7F]/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700/50 text-[#0F2843] dark:text-[#BB9E7F]">
                            <CalendarIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-[#0F2843] dark:text-white uppercase tracking-tight">{y.year}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{subjName}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                y.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                              }`}>{y.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => startEditYear(y)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:text-[#0F2843] dark:hover:text-white hover:scale-105 active:scale-95 transition-all"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteYear(y)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50/50 dark:bg-red-950/20 text-red-500 border border-red-100/50 dark:border-red-950/50 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95 transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Year Modal Overlay */}
      {isAddYearModalOpen && (
        <ExamYearCreateModal
          isOpen={isAddYearModalOpen}
          onClose={() => setIsAddYearModalOpen(false)}
          onSuccess={() => {
            fetchYears();
            setMessageToast({ type: "success", message: "Exam Year created successfully!" });
          }}
          examBodies={[{ id: id, name: name }]}
          courseId={courseId}
          selectedExamBodyId={id}
        />
      )}

      {/* Edit Year Overlay Modal */}
      {editingYear && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-[#0F2843] text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <PencilSquareIcon className="w-6 h-6 text-[#BB9E7F]" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight uppercase">Edit Exam Year</h2>
                  <p className="text-[#BB9E7F] text-[9px] font-black uppercase tracking-widest">Update Temporal Unit</p>
                </div>
              </div>
              <button onClick={() => setEditingYear(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleUpdateYearSubmit} className="space-y-6">
                {/* Year Dropdown */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <select 
                      value={editYearVal}
                      onChange={(e) => setEditYearVal(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-bold text-sm outline-none transition-all appearance-none"
                    >
                      {yearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <AcademicCapIcon className="w-5 h-5" />
                    </div>
                    <select 
                      value={editSubjectId}
                      onChange={(e) => setEditSubjectId(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-bold text-sm outline-none transition-all appearance-none"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-bold text-sm outline-none transition-all appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setEditingYear(null)}
                    className="flex-1 py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 font-bold rounded-2xl hover:bg-gray-100 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={savingYear}
                    className="flex-[2] py-4 bg-[#0F2843] text-white font-bold rounded-2xl shadow-xl shadow-[#0F2843]/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {savingYear ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                    {savingYear ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </StaffDashboardLayout>
  );
}
