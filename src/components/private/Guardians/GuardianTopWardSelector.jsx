import React from 'react';
import { Icon } from '@iconify/react';

export default function GuardianTopWardSelector({
  wards = [],
  selectedWardId = null,
  onSelectWard,
  showAllOption = true,
  isLoading = false
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-2.5 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Label / Indicator */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Ward Filter:
        </span>
      </div>

      {/* Ward Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {showAllOption && (
          <button
            onClick={() => onSelectWard('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
              selectedWardId === 'all' || !selectedWardId
                ? 'bg-[#09314F] text-white shadow-sm dark:bg-[#C5A97A] dark:text-[#09314F]'
                : 'bg-gray-50 dark:bg-gray-900/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <Icon icon="lucide:users" className="w-3.5 h-3.5" />
            <span>All Wards ({wards.length})</span>
          </button>
        )}

        {wards.map((ward) => {
          const isSelected = selectedWardId === ward.id;
          return (
            <button
              key={ward.id}
              onClick={() => onSelectWard(ward.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#09314F] text-white shadow-sm dark:bg-[#C5A97A] dark:text-[#09314F] font-black'
                  : 'bg-gray-50 dark:bg-gray-900/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                isSelected 
                  ? 'bg-white/20 text-white dark:bg-[#09314F]/20 dark:text-[#09314F]' 
                  : 'bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-[#C5A97A]'
              }`}>
                {ward.name?.[0]?.toUpperCase() || 'W'}
              </div>
              <span className="truncate max-w-[120px]">{ward.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
