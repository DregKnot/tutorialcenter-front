import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import otp_img_student from "../../../assets/images/otpStudentpic.jpg";
import axios from "axios";

export const StudentSubjectSelection = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [subjectError, setSubjectError] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState([]);
    const [courses, setCourses] = useState([]);
    const [subjectLimit, setSubjectLimit] = useState(9);
    
    //This can be changed if not correct, just added it..
     const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

    const ALL_SUBJECTS = [
    "Mathematics",
    "English",
    "Physics",
    "Biology",
    "Chemistry",
    "Financial Accounting",
    "Economics",
    "French",
    "Literature in English",
    "Commerce",
    "Geography",
    "Government",
    "Agricultural Science",
    "CRS/IRS",
    "Civic",
    "Further Maths",
    "ICT",
    "Technical Drawing",
    "Igbo",
    "Hausa",
    "Yoruba",
  ];

  /* ================= FETCH AVAILABLE SUBJECTS BASED ON TRAINING SELECTION ================= */
  useEffect(() => {
    const fetchAvailableSubjects = async () => {
         try {
        // TEMPORARY: Get from localStorage
        const storedTrainings = localStorage.getItem('selectedTrainings');
        
        if (!storedTrainings) {
          navigate("/training-selection"); // Redirect if no training selected
          return;
        }

        const trainingIds = JSON.parse(storedTrainings);
        setSelectedTraining(trainingIds);

        // Fetch courses to get course details
        const coursesResponse = await axios.get(`${API_BASE_URL}/api/courses`);
        const allCourses = coursesResponse?.data?.courses || [];
        setCourses(allCourses);

        // Get selected courses
        const selectedCourses = allCourses.filter(course => 
          trainingIds.includes(course.id)
        );

        // Check if JAMB is selected (case-insensitive)
        const hasJamb = selectedCourses.some(course => 
          course.title.toLowerCase().includes('jamb')
        );

        // Set subject limit based on selection
        if (hasJamb) {
          setSubjectLimit(4);
        } else {
          setSubjectLimit(9);
        }

          } catch (error) {
        console.error("Failed to fetch subjects", error);
        // Fallback: show all subjects
        setAvailableSubjects(ALL_SUBJECTS);
      }
    };

    fetchAvailableSubjects();
  }, [API_BASE_URL, navigate]);

  /* ================= TOGGLE SUBJECT SELECTION ================= */
  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) => {
      // If subject is already selected, remove it
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      }
      
      // If we haven't reached the limit, add it
      if (prev.length < subjectLimit) {
        return [...prev, subject];
      }
      
      // If we've reached the limit, show error
      setSubjectError(true);
      setTimeout(() => setSubjectError(false), 3000); // Clear error after 3 seconds
      return prev;
    });
  };

  /* ================= GET SUBJECT COUNT ================= */
  const getSubjectCount = (subject) => {
    // This will come from backend later
    // For now, return dummy data
    const counts = {
      "Mathematics": "4/4",
      "English": "4/4",
      "Physics": "0/8-9",
      "Economics": "0/8-9",
    };
    return counts[subject] || "4/4";
  };

  /* ================= CONTINUE ================= */
  const handleContinue = async () => {
    if (selectedSubjects.length === 0) {
      setSubjectError(true);
      return;
    }

    setSubjectError(false);
    setLoading(true);

    try {
      console.log("Selected subjects:", selectedSubjects);
      console.log("For trainings:", selectedTraining);
      
      // Save to localStorage or send to backend
      
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

          {/* HEADER */}
          <div className="relative w-full flex items-center justify-center mb-6 mt-4">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full"
            >
              <img
                className="w-5 h-5"
                src={ReturnArrow}
                alt="Back"
              />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">
              Subject Selection
            </h1>
          </div>

          {/* CARD */}
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col">

            <p className="text-gray-500 text-xs md:text-sm mb-2 text-center">
              Select your preferred subjects for your examination.
            </p>
            
            {/* SELECTION LIMIT INFO */}
            <p className="text-[#09314F] font-semibold text-sm mb-6 text-center">
              {selectedSubjects.length}/{subjectLimit} subjects selected
            </p>

            {/* TABLE HEADER */}
            <div className="grid grid-cols-3 gap-4 mb-4 px-2">
              <div className="text-[#09314F] font-bold text-sm">Examination</div>
              <div className="text-[#09314F] font-bold text-sm">Subjects</div>
              <div className="text-[#09314F] font-bold text-sm text-right">Number</div>
            </div>

            {/* SUBJECTS LIST */}
            <div className="space-y-3 mb-6">
              {availableSubjects.map((subject) => {
                const isSelected = selectedSubjects.includes(subject);
                const isDisabled = !isSelected && selectedSubjects.length >= subjectLimit;

                return (
                  <div
                    key={subject}
                    className="grid grid-cols-3 gap-4 items-center"
                  >
                    {/* Examination Column - Empty or show exam type */}
                    <div className="text-sm text-gray-600">
                      {/* This could show "JAMB" or "WAEC" etc from backend */}
                    </div>

                    {/* Subject Button */}
                    <button
                      onClick={() => toggleSubject(subject)}
                      disabled={isDisabled}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300
                        ${
                          isSelected
                            ? "bg-[#76D287] text-white shadow-md"
                            : isDisabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#D1D5DB] text-[#4B5563] hover:bg-gray-400"
                        }`}
                    >
                      {subject}
                      {isSelected && <span className="ml-2">✓</span>}
                    </button>

                    {/* Number Column */}
                    <div className="text-sm text-gray-600 text-right">
                      {getSubjectCount(subject)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ERROR */}
            {subjectError && (
              <p className="text-red-500 text-xs font-bold mb-4 text-center">
                {selectedSubjects.length === 0 
                  ? "Select at least one subject"
                  : `You can only select up to ${subjectLimit} subjects`
                }
              </p>
            )}

            {/* CONTINUE */}
            <button
              onClick={handleContinue}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#09314F] to-[#E83831]"
              } text-white`}
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
