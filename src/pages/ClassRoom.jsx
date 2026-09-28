import React, { useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
        const staffToken = localStorage.getItem("staff_token");
        const isStaff = !!staffToken;
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

        if (isStaff) {
            const staffRole = localStorage.getItem("staff_role") || "";
            if (classSessionId) {
                sessionStorage.setItem("just_completed_class_session_id", String(classSessionId));

                // Save to persistent tutor_unreported_sessions
                try {
                  const stored = JSON.parse(localStorage.getItem("tutor_unreported_sessions") || "[]");
                  if (!stored.some(s => String(s.id) === String(classSessionId))) {
                    stored.unshift({
                      id: classSessionId,
                      class_id: classSessionId,
                      class_title: "Masterclass",
                      subject: "General Subject",
                      session_date: new Date().toISOString(),
                      starts_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      leftAt: Date.now()
                    });
                    localStorage.setItem("tutor_unreported_sessions", JSON.stringify(stored.slice(0, 10)));
                  }
                } catch (e) {}

                // Notify backend that session is concluded
                axios.post(`${API_BASE_URL}/api/tutor/classes/sessions/${classSessionId}/conclude`, {}, {
                  headers: { Authorization: `Bearer ${staffToken}`, Accept: "application/json" }
                }).catch(() => {});
            }
            if (staffRole.toLowerCase() === 'course_advisor' || staffRole.toLowerCase() === 'advisor') {
                navigate(`/staffs/course-advisor/master-class?feedback_session=${classSessionId}`);
            } else {
                navigate(`/staffs/tutor/dashboard?feedback_session=${classSessionId}`, {
                    state: {
                        promptPostClassReport: true,
                        completedSessionId: classSessionId
                    }
                });
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
