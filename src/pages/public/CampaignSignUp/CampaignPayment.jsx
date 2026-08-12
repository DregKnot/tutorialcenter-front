import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.webp";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Paystack from "../../../components/Paystack";

export default function CampaignPayment() {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [course, setCourse] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("monthly");
  const [gateway, setGateway] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // 'idle', 'processing', 'success'

  // Base URL for API, using environment variable with fallback
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const AFFILIATE_API_URL = process.env.REACT_APP_AFFILIATE_URL || "http://tutorialcenter-affiliate.test" || "http://localhost:8000";

  /* ================= CONSTANTS ================= */
  const DURATION_OPTIONS = [
    { key: "monthly", label: "Monthly", months: 1 },
    { key: "quarterly", label: "Quarterly", months: 3 },
    { key: "semi_annual", label: "Semi-Annual", months: 6 },
    { key: "annual", label: "Annual", months: 12 },
  ];

  /* ================= INIT ================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("studentdata") || "{}");
    const selectedTraining = stored?.selectedTraining;
    
    if (!stored?.data || !selectedTraining?.length) {
      navigate("/");
      return;
    }

    setStudentData(stored);

    // Get the GCE course that was stored
    const courseId = selectedTraining[0]; // GCE course ID
    const availableTrainings = stored.availableTrainings || [];
    const gceCourse = availableTrainings.find(c => c.id === courseId);
    
    if (gceCourse) {
      setCourse(gceCourse);
    } else {
      // Fallback fetch if not found in local storage
      axios.get(`${API_BASE_URL}/api/courses`).then(res => {
        const courses = res.data?.data || res.data?.courses || [];
        setCourse(courses.find(c => c.id === courseId));
      });
    }
  }, [navigate, API_BASE_URL]);

  /* ================= HELPERS ================= */
  const calculatePrice = (basePrice, months) => {
    const total = basePrice * months;
    return months === 1 ? total : total - total * 0.05;
  };

  /* ================= TOTAL ================= */
  const currentOption = DURATION_OPTIONS.find(d => d.key === selectedDuration);
  const totalAmount = course ? calculatePrice(course.price, currentOption.months) : 0;

  /* ================= EMAIL ================= */
  const payerEmail = useMemo(() => {
    const email = studentData?.data?.email;
    const tel = studentData?.data?.tel;
    
    if (email) return email;
    if (tel) return `${tel}@tutorialcenter.gmail.com`;
    return "codewithpidgin@gmail.com";
  }, [studentData]);

  /* ================= MODAL ================= */
  const openGateway = (selected) => {
    setGateway(selected);
    setShowModal(true);
  };

  const closeModal = () => {
    if (paymentStatus !== "processing") {
      setShowModal(false);
      setGateway(null);
    }
  };

  /* ================= PAYSTACK SUCCESS ================= */
  const handlePaystackSuccess = async (response) => {
    const studentEmail = studentData?.data?.email;
    const studentTel = studentData?.data?.tel; 

    setPaymentStatus("processing");

    try {
      const studentId = studentData.data.id;
      const selectedSubjects = studentData.selectedSubjects;
      const courseId = course.id;

      // 1️⃣ COURSE ENROLLMENT
      let courseEnrollmentId;
      try {
        const courseRes = await axios.post(
          `${API_BASE_URL}/api/course/enrollment`,
          {
            student_id: studentId,
            course_id: Number(courseId),
            billing_cycle: currentOption.key,
          },
        );
        courseEnrollmentId = courseRes.data.enrollment.id;
      } catch (err) {
        console.error("Course enrollment failed:", err);
        alert("Enrollment failed. Please contact support.");
        setPaymentStatus("idle");
        closeModal();
        return;
      }

      const paymentReference = `TC-${Date.now()}-${courseId}-${Math.floor(Math.random() * 1000)}`;
      
      // 2️⃣ SUBJECT ENROLLMENT (sequentially)
      const subjects = selectedSubjects?.[courseId] || [];
      for (const subjectId of subjects) {
        try {
          await axios.post(`${API_BASE_URL}/api/subject/enrollment`, {
            student_id: studentId,
            course_enrollment_id: courseEnrollmentId,
            subject_id: subjectId,
          });
        } catch (err) {
          console.error(`Subject enrollment failed for subject ${subjectId}:`, err);
        }
      }

      // 3️⃣ PAYMENT RECORD
      try {
        await axios.post(`${API_BASE_URL}/api/payments`, {
          student_id: studentId,
          course_enrollment_id: courseEnrollmentId,
          amount: totalAmount,
          billing_cycle: currentOption.key,
          payment_method: "card",
          gateway: "paystack",
          status: "successful",
          gateway_reference: paymentReference,
          paid_at: new Date().toISOString(),
          email: studentEmail || studentTel,
          meta: {
            channel: response.channel,
            paid_at: response.paid_at,
          },
        });
      } catch (err) {
        console.error("Payment recording failed:", err);
      }

      // 4️⃣ REFERRAL SUBMISSION (only if referral code was provided)
      const referralCode = studentData?.referral_code;
      if (referralCode) {
        try {
          const firstName = studentData?.data?.firstname || "";
          const lastName = studentData?.data?.surname || "";
          const name = `${firstName} ${lastName}`.trim();
          const contact = (studentEmail && studentTel) ? studentTel : (studentEmail || studentTel);

          await axios.post(`${AFFILIATE_API_URL}/api/referrals/register`, {
            name,
            contact,
            referral_code: referralCode,
          });
        } catch (err) {}
      }

      // Cleanup (we don't navigate away, we show success screen)
      // localStorage.removeItem("studentdata");
      setPaymentStatus("success");
    } catch (err) {
      console.error("Unexpected error during enrollment/payment:", err);
      alert("An unexpected error occurred. Please contact support.");
      setPaymentStatus("idle");
    } finally {
      closeModal();
    }
  };

  if (paymentStatus === "processing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-6 text-center">
        <div className="w-16 h-16 border-4 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-black text-[#09314F] mb-2">Authenticating Payment...</h2>
        <p className="text-gray-500 font-medium max-w-md">Please wait while we register your courses and set up your account. Do not close this window.</p>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-6 text-center">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-[#09314F] mb-2">Registration Successful!</h2>
          <p className="text-gray-500 font-medium mb-8">
            Congratulations, <span className="text-[#09314F] font-bold">{studentData?.data?.firstname} {studentData?.data?.surname}</span>! 
            Your payment of <strong className="text-gray-900">₦{totalAmount.toLocaleString()}</strong> has been received and your GCE campaign courses have been fully registered.
          </p>
          <div className="w-full bg-blue-50/50 rounded-xl p-6 mb-8 border border-blue-100">
            <h3 className="font-bold text-[#09314F] mb-4 text-left">Your Account Information:</h3>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500">Email/Phone:</span>
              <span className="font-bold text-gray-900">{payerEmail}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status:</span>
              <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs">Active & Live</span>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("studentdata");
              navigate("/student/login");
            }}
            className="w-full py-4 text-white font-black text-lg rounded-2xl shadow-xl hover:brightness-110 transition-all active:scale-95"
            style={{ background: "linear-gradient(90deg, #09314F 0%, #1A5480 100%)" }}
          >
            Go to Student Login
          </button>
          <p className="mt-4 text-sm text-gray-400 font-medium">You can now login and start practicing immediately!</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#F8F9FA] font-sans">
      <div className="w-full flex flex-col items-center py-8 px-6 lg:px-8 xl:px-[100px] overflow-y-auto pb-32">
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <img 
            src={TC_logo} 
            alt="Logo" 
            className="h-20 w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95" 
            onClick={() => {
              if (window.confirm("Returning to the home page will clear your progress. Are you sure?")) {
                navigate("/");
              }
            }}
          />
        </div>

        {/* NAV & HEADER */}
        <div className="w-full max-w-[500px] mb-10 text-center">
          <div className="flex items-center relative h-12 mb-6 pointer-events-none z-50">
            <button
              onClick={() => navigate("/campaign/gce/email-verify")}
              className="fixed top-6 left-6 md:absolute md:left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-md md:shadow-sm transition-all active:scale-90 border border-gray-100 md:border-none pointer-events-auto"
            >
              <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
            </button>
            <div className="w-full flex justify-center pointer-events-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">
                Complete Payment
              </h1>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[500px] bg-white rounded-[8px] shadow-sm border border-gray-100 p-8 flex flex-col">
          {/* DURATION SELECTION */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Select Duration</h2>
            <div className="grid grid-cols-2 gap-4">
              {DURATION_OPTIONS.map(opt => {
                const price = calculatePrice(course.price, opt.months);
                const isSelected = selectedDuration === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedDuration(opt.key)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-[#09314F] bg-[#09314F]/5 text-[#09314F]' 
                        : 'border-gray-100 hover:border-gray-300 text-gray-500'
                    }`}
                  >
                    <span className="font-bold text-lg mb-1">{opt.label}</span>
                    <span className="text-sm">₦{price.toLocaleString()}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="h-px w-full bg-gray-100 my-4" />

          {/* TOTAL & PAY */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-gray-500 font-bold">Total Amount:</span>
            <span className="text-3xl font-black text-[#09314F]">₦{totalAmount.toLocaleString()}</span>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => openGateway("paystack")}
              disabled={paymentStatus === "processing"}
              className={`w-full py-4 text-white font-black text-lg rounded-2xl shadow-xl hover:brightness-110 transition-all active:scale-95 ${paymentStatus === "processing" ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: "linear-gradient(90deg, #09314F 0%, #1A5480 100%)" }}
            >
              {paymentStatus === "processing" ? 'Processing...' : 'Pay with Paystack'}
            </button>
            <p className="text-center text-xs text-gray-400 font-medium mt-2">Secure payment via Paystack.</p>
          </div>
        </div>

      </div>

      {/* PAYSTACK MODAL */}
      {showModal && gateway === "paystack" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Proceed to Payment</h2>
              <p className="text-gray-500 font-medium mb-8">You will be redirected to Paystack securely complete your payment of <strong className="text-gray-900">₦{totalAmount.toLocaleString()}</strong>.</p>
              
              <div className="flex flex-col gap-3">
                <div className="w-full">
                  <Paystack
                    email={payerEmail}
                    amount={totalAmount}
                    onSuccess={handlePaystackSuccess}
                    onClose={closeModal}
                  />
                </div>
                <button
                  onClick={closeModal}
                  disabled={paymentStatus === "processing"}
                  className="w-full py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
