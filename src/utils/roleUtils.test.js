import { isReadOnlyStaff, isCsa, READ_ONLY_ROLES } from "./roleUtils";
import { canManageExams, getExamApiBase, getExamBasePath } from "./examAccess";

describe("roleUtils - Role and Permission Testing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("isReadOnlyStaff", () => {
    test("identifies coo and preview as read-only", () => {
      expect(isReadOnlyStaff("coo")).toBe(true);
      expect(isReadOnlyStaff("COO")).toBe(true);
      expect(isReadOnlyStaff("preview")).toBe(true);
      expect(isReadOnlyStaff("operations")).toBe(true);
    });

    test("identifies CSA and Customer Support as read-only", () => {
      expect(isReadOnlyStaff("csa")).toBe(true);
      expect(isReadOnlyStaff("CSA")).toBe(true);
      expect(isReadOnlyStaff("customer support")).toBe(true);
      expect(isReadOnlyStaff("customer_support")).toBe(true);
      expect(isReadOnlyStaff("customer-support")).toBe(true);
    });

    test("identifies admin and tutor as non-read-only", () => {
      expect(isReadOnlyStaff("admin")).toBe(false);
      expect(isReadOnlyStaff("ADMIN")).toBe(false);
      expect(isReadOnlyStaff("tutor")).toBe(false);
      expect(isReadOnlyStaff("advisor")).toBe(false);
      expect(isReadOnlyStaff("moderator")).toBe(false);
    });

    test("reads from localStorage when argument is omitted", () => {
      localStorage.setItem("staff_role", "csa");
      expect(isReadOnlyStaff()).toBe(true);

      localStorage.setItem("staff_role", "admin");
      expect(isReadOnlyStaff()).toBe(false);
    });
  });

  describe("isCsa", () => {
    test("detects csa variants accurately", () => {
      expect(isCsa("csa")).toBe(true);
      expect(isCsa("CSA ")).toBe(true);
      expect(isCsa("customer support")).toBe(true);
      expect(isCsa("customer_support")).toBe(true);
      expect(isCsa("customer-support")).toBe(true);
      expect(isCsa("coo")).toBe(false);
      expect(isCsa("admin")).toBe(false);
    });
  });

  describe("examAccess - canManageExams", () => {
    test("permits admin to manage exams", () => {
      localStorage.setItem("staff_role", "admin");
      expect(canManageExams()).toBe(true);
    });

    test("blocks advisor from managing exams", () => {
      localStorage.setItem("staff_role", "advisor");
      expect(canManageExams()).toBe(false);

      localStorage.setItem("staff_role", "course advisor");
      expect(canManageExams()).toBe(false);
    });

    test("blocks COO and CSA from managing exams (enforces read-only browsing)", () => {
      localStorage.setItem("staff_role", "coo");
      expect(canManageExams()).toBe(false);

      localStorage.setItem("staff_role", "csa");
      expect(canManageExams()).toBe(false);

      localStorage.setItem("staff_role", "customer support");
      expect(canManageExams()).toBe(false);
    });

    test("routes CSA and COO to admin exam endpoints for browsing", () => {
      localStorage.setItem("staff_role", "csa");
      expect(getExamApiBase()).toBe("/api/admin");
      expect(getExamBasePath()).toBe("/staffs/manage-exams");
    });
  });
});
