import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import ScrollReveal from "../../components/public/ScrollReveal";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

const CourseDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Load from state if navigated from ProgramCard, otherwise null
  const initialCourse = location.state?.course || null;

  const [course, setCourse] = useState(initialCourse);
  const [loading, setLoading] = useState(!initialCourse);
  
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    // If course wasn't passed via router state (e.g., user refreshed the page)
    if (!course) {
      const fetchCourse = async () => {
        try {
          // Fetch all courses since there isn't a known single-course endpoint
          const res = await axios.get(`${API_BASE_URL}/api/courses`);
          const fetchedCourses = res?.data?.courses || [];
          
          // Find the specific course
          const foundCourse = fetchedCourses.find((c) => c.id.toString() === id);
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            // Not found
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
  }, [course, id, navigate]);

  useEffect(() => {
    if (course && course.id) {
      const fetchSubjects = async () => {
        setLoadingSubjects(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/courses/${course.id}/subjects`);
          // Handle various API response structures: res.data.subjects, res.data.data, or just res.data
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

  // Actual Normal Prices (from backend)
  const monthly = basePrice;
  const quarterly = Math.round(basePrice * 3 * 0.95);
  const semiAnnually = Math.round(basePrice * 6 * 0.95);
  const annually = Math.round(basePrice * 12 * 0.95);

  // Expensive Slashed Prices (calculated from 40,000)
  const slashedMonthly = 40000;
  const slashedQuarterly = 40000 * 3;
  const slashedSemiAnnually = 40000 * 6;
  const slashedAnnually = 40000 * 12;

  return (
    <>
      <Navbar />

      <div className="bg-gray-50 min-h-screen pb-20 pt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
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

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header / Banner Area */}
            <ScrollReveal delay={0.2} direction="up" distance={20}>
              <div className="bg-[#FFF0F0] relative overflow-hidden flex items-center justify-center p-12 lg:p-20" style={{ minHeight: "300px" }}>
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt={course.title}
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

            {/* Content Area */}
            <div className="grid md:grid-cols-3 gap-8 p-8 md:p-12">
              
              {/* Left Column: Description */}
              <ScrollReveal delay={0.3} direction="up" distance={20} className="md:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-[#09314F] mb-4 uppercase">Program Overview</h2>
                  {course.description ? (
                    <div 
                      className="prose max-w-none text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">No detailed description available for this course.</p>
                  )}
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-[#09314F] mb-3">What's Included:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-gray-700">
                      <span className="text-green-500 font-bold">✓</span> 
                      Comprehensive tutorials tailored to the syllabus
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <span className="text-green-500 font-bold">✓</span> 
                      Weekly masterclasses with subject experts
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <span className="text-green-500 font-bold">✓</span> 
                      Standard mock tests and practice questions
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <span className="text-green-500 font-bold">✓</span> 
                      Live Q&A sessions for difficult topics
                    </li>
                  </ul>
                </div>

                {/* Subjects Section */}
                <div className="mt-10">
                  <h2 className="text-2xl font-black text-[#09314F] mb-6 uppercase">Subjects Covered</h2>
                  {loadingSubjects ? (
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="w-5 h-5 border-2 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
                      <span className="text-sm font-medium">Loading subjects...</span>
                    </div>
                  ) : subjects.length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(
                        subjects.reduce((acc, sub) => {
                          const dept = sub.department?.name || sub.department || "General Subjects";
                          if (!acc[dept]) acc[dept] = [];
                          acc[dept].push(sub);
                          return acc;
                        }, {})
                      ).map(([department, deptSubjects], index) => (
                        <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-lg font-black text-[#09314F] mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <span className="text-[#E83831]">📘</span> {department}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {deptSubjects.map((sub, sIdx) => (
                              <div key={sub.id || sIdx} className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 p-3 rounded-xl">
                                <span className="w-2 h-2 rounded-full bg-[#09314F]" />
                                {sub.name || sub.title}
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

              {/* Right Column: Pricing & Action */}
              <ScrollReveal delay={0.4} direction="up" distance={20}>
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-32">
                  <h3 className="text-xl font-black text-[#09314F] mb-6 uppercase border-b border-gray-200 pb-4">Tuition Options</h3>
                  
                  <div className="space-y-5 mb-8">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <span className="text-sm font-bold text-gray-500">Monthly (1 month)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 line-through">₦{slashedMonthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <span className="text-lg font-black text-[#09314F]">₦{monthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#BB9E7F]/30 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#BB9E7F] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">Save 5%</div>
                      <span className="text-sm font-bold text-gray-500">Quarterly (3 months)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 line-through">₦{slashedQuarterly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <span className="text-lg font-black text-[#09314F]">₦{quarterly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#BB9E7F]/30 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#BB9E7F] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">Save 5%</div>
                      <span className="text-sm font-bold text-gray-500">Semi-Annually (6 months)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 line-through">₦{slashedSemiAnnually.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <span className="text-lg font-black text-[#09314F]">₦{semiAnnually.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">Best Value</div>
                      <span className="text-sm font-bold text-gray-500">Annually (1 year)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 line-through">₦{slashedAnnually.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <span className="text-lg font-black text-green-600">₦{annually.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/register")}
                    className="w-full py-4 text-white font-black text-lg rounded-2xl shadow-xl hover:brightness-110 transition-all active:scale-95"
                    style={{ background: "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)" }}
                  >
                    Enroll Now
                  </button>
                  <p className="text-center text-xs text-gray-400 font-medium mt-4">Secure your spot today.</p>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CourseDetails;
