import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  TrophyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useStaffAuth } from "../../../context/StaffAuthContext";

const adminTabs = [
  { label: "Dashboard", icon: HomeIcon, to: "/staffs/dashboard" },
  { label: "Staffs", icon: UsersIcon, to: "/staffs/manage-staffs" },
  { label: "Students", icon: UserGroupIcon, to: "/staffs/manage-students" },
  { label: "Exams", icon: ClipboardDocumentCheckIcon, to: "/staffs/manage-exams" },
  { label: "Leaderboard", icon: TrophyIcon, to: "/staffs/leaderboard" },
];

const tutorTabs = [
  { label: "Dashboard", icon: HomeIcon, to: "/staffs/tutor/dashboard" },
  { label: "Master Class", icon: AcademicCapIcon, to: "/staffs/tutor/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon, to: "/staffs/tutor/calendar" },
  { label: "Leaderboard", icon: TrophyIcon, to: "/staffs/leaderboard" },
  { label: "Feedback", icon: ChartBarIcon, to: "/staffs/feedback" },
];

const courseAdvisorTabs = [
  { label: "Dashboard", icon: HomeIcon, to: "/staffs/course-advisor/dashboard" },
  { label: "Students", icon: UserGroupIcon, to: "/staffs/course-advisor/students" },
  { label: "Master Class", icon: AcademicCapIcon, to: "/staffs/course-advisor/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon, to: "/staffs/course-advisor/calendar" },
  { label: "Leaderboard", icon: TrophyIcon, to: "/staffs/leaderboard" },
];

const moderatorTabs = [
  { label: "Exams", icon: ClipboardDocumentCheckIcon, to: "/staffs/manage-exams" },
  { label: "Leaderboard", icon: TrophyIcon, to: "/staffs/leaderboard" },
  { label: "Feedback", icon: ChartBarIcon, to: "/staffs/feedback" },
];

export default function StaffMobileBottomNav() {
  const { role: contextRole } = useStaffAuth() || {};
  const [staffRole, setStaffRole] = useState("Staff");

  useEffect(() => {
    const updateRole = () => {
      const storedRole = localStorage.getItem("staff_role");
      const storedStaff = localStorage.getItem("staff_info");
      let parsedRole = storedRole || contextRole;

      if (!parsedRole && storedStaff) {
        try {
          const parsedStaffObj = JSON.parse(storedStaff);
          parsedRole = parsedStaffObj?.role;
        } catch (e) {
          console.error("Error parsing staff_info in MobileBottomNav", e);
        }
      }

      if (parsedRole) {
        try {
          const parsed = JSON.parse(parsedRole);
          setStaffRole(String(parsed));
        } catch {
          setStaffRole(String(parsedRole));
        }
      }
    };

    updateRole();
    window.addEventListener("storage", updateRole);
    window.addEventListener("staffProfileUpdated", updateRole);

    return () => {
      window.removeEventListener("storage", updateRole);
      window.removeEventListener("staffProfileUpdated", updateRole);
    };
  }, [contextRole]);

  const getTabs = () => {
    const roleLower = String(staffRole || "").toLowerCase().trim();
    if (roleLower === "tutor") return tutorTabs;
    if (roleLower === "moderator") return moderatorTabs;
    if (roleLower === "course advisor" || roleLower === "advisor") return courseAdvisorTabs;
    return adminTabs;
  };

  const tabs = getTabs();

  return (
    <nav className="
      fixed bottom-0 inset-x-0 z-50
      bg-[#09314F] text-white
      h-16
      flex justify-around items-center
      lg:hidden
      border-t border-white/10
      shadow-[0_-4px_10px_rgba(0,0,0,0.1)]
      px-2
    ">
      {tabs.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 text-[10px] sm:text-xs transition-all duration-300 px-2 py-1
            ${isActive ? "text-blue-400 scale-110" : "text-gray-400 hover:text-white"}
          `}
        >
          {({ isActive }) => (
            <>
              <Icon className={`w-5 h-5 ${isActive ? "stroke-2" : "stroke-1"}`} />
              <span className="font-medium whitespace-nowrap">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
