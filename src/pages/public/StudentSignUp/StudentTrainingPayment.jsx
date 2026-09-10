import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.webp";
import signup_img from "../../../assets/images/Student_sign_up.webp";
import { ChevronLeftIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Paystack from "../../../components/Paystack";
import { getStudentData } from "./studentStorageHelper";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

export const StudentTrainingPayment = () => {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    const stored = getStudentData();

    if (!stored?.data || !stored?.selectedDurations || Object.keys(stored.selectedDurations).length === 0) {
      navigate("/register/student/training/selection");
      return;
    }

    setStudentData(stored);
    setSelectedDurations(stored.selectedDurations);
  }, [navigate]);

  /* ================= TOTAL ================= */
  const totalAmount = useMemo(() => {
    return Object.values(selectedDurations)
      .filter(Boolean)
      .reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [selectedDurations]);

  /* ================= EMAIL ================= */
  const payerEmail = useMemo(() => {
    const email = studentData?.email || studentData?.data?.email;
    const tel = studentData?.tel || studentData?.data?.tel;

    if (email && email.includes("@")) return email;
    if (tel) return `${tel.replace(/\D/g, "")}@student.tutorialcenter.ng`;

    return "student@tutorialcenter.ng";
  }, [studentData]);

  /* ================= PAYSTACK METADATA ================= */
  const paystackMetadata = useMemo(() => {
    const studentId = studentData?.id || studentData?.data?.id;
    const selectedSubjects = studentData?.selectedSubjects || {};
    const referralCode = studentData?.referral_code;

    const courses = Object.entries(selectedDurations)
      .filter(([_, duration]) => Boolean(duration))
      .map(([courseId, duration]) => ({
        course_id: Number(courseId),
        billing_cycle: duration.duration,
        price: Number(duration.price || 0),
        subjects: selectedSubjects[courseId] || [],
      }));

    return {
      type: "student_enrollment",
      student_id: studentId,
      courses,
      referral_code: referralCode,
    };
  }, [studentData, selectedDurations]);

  /* ================= PAYSTACK SUCCESS ================= */
  const handlePaystackSuccess = async (response) => {
    setProcessing(true);

    try {
      const reference = response?.reference;
      if (!reference) {
        throw new Error("No payment reference returned from Paystack.");
      }

      await axios.post(`${API_BASE_URL}/api/payments/verify-paystack`, {
        reference: reference,
        fallback_metadata: paystackMetadata,
      });

      // Cleanup temporary transient registration markers
      localStorage.removeItem("studentEmail");
      localStorage.removeItem("studentTel");

      navigate("/register/student/training/payment/success");
    } catch (err) {
      console.error("[StudentTrainingPayment] Verification error:", err.response?.data || err);
      // Even if network blips on frontend, backend webhook handles it automatically
      navigate("/register/student/training/payment/success");
    } finally {
      setProcessing(false);
      setShowModal(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#F4F4F4] font-sans selection:bg-[#09314F] selection:text-white">
      {/* VISUAL IMAGE PANEL */}
      <div className="w-full lg:w-1/2 h-[200px] sm:h-[260px] lg:h-auto lg:min-h-screen relative order-1 lg:order-2 overflow-hidden shrink-0">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${signup_img})` }}
        >
          <div className="w-full h-full bg-gradient-to-t from-[#09314F]/80 via-transparent to-black/20 lg:bg-[#09314F]/25 backdrop-blur-[1px]" />
        </div>
      </div>

      {/* INTERACTIVE FORM AREA */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-8 md:py-12 order-2 lg:order-1 overflow-y-auto">
        <div className="w-full max-w-[min(100%,560px)] mx-auto my-auto flex flex-col">
          {/* LOGO */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src={TC_logo}
              alt="Tutorial Center"
              className="h-16 sm:h-20 w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={() => {
                if (window.confirm("Returning to the home page will clear your registration progress. Are you sure?")) {
                  navigate("/");
                }
              }}
            />
          </div>

          {/* HEADER BAR */}
          <div className="relative w-full flex items-center justify-center mb-6">
            <button
              type="button"
              onClick={() => navigate("/register/student/training/duration")}
              aria-label="Go back to Duration Selection"
              className="absolute left-0 p-2.5 sm:p-3 bg-white hover:bg-gray-50 text-[#09314F] rounded-2xl shadow-sm border border-gray-200/80 transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] tracking-tight text-center px-12">
              Payment Method
            </h1>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm mb-6 text-center max-w-[420px] mx-auto leading-relaxed">
            Review your registration summary and complete payment securely via Paystack.
          </p>

          {/* CARD CONTAINER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(9,49,79,0.06)] border border-gray-100 mb-8 flex flex-col">
            {/* GATEWAY OPTION */}
            <div className="mb-6">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                Payment Gateway
              </span>

              <div className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[#09314F] bg-blue-50/40 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#09314F] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#09314F] block">
                      Paystack Secure Gateway
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500">
                      Debit Cards, Bank Transfer, USSD & Apple Pay
                    </span>
                  </div>
                </div>
                <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 mb-8 border border-gray-100">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                Enrollment Breakdown
              </span>

              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {Object.entries(selectedDurations).map(([cId, dur]) => (
                  <div key={cId} className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-bold text-gray-700 capitalize">
                      Course #{cId} ({dur.duration})
                    </span>
                    <span className="font-mono font-black text-[#09314F]">
                      ₦{Number(dur.price || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/80 flex justify-between items-baseline">
                <span className="text-xs sm:text-sm font-black text-[#09314F] uppercase tracking-wider">
                  Total Payable
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#09314F] font-mono">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* PAY BUTTON */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              disabled={totalAmount <= 0}
              className="w-full py-4 sm:py-4.5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wide text-white transition-all shadow-lg active:scale-[0.98] bg-gradient-to-r from-[#09314F] via-[#0c4066] to-[#E83831] hover:shadow-[#09314F]/25 hover:brightness-105"
            >
              Pay ₦{totalAmount.toLocaleString()} via Paystack
            </button>
          </div>
        </div>
      </div>

      {/* PAYSTACK POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-2xl text-center">
            <h2 className="text-xl font-black text-[#09314F] mb-2">Complete Payment</h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-6">
              You will be redirected to Paystack to authorize your transaction.
            </p>

            <div className="text-3xl font-black text-[#09314F] font-mono mb-8 py-4 bg-gray-50 rounded-2xl border border-gray-100">
              ₦{totalAmount.toLocaleString()}
            </div>

            <Paystack
              amount={totalAmount}
              email={payerEmail}
              reference={`TC-${Date.now()}-${studentData?.id || "std"}`}
              metadata={paystackMetadata}
              onSuccess={handlePaystackSuccess}
              onClose={() => setShowModal(false)}
            />

            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={processing}
              className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      )}

      {/* VERIFYING OVERLAY */}
      {processing && (
        <div className="fixed inset-0 bg-[#09314F]/85 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-[400px] text-center">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-[#E83831] rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-black text-[#09314F] mb-2">Authenticating Payment</h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              We are finalizing your course subscriptions with the learning portal. Please do not refresh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTrainingPayment;
