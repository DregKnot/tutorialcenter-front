import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClassActive, setIsClassActive] = useState(false);
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationType, setVerificationType] = useState(null); // 'phone' or 'email'

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
    localStorage.setItem("student_token", token);
    localStorage.setItem("student_info", JSON.stringify(studentData));
    localStorage.setItem("studentdata", JSON.stringify({ data: studentData }));
    localStorage.setItem("last_activity_at", Date.now().toString());

    setToken(token);
    setStudent(studentData);
  }, []);

  const logout = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem("student_token");
      if (currentToken) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
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
      // Clear all student-related local storage data
      localStorage.removeItem("student_token");
      localStorage.removeItem("student_info");
      localStorage.removeItem("studentBiodata");
      localStorage.removeItem("studentdata");
      localStorage.removeItem("studentEmail");
      localStorage.removeItem("studentTel");
      localStorage.removeItem("last_activity_at");

      setToken(null);
      setStudent(null);
      setIsInactiveModalOpen(false);
      setIsClassActive(false);

      // Redirect to student login
      window.location.href = "/student/login";
    }
  }, []);

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

  // Get alert message
  const getAlertMessage = useCallback(() => {
    if (!student) return "";
    
    const hasEmail = student.email && student.email.trim();
    const hasPhone = student.tel && student.tel.trim();
    const emailVerified = student.email_verified_at;
    const phoneVerified = student.tel_verified_at;
    
    const missingItems = [];
    if (!hasEmail || !emailVerified) missingItems.push("update your email");
    if (!hasPhone || !phoneVerified) missingItems.push("update your phone number");
    
    return missingItems.join(" and ");
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


  // Interaction monitoring
  useEffect(() => {
    if (!token) return;

    const handleActivity = () => {
      localStorage.setItem("last_activity_at", Date.now().toString());
    };

    // Set initial activity on login/start
    handleActivity();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    const interval = setInterval(() => {
      if (isClassActive) {
        handleActivity();
        return;
      }

      const lastActivity = parseInt(localStorage.getItem("last_activity_at") || "0");
      const diff = Date.now() - lastActivity;

      const THREE_MINUTES = 3 * 60 * 1000;
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (diff >= FIVE_MINUTES) {
        logout();
      } else if (diff >= THREE_MINUTES) {
        setIsInactiveModalOpen(prev => {
           if (!prev) return true;
           return prev;
        });
      } else {
        setIsInactiveModalOpen(prev => {
           if (prev) return false;
           return prev;
        });
      }
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
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
        closeVerificationModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
