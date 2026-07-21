import React, { useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ZoomMeetingSession from "../components/private/Students/ZoomMeetingSession";
import { useAuth } from "../context/AuthContext";
import { useStaffAuth } from "../context/StaffAuthContext";

export default function ClassRoom() {
    const { classSessionId } = useParams();
    const navigate = useNavigate();
    const zoomRef = useRef(null);

    const { setIsClassActive: setStudentClassActive } = useAuth();
    const { setIsClassActive: setStaffClassActive } = useStaffAuth();

    useEffect(() => {
        // Suppress Zoom SDK internal warnings from triggering Webpack dev overlay
        const preventDevOverlay = (e) => {
            e.stopImmediatePropagation();
        };

        window.addEventListener('error', preventDevOverlay, true);
        window.addEventListener('unhandledrejection', preventDevOverlay, true);

        // Deactivate auto-logout countdown while in the masterclass
        if (setStudentClassActive) setStudentClassActive(true);
        if (setStaffClassActive) setStaffClassActive(true);

        return () => {
            window.removeEventListener('error', preventDevOverlay, true);
            window.removeEventListener('unhandledrejection', preventDevOverlay, true);

            // Reactivate auto-logout countdown when leaving the class
            if (setStudentClassActive) setStudentClassActive(false);
            if (setStaffClassActive) setStaffClassActive(false);
        };
    }, [setStudentClassActive, setStaffClassActive]);

    const handleLeaveRedirect = () => {
        const isStaff = !!localStorage.getItem("staff_token");
        if (isStaff) {
            const staffRole = localStorage.getItem("staff_role") || "";
            if (staffRole.toLowerCase() === 'course_advisor' || staffRole.toLowerCase() === 'advisor') {
                navigate('/staffs/course-advisor/master-class');
            } else {
                navigate('/staffs/tutor/master-class');
            }
        } else {
            navigate('/student/class-schedule');
        }
    };

    // Client View renders into #zmmtg-root (injected by the SDK into document.body).
    // This component just initializes the meeting; Zoom handles the full-page UI.
    return (
        <ZoomMeetingSession ref={zoomRef} classSessionId={classSessionId} onLeave={handleLeaveRedirect} />
    );
}
