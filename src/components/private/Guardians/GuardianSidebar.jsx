import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { NavLink, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTheme } from "../../../context/ThemeContext";
import logo from "../../../assets/images/tutorial_logo.webp";
import collapselogo from "../../../assets/images/TC 1.webp";

const guardianMenuItems = [
  {
    label: "Dashboard",
    icon: "mynaui:home-solid",
    destination: "/guardian/dashboard",
  },
  {
    label: "Performance",
    icon: "material-symbols:trending-up-rounded",
    destination: "/guardian/performance",
  },
  {
    label: "Audit Logs",
    icon: "solar:shield-check-bold",
    destination: "/guardian/audit-logs",
  },
  {
    label: "Payments & Billing",
    icon: "mdi:credit-card-outline",
    destination: "/guardian/payments",
  },
];

export default function GuardianSidebar({
  collapsed,
  setCollapsed,
  isOpen,
  onClose,
  guardian,
  onLogout
}) {
  const { theme, setTheme } = useTheme();

  const guardianName = guardian?.firstname && guardian?.surname
    ? `${guardian.firstname} ${guardian.surname}`
    : (guardian?.firstname || "Guardian");

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`
          fixed top-0 lg:top-2 left-0 lg:left-2 z-[60] lg:z-50
          bottom-0 lg:bottom-auto
          h-full lg:h-[calc(100vh-16px)]
          bg-white dark:bg-gray-900
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100"}
          lg:rounded-2xl lg:shadow-2xl flex flex-col overflow-hidden border-r lg:border border-gray-100 dark:border-gray-800
        `}
      >
        {/* Logo Header */}
        <div className="relative flex items-center justify-center p-3 lg:p-5 mt-1 mb-1 overflow-visible flex-shrink-0">
          <Link to="/guardian/dashboard">
            <img
              src={collapsed ? collapselogo : logo}
              alt="Tutorial Center"
              className={`transition-all duration-300 object-contain ${
                collapsed ? "w-12 h-12" : "w-36 md:w-44 h-auto"
              }`}
            />
          </Link>

          {/* Desktop Collapse Arrow */}
          <button
            onClick={() => {
              if (isOpen !== undefined && onClose) {
                onClose();
                return;
              }
              setCollapsed(!collapsed);
            }}
            className="
              hidden lg:flex absolute -right-0 top-[70%] -translate-y-1/2
              bg-[#09314F] text-white
              w-5 h-9
              rounded-l-xl
              items-center justify-center
              hover:bg-[#09314F]/80 z-10
              transition-all duration-300 ease-in-out
            "
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4 ml-0.5" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 mr-0.5" />
            )}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll flex flex-col ${
          collapsed ? "items-center px-1" : "px-3 md:px-4 space-y-4"
        }`}>
          {/* Avatar & Welcome Greeting */}
          <div className="flex flex-col min-h-0 flex-1 justify-between">
            <div className={`flex py-2 items-center ${collapsed ? "justify-center" : "gap-3"}`}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#09314F] to-[#1a517c] text-[#C5A97A] border-2 border-[#C5A97A] flex items-center justify-center font-black text-sm shadow-md shrink-0">
                {guardian?.firstname?.[0]?.toUpperCase() || "G"}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <h6 className="text-[#C5A97A] text-[11px] font-black uppercase tracking-wider leading-none">
                    Welcome Guardian
                  </h6>
                  <h3 className="font-bold text-gray-900 dark:text-gray-50 text-sm truncate mt-0.5">
                    {guardianName}
                  </h3>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <nav className="space-y-1.5 mt-4 flex flex-col flex-1">
              {guardianMenuItems.map(({ label, icon, destination, disabled, tag }) => {
                if (disabled) {
                  return (
                    <div
                      key={label}
                      className={`w-full flex items-center rounded-xl text-xs font-semibold text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60 ${
                        collapsed ? "justify-center py-3" : "justify-between px-3 py-3"
                      }`}
                      title="Add Wards is temporarily managed by administration"
                    >
                      <div className="flex items-center gap-3">
                        <Icon icon={icon} className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{label}</span>}
                      </div>
                      {!collapsed && tag && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-md">
                          {tag}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={label}
                    to={destination}
                    onClick={onClose}
                    className={({ isActive }) => `
                      w-full flex items-center rounded-xl text-xs font-bold transition duration-200
                      ${collapsed ? "justify-center py-3" : "gap-3 px-3 py-3"}
                      ${
                        isActive
                          ? "bg-[#09314F] text-white shadow-md dark:bg-[#C5A97A] dark:text-[#09314F] font-black"
                          : "text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#09314F] dark:hover:text-white"
                      }
                    `}
                  >
                    <Icon icon={icon} className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                );
              })}
            </nav>

            {/* Footer: Theme Switcher & Logout */}
            <div className="p-3 pt-4 space-y-4 mt-auto border-t border-gray-100 dark:border-gray-800">
              <div className={`flex items-center gap-1 ${collapsed ? "justify-center" : "justify-between px-1"}`}>
                {!collapsed && <span className="text-xs text-gray-500 font-bold uppercase">Theme</span>}
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    theme === "dark" ? "bg-blue-900" : "bg-gray-300"
                  }`}
                  aria-label="Toggle Theme"
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full shadow transition-all duration-300 flex items-center justify-center ${
                      theme === "dark" ? "right-1 bg-gray-800" : "left-1 bg-white"
                    }`}
                  >
                    {theme === "light" ? (
                      <SunIcon className="w-3 h-3 text-yellow-500" />
                    ) : (
                      <MoonIcon className="w-3 h-3 text-blue-300" />
                    )}
                  </span>
                </button>
              </div>

              <button
                onClick={onLogout}
                className={`w-full flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-bold text-xs ${
                  collapsed ? "justify-center py-2" : "px-1 py-2"
                }`}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>Logout</span>}
              </button>
            </div>

          </div>
        </div>
      </aside>
    </>
  );
}
