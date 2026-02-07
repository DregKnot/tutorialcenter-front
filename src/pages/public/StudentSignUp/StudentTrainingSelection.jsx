import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import otp_img_student from "../../../assets/images/otpStudentpic.jpg";

export default function StudentTrainingSelection() {
    const navigate = useNavigate();
    const [examError, setExamError] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState([]);
    const [loading] = useState(false);

    const examOptions = ["JAMB", "WACE", "NECO", "GCE"];
    
    const toggleTraining = (exam) => {
        setSelectedTraining(prev => {
            if (prev.includes(exam)) {
                return prev.filter(e => e !== exam);
            } else {
                return [...prev, exam];
            }
        });
    }
   
    const handleContinue = () => {
    
    if (selectedTraining.length === 0) {
        setExamError(true); 
        return; 
    }
    // the navigation for next page will be added here, for now it just logs the selected training
};

    return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F4F4F4] font-sans overflow-x-hidden">
      
      {/* --- IMAGE SECTION (Right on Desktop, Top on Mobile) --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full relative order-1 md:order-2">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${otp_img_student})` }}
        />
      </div>

      {/* --- FORM SECTION (Left on Desktop, Bottom on Mobile) --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[500px] mx-auto my-auto flex flex-col transition-all">
          
          {/* Header with Back Button */}
          <div className="relative w-full flex items-center justify-center mb-6 mt-4 transition-all">
            <button
              onClick={() => navigate("/register/student/training-selection")}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Select Training</h1>
          </div>

          {/* White Card */}
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <p className="text-gray-500 text-xs md:text-sm mb-10 leading-relaxed text-center max-w-[340px]">
              Select the examinations you're about to write, you have the option of selection more than 1 examination.
            </p>

            {/* 2x2 Grid of Exams */}
            <div className="grid grid-cols-2 gap-4 w-full mb-10">
              {examOptions.map((exam) => {
                const isSelected = selectedTraining.includes(exam);
                return (
                  <button
                    key={exam}
                    onClick={() => toggleTraining(exam)}
                    className={`h-[50px] md:h-[55px] rounded-lg font-bold flex items-center justify-between px-5 transition-all duration-300
                      ${isSelected 
                        ? "bg-[#76D287] text-white shadow-md shadow-green-100" 
                        : "bg-[#D1D5DB] text-[#4B5563] hover:bg-gray-400"
                      }`}
                  >
                    <span className="text-sm uppercase tracking-wide">{exam}</span>
                    {isSelected && <span className="text-sm">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Error Message */}
            {examError && (
              <p className="text-red-500 text-xs font-bold mb-4">
                Select at least 1 examination
              </p>
            )}

            {/* Continue Button */}
            <button

            onClick={handleContinue}
              disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:bg-green-800"
                    } text-white transition-colors`}
            
              style={{
                background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)",
              }}
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );


};