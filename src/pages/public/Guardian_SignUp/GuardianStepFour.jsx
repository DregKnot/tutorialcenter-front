// import React, { useState } from "react";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import select_student from "../../../assets/images/add_student.png";
// import StudentBiodataFields from "../../../components/public/StudentBiodataFields";

const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const GuardianStepFour = ({
  students,
//   setStudents,
  updateStudent,
  addStudent,
  studentPassword,
  setStudentPassword,
  confirmStudentPassword,
  setConfirmStudentPassword,
  guardianErrors,
  handleStep4Submit,
  setStep,
  showStudentPassword,
  setShowStudentPassword,
  showConfirmStudentPassword,
  setShowConfirmStudentPassword,
  activeTab,
  setActiveTab
}) => {
  const toggleTab = (index) => {
    if (activeTab !== index) setActiveTab(index);
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-white font-sans overflow-x-hidden">
      
      {/* --- IMAGE SECTION --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <img src={select_student} alt="Guardian Add Student" className="w-full h-full object-cover" />
      </div>

      {/* --- FORM SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-white order-2 md:order-1 overflow-y-auto">
        
        <div className="w-full max-w-[500px] mx-auto my-auto pb-4">
          <div className="relative w-full flex items-center justify-center mb-4 mt-4">
            <button
              onClick={() => setStep(3)}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Add Student</h1>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center mb-6 border border-gray-100">
            <p className="text-gray-500 text-sm leading-relaxed">
              Add your child(ren) via email or phone. They will receive a confirmation to access their information. <br />
              <span className="text-[#09314F] font-bold text-xs uppercase">(Optional)</span>
            </p>
          </div>

          {/* Student Stack */}
          <div className="flex flex-col gap-3 mb-6">
            {students.map((student, index) => (
              <div
                key={index}
                className={`border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all ${guardianErrors && guardianErrors[`student_${index}`] ? 'ring-4 ring-red-500/20' : ''}`}
              >
                <div
                  onClick={() => toggleTab(index)}
                  className={`flex justify-between items-center p-4 cursor-pointer select-none transition-colors 
                  ${activeTab === index ? "bg-white border-b border-gray-100" : "bg-[#F9F4F3] hover:bg-gray-100"}`}
                >
                  <span className="font-bold text-[#09314F] text-sm uppercase">
                    Student {index + 1} {student.firstName && <span className="text-gray-400 font-normal normal-case">— {student.firstName}</span>}
                  </span>
                   {/* Error indicator */}
                   {guardianErrors && guardianErrors[`student_${index}`] && (
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                   )}
                  <span className="text-[#09314F] transform transition-transform duration-300" style={{ rotate: activeTab === index ? "180deg" : "0deg" }}>▼</span>
                </div>
                {activeTab === index && (
                  <div className="p-5 bg-white flex flex-col gap-4 animate-fadeIn">
                      <div className="flex gap-3">
                        <div className="w-1/2">
                          <label className="text-xs font-bold text-gray-500 ml-1 mb-1">First Name</label>
                          <input
                            placeholder="First Name"
                            value={student.firstName}
                            onChange={(e) => updateStudent(index, "firstName", e.target.value)}
                            className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border transition-all ${
                              guardianErrors && guardianErrors[`student_${index}`]?.firstName
                                ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                : 'border-gray-300 focus:border-[#09314F]'
                            }`}
                          />
                          {guardianErrors && guardianErrors[`student_${index}`]?.firstName && (
                            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors[`student_${index}`].firstName}</p>
                          )}
                        </div>
                        <div className="w-1/2">
                          <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Last Name</label>
                          <input
                            placeholder="Last Name"
                            value={student.lastName}
                            onChange={(e) => updateStudent(index, "lastName", e.target.value)}
                            className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border transition-all ${
                              guardianErrors && guardianErrors[`student_${index}`]?.lastName
                                ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                : 'border-gray-300 focus:border-[#09314F]'
                            }`}
                          />
                          {guardianErrors && guardianErrors[`student_${index}`]?.lastName && (
                            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors[`student_${index}`].lastName}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Identity Field specifically used in Guardian but not Student logic in some snippets? 
                          Wait, StudentBiodataFields handles biodata. Guardian flow has First, Last, Identity.
                          StudentBiodataFields has First, Last, DOB, Gender...
                          The original `renderGuardianStepFour` mostly had First, Last, Identity (lines 1191-1240).
                          It did NOT seem to have DOB/Gender/etc YET?
                          Wait, let me double check the `renderGuardianStepFour` logic I read.
                       */}
                       <div className="mt-4">
                        <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Email or Phone Number</label>
                        <input
                          placeholder="child@email.com or +234..."
                          value={student.identity}
                          onChange={(e) => updateStudent(index, "identity", e.target.value)}
                          className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border transition-all ${
                            guardianErrors && guardianErrors[`student_${index}`]?.identity
                              ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                              : 'border-gray-300 focus:border-[#09314F]'
                          }`}
                        />
                        {guardianErrors && guardianErrors[`student_${index}`]?.identity && (
                          <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors[`student_${index}`].identity}</p>
                        )}
                      </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addStudent}
            className="w-full h-[50px] border-2 border-dashed border-[#09314F]/30 text-[#09314F] font-bold rounded-xl hover:bg-[#09314F]/5 transition-all mb-8 flex items-center justify-center gap-2"
          >
            <span>Add another</span>
            <span className="text-xl">+</span>
          </button>

          {/* General Password */}
          <div className="flex gap-4 mb-6">
            <div className="w-1/2">
              <label className="text-xs font-bold text-gray-500 ml-1 mb-1">General Password</label>
              <div className="relative">
                <input
                  type={showStudentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border ${guardianErrors.password ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'focus:border-[#09314F]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowStudentPassword(!showStudentPassword)}
                  aria-label={showStudentPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:opacity-70 transition-all"
                >
                  <EyeIcon />
                </button>
              </div>
              {guardianErrors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors.password}</p>
              )}
            </div>

            <div className="w-1/2">
              <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmStudentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmStudentPassword}
                  onChange={(e) => setConfirmStudentPassword(e.target.value)}
                  className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border ${guardianErrors.passwordMatch ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'focus:border-[#09314F]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmStudentPassword(!showConfirmStudentPassword)}
                  aria-label={showConfirmStudentPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:opacity-70 transition-all"
                >
                  <EyeIcon />
                </button>
              </div>
              {guardianErrors.passwordMatch && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors.passwordMatch}</p>
              )}
            </div>
          </div>

          <button
            onClick={handleStep4Submit}
            className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center"
            style={{ background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)" }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuardianStepFour;
