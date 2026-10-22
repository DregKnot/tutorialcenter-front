import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://tutorialcenter-back.test" ||
  "http://localhost:8000";

/**
 * Returns authorization headers for student requests.
 */
const getStudentHeaders = () => {
  const token =
    localStorage.getItem("student_token") || localStorage.getItem("token") || "";
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
};

/**
 * Returns authorization headers for staff/admin/tutor requests.
 */
const getStaffHeaders = (isMultipart = false) => {
  const token =
    localStorage.getItem("staff_token") || localStorage.getItem("token") || "";
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(isMultipart ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" }),
    },
  };
};

/*
|--------------------------------------------------------------------------
| Student Curriculum & Learning Endpoints
|--------------------------------------------------------------------------
| In TutorialCenter, curriculum is organized by Subject (e.g. JAMB Mathematics).
| The student accesses modules, lessons, materials, quizzes, and progress
| tied to a specific subjectId.
*/

export const studentCurriculumApi = {
  /**
   * Fetch the full curriculum tree and progress stats for a subject.
   * Endpoint: GET /api/students/courses/subjects/{subjectId}/progress
   */
  getSubjectProgress: async (subjectId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/students/courses/subjects/${subjectId}/progress`,
      getStudentHeaders()
    );
    return res.data;
  },

  /**
   * Fetch a single lesson details, including attached materials and quizzes.
   * Endpoint: GET /api/students/courses/lessons/{lessonId}
   */
  getLessonDetails: async (lessonId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/students/courses/lessons/${lessonId}`,
      getStudentHeaders()
    );
    return res.data;
  },

  /**
   * Send video watch time & progress heartbeat.
   * Endpoint: POST /api/students/courses/lessons/{lessonId}/progress
   */
  updateLessonProgress: async (lessonId, { timeSpentSeconds, completionPercentage, status = "in_progress" }) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/students/courses/lessons/${lessonId}/progress`,
      {
        time_spent_seconds: timeSpentSeconds,
        completion_percentage: Math.min(100, Math.max(0, Math.round(completionPercentage))),
        status,
      },
      getStudentHeaders()
    );
    return res.data;
  },

  /**
   * Explicitly mark a lesson as completed (e.g. video finished or manual click).
   * Endpoint: POST /api/students/courses/lessons/{lessonId}/complete
   */
  completeLesson: async (lessonId) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/students/courses/lessons/${lessonId}/complete`,
      {},
      getStudentHeaders()
    );
    return res.data;
  },

  /**
   * Get quizzes available for a specific lesson.
   * Endpoint: GET /api/students/courses/quizzes/lesson/{lessonId}
   */
  getLessonQuizzes: async (lessonId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/students/courses/quizzes/lesson/${lessonId}`,
      getStudentHeaders()
    );
    return res.data;
  },

  /**
   * Get quiz metadata and configuration before starting.
   * Endpoint: GET /api/students/courses/quizzes/{quizId}
   */
  getQuizDetails: async (quizId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/students/courses/quizzes/${quizId}`,
      getStudentHeaders()
    );
    return res.data;
  },

  /**
   * Start a new quiz attempt. Backend returns submission_id and questions with masked answers.
   * Endpoint: POST /api/students/courses/quizzes/{quizId}/start
   */
  startQuizAttempt: async (quizId) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/students/courses/quizzes/${quizId}/start`,
      {},
      getStudentHeaders()
    );
    return res.data;
  },

  /**
   * Submit quiz answers for auto-grading.
   * Endpoint: POST /api/students/courses/quizzes/{quizId}/submissions/{submissionId}
   * Payload: { answers: [{ question_id: number, option_id: number, answer_text: string|null }] }
   */
  submitQuiz: async (quizId, submissionId, answers) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/students/courses/quizzes/${quizId}/submissions/${submissionId}`,
      { answers },
      getStudentHeaders()
    );
    return res.data;
  },

  /**
   * Fetch past submissions and scores for this student on a quiz.
   * Endpoint: GET /api/students/courses/quizzes/{quizId}/submissions
   */
  getMyQuizSubmissions: async (quizId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/students/courses/quizzes/${quizId}/submissions`,
      getStudentHeaders()
    );
    return res.data;
  },
};

/*
|--------------------------------------------------------------------------
| Staff / Admin / Tutor Curriculum Authoring Endpoints
|--------------------------------------------------------------------------
| Enables instructors to structure modules under a subject, populate lessons,
| upload materials (videos, slide PDFs, docs), and configure practice quizzes.
*/

export const staffCurriculumApi = {
  // --- Modules ---
  getModulesBySubject: async (subjectId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/staffs/courses/modules/subject/${subjectId}`,
      getStaffHeaders()
    );
    return res.data;
  },

  createModule: async (subjectId, { title, description, order = 0 }) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/staffs/courses/modules/subject/${subjectId}`,
      { title, description, order },
      getStaffHeaders()
    );
    return res.data;
  },

  updateModule: async (moduleId, payload) => {
    const res = await axios.put(
      `${API_BASE_URL}/api/staffs/courses/modules/${moduleId}`,
      payload,
      getStaffHeaders()
    );
    return res.data;
  },

  deleteModule: async (moduleId) => {
    const res = await axios.delete(
      `${API_BASE_URL}/api/staffs/courses/modules/${moduleId}`,
      getStaffHeaders()
    );
    return res.data;
  },

  reorderModules: async (subjectId, orders) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/staffs/courses/modules/subject/${subjectId}/reorder`,
      { orders },
      getStaffHeaders()
    );
    return res.data;
  },

  // --- Lessons ---
  getLessonsByModule: async (moduleId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/staffs/courses/lessons/module/${moduleId}`,
      getStaffHeaders()
    );
    return res.data;
  },

  createLesson: async (moduleId, { title, description, durationMinutes = 0, order = 0 }) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/staffs/courses/lessons/module/${moduleId}`,
      {
        title,
        description,
        duration_minutes: durationMinutes,
        order,
      },
      getStaffHeaders()
    );
    return res.data;
  },

  updateLesson: async (lessonId, payload) => {
    const res = await axios.put(
      `${API_BASE_URL}/api/staffs/courses/lessons/${lessonId}`,
      payload,
      getStaffHeaders()
    );
    return res.data;
  },

  deleteLesson: async (lessonId) => {
    const res = await axios.delete(
      `${API_BASE_URL}/api/staffs/courses/lessons/${lessonId}`,
      getStaffHeaders()
    );
    return res.data;
  },

  reorderLessons: async (moduleId, orders) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/staffs/courses/lessons/module/${moduleId}/reorder`,
      { orders },
      getStaffHeaders()
    );
    return res.data;
  },

  // --- Lesson Materials (Videos, Documents, Slides) ---
  getMaterialsByLesson: async (lessonId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/staffs/courses/lesson-materials/lesson/${lessonId}`,
      getStaffHeaders()
    );
    return res.data;
  },

  uploadMaterial: async (lessonId, formData) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/staffs/courses/lesson-materials/lesson/${lessonId}`,
      formData,
      getStaffHeaders(true)
    );
    return res.data;
  },

  deleteMaterial: async (materialId) => {
    const res = await axios.delete(
      `${API_BASE_URL}/api/staffs/courses/lesson-materials/${materialId}`,
      getStaffHeaders()
    );
    return res.data;
  },

  reorderMaterials: async (lessonId, orders) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/staffs/courses/lesson-materials/lesson/${lessonId}/reorder`,
      { orders },
      getStaffHeaders()
    );
    return res.data;
  },

  // --- Quizzes ---
  getQuizzesByLesson: async (lessonId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/staffs/courses/quizzes/lesson/${lessonId}`,
      getStaffHeaders()
    );
    return res.data;
  },

  createQuiz: async (lessonId, quizData) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/staffs/courses/quizzes/lesson/${lessonId}`,
      quizData,
      getStaffHeaders()
    );
    return res.data;
  },

  updateQuiz: async (quizId, quizData) => {
    const res = await axios.put(
      `${API_BASE_URL}/api/staffs/courses/quizzes/${quizId}`,
      quizData,
      getStaffHeaders()
    );
    return res.data;
  },

  deleteQuiz: async (quizId) => {
    const res = await axios.delete(
      `${API_BASE_URL}/api/staffs/courses/quizzes/${quizId}`,
      getStaffHeaders()
    );
    return res.data;
  },

  // --- Subject Progress Analytics ---
  getSubjectOverviewAnalytics: async (subjectId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/staffs/courses/course-progress/subject/${subjectId}/overview`,
      getStaffHeaders()
    );
    return res.data;
  },
};
