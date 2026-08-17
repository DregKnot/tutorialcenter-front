import React, { useState, useEffect, useRef } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  // DocumentTextIcon,
  CameraIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

export default function StaffRegistration() {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  /* =============================
     CONSTANTS
  ============================= */
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  /* =============================
     STATE
  ============================= */
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    surname: "",
    email: "",
    tel: "",
    gender: "",
    date_of_birth: "",
    role: "",
    status: "active",
    location: "",
    address: "",
    description: "",
    profile_picture: null
  });

  /* =============================
     EFFECTS
  ============================= */
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2048 * 1024) {
        setErrors(prev => ({ ...prev, profile_picture: "Image must be less than 2MB" }));
        return;
      }
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setImagePreview(URL.createObjectURL(file));
      if (errors.profile_picture) {
        setErrors(prev => ({ ...prev, profile_picture: null }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^(\+234|234|0)(70|80|81|90|91)\d{8}$/;

    if (!formData.firstname.trim()) newErrors.firstname = "First name is required";
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    
    if (!formData.tel.trim()) {
      newErrors.tel = "Phone number is required";
    } else if (!phoneRegex.test(formData.tel.trim())) {
      newErrors.tel = "Invalid Nigerian phone number format";
    }

    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.profile_picture) newErrors.profile_picture = "Profile picture is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const data = new FormData();

    // Dynamically append all form fields
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      // Only append if value is not null and not an empty string (for optional fields)
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    // Logging for debugging backend payload
    console.log("Submitting Registration Payload:", Object.fromEntries(data.entries()));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/staffs/register`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        setToast({
          type: "success",
          message: response.data.message || "Staff registered successfully!"
        });
        // Reset form or navigate
        setTimeout(() => navigate("/staffs/manage-staffs"), 2000);
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      const backendErrors = error.response?.data?.errors;
      let toastMsg = error.response?.data?.message || "Registration failed. Please try again.";

      if (backendErrors) {
        const formatted = {};
        Object.keys(backendErrors).forEach(key => {
          formatted[key] = backendErrors[key][0];
        });
        setErrors(formatted);
        if (Object.keys(backendErrors).length > 0) {
          toastMsg = backendErrors[Object.keys(backendErrors)[0]][0];
        }
      }
      setToast({
        type: "error",
        message: toastMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaffDashboardLayout 
      pagetitle="Staff Registration"
      backPath="/staffs/manage-staffs"
      backLabel="Staff Information"
    >
      <div className="w-full relative">

        {/* Two-column layout: Left = Photo + Quick Info, Right = Form Details */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT COLUMN: Profile Photo & Quick Summary */}
          <div className="xl:col-span-1 space-y-6">
            {/* Profile Photo Upload Card */}
            <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <CameraIcon className="w-4 h-4 text-[#C5A97A]" />
                  Profile Photo
                </h3>
              </div>
              <div className="p-6">
                <div 
                  className={`relative w-full aspect-square rounded-2xl border-2 border-dashed overflow-hidden cursor-pointer transition-all group hover:border-[#C5A97A] ${
                    errors.profile_picture ? "border-red-500 bg-red-50/50" : "border-gray-200 dark:border-gray-700"
                  }`}
                  style={{
                    backgroundImage: !imagePreview ? `linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f9fa 75%), linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)` : 'none',
                    backgroundSize: `16px 16px`,
                    backgroundPosition: `0 0, 0 8px, 8px -8px, -8px 0px`
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                      <div className="w-14 h-14 bg-gray-100 dark:bg-[#06243A] rounded-2xl flex items-center justify-center">
                        <CameraIcon className="w-7 h-7 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Click to upload</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG up to 2MB</p>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {errors.profile_picture && (
                  <p className="text-[10px] text-red-500 font-bold mt-2 text-center">{errors.profile_picture}</p>
                )}
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm p-6">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 text-[#C5A97A]" />
                Account Status
              </h3>
              <div className="relative">
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 pl-4 pr-10 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Form Sections */}
          <div className="xl:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Section 1: Personal Information */}
              <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[#C5A97A]" />
                    Personal Information
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">First Name</label>
                    <input 
                      type="text" 
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="Enter first name" 
                      className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                        errors.firstname ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      }`} 
                    />
                    {errors.firstname && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.firstname}</p>}
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                      Middle Name <span className="font-normal text-gray-300">(optional)</span>
                    </label>
                    <input 
                      type="text" 
                      name="middlename"
                      value={formData.middlename}
                      onChange={handleChange}
                      placeholder="Enter middle name" 
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all" 
                    />
                  </div>

                  {/* Surname */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Surname</label>
                    <input 
                      type="text" 
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      placeholder="Enter surname" 
                      className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                        errors.surname ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      }`} 
                    />
                    {errors.surname && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.surname}</p>}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Gender</label>
                    <div className="relative">
                      <select 
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-10 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all ${
                          errors.gender ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Others</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.gender && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.gender}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Date of Birth</label>
                    <div className="relative">
                      <CalendarIcon 
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A97A] cursor-pointer z-10" 
                        onClick={() => {
                          if (dateInputRef.current?.showPicker) {
                            dateInputRef.current.showPicker();
                          } else {
                            dateInputRef.current?.focus();
                          }
                        }}
                      />
                      <input 
                        type="date" 
                        ref={dateInputRef}
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        onClick={() => {
                          if (dateInputRef.current?.showPicker) {
                            dateInputRef.current.showPicker();
                          } else {
                            dateInputRef.current?.focus();
                          }
                        }}
                        className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 pl-11 pr-4 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden ${
                          errors.date_of_birth ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                        }`}
                      />
                    </div>
                    {errors.date_of_birth && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.date_of_birth}</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Role</label>
                    <div className="relative">
                      <select 
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 pr-10 text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 appearance-none transition-all ${
                          errors.role ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <option value="">Select role</option>
                        <option value="admin">Admin</option>
                        <option value="coo">COO (Chief Operating Officer)</option>
                        <option value="tutor">Tutor</option>
                        <option value="advisor">Advisor</option>
                        <option value="moderator">Moderator</option>
                        {/* <option value ="accountant">Accountant</option> */}
                        {/* <option value ="superadmin">Super Admin</option> */}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.role && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.role}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Details */}
              <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4 text-[#C5A97A]" />
                    Contact Details
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com" 
                      className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                        errors.email ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      }`} 
                    />
                    {errors.email && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#C5A97A] border-r border-gray-200 dark:border-gray-700 pr-3">+234</div>
                      <input 
                        type="tel" 
                        name="tel"
                        value={formData.tel}
                        onChange={handleChange}
                        placeholder="8012345678" 
                        className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 pl-16 pr-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                          errors.tel ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                        }`} 
                      />
                    </div>
                    {errors.tel && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.tel}</p>}
                  </div>
                </div>
              </div>

              {/* Section 3: Location Details */}
              <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-[#C5A97A]" />
                    Location Details
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Location */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">State / LGA</label>
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Lagos, Ikeja" 
                      className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                        errors.location ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      }`} 
                    />
                    {errors.location && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.location}</p>}
                  </div>

                  {/* Home Address */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Home Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter full home address" 
                      className={`w-full rounded-2xl border bg-gray-50 dark:bg-[#06243A] py-3.5 px-4 text-sm font-medium text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A97A] focus:ring-1 focus:ring-[#C5A97A]/30 transition-all ${
                        errors.address ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      }`} 
                    />
                    {errors.address && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.address}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl font-black py-5 min-h-[60px] text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
                  loading 
                    ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed text-white" 
                    : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98] text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering Staff...
                  </>
                ) : "Complete Registration"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
