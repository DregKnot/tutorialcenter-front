import { useState, useEffect } from "react";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  TrophyIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import logo from "../../../assets/images/tutorial_logo.webp";
import collapselogo from "../../../assets/images/TC 1.webp";
import { useStaffAuth } from "../../../context/StaffAuthContext";

const adminMenuItems = [
  { label: "Dashboard", icon: HomeIcon, destination: "/staffs/dashboard" },
  { label: "Manage Staffs", icon: UsersIcon, destination: "/staffs/manage-staffs" },
  { label: "Manage Students", icon: UserGroupIcon, destination: "/staffs/manage-students" },
  { label: "Manage Guardian", icon: ShieldCheckIcon, destination: "/staffs/manage-guardians" },
  { label: "Master Class", icon: AcademicCapIcon, destination: "/staffs/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon },
  { label: "Manage Courses", icon: BookOpenIcon, destination: "/staffs/manage-courses" },
  { label: "Exams", icon: ClipboardDocumentCheckIcon, destination: "/staffs/manage-exams" },
  { label: "School Tests", icon: ClipboardDocumentListIcon, destination: "/staffs/school-tests" },
  { label: "Student Leaderboard", icon: TrophyIcon, destination: "/staffs/leaderboard" },
  { label: "Payments", icon: CreditCardIcon, destination: "/staffs/payments" },
  { label: "Blogs", icon: DocumentTextIcon, destination: "/staffs/manage-blogs" },
  { label: "Audit Log", icon: ChartBarIcon },
  { label: "Feedback", icon: ChartBarIcon, destination: "/staffs/feedback" },
  { label: "Settings", icon: Cog6ToothIcon },
];

const cooMenuItems = [
  { label: "Dashboard", icon: HomeIcon, destination: "/staffs/coo/dashboard" },
  { label: "Manage Staffs", icon: UsersIcon, destination: "/staffs/manage-staffs" },
  { label: "Manage Students", icon: UserGroupIcon, destination: "/staffs/manage-students" },
  { label: "Manage Guardian", icon: ShieldCheckIcon, destination: "/staffs/manage-guardians" },
  { label: "Master Class", icon: AcademicCapIcon, destination: "/staffs/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon },
  { label: "Manage Courses", icon: BookOpenIcon, destination: "/staffs/manage-courses" },
  { label: "Exams", icon: ClipboardDocumentCheckIcon, destination: "/staffs/manage-exams" },
  { label: "School Tests", icon: ClipboardDocumentListIcon, destination: "/staffs/school-tests" },
  { label: "Student Leaderboard", icon: TrophyIcon, destination: "/staffs/leaderboard" },
  { label: "Payments", icon: CreditCardIcon, destination: "/staffs/payments" },
  { label: "Blogs", icon: DocumentTextIcon, destination: "/staffs/manage-blogs" },
  { label: "Feedback", icon: ChartBarIcon, destination: "/staffs/feedback" },
  { label: "Settings", icon: Cog6ToothIcon },
];

const tutorMenuItems = [
  { label: "Dashboard", icon: HomeIcon, destination: "/staffs/tutor/dashboard" },
  { label: "Master Class", icon: AcademicCapIcon, destination: "/staffs/tutor/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon, destination: "/staffs/tutor/calendar" },
  { label: "Student Leaderboard", icon: TrophyIcon, destination: "/staffs/leaderboard" },
  { label: "Assessment", icon: ClipboardDocumentListIcon },
  { label: "Exams", icon: ClipboardDocumentCheckIcon },
  { label: "Feedback", icon: ClipboardDocumentCheckIcon, destination: "/staffs/feedback" },
  { label: "Settings", icon: Cog6ToothIcon },
];

const courseAdvisorMenuItems = [
  { label: "Dashboard", icon: HomeIcon, destination: "/staffs/course-advisor/dashboard" },
  { label: "Manage Students", icon: UserGroupIcon, destination: "/staffs/course-advisor/students" },
  { label: "Manage Guardian", icon: ShieldCheckIcon, destination: "/staffs/course-advisor/guardians" },
  { label: "Master Class", icon: AcademicCapIcon, destination: "/staffs/course-advisor/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon, destination: "/staffs/course-advisor/calendar" },
  { label: "Student Leaderboard", icon: TrophyIcon, destination: "/staffs/leaderboard" },
  { label: "Exams", icon: ClipboardDocumentCheckIcon },
  { label: "Feedback", icon: ChartBarIcon, destination: "/staffs/feedback" },
  { label: "Settings", icon: Cog6ToothIcon },
];

const moderatorMenuItems = [
  { label: "Exams", icon: ClipboardDocumentCheckIcon, destination: "/staffs/manage-exams" },
];

export default function StaffSidebar({ collapsed, setCollapsed, isOpen, onClose }) {
  const { theme, setTheme } = useTheme();
  const { logout } = useStaffAuth();

  const [staffInfo, setStaffInfo] = useState(null);
  const [staffRole, setStaffRole] = useState("Staff");

  useEffect(() => {
    const updateProfileData = () => {
      const storedStaff = localStorage.getItem("staff_info");
      const storedRole = localStorage.getItem("staff_role");
      let parsedStaff = null;

      if (storedStaff) {
        try {
          parsedStaff = JSON.parse(storedStaff);
          setStaffInfo(parsedStaff);
        } catch (e) {
          console.error("Error parsing staff_info", e);
        }
      }

      if (storedRole) {
        try {
          const parsed = JSON.parse(storedRole);
          setStaffRole(parsed.charAt(0).toUpperCase() + parsed.slice(1));
        } catch {
          setStaffRole(storedRole.charAt(0).toUpperCase() + storedRole.slice(1));
        }
      } else if (parsedStaff && parsedStaff.role) {
        setStaffRole(parsedStaff.role.charAt(0).toUpperCase() + parsedStaff.role.slice(1));
      }
    };

    updateProfileData();
    window.addEventListener("storage", updateProfileData);
    window.addEventListener("staffProfileUpdated", updateProfileData);

    return () => {
      window.removeEventListener("storage", updateProfileData);
      window.removeEventListener("staffProfileUpdated", updateProfileData);
    };
  }, []);

  const fullName =
    staffInfo?.firstname && staffInfo?.surname
      ? `${staffInfo.firstname} ${staffInfo.surname}`
      : "Staff Member";

  const staffLoaded = staffInfo?.firstname && staffInfo?.surname;

  const profilePic = (staffInfo?.profile_picture && staffInfo?.profile_picture !== "default-avatar.png")
    ? (process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000") + "/storage/" + staffInfo.profile_picture
    : null;

  const handleLogout = () => {
    logout();
  };

  const getMenuItems = () => {
    const roleLower = staffRole.toLowerCase();
    if (roleLower === "coo" || roleLower === "preview" || roleLower === "operations") return cooMenuItems;
    if (roleLower === "tutor") return tutorMenuItems;
    if (roleLower === "moderator") return moderatorMenuItems;
    if (roleLower === "course advisor" || roleLower === "advisor") return courseAdvisorMenuItems;
    return adminMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 lg:top-2 left-0 lg:left-2 z-[60] lg:z-50 
          bottom-16 lg:bottom-auto
          h-[calc(100vh-4rem)] h-[calc(100dvh-4rem)] lg:h-[calc(100vh-22px)]
          bg-white dark:bg-gray-900
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100"}
          lg:rounded-xl lg:shadow-2xl flex flex-col overflow-hidden
        `}
      >
        {/* Logo */}
        <div className="relative flex items-center justify-center p-3 lg:p-6 mt-1 mb-1 overflow-visible flex-shrink-0">
          <img
            src={collapsed ? collapselogo : logo}
            alt="TC Logo"
            className={`transition-all duration-300 object-contain ${collapsed ? "w-14 h-14" : "w-36 md:w-48 lg:w-56 h-auto"
              }`}
          />

          <button
            onClick={() => {
              if (isOpen !== undefined && onClose) {
                onClose();
                return;
              }
              setCollapsed(!collapsed);
            }}
            className="
              absolute -right-0 top-[70%] -translate-y-1/2
              bg-[#09314F] text-white
              w-5 h-9
              rounded-l-xl
              flex items-center justify-center
              hover:bg-[#09314F]/80 z-10
              transition-all duration-300 ease-in-out
            "
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5 ml-1" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
            )}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll flex flex-col ${collapsed ? "items-center" : "px-3 md:px-4"}`}>
          {/* Avatar & Name */}
          <div className="flex flex-col min-h-0 flex-1 justify-between">
            <div className={`flex py-1 md:py-2 items-center ${collapsed ? "justify-center" : "gap-2 md:gap-3"}`}>
              {staffLoaded ? (
                profilePic ? (
                  <img
                    src={profilePic}
                    alt={fullName}
                    className="rounded-full shadow-lg h-10 w-10 object-cover border-2 border-[#BB9E7F] flex-shrink-0"
                  />
                ) : (
                  <div className="rounded-full shadow-lg h-10 w-10 flex items-center justify-center bg-[#09314F] text-white font-bold border-2 border-[#BB9E7F] flex-shrink-0">
                    {fullName?.[0] || "S"}
                  </div>
                )
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
              )}
              {!collapsed && (
                <div className="min-w-0">
                  {staffLoaded ? (
                    <>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h6 className="text-[#BB9E7F] text-xs uppercase font-bold">Welcome {staffRole}</h6>
                      </div>
                      <h3 className="font-bold dark:text-gray-50 text-sm truncate">
                        {fullName}
                      </h3>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-1" />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Menu */}
            <nav className="px-0.5 md:px-2 lg:px-3 space-y-1 md:space-y-1.5 lg:space-y-2 mt-2 md:mt-3 lg:mt-6 flex flex-col flex-1">
              {menuItems.map(({ label, icon: Icon, destination }) => {
                if (!destination) {
                  return (
                    <div
                      key={label}
                      className={`w-full flex items-center rounded-lg text-xs md:text-sm font-medium text-gray-400 dark:text-gray-700 cursor-not-allowed ${collapsed ? "justify-center py-2.5" : "gap-3 px-2 md:px-3 py-1.5 md:py-2 lg:py-2.5"
                        }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{label}</span>}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={label}
                    to={destination}
                    className={({ isActive }) => `
                    w-full flex items-center rounded-lg
                    text-xs md:text-sm font-medium transition duration-200
                    ${collapsed ? "justify-center py-2.5" : "gap-3 px-2 md:px-3 lg:px-3 py-1.5 md:py-2 lg:py-2.5"}
                    ${isActive
                        ? "bg-[#09314F] text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-gray-800"
                      }
                  `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="p-2 md:p-3 lg:p-4 pt-2 md:pt-3 lg:pt-4 pb-3 md:pb-4 space-y-3 md:space-y-4 lg:space-y-5 mt-auto lg:hidden border-t border-gray-100 dark:border-gray-800">
              {/* Theme Toggle (Mobile) */}
              <div className={`flex items-center gap-1 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
                {!collapsed && <span className="text-xs text-gray-500">Light</span>}
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${theme === "dark" ? "bg-blue-900" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full shadow transition-all duration-300 flex items-center justify-center ${theme === "dark" ? "right-1 bg-gray-800" : "left-1 bg-white"}`}>
                    {theme === "light" ? <SunIcon className="w-3 h-3 text-yellow-500" /> : <MoonIcon className="w-3 h-3 text-blue-300" />}
                  </span>
                </button>
                {!collapsed && <span className="text-xs text-gray-500">Dark</span>}
              </div>
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">Logout</span>}
              </button>
            </div>

            {/* Desktop Footer */}
            <div className="hidden lg:block p-3 pt-3 space-y-3 mt-auto border-t border-gray-100 dark:border-gray-800">
              <div className={`flex items-center gap-1 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
                {!collapsed && <span className="text-xs text-gray-500">Light</span>}
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${theme === "dark" ? "bg-blue-900" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full shadow transition-all duration-300 flex items-center justify-center ${theme === "dark" ? "right-1 bg-gray-800" : "left-1 bg-white"}`}>
                    {theme === "light" ? <SunIcon className="w-3 h-3 text-yellow-500" /> : <MoonIcon className="w-3 h-3 text-blue-300" />}
                  </span>
                </button>
                {!collapsed && <span className="text-xs text-gray-500">Dark</span>}
              </div>
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
