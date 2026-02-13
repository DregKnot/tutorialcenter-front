import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { location } from "../../../data/locations";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";

export default function AddedStudentBiodata() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Each student will have their own biodata + expanded state
  const [studentsBiodata, setStudentsBiodata] = useState([]);

  // Load students from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("guardianStudents");
    if (stored) {
      const parsed = JSON.parse(stored);
      const studentsWithBiodata = parsed.students.map((student, index) => ({
        // Info from previous page
        name: student.name,
        email: student.email,
        // Biodata fields
        firstname: student.name.split(" ")[0] || "",
        surname: student.name.split(" ").slice(1).join(" ") || "",
        gender: "",
        date_of_birth: "",
        location: "",
        address: "",
        department: "",
        // UI state
        expanded: index === 0,
      }));
      setStudentsBiodata(studentsWithBiodata);
    } else {
      // No students found, redirect back
      navigate("/register/guardian/addstudent");
    }
  }, [navigate]);

  // Toggle a student's accordion
  const toggleStudent = (index) => {
    setStudentsBiodata((prev) =>
      prev.map((s, i) => (i === index ? { ...s, expanded: !s.expanded } : s))
    );
  };

  // Update a biodata field for a specific student
  const handleChange = (index, field, value) => {
    setStudentsBiodata((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  // Validate all students' biodata
  const validateForm = () => {
    const newErrors = {};

    studentsBiodata.forEach((student, i) => {
      if (!student.firstname.trim()) {
        newErrors[`${i}_firstname`] = "First name is required";
      }
      if (!student.surname.trim()) {
        newErrors[`${i}_surname`] = "Last name is required";
      }
      if (!student.gender) {
        newErrors[`${i}_gender`] = "Gender is required";
      }
      if (!student.date_of_birth) {
        newErrors[`${i}_date_of_birth`] = "Date of birth is required";
      }
      if (!student.location.trim()) {
        newErrors[`${i}_location`] = "Location is required";
      }
      if (!student.address.trim()) {
        newErrors[`${i}_address`] = "Address is required";
      }
      if (!student.department.trim()) {
        newErrors[`${i}_department`] = "Department is required";
      }
    });

    setErrors(newErrors);

    // If there are errors, expand the first student section that has errors
    if (Object.keys(newErrors).length > 0) {
      const firstErrorIndex = parseInt(Object.keys(newErrors)[0].split("_")[0]);
      setStudentsBiodata((prev) =>
        prev.map((s, i) => ({
          ...s,
          expanded: i === firstErrorIndex,
        }))
      );
    }

    return Object.keys(newErrors).length === 0;
  };

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Handle form submission — register students and save biodata
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Retrieve the general password and guardian phone (if needed) from localStorage
    // Note: guardianStudents has { guardianTel, students: [...], password }
    const storedGuardianData = JSON.parse(
      localStorage.getItem("guardianStudents") || "{}"
    );
    const generalPassword = storedGuardianData.password || "Password@123";

    try {
      const updatedStudents = [];

      for (let i = 0; i < studentsBiodata.length; i++) {
        const student = studentsBiodata[i];
        
        // 1. Register logic
        // Trim the input to avoid regex failure on spaces
        const trimmedEntry = student.email ? student.email.trim() : "";
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(trimmedEntry);

        const registerPayload = {
          email: isEmail ? trimmedEntry : null,
          tel: isEmail ? null : trimmedEntry,
          password: generalPassword,
          confirmPassword: generalPassword,
          password_confirmation: generalPassword, // Adding this just in case backend expects it
        };

        // We try to register. If 422, maybe they exist? 
      
        try {
          await axios.post(
            `${API_BASE_URL}/api/students/register`,
            registerPayload
          );
          // We don't get the ID here usually, just "created"
        } catch (regErr) {
          console.warn(
            `Registration warning for ${student.name}:`,
            regErr.response?.data
          );
          // If it fails (e.g. already exists), we might still try to submit biodata 
          // to get the student object back if the endpoint supports it, 
          // OR we assume we can proceed if the error is "already taken".
        }

        // 2. Submit Biodata
        // This endpoint typically returns the student object including ID
        const biodataPayload = {
          firstname: student.firstname,
          surname: student.surname,
          email: isEmail ? trimmedEntry : null,
          tel: isEmail ? null : trimmedEntry,
          gender: student.gender,
          date_of_birth: student.date_of_birth,
          location: student.location,
          address: student.address,
          department: student.department,
        };

        const bioRes = await axios.post(
          `${API_BASE_URL}/api/students/biodata`,
          biodataPayload
        );

        if (bioRes.data && bioRes.data.student) {
          // Merge the returned student data (which has ID) with our local state
          updatedStudents.push({
            ...student,
            ...bioRes.data.student, // contains id, email, etc.
          });
        } else {
          throw new Error(`Failed to retrieve student ID for ${student.name}`);
        }
      }

      // Save the fully updated list (with IDs) to localStorage
      // We keep the structure compatible with what TrainingSelection expects
      localStorage.setItem(
        "guardianStudentsBiodata",
        JSON.stringify(updatedStudents)
      );

      setToast({ type: "success", message: "All students registered successfully!" });
      setMsg({ text: "All students registered successfully!", type: "success" });

      setTimeout(() => {
        setLoading(false);
        navigate("/register/guardian/training/selection");
      }, 1500);

    } catch (err) {
      console.error("Error in student registration loop:", err);
      setToast({
        type: "error",
        message: err.message || "Failed to register students.",
      });
      setMsg({
        text: err.message || "Failed to register students.",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
        {/* LEFT SIDE: Content Area */}
        <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          {/* TOP NAV */}
          <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
            <button
              onClick={() => navigate("/register/guardian/addstudent")}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img
                src={ReturnArrow}
                alt="Back"
                className="h-6 w-6 lg:h-5 lg:w-5"
              />
            </button>
            <img
              src={TC_logo}
              alt="Logo"
              className="h-[60px] md:h-[80px] w-auto object-contain"
            />
          </div>

          {/* CENTER PIECE */}
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-[#09314F]">
                Student Biodata
              </h1>
              <p className="text-gray-500 italic text-sm mt-1">
                Complete biodata for each added student
              </p>
              {msg.text && (
                <h3
                  className={`text-lg font-bold mt-2 ${
                    msg.type === "success" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {msg.text}
                </h3>
              )}
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 flex flex-col items-center w-full">
              {/* Toast */}
              {toast && (
                <div
                  className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white transition-all duration-300 ${
                    toast.type === "success" ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {toast.message}
                </div>
              )}

              <div className="w-full space-y-3">
                {/* Student Accordion Sections */}
                {studentsBiodata.map((student, index) => (
                  <div
                    key={index}
                    className="w-full border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleStudent(index)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#09314F] uppercase tracking-wide">
                          Student {index + 1}
                        </span>
                        <span className="text-xs text-gray-400">
                          — {student.name}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-[#09314F] transition-transform duration-200 ${
                          student.expanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Accordion Body — Biodata Form Fields */}
                    {student.expanded && (
                      <div className="px-4 py-4 space-y-4 border-t border-gray-200">
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={student.firstname}
                            onChange={(e) =>
                              handleChange(index, "firstname", e.target.value)
                            }
                            className={`w-full px-4 py-2 border rounded-lg ${
                              errors[`${index}_firstname`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                          />
                          {errors[`${index}_firstname`] && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors[`${index}_firstname`]}
                            </p>
                          )}
                        </div>

                        {/* Surname */}
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={student.surname}
                            onChange={(e) =>
                              handleChange(index, "surname", e.target.value)
                            }
                            className={`w-full px-4 py-2 border rounded-lg ${
                              errors[`${index}_surname`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                          />
                          {errors[`${index}_surname`] && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors[`${index}_surname`]}
                            </p>
                          )}
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            Gender
                          </label>
                          <select
                            value={student.gender}
                            onChange={(e) =>
                              handleChange(index, "gender", e.target.value)
                            }
                            className={`w-full px-4 py-2 border rounded-lg ${
                              errors[`${index}_gender`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="others">Others</option>
                          </select>
                          {errors[`${index}_gender`] && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors[`${index}_gender`]}
                            </p>
                          )}
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={student.date_of_birth}
                            onChange={(e) =>
                              handleChange(
                                index,
                                "date_of_birth",
                                e.target.value
                              )
                            }
                            className={`w-full px-4 py-2 border rounded-lg ${
                              errors[`${index}_date_of_birth`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                          />
                          {errors[`${index}_date_of_birth`] && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors[`${index}_date_of_birth`]}
                            </p>
                          )}
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            list={`nigeria-states-${index}`}
                            value={student.location}
                            onChange={(e) =>
                              handleChange(index, "location", e.target.value)
                            }
                            placeholder="e.g. Lagos, Nigeria"
                            className={`w-full px-4 py-2 border rounded-lg ${
                              errors[`${index}_location`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                          />
                          <datalist id={`nigeria-states-${index}`}>
                            {location.map((loc) => (
                              <option
                                key={loc.code}
                                value={`${loc.state}, ${loc.country}`}
                              />
                            ))}
                          </datalist>
                          {errors[`${index}_location`] && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors[`${index}_location`]}
                            </p>
                          )}
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            Address
                          </label>
                          <textarea
                            value={student.address}
                            onChange={(e) =>
                              handleChange(index, "address", e.target.value)
                            }
                            className={`w-full px-4 py-2 border rounded-lg ${
                              errors[`${index}_address`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                          />
                          {errors[`${index}_address`] && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors[`${index}_address`]}
                            </p>
                          )}
                        </div>

                        {/* Department */}
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            Department
                          </label>
                          <select
                            value={student.department}
                            onChange={(e) =>
                              handleChange(index, "department", e.target.value)
                            }
                            className={`w-full px-4 py-2 border rounded-lg ${
                              errors[`${index}_department`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                          >
                            <option value="">Select Department</option>
                            <option value="art">Art</option>
                            <option value="science">Science</option>
                            <option value="commercial">Commercial</option>
                          </select>
                          {errors[`${index}_department`] && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors[`${index}_department`]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Button — Outside the accordion */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90"
                } text-white transition-colors`}
              >
                {loading ? "Saving..." : "Complete Added Students Biodata"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Visual Image */}
        <div
          className="w-full h-[192px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
          style={{ backgroundImage: `url(${signup_img})` }}
        >
          {/* Login Button */}
          <div className="hidden md:block absolute bottom-[60px] left-0">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
              style={{ borderRadius: "0px 20px 20px 0px" }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
