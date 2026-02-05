import React from "react";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import select_student from "../../../assets/images/add_student.png";
import StudentBiodataFields from "../../../components/public/SignUpUsables/StudentBiodataFields";

const GuardianStepFive = ({
  students,
  activeTab,
  setActiveTab,
  guardianErrors,
  updateStudent,
  activeDropdown,
  setActiveDropdown,
  handleStep5Submit,
  setStep
}) => {
  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans bg-white overflow-x-hidden">
      
      {/* --- IMAGE SECTION (Top on mobile, Right on Desktop) --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <img 
          src={select_student} 
          alt="Student Biodata" 
          className="w-full h-full object-cover" 
        />
        {/* Login Button (Hidden on Mobile) */}
        <div className="hidden md:block absolute bottom-[60px] left-0">
          <button
            className="px-10 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
            style={{ borderRadius: "0px 20px 20px 0px" }}
          >
            Login
          </button>
        </div>
      </div>

      {/* --- FORM SECTION (Bottom on mobile, Left on Desktop) --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-[#F9FAFB] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[550px] mx-auto my-auto pb-4 transition-all">
          <div className="relative w-full flex items-center justify-center mb-4 mt-4">
            <button
              onClick={() => setStep(4)}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Student Biodata</h1>
          </div>
          <p className="text-center text-gray-400 mb-8 text-sm md:text-base">Filling in your student biometric data.</p>

          {/* Accordion for Multiple Students */}
          <div className="flex flex-col gap-4">
            {students.map((student, index) => (
              <div
                key={index}
                className={`border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white transition-all ${guardianErrors && guardianErrors[`student_${index}`] ? 'ring-4 ring-red-500/20' : ''}`}
              >
                <div
                  onClick={() => setActiveTab(index)}
                  className={`relative flex justify-between items-center p-4 cursor-pointer transition-colors
                    ${activeTab === index ? "bg-[#F9F4F3] border-b" : "bg-white hover:bg-gray-50"}`}
                >
                  <span className="font-bold text-[#09314F] uppercase text-xs">
                    Student {index + 1} {student.firstName && <span className="text-gray-400 font-normal normal-case">— {student.firstName}</span>}
                  </span>

                  {/* Error indicator for this student if validation found issues */}
                  {guardianErrors && guardianErrors[`student_${index}`] && (
                    <span className="absolute top-2 right-8 w-3 h-3 bg-red-500 rounded-full" title="This student has errors"></span>
                  )}

                  <span className="text-[#09314F] transform transition-transform duration-300" style={{ rotate: activeTab === index ? "180deg" : "0deg" }}>▼</span>
                </div>

                {activeTab === index && (
                  <div className="flex flex-col gap-5 px-6 py-8 md:px-8">
                    <StudentBiodataFields
                      student={student}
                      onChange={(field, value) => updateStudent(index, field, value)}
                      errors={guardianErrors[`student_${index}`] || {}}
                      showLabels={true}
                      studentIndex={index}
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                    />
                    
                    {/* Display error messages below fields */}
                    {guardianErrors && guardianErrors[`student_${index}`] && (
                      <div className="mt-4 space-y-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        {Object.entries(guardianErrors[`student_${index}`]).map(([field, error]) => (
                          <p key={field} className="text-red-600 text-xs font-semibold">{error}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleStep5Submit}
            disabled={students.length === 0}
            className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold mt-10 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: students.length === 0 ? "#cccccc" : "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)",
            }}
          >
            Complete Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuardianStepFive;
