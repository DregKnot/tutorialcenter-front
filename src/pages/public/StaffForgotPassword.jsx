import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import login_img from "../../assets/images/login_img.webp";
import TC_logo from "../../assets/images/tutorial_logo.webp";
import {
  EyeIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function StaffForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Enter OTP & Reset
  const [contact, setContact] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 2 Form States
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const otpRefs = useRef([]);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Focus first OTP box on entering Step 2
  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  // Helper to determine if input is email or phone
  const isEmail = (val) => val.includes("@");

  /* ─────────────────────────────────────────────────────────────
     STEP 1: REQUEST OTP
  ───────────────────────────────────────────────────────────── */
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    const cleanContact = contact.trim();

    if (!cleanContact) {
      setErrors({ contact: "Please enter your email or phone number" });
      return;
    }

    setLoading(true);
    setErrors({});

    const payload = isEmail(cleanContact)
      ? { email: cleanContact }
      : { tel: cleanContact };

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/staffs/forgot-password`,
        payload
      );
      setToast({
        type: "success",
        message: res.data?.message || "Password reset OTP sent successfully!",
      });
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      console.error("Forgot password request error:", err.response?.data || err);
      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.tel?.[0] ||
        "Failed to send reset code. Please verify your contact info.";

      setToast({ type: "error", message: backendMsg });
      setErrors({ contact: backendMsg });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     OTP BOX CHANGE HANDLER (with Paste support)
  ───────────────────────────────────────────────────────────── */
  const handleOtpChange = (index, value) => {
    // Only accept numeric
    const cleanValue = value.replace(/[^0-9]/g, "");

    // Handle paste of complete 6-digit OTP
    if (cleanValue.length >= 6) {
      const splitDigits = cleanValue.slice(0, 6).split("");
      setOtpDigits(splitDigits);
      otpRefs.current[5]?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = cleanValue.slice(-1);
    setOtpDigits(newOtp);

    // Auto-advance
    if (cleanValue && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  /* ─────────────────────────────────────────────────────────────
     STEP 2: SUBMIT RESET PASSWORD
  ───────────────────────────────────────────────────────────── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    const newErrors = {};

    if (otp.length < 6) {
      newErrors.otp = "Please enter the complete 6-digit OTP code";
    }

    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const cleanContact = contact.trim();
    const payload = {
      ...(isEmail(cleanContact) ? { email: cleanContact } : { tel: cleanContact }),
      otp,
      password,
      confirmPassword,
    };

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/staffs/reset-password`,
        payload
      );

      setResetSuccess(true);
      setToast({
        type: "success",
        message: res.data?.message || "Password reset successful! Redirecting...",
      });

      setTimeout(() => {
        navigate("/staff/login");
      }, 2500);
    } catch (err) {
      console.error("Reset password error:", err.response?.data || err);
      const backendErrors = err.response?.data?.errors || {};
      const backendMsg =
        err.response?.data?.message ||
        backendErrors.password?.[0] ||
        backendErrors.otp?.[0] ||
        "Password reset failed. Please check the code and try again.";

      setToast({ type: "error", message: backendMsg });
      setErrors(backendErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 ${
            toast.type === "success" ? "bg-[#10B981]" : "bg-[#E83831]"
          } animate-in fade-in slide-in-from-top-4`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-full text-xs font-black">
              {toast.type === "success" ? "✓" : "✕"}
            </div>
            <p className="font-bold text-sm">{toast.message}</p>
          </div>
        </div>
      )}

      {/* LEFT SIDE: Visual Image */}
      <div
        className="w-full h-[220px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1"
        style={{ backgroundImage: `url(${login_img})` }}
      >
        <div className="hidden md:block absolute bottom-[70px] right-0 translate-x-9">
          <button
            onClick={() => navigate("/staff/login")}
            className="px-10 py-4 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-xl rounded-full active:scale-95"
          >
            Staff Login
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Form Area */}
      <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        {/* TOP NAV */}
        <div className="relative w-full flex items-center justify-center mb-6 md:mb-8">
          <button
            type="button"
            onClick={() => {
              if (step === 2 && !resetSuccess) {
                setStep(1);
              } else {
                navigate("/staff/login");
              }
            }}
            className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90 z-10"
          >
            <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
          </button>
          <img
            src={TC_logo}
            alt="Tutorial Center Logo"
            className="h-[75px] md:h-[95px] w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => navigate("/")}
          />
        </div>

        {/* CARD CONTAINER */}
        <div className="w-full max-w-md mx-auto">
          {resetSuccess ? (
            /* SUCCESS STATE */
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-[#09314F]">
                Password Reset Complete!
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Your staff account password has been successfully updated. You can now log in with your new credentials.
              </p>
              <button
                type="button"
                onClick={() => navigate("/staff/login")}
                className="w-full py-4 bg-gradient-to-r from-[#09314F] to-[#E83831] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg"
              >
                Proceed to Login
              </button>
            </div>
          ) : step === 1 ? (
            /* STEP 1: REQUEST OTP */
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#09314F]/5 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#09314F]">
                  <KeyIcon className="w-6 h-6 text-[#C5A97A]" />
                </div>
                <h2 className="text-2xl font-black text-[#09314F]">
                  Forgot Staff Password?
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Enter your registered Staff Email or Phone number to receive a verification OTP code.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Staff Email or Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        if (errors.contact) setErrors({});
                      }}
                      placeholder="e.g. staff@tutorialcenter.com or 08012345678"
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border bg-gray-50 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                        errors.contact ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                  </div>
                  {errors.contact && (
                    <p className="text-xs text-red-500 font-bold mt-1.5">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98] disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Sending OTP Code...</span>
                    </>
                  ) : (
                    <span>Send Reset OTP Code</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/staff/login")}
                    className="text-xs font-bold text-gray-500 hover:text-[#09314F] transition-colors"
                  >
                    Remember your password? <span className="text-[#09314F] underline">Login here</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: VERIFY OTP & ENTER NEW PASSWORD */
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <LockClosedIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-[#09314F]">
                  Reset Your Password
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  We sent a 6-digit OTP code to{" "}
                  <span className="font-bold text-[#09314F]">{contact}</span>.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* 6-DIGIT OTP BOXES */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 text-center">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-black text-xl bg-gray-50 rounded-xl border focus:outline-none focus:border-[#C5A97A] focus:ring-2 focus:ring-[#C5A97A]/30 transition-all ${
                          errors.otp ? "border-red-500 bg-red-50" : "border-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="text-xs text-red-500 font-bold text-center mt-1.5">
                      {errors.otp}
                    </p>
                  )}
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={`w-full px-4 py-3.5 pr-12 rounded-2xl border bg-gray-50 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                        errors.password ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className={`w-full px-4 py-3.5 pr-12 rounded-2xl border bg-gray-50 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98] disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <span>Set New Password</span>
                  )}
                </button>

                {/* RESEND OTP */}
                <div className="flex items-center justify-between text-xs font-bold pt-2 text-gray-500">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="hover:underline"
                  >
                    Change Email/Phone
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={resendCooldown > 0 || loading}
                    className={`text-[#09314F] ${
                      resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : "hover:underline"
                    }`}
                  >
                    {resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
