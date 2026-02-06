import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function StudentRegistration() {
  const navigate = useNavigate(); // Initializing navigation
  const [msg, setMsg] = useState("");
  const [tel, setTel] = useState(null);
  const [toast, setToast] = useState(null);
  const [email, setEmail] = useState(null);
  const [errors, setErrors] = useState(""); // Initializing errors
  const [loading, setLoading] = useState(false); // loading for button press
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    entry: "",
    password: "",
    confirmPassword: "",
  });
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Capture each user entries
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate form data before submission
  const validateForm = () => {
    const newErrors = {};

    if (!formData.entry.trim()) {
      newErrors.entry = "Entry is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    console.log(formData);
    // Regex for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Determine if the entry is an email or a phone number
    if (formData.entry.match(emailRegex)) {
      setEmail(formData.entry);
      setTel(null); // Clear tel if email is valid
    } else {
      setTel(formData.entry);
      setEmail(null); // Clear email if tel is valid
    }
    console.log(email, tel);

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/register`,
        {
          tel: tel,
          email: email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
      );
      console.log(response.response);
      if (response.status === 201) {
        setToast({ type: "success", message: response.data.message });
        if (email === null) {
          setMsg(
            "<span className='text-green-500'>Registration successful! Please check your phone for the OTP.</span>",
          );
          localStorage.setItem('tel', tel);
          setInterval(() => {
            navigate(`/register/student/phone/verify?tel=${tel}`);
          }, 5000);
        } else if (tel === null) {
          localStorage.setItem('email', email);
          setMsg(
            "<span className='text-green-500'>Registration successful! Please check your email for the OTP.</span>",
          );
        }
      }
    } catch (error) {
        setToast({ type: "error", message: error?.response?.data?.message || "Registration failed." });
      setErrors(error?.response?.data?.errors);
      setMsg(
        `<span className='text-red-500'> ${error?.response?.data?.message || "An error occurred during registration."}</span>`,
      );
      console.log(error?.response?.data?.errors);
    } finally {
      setLoading(false);
      console.log(msg);
    }
  };
  return (
    <>
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
        {/* LEFT SIDE: Content Area */}
        <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          {/* 1. TOP NAV */}
          <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
            <button
              onClick={() => navigate("/register")}
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

          {/* 2. CENTER PIECE */}
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-[#09314F]">
                Student Registration
              </h1>
              <p className="text-gray-500 italic text-sm">
                Register With E-Mail Address Or Phone Number
              </p>
              <h3
                className="text-lg font-bold"
                dangerouslySetInnerHTML={{ __html: msg }}
              ></h3>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 flex flex-col items-center w-full">
              <p>
                {toast && (
                  <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white transition-all duration-300 ${
                      toast.type === "success" ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {toast.message}
                  </div>
                )}
              </p>
              <div className="md:block w-full mt-auto">
                <form
                  autoComplete="off"
                  action=""
                  method="post"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Email Input or phone number */}
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
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.entry ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                    />
                    {errors.entry && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.entry}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-900"
                        }`}
                      />
                      <span
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-5" />
                        ) : (
                          <EyeIcon className="h-4 w-5" />
                        )}
                      </span>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        onChange={handleChange}
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          errors.confirmPassword
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-900"
                        }`}
                      />
                      <span
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-4 w-5" />
                        ) : (
                          <EyeIcon className="h-4 w-5" />
                        )}
                      </span>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:bg-green-800"
                    } text-white transition-colors`}
                  >
                    Register
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Visual Image */}
        <div
          className="w-full h-[192px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
          style={{ backgroundImage: `url(${signup_img})` }}
        >
          {/* Login Button */}
          <div className="hidden md:block absolute bottom-[60px] left-0">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
              style={{ borderRadius: "0px 20px 20px 0px" }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
