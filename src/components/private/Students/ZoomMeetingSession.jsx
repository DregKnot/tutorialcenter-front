import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { isAdvisorStaff, isTutorStaff } from "../../../utils/roleUtils";

const ZoomMeetingSession = forwardRef(({ classSessionId, onLeave, onRoleResolved, isStaff: propIsStaff }, ref) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
    const [subscriptionExpiredMessage, setSubscriptionExpiredMessage] = useState("");
    const [sdkReady, setSdkReady] = useState(false);

    const isJoiningRef = useRef(false);
    const hasJoinedRef = useRef(false);
    const prevSessionIdRef = useRef(classSessionId);
    const onRoleResolvedRef = useRef(onRoleResolved);

    useEffect(() => {
        onRoleResolvedRef.current = onRoleResolved;
    }, [onRoleResolved]);

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
    
    const staffToken = localStorage.getItem("staff_token");
    const studentToken = localStorage.getItem("student_token") || localStorage.getItem("token");
    
    let pathname = "";
    try {
      pathname = window.location.pathname || "";
    } catch (e) {}

    const isStudentRoute = pathname.startsWith("/zoom/masterclass") || pathname.startsWith("/student");
    const isStaff = typeof propIsStaff === "boolean"
        ? propIsStaff
        : (isStudentRoute ? false : Boolean(staffToken));

    const token = isStaff ? staffToken : studentToken;
    const signatureEndpoint = isStaff 
        ? `${API_BASE_URL}/api/staffs/zoom/signature` 
        : `${API_BASE_URL}/api/students/zoom/signature`;

    // Build leave URL based on user role
    const getLeaveUrl = useCallback(() => {
        if (isStaff) {
            const staffRole = localStorage.getItem("staff_role") || "";
            if (isAdvisorStaff(staffRole)) {
                return `${window.location.origin}/staffs/course-advisor/master-class?feedback_session=${classSessionId}`;
            }
            if (isTutorStaff(staffRole)) {
                return `${window.location.origin}/staffs/tutor/master-class?feedback_session=${classSessionId}`;
            }
            // Admin, COO, Moderator, or other management observer: return directly to calendar with no report prompts
            return `${window.location.origin}/staffs/calendar`;
        }
        return `${window.location.origin}/student/class-schedule`;
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

    // Suppress internal Zoom SDK Promise cancellations while session is active
    useEffect(() => {
        const handleRejection = (e) => {
            const reasonStr = String(e.reason?.message || e.reason || "");
            const stackStr = String(e.reason?.stack || "");
            if (reasonStr.includes("Job was cancelled") || stackStr.includes("zoom")) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        };

        const handleError = (e) => {
            const msg = String(e.message || "");
            const file = String(e.filename || "");
            if (msg.includes("Job was cancelled") || file.includes("zoom")) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        };

        window.addEventListener("unhandledrejection", handleRejection, true);
        window.addEventListener("error", handleError, true);

        return () => {
            window.removeEventListener("unhandledrejection", handleRejection, true);
            window.removeEventListener("error", handleError, true);
        };
    }, []);

    // Step 2: Once SDK is ready, fetch signature and join
    useEffect(() => {
        if (!sdkReady || !classSessionId) return;

        if (prevSessionIdRef.current !== classSessionId) {
            hasJoinedRef.current = false;
            isJoiningRef.current = false;
            prevSessionIdRef.current = classSessionId;
        }

        if (isJoiningRef.current || hasJoinedRef.current) return;
        isJoiningRef.current = true;

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

                if (onRoleResolvedRef.current) {
                    onRoleResolvedRef.current({
                        role: data.role,
                        isHost: data.is_host ?? (data.role === 1),
                        activeHostStaffId: data.active_host_staff_id,
                    });
                }

                // If Google Meet or direct external link is returned
                if (data.provider === 'google_meet' || data.meeting_type === 'google_meet' || (!data.signature && data.meeting_url)) {
                    if (data.meeting_url) {
                        window.location.href = data.meeting_url;
                        return;
                    }
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
                            userEmail: data.user_email || "",
                            tk: "",
                            success: () => {
                                hasJoinedRef.current = true;
                                isJoiningRef.current = false;
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
                                const joinErrMsg = String(joinErr?.result || joinErr?.message || joinErr || "");
                                if (joinErrMsg.includes("Job was cancelled")) {
                                    console.warn("Zoom internal job cancelled (safe to ignore):", joinErr);
                                    return;
                                }
                                console.error("Zoom Join Error:", joinErr);
                                isJoiningRef.current = false;
                                if (isMounted) {
                                    setError(joinErrMsg || "Failed to join Zoom meeting.");
                                    setLoading(false);
                                }
                            }
                        });
                    },
                    error: (initErr) => {
                        const initErrMsg = String(initErr?.message || initErr || "");
                        if (initErrMsg.includes("Job was cancelled")) {
                            console.warn("Zoom internal init cancelled (safe to ignore):", initErr);
                            return;
                        }
                        console.error("Zoom Init Error:", initErr);
                        isJoiningRef.current = false;
                        if (isMounted) {
                            setError(initErrMsg || "Failed to initialize Zoom.");
                            setLoading(false);
                        }
                    }
                });

            } catch (err) {
                const errMsg = String(err.response?.data?.message || err.message || "");
                if (errMsg.includes("Job was cancelled")) {
                    console.warn("Zoom caught cancelled job:", err);
                    return;
                }
                console.error("Zoom SDK Error:", err);
                isJoiningRef.current = false;
                if (isMounted) {
                    const isExpired = Boolean(
                        err.response?.status === 403 ||
                        err.response?.data?.subscription_expired ||
                        errMsg.toLowerCase().includes("subscription") ||
                        errMsg.toLowerCase().includes("expired")
                    );
                    if (isExpired) {
                        setIsSubscriptionExpired(true);
                        setSubscriptionExpiredMessage(
                            err.response?.data?.message || "Your subscription has expired. Please renew your training plan to join live sessions."
                        );
                    }
                    setError(errMsg || "Could not launch Zoom classroom.");
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

            // Guarantee #root is visible when unmounting from Zoom session
            const rootNode = document.getElementById("root");
            if (rootNode) {
                rootNode.style.display = "block";
            }
            const zmmtgNode = document.getElementById("zmmtg-root");
            if (zmmtgNode) {
                zmmtgNode.style.display = "none";
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

            {/* Subscription Expired Overlay */}
            {isSubscriptionExpired ? (
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
                        width: 72,
                        height: 72,
                        borderRadius: 20,
                        backgroundColor: "rgba(245,158,11,0.15)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 20
                    }}>
                        <Icon icon="solar:lock-bold" style={{ width: 36, height: 36, color: "#f59e0b" }} />
                    </div>
                    <span style={{
                        padding: "4px 14px",
                        backgroundColor: "rgba(245,158,11,0.15)",
                        color: "#fbbf24",
                        border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        marginBottom: 12
                    }}>
                        Subscription Expired
                    </span>
                    <h3 style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: "white",
                        letterSpacing: "-0.02em",
                        marginBottom: 10
                    }}>Live Masterclass Locked</h3>
                    <p style={{
                        color: "#9ca3af",
                        fontSize: 14,
                        maxWidth: 440,
                        lineHeight: 1.6,
                        marginBottom: 28
                    }}>{subscriptionExpiredMessage || "Your course enrollment period has ended. Please renew your training plan on the Payments page to join live masterclass sessions."}</p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                        <button
                            onClick={() => {
                                window.location.href = `${window.location.origin}/student/payments`;
                            }}
                            style={{
                                padding: "12px 28px",
                                backgroundColor: "#E83831",
                                color: "white",
                                fontWeight: 900,
                                borderRadius: 14,
                                border: "none",
                                cursor: "pointer",
                                fontSize: 12,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                boxShadow: "0 10px 25px rgba(232,56,49,0.3)"
                            }}
                        >
                            Renew Subscription Now
                        </button>
                        <button
                            onClick={() => {
                                window.location.href = `${window.location.origin}/student/dashboard`;
                            }}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "rgba(255,255,255,0.08)",
                                color: "#d1d5db",
                                fontWeight: 700,
                                borderRadius: 14,
                                border: "1px solid rgba(255,255,255,0.15)",
                                cursor: "pointer",
                                fontSize: 12,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em"
                            }}
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            ) : error ? (
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
                    <div style={{ display: "flex", gap: 12 }}>
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
                        <button
                            onClick={() => {
                                const leaveUrl = getLeaveUrl();
                                if (leaveUrl) window.location.href = leaveUrl;
                                else if (onLeave) onLeave();
                            }}
                            style={{
                                padding: "10px 24px",
                                backgroundColor: "#1f2937",
                                color: "#9ca3af",
                                fontWeight: 700,
                                borderRadius: 12,
                                border: "1px solid #374151",
                                cursor: "pointer",
                                fontSize: 12,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em"
                            }}
                        >
                            Return to Schedule
                        </button>
                    </div>
                </div>
            ) : null}
        </>
    );
});

export default ZoomMeetingSession;
