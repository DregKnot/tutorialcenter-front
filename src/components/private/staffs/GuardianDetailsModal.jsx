import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { BookOpenIcon as BookOpenSolid } from "@heroicons/react/24/solid";

export default function GuardianDetailsModal({ guardian, isOpen, onClose, onViewStudent }) {
  const [copiedField, setCopiedField] = useState(null);
  const [guardianData, setGuardianData] = useState(guardian || null);
  const [fetchingFresh, setFetchingFresh] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test" ||
    "http://localhost:8000";

  const storageBaseUrl = API_BASE_URL.replace("/api", "");
  const token = localStorage.getItem("staff_token");
  const staffRole = (localStorage.getItem("staff_role") || "").toLowerCase();
  const isAdvisor = staffRole === "advisor" || staffRole === "course_advisor" || staffRole === "course advisor";
  const apiPrefix = isAdvisor ? "advisor" : "admin";

  // When guardian prop changes or modal opens, sync state and fetch full fresh data by ID
  const fetchFreshData = useCallback(async (guardianId) => {
    if (!guardianId) return;
    setFetchingFresh(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/${apiPrefix}/guardians/${guardianId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.guardian) {
        setGuardianData(res.data.guardian);
      }
    } catch (err) {
      console.warn("Could not fetch fresh guardian detail, using list data:", err);
    } finally {
      setFetchingFresh(false);
    }
  }, [API_BASE_URL, apiPrefix, token]);

  useEffect(() => {
    if (guardian) {
      setGuardianData(guardian);
      if (guardian.id) {
        fetchFreshData(guardian.id);
      }
    }
  }, [guardian, fetchFreshData]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !guardianData) return null;

  const displayName =
    guardianData.firstname && guardianData.surname
      ? `${guardianData.firstname} ${guardianData.surname}`.trim()
      : guardianData.firstname || guardianData.surname || "Unnamed Guardian";

  const wards = guardianData.students || [];

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#131320] w-full max-w-4xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 dark:border-gray-800 text-[#0F2843] dark:text-gray-100 font-sans my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-[#09314F] to-[#0F2843] text-white p-6 md:p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all focus:outline-none"
            title="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Guardian Avatar */}
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                {guardianData.profile_picture ? (
                  <img
                    src={`${storageBaseUrl}/storage/${guardianData.profile_picture}`}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl md:text-4xl font-black text-[#BB9E7F]">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {guardianData.email_verified_at && (
                <div
                  className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full shadow-md"
                  title="Email Verified"
                >
                  <CheckBadgeIcon className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Title & Key Metas */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#BB9E7F]/20 text-[#BB9E7F] border border-[#BB9E7F]/30">
                  Guardian Account
                </span>
                {guardianData.email_verified_at ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                    <CheckBadgeIcon className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    Pending Verification
                  </span>
                )}
                {fetchingFresh && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-gray-300 animate-pulse">
                    <ArrowPathIcon className="w-3 h-3 animate-spin" /> Syncing...
                  </span>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white truncate" title={displayName}>
                {displayName}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-300">
                {guardianData.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <EnvelopeIcon className="w-4 h-4 text-[#BB9E7F]" />
                    <span>{guardianData.email}</span>
                  </div>
                )}
                {guardianData.tel && (
                  <div className="flex items-center gap-1.5">
                    <PhoneIcon className="w-4 h-4 text-[#BB9E7F]" />
                    <span>{guardianData.tel}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <UsersIcon className="w-4 h-4 text-[#BB9E7F]" />
                  <span>{wards.length} Ward{wards.length === 1 ? "" : "s"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Section 1: Guardian Biodata */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#09314F] dark:text-[#BB9E7F] flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Guardian Biodata
              </h3>
              <span className="text-[11px] font-semibold text-gray-400">
                Registered: {formatDate(guardianData.created_at)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* First Name */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">First Name</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {guardianData.firstname || "Not provided"}
                </p>
              </div>

              {/* Surname */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Surname / Last Name</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {guardianData.surname || "Not provided"}
                </p>
              </div>

              {/* Gender */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                <p className="text-sm font-bold capitalize text-gray-800 dark:text-gray-100">
                  {guardianData.gender || "Not specified"}
                </p>
              </div>

              {/* Email */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                    {guardianData.email_verified_at && (
                      <CheckBadgeIcon className="w-3.5 h-3.5 text-green-500 -mt-1" title="Email verified" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate" title={guardianData.email}>
                    {guardianData.email || "Not provided"}
                  </p>
                </div>
                {guardianData.email && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(guardianData.email, "email")}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Copy Email"
                    >
                      {copiedField === "email" ? (
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`mailto:${guardianData.email}`}
                      className="p-1.5 text-[#09314F] dark:text-[#BB9E7F] hover:opacity-80"
                      title="Send Email"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                    {guardianData.tel_verified_at && (
                      <CheckBadgeIcon className="w-3.5 h-3.5 text-green-500 -mt-1" title="Phone verified" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                    {guardianData.tel || "Not provided"}
                  </p>
                </div>
                {guardianData.tel && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(guardianData.tel, "tel")}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Copy Phone"
                    >
                      {copiedField === "tel" ? (
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`tel:${guardianData.tel}`}
                      className="p-1.5 text-[#09314F] dark:text-[#BB9E7F] hover:opacity-80"
                      title="Call"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  {formatDate(guardianData.date_of_birth)}
                </p>
              </div>

              {/* Location */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">State / Location</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5 truncate">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  {guardianData.location || "Not specified"}
                </p>
              </div>

              {/* Residential Address */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-100 dark:border-gray-800 sm:col-span-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Residential Address</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {guardianData.address || "Not provided"}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Linked Wards */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#09314F] dark:text-[#BB9E7F] flex items-center gap-2">
                <AcademicCapIcon className="w-4 h-4" /> Linked Wards / Students ({wards.length})
              </h3>
            </div>

            {wards.length === 0 ? (
              <div className="p-8 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <UsersIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">No Wards Linked</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  This guardian does not have any students associated with their account yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {wards.map((ward, wIdx) => {
                  const wardName =
                    ward.firstname && ward.surname
                      ? `${ward.firstname} ${ward.surname}`.trim()
                      : ward.firstname || ward.surname || `Student #${ward.id}`;

                  const enrollments = ward.course_enrollments || ward.courseEnrollments || [];
                  const relationship =
                    ward.pivot?.relationship ||
                    ward.relationship ||
                    "Ward";

                  return (
                    <div
                      key={ward.id || wIdx}
                      className="bg-gray-50/70 dark:bg-[#1a1a2e] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm space-y-4"
                    >
                      {/* Ward Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60 dark:border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#09314F] text-white flex items-center justify-center font-black text-sm uppercase flex-shrink-0 shadow-sm">
                            {ward.profile_picture ? (
                              <img
                                src={`${storageBaseUrl}/storage/${ward.profile_picture}`}
                                alt={wardName}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              (wardName || "S").charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-base text-[#09314F] dark:text-white">
                                {wardName}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#BB9E7F]/15 text-[#BB9E7F] border border-[#BB9E7F]/30">
                                {relationship}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              ID: #{ward.id} • Dept:{" "}
                              <span className="font-bold text-gray-700 dark:text-gray-200 capitalize">
                                {ward.department || "General"}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Quick Student View Action if provided */}
                        {onViewStudent && (
                          <button
                            type="button"
                            onClick={() => onViewStudent(ward.id)}
                            className="self-start sm:self-center px-3 py-1.5 bg-white dark:bg-gray-800 text-[#09314F] dark:text-[#BB9E7F] hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <UserIcon className="w-3.5 h-3.5" /> View Profile
                          </button>
                        )}
                      </div>

                      {/* Ward Biodata Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/40">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate text-gray-700 dark:text-gray-300 font-medium" title={ward.email}>
                            {ward.email || "No email"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/40">
                          <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate text-gray-700 dark:text-gray-300 font-medium">
                            {ward.tel || "No phone"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/40">
                          <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate text-gray-700 dark:text-gray-300 font-medium">
                            {ward.location || ward.address || "Location not set"}
                          </span>
                        </div>
                      </div>

                      {/* Academic Enrollments & Subjects */}
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                          <BookOpenIcon className="w-3.5 h-3.5" /> Enrolled Courses & Subjects ({enrollments.length})
                        </p>

                        {enrollments.length === 0 ? (
                          <div className="p-3 bg-white/60 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/30 text-xs text-gray-400 font-medium">
                            No active courses enrolled yet.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {enrollments.map((enr, eIdx) => {
                              const course = enr.course || {};
                              const courseSubjects = enr.subjects || enr.subjectsEnrollments || enr.subject_enrollments || [];
                              const isActive = enr.status === "active";

                              return (
                                <div
                                  key={enr.id || eIdx}
                                  className="p-3.5 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
                                >
                                  {/* Course Title & Status */}
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-bold text-sm text-[#09314F] dark:text-white truncate">
                                        {course.name || course.title || `Course #${enr.course_id || enr.id}`}
                                      </span>
                                      {enr.billing_cycle && (
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                          ({enr.billing_cycle})
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                        isActive
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {enr.status || "enrolled"}
                                    </span>
                                  </div>

                                  {/* Subjects List */}
                                  {courseSubjects.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {courseSubjects.map((subItem, sIdx) => {
                                        const sub = subItem.subject || subItem;
                                        const subTitle = sub.name || sub.title || `Subject #${sub.id || subItem.subject_id}`;
                                        return (
                                          <span
                                            key={subItem.id || sIdx}
                                            className="px-2.5 py-1 bg-[#BB9E7F]/10 text-[#BB9E7F] dark:text-[#d4b592] rounded-lg text-xs font-bold border border-[#BB9E7F]/20 flex items-center gap-1"
                                          >
                                            <BookOpenSolid className="w-3 h-3 text-[#BB9E7F]" />
                                            {subTitle}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-gray-400 italic">No specific subjects listed under this course.</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Footer Area */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#131320] border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#09314F] hover:bg-[#0F2843] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all active:scale-95 cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
