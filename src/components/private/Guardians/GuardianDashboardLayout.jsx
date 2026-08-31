import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";
import GuardianSidebar from "./GuardianSidebar";
import TC_logo from "../../../assets/images/tutorial_logo.webp";

export default function GuardianDashboardLayout({
  children,
  pageTitle = "Dashboard",
  guardianData = null,
}) {
  const navigate = useNavigate();
  
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("guardian_sidebar_collapsed");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guardian, setGuardian] = useState(guardianData);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const handleSetCollapsed = (val) => {
    setCollapsed(val);
    localStorage.setItem("guardian_sidebar_collapsed", JSON.stringify(val));
  };

  useEffect(() => {
    if (guardianData) {
      setGuardian(guardianData);
      return;
    }
    const token = localStorage.getItem("guardian_token");
    const info = localStorage.getItem("guardian_info");
    if (!token) {
      navigate("/guardian/login");
      return;
    }
    if (info) {
      try { setGuardian(JSON.parse(info)); } catch (e) {}
    }
  }, [guardianData, navigate]);

  // Logout Handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("guardian_token");
      if (token) {
        await axios.post(`${API_BASE_URL}/api/guardians/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) {} finally {
      localStorage.removeItem("guardian_token");
      localStorage.removeItem("guardian_info");
      navigate("/guardian/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#071927] text-gray-800 dark:text-gray-100 flex flex-col font-sans">
      
      {/* ── MOBILE HEADER (Top Navigation for Mobile / Tablet) ────────────── */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1.5 text-gray-600 hover:text-[#09314F] dark:text-gray-300 dark:hover:text-white rounded-xl active:scale-95 transition-transform"
            aria-label="Open Navigation Menu"
          >
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>
          <Link to="/guardian/dashboard">
            <img src={TC_logo} alt="Tutorial Center" className="h-7 w-auto object-contain" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#09314F] text-[#C5A97A] flex items-center justify-center font-black text-xs shadow-sm">
            {guardian?.firstname?.[0]?.toUpperCase() || "G"}
          </div>
        </div>
      </div>

      {/* ── NATIVE GUARDIAN SIDEBAR ───────────────────────────────────────── */}
      <GuardianSidebar
        collapsed={collapsed}
        setCollapsed={handleSetCollapsed}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        guardian={guardian}
        onLogout={handleLogout}
      />

      {/* ── MAIN FULL-PAGE CONTENT WRAPPER ─────────────────────────────────── */}
      <div
        className={`flex-1 transition-all duration-300 flex flex-col ${
          collapsed ? "lg:pl-24" : "lg:pl-72"
        }`}
      >
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-7 w-full max-w-[1600px] mx-auto space-y-5">
          {children}
        </main>
      </div>

    </div>
  );
}
