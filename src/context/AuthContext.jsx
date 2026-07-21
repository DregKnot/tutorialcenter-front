import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
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

  const login = useCallback((token, studentData) => {
    setIsSplashing(true);
    localStorage.setItem("student_token", token);
    localStorage.setItem("student_info", JSON.stringify(studentData));
    localStorage.setItem("studentdata", JSON.stringify({ data: studentData }));
    localStorage.setItem("last_activity_at", Date.now().toString());
    localStorage.setItem("student_left_collapsed", "false");

    setToken(token);
    setStudent(studentData);
    
    setTimeout(() => setIsSplashing(false), 2500); // Allow video to play
  }, []);

  const logout = useCallback(async () => {
    setIsSplashing(true);
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
      // Clear all local storage data
      localStorage.clear();

      setToken(null);
      setStudent(null);
      setIsInactiveModalOpen(false);
      setIsClassActive(false);

      // Redirect to student login with slight delay for splash screen
      setTimeout(() => {
        setIsSplashing(false);
        navigate("/student/login");
      }, 2500);
    }
  }, [navigate]);

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


  // Heartbeat to signal to other tabs/windows that a class or recorded video is active
  useEffect(() => {
    if (!token) return;

    if (isClassActive) {
      const updateHeartbeat = () => {
        const now = Date.now().toString();
        localStorage.setItem("student_active_class_heartbeat", now);
        localStorage.setItem("last_activity_at", now);
      };

      updateHeartbeat();
      const heartbeatInterval = setInterval(updateHeartbeat, 2000);

      return () => clearInterval(heartbeatInterval);
    }
  }, [token, isClassActive]);

  // Interaction monitoring & autologout
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
      // 1. If class/recorded session is active in this tab
      if (isClassActive) {
        handleActivity();
        setIsInactiveModalOpen(false);
        return;
      }

      // 2. Check if a masterclass or recorded session is active in another tab/window
      const heartbeat = parseInt(localStorage.getItem("student_active_class_heartbeat") || "0");
      const isOtherTabClassActive = Date.now() - heartbeat < 10000;

      if (isOtherTabClassActive) {
        handleActivity();
        setIsInactiveModalOpen(false);
        return;
      }

      // 3. Otherwise calculate inactivity duration
      const lastActivity = parseInt(localStorage.getItem("last_activity_at") || "0");
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
  }, [token, isClassActive, logout]);

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
