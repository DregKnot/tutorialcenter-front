import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import signup_img from "../../../assets/images/Student_sign_up.webp";
import { getStudentData, clearStudentRegistrationData } from "./studentStorageHelper";

export const StudentPaymentSuccessScreen = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaymentData = () => {
      try {
        const studentData = getStudentData();
        if (!studentData) {
          navigate("/student/login");
          return;
        }

        const enrichedCourses = (studentData.selectedTraining || []).map((id) => {
          const courseDetail = studentData.availableTrainings?.find((c) => c.id === id);
          const durationData = studentData.selectedDurations?.[id];

          return {
            id,
            name: courseDetail?.title || `Course #${id}`,
            duration: durationData?.duration ? `${durationData.duration} plan` : "Active Subscription",
          };
        });

        const fullName =
          [studentData.firstname, studentData.surname].filter(Boolean).join(" ") ||
          "Student";

        setPaymentData({
          studentName: fullName,
          courses: enrichedCourses,
        });
      } catch (error) {
        console.error("[PaymentSuccess] Error parsing data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, [navigate]);

  const handleGoToDashboard = () => {
    clearStudentRegistrationData();
    navigate("/student/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F4]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#09314F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row font-sans overflow-x-hidden bg-[#F4F4F4]">
      {/* LEFT CONTENT AREA */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 py-10 order-2 lg:order-1">
        <div className="bg-white w-full max-w-[min(100%,480px)] shadow-[0_20px_50px_rgba(9,49,79,0.08)] rounded-3xl p-6 sm:p-10 flex flex-col items-center border border-gray-100 text-center animate-fadeIn">
          {/* SUCCESS ICON */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
            <CheckCircleIcon className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] mb-1.5 tracking-tight">
            Registration & Payment Successful!
          </h1>

          <p className="text-gray-500 text-xs sm:text-sm mb-6">
            Welcome aboard, <span className="font-bold text-[#09314F]">{paymentData?.studentName}</span>
          </p>

          {/* SUBSCRIPTION CARDS */}
          <div className="w-full mb-8 text-left">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center mb-3">
              Enrolled Training Programs
            </span>

            <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
              {paymentData?.courses && paymentData.courses.length > 0 ? (
                paymentData.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex justify-between items-center py-3 px-4 bg-gray-50/80 rounded-2xl border border-gray-100 text-xs sm:text-sm"
                  >
                    <span className="font-bold text-[#09314F] truncate mr-2">
                      {course.name}
                    </span>
                    <span className="text-[11px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                      {course.duration}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs font-semibold text-gray-400">
                  Standard Access Granted
                </div>
              )}
            </div>
          </div>

          {/* DASHBOARD BUTTON */}
          <button
            type="button"
            onClick={handleGoToDashboard}
            className="w-full py-4 px-6 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-[#09314F]/20 transition-all hover:brightness-105 active:scale-95 bg-gradient-to-r from-[#09314F] via-[#0c4066] to-[#E83831]"
          >
            Login to Student Dashboard
          </button>
        </div>
      </div>

      {/* RIGHT VISUAL HERO */}
      <div className="w-full lg:w-1/2 h-[200px] sm:h-[260px] lg:h-auto lg:min-h-screen relative order-1 lg:order-2 overflow-hidden shrink-0">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${signup_img})` }}
        >
          <div className="w-full h-full bg-gradient-to-t from-[#09314F]/80 via-transparent to-black/20 lg:bg-[#09314F]/25 backdrop-blur-[1px]" />
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentSuccessScreen;
