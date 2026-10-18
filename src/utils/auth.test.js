import {
  isStudentAuthenticated,
  isGuardianAuthenticated,
  isStaffAuthenticated,
  getStaffRole,
  clearStudentSession,
  clearGuardianSession,
  clearStaffSession,
  isAuthenticated
} from "./auth";

describe("auth.js Utility Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Token Presence Checks", () => {
    test("isStudentAuthenticated returns true only when student_token exists", () => {
      expect(isStudentAuthenticated()).toBe(false);
      localStorage.setItem("student_token", "jwt-123");
      expect(isStudentAuthenticated()).toBe(true);
    });

    test("isGuardianAuthenticated returns true only when guardian_token exists", () => {
      expect(isGuardianAuthenticated()).toBe(false);
      localStorage.setItem("guardian_token", "jwt-guardian");
      expect(isGuardianAuthenticated()).toBe(true);
    });

    test("isStaffAuthenticated returns true only when staff_token exists", () => {
      expect(isStaffAuthenticated()).toBe(false);
      localStorage.setItem("staff_token", "jwt-staff");
      expect(isStaffAuthenticated()).toBe(true);
    });

    test("isAuthenticated returns true if any token exists", () => {
      expect(isAuthenticated()).toBe(false);
      localStorage.setItem("student_token", "tok1");
      expect(isAuthenticated()).toBe(true);
      localStorage.clear();

      localStorage.setItem("guardian_token", "tok2");
      expect(isAuthenticated()).toBe(true);
      localStorage.clear();

      localStorage.setItem("staff_token", "tok3");
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe("Staff Role Helper", () => {
    test("getStaffRole retrieves normalized lowercase trimmed role", () => {
      expect(getStaffRole()).toBe("");
      localStorage.setItem("staff_role", "  Course Advisor  ");
      expect(getStaffRole()).toBe("course advisor");
    });
  });

  describe("Session Clearers", () => {
    test("clearStudentSession wipes all student artifacts", () => {
      localStorage.setItem("student_token", "t");
      localStorage.setItem("student_info", "{}");
      localStorage.setItem("studentdata", "{}");
      localStorage.setItem("student_active_class_heartbeat", "123");
      localStorage.setItem("student_active_class_url", "/test");
      localStorage.setItem("last_activity_at", "123");

      clearStudentSession();

      expect(localStorage.getItem("student_token")).toBeNull();
      expect(localStorage.getItem("student_info")).toBeNull();
      expect(localStorage.getItem("studentdata")).toBeNull();
      expect(localStorage.getItem("student_active_class_heartbeat")).toBeNull();
      expect(localStorage.getItem("student_active_class_url")).toBeNull();
      expect(localStorage.getItem("last_activity_at")).toBeNull();
    });

    test("clearGuardianSession wipes all guardian artifacts", () => {
      localStorage.setItem("guardian_token", "t");
      localStorage.setItem("guardian_info", "{}");

      clearGuardianSession();

      expect(localStorage.getItem("guardian_token")).toBeNull();
      expect(localStorage.getItem("guardian_info")).toBeNull();
    });

    test("clearStaffSession wipes all staff artifacts", () => {
      localStorage.setItem("staff_token", "t");
      localStorage.setItem("staff_info", "{}");
      localStorage.setItem("staff_role", "admin");
      localStorage.setItem("staff_user", "{}");
      localStorage.setItem("staff_active_class_heartbeat", "123");
      localStorage.setItem("staff_last_activity_at", "123");

      clearStaffSession();

      expect(localStorage.getItem("staff_token")).toBeNull();
      expect(localStorage.getItem("staff_info")).toBeNull();
      expect(localStorage.getItem("staff_role")).toBeNull();
      expect(localStorage.getItem("staff_user")).toBeNull();
      expect(localStorage.getItem("staff_active_class_heartbeat")).toBeNull();
      expect(localStorage.getItem("staff_last_activity_at")).toBeNull();
    });
  });
});
