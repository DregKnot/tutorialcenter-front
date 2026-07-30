import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GuardianDashboard() {
  const navigate = useNavigate();
  const [guardian, setGuardian] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("guardian_token");
    const info = localStorage.getItem("guardian_info");

    if (!token) {
      navigate("/guardian/login");
      return;
    }

    if (info) {
      try {
        setGuardian(JSON.parse(info));
      } catch (e) {
        console.error("Failed to parse guardian info:", e);
      }
    }
  }, [navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = localStorage.getItem("guardian_token");
      if (token) {
        await axios.post(`${API_BASE_URL}/api/guardians/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("guardian_token");
      localStorage.removeItem("guardian_info");
      setLoggingOut(false);
      navigate("/guardian/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] p-8 flex flex-col items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] max-w-lg w-full text-center border border-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-[#09314F] text-white flex items-center justify-center font-black text-xl mx-auto mb-6">
          {guardian?.firstname?.[0]?.toUpperCase() || "G"}
        </div>
        <h1 className="text-2xl font-bold text-[#09314F] mb-2">
          Welcome{guardian?.firstname ? `, ${guardian.firstname}` : ""}!
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Guardian Dashboard — Features are coming soon!
        </p>
        
        <button 
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-8 py-3 bg-[#E83831] text-white rounded-full font-bold hover:bg-[#d42f29] transition-all shadow-lg shadow-red-600/20 disabled:opacity-60 active:scale-[0.97]"
        >
          {loggingOut ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Logging out...
            </div>
          ) : (
            "Logout"
          )}
        </button>
      </div>
    </div>
  );
}
