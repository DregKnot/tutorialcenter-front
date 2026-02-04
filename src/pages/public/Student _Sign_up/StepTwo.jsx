import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/Student_sign_up.jpg";
import select_student from "../../../assets/images/add_student.png";
import Step_two_img from "../../../assets/images/step_2.jpg";

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.0032 12C11.1078 12 12.0032 11.1046 12.0032 10C12.0032 8.89543 11.1078 8 10.0032 8C8.89861 8 8.00318 8.89543 8.00318 10C8.00318 11.1046 8.89861 12 10.0032 12Z" fill="#121D24"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M0.460938 10C1.73519 5.94291 5.52549 3 10.0031 3C14.4808 3 18.2711 5.94288 19.5453 9.99996C18.2711 14.0571 14.4808 17 10.0031 17C5.5255 17 1.73521 14.0571 0.460938 10ZM14.0032 10C14.0032 12.2091 12.2123 14 10.0032 14C7.79404 14 6.00318 12.2091 6.00318 10C6.00318 7.79086 7.79404 6 10.0032 6C12.2123 6 14.0032 7.79086 14.0032 10Z" fill="#121D24"/>
  </svg>
);

const StepTwo = ({
  userRole,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  setStep,
}) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    // Check if email/phone is provided
    if (!email.trim()) {
      return "Email or Phone Number is required.";
    }

    // Validate email or phone format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+?234|0)(70|80|81|90|91)\d{8}$/;

    if (!emailRegex.test(email) && !phoneRegex.test(email)) {
      return "Please enter a valid email (user@gmail.com) or phone number (e.g., 08031234567).";
    }

    // Password Rules (min:8, confirmed, lowercase, uppercase, numeric, special)
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!/[a-z]/.test(password)) return "Password needs a lowercase letter.";
    if (!/[A-Z]/.test(password)) return "Password needs an uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password needs a number.";
    if (!/[@$!%*#?&]/.test(password))
      return "Password needs a special character (@$!%*#?&).";

    return null;
  };

  const handleStep2Submit = () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      
      // Map general errors to specific fields for highlighting if possible
      const newErrors = {};
      if (error.includes("Password")) {
        newErrors.password = true;
        if (error.includes("match")) newErrors.confirmPassword = true;
      }
      setErrors(newErrors);
      return;
    }
    
    setFormError("");
    setErrors({});
    console.log("Payload ready for API:", { userRole, email, password });

    // Check if input is a phone number (needs OTP) or email (skip OTP)
    // Nigerian phone formats:
    // Local: 08031234567 (11 digits, starts with 070, 080, 081, 090, 091)
    // International: +2348031234567 (14 chars)
    const cleanedInput = email.trim();
    const localPhoneRegex = /^0(70|80|81|90|91)\d{8}$/;  // 11 digits
    const intlPhoneRegex = /^\+234(70|80|81|90|91)\d{8}$/;  // 14 chars with +234

    const isPhoneNumber = localPhoneRegex.test(cleanedInput) || intlPhoneRegex.test(cleanedInput);

    if (isPhoneNumber) {
      // Phone number detected → Go to OTP verification (Step 3)
      console.log("Phone number detected, redirecting to OTP...");
      setStep(3);
    } else {
      // Email detected → Skip OTP, go directly to biodata (Step 4)
      console.log("Email detected, skipping OTP...");
      setStep(4);
    }
  };

  // Mobile accent image based on user role
  const mobileAccentImg = userRole === "student" ? signup_img : select_student;

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F9FAFB] font-sans overflow-x-hidden">
      
      {/* --- MOBILE ONLY: Role-based accent image --- */}
      <div
        className="md:hidden w-full h-[250px] bg-gray-200 relative bg-cover bg-center order-1"
        style={{ backgroundImage: `url(${mobileAccentImg})` }}
      >
      </div>

      {/* --- DESKTOP ONLY: Standard Step 2 image --- */}
      <div
        className="hidden md:block md:w-1/2 md:h-full bg-gray-200 relative bg-cover bg-center order-2"
        style={{ backgroundImage: `url(${Step_two_img})` }}
      >
        <div className="absolute bottom-[60px] left-0">
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
            style={{ borderRadius: "0px 20px 20px 0px" }}
          >
            Login
          </button>
        </div>
      </div>

      {/* --- FORM SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-start items-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] bg-[#F9FAFB] order-2 md:order-1 overflow-y-auto">
        
        <div className="w-full max-w-[448px]">
          {/* Header Area */}
          <div className="relative w-full flex items-center justify-center mb-8 md:mb-10 text-center">
            {/* Return Arrow */}
            <button
              onClick={() => setStep(1)}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
            </button>
            <img src={TC_logo} alt="Logo" className="h-12 md:h-14 w-auto" />
          </div>

          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">Sign Up</h2>
            <p className="text-gray-400 text-sm max-w-[280px] mx-auto">
              Create an account to get started with us.
            </p>
          </div>

          {/* MOBILE ONLY: Role Tabs */}
          <div className="flex mb-8 md:hidden">
            <div 
              className={`flex-1 text-center py-3 border-b-2 transition-all cursor-default
                ${userRole === "student" 
                  ? "border-[#09314F] text-[#09314F] font-bold" 
                  : "border-gray-200 text-gray-300 font-medium pointer-events-none"
                }`}
            >
              <span className="text-sm">Student</span>
            </div>
            <div 
              className={`flex-1 text-center py-3 border-b-2 transition-all cursor-default
                ${userRole === "guardian" 
                  ? "border-[#09314F] text-[#09314F] font-bold" 
                  : "border-gray-200 text-gray-300 font-medium pointer-events-none"
                }`}
            >
              <span className="text-sm">Guardian / Parents</span>
            </div>
          </div>


          {/* Input Card */}
          <div className="flex flex-col gap-4 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600 ml-1">Email / Phone Number</label>
              <div className="flex items-center bg-white rounded-xl px-4 h-[55px] border border-transparent focus-within:border-[#09314F] transition-all">
                <span className="mr-3 flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.003 5.884L10 9.882L17.997 5.884C17.9674 5.37444 17.7441 4.89549 17.3728 4.54523C17.0016 4.19497 16.5104 3.99991 16 4H4C3.48958 3.99991 2.99845 4.19497 2.62718 4.54523C2.25591 4.89549 2.0326 5.37444 2.003 5.884Z" fill="#121D24"/>
                    <path d="M18 8.118L10 12.118L2 8.118V14C2 14.5304 2.21071 15.0391 2.58579 15.4142C2.96086 15.7893 3.46957 16 4 16H16C16.5304 16 17.0391 15.7893 17.4142 15.4142C17.7893 15.0391 18 14.5304 18 14V8.118Z" fill="#121D24"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="you@example.com or +234xxxxxxxxxx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent w-full outline-none text-gray-700 font-medium placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:hidden">
              <label className="text-xs font-bold text-gray-600 ml-1">User Type</label>
              <div className="flex items-center bg-[#F0F0F0] rounded-xl px-4 h-[55px] border border-gray-200 cursor-not-allowed">
                {/* <span className="text-gray-400 mr-3"></span> */}
                <span className="text-gray-500 font-medium flex-1">
                  {userRole === "student" ? "Student" : "Guardian / Parent"}
                </span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600 ml-1">Password</label>
              <div className={`flex items-center bg-white rounded-xl px-4 h-[55px] border-2 transition-all
                ${errors.password ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-transparent focus-within:border-[#09314F]'}`}>
                <button onClick={() => setShowPassword(!showPassword)} className="mr-3 flex-shrink-0 hover:opacity-70 transition-all">
                  <EyeIcon />
                </button>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent w-full outline-none text-gray-700 font-medium placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600 ml-1">Confirm Password</label>
              <div className={`flex items-center bg-white rounded-xl px-4 h-[55px] border-2 transition-all
                ${errors.confirmPassword ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-transparent focus-within:border-[#09314F]'}`}>
                <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="mr-3 flex-shrink-0 hover:opacity-70 transition-all">
                  <EyeIcon />
                </button>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent w-full outline-none text-gray-700 font-medium placeholder-gray-400"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 mt-1 cursor-pointer group select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded-md bg-white transition-all flex items-center justify-center
                  ${rememberMe ? 'border-[#09314F]' : 'border-gray-300'}`}>
                  {rememberMe && (
                    <span className="text-[#09314F] text-sm font-bold animate-in fade-in duration-200">
                      ✓
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600 font-medium group-hover:text-[#09314F] transition-colors">
                Remember me
              </span>
            </label>

            {formError && (
              <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">{formError}</p>
            )}

            <button
              onClick={handleStep2Submit}
              className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 mt-4"
              style={{ background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)" }}
            >
              Sign Up
            </button>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1 h-[1px] bg-gray-200"></div>
              <span className="text-gray-400 text-sm">Or continue with</span>
              <div className="flex-1 h-[1px] bg-gray-200"></div>
            </div>

            <button className="w-full h-[52px] border border-[#E5E7EB] rounded-xl flex items-center justify-center gap-4 font-medium text-[#6B7280] bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98] mt-2 mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-[15px]">Sign up with google</span>
            </button>

            <p className="text-center text-sm text-gray-500 mt-4 pb-2">
              Already have an account?{" "}
              <Link to="/login" className="text-[#E33629] font-semibold hover:underline">LogIn</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
