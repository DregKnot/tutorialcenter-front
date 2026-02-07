import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";

export const StudentSubjectSelection = () => {
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const [selectedCourses, setSelectedCourses] = useState([]);
  const [subjectsByCourse, setSubjectsByCourse] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= HELPERS ================= */
  const getSubjectLimit = (courseTitle) =>
    courseTitle.toLowerCase().includes("jamb") ? 4 : 9;

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const storedTraining = JSON.parse(
          localStorage.getItem("selectedTraining"),
        );
        const studentData = JSON.parse(localStorage.getItem("studentdata"));

        if (!storedTraining?.length || !studentData?.department) {
          navigate("/register/student/training/selection");
          return;
        }

        const department = studentData.department;

        /* Fetch all courses */
        const courseRes = await axios.get(`${API_BASE_URL}/api/courses`);
        const allCourses = courseRes.data.courses || [];

        const activeCourses = allCourses.filter((c) =>
          storedTraining.includes(c.id),
        );

        setSelectedCourses(activeCourses);

        /* Fetch subjects per course */
        const subjectMap = {};
        const selectionMap = {};

        for (const course of activeCourses) {
          const res = await axios.get(
            `${API_BASE_URL}/api/courses/${course.id}/subjects/${department}`,
          );

          subjectMap[course.id] = res.data.subjects || [];
          selectionMap[course.id] = [];
        }

        setSubjectsByCourse(subjectMap);
        setSelectedSubjects(selectionMap);
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    };

    init();
  }, [navigate, API_BASE_URL]);

  /* ================= SUBJECT TOGGLE ================= */
  const toggleSubject = (courseId, subject) => {
    setSelectedSubjects((prev) => {
      const current = prev[courseId] || [];
      const course = selectedCourses.find((c) => c.id === courseId);
      const limit = getSubjectLimit(course.title);

      const exists = current.some((s) => s.id === subject.id);

      if (exists) {
        return {
          ...prev,
          [courseId]: current.filter((s) => s.id !== subject.id),
        };
      }

      if (current.length >= limit) return prev;

      return {
        ...prev,
        [courseId]: [...current, subject],
      };
    });
  };

  /* ================= CONTINUE ================= */
  const handleContinue = () => {
    const valid = selectedCourses.every(
      (course) => selectedSubjects[course.id]?.length > 0,
    );

    if (!valid) {
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    localStorage.setItem("trainingSubjects", JSON.stringify(selectedSubjects));

    navigate("/training-duration");
  };

  return (
    <>
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
        {/* LEFT SIDE: Content Area */}
        <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          {/* 1. TOP NAV */}
          <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
            <button
              onClick={() => navigate("/register/student")}
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

          {/* 2. CENTER PIECE */}
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-[#09314F]">
                Subject Selection
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-3 bg-[#09314F] text-white text-sm font-bold rounded-t-lg">
            <div className="p-2">Examination</div>
            <div className="p-2">Subjects</div>
            <div className="p-2 text-right">Number</div>
          </div>

          {selectedCourses.map((course) => {
            const selected = selectedSubjects[course.id] || [];
            const limit = getSubjectLimit(course.title);
            const isOpen = openDropdown === course.id;

            return (
              <div key={course.id} className="border-b py-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-semibold text-[#09314F]">
                    {course.title}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : course.id)}
                      className="w-full bg-gray-300 px-3 py-2 rounded text-xs flex justify-between"
                    >
                      {selected.length
                        ? selected
                            .map((s) => s.name)
                            .slice(0, 2)
                            .join(", ") + (selected.length > 2 ? "..." : "")
                        : "Select subjects"}
                      <span>{isOpen ? "▲" : "▼"}</span>
                    </button>

                    {isOpen && (
                      <div className="absolute z-10 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
                        {subjectsByCourse[course.id]?.map((subject) => {
                          const isSelected = selected.some(
                            (s) => s.id === subject.id,
                          );
                          const disabled =
                            !isSelected && selected.length >= limit;

                          return (
                            <button
                              key={subject.id}
                              disabled={disabled}
                              onClick={() => toggleSubject(course.id, subject)}
                              className={`w-full px-4 py-2 text-left text-sm
                                ${
                                  isSelected
                                    ? "bg-green-500 text-white"
                                    : disabled
                                      ? "bg-gray-200 text-gray-400"
                                      : "hover:bg-gray-100"
                                }`}
                            >
                              {subject.name}
                              {isSelected && " ✓"}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="text-right font-semibold">
                    {selected.length} / {limit}
                  </div>
                </div>
              </div>
            );
          })}

          {error && (
            <p className="text-red-500 text-xs text-center mt-4">
              Please select at least one subject for each examination
            </p>
          )}

          <button
            onClick={handleContinue}
            disabled={loading}
            className="mt-6 w-full py-3 rounded bg-gradient-to-r from-[#09314F] to-[#E83831] text-white"
          >
            {loading ? "Loading..." : "Continue"}
          </button>
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
};
