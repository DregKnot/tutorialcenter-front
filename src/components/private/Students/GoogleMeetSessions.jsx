import { useEffect, useRef } from "react";

export default function GoogleMeetSessions({ class_link, studentId, class_schedule_id }) {
    const sessions = useRef([]);
    const hasUnmounted = useRef(false);
    const popupRef = useRef(null);

    useEffect(() => {
        const handleJoin = () => {
            const joinedAt = new Date().toISOString();
            // Only push if the previous session is closed or if it's the first one
            if (sessions.current.length === 0 || sessions.current[sessions.current.length - 1].leftAt !== null) {
                sessions.current.push({ joinedAt, leftAt: null, minutesOnCall: 0 });
            }
        };

        const sendPayload = () => {
            const payload = {
                studentId: studentId?.toString(),
                class_schedule_id: class_schedule_id?.toString(),
                sessions: sessions.current
            };

            const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
            const syncUrl = `${API_BASE_URL}/api/sessions/sync`;
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(syncUrl, blob);
        };

        const handleLeave = () => {
            if (hasUnmounted.current || sessions.current.length === 0) return;
            
            const currentSession = sessions.current[sessions.current.length - 1];
            if (currentSession.leftAt !== null) return; 

            const leftAt = new Date().toISOString();
            currentSession.leftAt = leftAt;
            
            const joinTime = new Date(currentSession.joinedAt).getTime();
            const leaveTime = new Date(leftAt).getTime();
            currentSession.minutesOnCall = Math.round((leaveTime - joinTime) / 60000);

            sendPayload();
            // Don't set hasUnmounted to true here unless the COMPONENT is actually unmounting
        };

        const handleBeforeUnload = () => {
            if (popupRef.current) popupRef.current.close();
            handleLeave();
        };

        // 1. Start the session
        handleJoin();

        // 2. Open the Meet Popup
        if (class_link && !popupRef.current) {
            const width = 1000;
            const height = 700;
            const left = (window.screen.width / 2) - (width / 2);
            const top = (window.screen.height / 2) - (height / 2);

            popupRef.current = window.open(
                class_link,
                "GoogleMeetPopup",
                `width=${width},height=${height},left=${left},top=${top},resizable=yes`
            );

            if (!popupRef.current) {
                alert("Please enable popups to join the class.");
            }
        }

        // 3. The "Heartbeat" - Checks if the user closed the Meet window directly
        const checkPopupStatus = setInterval(() => {
            if (popupRef.current && popupRef.current.closed) {
                handleLeave();
                clearInterval(checkPopupStatus);
                popupRef.current = null;
            }
        }, 3000);

        window.addEventListener("beforeunload", handleBeforeUnload);
        
        return () => {
            hasUnmounted.current = true; // Mark as unmounted only when React kills the component
            clearInterval(checkPopupStatus);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.close();
            }
            handleLeave();
        };
    }, [class_link, studentId, class_schedule_id]);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl border border-[#BB9E7F]/30 shadow-2xl">
            <div className="w-16 h-16 border-4 border-[#BB9E7F] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-white tracking-tight text-center">Class Session Active</h2>
            <p className="text-gray-400 mt-2 max-w-xs text-center">
                The Google Meet opened in a new window. Keep this tab open to track your attendance.
            </p>
            <button 
                onClick={() => {
                    popupRef.current = window.open(class_link, "GoogleMeetPopup", "width=1000,height=700");
                }}
                className="mt-6 px-6 py-2 bg-[#BB9E7F] text-black font-bold rounded-lg hover:bg-[#a68a6d] transition-colors"
            >
                Re-open Meeting
            </button>
        </div>
    );
}