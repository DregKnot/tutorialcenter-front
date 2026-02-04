import React from 'react';

const InputField = ({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  fullWidth = false,
  hasError = false,
}) => (
  <div
    className={`flex items-center bg-white rounded-xl px-4 h-[55px] border-2 transition-all w-full
      ${hasError 
        ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
        : 'border-transparent focus-within:border-[#09314F]'}`}
  >
    <span className="text-gray-400 text-lg mr-3 select-none">{icon}</span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="bg-transparent w-full outline-none text-gray-700 font-medium placeholder-gray-400"
    />
  </div>
);

export default InputField;
