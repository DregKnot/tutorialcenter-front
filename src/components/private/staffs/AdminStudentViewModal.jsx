import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  BookOpenIcon,
  // CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  LinkIcon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

export default function CreateMasterClassModal({ onClose, onSuccess }) {
  /* =============================
      CONSTANTS
  ============================= */
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  const token = localStorage.getItem("staff_token");

  const weekDays = [
    { label: "Su", value: "sunday" },
    { label: "Mo", value: "monday" },
    { label: "Tu", value: "tuesday" },
    { label: "We", value: "wednesday" },
    { label: "Th", value: "thursday" },
    { label: "Fr", value: "friday" },
    { label: "Sa", value: "saturday" },
  ];

  /* =============================
      STATE
  ============================= */
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [assistants, setAssistants] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [courseSearch, setCourseSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");
  const [assistantSearch, setAssistantSearch] = useState("");

  const [courseFocused, setCourseFocused] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [tutorFocused, setTutorFocused] = useState(false);
  const [assistantFocused, setAssistantFocused] = useState(false);

  const [selectedTutors, setSelectedTutors] = useState([]);
  const [selectedAssistants, setSelectedAssistants] = useState([]);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const dateContainerRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({
    course_id: "",
    subject_id: "",
    title: "",
    start_date: "",
    end_date: "",
    tutor_ids: [],
    assistant_ids: [],
    link: "",
    status: "active",
    description: "",
  });

  const [daySchedules, setDaySchedules] = useState([
    { day: "monday", start_time: "12:00", end_time: "12:30" },
  ]);

  /* =============================
      API CALLS
  ============================= */
  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses`);
      const fetched = res.data?.courses || res.data?.data || [];
      setCourses(fetched);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  }, [API_BASE_URL]);

  const fetchSubjects = useCallback(async (courseId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses/${courseId}/subjects`);
      const fetched = res.data?.subjects || res.data?.data || [];
      setSubjects(fetched);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
      setSubjects([]);
    }
  }, [API_BASE_URL]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/staffs/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetched = res.data?.staffs || res.data?.data || [];
      setTutors(fetched.filter((s) => s.role === "tutor"));
      setAssistants(fetched.filter((s) => s.role === "advisor"));
    } catch (error) {
      console.error("Failed to fetch staff", error);
    }
  }, [API_BASE_URL, token]);

  /* =============================
      EFFECTS
  ============================= */
  useEffect(() => {
    fetchCourses();
    fetchStaff();

    const handleClickOutside = (event) => {
      if (dateContainerRef.current && !dateContainerRef.current.contains(event.target)) {
        startDateRef.current?.blur();
        endDateRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchCourses, fetchStaff]);

  useEffect(() => {
    if (formData.course_id) {
      fetchSubjects(formData.course_id);
    } else {
      setSubjects([]);
    }
  }, [formData.course_id, fetchSubjects]);

  useEffect(() => {
    if (selectedCourse && selectedSubject) {
      const generatedTitle = `${selectedCourse.title || selectedCourse.name} - ${selectedSubject.name}`;
      setFormData((prev) => ({
        ...prev,
        title: generatedTitle,
      }));
    }
  }, [selectedCourse, selectedSubject]);

  /* =============================
      INPUT HANDLERS
  ============================= */
  const handleCourseSearchChange = (e) => {
    const value = e.target.value;
    setCourseSearch(value);
    
    if (selectedCourse) {
      setSelectedCourse(null);
      setSubjects([]);
      setFormData((prev) => ({
        ...prev,
        course_id: "",
        subject_id: "",
        title: "",
      }));
      setSubjectSearch("");
      setSelectedSubject(null);
    }
  };

  const handleSubjectSearchChange = (e) => {
    const value = e.target.value;
    setSubjectSearch(value);
    
    if (selectedSubject) {
      setSelectedSubject(null);
      setFormData((prev) => ({
        ...prev,
        subject_id: "",
        title: "",
      }));
    }
  };

  const selectTutor = (staff) => {
    if (!formData.tutor_ids.includes(staff.id)) {
      setFormData((prev) => ({
        ...prev,
        tutor_ids: [...prev.tutor_ids, staff.id],
      }));
      setSelectedTutors((prev) => [...prev, staff]);
    }
    setTutorSearch("");
    setTutorFocused(false);
    if (errors.tutor_ids) setErrors((prev) => ({ ...prev, tutor_ids: null }));
  };

  const selectAssistant = (staff) => {
    if (!formData.assistant_ids.includes(staff.id)) {
      setFormData((prev) => ({
        ...prev,
        assistant_ids: [...prev.assistant_ids, staff.id],
      }));
      setSelectedAssistants((prev) => [...prev, staff]);
    }
    setAssistantSearch("");
    setAssistantFocused(false);
  };

  const removeStaff = (id, field) => {
    if (field === "tutor_ids") {
      setFormData((prev) => ({ ...prev, tutor_ids: prev.tutor_ids.filter((i) => i !== id) }));
      setSelectedTutors((prev) => prev.filter((s) => s.id !== id));
    } else {
      setFormData((prev) => ({ ...prev, assistant_ids: prev.assistant_ids.filter((i) => i !== id) }));
      setSelectedAssistants((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  /* =============================
      SCHEDULE HANDLERS
  ============================= */
  const toggleDay = (dayValue) => {
    const existingIndex = daySchedules.findIndex((s) => s.day === dayValue);
    if (existingIndex !== -1) {
      setDaySchedules(daySchedules.filter((s) => s.day !== dayValue));
    } else {
      setDaySchedules([
        ...daySchedules,
        { day: dayValue, start_time: "12:00", end_time: "12:30" },
      ]);
    }
    if (errors.days) setErrors((prev) => ({ ...prev, days: null }));
  };

  const handleTimeChange = (day, field, value) => {
    setDaySchedules((prev) =>
      prev.map((s) => (s.day === day ? { ...s, [field]: value } : s))
    );
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 60;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let diff = endH * 60 + endM - (startH * 60 + startM);
    return diff > 0 ? diff : 60;
  };

  /* =============================
      FORM VALIDATION
  ============================= */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.course_id) newErrors.course_id = "Course selection is required";
    if (!formData.subject_id) newErrors.subject_id = "Subject selection is required";
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.start_date) newErrors.start_date = "Start date required";
    if (!formData.end_date) newErrors.end_date = "End date required";
    if (!formData.link?.trim()) newErrors.link = "Meeting link is required";
    if (formData.link && !/^https?:\/\/.+/.test(formData.link)) {
      newErrors.link = "Please enter a valid URL (e.g., https://...)";
    }
    if (formData.tutor_ids.length === 0) newErrors.tutor_ids = "At least one tutor is required";
    if (daySchedules.length === 0) newErrors.days = "Select schedule days";

    setErrors(newErrors);
    return newErrors; // Return direct reference object to avoid async batch state lag
  };

  /* =============================
      SUBMIT
  ============================= */
 const handleSubmit = async (e) => {
  e.preventDefault();
  setApiError(null);

  // 1. Run frontend validation to make sure state is actually full
  const currentErrors = validateForm();
  if (Object.keys(currentErrors).length > 0) {
    console.error("Frontend validation blocked submission:", currentErrors);
    const scrollContainer = document.querySelector(".flex-1.overflow-y-auto");
    if (scrollContainer) scrollContainer.scrollTop = 0;
    return;
  }

  setLoading(true);

  // 2. Build out a bulletproof payload mapping everything both ways
  const staffsArray = [
    ...formData.tutor_ids.map((id) => ({ staff_id: Number(id), role: "lead" })),
    ...formData.assistant_ids.map((id) => ({ staff_id: Number(id), role: "assistant" })),
  ];

  const schedulesArray = daySchedules
    .filter((s) => s.day && s.start_time && s.end_time)
    .map((s) => ({
      day_of_week: s.day.toLowerCase(),
      start_time: s.start_time,
      duration_minutes: Number(calculateDuration(s.start_time, s.end_time)),
    }));

  const payload = {
    // Pass IDs both flat AND nested so Laravel finds what it wants
    course_id: Number(formData.course_id), 
    subject_id: Number(formData.subject_id),
    tutor_ids: formData.tutor_ids.map(Number),       // Flat array fallback
    assistant_ids: formData.assistant_ids.map(Number), // Flat array fallback
    staffs: staffsArray,                              // Nested array fallback
    
    title: formData.title.trim(),
    description: formData.description || "No description",
    status: formData.status,
    class_link: formData.link, // Standard database naming
    link: formData.link,       // Request fallback naming
    start_date: formData.start_date,
    end_date: formData.end_date,
    schedules: schedulesArray,
  };

  // 3. CRITICAL DEBUGGER: Look at your console to see exactly what is flying out
  console.log("🚀 FLYING OUT TO BACKEND:", payload);

  try {
    const res = await axios.post(`${API_BASE_URL}/api/admin/classes/create`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 201 || res.status === 200) {
      onSuccess(res.data);
    }
  } catch (error) {
    // 4. CRITICAL DEBUGGER: Print the exact response your server is screaming back
    console.error("❌ SERVER REJECTED PAYLOAD. RESPONSE DATA:", error.response?.data);

    if (error.response?.data?.errors) {
      const formatted = {};
      Object.entries(error.response.data.errors).forEach(([k, v]) => {
        const errorKey = k === "class_link" ? "link" : k;
        formatted[errorKey] = v[0];
      });
      setErrors(formatted);
    } else {
      setApiError(error.response?.data?.message || "Server error occurred");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Master Class</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Global Error */}
        {apiError && (
          <div className="flex-shrink-0 mx-8 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 rounded-xl text-sm">
            {apiError}
          </div>
        )}

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form id="masterClassForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Period Picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">PERIOD</label>
              <div ref={dateContainerRef} className={`bg-gray-50 dark:bg-blue-600/10 rounded-2xl p-5 border ${
                errors.start_date || errors.end_date ? "border-red-300" : "border-gray-200 dark:border-blue-500/30"
              }`}>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">Start Date</span>
                    <div className="relative">
                      <input
                        ref={startDateRef}
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white dark:bg-blue-600/20 border border-gray-200 dark:border-blue-500/30 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <span className="text-gray-400 mt-6">-</span>
                  <div className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">End Date</span>
                    <div className="relative">
                      <input
                        ref={endDateRef}
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white dark:bg-blue-600/20 border border-gray-200 dark:border-blue-500/30 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {(errors.start_date || errors.end_date) && (
                <p className="text-red-500 text-xs mt-2">{errors.start_date || errors.end_date}</p>
              )}
            </div>

            {/* Course Selector */}
            <div className="space-y-3 relative">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Course Selection</label>
              <div className={`flex items-center gap-3 bg-gray-50 dark:bg-blue-600/10 rounded-2xl px-5 py-4 border ${
                errors.course_id ? "border-red-300" : "border-gray-200 dark:border-blue-500/30"
              } ${selectedCourse ? "bg-green-50/10 border-green-500/30" : ""}`}>
                <BookOpenIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search and select course..."
                  value={courseSearch}
                  onChange={handleCourseSearchChange}
                  onFocus={() => setCourseFocused(true)}
                  onBlur={() => setTimeout(() => setCourseFocused(false), 250)}
                  autoComplete="off"
                  className="flex-1 bg-transparent text-gray-900 dark:text-white font-medium outline-none"
                />
                {selectedCourse && <span className="text-xs font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full uppercase">Selected</span>}
              </div>
              {courseFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-2xl shadow-2xl z-[120] max-h-[200px] overflow-y-auto">
                  {courses.filter(c => (c.title || c.name || "").toLowerCase().includes(courseSearch.toLowerCase())).map(course => (
                    <button
                      key={course.id}
                      type="button"
                      onMouseDown={() => {
                        setSelectedCourse(course);
                        setCourseSearch(course.title || course.name || "");
                        setFormData(prev => ({ ...prev, course_id: course.id, subject_id: "" }));
                        setSubjectSearch("");
                        setSelectedSubject(null);
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {course.title || course.name}
                    </button>
                  ))}
                </div>
              )}
              {errors.course_id && <p className="text-red-500 text-xs mt-2">{errors.course_id}</p>}
            </div>

            {/* Subject Selector */}
            <div className="space-y-3 relative">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Subject Selection</label>
              <div className={`flex items-center gap-3 bg-gray-50 dark:bg-blue-600/10 rounded-2xl px-5 py-4 border ${
                errors.subject_id ? "border-red-300" : "border-gray-200 dark:border-blue-500/30"
              } ${!formData.course_id ? "opacity-50 cursor-not-allowed" : ""} ${selectedSubject ? "bg-green-50/10 border-green-500/30" : ""}`}>
                <BookOpenIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={formData.course_id ? "Search and select subject..." : "Please select a course first"}
                  value={subjectSearch}
                  onChange={handleSubjectSearchChange}
                  onFocus={() => formData.course_id && setSubjectFocused(true)}
                  onBlur={() => setTimeout(() => setSubjectFocused(false), 250)}
                  disabled={!formData.course_id}
                  autoComplete="off"
                  className="flex-1 bg-transparent text-gray-900 dark:text-white font-medium outline-none"
                />
                {selectedSubject && <span className="text-xs font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full uppercase">Selected</span>}
              </div>
              {subjectFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-2xl shadow-2xl z-[120] max-h-[200px] overflow-y-auto">
                  {subjects.filter(s => (s.name || "").toLowerCase().includes(subjectSearch.toLowerCase())).map(subject => (
                    <button
                      key={subject.id}
                      type="button"
                      onMouseDown={() => {
                        setSelectedSubject(subject);
                        setSubjectSearch(subject.name || "");
                        setFormData(prev => ({ ...prev, subject_id: subject.id }));
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
              )}
              {errors.subject_id && <p className="text-red-500 text-xs mt-2">{errors.subject_id}</p>}
            </div>

            {/* Generated Class Title Summary Box */}
            <div className="bg-gray-50 dark:bg-blue-600/10 rounded-2xl p-5 border border-gray-200 dark:border-blue-500/30">
              <span className="block text-xs text-gray-500 mb-2">Generated Class Title Payload</span>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {formData.title || "Fill out course and subject details above..."}
              </p>
            </div>

            {/* Weekly Schedule */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">West Africa Standard Time Layout</span>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map((day) => {
                  const isActive = daySchedules.some((s) => s.day === day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`py-3 rounded-xl text-xs font-medium transition-all ${
                        isActive ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              {daySchedules.length > 0 && (
                <div className="bg-gray-50 dark:bg-blue-600/10 rounded-2xl p-4 border border-gray-200 dark:border-blue-500/30 space-y-2">
                  {daySchedules.map((schedule) => (
                    <div key={schedule.day} className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">{schedule.day}</span>
                      <input
                        type="time"
                        value={schedule.start_time}
                        onChange={(e) => handleTimeChange(schedule.day, "start_time", e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm text-center dark:text-white"
                      />
                      <input
                        type="time"
                        value={schedule.end_time}
                        onChange={(e) => handleTimeChange(schedule.day, "end_time", e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm text-center dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              )}
              {errors.days && <p className="text-red-500 text-xs mt-2">{errors.days}</p>}
            </div>

            {/* Custom Tutors Selection */}
            <div className="space-y-2 relative">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Assign Tutors</label>
              <div className={`flex items-center gap-3 bg-gray-50 dark:bg-blue-600/10 rounded-2xl px-5 py-4 border ${
                errors.tutor_ids ? "border-red-300" : "border-gray-200 dark:border-blue-500/30"
              }`}>
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type to search and assign tutors..."
                  value={tutorSearch}
                  onChange={(e) => setTutorSearch(e.target.value)}
                  onFocus={() => setTutorFocused(true)}
                  onBlur={() => setTimeout(() => setTutorFocused(false), 250)}
                  autoComplete="off"
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                />
              </div>
              {tutorFocused && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded-2xl shadow-2xl z-[120] max-h-[150px] overflow-y-auto">
                  {tutors.filter(t => (t.name || `${t.firstname} ${t.surname}`).toLowerCase().includes(tutorSearch.toLowerCase())).map(tutor => (
                    <button
                      key={tutor.id}
                      type="button"
                      onMouseDown={() => selectTutor(tutor)}
                      className="w-full text-left px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {tutor.name || `${tutor.firstname} ${tutor.surname}`}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTutors.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white text-sm rounded-full">
                    {s.name || `${s.firstname} ${s.surname}`}
                    <button type="button" onClick={() => removeStaff(s.id, "tutor_ids")}>
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.tutor_ids && <p className="text-red-500 text-xs mt-2">{errors.tutor_ids}</p>}
            </div>

            {/* Custom Assistants Selection */}
            <div className="space-y-2 relative">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Assign Assistants (Optional)</label>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-blue-600/10 rounded-2xl px-5 py-4 border border-gray-200 dark:border-blue-500/30">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type to search and assign assistants..."
                  value={assistantSearch}
                  onChange={(e) => setAssistantSearch(e.target.value)}
                  onFocus={() => setAssistantFocused(true)}
                  onBlur={() => setTimeout(() => setAssistantFocused(false), 250)}
                  autoComplete="off"
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                />
              </div>
              {assistantFocused && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded-2xl shadow-2xl z-[120] max-h-[150px] overflow-y-auto">
                  {assistants.filter(a => (a.name || `${a.firstname} ${a.surname}`).toLowerCase().includes(assistantSearch.toLowerCase())).map(assistant => (
                    <button
                      key={assistant.id}
                      type="button"
                      onMouseDown={() => selectAssistant(assistant)}
                      className="w-full text-left px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {assistant.name || `${assistant.firstname} ${assistant.surname}`}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAssistants.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white text-sm rounded-full">
                    {s.name || `${s.firstname} ${s.surname}`}
                    <button type="button" onClick={() => removeStaff(s.id, "assistant_ids")}>
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Link Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Class Live Stream Link</label>
              <div className={`flex items-center gap-3 bg-gray-50 dark:bg-blue-600/10 rounded-2xl px-5 py-4 border ${
                errors.link ? "border-red-300" : "border-gray-200 dark:border-blue-500/30"
              }`}>
                <LinkIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="link"
                  placeholder="Enter video conference link (e.g., https://meet.google.com/...)"
                  value={formData.link}
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                />
              </div>
              {errors.link && <p className="text-red-500 text-xs mt-2">{errors.link}</p>}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Class Agenda / Description</label>
              <div className="flex items-start gap-3 bg-gray-50 dark:bg-blue-600/10 rounded-2xl px-5 py-4 border border-gray-200 dark:border-blue-500/30">
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-400 mt-1" />
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Provide syllabus notes or masterclass agendas for your students..."
                  value={formData.description}
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none resize-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer - Call to Actions */}
        <div className="flex-shrink-0 px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="masterClassForm"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold shadow-md transition"
          >
            {loading ? "Scheduling Class..." : "Create Master Class"}
          </button>
        </div>
      </div>
    </div>
  );
}