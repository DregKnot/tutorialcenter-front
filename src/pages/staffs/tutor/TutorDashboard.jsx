import React from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { Icon } from "@iconify/react";
import { 
  UserGroupIcon, 
  HandThumbUpIcon, 
  UserMinusIcon,
  BellIcon
} from "@heroicons/react/24/outline";

export default function TutorDashboard() {
  const stats = [
    { 
      label: "Total Students", 
      value: "42", 
      sub: "Students currently in your roster", 
      badge: "+2 this month",
      icon: <UserGroupIcon className="w-6 h-6 text-[#09314F]" />,
      color: "blue"
    },
    { 
      label: "Active Students", 
      value: "38", 
      sub: "Active in lesson this week", 
      badge: "90% Engagement",
      icon: <HandThumbUpIcon className="w-6 h-6 text-[#76D287]" />,
      color: "green"
    },
    { 
      label: "Inactive Students", 
      value: "4", 
      sub: "Paused or finished modules", 
      badge: "-2 this month",
      icon: <UserMinusIcon className="w-6 h-6 text-[#E83831]" />,
      color: "red"
    }
  ];

  return (
    <StaffDashboardLayout>
      <div className="p-6 max-w-6xl mx-auto w-full min-h-screen">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-[#0F2843] tracking-tighter uppercase">Dashboard</h1>
          <button className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <BellIcon className="w-6 h-6 text-[#0F2843]" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#E83831] border-2 border-white rounded-full" />
          </button>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white border-2 border-orange-50/50 rounded-2xl p-4 mb-10 shadow-sm">
           <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-600">
                You have English and Mathematics assessment
              </p>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                10:15am
              </span>
           </div>
        </div>

        {/* Progress Level Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="mdi:chart-line" className="text-gray-600 w-5 h-5" />
            <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Progress Level</h2>
          </div>
          <div className="w-full">
            <div className="flex justify-between text-[10px] font-black text-gray-400 mb-2 uppercase tracking-tighter">
              <span>Start</span>
              <span>Finish</span>
            </div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
               <div className="h-full bg-[#09314F] relative" style={{ width: '8%' }}>
                  <span className="absolute right-0 -top-full text-[8px] font-black text-[#09314F] mr-1">8%</span>
               </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${
                  stat.color === 'blue' ? 'bg-blue-50' : 
                  stat.color === 'green' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {stat.icon}
                </div>
                <div className="px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] font-black text-gray-500 uppercase">
                  {stat.badge}
                </div>
              </div>
              <h4 className="text-sm font-bold text-gray-400 mb-1">{stat.label}</h4>
              <div className={`text-4xl font-black mb-3 ${
                stat.color === 'blue' ? 'text-[#09314F]' : 
                stat.color === 'green' ? 'text-[#76D287]' : 'text-[#E83831]'
              }`}>
                {stat.value}
              </div>
              <p className="text-[11px] text-gray-400 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Assigned Classes Section (Requested Whitespace content) */}
        <div>
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
               <Icon icon="mdi:book-open-variant" className="text-gray-600 w-5 h-5" />
               <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Your Assigned Classes</h2>
             </div>
             <button className="text-xs font-bold text-[#09314F] hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {/* Example Active Class Card */}
             <div className="group relative bg-white p-5 rounded-3xl border-2 border-[#76D287] shadow-sm hover:shadow-md transition-all">
                <div className="absolute -top-3 left-6 bg-[#76D287] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  Active Now
                </div>
                <div className="flex items-center gap-4 mb-4 mt-2">
                   <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-[#09314F]">
                      EN
                   </div>
                   <div>
                      <h4 className="font-black text-[#0F2843] text-sm">English Language</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Class 4B • Senior Sec</p>
                   </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                   <div className="flex items-center gap-2">
                      <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-500">Starts in 15 mins</span>
                   </div>
                   <button className="bg-[#09314F] text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-[#E83831] transition-colors">
                      Join session
                   </button>
                </div>
             </div>

             {/* Placeholder for more */}
             <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-white hover:border-[#09314F]/20 transition-all">
                <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                   <Icon icon="mdi:plus" className="text-gray-400 w-6 h-6" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waiting for next assignment</p>
             </div>
          </div>
        </div>

      </div>
    </StaffDashboardLayout>
  );
}
