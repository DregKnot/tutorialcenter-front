import React, { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

const ZoomMeetingSession = forwardRef(({ classSessionId, onLeave }, ref) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sdkReady, setSdkReady] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
    
    const staffToken = localStorage.getItem("staff_token");
    const studentToken = localStorage.getItem("student_token") || localStorage.getItem("token");
    
    const isStaff = !!staffToken;
    const token = isStaff ? staffToken : studentToken;
    const signatureEndpoint = isStaff 
        ? `${API_BASE_URL}/api/staffs/zoom/signature` 
        : `${API_BASE_URL}/api/students/zoom/signature`;

    // Build leave URL based on user role
    const getLeaveUrl = useCallback(() => {
        if (isStaff) {
            const staffRole = localStorage.getItem("staff_role") || "";
            if (staffRole.toLowerCase() === 'course_advisor' || staffRole.toLowerCase() === 'advisor') {
                return `${window.location.origin}/staffs/course-advisor/master-class?feedback_session=${classSessionId}`;
            }
            return `${window.location.origin}/staffs/tutor/master-class?feedback_session=${classSessionId}`;
        }
        return `${window.location.origin}/student/class-schedule?feedback_session=${classSessionId}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStaff, classSessionId]);

    // Expose leaveMeeting method to parent component
    useImperativeHandle(ref, () => ({
        leaveMeeting: () => {
            try {
                const { ZoomMtg } = require("@zoom/meetingsdk");
                ZoomMtg.leaveMeeting({});
            } catch (e) {
                console.warn("Error leaving Zoom meeting:", e);
                if (onLeave) onLeave();
            }
        }
    }));

    // Step 1: Dynamically import and prepare the Zoom SDK only when this component mounts
    useEffect(() => {
        let cancelled = false;

        const loadSdk = async () => {
            try {
                const { ZoomMtg } = await import("@zoom/meetingsdk");
                ZoomMtg.preLoadWasm();
                ZoomMtg.prepareWebSDK();

                if (!cancelled) {
                    setSdkReady(true);
                }
            } catch (err) {
                console.error("Failed to load Zoom SDK:", err);
                if (!cancelled) {
                    setError("Failed to load Zoom SDK. Please refresh.");
                    setLoading(false);
                }
            }
        };

        loadSdk();

        return () => {
            cancelled = true;
        };
    }, []);

    // Step 2: Once SDK is ready, fetch signature and join
    useEffect(() => {
        if (!sdkReady || !classSessionId) return;

        let isMounted = true;

        const initializeZoom = async () => {
            try {
                if (!isMounted) return;
                setLoading(true);
                setError(null);

                if (!token) {
                    throw new Error("Authentication token not found. Please log in again.");
                }

                // 1. Fetch Zoom Signature from backend
                const response = await axios.post(
                    signatureEndpoint,
                    { class_session_id: classSessionId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const data = response.data;
                if (!data.success) {
                    throw new Error(data.message || "Failed to fetch Zoom credentials.");
                }

                if (!isMounted) return;

                const { ZoomMtg } = await import("@zoom/meetingsdk");

                // 2. Initialize Zoom Client View (full-page native experience)
                ZoomMtg.init({
                    leaveUrl: getLeaveUrl(),
                    patchJsMedia: true,
                    leaveOnPageUnload: true,
                    success: () => {
                        if (!isMounted) return;

                        // 3. Join the Zoom Meeting
                        ZoomMtg.join({
                            signature: data.signature,
                            sdkKey: data.sdk_key,
                            meetingNumber: data.meeting_number,
                            passWord: data.password,
                            userName: data.user_name,
                            userEmail: "",
                            tk: "",
                            success: () => {
                                if (isMounted) {
                                    setLoading(false);
                                }

                                // If student, record initial join attendance and initiate periodic heartbeat
                                if (!isStaff && token && classSessionId) {
                                    axios.post(
                                        `${API_BASE_URL}/api/students/classes/attendance/join`,
                                        { class_session_id: classSessionId },
                                        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
                                    ).catch((err) => console.warn("Attendance join ping failed:", err));
                                }
                            },
                            error: (joinErr) => {
                                console.error("Zoom Join Error:", joinErr);
                                if (isMounted) {
                                    setError(joinErr.result || joinErr.message || "Failed to join Zoom meeting.");
                                    setLoading(false);
                                }
                            }
                        });
                    },
                    error: (initErr) => {
                        console.error("Zoom Init Error:", initErr);
                        if (isMounted) {
                            setError(initErr.message || "Failed to initialize Zoom.");
                            setLoading(false);
                        }
                    }
                });

            } catch (err) {
                console.error("Zoom SDK Error:", err);
                if (isMounted) {
                    setError(err.response?.data?.message || err.message || "Could not launch Zoom classroom.");
                    setLoading(false);
                }
            }
        };

        initializeZoom();

        // 4. Background heartbeat timer every 120 seconds while student is in Zoom
        let heartbeatInterval = null;
        if (!isStaff && token && classSessionId) {
            heartbeatInterval = setInterval(() => {
                axios.post(
                    `${API_BASE_URL}/api/students/classes/attendance/heartbeat`,
                    { class_session_id: classSessionId },
                    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
                ).catch((err) => console.warn("Attendance heartbeat ping failed:", err));
            }, 120000);
        }

        return () => {
            isMounted = false;
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
            }
            if (!isStaff && token && classSessionId) {
                axios.post(
                    `${API_BASE_URL}/api/students/classes/attendance/leave`,
                    { class_session_id: classSessionId },
                    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
                ).catch(() => {});
            }
        };
    }, [sdkReady, classSessionId, signatureEndpoint, token, getLeaveUrl, isStaff, API_BASE_URL]);

    // Client View renders into #zmmtg-root which Zoom injects automatically.
    // We only need to show loading/error overlays here, and a style tag to unhide the zoom root.
    return (
        <>
            <style>{`#zmmtg-root { display: block !important; }`}</style>
            
            {/* Spinner Overlay */}
            {loading && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#030712",
                    zIndex: 99999
                }}>
                    <div style={{
                        width: 56,
                        height: 56,
                        border: "4px solid #BB9E7F",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginBottom: 16
                    }} />
                    <span style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: "#BB9E7F",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em"
                    }}>
                        Connecting to Secure Zoom Feed...
                    </span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#030712",
                    zIndex: 99999,
                    padding: 24,
                    textAlign: "center"
                }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        backgroundColor: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16
                    }}>
                        <Icon icon="heroicons:exclamation-triangle-solid" style={{ width: 32, height: 32, color: "#ef4444" }} />
                    </div>
                    <h3 style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "white",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 8
                    }}>Class Connection Failed</h3>
                    <p style={{
                        color: "#9ca3af",
                        fontSize: 14,
                        maxWidth: 400,
                        marginBottom: 24
                    }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: "10px 24px",
                            backgroundColor: "#dc2626",
                            color: "white",
                            fontWeight: 700,
                            borderRadius: 12,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em"
                        }}
                    >
                        Retry Connection
                    </button>
                </div>
            )}
        </>
    );
});

export default ZoomMeetingSession;
