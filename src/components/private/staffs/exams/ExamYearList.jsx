import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import StaffDashboardLayout from "../DashboardLayout.jsx";
import { 
  // ArrowLeftIcon,
  // BookOpenIcon,
  ClockIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function ExamYearList() {
  const { bodyId, subjectId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const [years, setYears] = useState([]);
  const [examBody, setExamBody] = useState(null);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch Context Details
      console.log("[ExamYearList] Fetching Exam Bodies:", `${API_BASE_URL}/api/admin/exam-bodies/all`);
      console.log("[ExamYearList] Fetching Exam Years:", `${API_BASE_URL}/api/admin/exam-years/all`);
      
      const [bodiesRes, yearsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/exam-bodies/all`, config),
        axios.get(`${API_BASE_URL}/api/admin/exam-years/all`, config)
      ]);

      console.log("[ExamYearList] Exam Bodies Response:", bodiesRes.data);
      console.log("[ExamYearList] Exam Years Response:", yearsRes.data);

      const bodies = bodiesRes.data?.exam_bodies || bodiesRes.data?.data || bodiesRes.data || [];
      setExamBody(bodies.find(b => String(b.id) === String(bodyId)));

      const allYears = yearsRes.data?.data || yearsRes.data?.exam_years || [];

      // Extract subject from the year data
      const yearWithSubject = allYears.find(y => String(y.subject_id) === String(subjectId) && y.subject);
      const currentSubject = yearWithSubject?.subject || null;
      setSubject(currentSubject);

      let subjectImage = currentSubject?.image || currentSubject?.banner;
      if (subjectImage && !subjectImage.startsWith('http')) {
        subjectImage = `${API_BASE_URL}/storage/${subjectImage}`;
      }

      const filteredYearsRaw = allYears.filter(y => 
        String(y.exam_body_id) === String(bodyId) && 
        String(y.subject_id) === String(subjectId)
      );

      const filteredYears = await Promise.all(
        filteredYearsRaw.map(async (y) => {
          let yearImage = subjectImage || y.image || y.banner;
          if (yearImage && !yearImage.startsWith('http')) {
            yearImage = `${API_BASE_URL}/storage/${yearImage}`;
          }

          try {
            const countRes = await axios.get(
              `${API_BASE_URL}/api/admin/past-questions/all?exam_year_id=${y.id}&per_page=1`,
              config
            );
            const totalCount = 
              countRes.data?.questions?.total || 
              countRes.data?.total || 
              countRes.data?.questions?.data?.length || 
              countRes.data?.data?.length || 
              0;
            return { ...y, image: yearImage, questionCount: totalCount };
          } catch (e) {
            console.error(`Failed to fetch count for year ${y.id}:`, e);
            return { ...y, image: yearImage, questionCount: 0 };
          }
        })
      );

      console.log("[ExamYearList] Filtered & Prefixed Years with Counts:", { bodyId, subjectId }, filteredYears);
      setYears(filteredYears);
      
    } catch (err) {
      console.error("Failed to fetch years:", err);
    } finally {
      setLoading(false);
    }
  }, [bodyId, subjectId, API_BASE_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to calculate "X years ago"
  const getYearAgo = (year) => {
    const currentYear = new Date().getFullYear();
    const diff = currentYear - parseInt(year);
    return `${diff} year ago`;
  };

  return (
    <StaffDashboardLayout pagetitle="Exam Years">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-8">
          <Link to="/staffs/manage-exams" className="hover:text-[#0F2843] transition-colors">BACK</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <Link to={`/staffs/manage-exams/${bodyId}/subjects`} className="hover:text-[#0F2843] transition-colors">{examBody?.name || "BODY"}</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <span className="text-[#0F2843] dark:text-white uppercase">{subject?.title || subject?.name || "SUBJECT"}</span>
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
            {years.length}
          </div>
        </div>

        {/* Years Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#BB9E7F] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sorting Years...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {years.map((year) => (
              <div 
                key={year.id}
                onClick={() => navigate(`/staffs/manage-exams/${bodyId}/subjects/${subjectId}/years/${year.id}/questions`)}
                className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={year.image || "https://images.unsplash.com/photo-1579546678183-a9c101ad2f22?q=80&w=2070&auto=format&fit=crop"} 
                    alt={year.year} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#0F2843]/90 backdrop-blur-md rounded-xl text-white text-[10px] font-black min-w-[35px] text-center">
                    {year.questionCount || 0}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-lg">YEAR</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight mb-6 group-hover:text-[#BB9E7F] transition-colors">
                    {year.year}
                  </h3>

                  <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">Incomplete</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-black uppercase">{getYearAgo(year.year)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
