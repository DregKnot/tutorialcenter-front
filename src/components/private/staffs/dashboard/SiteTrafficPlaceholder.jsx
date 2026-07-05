import { Icon } from "@iconify/react";

export default function SiteTrafficPlaceholder() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <Icon
            icon="heroicons:globe-alt-20-solid"
            className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
          />
        </div>
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
          Site Traffic
        </h3>
        <span className="ml-auto text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-2.5 py-0.5 uppercase">
          Coming Soon
        </span>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
        <div className="relative mb-4">
           {/* Decorative arcs representing traffic/gauge */}
           <svg width="120" height="60" viewBox="0 0 120 60" className="opacity-80">
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round" />
              <path d="M 25 60 A 35 35 0 0 1 95 60" fill="none" stroke="#F3F4F6" strokeWidth="10" strokeLinecap="round" />
           </svg>
           <Icon
              icon="heroicons:chart-pie-20-solid"
              className="w-8 h-8 text-gray-300 dark:text-gray-600 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
            />
        </div>
        
        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-4">
          Google Analytics Integration
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 max-w-[200px]">
          Live site traffic, visitor demographics, and engagement metrics will appear here.
        </p>
      </div>
    </div>
  );
}
