/**
 * Authentication and Session Management Utilities
 * Provides role and domain-specific token checks and session clearing.
 */

export const isStudentAuthenticated = () => {
  return Boolean(localStorage.getItem("student_token"));
};

export const isGuardianAuthenticated = () => {
  return Boolean(localStorage.getItem("guardian_token"));
};

export const isStaffAuthenticated = () => {
  return Boolean(localStorage.getItem("staff_token"));
};

export const getStaffRole = () => {
  const rawRole = localStorage.getItem("staff_role") || "";
  try {
    const parsed = JSON.parse(rawRole);
    if (typeof parsed === "string") return parsed.toLowerCase().trim();
  } catch {}
  return rawRole.replace(/^["']|["']$/g, "").toLowerCase().trim();
};

export const clearStudentSession = () => {
  localStorage.removeItem("student_token");
  localStorage.removeItem("student_info");
  localStorage.removeItem("studentdata");
  localStorage.removeItem("student_active_class_heartbeat");
  localStorage.removeItem("student_active_class_url");
  localStorage.removeItem("last_activity_at");
};

export const clearGuardianSession = () => {
  localStorage.removeItem("guardian_token");
  localStorage.removeItem("guardian_info");
};

export const clearStaffSession = () => {
  localStorage.removeItem("staff_token");
  localStorage.removeItem("staff_info");
  localStorage.removeItem("staff_role");
  localStorage.removeItem("staff_user");
  localStorage.removeItem("staff_active_class_heartbeat");
  localStorage.removeItem("staff_last_activity_at");
};

export const isAuthenticated = () => {
  return isStudentAuthenticated() || isGuardianAuthenticated() || isStaffAuthenticated();
};
