import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { XMarkIcon, CheckIcon, PlusIcon, CalendarIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export default function ExamYearCreateModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  examBodies = [], 
  courseId,
  selectedExamBodyId 
}) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const [examBodyId, setExamBodyId] = useState(selectedExamBodyId || "");
  const [subjectId, setSubjectId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState("active");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchSubjects = useCallback(async (cid) => {
    setFetchingSubjects(true);
    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        } 
      };
      const res = await axios.get(`${API_BASE_URL}/api/courses/${cid}/subjects`, config);
      setSubjects(res.data?.data || res.data?.subjects || []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    } finally {
      setFetchingSubjects(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedExamBodyId) {
      setExamBodyId(selectedExamBodyId);
    }
  }, [selectedExamBodyId]);

  useEffect(() => {
    if (courseId && isOpen) {
      fetchSubjects(courseId);
    }
  }, [courseId, isOpen, fetchSubjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      };

      const payload = {
        exam_body_id: examBodyId,
        subject_id: subjectId,
        year: parseInt(year),
        status
      };

      console.log("[ExamYearCreateModal] Creating Exam Year:", `${API_BASE_URL}/api/admin/exam-years`);
      const res = await axios.post(`${API_BASE_URL}/api/admin/exam-years`, payload, config);
      console.log("[ExamYearCreateModal] Response:", res.data);
      
      setToast({ type: "success", message: "Exam Year created successfully!" });
      setTimeout(() => {
        onSuccess?.(res.data?.data || res.data);
        onClose();
        setSubjectId("");
        setToast(null);
      }, 1500);
    } catch (error) {
      setToast({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to create exam year." 
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => (currentYear - i).toString());

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

      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        <div className="p-6 bg-[#0F2843] text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-[#BB9E7F]" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">NEW EXAM YEAR</h2>
              <p className="text-[#BB9E7F] text-[9px] font-black uppercase tracking-widest">Temporal Unit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Exam Body</label>
              <select 
                value={examBodyId}
                onChange={(e) => setExamBodyId(e.target.value)}
                required
                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-bold text-sm outline-none transition-all appearance-none"
              >
                <option value="">Select Exam Body</option>
                {examBodies.map(body => (
                  <option key={body.id} value={body.id}>{body.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <AcademicCapIcon className="w-5 h-5" />
                </div>
                <select 
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                  disabled={fetchingSubjects}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-bold text-sm outline-none transition-all appearance-none disabled:opacity-50"
                >
                  <option value="">{fetchingSubjects ? "Fetching subjects..." : "Select a subject"}</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <select 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-bold text-sm outline-none transition-all appearance-none"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-2xl font-bold text-sm outline-none transition-all appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 font-bold rounded-2xl hover:bg-gray-100 transition-all text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 bg-[#0F2843] text-white font-bold rounded-2xl shadow-xl shadow-[#0F2843]/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                {loading ? "Creating..." : "Save Exam Year"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
