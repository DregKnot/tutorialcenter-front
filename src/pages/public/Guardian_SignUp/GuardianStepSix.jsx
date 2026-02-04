import React from 'react';
import AuthLayout from "../../../components/public/SignUp_Usables/AuthLayout";
// import CustomDropdown from "../../../components/public/CustomDropdown";
import signup_img from "../../../assets/images/Student_sign_up.jpg"; // Or generic image

const GuardianStepSix = ({
  students,
  activeTab,
  setActiveTab,
  setStudents, // Or a more specific toggle handler if passed
  handleStep6Submit,
  setStep
}) => {
  const examOptions = ["JAMB", "WAEC", "NECO", "GCE"];
  
  // Note: logic for toggleStudentExam was inside renderGuardianStepSix
  // We should ideally receive it as a prop or redefine it here if it's local enough, 
  // but it alters 'students' state so it should be passed from parent or we use setStudents
  
  const toggleStudentExam = (studentIdx, exam) => {
    const updated = [...students];
    if (!updated[studentIdx].trainings) {
      updated[studentIdx].trainings = [];
    }
    
    const currentTrainings = updated[studentIdx].trainings.filter(t => t !== "");
    if (currentTrainings.includes(exam)) {
      updated[studentIdx].trainings = currentTrainings.filter(t => t !== exam);
    } else {
      updated[studentIdx].trainings = [...currentTrainings, exam];
    }
    setStudents(updated);
  };

  return (
    <AuthLayout
      title="Select Training"
      subtitle="Select the examinations you're about to write, you have the option of selection more than 1 examination."
      image={signup_img}
      onBack={() => setStep(5)}
    >
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 italic">
        <div className="flex flex-col gap-4 mb-10">
          {students.map((student, index) => (
            <div key={index} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div
                onClick={() => setActiveTab(activeTab === index ? null : index)}
                className={`flex justify-between items-center p-4 cursor-pointer transition-colors
                  ${activeTab === index ? "bg-[#F9F4F3] border-b" : "bg-white hover:bg-gray-50"}`}
              >
                <span className="font-bold text-[#09314F] text-xs md:text-sm uppercase">
                  Student {index + 1} {student.firstName && <span className="text-gray-400 font-normal normal-case">— {student.firstName}</span>}
                </span>
                <span className={`transition-transform flex items-center text-[#09314F] ${activeTab === index ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>

              {activeTab === index && (
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    {examOptions.map((exam) => {
                      const isSelected = student.trainings?.includes(exam);
                      return (
                        <button
                          key={exam}
                          onClick={() => toggleStudentExam(index, exam)}
                          className={`h-[45px] md:h-[50px] rounded-lg font-bold flex items-center justify-between px-4 transition-all duration-300
                            ${isSelected 
                              ? "bg-[#76D287] text-white shadow-md shadow-green-100" 
                              : "bg-[#D1D5DB] text-[#4B5563] hover:bg-gray-400"
                            }`}
                        >
                          <span className="text-[11px] md:text-xs uppercase tracking-wide">{exam}</span>
                          {isSelected && <span className="text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleStep6Submit}
          className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, #09314F 0%, #E33629 100%)' }}
        >
          Continue
        </button>
      </div>
    </AuthLayout>
  );
};

export default GuardianStepSix;
