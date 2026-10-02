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
