import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {  
  ChevronLeftIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import SubjectSelectionModal from "./SubjectSelectionModal";
import ReviewSelectionModal from "./ReviewSelectionModal";
import TrainingDurationModal from "./TrainingDurationModal";
import PaymentMethodModal from "./PaymentMethodModal";
import { clearDashboardCache } from "../../../utils/dashboardCache.js";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

export default function AddTraining({ onBack, onSuccess, onRenewCourse }) {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentStep, setCurrentStep] = useState("selection"); // selection, subjects, review, duration, payment
  
  // Modal Data
  const [subjectsByCourse, setSubjectsByCourse] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedDurations, setSelectedDurations] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const token = localStorage.getItem("student_token");

  // Student Context
  const student = useMemo(() => {
    try {
      const storedData = JSON.parse(localStorage.getItem("studentdata"));
      const storedInfo = JSON.parse(localStorage.getItem("student_info"));
      return storedInfo || storedData?.data || storedInfo?.data || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allCoursesRes, activeRes, paymentsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/courses`),
          axios.get(`${API_BASE_URL}/api/students/courses`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { courses: [] } })),
          axios.get(`${API_BASE_URL}/api/students/payments`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { payments: [] } }))
        ]);

        const allCourses = allCoursesRes.data.data || allCoursesRes.data.courses || [];
        const enrolled = activeRes.data?.courses || activeRes.data?.data || [];
        const paymentsList = paymentsRes.data?.payments || paymentsRes.data?.courses || paymentsRes.data?.data || [];

        setCourses(allCourses);
        setEnrolledCourses(Array.isArray(enrolled) ? enrolled : []);
        setPaymentsHistory(Array.isArray(paymentsList) ? paymentsList : []);
      } catch (err) {
        console.error("Failed to fetch courses and payment history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const toggleCourseSelection = (course) => {
    setSelectedCourses(prev => {
      const isSelected = prev.find(c => c.id === course.id);
      if (isSelected) {
        return prev.filter(c => c.id !== course.id);
      }
      return [...prev, course];
    });
  };

  const handlePaymentSuccess = async (response) => {
    if (!student || !selectedCourses.length) return;
    setProcessing(true);

    try {
      const studentId = student.id;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      };
      
      // Sequential Enrollment/Payment Logic
      for (const course of selectedCourses) {
        const duration = selectedDurations[course.id];
        
        // 1. Course Enrollment
        const enrollRes = await axios.post(`${API_BASE_URL}/api/course/enrollment`, {
          student_id: studentId,
          course_id: course.id,
          billing_cycle: duration?.duration || "monthly"
        }, { headers });
        
        const enrollmentId = 
          enrollRes.data?.enrollment?.id || 
          enrollRes.data?.data?.id || 
          enrollRes.data?.id;

        console.log(`[AddTraining] Course ${course.title} (ID: ${course.id}) enrolled with enrollment ID:`, enrollmentId);

        // 2. Subject Enrollment
        const subjectIds = 
          selectedSubjects[course.id] || 
          selectedSubjects[String(course.id)] || 
          selectedSubjects[Number(course.id)] || 
          [];

        console.log(`[AddTraining] Enrolling ${subjectIds.length} subjects for course ${course.id}:`, subjectIds);

        for (const subId of subjectIds) {
          try {
            await axios.post(`${API_BASE_URL}/api/subject/enrollment`, {
              student_id: studentId,
              course_enrollment_id: enrollmentId,
              subject_id: subId
            }, { headers });
            console.log(`[AddTraining] Subject ID ${subId} successfully enrolled for enrollment #${enrollmentId}`);
          } catch (subErr) {
            console.error(`[AddTraining] Failed to enroll subject ID ${subId}:`, subErr.response?.data || subErr);
          }
        }

        // 3. Payment Record
        await axios.post(`${API_BASE_URL}/api/payments`, {
          student_id: studentId,
          course_enrollment_id: enrollmentId,
          amount: duration?.price || 0,
          billing_cycle: duration?.duration || "monthly",
          payment_method: "card",
          gateway: selectedPaymentMethod,
          status: "successful",
          gateway_reference: response?.reference || `ADD-${Date.now()}-${course.id}`,
          paid_at: new Date().toISOString(),
          email: student?.email
        }, { headers });
      }

      if (student?.id) {
        clearDashboardCache(student.id);
      }

      if (onSuccess) {
        onSuccess("Training and subjects registered successfully!");
      } else {
        onBack(); // Return to main view
      }
    } catch (err) {
      console.error("Enrollment failed", err);
      if (err.response?.status === 409) {
        alert("You have previously registered for one of the selected courses. Please renew it directly instead of creating a new enrollment.");
      } else {
        alert(err.response?.data?.message || "Something went wrong during enrollment. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden pt-4">

      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 group w-fit"
      >
        <ChevronLeftIcon className="w-4 h-4 text-gray-500 group-hover:text-[#0F2843] transition-colors" />
        <span className="text-sm text-gray-500 group-hover:text-[#0F2843] transition-colors">
          Back / <span className="font-bold text-[#0F2843]">Add Training</span>
        </span>
      </button>

      <div className="flex-1 bg-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-black text-[#0F2843]">Select Examinations</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-lg">
              Select the examinations you want to enroll in. If you've previously registered or paid for a course (e.g. WAEC, JAMB), click <span className="font-bold text-amber-700">Renew</span> to extend or reactivate your subscription at once.
            </p>
          </div>

          {/* Quick Status Legend */}
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider shrink-0 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" /> Available to Add
            </span>
            <span className="flex items-center gap-1.5 text-green-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#76D287] inline-block" /> Selected
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Paid Before (Renew)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#09314F]/10 border-t-[#09314F] rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading available courses & payment history...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {courses.map((course) => {
              const courseTitleLower = course.title?.trim().toLowerCase();
              const courseIdNum = Number(course.id);

              // 1. Check in enrolled courses
              const enrolledRecord = enrolledCourses.find(
                e => Number(e.course_id) === courseIdNum || 
                     Number(e.course?.id) === courseIdNum ||
                     (e.course?.title && e.course.title.trim().toLowerCase() === courseTitleLower) ||
                     (e.course_name && e.course_name.trim().toLowerCase() === courseTitleLower)
              );

              // 2. Check in payment history (has paid for this course before)
              const paymentRecord = paymentsHistory.find(
                p => Number(p.course_id) === courseIdNum || 
                     Number(p.course?.id) === courseIdNum ||
                     (p.course?.title && p.course.title.trim().toLowerCase() === courseTitleLower) ||
                     (p.course_name && p.course_name.trim().toLowerCase() === courseTitleLower) ||
                     (p.course_title && p.course_title.trim().toLowerCase() === courseTitleLower)
              );

              const isPaidBeforeOrEnrolled = !!enrolledRecord || !!paymentRecord;
              const isSelected = selectedCourses.find(c => c.id === course.id);

              const status = (enrolledRecord?.status || paymentRecord?.status || 'active').toLowerCase();
              const isExpired = status === 'cancelled' || status === 'removed' || status === 'expired' || status === 'inactive' || status === 'unpaid';

              // Build unified renew target record
              const renewTarget = enrolledRecord || {
                ...paymentRecord,
                course_id: course.id,
                enrollment_id: paymentRecord?.course_enrollment_id || paymentRecord?.enrollment_id || paymentRecord?.id,
                course: course,
                course_name: course.title,
                title: course.title
              };

              // ── Previously Paid / Registered Course (Yellow / Amber State) ──
              if (isPaidBeforeOrEnrolled) {
                return (
                  <button
                    key={course.id}
                    onClick={() => {
                      if (onRenewCourse) {
                        onRenewCourse(renewTarget);
                      }
                    }}
                    title={`You have previously registered for ${course.title}. Click to renew.`}
                    className="relative min-h-[96px] py-4 px-3 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100/90 text-center flex flex-col items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <span className="text-sm font-black uppercase tracking-wider text-amber-950">
                      {course.title}
                    </span>
                    <span className="mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 transition-colors">
                      <ArrowPathIcon className="w-3 h-3 stroke-[2.5]" />
                      {isExpired ? "Expired • Renew" : "Registered • Renew"}
                    </span>
                  </button>
                );
              }

              // ── Never Registered Course (Normal / Selected State) ──
              return (
                <button
                  key={course.id}
                  onClick={() => toggleCourseSelection(course)}
                  className={`relative min-h-[96px] py-4 px-3 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col items-center justify-center group ${
                    isSelected 
                      ? "bg-[#76D287] border-green-500 shadow-lg scale-[1.02]" 
                      : "bg-[#D1D5DB] border-transparent hover:bg-gray-300 hover:scale-[1.01]"
                  }`}
                >
                  <span className="text-sm font-black uppercase tracking-wider text-[#0F2843]">
                    {course.title}
                  </span>
                  {isSelected && (
                    <span className="mt-2 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-[#0F2843] text-white">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedCourses.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setCurrentStep("subjects")}
              className="w-full py-5 px-10 rounded-xl font-black text-lg text-white bg-[#0F2843] shadow-xl hover:shadow-[#0F284344] transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Continue with ({selectedCourses.length}) Selected {selectedCourses.length === 1 ? 'Course' : 'Courses'}
            </button>
          </div>
        )}
      </div>

      {/* Shared Modals */}
      <SubjectSelectionModal
        isOpen={currentStep === "subjects"}
        onClose={() => setCurrentStep("selection")}
        selectedCourses={selectedCourses}
        department={student?.department || "science"}
        onContinue={(subs, allSubs) => {
          setSelectedSubjects(subs);
          setSubjectsByCourse(allSubs);
          setCurrentStep("review");
        }}
      />

      <ReviewSelectionModal
        isOpen={currentStep === "review"}
        onClose={() => setCurrentStep("selection")}
        selectedCourses={selectedCourses}
        selectedSubjects={selectedSubjects}
        subjectsByCourse={subjectsByCourse}
        onEdit={() => setCurrentStep("subjects")}
        onContinue={() => setCurrentStep("duration")}
      />

      <TrainingDurationModal
        isOpen={currentStep === "duration"}
        onClose={() => setCurrentStep("selection")}
        selectedCourses={selectedCourses}
        onContinue={(durs, total) => {
          setSelectedDurations(durs);
          setTotalAmount(total);
          setCurrentStep("payment");
        }}
      />

      <PaymentMethodModal
        isOpen={currentStep === "payment"}
        onClose={() => setCurrentStep("selection")}
        amount={totalAmount}
        email={student?.email}
        selectedMethod={selectedPaymentMethod}
        setSelectedMethod={setSelectedPaymentMethod}
        loading={processing}
        onContinue={handlePaymentSuccess}
      />
    </div>
  );
}
