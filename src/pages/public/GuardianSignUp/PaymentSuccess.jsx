import React from 'react';
import AuthLayout from "../../../components/public/SignUpUsables/AuthLayout";
import select_student from "../../../assets/images/add_student.png";

const GuardianStepNine = ({
  students,
  navigate
}) => {
  return (
    <AuthLayout
      title="Payment Successful!"
      image={select_student}
    >
      <div className="w-full max-w-[400px] mx-auto my-auto text-center transition-all">
        {/* Success Icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#09314F] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
          <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Access Info */}
        <p className="text-gray-500 text-sm mb-4">You now have access for</p>
        <div className="mb-8 space-y-2">
          {students.map((student, idx) => (
            <div key={idx} className="text-left bg-[#F9F4F3] p-3 rounded-lg">
              <p className="text-[#09314F] font-bold text-xs uppercase">Student {idx + 1}</p>
              {student.trainings && student.trainings.filter(t => t !== "").map((exam, examIdx) => (
                <p key={examIdx} className="text-gray-600 text-xs">
                  {exam} - {student.durations?.[exam] || 'Monthly'}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Dashboard Button */}
        <button
          onClick={() => {
            navigate('/dashboard');
          }}
          className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
          style={{ background: 'linear-gradient(90deg, #0F2C45 0%, #A92429 100%)' }}
        >
          Go To Dashboard
        </button>
      </div>
    </AuthLayout>
  );
};

export default GuardianStepNine;
