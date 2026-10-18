import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  isStudentAuthenticated,
  isGuardianAuthenticated,
  isStaffAuthenticated,
  getStaffRole,
  isAuthenticated
} from "../utils/auth";
import {
  isAdminStaff,
  isAdvisorStaff,
  isTutorStaff,
  canAccessVideoVault
} from "../utils/roleUtils";

/**
 * ProtectedRoute Component
 * Enforces authentication and Role-Based Access Control (RBAC).
 *
 * @param {Object} props
 * @param {string[]|string} [props.allowedRoles] - Allowed roles or domain scopes.
 *   Supported scopes: 'student', 'guardian', 'staff', 'admin', 'advisor', 'tutor', 'video-vault', 'classroom'
 * @param {string} [props.redirectTo] - Custom redirection path if unauthenticated.
 */
export default function ProtectedRoute({ allowedRoles, redirectTo }) {
  // Normalize allowedRoles to array
  const roles = allowedRoles
    ? (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).map((r) => r.toLowerCase().trim())
    : [];

  const studentAuth = isStudentAuthenticated();
  const guardianAuth = isGuardianAuthenticated();
  const staffAuth = isStaffAuthenticated();
  const anyAuth = isAuthenticated();

  // If no specific roles are required, simply ensure any authenticated session exists
  if (roles.length === 0) {
    if (!anyAuth) {
      return <Navigate to={redirectTo || "/login"} replace />;
    }
    return <Outlet />;
  }

  // Determine domain requirements
  const requiresStudent = roles.includes("student");
  const requiresGuardian = roles.includes("guardian");
  const requiresClassroom = roles.includes("classroom");
  const requiresStaffScope = roles.some((r) =>
    ["staff", "admin", "advisor", "tutor", "video-vault"].includes(r)
  );

  // 1. Unauthenticated users: redirect directly to corresponding domain login page
  if (!anyAuth) {
    if (requiresStudent) return <Navigate to={redirectTo || "/student/login"} replace />;
    if (requiresGuardian) return <Navigate to={redirectTo || "/guardian/login"} replace />;
    if (requiresStaffScope) return <Navigate to={redirectTo || "/staff/login"} replace />;
    if (requiresClassroom) return <Navigate to={redirectTo || "/login"} replace />;
    return <Navigate to={redirectTo || "/login"} replace />;
  }

  // 2. Authenticated users attempting cross-domain access without appropriate credentials
  if (requiresStudent && !studentAuth) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiresGuardian && !guardianAuth) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiresStaffScope && !staffAuth) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiresClassroom && !studentAuth && !staffAuth) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Staff Role-Based Access Control (RBAC) validation
  if (requiresStaffScope) {
    const currentRole = getStaffRole();

    const hasAdminAccess = roles.includes("admin") && isAdminStaff(currentRole);
    const hasAdvisorAccess = roles.includes("advisor") && (isAdvisorStaff(currentRole) || isAdminStaff(currentRole));
    const hasTutorAccess = roles.includes("tutor") && (isTutorStaff(currentRole) || isAdminStaff(currentRole));
    const hasVideoVaultAccess = roles.includes("video-vault") && canAccessVideoVault(currentRole);
    const hasGeneralStaffAccess = roles.includes("staff");

    const isAuthorized =
      hasGeneralStaffAccess ||
      hasAdminAccess ||
      hasAdvisorAccess ||
      hasTutorAccess ||
      hasVideoVaultAccess;

    if (!isAuthorized) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}



