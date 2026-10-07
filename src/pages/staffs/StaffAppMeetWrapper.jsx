import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffDashboardLayout from '../../components/private/staffs/DashboardLayout.jsx';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { isAdvisorStaff, isTutorStaff } from '../../utils/roleUtils';

export default function StaffAppMeetWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [meetingCredentials, setMeetingCredentials] = useState({
    meetingId: '',
    password: '',
    joinUrl: ''
  });
  const [copiedField, setCopiedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const staffToken = localStorage.getItem("staff_token");
  const { setIsClassActive } = useStaffAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  useEffect(() => {
    const state = location.state;
    if (!state || (!state.class_link && !state.class_schedule_id)) {
      const staffRole = localStorage.getItem("staff_role") || "";
      const redirectPath = isAdvisorStaff(staffRole)
          ? '/staffs/course-advisor/master-class'
          : isTutorStaff(staffRole)
          ? '/staffs/tutor/master-class'
          : '/staffs/calendar';
      navigate(redirectPath, { replace: true });
      return;
    }

    if (!staffToken) {
      navigate('/staff/login', { replace: true });
      return;
    }

    const sessionId = state.class_schedule_id;
    const initialJoinUrl = state.zoom_join_url || state.class_link || '';

    setSessionDetails({
      class_link: initialJoinUrl,
      class_schedule_id: sessionId,
      topic: state.topic || "Live Masterclass",
      subject: state.subject || "Subject"
    });

    // Check if credentials came in state
    let extractedMeetingId = state.zoom_meeting_id || '';
    let extractedPassword = state.zoom_meeting_password || '';

    if (!extractedMeetingId && initialJoinUrl) {
      const match = initialJoinUrl.match(/zoom\.(?:us|com)\/(?:j|s|wc\/join)\/(\d+)/i);
      if (match) extractedMeetingId = match[1];
    }

    setMeetingCredentials({
      meetingId: extractedMeetingId,
      password: extractedPassword,
      joinUrl: initialJoinUrl
    });

    // Fetch full credentials from signature endpoint if password or meetingId is missing
    if (sessionId && (!extractedPassword || !extractedMeetingId)) {
      axios.post(`${API_BASE_URL}/api/classes/zoom/signature`, {
        class_session_id: sessionId
      }, {
        headers: { Authorization: `Bearer ${staffToken}`, Accept: "application/json" }
      }).then(res => {
        if (res.data?.success) {
          const resolvedUrl = res.data.zoom_join_url || res.data.join_url || initialJoinUrl;
          setMeetingCredentials({
            meetingId: res.data.meeting_number || extractedMeetingId,
            password: res.data.password || extractedPassword,
            joinUrl: resolvedUrl
          });

          // Credentials loaded successfully
        }
      }).catch((err) => {
        console.warn("Could not fetch Zoom signature credentials:", err);
      });
    }

    return () => {
      if (setIsClassActive) setIsClassActive(false);
    };
  }, [location, navigate, staffToken, setIsClassActive, API_BASE_URL]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }).catch(() => {});
  };

  const handleRelaunch = () => {
    const targetUrl = meetingCredentials.joinUrl || sessionDetails?.class_link;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleReturnToDashboard = () => {
      const staffRole = localStorage.getItem("staff_role") || "";
      const sessionId = sessionDetails?.class_schedule_id;

      // 1. Tutors: conclude session, store in unreported queue, and prompt post-class report
      if (isTutorStaff(staffRole)) {
          if (sessionId) {
              sessionStorage.setItem("just_completed_class_session_id", String(sessionId));

              try {
                const stored = JSON.parse(localStorage.getItem("tutor_unreported_sessions") || "[]");
                if (!stored.some(s => String(s.id) === String(sessionId))) {
                  stored.unshift({
                    id: sessionId,
                    class_id: sessionDetails.class_id || sessionId,
                    class_title: sessionDetails.topic || "Masterclass",
                    subject: sessionDetails.subject || "General Subject",
                    session_date: new Date().toISOString(),
                    starts_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    leftAt: Date.now()
                  });
                  localStorage.setItem("tutor_unreported_sessions", JSON.stringify(stored.slice(0, 10)));
                }
              } catch (e) {}

              if (staffToken) {
                axios.post(`${API_BASE_URL}/api/tutor/classes/sessions/${sessionId}/conclude`, {}, {
                  headers: { Authorization: `Bearer ${staffToken}`, Accept: "application/json" }
                }).catch(() => {});
              }
          }
          navigate(`/staffs/tutor/dashboard${sessionId ? `?feedback_session=${sessionId}` : ''}`, {
              state: {
                  promptPostClassReport: true,
                  completedSessionId: sessionId
              }
          });
          return;
      }

      // 2. Course Advisors: redirect to advisor supervision feedback report
      if (isAdvisorStaff(staffRole)) {
          if (sessionId) {
              sessionStorage.setItem("just_completed_class_session_id", String(sessionId));
          }
          navigate(`/staffs/course-advisor/master-class${sessionId ? `?feedback_session=${sessionId}` : ''}`);
          return;
      }

      // 3. Admin / COO / Moderator / Staff Observer:
      // Never prompt tutor/advisor report, never poison unreported queues, return cleanly to calendar
      const returnPath = location.state?.from || '/staffs/calendar';
      navigate(returnPath);
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
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-6">
        <div className="bg-white dark:bg-[#092238] border border-gray-100 dark:border-[#1a4a75]/30 p-8 sm:p-10 rounded-[32px] shadow-2xl max-w-lg w-full text-center">
          
          {/* Zoom Pulsing Badge */}
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-5 relative">
            <Icon icon="logos:zoom" className="w-10 h-10 relative z-10" />
            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
          </div>
          
          <h2 className="text-2xl font-black text-[#0F2843] dark:text-white mb-1">Class Opened in New Tab</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-6">
            Your live class session was launched in an external Zoom window. Your attendance and classroom session stay active here.
          </p>

          {/* Meeting Credentials Card */}
          <div className="bg-slate-50 dark:bg-[#061726]/60 border border-slate-200 dark:border-[#1a4a75]/40 rounded-2xl p-5 mb-6 text-left shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:key" className="w-4 h-4 text-[#C5A97A]" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Meeting Access Credentials
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Auto-Bypass Active
              </span>
            </div>

            {/* Meeting ID Field */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Meeting ID</span>
                <span className="text-sm font-black font-mono tracking-wider text-slate-800 dark:text-white">
                  {meetingCredentials.meetingId || "Auto-Configured"}
                </span>
              </div>
              {meetingCredentials.meetingId && (
                <button
                  type="button"
                  onClick={() => handleCopy(meetingCredentials.meetingId, 'id')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 active:scale-95 text-slate-700 dark:text-white text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10 shadow-sm transition-all"
                  title="Copy Meeting ID"
                >
                  <Icon icon={copiedField === 'id' ? "lucide:check" : "lucide:copy"} className={`w-3.5 h-3.5 ${copiedField === 'id' ? 'text-emerald-500' : 'text-slate-500'}`} />
                  <span className="text-[11px]">{copiedField === 'id' ? "Copied!" : "Copy"}</span>
                </button>
              )}
            </div>

            {/* Passcode Field */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Passcode</span>
                  <span className="text-sm font-black font-mono tracking-widest text-[#0F2843] dark:text-[#C5A97A]">
                    {meetingCredentials.password ? (
                      showPassword ? meetingCredentials.password : "••••••••"
                    ) : (
                      "Auto-Embedded"
                    )}
                  </span>
                </div>
                {meetingCredentials.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-md mt-3"
                    title={showPassword ? "Hide Passcode" : "Show Passcode"}
                  >
                    <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                  </button>
                )}
              </div>
              {meetingCredentials.password && (
                <button
                  type="button"
                  onClick={() => handleCopy(meetingCredentials.password, 'password')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#09314F] hover:bg-[#1a4a75] active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                  title="Copy Passcode"
                >
                  <Icon icon={copiedField === 'password' ? "lucide:check" : "lucide:copy"} className={`w-3.5 h-3.5 ${copiedField === 'password' ? 'text-emerald-400' : 'text-[#C5A97A]'}`} />
                  <span className="text-[11px]">{copiedField === 'password' ? "Copied!" : "Copy Code"}</span>
                </button>
              )}
            </div>

            <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-400 italic">
              The passcode is hidden for security. The launched Zoom tab automatically authenticates using Zoom's encrypted token. If Zoom desktop prompts you manually, click "Copy Code".
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
             <button
                onClick={handleReturnToDashboard}
                className="w-full bg-[#E83831] hover:bg-red-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
             >
                <Icon icon="mdi:close-circle" className="w-4 h-4" />
                End Class & Return to Overview
             </button>
             
             {sessionDetails?.class_schedule_id && (
               <button
                  onClick={() => navigate(`/classroom/${sessionDetails.class_schedule_id}`)}
                  className="w-full bg-[#09314F] hover:bg-[#15466f] text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
               >
                  <Icon icon="lucide:monitor" className="w-4 h-4 text-[#C5A97A]" />
                  Switch to In-App Classroom
               </button>
             )}

             <button
                onClick={handleRelaunch}
                className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200/60 dark:border-white/10"
             >
                <Icon icon="lucide:external-link" className="w-4 h-4 text-blue-500" />
                Relaunch Zoom in New Tab
             </button>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}

