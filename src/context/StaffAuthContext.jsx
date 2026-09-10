import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const getStaffDashboardRoute = (staffRole) => {
  const role = (staffRole || "").toLowerCase();
  if (role === "admin") return "/staffs/dashboard";
  if (role === "coo" || role === "preview" || role === "operations") return "/staffs/coo/dashboard";
  if (role === "moderator") return "/staffs/manage-exams";
  if (role === "course advisor" || role === "advisor") return "/staffs/course-advisor/dashboard";
  return "/staffs/tutor/dashboard";
};

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(null);
  const [staff, setStaff] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSplashing, setIsSplashing] = useState(false);
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);
  const [isClassActive, setIsClassActive] = useState(false);

  const splashStartTimeRef = useRef(0);
  const splashTargetRouteRef = useRef(null);

  // Load from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("staff_token");
    const storedInfo = localStorage.getItem("staff_info");
    const storedRole = localStorage.getItem("staff_role");

    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);
    if (storedInfo) setStaff(JSON.parse(storedInfo));

    // Initialize activity tracker
    localStorage.setItem("staff_last_activity_at", Date.now().toString());

    setLoading(false);
  }, []);

  const login = useCallback((token, staffData, staffRole, customTargetRoute) => {
    const target = customTargetRoute || getStaffDashboardRoute(staffRole);
    setIsSplashing(true);
    splashStartTimeRef.current = Date.now();
    splashTargetRouteRef.current = target;

    localStorage.setItem("staff_token", token);
    localStorage.setItem("staff_info", JSON.stringify(staffData));
    localStorage.setItem("staff_role", staffRole);
    localStorage.setItem("staff_last_activity_at", Date.now().toString());
    localStorage.setItem("staff_left_collapsed", "false");

    setToken(token);
    setStaff(staffData);
    setRole(staffRole);

    if (target) {
      navigate(target, { replace: true });
    }
  }, [navigate]);

  const logout = useCallback(async (targetRoute = "/staff/login") => {
    setIsSplashing(true);
    splashStartTimeRef.current = Date.now();
    splashTargetRouteRef.current = targetRoute;

    try {
      const currentToken = localStorage.getItem("staff_token");
      if (currentToken) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
        await fetch(`${API_BASE_URL}/api/staffs/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${currentToken}`,
            "Accept": "application/json"
          }
        });
      }
    } catch (error) {
      console.error("Staff logout failed:", error);
    } finally {
      // Clear all local storage data
      localStorage.clear();

      setToken(null);
      setStaff(null);
      setRole(null);
      setIsInactiveModalOpen(false);

      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [navigate]);

  // Synchronized Splash Dismissal Effect:
  // Guarantees that the splash screen only unveils once the staff dashboard/login is active AND minimum display flourish time has passed.
  useEffect(() => {
    if (!isSplashing) return;

    const targetRoute = splashTargetRouteRef.current;
    if (!targetRoute) return;

    const currentPath = (location?.pathname || "").toLowerCase();
    const targetPath = targetRoute.toLowerCase();

    const hasReachedTarget =
      currentPath === targetPath ||
      currentPath.startsWith(targetPath) ||
      (targetPath.includes("staffs") && !currentPath.includes("login"));

    if (hasReachedTarget) {
      const elapsed = Date.now() - (splashStartTimeRef.current || 0);
      const MIN_SPLASH_TIME = 2200;
      const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed);

      const timer = setTimeout(() => {
        setIsSplashing(false);
        splashTargetRouteRef.current = null;
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [location?.pathname, isSplashing]);

  // Safety fallback
  useEffect(() => {
    if (!isSplashing) return;

    const safetyTimer = setTimeout(() => {
      setIsSplashing(false);
      splashTargetRouteRef.current = null;
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, [isSplashing]);

  const resetActivity = useCallback(() => {
    localStorage.setItem("staff_last_activity_at", Date.now().toString());
    setIsInactiveModalOpen(false);
  }, []);

  // Heartbeat to signal to other tabs/windows that a class is active
  useEffect(() => {
    if (!token) return;

    if (isClassActive) {
      const updateHeartbeat = () => {
        const now = Date.now().toString();
        localStorage.setItem("staff_active_class_heartbeat", now);
        localStorage.setItem("staff_last_activity_at", now);
      };

      updateHeartbeat();
      const heartbeatInterval = setInterval(updateHeartbeat, 2000);

      return () => clearInterval(heartbeatInterval);
    }
  }, [token, isClassActive]);

  // Inactivity monitoring & autologout disabled per staff settings
  useEffect(() => {
    setIsInactiveModalOpen(false);
  }, []);

  return (
    <StaffAuthContext.Provider
      value={{
        token,
        staff,
        role,
        login,
        logout,
        isAuthenticated: Boolean(token),
        loading,
        isSplashing,
        isStaffSplashing: isSplashing,
        setIsSplashing,
        isInactiveModalOpen,
        resetActivity,
        isClassActive,
        setIsClassActive
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export const useStaffAuth = () => useContext(StaffAuthContext);

export { default as SplashScreen } from "../components/public/SplashScreen.jsx";
export { default as LogoAnimation } from "../components/public/LogoAnimation.jsx";
