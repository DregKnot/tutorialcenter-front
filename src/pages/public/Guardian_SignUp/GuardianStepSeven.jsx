import React from 'react';
import AuthLayout from "../../../components/public/SignUp_Usables/AuthLayout";
import CustomDropdown from "../../../components/public/SignUp_Usables/CustomDropdown";
import signup_img from "../../../assets/images/Student_sign_up.jpg";

const GuardianStepSeven = ({
  students,
  setStudents,
  activeTab,
  setActiveTab,
  activeDropdown,
  setActiveDropdown,
  PRICES,
  DURATIONS,
  handleStep7Submit,
  calculateTotal, // Function returning string or number
  setStep
}) => {
  
  const updateStudentDuration = (studentIdx, exam, duration) => {
    const updated = [...students];
    if (!updated[studentIdx].durations) {
      updated[studentIdx].durations = {};
    }
    updated[studentIdx].durations[exam] = duration;
    setStudents(updated);
  };

  return (
    <AuthLayout
      title="Select Duration"
      subtitle="Select your preferred training duration for each student."
      image={signup_img}
      onBack={() => setStep(6)}
    >
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-auto">
        {students.map((student, idx) => (
          <div key={idx} className="border-b border-gray-100 mb-4 pb-4 last:border-0">
            <div 
              className="flex justify-between items-center py-2 cursor-pointer group" 
              onClick={() => setActiveTab(activeTab === idx ? null : idx)}
            >
              <span className="font-bold text-[#09314F] text-xs md:text-sm uppercase">
                Student {idx + 1}
              </span>
              <span className={`transition-transform flex items-center text-[#09314F] ${activeTab === idx ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
             
            {activeTab === idx && (
              <div className="flex flex-col gap-4 mt-4 animate-fadeIn">
                {student.trainings && student.trainings.filter(t => t !== "").map((exam, examIdx) => (
                  <div key={`${exam}-${examIdx}`} className="flex items-center justify-between gap-4 p-3 bg-[#FDF2F2] rounded-xl">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black text-[#09314F] uppercase tracking-tighter">
                        {exam}
                      </label>
                      <span className="text-[11px] font-bold text-[#E33629]">
                        ₦{PRICES[exam]?.[student.durations?.[exam] || DURATIONS[0]]?.toLocaleString() || '0'}
                      </span>
                    </div>
                     
                    <div className="flex-1 max-w-[120px]">
                      <CustomDropdown
                        isSmall={true}
                        placeholder="Select"
                        value={student.durations?.[exam]}
                        options={DURATIONS}
                        onChange={(dur) => updateStudentDuration(idx, exam, dur)}
                        isOpen={activeDropdown === `guardian_dur_${idx}_${exam}`}
                        onToggle={() => setActiveDropdown(activeDropdown === `guardian_dur_${idx}_${exam}` ? null : `guardian_dur_${idx}_${exam}`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button 
          onClick={() => handleStep7Submit()}
          className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold mt-8 flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          style={{ background: 'linear-gradient(90deg, #09314F 0%, #E33629 100%)' }}
        >
          Continue - ₦{calculateTotal()}
        </button>
      </div>
    </AuthLayout>
  );
};

export default GuardianStepSeven;
