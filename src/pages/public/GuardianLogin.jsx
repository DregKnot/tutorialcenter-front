import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import login_img from "../../assets/images/login_img.webp";
import TC_logo from "../../assets/images/tutorial_logo.webp";
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function GuardianLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    entry: "",
    password: "",
  });
  const [msg, setMsg] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
      
      const payload = {
        entry: formData.entry,
        email: formData.entry,
        tel: formData.entry,
        phone: formData.entry,
        username: formData.entry,
        password: formData.password
      };

      console.log("🛡️ [GuardianLogin] Submitting login request to /api/guardians/login:", payload);
      const response = await axios.post(`${API_BASE_URL}/api/guardians/login`, payload, {
        headers: { Accept: "application/json" }
      });
      
      if (response.status === 200 || response.data?.token) {
        setMsg({ text: "Login successful!", type: "success" });
        const token = response.data.token || response.data.access_token;
        const guardianData = response.data.guardian || response.data.data || response.data.user;
        
        localStorage.setItem("guardian_token", token);
        if (guardianData) {
          localStorage.setItem("guardian_info", JSON.stringify(guardianData));
        }
        
        setTimeout(() => {
          navigate("/guardian/dashboard");
        }, 1200);
      }
    } catch (err) {
      console.error("❌ [GuardianLogin] Login error:", err.response?.data || err);
      const rawError =
        err.response?.data?.errors ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid Guardian Login Credentials";

      const formattedError = typeof rawError === "object"
        ? (Object.values(rawError).flat().join(" ") || JSON.stringify(rawError))
        : rawError;

      setMsg({ text: formattedError, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* LEFT SIDE: The Visual Image */}
      <div
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1"
        style={{ backgroundImage: `url(${login_img})` }}
      >
        <div className="hidden md:block absolute bottom-[70px] right-0 translate-x-9">
          <button
            onClick={() => navigate("/register/guardian")}
            className="px-10 py-4 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-xl rounded-full"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Content Area */}
      <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
          <button
            onClick={() => navigate("/")}
            className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90 z-10"
          >
            <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
          </button>
          <img
            src={TC_logo}
            alt="Logo"
            className="h-[80px] md:h-[110px] w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => navigate("/")}
          />
        </div>

        <div className="flex flex-col items-center w-full">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-[#09314F]">
              Guardian Login
            </h1>
            <p className="text-gray-500 italic text-sm">
              Login With E-Mail Address Or Phone Number
            </p>
            {msg.text && (
              <h3
                className={`mt-2 text-sm font-bold ${
                  msg.type === "success" ? "text-green-500" : "text-red-500"
                }`}
              >
                {msg.text}
              </h3>
            )}
          </div>

          <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 flex flex-col items-center w-full">
            <div className="md:block w-full mt-auto">
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Email Address Or Phone Number
                  </label>
                  <input
                    name="entry"
                    type="text"
                    value={formData.entry}
                    onChange={handleChange}
                    placeholder="E-mail Address or Phone Number"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#09314F] focus:border-[#09314F] transition-all bg-gray-50 text-gray-800 border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Password
                  </label>
                  <div className="relative w-full">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#09314F] focus:border-[#09314F] transition-all bg-gray-50 text-gray-800 border-gray-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeIcon className="h-5 w-5" />
                      ) : (
                        <EyeSlashIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end text-sm w-full mt-2">
                  <span
                    className="text-[#BB9E7F] hover:text-[#a08466] font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#09314F] text-white py-3 rounded-full hover:bg-blue-900 transition-colors font-bold shadow-md shadow-blue-900/20 disabled:opacity-70 flex justify-center items-center h-12"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>
            
            <div className="mt-8 text-center text-sm md:hidden">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                onClick={() => navigate("/register/guardian")}
                className="text-[#BB9E7F] font-bold hover:underline"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
