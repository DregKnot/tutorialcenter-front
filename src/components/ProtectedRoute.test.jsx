import React from "react";
import { render, screen } from "@testing-library/react";

// Mock react-router-dom virtual module for Jest compatibility with react-router-dom v7
jest.mock(
  "react-router-dom",
  () => ({
    Navigate: ({ to, replace }) => (
      <div data-testid="mock-navigate" data-to={to} data-replace={String(replace)}>
        Navigating to {to}
      </div>
    ),
    Outlet: () => <div data-testid="mock-outlet">Protected Child Content</div>,
  }),
  { virtual: true }
);

import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute RBAC Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("1. Unauthenticated Redirections to Domain Logins", () => {
    test("redirects unauthenticated user on student route to /student/login", () => {
      render(<ProtectedRoute allowedRoles={["student"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/student/login");
      expect(nav).toHaveAttribute("data-replace", "true");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("redirects unauthenticated user on guardian route to /guardian/login", () => {
      render(<ProtectedRoute allowedRoles={["guardian"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/guardian/login");
      expect(nav).toHaveAttribute("data-replace", "true");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("redirects unauthenticated user on staff route to /staff/login", () => {
      render(<ProtectedRoute allowedRoles={["staff"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/staff/login");
      expect(nav).toHaveAttribute("data-replace", "true");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("redirects unauthenticated user on admin route to /staff/login", () => {
      render(<ProtectedRoute allowedRoles={["admin"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/staff/login");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("redirects unauthenticated user on classroom route to /login", () => {
      render(<ProtectedRoute allowedRoles={["classroom"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/login");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("honors custom redirectTo prop when unauthenticated", () => {
      render(<ProtectedRoute allowedRoles={["student"]} redirectTo="/custom-login" />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/custom-login");
    });
  });

  describe("2. Student Access Boundaries", () => {
    beforeEach(() => {
      localStorage.setItem("student_token", "valid-student-jwt-token");
    });

    test("allows student to access student protected routes", () => {
      render(<ProtectedRoute allowedRoles={["student"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
      expect(screen.queryByTestId("mock-navigate")).not.toBeInTheDocument();
    });

    test("allows student to access classroom live sessions", () => {
      render(<ProtectedRoute allowedRoles={["classroom"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
      expect(screen.queryByTestId("mock-navigate")).not.toBeInTheDocument();
    });

    test("blocks student from accessing guardian routes -> redirects to /unauthorized", () => {
      render(<ProtectedRoute allowedRoles={["guardian"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/unauthorized");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("blocks student from accessing staff routes -> redirects to /unauthorized", () => {
      render(<ProtectedRoute allowedRoles={["staff"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/unauthorized");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("blocks student from accessing administrative routes -> redirects to /unauthorized", () => {
      render(<ProtectedRoute allowedRoles={["admin"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/unauthorized");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });
  });

  describe("3. Guardian Access Boundaries", () => {
    beforeEach(() => {
      localStorage.setItem("guardian_token", "valid-guardian-jwt-token");
    });

    test("allows guardian to access guardian routes", () => {
      render(<ProtectedRoute allowedRoles={["guardian"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
      expect(screen.queryByTestId("mock-navigate")).not.toBeInTheDocument();
    });

    test("blocks guardian from accessing student routes -> redirects to /unauthorized", () => {
      render(<ProtectedRoute allowedRoles={["student"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/unauthorized");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("blocks guardian from accessing staff routes -> redirects to /unauthorized", () => {
      render(<ProtectedRoute allowedRoles={["staff"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/unauthorized");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("blocks guardian from entering student classrooms -> redirects to /unauthorized", () => {
      render(<ProtectedRoute allowedRoles={["classroom"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/unauthorized");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });
  });

  describe("4. Staff Fine-Grained Role-Based Access Control", () => {
    beforeEach(() => {
      localStorage.setItem("staff_token", "valid-staff-jwt-token");
    });

    test("allows tutor to access tutor-specific routes", () => {
      localStorage.setItem("staff_role", "tutor");
      render(<ProtectedRoute allowedRoles={["tutor"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
    });

    test("blocks tutor from accessing admin management routes -> redirects to /unauthorized", () => {
      localStorage.setItem("staff_role", "tutor");
      render(<ProtectedRoute allowedRoles={["admin"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/unauthorized");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("blocks tutor from accessing Video Vault -> redirects to /unauthorized", () => {
      localStorage.setItem("staff_role", "tutor");
      render(<ProtectedRoute allowedRoles={["video-vault"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/unauthorized");
      expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
    });

    test("allows admin to access admin routes", () => {
      localStorage.setItem("staff_role", "admin");
      render(<ProtectedRoute allowedRoles={["admin"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
    });

    test("allows admin supervisory access to tutor and advisor routes", () => {
      localStorage.setItem("staff_role", "admin");
      const { unmount } = render(<ProtectedRoute allowedRoles={["tutor"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
      unmount();

      render(<ProtectedRoute allowedRoles={["advisor"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
    });

    test("allows admin to access Video Vault", () => {
      localStorage.setItem("staff_role", "admin");
      render(<ProtectedRoute allowedRoles={["video-vault"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
    });

    test("allows course advisor to access advisor routes", () => {
      localStorage.setItem("staff_role", "course advisor");
      render(<ProtectedRoute allowedRoles={["advisor"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
    });

    test("blocks course advisor from admin-only routes", () => {
      localStorage.setItem("staff_role", "course advisor");
      render(<ProtectedRoute allowedRoles={["admin"]} />);
      const nav = screen.getByTestId("mock-navigate");
      expect(nav).toHaveAttribute("data-to", "/unauthorized");
    });

    test("allows any authenticated staff to access general staff routes", () => {
      localStorage.setItem("staff_role", "tutor");
      render(<ProtectedRoute allowedRoles={["staff"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
    });

    test("allows authenticated staff to join live classroom sessions", () => {
      localStorage.setItem("staff_role", "tutor");
      render(<ProtectedRoute allowedRoles={["classroom"]} />);
      expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
    });
  });
});
