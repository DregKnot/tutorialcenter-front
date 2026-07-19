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
import { createRoot, hydrateRoot } from "react-dom/client";

// Intercept and ignore browser extension errors (like MetaMask) to prevent React development error overlay crashes
window.addEventListener("error", (e) => {
  if (
    e.message &&
    (e.message.includes("MetaMask") ||
      e.message.includes("failed to connect") ||
      e.filename?.includes("chrome-extension"))
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

window.addEventListener("unhandledrejection", (e) => {
  if (
    e.reason &&
    (String(e.reason).includes("MetaMask") ||
      String(e.reason).includes("failed to connect") ||
      e.reason.stack?.includes("chrome-extension"))
  ) {
    e.preventDefault();
  }
});

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

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, appElement);
} else {
  const root = createRoot(rootElement);
  root.render(appElement);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
