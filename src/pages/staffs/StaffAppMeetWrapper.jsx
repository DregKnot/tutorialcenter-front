import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffDashboardLayout from '../../components/private/staffs/DashboardLayout.jsx';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { Icon } from '@iconify/react';

export default function StaffAppMeetWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState(null);
  
  const staffToken = localStorage.getItem("staff_token");
  const { setIsClassActive } = useStaffAuth();

  useEffect(() => {
    const state = location.state;
    if (!state || !state.class_link) {
      const staffRole = localStorage.getItem("staff_role") || "";
      const redirectPath = staffRole.toLowerCase() === 'course_advisor' || staffRole.toLowerCase() === 'advisor'
          ? '/staffs/course-advisor/master-class'
          : '/staffs/tutor/master-class';
      navigate(redirectPath, { replace: true });
      return;
    }

    if (!staffToken) {
      navigate('/staff/login', { replace: true });
      return;
    }

    setSessionDetails({
      class_link: state.class_link,
      class_schedule_id: state.class_schedule_id
    });

    if (setIsClassActive) setIsClassActive(true);

    // Launch the Zoom App
    if (state.class_link) {
        setTimeout(() => {
            window.location.href = state.class_link;
        }, 500);
    }

    return () => {
      if (setIsClassActive) setIsClassActive(false);
    };
  }, [location, navigate, staffToken, setIsClassActive]);

  const handleReturnToDashboard = () => {
      const staffRole = localStorage.getItem("staff_role") || "";
      const redirectPath = staffRole.toLowerCase() === 'course_advisor' || staffRole.toLowerCase() === 'advisor'
          ? '/staffs/course-advisor/master-class'
          : '/staffs/tutor/master-class';
      navigate(redirectPath);
  };

  if (!sessionDetails) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#09314F] text-white">
        <span className="font-bold tracking-widest text-[#BB9E7F] animate-pulse">Initializing...</span>
      </div>
    );
  }

  return (
    <StaffDashboardLayout pagetitle="Live Class (App Mode)">
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="bg-white dark:bg-[#092238] border border-gray-100 dark:border-[#1a4a75]/30 p-10 rounded-[32px] shadow-2xl max-w-lg w-full text-center">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Icon icon="logos:zoom" className="w-12 h-12 relative z-10" />
            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
          </div>
          
          <h2 className="text-2xl font-black text-[#0F2843] dark:text-white mb-2">Class is Running</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            You are currently using the Zoom app for this session. The time countdown is paused while you are here.
          </p>

          <div className="space-y-4">
             <button
                onClick={handleReturnToDashboard}
                className="w-full bg-[#E83831] hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
             >
                <Icon icon="mdi:close-circle" className="w-5 h-5" />
                End Class & Return to Dashboard
             </button>
             
             <button
                onClick={() => window.location.href = sessionDetails.class_link}
                className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white font-bold py-4 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-wider"
             >
                Relaunch Zoom App
             </button>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
