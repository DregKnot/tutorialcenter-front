import React, { useState, useEffect, useRef } from "react";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import otp_img_student from "../../../assets/images/otpStudentpic.jpg";
import otp_img_parent from "../../../assets/images/otpparent.jpg";

const StepThree = ({ email, userRole, setStep }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(50);
  const [formError, setFormError] = useState("");
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Timer for OTP resend
  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 3) inputRefs[index + 1].current.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleStep3Submit = () => {
    // 1. Combine the array into a single string "1234"
    const otpCode = otp.join("");

    // 2. Validate length
    if (otpCode.length < 4) {
      setFormError("Please enter the complete 4-digit code.");
      // Auto-clear error after 3 seconds
      setTimeout(() => setFormError(""), 3000);
      return;
    }

    // 3. (Optional) Simulate API Call here
    console.log(`Verifying OTP for ${userRole}:`, otpCode);

    // 4. Move to next step
    setStep(4);
  };

  const accentImg = userRole === "student" ? otp_img_student : otp_img_parent;

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-white font-sans overflow-x-hidden">
      
      {/* --- IMAGE SECTION (Top on mobile, Right on Desktop) --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <img 
          src={accentImg} 
          alt="OTP Verification" 
          className="w-full h-full object-cover" 
        />
        <button
          onClick={() => setStep(2)}
          className="absolute left-6 top-6 md:left-10 md:top-8 bg-white/80 backdrop-blur-sm md:bg-transparent w-10 h-10 md:w-auto md:h-auto rounded-full flex items-center justify-center hover:text-gray-500 transition-all shadow-md md:shadow-none z-20"
        >
          <img src={ReturnArrow} alt="Back" className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" />
        </button>
      </div>

      {/* --- FORM SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center bg-[#F9FAFB] order-2 md:order-1 px-6 py-10 lg:px-[100px] lg:py-[60px] overflow-y-auto">
        <div className="w-full max-w-[448px] mx-auto text-center mt-4 md:mt-10">
          <div className="relative w-full flex items-center justify-center mb-6">
            {/* Back Button */}
            <button
              onClick={() => setStep(2)}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-[#09314F] uppercase tracking-tight">
              OTP VERIFICATION
            </h1>
          </div>
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-6 text-sm md:text-base">
              We have sent an OTP to your email: <br /><span className="font-bold text-[#09314F]">{email}</span>
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-xs font-semibold">{formError}</p>
              </div>
            )}
            
            <div className="flex justify-between gap-2 md:gap-4 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className={`w-full max-w-[60px] md:max-w-[70px] h-[70px] md:h-[80px] bg-white border-2 rounded-xl text-center text-2xl md:text-3xl font-bold outline-none transition-all ${
                    formError
                      ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      : 'border-transparent focus:border-[#09314F]'
                  }`}
                />
              ))}
            </div>

            <p className="text-gray-600 text-xs md:text-sm mb-6">
              If you didn't get verification code yet. <br className="md:hidden" /> Resend code in{" "}
              <span className="font-bold text-[#F8BD00]">{otpTimer}</span>{" "}
              seconds
            </p>

            <button
              onClick={handleStep3Submit}
              className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
              style={{
                background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)",
              }}
            >
              Verify Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
