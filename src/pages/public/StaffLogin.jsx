import axios from "axios";
import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import login_img from "../../assets/images/login_img.jpg";
import TC_logo from "../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../assets/svg/return arrow.svg";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    login: "",      // ✅ Changed from 'entry' to 'login'
    password: "",
  });

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors on input change
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = "Email or Staff ID is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/staffs/login`,
        formData
      );

      if (response.status === 200) {
        // ✅ Store staff info, token, and role
        localStorage.setItem("staff_info", JSON.stringify(response.data.staff));
        localStorage.setItem("staff_token", response.data.token);
        localStorage.setItem("staff_role", response.data.role); // ✅ Store role
        
        // ✅ Show backend success message
        setToast({ 
          type: "success", 
          message: response.data.message || "Login successful!"
        });

        // Navigate to dashboard
        setTimeout(() => {
          navigate("/staff/dashboard");
        }, 2000);
      }

    } catch (error) {
      console.error("Login error:", error.response?.data);

      const status = error.response?.status;
      const message = error.response?.data?.message;
      const backendErrors = error.response?.data?.errors;

      // ✅ Handle rate limiting (429 - Too Many Requests)
      if (status === 429) {
        setToast({
          type: "error",
          message: message || "Too many login attempts. Please try again in 60 seconds."
        });
      }
      // ✅ Handle verification required (403 - Forbidden)
      else if (status === 403) {
        setToast({
          type: "error",
          message: message || "Your account requires verification. Please verify your email and phone."
        });
      }
      // ✅ Handle validation errors (422)
      else if (status === 422 && backendErrors) {
        const firstError = Object.values(backendErrors)[0][0];
        setToast({
          type: "error",
          message: message || firstError || "Invalid input."
        });
        setErrors(backendErrors);
      }
      // ✅ Handle unauthorized (401)
      else if (status === 401) {
        setToast({
          type: "error",
          message: message || "Invalid email/staff ID or password."
        });
      }
      // ✅ Handle network errors
      else if (!error.response) {
        setToast({
          type: "error",
          message: "Network error. Please check your connection."
        });
      }
      // ✅ Handle other errors
      else {
        setToast({
          type: "error",
          message: message || "Login failed. Please try again."
        });
      }

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
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          } animate-in fade-in slide-in-from-top-4`}
        >
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1 bg-white/20 rounded-full">
              {toast.type === "success" ? "✓" : "✕"}
            </div>
            <p className="font-bold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* LEFT SIDE: The Visual Image */}
      <div
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1"
        style={{ backgroundImage: `url(${login_img})` }}
      >
        {/* Sign Up Button (Desktop Only) */}
        <div className="hidden md:block absolute bottom-[70px] right-0 translate-x-9">
          <button
            onClick={() => navigate("/careers")}
            className="px-10 py-4 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-xl rounded-full active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Content Area */}
      <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        
        {/* TOP NAV */}
        <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
          <button
            onClick={() => navigate("/staff/login")}
            className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
          >
            <img
              src={ReturnArrow}
              alt="Back"
              className="h-6 w-6 lg:h-5 lg:w-5"
            />
          </button>
          <img
            src={TC_logo}
            alt="Logo"
            className="h-[60px] md:h-[80px] w-auto object-contain"
          />
        </div>

        {/* CENTER PIECE */}
        <div className="flex flex-col items-center w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#09314F] mb-2">
              Staff Login
            </h1>
            <p className="text-gray-500 text-sm">
              Login with Email Address or Staff ID
            </p>
          </div>

          <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-8 w-full max-w-md">
            <form
              autoComplete="off"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email/Staff ID Input */}
              <div>
                <label className="block text-sm font-bold text-[#09314F] mb-2 uppercase tracking-wide">
                  Email or Staff ID
                </label>
                <input
                  name="login"  
                  type="text"
                  value={formData.login}
                  onChange={handleChange}
                  placeholder="staff@email.com or STF00125"
                  className={`w-full px-4 py-3 border rounded-xl transition-all ${
                    errors.login 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-[#09314F]"
                  } focus:ring-2 focus:border-transparent`}
                />
                {errors.login && (
                  <p className="mt-2 text-sm text-red-500 font-semibold">
                    {errors.login}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-[#09314F] mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    placeholder="Enter your password"
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#09314F]"
                    } focus:ring-2 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-[#09314F] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500 font-semibold">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/staff/forgot-password")}
                  className="text-sm text-[#09314F] hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}