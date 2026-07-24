import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ZoomMeetingSession from '../../components/private/Students/ZoomMeetingSession';
import StaffDashboardLayout from '../../components/private/staffs/DashboardLayout.jsx';  
import { useStaffAuth } from '../../context/StaffAuthContext';

export default function StaffMeetWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sessionDetails, setSessionDetails] = useState(null);
  const staffToken = localStorage.getItem("staff_token");
  const { setIsClassActive } = useStaffAuth();

  useEffect(() => {
    // Check if we arrived via routing state with the necessary details
    const state = location.state;
    if (!state || !state.class_link || !state.class_schedule_id) {
        // Fallback to schedule dashboard if accessed directly
        const staffRole = localStorage.getItem("staff_role") || "";
        const redirectPath = staffRole.toLowerCase() === 'course_advisor' || staffRole.toLowerCase() === 'advisor'
            ? '/staffs/course-advisor/master-class'
            : '/staffs/tutor/master-class';
            
        navigate(redirectPath, { replace: true });
        return;
    }

    if (!staffToken) {
        console.error("No staff token available.");
        navigate('/staff/login', { replace: true });
        return;
    }

    setSessionDetails({
      class_link: state.class_link,
      class_schedule_id: state.class_schedule_id
    });

    if (setIsClassActive) setIsClassActive(true);

    return () => {
      if (setIsClassActive) setIsClassActive(false);
    };
  }, [location, navigate, staffToken, setIsClassActive]);

  if (!sessionDetails) {
      return (
          <div className="w-screen h-screen flex items-center justify-center bg-gray-950 text-white">
              <span className="font-bold tracking-widest text-[#BB9E7F] animate-pulse">Loading secure staff session...</span>
          </div>
      );
  }

  const isZoom = sessionDetails.class_link?.includes("zoom.us") || sessionDetails.class_link?.includes("zoom");

  return (
    <StaffDashboardLayout pagetitle={isZoom ? "Live Zoom Class (Host)" : "Live Class Session"}>
      {isZoom ? (
        <div className="py-6 max-w-5xl mx-auto">
          <ZoomMeetingSession classSessionId={sessionDetails.class_schedule_id} />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="p-8 bg-gray-900 border border-red-500/20 rounded-2xl text-center max-w-md">
            <h3 className="text-xl font-bold text-white mb-2">Unsupported Classroom Type</h3>
            <p className="text-gray-400 text-sm mb-4">
              Google Meet and Jitsi links should be started in a new tab rather than embedded in-app.
            </p>
            <a 
              href={sessionDetails.class_link} 
              target="_blank" 
              rel="noreferrer"
              className="inline-block px-6 py-2.5 bg-[#BB9E7F] text-black font-black rounded-lg text-xs uppercase tracking-widest hover:bg-[#a68a6d]"
            >
              Open external classroom
            </a>
          </div>
        </div>
      )}
    </StaffDashboardLayout>
  );
}
