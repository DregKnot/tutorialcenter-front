import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import otp_img_student from "../../../assets/images/otpStudentpic.webp";
import TC_logo from "../../../assets/images/tutorial_logo.webp";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
const DEPARTMENTS = ["art", "science", "commercial"];

export default function CampaignDepartmentSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const toggleDept = (dept) => {
    setSelectedDept(dept === selectedDept ? "" : dept);
    setError("");
  };

  const handleContinue = async () => {
    if (!selectedDept) {
      setError("Please select a department to continue.");
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch courses to find the GCE course ID
      const courseRes = await axios.get(`${API_BASE_URL}/api/courses`);
      const courses = courseRes.data?.data || courseRes.data?.courses || [];
      
      const gceCourse = courses.find(c => c.title?.toLowerCase().includes("gce"));
      if (!gceCourse) {
        throw new Error("GCE course not found in the system.");
      }

      // 2. Setup student data in local storage
      // In this campaign flow, we start here, so we initialize the studentdata object
      const existingData = JSON.parse(localStorage.getItem("studentdata") || "{}");
      
      const updatedData = {
        ...existingData,
        data: {
          ...(existingData.data || {}),
          department: selectedDept
        },
        selectedTraining: [gceCourse.id],
        availableTrainings: courses
      };

      localStorage.setItem("studentdata", JSON.stringify(updatedData));
      navigate("/campaign/gce/subjects");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to initialize campaign data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F4F4F4] font-sans overflow-x-hidden">
      {/* IMAGE SECTION */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full relative order-1 md:order-2">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${otp_img_student})` }}
        />
      </div>

      {/* FORM SECTION */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[500px] mx-auto my-auto flex flex-col">
          {/* LOGO */}
          <div className="flex justify-center mb-8">
            <img 
              src={TC_logo} 
              alt="Logo" 
              className="h-20 w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95" 
              onClick={() => navigate("/")}
            />
          </div>

          {/* HEADER */}
          <div className="relative w-full flex items-center justify-center mb-6 mt-4 pointer-events-none z-50">
            <button
              onClick={() => navigate(-1)}
              className="fixed top-6 left-6 md:absolute md:left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-md md:shadow-sm transition-all active:scale-90 border border-gray-100 md:border-none pointer-events-auto"
            >
              <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
            </button>
            <div className="text-center pointer-events-auto">
              <h1 className="text-2xl md:text-3xl font-black text-[#09314F] uppercase tracking-tight">Select Department</h1>
              <p className="text-sm font-bold text-gray-400 mt-2 tracking-widest uppercase">GCE </p>
            </div>
          </div>

          <p className="text-sm font-semibold text-gray-500 mb-6 text-center leading-relaxed">
            Please select the department for your GCE subjects.
          </p>

          {/* DEPARTMENT OPTIONS */}
          <div className="space-y-4 mb-10 w-full">
            {DEPARTMENTS.map((dept) => {
              const isSelected = selectedDept === dept;
              return (
                <div
                  key={dept}
                  onClick={() => toggleDept(dept)}
                  className={`
                    flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm capitalize
                    ${isSelected 
                      ? "border-[#E83831] bg-[#E83831]/5 scale-[1.02] shadow-md" 
                      : "border-gray-200 bg-white hover:border-[#09314F]/30 hover:bg-gray-50 hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-black transition-colors ${isSelected ? "text-[#E83831]" : "text-[#09314F]"}`}>
                      {dept}
                    </span>
                  </div>
                  
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${isSelected ? "border-[#E83831] bg-[#E83831]" : "border-gray-300"}
                  `}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="bg-red-50 text-[#E83831] p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center justify-center mb-6">
              <span className="uppercase tracking-wide">{error}</span>
            </div>
          )}

          {/* CONTINUE BUTTON */}
          <button
            onClick={handleContinue}
            disabled={loading}
            className={`
              w-full py-4 rounded-2xl text-white font-black text-lg transition-all active:scale-95 shadow-xl uppercase tracking-widest
              ${loading ? "opacity-70 cursor-not-allowed" : "hover:brightness-110 hover:shadow-2xl"}
            `}
            style={{ background: "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)" }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
