import React, { useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ZoomMeetingSession from "../components/private/Students/ZoomMeetingSession";
import { useAuth } from "../context/AuthContext";
import { useStaffAuth } from "../context/StaffAuthContext";
import { isAdvisorStaff, isTutorStaff } from "../utils/roleUtils";

export default function ClassRoom() {
    const { classSessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const zoomRef = useRef(null);

    const { setIsClassActive: setStudentClassActive } = useAuth();
    const { setIsClassActive: setStaffClassActive } = useStaffAuth();

    useEffect(() => {
        // Suppress Zoom SDK internal warnings/cancellations from triggering Webpack dev overlay
        const preventDevOverlay = (e) => {
            const msg = String(e.message || e.reason?.message || e.reason || "");
            const stack = String(e.filename || e.reason?.stack || "");
            if (msg.includes("Job was cancelled") || stack.includes("zoom")) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
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

            // 1. Tutors: conclude session, store in unreported queue, and prompt post-class report
            if (isTutorStaff(staffRole)) {
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
                navigate(`/staffs/tutor/dashboard?feedback_session=${classSessionId}`, {
                    state: {
                        promptPostClassReport: true,
                        completedSessionId: classSessionId
                    }
                });
                return;
            }

            // 2. Course Advisors: redirect to advisor supervision feedback report
            if (isAdvisorStaff(staffRole)) {
                if (classSessionId) {
                    sessionStorage.setItem("just_completed_class_session_id", String(classSessionId));
                }
                navigate(`/staffs/course-advisor/master-class?feedback_session=${classSessionId}`);
                return;
            }

            // 3. Admin / COO / Moderator / Management Observers:
            // Never prompt tutor/advisor report, never poison unreported queues, return cleanly to calendar
            const returnPath = location.state?.from || '/staffs/calendar';
            navigate(returnPath);
            return;
        }

        // Students: return to class schedule without report query params
        navigate('/student/class-schedule');
    };

    // Client View renders into #zmmtg-root (injected by the SDK into document.body).
    // This component just initializes the meeting; Zoom handles the full-page UI.
    return (
        <ZoomMeetingSession ref={zoomRef} classSessionId={classSessionId} onLeave={handleLeaveRedirect} />
    );
}
