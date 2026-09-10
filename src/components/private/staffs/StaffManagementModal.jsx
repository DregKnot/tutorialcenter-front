import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { 
  // XMarkIcon,
  // CheckCircleIcon,
  // ArrowPathIcon
} from "@heroicons/react/24/outline";

/**
 * Reusable input for the staff profile matching the reference image style
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
  error,
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
            className={`w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border ${error ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-xl pl-12 pr-10 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#0F2843]/10 dark:focus:ring-white/10 focus:border-[#0F2843] dark:focus:border-gray-400 transition-all appearance-none disabled:bg-gray-50/50 dark:disabled:bg-gray-800/50`}
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
            className={`w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border ${error ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-xl pl-12 pr-10 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#0F2843]/10 dark:focus:ring-white/10 focus:border-[#0F2843] dark:focus:border-gray-400 transition-all disabled:bg-gray-50/50 dark:disabled:bg-gray-800/50`}
          />
        )}

        {/* Right side icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSelect ? (
            <Icon icon="heroicons:chevron-down" className="w-4 h-4 text-gray-400" />
          ) : (
            <Icon icon="lucide:square-pen" className="w-4 h-4 text-gray-300 group-hover/input:text-gray-400 transition-colors" />
          )}
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-red-500 font-bold ml-1">{error}</p>
      )}
    </div>
  );
};

export default function StaffManagementModal({ staffId, onClose, onSuccess }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [staffClasses, setStaffClasses] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const token = localStorage.getItem("staff_token");

  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch full staff details & classes
  const fetchStaffDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [res, classesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/staffs/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/admin/classes/all`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        }).catch(err => ({ data: { classes: [] } }))
      ]);

      const data = res.data?.staff || res.data?.data || res.data;
      setStaff(data);
      if (data.profile_picture && data.profile_picture !== "default-avatar.png") {
        setImagePreview(`${API_BASE_URL}/storage/${data.profile_picture}`);
      } else {
        setImagePreview(null);
      }

      // Filter classes to find only the ones associated with this staff ID
      const allFetchedClasses = classesRes.data?.classes || classesRes.data?.data || [];
      const staffsClasses = allFetchedClasses.filter(cls => 
        cls.staffs?.some(s => String(s.id) === String(data.id) || String(s.staff_id) === String(data.staff_id))
      );
      
      setStaffClasses(staffsClasses);
    } catch (error) {
      console.error("Failed to fetch staff details", error);
      setToast({ type: "error", message: "Failed to load staff details" });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, staffId, token]);

  useEffect(() => {
    if (staffId) fetchStaffDetails();
  }, [staffId, fetchStaffDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2048 * 1024) {
        setErrors(prev => ({ ...prev, profile_picture: "Image size must not exceed 2MB." }));
        setToast({ type: "error", message: "Image size must not exceed 2MB." });
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, profile_picture: "Please select a JPG or PNG image." }));
        setToast({ type: "error", message: "Please select a JPG or PNG image." });
        return;
      }
      setStaff(prev => ({ ...prev, profile_picture: file }));
      setImagePreview(URL.createObjectURL(file));
      setIsEditing(true);
      if (errors.profile_picture) {
        setErrors(prev => ({ ...prev, profile_picture: null }));
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isEditing) return;
    
    setSubmitting(true);

    const data = new FormData();
    data.append("_method", "PUT");

    Object.keys(staff).forEach(key => {
      const value = staff[key];
      if (key === "profile_picture") {
        if (value instanceof File) {
          data.append(key, value);
        }
      } else if (
        value !== null && 
        value !== undefined && 
        value !== "" && 
        key !== "staff_id" && 
        typeof value !== "object"
      ) {
        data.append(key, value);
      }
    });

    // Log the payload to debug what is being sent to the backend
    console.log("Updating Staff Payload:", Object.fromEntries(data.entries()));

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/staffs/update/${staffId}`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setToast({ type: "success", message: res.data.message || "Staff updated successfully" });
      setIsEditing(false); // Exit edit mode on success
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
      setToast({ type: "error", message: error.response?.data?.message || "Update failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!window.confirm("Are you sure you want to suspend this staff member?")) return;
    setSubmitting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/staffs/destroy/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Staff suspended successfully" });
      fetchStaffDetails(); // Refresh to show "dimmed" state
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      setToast({ type: "error", message: "Failed to suspend staff" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestore = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/admin/staffs/restore/${staffId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Staff restored successfully" });
      fetchStaffDetails();
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      setToast({ type: "error", message: "Failed to restore staff" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-[#131320] rounded-3xl p-12 text-center shadow-2xl">
        <div className="w-12 h-12 border-4 border-[#0F2843]/20 dark:border-white/20 border-t-[#0F2843] dark:border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    </div>
  );

  const isSuspended = staff?.deleted_at !== null;

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              STAFF PROFILE: {staff.firstname} {staff.middlename ? `${staff.middlename} ` : ""}{staff.surname}
            </h1>
          </div>

          {/* Verification Badges & Metadata Strip */}
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-5 border-b border-gray-100 dark:border-gray-800">
            {/* Email Verification Badge */}
            {staff.email_verified_at ? (
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                title={`Verified: ${new Date(staff.email_verified_at).toLocaleString()}`}
              >
                <Icon icon="heroicons:check-badge-solid" className="w-4 h-4 text-green-600 dark:text-green-400" />
                Email Verified ({new Date(staff.email_verified_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Icon icon="heroicons:exclamation-circle-solid" className="w-4 h-4 text-amber-500" />
                Email Unverified
              </span>
            )}

            {/* Phone Verification Badge */}
            {staff.tel_verified_at ? (
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                title={`Verified: ${new Date(staff.tel_verified_at).toLocaleString()}`}
              >
                <Icon icon="heroicons:check-badge-solid" className="w-4 h-4 text-green-600 dark:text-green-400" />
                Phone Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                <Icon icon="heroicons:phone-solid" className="w-4 h-4 text-gray-400" />
                Phone Unverified
              </span>
            )}

            {/* Date Joined */}
            {staff.created_at && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-[#0F2843] dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                <Icon icon="heroicons:calendar-days-solid" className="w-4 h-4 text-blue-500" />
                Joined: {new Date(staff.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}

            {/* Inducted By */}
            {staff.inducted_by && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Icon icon="heroicons:user-circle-solid" className="w-4 h-4 text-purple-500" />
                Inducted by: {staff.inducted_by}
              </span>
            )}
          </div>

          {/* Top Section: Avatar + Primary Fields */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
            {/* Avatar Selection */}
            <div className="w-44 shrink-0 flex flex-col items-center">
              <div 
                className="w-44 h-44 shrink-0 relative cursor-pointer group"
                onClick={() => !isSuspended && fileInputRef.current?.click()}
              >
                <div className="w-full h-full rounded-[20px] overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative">
                  {imagePreview ? (
                    <img 
                      src={imagePreview}
                      className="w-full h-full object-cover"
                      alt="Profile" 
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0F2843] dark:bg-gray-700 text-white flex items-center justify-center text-5xl font-black">
                      {(staff.firstname?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon icon="heroicons:camera" className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  hidden 
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png" 
                  onClick={(e) => e.stopPropagation()}
                  onChange={handleImageChange} 
                />
                {!isSuspended && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#0F2843] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-[#BB9E7F] hover:scale-105 active:scale-95 transition-all z-20"
                    title="Edit Profile Picture"
                  >
                    <Icon icon="lucide:pencil" className="w-4 h-4" />
                  </button>
                )}
                {isSuspended && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                    Suspended
                  </div>
                )}
              </div>
              {errors.profile_picture && (
                <p className="text-[11px] text-red-500 font-bold mt-2 text-center w-full">{errors.profile_picture}</p>
              )}
            </div>

            {/* Name/Email/Phone Inputs (2 columns inside) */}
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-4">
              <ModalInput 
                label="First Name" 
                icon="heroicons:user-solid" 
                name="firstname" 
                value={staff.firstname} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="First Name"
                error={errors.firstname}
              />
              <ModalInput 
                label="Last Name" 
                icon="heroicons:user-solid" 
                name="surname" 
                value={staff.surname} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="Surname"
                error={errors.surname}
              />
              <ModalInput 
                label="Middle Name" 
                icon="heroicons:user-solid" 
                name="middlename" 
                value={staff.middlename} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="Middle Name"
                error={errors.middlename}
              />
              <ModalInput 
                label="Email" 
                icon="heroicons:envelope-solid" 
                name="email" 
                value={staff.email} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="Email Address"
                error={errors.email}
              />
              <ModalInput 
                label="Telephone / Mobile" 
                icon="heroicons:phone-solid" 
                name="tel" 
                value={staff.tel || ""} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="08012345678"
                error={errors.tel}
              />
              <ModalInput 
                label="Gender" 
                icon="ph:gender-male-bold" 
                name="gender" 
                value={staff.gender} 
                onChange={handleChange} 
                disabled={!isEditing}
                isSelect={true}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Others", value: "others" }
                ]}
                error={errors.gender}
              />
            </div>
          </div>

          {/* Grid Section for secondary details */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-4">
              <ModalInput 
                label="Date of Birth" 
                icon="heroicons:calendar-days-solid" 
                name="date_of_birth" 
                value={staff.date_of_birth ? staff.date_of_birth.split('T')[0] : ""} 
                onChange={handleChange} 
                disabled={!isEditing}
                type="date"
                error={errors.date_of_birth}
              />
              <ModalInput 
                label="Role" 
                icon="heroicons:user-group-solid" 
                name="role" 
                value={staff.role} 
                onChange={handleChange} 
                disabled={!isEditing}
                isSelect={true}
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "Chief Operating Officer (COO)", value: "coo" },
                  { label: "Tutor", value: "tutor" },
                  { label: "Course Advisor", value: "advisor" },
                  { label: "Moderator", value: "moderator" }
                ]}
                error={errors.role}
              />
            </div>

            {/* Status & Location */}
            <div className="grid grid-cols-2 gap-x-4">
              <ModalInput 
                label="Status" 
                icon="heroicons:user-group-solid" 
                name="status" 
                value={isSuspended ? "suspended" : "active"} 
                disabled={true}
                isSelect={true}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Suspended", value: "suspended" }
                ]}
                className={isSuspended ? "text-red-500" : "text-green-500"}
              />

              <ModalInput 
                label="Location" 
                icon="heroicons:map-pin-solid" 
                name="location" 
                value={staff.location} 
                onChange={handleChange} 
                disabled={!isEditing}
                isSelect={true}
                placeholder="select location"
                options={[
                    { label: "Lagos", value: "Lagos" },
                    { label: "Abuja", value: "Abuja" },
                    { label: "Port Harcourt", value: "Port Harcourt" }
                ]}
                error={errors.location}
              />
            </div>

            {/* Teaching Info (Classes) - Rich Cards Display */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Assigned Classes ({staffClasses.length})
                </label>
                {staffClasses.length > 0 && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#0F2843]/10 dark:bg-white/10 text-[#0F2843] dark:text-[#C5A97A]">
                    {staffClasses.length} {staffClasses.length === 1 ? "Class" : "Classes"}
                  </span>
                )}
              </div>
              
              {staffClasses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  {staffClasses.map((cls, idx) => (
                    <div 
                      key={cls.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 shadow-sm hover:border-[#0F2843]/30 dark:hover:border-[#C5A97A]/40 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#0F2843]/10 dark:bg-[#C5A97A]/20 flex items-center justify-center text-[#0F2843] dark:text-[#C5A97A] font-bold shrink-0">
                          <Icon icon="heroicons:academic-cap-solid" className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-800 dark:text-gray-100 truncate">
                            {cls.title}
                          </p>
                          <p className="text-[10px] text-gray-400 font-semibold truncate">
                            {cls.subject?.name || cls.class_type || "Standard Class"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-200 dark:border-emerald-800">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-xs font-semibold text-gray-400">No active classes assigned to this staff member.</p>
                </div>
              )}
            </div>

            {/* Home Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 ml-1">Home Address</label>
              <textarea 
                name="address"
                value={staff.address || ""}
                onChange={handleChange}
                disabled={!isEditing}
                rows={2}
                placeholder="Full Home Address"
                className={`w-full bg-[#fcfcfc] dark:bg-[#1a1a2e] border ${errors.address ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#0F2843]/10 dark:focus:ring-white/10 focus:border-[#0F2843] dark:focus:border-gray-400 transition-all disabled:bg-gray-50/50 dark:disabled:bg-gray-800/50 resize-none`}
              />
              {errors.address && (
                <p className="text-[11px] text-red-500 font-bold ml-1">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Area with Action Buttons */}
        <div className="px-8 pb-8 flex items-center gap-4">
          {/* Left Action: Back/Suspend */}
          <button 
            onClick={isEditing ? () => { setIsEditing(false); setErrors({}); setImagePreview(null); fetchStaffDetails(); } : onClose}
            className="flex-1 py-4 bg-[#E83831] text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isEditing ? "Cancel" : "Back"}
          </button>

          {/* Right Action: Save/Edit */}
          <button 
            type="button"
            onClick={(e) => {
              if (isEditing) {
                handleUpdate(e);
              } else {
                setIsEditing(true);
              }
            }}
            disabled={submitting}
            className="flex-1 py-4 bg-[#0F2843] dark:bg-white text-white dark:text-[#0F2843] font-black text-sm uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
                isEditing ? "Save Changes" : "Edit Profile"
            )}
          </button>
        </div>

        {/* Suspend/Restore Logic (Floating Button Overlay) */}
        {!isEditing && (
            <button 
                onClick={isSuspended ? handleRestore : handleSuspend}
                className={`absolute top-8 right-8 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm transition-all active:scale-95 ${
                  isSuspended 
                    ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:shadow-md" 
                    : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:shadow-md"
                }`}
            >
                {isSuspended ? "Restore Staff" : "Suspend Staff"}
            </button>
        )}
      </div>
    </div>
  );
}
