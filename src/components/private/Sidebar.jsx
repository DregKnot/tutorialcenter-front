import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";

import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/images/tutorial_logo.png";
import collapselogo from "../../assets/images/TC 1.png";

const menuItems = [
  { label: "Dashboard", icon: HomeIcon },
  { label: "Courses", icon: BookOpenIcon },
  { label: "Master Class", icon: AcademicCapIcon },
  { label: "Exam Practice", icon: ClipboardDocumentCheckIcon },
  { label: "Calendar", icon: CalendarDaysIcon },
  { label: "Assessment", icon: ChartBarIcon },
  { label: "Payment", icon: CreditCardIcon },
  { label: "Games", icon: PuzzlePieceIcon },
  { label: "Settings", icon: Cog6ToothIcon },
  { label: "Help", icon: QuestionMarkCircleIcon },
];

export default function Sidebar({ collapsed, setCollapsed, isOpen, onClose }) {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
        fixed top-0 left-0 z-50 h-screen
        bg-white dark:bg-gray-900
        border-r dark:border-gray-800
        flex flex-col
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="relative flex items-center justify-center p-4">
          <img
            src={collapsed ? collapselogo : logo}
            alt="TC Logo"
            className={`transition-all duration-300 ${collapsed ? "w-10" : "w-full"}`}
          />

          <button
            onClick={() => {
              // Mobile: close sidebar completely
              if (isOpen !== undefined && onClose) {
                onClose();
                return;
              }

              // Desktop: collapse sidebar
              setCollapsed(!collapsed);
            }}
            className="
            absolute -right-3 top-1/2 -translate-y-1/2
            bg-blue-900 text-white
            p-1.5 rounded-full shadow-lg
            hover:bg-blue-800
          "
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Avatar */}
        <div className="flex px-3 space-y-2 flex-wrap justify-between items-center">
          <img
            src={collapselogo}
            alt="Avatar"
            className="rounded-full shadow-lg h-10 w-10 object-fit-contain border border-6 border-yellow-400"
          />
          <div className={` ${collapsed ? "hidden" : ""}`}>
            <h6 className="text-yellow-400">Hello Student</h6>
            <h3 className="font-bold dark:text-gray-50">Caleb Samuel Thomas</h3>
          </div>
        </div>
        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              text-sm font-medium transition
              text-gray-600 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
            `}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-4">
          {/* Theme Toggle */}
          <div
            className={`
            flex items-center bg-gray-100 dark:bg-gray-800
            rounded-full px-2 py-1
            ${collapsed ? "justify-center" : "justify-between"}
          `}
          >
            <button
              onClick={() => setTheme("light")}
              className={`
              flex items-center gap-2 px-3 py-1 rounded-full
              transition-all
              ${
                theme === "light"
                  ? "bg-white text-yellow-500 scale-105 shadow ring-2 ring-yellow-400/40"
                  : "text-gray-400 hover:text-yellow-500"
              }
            `}
            >
              <SunIcon className={`${collapsed ? "w-2 h-2" : "w-4 h-4"}`} />
              {!collapsed && <span className="text-xs">Light</span>}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`
              flex items-center gap-2 px-3 py-1 rounded-full
              transition-all
              ${
                theme === "dark"
                  ? "bg-gray-900 text-blue-400 scale-105 ring-2 ring-blue-400/40"
                  : "text-gray-400 hover:text-blue-400"
              }
            `}
            >
              <MoonIcon className={`${collapsed ? "w-2 h-2" : "w-4 h-4"}`} />
              {!collapsed && <span className="text-xs">Dark</span>}
            </button>
          </div>

          {/* Logout */}
          <button className="flex items-center justify-center gap-2 text-red-500">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
