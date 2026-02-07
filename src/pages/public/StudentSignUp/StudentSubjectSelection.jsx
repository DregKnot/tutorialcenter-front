import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import otp_img_student from "../../../assets/images/otpStudentpic.jpg";

export const StudentSubjectSelection = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [selectedTrainings, setSelectedTrainings] = useState([]);
    const [trainingSubjects, setTrainingSubjects] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);
    const [error, setError] = useState(false);

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

  /* ================= LOAD TRAININGS FROM PREVIOUS PAGE ================= */
  useEffect(() => {
    const storedCourseDetails = localStorage.getItem('selectedCourseDetails');
    
    if (!storedCourseDetails) {
      navigate("/register/student/training/selection");
      return;
    }

    const trainings = JSON.parse(storedCourseDetails);
    setSelectedTrainings(trainings);

    // Initialize empty subject arrays for each training
    const initialSubjects = {};
    trainings.forEach(training => {
      initialSubjects[training.id] = [];
    });
    setTrainingSubjects(initialSubjects);
  }, [navigate]);

  /* ================= GET SUBJECT LIMIT FOR TRAINING ================= */
  const getSubjectLimit = (trainingTitle) => {
    const isJamb = trainingTitle.toLowerCase().includes('jamb');
    return isJamb ? 4 : 9;
  };

  /* ================= TOGGLE SUBJECT FOR SPECIFIC TRAINING ================= */
  const toggleSubject = (trainingId, subject) => {
    setTrainingSubjects(prev => {
      const currentSubjects = prev[trainingId] || [];
      
      // If already selected, deselect it
      if (currentSubjects.includes(subject)) {
        return {
          ...prev,
          [trainingId]: currentSubjects.filter(s => s !== subject)
        };
      }
      
      // Check limit
      const training = selectedTrainings.find(t => t.id === trainingId);
      const limit = getSubjectLimit(training.title);
      
      if (currentSubjects.length >= limit) {
        return prev; // Don't add, limit reached
      }
      
      // Add subject
      return {
        ...prev,
        [trainingId]: [...currentSubjects, subject]
      };
    });
  };

  /* ================= TOGGLE DROPDOWN ================= */
  const toggleDropdown = (trainingId) => {
    setOpenDropdown(openDropdown === trainingId ? null : trainingId);
  };

  /* ================= GET SELECTED COUNT ================= */
  const getSelectedCount = (trainingId, trainingTitle) => {
    const selected = trainingSubjects[trainingId]?.length || 0;
    const limit = getSubjectLimit(trainingTitle);
    return `${selected} / ${limit}`;
  };

  /* ================= CONTINUE ================= */
  const handleContinue = () => {
    // Validate: Check if all trainings have at least one subject
    const allHaveSubjects = selectedTrainings.every(training => 
      trainingSubjects[training.id]?.length > 0
    );

    if (!allHaveSubjects) {
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    // Save to localStorage
    localStorage.setItem('trainingSubjects', JSON.stringify(trainingSubjects));

    console.log("Training subjects:", trainingSubjects);
    
    // Navigate to next page
    navigate("/training-duration");

    setLoading(false);
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
              <img className="w-5 h-5" src={ReturnArrow} alt="Back" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">
              Subject Selection
            </h1>
          </div>

          {/* CARD */}
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col">

            <p className="text-gray-500 text-xs md:text-sm mb-6 text-center">
              Select your preferred subjects for your examination.
            </p>

            {/* TABLE HEADER */}
            <div className="grid grid-cols-3 gap-4 mb-4 px-2">
              <div className="text-white bg-[#09314F] py-2 px-3 rounded-tl-lg font-bold text-sm">
                Examination
              </div>
              <div className="text-white bg-[#09314F] py-2 px-3 font-bold text-sm">
                Subjects
              </div>
              <div className="text-white bg-[#09314F] py-2 px-3 rounded-tr-lg font-bold text-sm text-right">
                Number
              </div>
            </div>

            {/* TRAINING ROWS */}
            <div className="space-y-4 mb-6">
              {selectedTrainings.map((training) => {
                const selectedSubjects = trainingSubjects[training.id] || [];
                const isOpen = openDropdown === training.id;
                const limit = getSubjectLimit(training.title);

                return (
                  <div key={training.id} className="border-b border-gray-200 pb-4">
                    
                    {/* Row with Exam name, Dropdown, Count */}
                    <div className="grid grid-cols-3 gap-4 items-center mb-2">
                      
                      {/* Examination Name */}
                      <div className="text-sm font-semibold text-[#09314F]">
                        {training.title}
                      </div>

                      {/* Dropdown Button */}
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(training.id)}
                          className="w-full py-2 px-3 bg-[#D1D5DB] text-[#4B5563] rounded-lg text-xs font-medium text-left flex items-center justify-between hover:bg-gray-400 transition-all"
                        >
                          <span>
                            {selectedSubjects.length === 0 
                              ? "Add Subjects" 
                              : `${selectedSubjects.slice(0, 2).join(", ")}${selectedSubjects.length > 2 ? '...' : ''}`
                            }
                          </span>
                          <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {ALL_SUBJECTS.map(subject => {
                              const isSelected = selectedSubjects.includes(subject);
                              const isDisabled = !isSelected && selectedSubjects.length >= limit;

                              return (
                                <button
                                  key={subject}
                                  onClick={() => toggleSubject(training.id, subject)}
                                  disabled={isDisabled}
                                  className={`w-full text-left px-4 py-2 text-sm transition-all
                                    ${isSelected 
                                      ? "bg-[#76D287] text-white font-semibold" 
                                      : isDisabled
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                      : "hover:bg-gray-100 text-gray-700"
                                    }`}
                                >
                                  {subject}
                                  {isSelected && <span className="ml-2">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Count */}
                      <div className="text-sm font-semibold text-[#09314F] text-right">
                        {getSelectedCount(training.id, training.title)}
                      </div>
                    </div>

                    {/* Selected Subjects Display (like in the image) */}
                    {selectedSubjects.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div></div>
                        <div className="col-span-2 flex flex-wrap gap-2">
                          {selectedSubjects.map(subject => (
                            <span 
                              key={subject}
                              className="px-3 py-1 bg-[#76D287] text-white text-xs rounded-lg font-medium"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-xs font-bold mb-4 text-center">
                Please select at least one subject for each examination
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