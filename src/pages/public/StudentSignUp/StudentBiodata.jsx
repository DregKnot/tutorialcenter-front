import React from "react";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import otp_img_student from "../../../assets/images/otpStudentpic.jpg";
import StudentBiodataFields from "../../../components/public/SignUpUsables/StudentBiodataFields";

const StepFour = ({
  studentData,
  handleFieldChange,
  biodataErrors,
  activeDropdown,
  setActiveDropdown,
  handleStep4Submit,
  setStep
}) => {
  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-white font-sans overflow-x-hidden">
      
      {/* --- IMAGE SECTION --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <img src={otp_img_student} alt="Student Biodata" className="w-full h-full object-cover" />
        <button
          onClick={() => setStep(3)}
          className="absolute left-6 top-6 md:left-10 md:top-8 bg-white/80 backdrop-blur-sm md:bg-transparent w-10 h-10 md:w-auto md:h-auto rounded-full flex items-center justify-center hover:text-gray-500 transition-all shadow-md md:shadow-none z-20"
        >
          <img src={ReturnArrow} alt="Back" className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" />
        </button>
      </div>

      {/* --- FORM SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-[#F9FAFB] order-2 md:order-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-[500px] mx-auto my-auto pb-4 transition-all">
          <div className="relative w-full flex items-center justify-center mb-2 mt-4 transition-all">
            <button
              onClick={() => setStep(3)}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Student Biodata</h1>
          </div>
          <p className="text-center text-gray-400 mb-8 text-sm md:text-base">Filling in your student biometric data.</p>

          <div className="flex flex-col gap-6">
            <StudentBiodataFields
              student={studentData}
              onChange={handleFieldChange}
              errors={biodataErrors}
              showLabels={true}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              studentIndex="student_4"
            />

            <button
              className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold mt-4 shadow-lg transition-all active:scale-95 flex items-center justify-center"
              onClick={handleStep4Submit}
              style={{ background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)" }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepFour;
