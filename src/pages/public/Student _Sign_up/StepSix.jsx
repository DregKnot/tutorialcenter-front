import React from 'react';
import AuthLayout from "../../../components/public/SignUp_Usables/AuthLayout";
import CustomDropdown from "../../../components/public/SignUp_Usables/CustomDropdown";
import select_student from "../../../assets/images/add_student.png"; // Or whichever image was used

const StepSix = ({
  selectedExams,
  selectedSubjects,
  toggleSubject,
  activeDropdown,
  setActiveDropdown,
  setStep,
  ALL_SUBJECTS
}) => {
  return (
    <AuthLayout
      title="Subject Selection"
      subtitle="Select your preferred subjects for your examination."
      image={select_student}
      onBack={() => setStep(5)}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible relative">
        {/* Header */}
        <div className="grid grid-cols-3 bg-[#09314F] text-white p-3 md:p-4 rounded-t-2xl text-[9px] md:text-[10px] font-bold uppercase text-center italic">
          <div>Examination</div>
          <div>Subjects</div>
          <div className="whitespace-nowrap">Subject Limit</div>
        </div>

        {/* Rows */}
        <div className="min-h-[200px]">
          {selectedExams.map((exam) => (
            <div
              key={exam}
              className="grid grid-cols-3 items-center border-b border-gray-50 p-4 md:p-6 text-center relative"
            >
              <div className="font-black text-[#09314F] text-[10px] md:text-xs uppercase tracking-tighter">
                {exam}
              </div>

              {/* The Dropdown Trigger Area */}
              <div className="relative flex justify-center">
                <CustomDropdown
                  isSmall={true}
                  multiSelect={true}
                  placeholder="Select..."
                  value={selectedSubjects[exam]}
                  options={ALL_SUBJECTS}
                  onChange={(sub) => toggleSubject(exam, sub)}
                  isOpen={activeDropdown === exam}
                  onToggle={() => setActiveDropdown(activeDropdown === exam ? null : exam)}
                />
              </div>

              {/* Limiter Counter */}
              <div className="font-bold text-[#09314F] text-[10px] md:text-xs">
                {selectedSubjects[exam]?.length || 0} /{" "}
                {exam === "JAMB" ? "4" : "8-9"}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Button Area */}
        <div className="p-6 pt-10">
          <button
            onClick={() => setStep(7)}
            className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
            style={{
              background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StepSix;
