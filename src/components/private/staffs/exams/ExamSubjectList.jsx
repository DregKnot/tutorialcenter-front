import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import StaffDashboardLayout from "../DashboardLayout.jsx";
import { stripHtmlAndDecode } from "../../../../utils/textUtils";
import { 
  // ArrowLeftIcon,
  // BookOpenIcon,
  ClockIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function ExamSubjectList() {
  const { bodyId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const [subjects, setSubjects] = useState([]);
  const [examBody, setExamBody] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSelectSubject = (subjectId) => {
    navigate(`/staffs/manage-exams/${bodyId}/subjects/${subjectId}/years`);
  };

  // Fetch Exam Body Details
  const fetchBody = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log("[ExamSubjectList] Fetching Exam Bodies:", `${API_BASE_URL}/api/admin/exam-data/bodies`);
      const res = await axios.get(`${API_BASE_URL}/api/admin/exam-data/bodies`, config);
      const bodies = Array.isArray(res.data) ? res.data : (res.data?.exam_bodies || res.data?.data || []);
      const currentBody = bodies.find(b => String(b.id) === String(bodyId));
      setExamBody(currentBody);
    } catch (err) {
      console.error("Failed to fetch exam body:", err);
    } finally {
      setLoading(false);
    }
  }, [bodyId, API_BASE_URL, token]);

  useEffect(() => {
    fetchBody();
  }, [fetchBody]);

  // Fetch Subjects via new drilldown API
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log("[ExamSubjectList] Fetching Subjects via drilldown API:", `${API_BASE_URL}/api/admin/exam-data/subjects?exam_body_id=${bodyId}`);
        const res = await axios.get(`${API_BASE_URL}/api/admin/exam-data/subjects?exam_body_id=${bodyId}`, config);
        
        const subjectsData = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.subjects || []);
        
        const formattedSubjects = subjectsData.map(sub => {
          let subjectImage = sub.image || sub.banner;
          if (subjectImage && !subjectImage.startsWith('http')) {
            subjectImage = `${API_BASE_URL}/storage/${subjectImage}`;
          }
          return {
            ...sub,
            image: subjectImage,
            yearCount: sub.exam_years_count || 0
          };
        });
        
        console.log("[ExamSubjectList] Formatted Subjects for Body:", bodyId, formattedSubjects);
        setSubjects(formattedSubjects);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [bodyId, API_BASE_URL, token]);

  return (
    <StaffDashboardLayout pagetitle="Exam Subjects">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-8">
          <Link to="/staffs/manage-exams" className="hover:text-[#0F2843] transition-colors">BACK</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <span className="text-[#0F2843] dark:text-white">{examBody?.name || "EXAM BODY"}</span>
        </div>

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 md:p-10 mb-10 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center">
              <ClockIcon className="w-7 h-7 text-[#BB9E7F]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Existing Questions</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Foundational Programs Questions And Answers</p>
            </div>
          </div>
          <div className="bg-[#0F2843] text-white px-5 py-3 rounded-xl font-black text-sm min-w-[50px] text-center shadow-lg">
            {subjects.length}
          </div>
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#BB9E7F] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning Subjects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => handleSelectSubject(subject.id)}
                  className="group bg-white dark:bg-gray-900 rounded-[36px] p-4 border border-gray-100 dark:border-gray-800 hover:border-[#BB9E7F]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#0F2843]/5 flex flex-col justify-between h-full relative cursor-pointer overflow-hidden"
                >
                  {/* Subject Image / Banner */}
                  <div className="relative h-36 rounded-[28px] overflow-hidden bg-gray-50 dark:bg-gray-800 mb-6">
                    {subject.banner ? (
                      <img 
                        src={subject.banner.startsWith('http') ? subject.banner : `${API_BASE_URL}/storage/${subject.banner}`} 
                        alt={subject.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0F2843] to-[#1a416d] text-white">
                        <span className="text-3xl font-black opacity-20 uppercase">{subject.name ? subject.name.substring(0,2) : "SB"}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-lg">SUBJECT</span>
                    </div>
                    <h3 className="text-lg font-black text-[#0F2843] dark:text-white uppercase tracking-tight mb-2 group-hover:text-[#BB9E7F] transition-colors">
                      {subject.title || subject.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed mb-6 line-clamp-2 uppercase tracking-wide">
                      {stripHtmlAndDecode(subject.description) || "Foundational subject for the selected exam program."}
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">Active</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-black uppercase">{subject.yearCount || 0} Years</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/40 rounded-[36px] border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">No subjects found for this exam body</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
