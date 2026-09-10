import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearDashboardCache } from "../utils/dashboardCache";
import { clearActivityCache } from "../hooks/useStudentActivity";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClassActive, setIsClassActive] = useState(false);
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationType, setVerificationType] = useState(null); // 'phone' or 'email'
  const [isSplashing, setIsSplashing] = useState(false);

  // Load from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("student_token");
    const storedInfo = localStorage.getItem("student_info");
    const storedData = localStorage.getItem("studentdata");

    if (storedToken) setToken(storedToken);
    
    // Joint student profile retrieval
    const info = storedInfo ? JSON.parse(storedInfo) : null;
    const data = storedData ? JSON.parse(storedData) : null;
    const jointStudent = info || data?.data || info?.data || null;

    if (jointStudent) setStudent(jointStudent);

    // Initialize activity tracker
    localStorage.setItem("last_activity_at", Date.now().toString());

    setLoading(false);
  }, []);

  const splashStartTimeRef = useRef(0);
  const splashTargetRouteRef = useRef(null);

  const login = useCallback((token, studentData, targetRoute = "/student/dashboard") => {
    setIsSplashing(true);
    splashStartTimeRef.current = Date.now();
    splashTargetRouteRef.current = targetRoute;

    localStorage.setItem("student_token", token);
    localStorage.setItem("student_info", JSON.stringify(studentData));
    localStorage.setItem("studentdata", JSON.stringify({ data: studentData }));
    localStorage.setItem("last_activity_at", Date.now().toString());
    localStorage.setItem("student_left_collapsed", "false");

    setToken(token);
    setStudent(studentData);

    if (targetRoute) {
      navigate(targetRoute, { replace: true });
    }
  }, [navigate]);

  const logout = useCallback(async (targetRoute = "/student/login") => {
    setIsSplashing(true);
    splashStartTimeRef.current = Date.now();
    splashTargetRouteRef.current = targetRoute;

    try {
      const currentToken = localStorage.getItem("student_token");
      if (currentToken) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
        await fetch(`${API_BASE_URL}/api/students/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${currentToken}`,
            "Accept": "application/json"
          }
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear dashboard & activity caches and local/session storage data
      clearDashboardCache(student?.id);
      clearActivityCache();
      try {
        sessionStorage.clear();
      } catch (e) {}
      localStorage.clear();

      setToken(null);
      setStudent(null);
      setIsInactiveModalOpen(false);
      setIsClassActive(false);

      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [navigate, student?.id]);

  // Synchronized Splash Dismissal Effect:
  // Guarantees that the splash screen only unveils once the target route is active AND minimum display flourish time has passed.
  useEffect(() => {
    if (!isSplashing) return;

    const targetRoute = splashTargetRouteRef.current;
    if (!targetRoute) return;

    const currentPath = (location?.pathname || "").toLowerCase();
    const targetPath = targetRoute.toLowerCase();

    // Check if user has arrived at the destination page
    const hasReachedTarget =
      currentPath === targetPath ||
      currentPath.startsWith(targetPath) ||
      (targetPath.includes("dashboard") && !currentPath.includes("login"));

    if (hasReachedTarget) {
      const elapsed = Date.now() - (splashStartTimeRef.current || 0);
      const MIN_SPLASH_TIME = 2200; // 2.2s allows rich branded video intro to play gracefully
      const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed);

      const timer = setTimeout(() => {
        setIsSplashing(false);
        splashTargetRouteRef.current = null;
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [location?.pathname, isSplashing]);

  // Safety fallback: Ensure user is never permanently trapped by an unexpected navigation fault
  useEffect(() => {
    if (!isSplashing) return;

    const safetyTimer = setTimeout(() => {
      setIsSplashing(false);
      splashTargetRouteRef.current = null;
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, [isSplashing]);

  const resetActivity = useCallback(() => {
    localStorage.setItem("last_activity_at", Date.now().toString());
    setIsInactiveModalOpen(false);
  }, []);

  // Determine if profile alert should show
  const shouldShowProfileAlert = useCallback(() => {
    if (!student) return false;
    
    const hasEmail = student.email && student.email.trim();
    const hasPhone = student.tel && student.tel.trim();
    const emailVerified = student.email_verified_at;
    const phoneVerified = student.tel_verified_at;
    
    return (!hasEmail || !emailVerified) || (!hasPhone || !phoneVerified);
  }, [student]);

  const getAlertMessage = useCallback(() => {
    if (!student) return "";
    
    const hasEmail = student.email && student.email.trim();
    const hasPhone = student.tel && student.tel.trim();
    const emailVerified = student.email_verified_at;
    const phoneVerified = student.tel_verified_at;
    
    if (!hasPhone) {
      return "Please add and verify your phone number";
    } else if (!phoneVerified) {
      return "Please verify your phone number";
    }
    
    if (!hasEmail || !emailVerified) {
      return "Please update and verify your email";
    }
    
    return "";
  }, [student]);

  const openVerificationModal = useCallback((type) => {
    setVerificationType(type);
    setIsVerificationModalOpen(true);
  }, []);

  const closeVerificationModal = useCallback(() => {
    setIsVerificationModalOpen(false);
    setVerificationType(null);
  }, []);

  const updateStudent = (updatedFields) => {
    setStudent((prev) => {
      const merged = { ...prev, ...updatedFields };
      saveStudentToStorage(merged);
      return merged;
    });
  };

  const saveStudentToStorage = (studentObj) => {
    localStorage.setItem("student_info", JSON.stringify(studentObj));
    localStorage.setItem("studentdata", JSON.stringify({ data: studentObj }));
  };


  // Helper: check if a URL represents an active live class / classroom session
  const isClassUrl = useCallback((pathname = location?.pathname || window.location.pathname) => {
    if (!pathname) return false;
    const path = pathname.toLowerCase();
    
    // 1. Direct classroom, zoom masterclass, meet, or class URLs
    if (
      path.startsWith("/classroom") ||
      path.startsWith("/zoom/masterclass") ||
      path.startsWith("/student/meet") ||
      path.startsWith("/staffs/meet")
    ) {
      return true;
    }
    
    // 2. Class patterns like /class/123, /classroom/123, /masterclass/123
    if (
      /\/class\/\d+/i.test(path) ||
      /\/classroom\/\d+/i.test(path) ||
      /\/masterclass\/\d+/i.test(path) ||
      /\/zoom\/masterclass\/class\/\d+/i.test(path)
    ) {
      return true;
    }

    // 3. Query params containing class session identification
    try {
      const search = (window.location.search || "").toLowerCase();
      if (search.includes("class_session_id") || search.includes("class_schedule_id")) {
        return true;
      }
    } catch (e) {}

    return false;
  }, [location?.pathname]);

  // Heartbeat to signal to other tabs/windows that a class or recorded video is active
  useEffect(() => {
    if (!token) return;

    const inClass = isClassActive || isClassUrl();

    if (inClass) {
      const updateHeartbeat = () => {
        const now = Date.now().toString();
        localStorage.setItem("student_active_class_heartbeat", now);
        localStorage.setItem("student_active_class_url", location.pathname);
        localStorage.setItem("last_activity_at", now);
      };

      updateHeartbeat();
      const heartbeatInterval = setInterval(updateHeartbeat, 2000);

      return () => {
        clearInterval(heartbeatInterval);
        // If leaving the class, clean up heartbeat so other tabs know immediately
        if (isClassUrl()) {
          localStorage.removeItem("student_active_class_heartbeat");
          localStorage.removeItem("student_active_class_url");
          localStorage.setItem("last_activity_at", Date.now().toString());
        }
      };
    }
  }, [token, isClassActive, isClassUrl, location.pathname]);

  // Interaction monitoring & autologout with class protection
  const wasInClassRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    const handleActivity = () => {
      localStorage.setItem("last_activity_at", Date.now().toString());
    };

    // Set initial activity on login/start
    handleActivity();

    const events = ["mousemove", "click", "scroll", "keydown", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, handleActivity));

    const interval = setInterval(() => {
      // 1. Check if current tab is on a class URL or has isClassActive set
      const currentTabInClass = isClassActive || isClassUrl();

      // 2. Check if a masterclass or recorded session is active in another tab/window
      const heartbeat = parseInt(localStorage.getItem("student_active_class_heartbeat") || "0", 10);
      const isOtherTabClassActive = (Date.now() - heartbeat) < 15000;

      const isInAnyClass = currentTabInClass || isOtherTabClassActive;

      // When the student is in any class (whether in this tab or another tab opened from dashboard, calendar, or masterclass):
      // PAUSE the timer, keep refreshing activity timestamp, and prevent inactive modal from opening
      if (isInAnyClass) {
        wasInClassRef.current = true;
        handleActivity();
        setIsInactiveModalOpen(false);
        return;
      }

      // When exiting/finishing a class, immediately refresh activity timestamp so the timer resumes counting fresh from 0
      if (wasInClassRef.current) {
        wasInClassRef.current = false;
        handleActivity();
        setIsInactiveModalOpen(false);
        return;
      }

      // 3. Normal inactivity countdown (only runs when NOT in any class)
      const lastActivity = parseInt(localStorage.getItem("last_activity_at") || "0", 10);
      const diff = Date.now() - lastActivity;

      const THREE_MINUTES = 3 * 60 * 1000;
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (diff >= FIVE_MINUTES) {
        logout();
      } else if (diff >= THREE_MINUTES) {
        setIsInactiveModalOpen((prev) => (!prev ? true : prev));
      } else {
        setIsInactiveModalOpen((prev) => (prev ? false : prev));
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearInterval(interval);
    };
  }, [token, isClassActive, isClassUrl, logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        student,
        login,
        logout,
        updateStudent,
        isAuthenticated: Boolean(token),
        loading,
        isClassActive,
        setIsClassActive,
        isInactiveModalOpen,
        resetActivity,
        shouldShowProfileAlert: shouldShowProfileAlert(),
        alertMessage: getAlertMessage(),
        isVerificationModalOpen,
        verificationType,
        openVerificationModal,
        closeVerificationModal,
        isSplashing,
        setIsSplashing
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export { default as SplashScreen } from "../components/public/SplashScreen.jsx";
export { default as LogoAnimation } from "../components/public/LogoAnimation.jsx";
