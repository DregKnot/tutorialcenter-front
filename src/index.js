import "./index.css";
import App from "./App.js";
import React from "react";
// import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals.js";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { StaffAuthProvider } from "./context/StaffAuthContext.jsx";
import QueryProvider from "./providers/QueryProvider";

import { HelmetProvider } from "react-helmet-async";
import { createRoot } from "react-dom/client";
import axios from "axios";
import {
  clearStaffSession,
  clearStudentSession,
  clearGuardianSession
} from "./utils/auth.js";

// Ensure all API calls explicitly identify as JSON requests to avoid HTML redirect responses from Laravel
axios.defaults.headers.common["Accept"] = "application/json";

// Handle 401 Unauthorized responses globally for staff, student, and guardian sessions
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const pathname = (window.location.pathname || "").toLowerCase();

      // Avoid triggering session-expiry redirects if the 401 was returned by an explicit login attempt
      const isAuthPage =
        pathname.includes("/login") ||
        pathname.includes("/register") ||
        pathname.includes("/forgot-password") ||
        pathname.includes("/reset-password");

      if (!isAuthPage) {
        if (pathname.startsWith("/staff")) {
          if (localStorage.getItem("staff_token")) {
            clearStaffSession();
            window.location.href = "/staff/login?session=expired";
          }
        } else if (pathname.startsWith("/guardian")) {
          if (localStorage.getItem("guardian_token")) {
            clearGuardianSession();
            window.location.href = "/guardian/login?session=expired";
          }
        } else if (
          pathname.startsWith("/student") ||
          pathname.startsWith("/classroom") ||
          pathname.startsWith("/zoom")
        ) {
          if (localStorage.getItem("student_token")) {
            clearStudentSession();
            window.location.href = "/student/login?session=expired";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// Intercept and ignore browser extension errors and Zoom SDK internal cancellations to prevent React development error overlay crashes
window.addEventListener(
  "error",
  (e) => {
    const msg = String(e.message || "");
    const file = String(e.filename || "");
    if (
      msg.includes("MetaMask") ||
      msg.includes("failed to connect") ||
      msg.includes("Job was cancelled") ||
      file.includes("chrome-extension") ||
      file.includes("zoom")
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  },
  true
);

window.addEventListener(
  "unhandledrejection",
  (e) => {
    const reasonStr = String(e.reason?.message || e.reason || "");
    const stackStr = String(e.reason?.stack || "");
    if (
      reasonStr.includes("MetaMask") ||
      reasonStr.includes("failed to connect") ||
      reasonStr.includes("Job was cancelled") ||
      stackStr.includes("chrome-extension") ||
      stackStr.includes("zoom")
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  },
  true
);

const rootElement = document.getElementById("root");
const appElement = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <AuthProvider>
            <StaffAuthProvider>
              <QueryProvider>
                <App />
              </QueryProvider>
            </StaffAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

const root = createRoot(rootElement);
root.render(appElement);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
