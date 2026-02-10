export const isAuthenticated = () => {
  // later replace with token validation / API call
  return Boolean(localStorage.getItem("student_token") || localStorage.getItem("guardian_token") || localStorage.getItem("staff_token"));
};
