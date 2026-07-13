import React from "react";
import { Icon } from "@iconify/react";
import DashboardLayout from "./DashboardLayout"; // since we are in src/components/private/Students/

export default function StudentBlog() {
  return (
    <DashboardLayout pagetitle="Blogs" hideRightPanel={true}>
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center relative overflow-hidden mt-6">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0F2C45] to-[#E83831] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 transform -rotate-6">
            <Icon icon="fluent:news-24-filled" className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-black text-[#09314F] dark:text-white mb-4 uppercase tracking-wide">
            Coming Soon
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium text-sm leading-relaxed">
            We are working hard to bring you exclusive academic tips, success stories, and tutorial guides right here in your dashboard. Check back soon!
          </p>

          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
