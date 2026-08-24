import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import StudentPaymentsRecovery from "./StudentPaymentsRecovery.jsx";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const [allCourses, setAllCourses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allGuardians, setAllGuardians] = useState([]);
  const [allAdvisors, setAllAdvisors] = useState([]);

  // Modals for adding Guardian / Advisor
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [guardianMode, setGuardianMode] = useState("existing"); // "existing" | "new"
  const [selectedGuardianId, setSelectedGuardianId] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("parent");
  const [newGuardianForm, setNewGuardianForm] = useState({
    firstname: "",
    surname: "",
    email: "",
    tel: "",
    gender: "male",
    date_of_birth: "",
    location: "",
    address: "",
  });

  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");
  const [advisorRole, setAdvisorRole] = useState("advisor");
  const [actionLoading, setActionLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");
  const staffRole = (localStorage.getItem("staff_role") || "").toLowerCase();
  const isPreview = staffRole === "coo" || staffRole === "preview" || staffRole === "operations";
  const apiPrefix = staffRole === "advisor" ? "advisor" : "admin";

  // Fetch courses, subjects, guardians, and advisors directory
  useEffect(() => {
    const fetchDirectories = async () => {
      try {
        const [cRes, sRes, gRes, aRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/courses`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/api/admin/subjects/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/api/admin/guardians/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/api/admin/advisors/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })),
        ]);

        const rawCourses = cRes.data?.courses || cRes.data?.data || cRes.data || [];
        const rawSubjects = sRes.data?.subjects || sRes.data?.data || sRes.data || [];
        const rawGuardians = gRes.data?.guardians || gRes.data?.data || gRes.data || [];
        const rawAdvisors = aRes.data?.advisors || aRes.data?.data || aRes.data || [];

        setAllCourses(Array.isArray(rawCourses) ? rawCourses : []);
        setAllSubjects(Array.isArray(rawSubjects) ? rawSubjects : []);
        setAllGuardians(Array.isArray(rawGuardians) ? rawGuardians : []);
        setAllAdvisors(Array.isArray(rawAdvisors) ? rawAdvisors : []);
      } catch (err) {
        console.warn("Failed to load reference directories:", err);
      }
    };
    fetchDirectories();
  }, [API_BASE_URL, token]);

  // Fetch full student details
  const fetchStudentDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/${apiPrefix}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data?.student || res.data?.data || res.data;
      setStudent(data);
      setEditForm({
        firstname: data.information?.firstname || data.firstname || "",
        surname: data.information?.surname || data.surname || "",
        email: data.email || "",
        tel: data.information?.tel || data.tel || "",
        department: data.information?.department || data.department || "",
        gender: data.information?.gender || data.gender || "",
        date_of_birth: data.information?.date_of_birth ? data.information.date_of_birth.split('T')[0] : "",
        location: data.information?.location || data.location || "",
        address: data.information?.address || data.address || "",
      });
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

  // Handle Linking / Creating Guardian
  const handleAddGuardian = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = guardianMode === "existing" 
        ? { guardian_id: selectedGuardianId, relationship: guardianRelationship }
        : { ...newGuardianForm, relationship: guardianRelationship };

      await axios.post(`${API_BASE_URL}/api/admin/students/${studentId}/guardians`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setToast({ type: "success", message: "Guardian linked successfully!" });
      setShowGuardianModal(false);
      setSelectedGuardianId("");
      setNewGuardianForm({ firstname: "", surname: "", email: "", tel: "" });
      fetchStudentDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to link guardian" });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Unlinking Guardian
  const handleRemoveGuardian = async (guardianId) => {
    if (!window.confirm("Are you sure you want to unlink this guardian?")) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/students/${studentId}/guardians/${guardianId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Guardian unlinked successfully" });
      fetchStudentDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to unlink guardian" });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Assigning Advisor
  const handleAssignAdvisor = async (e) => {
    e.preventDefault();
    if (!selectedAdvisorId) {
      setToast({ type: "error", message: "Please select an advisor" });
      return;
    }
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/admin/students/${studentId}/advisors`, {
        staff_id: selectedAdvisorId,
        role: advisorRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setToast({ type: "success", message: "Advisor assigned successfully!" });
      setShowAdvisorModal(false);
      setSelectedAdvisorId("");
      fetchStudentDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to assign advisor" });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Unassigning Advisor
  const handleRemoveAdvisor = async (staffId) => {
    if (!window.confirm("Are you sure you want to unassign this advisor?")) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/students/${studentId}/advisors/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Advisor unassigned successfully" });
      fetchStudentDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to unassign advisor" });
    } finally {
      setActionLoading(false);
    }
  };

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
  const guardiansList = student?.guardians || studentInfo?.guardians || [];
  const advisorsList = student?.advisors || studentInfo?.advisors || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    setSubmitting(true);
    try {
      await axios.put(`${API_BASE_URL}/api/${apiPrefix}/students/${studentId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Profile updated successfully" });
      setIsEditing(false);
      fetchStudentDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setSubmitting(false);
    }
  };

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

      <div className="bg-white dark:bg-[#131320] w-full max-w-[850px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative text-[#0F2843] dark:text-gray-100 font-sans">
        
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
                value={isEditing ? editForm.firstname : studentInfo?.firstname} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              <ModalInput 
                label="Last Name" 
                icon="heroicons:user-solid" 
                name="surname" 
                value={isEditing ? editForm.surname : studentInfo?.surname} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              <ModalInput 
                label="Email" 
                icon="heroicons:envelope-solid" 
                name="email" 
                value={isEditing ? editForm.email : studentInfo?.email} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              <div className="relative">
                <ModalInput 
                  label="Phone Number" 
                  icon="heroicons:phone-solid" 
                  name="tel" 
                  value={isEditing ? editForm.tel : (studentInfo?.tel || "Not Provided")} 
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                {!isEditing && studentInfo?.tel_verified_at && (
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
                value={isEditing ? editForm.department : (studentInfo?.department || student?.department || "Not Provided")} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              <ModalInput 
                label="Date of Birth" 
                icon="heroicons:calendar-solid" 
                name="date_of_birth" 
                type="date"
                value={isEditing ? editForm.date_of_birth : (studentInfo?.date_of_birth ? studentInfo.date_of_birth.split('T')[0] : "Not Provided")} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              <ModalInput 
                label="Gender" 
                icon="ph:gender-male-bold" 
                name="gender"
                isSelect={true}
                options={[{value: 'male', label: 'Male'}, {value: 'female', label: 'Female'}]} 
                value={isEditing ? editForm.gender : (studentInfo?.gender || student?.gender || "Unknown")} 
                onChange={handleInputChange}
                disabled={!isEditing}
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
                value={isEditing ? editForm.location : (studentInfo?.location || "Not Provided")} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              <ModalInput 
                label="Address" 
                icon="heroicons:home-solid" 
                name="address" 
                value={isEditing ? editForm.address : (studentInfo?.address || "Not Provided")} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            {/* GUARDIANS MANAGEMENT SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                  Guardians ({guardiansList.length})
                </label>
                {!isPreview && (
                  <button
                    type="button"
                    onClick={() => setShowGuardianModal(true)}
                    className="px-3 py-1.5 bg-[#0F2843]/10 hover:bg-[#0F2843]/20 dark:bg-white/10 dark:hover:bg-white/20 text-[#0F2843] dark:text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Icon icon="heroicons:plus-solid" className="w-3.5 h-3.5" />
                    Add Guardian
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {guardiansList.length > 0 ? (
                  guardiansList.map((g, idx) => {
                    const relationship = g.pivot?.relationship || g.relationship || "Guardian";
                    return (
                      <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between border border-gray-200/80 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-sm border border-amber-500/30">
                            {g.firstname?.[0]?.toUpperCase() || "G"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-[#0F2843] dark:text-white">{g.firstname} {g.surname}</p>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {relationship}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{g.email || "No Email"} • {g.tel || "No Phone"}</p>
                          </div>
                        </div>

                        {!isPreview && (
                          <button
                            type="button"
                            onClick={() => handleRemoveGuardian(g.id)}
                            disabled={actionLoading}
                            title="Unlink Guardian"
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                          >
                            <Icon icon="heroicons:trash-solid" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 gap-2">
                    <Icon icon="heroicons:user-group" className="w-8 h-8 text-gray-400" />
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">No guardian assigned to this student yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ADVISORS MANAGEMENT SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                  Assigned Advisors ({advisorsList.length})
                </label>
                {!isPreview && (
                  <button
                    type="button"
                    onClick={() => setShowAdvisorModal(true)}
                    className="px-3 py-1.5 bg-[#0F2843]/10 hover:bg-[#0F2843]/20 dark:bg-white/10 dark:hover:bg-white/20 text-[#0F2843] dark:text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Icon icon="heroicons:plus-solid" className="w-3.5 h-3.5" />
                    Assign Advisor
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {advisorsList.length > 0 ? (
                  advisorsList.map((adv, idx) => {
                    const roleBadge = adv.pivot?.role || adv.role || "Advisor";
                    const assignedAt = adv.pivot?.assigned_at ? new Date(adv.pivot.assigned_at).toLocaleDateString() : null;

                    return (
                      <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between border border-gray-200/80 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm border border-purple-500/30">
                            {adv.firstname?.[0]?.toUpperCase() || "A"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-[#0F2843] dark:text-white">{adv.firstname} {adv.surname}</p>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                {roleBadge}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {adv.email || "No Email"} • Staff ID: {adv.staff_id || `#${adv.id}`}
                              {assignedAt && ` • Assigned: ${assignedAt}`}
                            </p>
                          </div>
                        </div>

                        {!isPreview && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAdvisor(adv.id)}
                            disabled={actionLoading}
                            title="Unassign Advisor"
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                          >
                            <Icon icon="heroicons:trash-solid" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 gap-2">
                    <Icon icon="heroicons:academic-cap" className="w-8 h-8 text-gray-400" />
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">No advisor assigned to this student yet.</p>
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
                          const cId = typeof ce === 'object' ? (ce?.course_id || ce?.id) : ce;
                          const foundCourse = allCourses.find(c => String(c.id) === String(cId) || String(c.course_id) === String(cId));
                          const courseName = ce?.title || ce?.name || ce?.course?.title || ce?.course?.name || foundCourse?.title || foundCourse?.name || `Course #${cId}`;
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
                          const sId = typeof sub === 'object' ? (sub?.subject_id || sub?.id) : sub;
                          const foundSubject = allSubjects.find(s => String(s.id) === String(sId) || String(s.subject_id) === String(sId));
                          const subName = sub?.title || sub?.name || sub?.subject?.title || sub?.subject?.name || sub?.subject_name || foundSubject?.title || foundSubject?.name || `Subject #${sId}`;
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
                value={isSuspended ? "Suspended" : (student?.account_status || "Active").toUpperCase()} 
                disabled={true}
                className={isSuspended ? "text-red-500" : "text-green-500"}
              />
            </div>

            {/* Payments & Recovery */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Payments & Recovery</label>
              <StudentPaymentsRecovery 
                studentEmail={student?.email} 
                studentId={studentId} 
                API_BASE_URL={API_BASE_URL} 
                token={token} 
                apiPrefix={apiPrefix} 
                isPreview={isPreview} 
              />
            </div>
          </div>
        </div>

        {/* Footer Area with Action Buttons */}
        <div className="px-8 pb-8 flex items-center gap-4">
          <button 
            onClick={() => isEditing ? setIsEditing(false) : onClose()}
            className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black text-sm uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isEditing ? "Cancel Edit" : "Close View"}
          </button>
          
          {!isPreview && staffRole !== "advisor" && (
            <button 
              onClick={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
              disabled={submitting}
              className="flex-1 py-4 bg-[#0F2843] dark:bg-white text-white dark:text-[#0F2843] font-black text-sm uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {submitting ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          )}
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

      {/* MODAL: ADD / LINK GUARDIAN */}
      {showGuardianModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#131320] w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F2843] text-white flex items-center justify-center">
                  <Icon icon="heroicons:user-group-solid" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Add Guardian</h3>
                  <p className="text-[11px] text-gray-400 font-bold">Link or register a guardian for {studentInfo?.firstname}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGuardianModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <Icon icon="heroicons:x-mark-20-solid" className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
              <button
                type="button"
                onClick={() => setGuardianMode("existing")}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  guardianMode === "existing"
                    ? "bg-[#0F2843] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Select Existing
              </button>
              <button
                type="button"
                onClick={() => setGuardianMode("new")}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  guardianMode === "new"
                    ? "bg-[#0F2843] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Create New
              </button>
            </div>

            <form onSubmit={handleAddGuardian} className="space-y-4">
              {guardianMode === "existing" ? (
                <div>
                  <label className="text-[11px] font-bold text-gray-400 ml-1 block mb-1.5">Choose Registered Guardian</label>
                  <select
                    value={selectedGuardianId}
                    onChange={(e) => setSelectedGuardianId(e.target.value)}
                    required
                    className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                  >
                    <option value="" disabled>Select guardian from directory...</option>
                    {allGuardians.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.firstname} {g.surname} ({g.email || g.tel || `#${g.id}`})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">First Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Adebayo"
                        required
                        value={newGuardianForm.firstname}
                        onChange={(e) => setNewGuardianForm(prev => ({ ...prev, firstname: e.target.value }))}
                        className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">Surname *</label>
                      <input
                        type="text"
                        placeholder="e.g. Ogunlesi"
                        required
                        value={newGuardianForm.surname}
                        onChange={(e) => setNewGuardianForm(prev => ({ ...prev, surname: e.target.value }))}
                        className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. guardian@example.com"
                        value={newGuardianForm.email}
                        onChange={(e) => setNewGuardianForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 08012345678"
                        value={newGuardianForm.tel}
                        onChange={(e) => setNewGuardianForm(prev => ({ ...prev, tel: e.target.value }))}
                        className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">Gender *</label>
                      <select
                        value={newGuardianForm.gender}
                        onChange={(e) => setNewGuardianForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={newGuardianForm.date_of_birth}
                        onChange={(e) => setNewGuardianForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">Location (State/Country)</label>
                      <input
                        type="text"
                        placeholder="e.g. Lagos, Nigeria"
                        value={newGuardianForm.location}
                        onChange={(e) => setNewGuardianForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">Residential Address</label>
                      <input
                        type="text"
                        placeholder="e.g. 12 Broad Street, Ikeja"
                        value={newGuardianForm.address}
                        onChange={(e) => setNewGuardianForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-gray-400 ml-1 block mb-1.5">Relationship to Student</label>
                <select
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value)}
                  className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                >
                  <option value="parent">Parent</option>
                  <option value="relative">Relative</option>
                  <option value="other">Other / Guardian</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowGuardianModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black text-xs uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-[#0F2843] hover:bg-[#09314F] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading ? "Linking..." : "Link Guardian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN ADVISOR */}
      {showAdvisorModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#131320] w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Icon icon="heroicons:academic-cap-solid" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Assign Advisor</h3>
                  <p className="text-[11px] text-gray-400 font-bold">Assign an academic advisor to {studentInfo?.firstname}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAdvisorModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <Icon icon="heroicons:x-mark-20-solid" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignAdvisor} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 ml-1 block mb-1.5">Select Advisor</label>
                <select
                  value={selectedAdvisorId}
                  onChange={(e) => setSelectedAdvisorId(e.target.value)}
                  required
                  className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                >
                  <option value="" disabled>Choose advisor from staff directory...</option>
                  {allAdvisors.map((adv) => (
                    <option key={adv.id} value={adv.id}>
                      {adv.firstname} {adv.surname} ({adv.email || `Staff ID: ${adv.staff_id}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 ml-1 block mb-1.5">Advisory Role Designation</label>
                <input
                  type="text"
                  value={advisorRole}
                  onChange={(e) => setAdvisorRole(e.target.value)}
                  placeholder="e.g. Primary Advisor, Career Advisor"
                  className="w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#0F2843] outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAdvisorModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black text-xs uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading ? "Assigning..." : "Assign Advisor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}