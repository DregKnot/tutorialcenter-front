import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import ScrollReveal from "../../components/public/ScrollReveal";
import DiscountCard from "../../components/public/DiscountCard";
import { formatDepartments } from "../../utils/textUtils";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

const CourseDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialCourse = location.state?.course || null;

  const [course, setCourse] = useState(initialCourse);
  const [loading, setLoading] = useState(!initialCourse);
  
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    if (!course) {
      const fetchCourse = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/courses`);
          const fetchedCourses = res?.data?.courses || [];
          const foundCourse = fetchedCourses.find((c) => c.title.toLowerCase().replace(/\s+/g, '-') === slug);
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            navigate("/training");
          }
        } catch (err) {
          console.error("Failed to fetch courses:", err);
          navigate("/training");
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [course, slug, navigate]);

  useEffect(() => {
    if (course && course.id) {
      const fetchSubjects = async () => {
        setLoadingSubjects(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/courses/${course.id}/subjects`);
          const fetchedSubjects = res?.data?.subjects || res?.data?.data || res?.data || [];
          setSubjects(Array.isArray(fetchedSubjects) ? fetchedSubjects : []);
        } catch (err) {
          console.error("Failed to fetch subjects:", err);
        } finally {
          setLoadingSubjects(false);
        }
      };
      fetchSubjects();
    }
  }, [course]);

  useEffect(() => {
    console.log("PAGE INFORMATION (Course):", course);
  }, [course]);

  useEffect(() => {
    if (selectedSubject) {
      console.log("MODAL INFORMATION (Subject):", selectedSubject);
    }
  }, [selectedSubject]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!course) return null;

  const bannerUrl = course.banner
    ? `${API_BASE_URL}/storage/${course.banner}`
    : null;

  const basePrice = Number(course.price) || 25000;
  const monthly = basePrice;
  const quarterly = Math.round(basePrice * 3 * 0.95);
  const semiAnnually = Math.round(basePrice * 6 * 0.95);
  const annually = Math.round(basePrice * 12 * 0.95);

  const slashedMonthly = 40000;
  const slashedQuarterly = 40000 * 3;
  const slashedSemiAnnually = 40000 * 6;
  const slashedAnnually = 40000 * 12;

  const handleApply = () => {
    if (course?.title?.toLowerCase().includes("gce")) {
      navigate("/campaign/gce/department");
    } else {
      navigate("/register");
    }
  };

  return (
    <>
      <Navbar />

      <div className="bg-gray-50 min-h-screen pb-20 pt-28">
        <div className="Container">
          
          <ScrollReveal delay={0.1} direction="up" distance={20}>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-[#09314F] transition-colors mb-8 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Programs
            </button>
          </ScrollReveal>

          {/* Header Area */}
          <ScrollReveal delay={0.2} direction="up" distance={20}>
            <div className="bg-[#FFF0F0] relative overflow-hidden flex items-center justify-center p-12 lg:p-20 rounded-3xl mb-12 shadow-md" style={{ minHeight: "300px" }}>
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt={course.title}
                  loading="eager"
                  fetchpriority="high"
                  className="w-full h-full object-cover absolute inset-0 opacity-90"
                />
              ) : (
                <div className="w-32 h-32 bg-[#E83831] rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-white text-5xl font-bold">📚</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09314F]/90 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight shadow-sm drop-shadow-md">
                  {course.title}
                </h1>
              </div>
            </div>
          </ScrollReveal>

          {/* Layout Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Column: Description & Subjects */}
            <ScrollReveal delay={0.3} direction="up" distance={20} className="md:col-span-2 space-y-12">
              {/* Overview */}
              <div>
                <h2 className="text-3xl font-black text-[#09314F] mb-6 uppercase tracking-tight border-b-2 border-gray-200 pb-2 inline-block">Program Overview</h2>
                {course.description ? (
                  <div 
                    className="text-gray-600 leading-relaxed text-lg quill-content break-words"
                    dangerouslySetInnerHTML={{ __html: course.description.replace(/&nbsp;/g, " ") }}
                  />
                ) : (
                  <p className="text-gray-500 italic">No detailed description available for this course.</p>
                )}
              </div>

              {/* What's Included */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-[#09314F] mb-5 uppercase tracking-tight">What's Included</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 text-gray-700 text-lg">
                    <span className="text-green-500 font-bold bg-green-50 w-8 h-8 rounded-full flex items-center justify-center shrink-0">✓</span> 
                    Comprehensive tutorials tailored to the syllabus
                  </li>
                  <li className="flex items-start gap-4 text-gray-700 text-lg">
                    <span className="text-green-500 font-bold bg-green-50 w-8 h-8 rounded-full flex items-center justify-center shrink-0">✓</span> 
                    Weekly masterclasses with subject experts
                  </li>
                  <li className="flex items-start gap-4 text-gray-700 text-lg">
                    <span className="text-green-500 font-bold bg-green-50 w-8 h-8 rounded-full flex items-center justify-center shrink-0">✓</span> 
                    Standard mock tests and practice questions
                  </li>
                  <li className="flex items-start gap-4 text-gray-700 text-lg">
                    <span className="text-green-500 font-bold bg-green-50 w-8 h-8 rounded-full flex items-center justify-center shrink-0">✓</span> 
                    Live Q&A sessions for difficult topics
                  </li>
                </ul>
              </div>

              {/* Subjects List (Clickable Cards) */}
              <div>
                <h2 className="text-3xl font-black text-[#09314F] mb-6 uppercase tracking-tight border-b-2 border-gray-200 pb-2 inline-block">Subjects Covered</h2>
                <p className="text-gray-500 mb-6 font-medium">Click on any subject to view details.</p>
                
                {loadingSubjects ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-5 h-5 border-2 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
                    <span className="text-sm font-medium">Loading subjects...</span>
                  </div>
                ) : subjects.length > 0 ? (
                  <div className="space-y-10">
                    {Object.entries(
                      subjects.reduce((acc, sub) => {
                        const dept = formatDepartments(sub.departments, "General Subjects");
                        if (!acc[dept]) acc[dept] = [];
                        acc[dept].push(sub);
                        return acc;
                      }, {})
                    ).map(([department, deptSubjects], index) => (
                      <div key={index} className="space-y-4">
                        <h3 className="text-xl font-black text-[#09314F] uppercase tracking-tight border-b border-gray-200 pb-2">
                          {department}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                          {deptSubjects.map((sub, sIdx) => (
                            <div 
                              key={sub.id || sIdx} 
                              onClick={() => setSelectedSubject(sub)}
                              className="bg-white border border-gray-100 shadow-sm rounded-2xl cursor-pointer hover:shadow-xl hover:border-[#09314F]/30 transition-all flex flex-col group overflow-hidden transform hover:-translate-y-1"
                            >
                              <div className="w-full h-28 sm:h-32 bg-blue-50/50 relative overflow-hidden flex items-center justify-center">
                                {sub.banner ? (
                                  <img src={`${API_BASE_URL}/storage/${sub.banner}`} alt={sub.name || sub.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <svg className="w-10 h-10 text-blue-200 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                )}
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                              </div>
                              <div className="p-4 sm:p-5 flex flex-col">
                                <span className="font-black text-gray-800 text-sm sm:text-base group-hover:text-[#09314F] transition-colors line-clamp-1 mb-1">
                                  {sub.name || sub.title}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">
                                  {formatDepartments(sub.departments, "General Subjects")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic font-medium">No subjects found for this course.</p>
                )}
              </div>
            </ScrollReveal>

            {/* Right Column: Discount Cards */}
            <ScrollReveal delay={0.4} direction="up" distance={20} className="md:col-span-1">
              <div className="sticky top-28 space-y-8">
                <h3 className="text-2xl font-black text-[#09314F] mb-6 uppercase tracking-tight text-center">Investment Options</h3>
                
                <DiscountCard 
                  title="Monthly (1 month)" 
                  slashedPrice={slashedMonthly} 
                  actualPrice={monthly} 
                />
                
                <DiscountCard 
                  title="Quarterly (3 months)" 
                  slashedPrice={slashedQuarterly} 
                  actualPrice={quarterly} 
                  savingsText="Save 5%"
                  isPopular={true}
                />

                <DiscountCard 
                  title="Semi-Annually (6 months)" 
                  slashedPrice={slashedSemiAnnually} 
                  actualPrice={semiAnnually} 
                  savingsText="Save 5%"
                />

                <DiscountCard 
                  title="Annually (1 year)" 
                  slashedPrice={slashedAnnually} 
                  actualPrice={annually} 
                  savingsText="Save 5%"
                />

                <button
                  onClick={handleApply}
                  className="w-full py-4 text-white font-black text-xl rounded-2xl shadow-xl hover:brightness-110 transition-all active:scale-95"
                  style={{ background: "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)" }}
                >
                  Apply Now
                </button>
                <p className="text-center text-sm text-gray-400 font-medium">Secure your spot today.</p>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </div>

      <Footer />

      {/* Subject Modal Popup */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-28 pb-6 px-4 sm:px-6 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedSubject(null)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden transform scale-100 transition-all flex flex-col md:flex-row max-h-[calc(100vh-8rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Image Area (Side by side on desktop) */}
            <div className="bg-gray-100 h-56 md:h-auto md:w-[45%] shrink-0 flex items-center justify-center relative">
              {selectedSubject.banner ? (
                <img src={`${API_BASE_URL}/storage/${selectedSubject.banner}`} alt={selectedSubject.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md text-blue-600 relative z-10">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Glass container for department */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-xl z-10">
                <p className="text-white text-xs font-bold uppercase tracking-widest opacity-90 mb-1">Department</p>
                <p className="text-white font-black text-lg drop-shadow-md line-clamp-1">{formatDepartments(selectedSubject.departments, "General Subjects")}</p>
              </div>
            </div>
            
            {/* Right Scrollable Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
              <button 
                onClick={() => setSelectedSubject(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors z-20"
              >
                ✕
              </button>
              
              <div className="p-5 sm:p-7 overflow-y-auto flex-1">
                <h3 className="text-3xl sm:text-4xl font-black text-[#09314F] mb-6 pr-12 leading-tight">{selectedSubject.name || selectedSubject.title}</h3>
                
                {selectedSubject.description ? (
                  <div 
                    className="text-gray-700 text-base sm:text-lg leading-relaxed quill-content break-words"
                    dangerouslySetInnerHTML={{ __html: selectedSubject.description.replace(/&nbsp;/g, " ") }}
                  />
                ) : (
                  <p className="text-gray-400 italic text-base">No description available for this subject.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseDetails;
