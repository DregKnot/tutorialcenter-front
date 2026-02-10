import { useState } from "react";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";

export default function DashboardLayout({ children }) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        <MobileHeader />

        <main className="pt-16 pb-20 px-4">
          {children}
        </main>

        <MobileBottomNav />
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={leftCollapsed}
          setCollapsed={setLeftCollapsed}
        />

        <RightPanel
          collapsed={rightCollapsed}
          setCollapsed={setRightCollapsed}
        />

        <main
          className={`
            transition-all duration-300 p-6
            ${leftCollapsed ? "ml-20" : "ml-64"}
            ${rightCollapsed ? "mr-16" : "mr-80"}
          `}
        >
          {children}
        </main>
      </div>

    </div>
  );
}

// import { useState } from "react";
// import Sidebar from "./Sidebar";
// import RightPanel from "./RightPanel";

// export default function DashboardLayout({ children }) {
//   const [leftCollapsed, setLeftCollapsed] = useState(false);
//   const [rightCollapsed, setRightCollapsed] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
//       {/* Left Sidebar */}
//       <Sidebar
//         collapsed={leftCollapsed}
//         setCollapsed={setLeftCollapsed}
//       />

//       {/* Right Panel */}
//       <RightPanel
//         collapsed={rightCollapsed}
//         setCollapsed={setRightCollapsed}
//       />

//       {/* Main Content */}
//       <main
//         className={`
//           transition-all duration-300 p-6
//           ${leftCollapsed ? "ml-20" : "ml-64"}
//           ${rightCollapsed ? "mr-16" : "mr-80"}
//         `}
//       >
//         {children}
//       </main>
//     </div>
//   );
// }
