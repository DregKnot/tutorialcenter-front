import React, { useState, useEffect, useCallback } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
// import { Icon } from "@iconify/react";
import axios from "axios";
import { 
  PlusIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  IdentificationIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const config = {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      };

      console.log("[ExamManagement] Fetching Exam Bodies and Courses via new drilldown API");
      
      const [examRes, coursesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/exam-data/bodies`, config),
        axios.get(`${API_BASE_URL}/api/courses`, config)
      ]);

      console.log("[ExamManagement] Exam Bodies Response:", examRes.data);
      console.log("[ExamManagement] Courses Response:", coursesRes.data);

      const fetchedExams = Array.isArray(examRes.data) ? examRes.data : (examRes.data?.exam_bodies || examRes.data?.data || []);
      const fetchedCourses = coursesRes.data?.data || coursesRes.data?.courses || [];

      // Map course banners to exams
      const examsFinal = fetchedExams.map(exam => {
        const matchingCourse = fetchedCourses.find(c => String(c.id) === String(exam.course_id));
        let bannerPath = matchingCourse?.banner || matchingCourse?.image || exam.image;
        
        if (bannerPath && !bannerPath.startsWith('http')) {
          bannerPath = `${API_BASE_URL}/storage/${bannerPath}`;
        }

        return {
          ...exam,
          image: bannerPath,
          courseName: matchingCourse?.title || "General",
          subjectCount: exam.exam_years_count || 0
        };
      });

      setExams(Array.isArray(examsFinal) ? examsFinal : []);
    } catch (error) {
      console.error("Failed to fetch exams or courses:", error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <StaffDashboardLayout pagetitle="Exam Management">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full min-h-screen dark:bg-gray-900 transition-colors duration-300">
        

        {/* Database Action Card */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.02)] mb-10 flex flex-col md:flex-row items-center justify-between gap-6 group">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0F2843] rounded-[24px] flex items-center justify-center shadow-xl shadow-[#0F2843]/20 transition-transform group-hover:scale-105">
              <BookOpenIcon className="w-8 h-8 md:w-10 md:h-10 text-[#BB9E7F]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Exams</h2>
              <p className="text-gray-400 dark:text-gray-500 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Set Questions And Save In The Database</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/staffs/manage-exams/question")}
            className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-[#0F2843] text-white font-black rounded-2xl md:rounded-3xl shadow-2xl shadow-[#0F2843]/30 hover:scale-[1.03] active:scale-95 transition-all text-xs md:text-sm flex items-center justify-center gap-3"
          >
            <PlusIcon className="w-5 h-5 md:w-6 h-6" />
            <span>Create New Question</span>
          </button>
        </div>

        {/* Existing Questions/Exams Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
              <ClockIcon className="w-6 h-6 text-[#BB9E7F]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-wider">EXISTING QUESTIONS</h2>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Foundational Programs Questions And Answers</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-[32px] h-[450px] animate-pulse border border-gray-100 dark:border-gray-700 shadow-sm" />
              ))}
            </div>
          ) : exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
              {exams.map((exam) => (
                <div 
                  key={exam.id} 
                  className="bg-white dark:bg-gray-800 rounded-[40px] h-[450px] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all group relative"
                >
                  {/* Full Background Image */}
                  <div className="absolute inset-0 cursor-pointer" onClick={() => navigate(`/staffs/manage-exams/${exam.id}/subjects`)}>
                    <img 
                      src={exam.image || "https://images.unsplash.com/photo-1579546678183-a9c101ad2f22?q=80&w=2070&auto=format&fit=crop"} 
                      alt={exam.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2843] via-[#0F2843]/40 to-transparent"></div>
                  </div>

                  {/* Top Badge: Subject Count */}
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-[#0F2843]/80 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-xs font-black min-w-[44px] text-center border border-white/10 shadow-2xl">
                      {exam.subjectCount || 0}
                    </div>
                  </div>

                  {/* Bottom Information Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-10 pointer-events-none">
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-[#BB9E7F] text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/5">
                        {exam.courseName}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none truncate">
                      {exam.name || exam.title}
                    </h3>
                  </div>

                  {/* Actions: Three Dot Menu */}
                  <div className="absolute top-6 left-6 z-20">
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === exam.id ? null : exam.id); }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          activeMenu === exam.id ? "bg-white text-[#0F2843]" : "bg-[#0F2843]/60 backdrop-blur-md text-white hover:bg-white hover:text-[#0F2843]"
                        }`}
                      >
                        <EllipsisVerticalIcon className="w-6 h-6" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === exam.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }}
                          ></div>
                          <div className="absolute left-0 mt-3 w-64 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-3 z-40 animate-in zoom-in-95 duration-200">
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/staffs/manage-exams/edit/${exam.id}?tab=body`); }}
                              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-all text-left group/item"
                            >
                              <div className="w-10 h-10 bg-[#BB9E7F]/10 rounded-xl flex items-center justify-center text-[#BB9E7F] group-hover/item:bg-[#BB9E7F] group-hover/item:text-white transition-all">
                                <IdentificationIcon className="w-5 h-5" />
                              </div>
                              <span className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Edit Exam Body</span>
                            </button>

                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/staffs/manage-exams/edit/${exam.id}?tab=year`); }}
                              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-all text-left group/item"
                            >
                              <div className="w-10 h-10 bg-[#0F2843]/10 rounded-xl flex items-center justify-center text-[#0F2843] dark:text-white group-hover/item:bg-[#0F2843] transition-all">
                                <CalendarIcon className="w-5 h-5" />
                              </div>
                              <span className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Edit Exam Year</span>
                            </button>

                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/staffs/manage-exams/question`); }}
                              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-all text-left group/item"
                            >
                              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 group-hover/item:bg-green-500 group-hover/item:text-white transition-all">
                                <PlusIcon className="w-5 h-5" />
                              </div>
                              <span className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Create Question</span>
                            </button>

                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/staffs/manage-exams/${exam.id}/subjects`); }}
                              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-all text-left group/item"
                            >
                              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                                <EyeIcon className="w-5 h-5" />
                              </div>
                              <span className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Existing Questions</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
                <ClipboardDocumentCheckIcon className="w-12 h-12 text-gray-200 dark:text-gray-700" />
              </div>
              <h4 className="text-xl font-black text-[#0F2843] dark:text-white mb-2 uppercase tracking-tight">No exam created</h4>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest max-w-xs">
                create one today by clicking the button above
              </p>
              <button 
                onClick={() => navigate("/staffs/manage-exams/question")}
                className="mt-8 px-10 py-4 bg-[#0F2843] text-white font-black rounded-2xl hover:scale-105 transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
