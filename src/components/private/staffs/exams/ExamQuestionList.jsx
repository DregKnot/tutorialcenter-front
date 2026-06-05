import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import StaffDashboardLayout from "../DashboardLayout.jsx";
import { 
  BookOpenIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";
import QuestionEditModal from "./QuestionEditModal";

export default function ExamQuestionList() {
  const { bodyId, subjectId, yearId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const [questions, setQuestions] = useState([]);
  const [examBody, setExamBody] = useState(null);
  const [subject, setSubject] = useState(null);
  const [year, setYear] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch Context Details
      console.log("[ExamQuestionList] Fetching Meta Data (Bodies, Courses, Years)");
      const [bodiesRes, subjectsRes, yearsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/exam-bodies/all`, config),
        axios.get(`${API_BASE_URL}/api/courses`, config),
        axios.get(`${API_BASE_URL}/api/admin/exam-years/all`, config)
      ]);

      console.log("[ExamQuestionList] Meta Response (Years):", yearsRes.data);

      const bodies = bodiesRes.data?.exam_bodies || bodiesRes.data?.data || bodiesRes.data || [];
      const currentBody = bodies.find(b => String(b.id) === String(bodyId));
      
      const fetchedCourses = subjectsRes.data?.data || subjectsRes.data?.courses || [];
      const matchingCourse = fetchedCourses.find(c => String(c.id) === String(currentBody?.course_id));
      
      let bannerUrl = matchingCourse?.banner || matchingCourse?.image;
      if (bannerUrl && !bannerUrl.startsWith('http')) {
        bannerUrl = `${API_BASE_URL}/storage/${bannerUrl}`;
      }

      setExamBody({
        ...currentBody,
        image: bannerUrl || currentBody?.image
      });

      const subjects = fetchedCourses;
      setSubject(subjects.find(s => String(s.id) === String(subjectId)));

      const years = yearsRes.data?.data || yearsRes.data?.exam_years || [];
      setYear(years.find(y => String(y.id) === String(yearId)));

      // Fetch Questions for this context
      console.log("[ExamQuestionList] Fetching All Past Questions:", `${API_BASE_URL}/api/admin/past-questions/all`);
      const questionsRes = await axios.get(`${API_BASE_URL}/api/admin/past-questions/all`, config);
      console.log("[ExamQuestionList] Past Questions Response:", questionsRes.data);
      const allQuestions = questionsRes.data?.questions?.data || questionsRes.data?.data || questionsRes.data?.questions || [];
      
      // Filter by body, subject (if available in payload), and year
      const filtered = allQuestions.filter(q => String(q.exam_year_id) === String(yearId));
      setQuestions(filtered);
      
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  }, [bodyId, subjectId, yearId, API_BASE_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <StaffDashboardLayout pagetitle="Questions List">
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        
        {/* Breadcrumb & Global Edit */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
            <Link to="/staffs/manage-exams" className="hover:text-[#0F2843] transition-colors">BACK</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link to={`/staffs/manage-exams/${bodyId}/subjects`} className="hover:text-[#0F2843] transition-colors">{examBody?.name || "BODY"}</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link to={`/staffs/manage-exams/${bodyId}/subjects/${subjectId}/years`} className="hover:text-[#0F2843] transition-colors uppercase">{subject?.title || "SUBJECT"}</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-[#0F2843] dark:text-white uppercase font-black">{year?.year || "YEAR"}</span>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#0F2843] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#0F2843]/20 hover:scale-105 transition-all">
            <PencilSquareIcon className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Header Banner Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm mb-10">
          <div className="relative h-32 md:h-40">
            <img 
              src={examBody?.image || "https://images.unsplash.com/photo-1579546678183-a9c101ad2f22?q=80&w=2070&auto=format&fit=crop"} 
              className="w-full h-full object-cover"
              alt="Banner"
            />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                  <TrophyIcon className="w-7 h-7 text-[#BB9E7F]" />
                </div>
                <div>
                  <h1 className="text-white font-black text-xl uppercase tracking-tight">Existing Questions</h1>
                  <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mt-1">Foundational Programs Questions And Answers</p>
                </div>
              </div>
              <div className="bg-[#0F2843] text-white px-5 py-3 rounded-xl font-black text-xs shadow-xl">
                {questions.length}
              </div>
            </div>
          </div>
          <div className="px-8 py-4 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
             <span className="px-2 py-1 bg-[#BB9E7F]/10 text-[#BB9E7F] text-[8px] font-black uppercase rounded-md tracking-tighter">YEAR</span>
             <span className="text-[#0F2843] dark:text-white font-black text-xs">{year?.year}</span>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#BB9E7F] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Questions...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-[#EDF0F3] dark:bg-gray-800/40 rounded-[32px] p-6 border border-transparent shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                {/* Question Card Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-300 dark:border-gray-700">
                  <h3 className="text-xs font-black text-[#0F2843] dark:text-white uppercase tracking-[0.2em]">Question {idx + 1}</h3>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest opacity-80">
                      Answer: <span className="font-black text-[#0F2843] dark:text-white">{q.options?.find(o => o.is_correct)?.label || "N/A"}</span>
                    </span>
                    <button 
                      onClick={() => { setSelectedQuestion(q); setIsEditModalOpen(true); }}
                      className="flex items-center gap-2 px-6 py-3 bg-[#0F2843] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#0F2843]/20"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Group Content (If any) */}
                  {q.group && q.group.type !== 'none' && (
                    <div className="mb-8 p-6 bg-white dark:bg-gray-900/40 rounded-[24px] border border-gray-200/50 dark:border-gray-700/30 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="px-2.5 py-1 bg-[#BB9E7F]/10 text-[#BB9E7F] text-[9px] font-black uppercase rounded-md tracking-wider">
                          Group: {q.group.type.replace('_', ' ')}
                        </span>
                        {q.group.title && (
                          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            — {q.group.title}
                          </span>
                        )}
                      </div>
                      {q.group.image && (
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                          <img 
                            src={q.group.image.startsWith('http') ? q.group.image : `${API_BASE_URL}/storage/${q.group.image}`} 
                            alt="Group Diagram" 
                            className="w-full h-auto rounded-xl"
                          />
                        </div>
                      )}
                      <div 
                        className="text-[13px] text-[#0F2843] dark:text-gray-300 leading-relaxed tracking-tight quill-content break-words whitespace-normal w-full overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: q.group.content }}
                      />
                    </div>
                  )}

                  {/* Question Main Content */}
                  <div className="space-y-6">
                     {/* Question Attachments (Images) */}
                     {q.files && q.files.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {q.files.map((file, fIdx) => (
                              <div key={fIdx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                 <img 
                                    src={file.file_path.startsWith('http') ? file.file_path : `${API_BASE_URL}/storage/${file.file_path}`} 
                                    alt={`Attachment ${fIdx}`} 
                                    className="w-full h-auto rounded-xl"
                                 />
                                 {file.caption && (
                                    <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{file.caption}</p>
                                 )}
                              </div>
                           ))}
                        </div>
                     )}

                    <div 
                      className="text-[13px] text-[#0F2843] dark:text-gray-300 leading-relaxed quill-content break-words whitespace-normal w-full overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: q.question }}
                    />
                  </div>

                  {/* Options Grid - Matches Design */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    {q.options?.map((opt) => (
                      <div 
                        key={opt.id}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all ${
                          opt.is_correct 
                            ? "bg-[#76D287] border-[#76D287] text-white shadow-xl shadow-[#76D287]/20" 
                            : "bg-white dark:bg-gray-900 border-transparent text-[#0F2843] dark:text-gray-400"
                        }`}
                      >
                        <span className="font-black text-[12px] min-w-[20px]">{opt.label}.</span>
                        <span className="text-[12px] font-black tracking-tight">
                          {opt.option_text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="mt-6 p-5 bg-[#BB9E7F]/5 dark:bg-[#BB9E7F]/10 rounded-[20px] border border-[#BB9E7F]/20 space-y-2">
                      <p className="text-[10px] font-black text-[#BB9E7F] uppercase tracking-widest">Explanation</p>
                      <div 
                        className="text-xs text-[#0F2843] dark:text-gray-300 leading-relaxed quill-content break-words whitespace-normal w-full overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: q.explanation }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                  <BookOpenIcon className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-[#0F2843] dark:text-white uppercase">No Questions Found</h3>
                <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">Start by adding a question to this year</p>
                <button 
                  onClick={() => navigate("/staffs/manage-exams/question")}
                  className="mt-8 px-8 py-4 bg-[#0F2843] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl"
                >
                  Create New Question
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditModalOpen && selectedQuestion && (
        <QuestionEditModal 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedQuestion(null);
          }}
          question={selectedQuestion}
          onSuccess={fetchData}
          existingQuestions={questions}
        />
      )}
    </StaffDashboardLayout>
  );
}
