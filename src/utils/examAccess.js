import { isReadOnlyStaff } from "./roleUtils";

const ADVISOR_ROLES = ["advisor", "course advisor", "course_advisor", "course-advisor"];

export const getStaffRole = () =>
  (localStorage.getItem("staff_role") || "").toLowerCase().trim();

export const isAdvisor = () => ADVISOR_ROLES.includes(getStaffRole());

export const canManageExams = () => !isAdvisor() && !isReadOnlyStaff();

export const getExamApiBase = () => (isAdvisor() ? "/api/advisor" : "/api/admin");

export const getExamBasePath = () =>
  isAdvisor() ? "/staffs/course-advisor/exams" : "/staffs/manage-exams";

