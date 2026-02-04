import React from 'react';
import AuthLayout from "../../../components/public/SignUp_Usables/AuthLayout";
import CustomDropdown from "../../../components/public/SignUp_Usables/CustomDropdown";
import signup_img from "../../../assets/images/Student_sign_up.jpg";

const StepSeven = ({
  selectedExams,
  selectedDurations,
  setSelectedDurations,
  activeDropdown,
  setActiveDropdown,
  PRICES,
  DURATIONS,
  handleStep7Submit,
  calculateTotal,
  setStep
}) => {
  return (
    <AuthLayout
      title="Training Duration"
      subtitle="Select your preferred training duration for your examination."
      image={signup_img}
      onBack={() => setStep(6)}
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mb-auto">
        <div className="grid grid-cols-3 bg-[#09314F] text-white p-3 md:p-4 rounded-t-2xl text-[9px] md:text-[10px] font-bold uppercase text-center italic">
          <div>Examination</div>
          <div>Duration</div>
          <div>Amount</div>
        </div>

        {selectedExams.map((exam) => (
          <div key={exam} className="grid grid-cols-3 items-center border-b border-gray-50 p-4 md:p-6 text-center relative">
            <div className="font-black text-[#09314F] text-[10px] md:text-xs uppercase whitespace-nowrap overflow-hidden text-ellipsis px-1">{exam}</div>
            
            <div className="relative flex justify-center">
              <CustomDropdown
                isSmall={true}
                placeholder="Select"
                value={selectedDurations[exam]}
                options={DURATIONS}
                onChange={(dur) => setSelectedDurations(prev => ({...prev, [exam]: dur}))}
                isOpen={activeDropdown === `duration_${exam}`}
                onToggle={() => setActiveDropdown(activeDropdown === `duration_${exam}` ? null : `duration_${exam}`)}
              />
            </div>

            <div className="font-black text-[#09314F] text-[10px] md:text-xs">
              ₦{PRICES[exam][selectedDurations[exam] || "Monthly"]?.toLocaleString()}
            </div>
          </div>
        ))}

        <div className="p-6 pt-10">
          <button className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            onClick={handleStep7Submit}
            style={{ background: 'linear-gradient(90deg, #09314F 0%, #E33629 100%)' }}>
            Continue - ₦{calculateTotal()}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StepSeven;
