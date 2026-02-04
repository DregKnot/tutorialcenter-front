import React from 'react';

const CustomDropdown = ({
  icon,
  placeholder,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  isSmall = false,
  multiSelect = false,
  hasError = false,
}) => (
  <div className="relative w-full">
    <div
      onClick={onToggle}
      className={`flex items-center bg-[#F9F4F3] rounded-xl px-4 cursor-pointer border-2 transition-all w-full
        ${isSmall ? 'h-[40px] md:h-[45px]' : 'h-[55px]'}
        ${hasError 
          ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
          : 'border-transparent hover:border-[#09314F]'}`}
    >
      {icon && <span className="text-gray-400 mr-2 md:mr-3">{icon}</span>}
      <span className={`flex-1 font-bold truncate ${value && (multiSelect ? value.length > 0 : true) ? 'text-gray-700' : 'text-gray-400'} 
        ${isSmall ? 'text-[10px] md:text-[11px] uppercase' : 'text-sm'}`}>
        {multiSelect 
          ? (value?.length > 0 ? value.join(", ") : placeholder)
          : (value || placeholder)}
      </span>
      <span className="text-gray-400 text-[10px] ml-1">▼</span>
    </div>

    {isOpen && (
      <div className={`absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-xl z-[100] border border-gray-100 p-1 overflow-y-auto custom-scrollbar
        ${isSmall ? 'w-[140px] md:w-[160px] max-h-[180px]' : 'w-full max-h-[250px]'}`}>
        {options.map((opt) => {
          const isSelected = multiSelect ? value?.includes(opt) : value === opt;
          return (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                if (!multiSelect) onToggle();
              }}
              className={`p-2 md:p-3 mb-1 rounded-lg font-bold cursor-pointer transition-colors
                ${isSmall ? 'text-[9px] md:text-[10px]' : 'text-sm'}
                ${isSelected 
                  ? 'bg-[#86D294] text-white shadow-md' 
                  : 'bg-[#F9EAEA] text-gray-600 hover:bg-gray-200'}`}
            >
              {opt}
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default CustomDropdown;
