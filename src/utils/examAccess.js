import { isReadOnlyStaff, isTutorStaff } from "./roleUtils";

const ADVISOR_ROLES = ["advisor", "course advisor", "course_advisor", "course-advisor"];

export const getStaffRole = () =>
  (localStorage.getItem("staff_role") || "").toLowerCase().trim();

export const isAdvisor = () => ADVISOR_ROLES.includes(getStaffRole());

export const isTutor = () => isTutorStaff(getStaffRole());

export const canManageExams = () => !isAdvisor() && !isTutor() && !isReadOnlyStaff();

export const getExamApiBase = () => "/api/admin";

export const getExamBasePath = () => {
  if (isAdvisor()) return "/staffs/course-advisor/exams";
  if (isTutor()) return "/staffs/tutor/exams";
  return "/staffs/manage-exams";
};

export { canEditExamYear } from "./roleUtils";


