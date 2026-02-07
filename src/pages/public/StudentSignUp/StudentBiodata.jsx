import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { location } from "../../../data/locations";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";

export default function StudentBiodata() {
  // console.table(location);
  const navigate = useNavigate(); // Initializing navigation
  const [toast, setToast] = useState(null); // Toast state for notifications
  const [errors, setErrors] = useState({}); // Initializing errors
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false); // loading for button press
  const [formData, setFormData] = useState({
    firstname: "",
    surname: "",
    email: null,
    tel: null,
    gender: "",
    date_of_birth: "",
    location: "",
    address: "",
    department: "",
  });

  // Base URL for API, using environment variable with fallback
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // capture each user entries
  const email = localStorage.getItem("studentEmail");
  const tel = localStorage.getItem("studentTel");

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

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "Last name is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Assigning email and tel
    if (email) {
      formData.email = email;
    } else if (tel) {
      formData.tel = tel;
    } else {
      setToast({
        type: "error",
        message: "No email or phone number found. Please start the registration process again.",
      }); 
      setMsg({
        text: "No email or phone number found. Please start the registration process again.",
        type: "error",
      });

      setTimeout(() => {
        navigate("/register");
      }, 5000);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/biodata`,
        formData,
      );

      if (response.status === 200 || response.status === 201) {
        setToast({ type: "success", message: response.data.message });

        setMsg({
          text: "Biodata submitted successfully",
          type: "success",
        });
        console.log(response?.data?.student);
        localStorage.setItem('studentdata', JSON.stringify(response?.data?.student));
        setTimeout(()=>{
          navigate('/register/student/training/selection');
        },2000)
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Submission failed.",
      });

      setMsg({
        text: error?.response?.data?.message || "Submission failed.",
        type: "error",
      });

      setErrors(error?.response?.data?.errors || {});
      console.log("Submission error:", error.response || error);
    } finally {
      setLoading(false);
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
              onClick={() => navigate("/register/student")}
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
                Student Biodata Registration
              </h1>
              <p className="text-gray-500 italic text-sm">
                Complete your biodata registration for <span className="text-[#09314F]"> {email || tel} </span>.
              </p>
              {msg.text && (
                <h3
                  className={`text-lg font-bold ${
                    msg.type === "success" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {msg.text}
                </h3>
              )}
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 flex flex-col items-center w-full">
              {/* Toast */}
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
                  {/* Firstname Input */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      First Name
                    </label>
                    <input
                      name="firstname"
                      type="text"
                      value={formData.firstname}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.firstname ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.firstname && (
                      <p className="text-sm text-red-500">{errors.firstname}</p>
                    )}
                  </div>

                  {/* Surname */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Last Name
                    </label>
                    <input
                      name="surname"
                      type="text"
                      value={formData.surname}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.surname ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.surname && (
                      <p className="text-sm text-red-500">{errors.surname}</p>
                    )}
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                    </select>
                    {errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>

                  {/* Date Of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.date_of_birth
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.date_of_birth && (
                      <p className="text-sm text-red-500">
                        {errors.date_of_birth}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Location
                    </label>
                    <input
                      name="location"
                      type="text"
                      list="nigeria-states" // This must match the id of the datalist
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Lagos, Nigeria"
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.location ? "border-red-500" : "border-gray-300"
                      }`}
                    />

                    {/* The Datalist Element */}
                    <datalist id="nigeria-states">
                      {location.map((loc) => (
                        <option
                          key={loc.code}
                          value={`${loc.state}, ${loc.country}`}
                        />
                      ))}
                    </datalist>
                    {errors.location && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Location
                    </label>
                    <input
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.location ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                  </div> */}

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.department ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Department</option>
                      <option value="art">Art</option>
                      <option value="science">Science</option>
                      <option value="commercial">Commercial</option>
                    </select>
                    {errors.department && (
                      <p className="text-sm text-red-500">
                        {errors.department}
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
                    Complete Biodata
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
