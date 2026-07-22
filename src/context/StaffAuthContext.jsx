import { createContext, useContext, useEffect, useState, useCallback } from "react";

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [staff, setStaff] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSplashing, setIsSplashing] = useState(false);
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);
  const [isClassActive, setIsClassActive] = useState(false);

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

  const login = useCallback((token, staffData, staffRole) => {
    setIsSplashing(true);
    localStorage.setItem("staff_token", token);
    localStorage.setItem("staff_info", JSON.stringify(staffData));
    localStorage.setItem("staff_role", staffRole);
    localStorage.setItem("staff_last_activity_at", Date.now().toString());
    localStorage.setItem("staff_left_collapsed", "false");

    setToken(token);
    setStaff(staffData);
    setRole(staffRole);

    setTimeout(() => setIsSplashing(false), 2500);
  }, []);

  const logout = useCallback(async () => {
    setIsSplashing(true);
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

      // Redirect to staff login
      setTimeout(() => {
        setIsSplashing(false);
        window.location.href = "/staff/login";
      }, 2500);
    }
  }, []);

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
