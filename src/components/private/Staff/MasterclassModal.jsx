import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BookOpenIcon, 
  ClockIcon, 
  GlobeAltIcon, 
  UserGroupIcon, 
  LinkIcon, 
  UserCircleIcon, 
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function CreateMasterClassModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const [formData, setFormData] = useState({
    // course_id: "",
    subject_id: "",
    title: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    tutor_id: "",
    assistant_id: "",
    link: "",
    status: "active",
    description: "",
  });

  const [selectedDays, setSelectedDays] = useState(["monday"]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const weekDays = [
    { label: "Su", value: "sunday" },
    { label: "Mo", value: "monday" },
    { label: "Tu", value: "tuesday" },
    { label: "We", value: "wednesday" },
    { label: "Th", value: "thursday" },
    { label: "Fr", value: "friday" },
    { label: "Sa", value: "saturday" }
  ];

  // ✅ Fetch staff (WITH auth header)
  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/staffs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Staff response:", response.data);
      
      const fetchedStaff = response.data.staffs || response.data.data || [];
      setStaffList(Array.isArray(fetchedStaff) ? fetchedStaff : []);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      
      // Fallback to current user
      const currentStaff = JSON.parse(localStorage.getItem("staff_info"));
      if (currentStaff) {
        setStaffList([currentStaff]);
      } else {
        setStaffList([]);
      }
    }
  };


  // ✅ Fetch courses on mount (NO auth header)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses`);
        console.log("Courses raw response.data:", response?.data);
        
        const fetched = response?.data?.courses || response?.data?.data || [];
        
        if (fetched.length === 0) {
          console.warn("No courses resolved — check that response.data.courses exists and is non-empty.");
        }
        
        setCourses(fetched);
        console.table(fetched);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };

    fetchCourses();
    fetchStaff();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Fetch subjects when course_id changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!formData.course_id) {
        setSubjects([]);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses/${formData.course_id}/subjects`);
        console.log("Subjects response:", response.data);
        const fetchedSubjects = response.data.subjects || response.data.data || [];
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, [formData.course_id, API_BASE_URL]);

  // ✅ Handle course change
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const course = courses.find(c => c.id === parseInt(courseId));
    
    setSelectedCourse(course);
    setFormData({
      ...formData,
      course_id: courseId,
      subject_id: "",  // Reset subject when course changes
      title: ""  // Reset title
    });
    setSelectedSubject(null);
  };

  // ✅ Handle subject change and auto-generate title
  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    
    setSelectedSubject(subject);
    
    // ✅ Auto-generate title: "JAMB-Mathematics"
    const courseName = selectedCourse?.title || selectedCourse?.name || "";
    const subjectName = subject?.name || "";
    const autoTitle = courseName && subjectName ? `${courseName}-${subjectName}` : "";
    
    setFormData({
      ...formData,
      subject_id: subjectId,
      title: autoTitle
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const toggleDay = (dayValue) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter(d => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
    if (errors.days) setErrors({ ...errors, days: null });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 60;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff : 60;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course_id) newErrors.course_id = "Course is required";
    if (!formData.subject_id) newErrors.subject_id = "Subject is required";
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = "End date cannot be before start date";
      }
    }
    
    if (!formData.tutor_id) {
      newErrors.tutor_id = "At least one staff member is required";
    }

    if (selectedDays.length === 0) {
      newErrors.days = "At least one schedule day is required";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return; 
    }

    setLoading(true);

    try {
      const staffs = [];
      if (formData.tutor_id) staffs.push({ staff_id: parseInt(formData.tutor_id), role: "lead" });
      if (formData.assistant_id) staffs.push({ staff_id: parseInt(formData.assistant_id), role: "assistant" });

      const duration = calculateDuration(formData.start_time, formData.end_time);
      const schedules = selectedDays.map(day => ({
        day_of_week: day,
        start_time: formData.start_time,
        duration_minutes: duration
      }));

      const payload = {
        subject_id: parseInt(formData.subject_id),
        title: formData.title,
        description: formData.description || "No description provided",
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date,
        staffs: staffs,
        schedules: schedules
      };

      console.log("Submitting payload:", payload);

      // ✅ WITH auth header for creating class
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/classes/create`, 
        payload, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Create class response:", response.data);

      if (response.status === 201 || response.status === 200) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create class:", error.response?.data);
      
      if (error.response?.data?.errors) {
        const laravelErrors = error.response.data.errors;
        const formattedErrors = {};
        
        for (const key in laravelErrors) {
          formattedErrors[key] = laravelErrors[key][0]; 
        }
        
        setErrors(formattedErrors);
      } else {
        setApiError(error.response?.data?.message || "Failed to create class. Server error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#1F2937]">Schedule Master Class</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Global API Error Banner */}
        {apiError && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {apiError}
          </div>
        )}

        {/* Form Content */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          <form id="masterClassForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Session Duration Card */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Period
              </label>
              <div className={`bg-gray-50 rounded-xl p-4 ${errors.start_date || errors.end_date ? "border-2 border-red-500" : "border border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Session Duration</span>
                  <div className="flex items-center gap-3 text-sm">
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Start</span>
                      <input 
                        type="date" 
                        name="start_date" 
                        value={formData.start_date} 
                        onChange={handleChange} 
                        className="bg-transparent border-none p-0 text-gray-900 font-medium focus:ring-0 cursor-pointer" 
                      />
                    </div>
                    <span className="text-gray-400 mt-4">-</span>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">End</span>
                      <input 
                        type="date" 
                        name="end_date" 
                        value={formData.end_date} 
                        onChange={handleChange} 
                        className="bg-transparent border-none p-0 text-gray-900 font-medium focus:ring-0 cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              {(errors.start_date || errors.end_date) && (
                <p className="text-red-500 text-xs mt-2">{errors.start_date || errors.end_date}</p>
              )}
            </div>

            {/* Course Dropdown (JAMB, WAEC, etc) */}
            <div>
              <div className={`flex items-center gap-4 bg-gray-50 rounded-xl p-4 ${errors.course_id ? "border-2 border-red-500" : "border border-gray-200"}`}>
                <BookOpenIcon className="w-6 h-6 text-gray-700" />
                <select 
                  name="course_id" 
                  value={formData.course_id} 
                  onChange={handleCourseChange} 
                  className="flex-1 bg-transparent text-gray-900 font-medium outline-none cursor-pointer"
                >
                  <option value="">Select Course (e.g., JAMB, WAEC)</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title || course.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </div>
              {errors.course_id && <p className="text-red-500 text-xs mt-2">{errors.course_id}</p>}
            </div>

            {/* Subject Dropdown (English, Mathematics, etc) */}
            <div>
              <div className={`flex items-center gap-4 bg-gray-50 rounded-xl p-4 ${errors.subject_id ? "border-2 border-red-500" : "border border-gray-200"}`}>
                <BookOpenIcon className="w-6 h-6 text-gray-700" />
                <select 
                  name="subject_id" 
                  value={formData.subject_id} 
                  onChange={handleSubjectChange}
                  disabled={!formData.course_id}
                  className="flex-1 bg-transparent text-gray-900 font-medium outline-none cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="">Select Subject (e.g., English, Mathematics)</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </div>
              {errors.subject_id && <p className="text-red-500 text-xs mt-2">{errors.subject_id}</p>}
            </div>

            {/* Auto-Generated Title (Read-only display) */}
            <div>
              <div className={`flex items-center gap-4 bg-gray-100 rounded-xl p-4 border border-gray-200`}>
                <div className="w-6" />
                <div className="flex-1">
                  <span className="block text-xs text-gray-500 mb-1">Generated Class Title</span>
                  <p className="text-gray-900 font-bold">
                    {formData.title || "Select course and subject to generate title"}
                  </p>
                </div>
              </div>
            </div>

            {/* Days of Week */}
            <div>
              <div className="flex items-center gap-4">
                <ClockIcon className="w-6 h-6 text-gray-700" />
                <div className="flex-1 flex gap-2">
                  {weekDays.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        selectedDays.includes(day.value) 
                          ? "bg-blue-300 text-blue-900" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              {errors.days && <p className="text-red-500 text-xs mt-2 ml-10">{errors.days}</p>}
            </div>

            {/* Time Card */}
            <div>
              <div className="flex items-center gap-4">
                <div className="w-6" />
                <div className={`flex-1 bg-gray-50 rounded-xl p-4 ${errors.start_time ? "border-2 border-red-500" : "border border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Day</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {selectedDays.length > 0 ? selectedDays[0] : "Select a day"}
                        {selectedDays.length > 1 && ` +${selectedDays.length - 1}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">Start</span>
                        <input 
                          type="time" 
                          name="start_time" 
                          value={formData.start_time} 
                          onChange={handleChange} 
                          className="bg-transparent border-none p-0 text-sm text-gray-900 font-medium focus:ring-0 cursor-pointer" 
                        />
                      </div>
                      <span className="text-gray-400 mt-4">-</span>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">End</span>
                        <input 
                          type="time" 
                          name="end_time" 
                          value={formData.end_time} 
                          onChange={handleChange} 
                          className="bg-transparent border-none p-0 text-sm text-gray-900 font-medium focus:ring-0 cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {errors.start_time && <p className="text-red-500 text-xs mt-2 ml-10">{errors.start_time}</p>}
            </div>

            {/* Timezone */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <GlobeAltIcon className="w-6 h-6 text-gray-700" />
              <span>West Africa Standard Time</span>
            </div>

            {/* Tutor */}
            <div>
              <div className={`flex items-center gap-4 bg-gray-50 rounded-xl p-4 ${errors.tutor_id ? "border-2 border-red-500" : "border border-gray-200"}`}>
                <UserGroupIcon className="w-6 h-6 text-gray-700" />
                <select 
                  name="tutor_id" 
                  value={formData.tutor_id} 
                  onChange={handleChange} 
                  className="flex-1 bg-transparent text-gray-500 outline-none cursor-pointer"
                >
                  <option value="">Select tutor</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name || `${s.firstname} ${s.surname}`}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </div>
              {errors.tutor_id && <p className="text-red-500 text-xs mt-2">{errors.tutor_id}</p>}
            </div>

            {/* Assistant */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <UserGroupIcon className="w-6 h-6 text-gray-700" />
              <select 
                name="assistant_id" 
                value={formData.assistant_id} 
                onChange={handleChange} 
                className="flex-1 bg-transparent text-gray-500 outline-none cursor-pointer"
              >
                <option value="">Select assistant (optional)</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name || `${s.firstname} ${s.surname}`}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </div>

            {/* Link */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <LinkIcon className="w-6 h-6 text-gray-700" />
              <input 
                type="url" 
                name="link" 
                value={formData.link} 
                onChange={handleChange} 
                placeholder="Add Link (optional)" 
                className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-400" 
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <UserCircleIcon className="w-6 h-6 text-gray-700" />
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="flex-1 bg-transparent text-gray-500 outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-gray-700 mt-1" />
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Description (optional)" 
                  rows="3" 
                  className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-400 resize-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer Buttons */}
        <div className="px-8 py-6 bg-white flex items-center gap-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="masterClassForm"
            disabled={loading}
            className="flex-1 py-3.5 bg-[#0F2843] hover:bg-[#0a1b2d] text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}