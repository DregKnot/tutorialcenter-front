import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

/**
 * Reusable input for the student profile matching the Staff profile style
 */
const ModalInput = ({ 
  label, 
  icon, 
  value, 
  name, 
  onChange, 
  disabled, 
  type = "text", 
  placeholder = "", 
  isSelect = false, 
  options = [],
  className = "" 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-[11px] font-bold text-gray-400 ml-1">{label}</label>
      <div className="relative group/input">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-300 z-10">
          <Icon icon={icon} className="w-5 h-5" />
        </div>
        
        {isSelect ? (
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-10 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#0F2843]/10 dark:focus:ring-white/10 focus:border-[#0F2843] dark:focus:border-gray-400 transition-all appearance-none disabled:bg-gray-50/50 dark:disabled:bg-gray-800/50"
          >
            <option value="" disabled>{placeholder || `Select ${label}`}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-10 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#0F2843]/10 dark:focus:ring-white/10 focus:border-[#0F2843] dark:focus:border-gray-400 transition-all disabled:bg-gray-50/50 dark:disabled:bg-gray-800/50"
          />
        )}

        {/* Right side icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSelect ? (
            <Icon icon="heroicons:chevron-down" className="w-4 h-4 text-gray-400" />
          ) : (
            <Icon icon="lucide:lock" className="w-4 h-4 text-gray-300 group-hover/input:text-gray-400 transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminStudentViewModal({ studentId, onClose, onUpdate }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");
  const staffRole = (localStorage.getItem("staff_role") || "").toLowerCase();
  const isPreview = staffRole === "coo" || staffRole === "preview" || staffRole === "operations";
  const apiPrefix = staffRole === "advisor" ? "advisor" : "admin";

  // Fetch full student details
  const fetchStudentDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/${apiPrefix}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("🎓 STUDENT PROFILE API RESPONSE:", res.data);

      const data = res.data?.student || res.data?.data || res.data;
      setStudent(data);
    } catch (error) {
      console.error("Failed to fetch student details", error);
      setToast({ type: "error", message: "Failed to load student details" });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, studentId, token, apiPrefix]);

  useEffect(() => {
    if (studentId) fetchStudentDetails();
  }, [studentId, fetchStudentDetails]);


  const handleSuspend = async () => {
    if (!window.confirm("Are you sure you want to suspend this student?")) return;
    setSubmitting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/students/destroy/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Student suspended successfully" });
      fetchStudentDetails(); 
      setTimeout(() => onUpdate(), 1500);
    } catch (error) {
      setToast({ type: "error", message: "Failed to suspend student" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestore = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/admin/students/restore/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Student restored successfully" });
      fetchStudentDetails();
      setTimeout(() => onUpdate(), 1500);
    } catch (error) {
      setToast({ type: "error", message: "Failed to restore student" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !student) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-[#131320] rounded-3xl p-12 text-center shadow-2xl">
        <div className="w-12 h-12 border-4 border-[#0F2843]/20 dark:border-white/20 border-t-[#0F2843] dark:border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    </div>
  );

  const studentInfo = Array.isArray(student?.information) ? student.information[0] : (student?.information || {});
  const isSuspended = !!student?.deleted_at || !!studentInfo?.deleted_at || student?.account_status === "suspended" || student?.banned === 1;

  const enrolledSubjects = student?.enrolled_subjects || student?.enrolled_subject || studentInfo?.enrolled_subjects || studentInfo?.enrolled_subject || student?.subjects || [];
  const enrolledCourses = student?.courses || student?.course_enrollments || studentInfo?.courses || studentInfo?.course_enrollments || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-8 animate-in fade-in duration-300">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-10 right-10 z-[110] px-6 py-4 rounded-2xl shadow-2xl text-white flex items-center gap-3 animate-in slide-in-from-top-4 ${
          toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
        }`}>
          <div className="p-1 bg-white/20 rounded-full">
            {toast.type === "success" ? (
              <Icon icon="heroicons:check-circle" className="w-5 h-5"/>
            ) : (
              <Icon icon="heroicons:x-mark" className="w-5 h-5"/>
            )}
          </div>
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="bg-white dark:bg-[#131320] w-full max-w-[800px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative text-[#0F2843] dark:text-gray-100 font-sans">
        
        {/* Main Content Scrollable Area */}
        <div className={`flex-1 overflow-y-auto p-8 md:p-10 ${isSuspended ? "opacity-60 grayscale-[0.2]" : ""}`}>
          
          {/* Header */}
          <h1 className="text-xl md:text-2xl font-black mb-8 uppercase tracking-tight">
            STUDENT PROFILE: {studentInfo?.firstname} {studentInfo?.surname}
          </h1>

          {/* Top Section: Avatar + Primary Fields */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
            {/* Avatar Placeholder */}
            <div className="w-44 h-44 shrink-0 relative group">
              <div className="w-full h-full rounded-[20px] overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative">
                {studentInfo?.profile_picture ? (
                  <img src={`${API_BASE_URL.replace('/api', '')}/storage/${studentInfo.profile_picture}`} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full bg-[#0F2843] dark:bg-gray-700 text-white flex items-center justify-center text-5xl font-black">
                    {(studentInfo?.firstname?.[0] || "U").toUpperCase()}
                  </div>
                )}
                
                {isSuspended && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                    Suspended
                  </div>
                )}
              </div>
            </div>

            {/* Name/Email Inputs (2 columns inside) */}
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-4">
              <ModalInput 
                label="First Name" 
                icon="heroicons:user-solid" 
                name="firstname" 
                value={studentInfo?.firstname} 
                disabled={true}
              />
              <ModalInput 
                label="Last Name" 
                icon="heroicons:user-solid" 
                name="surname" 
                value={studentInfo?.surname} 
                disabled={true}
              />
              <ModalInput 
                label="Email" 
                icon="heroicons:envelope-solid" 
                name="email" 
                value={studentInfo?.email} 
                disabled={true}
              />
              <div className="relative">
                <ModalInput 
                  label="Phone Number" 
                  icon="heroicons:phone-solid" 
                  name="tel" 
                  value={studentInfo?.tel || "Not Provided"} 
                  disabled={true}
                />
                {studentInfo?.tel_verified_at && (
                  <div className="absolute right-3 top-9 flex items-center justify-center text-green-500 bg-green-50 rounded-full p-1 shadow-sm" title={`Verified at: ${new Date(studentInfo.tel_verified_at).toLocaleDateString()}`}>
                    <Icon icon="heroicons:check-badge-solid" className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid Section for secondary details */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4">
              <ModalInput 
                label="Department" 
                icon="heroicons:academic-cap-solid" 
                name="department" 
                value={studentInfo?.department || student.department || "Not Provided"} 
                disabled={true}
              />
              <ModalInput 
                label="Date of Birth" 
                icon="heroicons:calendar-solid" 
                name="date_of_birth" 
                value={studentInfo?.date_of_birth ? studentInfo.date_of_birth.split('T')[0] : "Not Provided"} 
                disabled={true}
              />
              <ModalInput 
                label="Gender" 
                icon="ph:gender-male-bold" 
                name="gender" 
                value={studentInfo?.gender || student.gender || "Unknown"} 
                disabled={true}
              />
              <ModalInput 
                label="Registration Date" 
                icon="heroicons:calendar-days-solid" 
                name="created_at" 
                value={studentInfo?.created_at ? studentInfo.created_at.split('T')[0] : "N/A"} 
                disabled={true}
              />
              <ModalInput 
                label="Location" 
                icon="heroicons:map-pin-solid" 
                name="location" 
                value={studentInfo?.location || "Not Provided"} 
                disabled={true}
              />
              <ModalInput 
                label="Address" 
                icon="heroicons:home-solid" 
                name="address" 
                value={studentInfo?.address || "Not Provided"} 
                disabled={true}
              />
            </div>

            {/* Guardians */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Guardians</label>
              <div className="flex flex-col gap-2">
                {student?.guardians?.length > 0 || studentInfo?.guardians?.length > 0 ? (
                  (student.guardians || studentInfo.guardians).map((g, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
                       <div>
                         <p className="font-bold text-sm text-[#0F2843] dark:text-white">{g.firstname} {g.surname}</p>
                         <p className="text-xs text-gray-400">{g.email} • {g.tel}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-500">No guardian information provided</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enrolled Courses & Subjects */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Enrolled Courses & Subjects</label>
              {(enrolledSubjects.length > 0 || enrolledCourses.length > 0) ? (
                <div className="space-y-3">
                  {/* Display Courses if available */}
                  {enrolledCourses.length > 0 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-2.5">Enrolled Courses ({enrolledCourses.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {enrolledCourses.map((ce, idx) => {
                          const courseName = ce?.title || ce?.name || ce?.course?.title || ce?.course?.name || `Course ID: ${ce?.id || ce?.course_id}`;
                          return (
                            <span key={idx} className="px-3 py-1.5 bg-[#0F2843]/10 dark:bg-white/10 text-[#0F2843] dark:text-white rounded-lg text-xs font-bold border border-[#0F2843]/20 dark:border-white/20 flex items-center gap-1.5">
                              <Icon icon="heroicons:academic-cap-solid" className="w-3.5 h-3.5" />
                              {courseName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Display Enrolled Subjects */}
                  {enrolledSubjects.length > 0 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-2.5">Enrolled Subjects ({enrolledSubjects.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {enrolledSubjects.map((sub, idx) => {
                          const subName = sub?.title || sub?.name || sub?.subject?.title || sub?.subject?.name || sub?.subject_name || `Subject ID: ${sub?.id || sub?.subject_id}`;
                          return (
                            <span key={idx} className="px-3 py-1.5 bg-[#BB9E7F]/15 text-[#BB9E7F] dark:text-[#d4b592] rounded-lg text-xs font-bold border border-[#BB9E7F]/30 shadow-sm flex items-center gap-1.5">
                              <Icon icon="heroicons:book-open-solid" className="w-3.5 h-3.5" />
                              {subName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-500">No enrolled subjects or courses found</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-6">
              <ModalInput 
                label="Account Status" 
                icon="heroicons:shield-check-solid" 
                name="status" 
                value={isSuspended ? "Suspended" : (student.account_status || "Active").toUpperCase()} 
                disabled={true}
                className={isSuspended ? "text-red-500" : "text-green-500"}
              />
            </div>
          </div>
        </div>

        {/* Footer Area with Action Buttons */}
        <div className="px-8 pb-8 flex items-center gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-[#0F2843] dark:bg-white text-white dark:text-[#0F2843] font-black text-sm uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Close View
          </button>
        </div>

        {/* Suspend/Restore Logic (Floating Button Overlay) */}
        {!isPreview && staffRole !== "advisor" && (
          <button 
              onClick={isSuspended ? handleRestore : handleSuspend}
              disabled={submitting}
              className={`absolute top-8 right-8 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm transition-all active:scale-95 ${
                  isSuspended 
                  ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:shadow-md" 
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:shadow-md"
              }`}
          >
              {submitting ? "Processing..." : isSuspended ? "Restore Student" : "Suspend Student"}
          </button>
        )}
      </div>
    </div>
  );
}