import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import StaffDashboardLayout from "../DashboardLayout.jsx";
import { 
  ArrowLeftIcon,
  IdentificationIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function ExamEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState("active");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchData = useCallback(async () => {
    setFetching(true);
    const fetchExam = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log("[ExamEdit] Fetching Exam Body for Edit:", `${API_BASE_URL}/api/admin/exam-bodies/all`);
        const res = await axios.get(`${API_BASE_URL}/api/admin/exam-bodies/all`, config);
        console.log("[ExamEdit] Exam Bodies Response:", res.data);
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
        console.log("[ExamEdit] Fetching Courses:", `${API_BASE_URL}/api/courses`);
        const res = await axios.get(`${API_BASE_URL}/api/courses`, config);
        console.log("[ExamEdit] Courses Response:", res.data);
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  const handleSubmit = async (e) => {
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

      console.log("[ExamEdit] Updating Exam Body:", `${API_BASE_URL}/api/admin/exam-bodies/${id}`);
      await axios.put(`${API_BASE_URL}/api/admin/exam-bodies/update/${id}`, payload, config);
      navigate("/staffs/manage-exams");
    } catch (err) {
      console.error("Failed to update exam:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaffDashboardLayout pagetitle="Edit Exam">
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
              <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase">Edit Exam Body</h1>
              <p className="text-[#BB9E7F] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mt-2">Update Core Exam Details</p>
            </div>
          </div>
        </div>

        {/* Unified Form Container */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-gray-700 overflow-hidden">
          <div className="p-8 md:p-12 space-y-12">
            
            {fetching ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#BB9E7F] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Exam Data...</p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </form>
      </div>
    </StaffDashboardLayout>
  );
}
