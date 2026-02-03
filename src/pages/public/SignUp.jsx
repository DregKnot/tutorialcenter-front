import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import signup_img from "../../assets/images/Student_sign_up.jpg";
import TC_logo from "../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../assets/svg/return arrow.svg";
import Step_two_img from "../../assets/images/step_2.jpg";
import otp_img_student from "../../assets/images/otpStudentpic.jpg";
import otp_img_parent from "../../assets/images/otpparent.jpg";
import select_student from "../../assets/images/add_student.png";
import SplashScreen from "../../components/public/SplashScreen";
import StepOne from "./Student _Sign_up/StepOne";
import StepTwo from "./Student _Sign_up/StepTwo";

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

const StudentBiodataFields = ({
  student,
  onChange,
  errors = {},
  showLabels = true,
  studentIndex = null,
  onBack = null,
  activeDropdown = null,
  setActiveDropdown = null
}) => {
  const getFieldValue = (field) => student[field] || "";
  const getFieldError = (field) => errors[field];

  // Ref for the hidden file input so dropdown/upload can trigger native file chooser
  const fileInputRef = useRef(null);
  // Drag state to provide visual feedback when dragging an image over the avatar
  const [isDragging, setIsDragging] = useState(false);
  // Stable preview URL: use string src directly, or create an object URL for File/Blob
  const [previewUrl, setPreviewUrl] = useState(() => {
    if (!student.displayPic) return null;
    return typeof student.displayPic === 'string' ? student.displayPic : URL.createObjectURL(student.displayPic);
  });

  useEffect(() => {
    if (!student.displayPic) { setPreviewUrl(null); return; }
    if (typeof student.displayPic === 'string') { setPreviewUrl(student.displayPic); return; }

    const url = URL.createObjectURL(student.displayPic);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [student.displayPic]);

  // Drag handlers
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDragging(true); };
  const handleDragEnter = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type && file.type.startsWith('image/')) {
      onChange('displayPic', file);
    }
  };

  // SVG Icon Components
  const PersonIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33073 6.83333C10.9416 6.83333 12.2474 5.5275 12.2474 3.91667C12.2474 2.30584 10.9416 1 9.33073 1C7.7199 1 6.41406 2.30584 6.41406 3.91667C6.41406 5.5275 7.7199 6.83333 9.33073 6.83333Z" fill="#121D24" stroke="#121D24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 16.4167C1 12.7346 4.35792 9.75 8.5 9.75" stroke="#121D24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.2526 16.8333L16.4193 12.6667L14.7526 11L10.5859 15.1667V16.8333H12.2526Z" fill="#121D24" stroke="#121D24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0026 3.33594H15.8359C16.2943 3.33594 16.6693 3.71094 16.6693 4.16927V15.8359C16.6693 16.2943 16.2943 16.6693 15.8359 16.6693H4.16927C3.71094 16.6693 3.33594 16.2943 3.33594 15.8359V4.16927C3.33594 3.71094 3.71094 3.33594 4.16927 3.33594H10.0026Z" stroke="#121D24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.16406 4.16406H15.8307V6.66406H4.16406V4.16406Z" fill="#121D24"/>
      <path d="M5.83594 3.33073V1.66406M14.1693 3.33073V1.66406" stroke="#121D24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.83594 9.16406H14.1693" stroke="#121D24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.83594 12.5H11.6693" stroke="#121D24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const GenderIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_gender)">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 0.625C0 0.45924 0.065848 0.300269 0.183058 0.183058C0.300269 0.065848 0.45924 0 0.625 0L4.375 0C4.54076 0 4.69973 0.065848 4.81694 0.183058C4.93415 0.300269 5 0.45924 5 0.625C5 0.79076 4.93415 0.949732 4.81694 1.06694C4.69973 1.18415 4.54076 1.25 4.375 1.25H2.13375L4.375 3.49125L5.1825 2.6825C5.24061 2.62439 5.3096 2.57829 5.38552 2.54685C5.46144 2.5154 5.54282 2.49921 5.625 2.49921C5.70718 2.49921 5.78856 2.5154 5.86448 2.54685C5.9404 2.57829 6.00939 2.62439 6.0675 2.6825C6.12561 2.74061 6.17171 2.8096 6.20315 2.88552C6.2346 2.96145 6.25079 3.04282 6.25079 3.125C6.25079 3.20718 6.2346 3.28855 6.20315 3.36448C6.17171 3.4404 6.12561 3.50939 6.0675 3.5675L5.25875 4.375L6.28625 5.4025C6.75505 4.88237 7.32787 4.4665 7.96762 4.18183C8.60737 3.89716 9.29978 3.75004 10 3.75C11.475 3.75 12.7987 4.3875 13.7137 5.4025L17.8663 1.25H14.375C14.2092 1.25 14.0503 1.18415 13.9331 1.06694C13.8158 0.949732 13.75 0.79076 13.75 0.625C13.75 0.45924 13.8158 0.300269 13.9331 0.183058C14.0503 0.065848 14.2092 0 14.375 0L19.375 0C19.5408 0 19.6997 0.065848 19.8169 0.183058C19.9342 0.300269 20 0.45924 20 0.625V5.625C20 5.79076 19.9342 5.94973 19.8169 6.06694C19.6997 6.18415 19.5408 6.25 19.375 6.25C19.2092 6.25 19.0503 6.18415 18.9331 6.06694C18.8158 5.94973 18.75 5.79076 18.75 5.625V2.13375L14.4375 6.44625C14.8091 7.16137 15.0023 7.95572 15.0007 8.76161C14.9991 9.56751 14.8027 10.3611 14.4283 11.0747C14.0538 11.7883 13.5124 12.4009 12.8502 12.8602C12.188 13.3195 11.4246 13.6119 10.625 13.7125V16.25H12.5C12.6658 16.25 12.8247 16.3158 12.9419 16.4331C13.0592 16.5503 13.125 16.7092 13.125 16.875C13.125 17.0408 13.0592 17.1997 12.9419 17.3169C12.8247 17.4342 12.6658 17.5 12.5 17.5H10.625V19.375C10.625 19.5408 10.5592 19.6997 10.4419 19.8169C10.3247 19.9342 10.1658 20 10 20C9.83424 20 9.67527 19.9342 9.55806 19.8169C9.44085 19.6997 9.375 19.5408 9.375 19.375V17.5H7.5C7.33424 17.5 7.17527 17.4342 7.05806 17.3169C6.94085 17.1997 6.875 17.0408 6.875 16.875C6.875 16.7092 6.94085 16.5503 7.05806 16.4331C7.17527 16.3158 7.33424 16.25 7.5 16.25H9.375V13.7125C8.57523 13.612 7.81163 13.3195 7.14927 12.8602C6.48691 12.4008 5.94543 11.7881 5.57097 11.0743C5.19651 10.3605 5.00018 9.56676 4.9987 8.7607C4.99723 7.95464 5.19066 7.16017 5.5625 6.445L4.375 5.25875L3.5675 6.0675C3.50939 6.12561 3.4404 6.17171 3.36448 6.20315C3.28855 6.2346 3.20718 6.25079 3.125 6.25079C3.04282 6.25079 2.96145 6.2346 2.88552 6.20315C2.8096 6.17171 2.74061 6.12561 2.6825 6.0675C2.62439 6.00939 2.57829 5.9404 2.54685 5.86448C2.5154 5.78856 2.49921 5.70718 2.49921 5.625C2.49921 5.54282 2.5154 5.46144 2.54685 5.38552C2.57829 5.3096 2.62439 5.24061 2.6825 5.1825L3.49125 4.375L1.25 2.13375V4.375C1.25 4.54076 1.18415 4.69973 1.06694 4.81694C0.949732 4.93415 0.79076 5 0.625 5C0.45924 5 0.300269 4.93415 0.183058 4.81694C0.065848 4.69973 0 4.54076 0 4.375V0.625ZM6.8625 6.695C6.59263 7.10702 6.40656 7.56816 6.31491 8.0521C6.22326 8.53603 6.22783 9.03327 6.32835 9.51544C6.42887 9.99761 6.62337 10.4553 6.90076 10.8623C7.17814 11.2693 7.53298 11.6176 7.945 11.8875C8.35702 12.1574 8.81816 12.3434 9.3021 12.4351C9.78603 12.5267 10.2833 12.5222 10.7654 12.4217C11.2476 12.3211 11.7053 12.1266 12.1123 11.8492C12.5193 11.5719 12.8676 11.217 13.1375 10.805C13.6825 9.97288 13.8747 8.95834 13.6717 7.98456C13.4686 7.01077 12.8871 6.15752 12.055 5.6125C11.2229 5.06748 10.2083 4.87534 9.23456 5.07835C8.26077 5.28136 7.40752 5.86288 6.8625 6.695Z" fill="black"/>
      </g>
      <defs>
        <clipPath id="clip0_gender">
          <rect width="20" height="20" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );

  const DepartmentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0008 2.5C9.41044 2.49912 8.83878 2.70722 8.38711 3.08744C7.93544 3.46766 7.63291 3.99546 7.5331 4.57736C7.43329 5.15926 7.54264 5.75771 7.84178 6.26671C8.14093 6.77571 8.61056 7.16242 9.1675 7.35834V9.16667H6.6675C6.00446 9.16667 5.36858 9.43006 4.89974 9.8989C4.4309 10.3677 4.16751 11.0036 4.16751 11.6667V12.6417C3.61126 12.8383 3.14243 13.2252 2.84387 13.734C2.54532 14.2428 2.43627 14.8409 2.536 15.4223C2.63573 16.0038 2.93781 16.5313 3.38886 16.9116C3.83991 17.2918 4.41088 17.5004 5.00084 17.5004C5.5908 17.5004 6.16177 17.2918 6.61281 16.9116C7.06386 16.5313 7.36595 16.0038 7.46568 15.4223C7.56541 14.8409 7.45636 14.2428 7.1578 13.734C6.85925 13.2252 6.39042 12.8383 5.83417 12.6417V11.6667C5.83417 11.4457 5.92197 11.2337 6.07825 11.0774C6.23453 10.9211 6.44649 10.8333 6.6675 10.8333H13.3342C13.5552 10.8333 13.7671 10.9211 13.9234 11.0774C14.0797 11.2337 14.1675 11.4457 14.1675 11.6667V12.6417C13.6113 12.8383 13.1424 13.2252 12.8439 13.734C12.5453 14.2428 12.4363 14.8409 12.536 15.4223C12.6357 16.0038 12.9378 16.5313 13.3889 16.9116C13.8399 17.2918 14.4109 17.5004 15.0008 17.5004C15.5908 17.5004 16.1618 17.2918 16.6128 16.9116C17.0639 16.5313 17.366 16.0038 17.4657 15.4223C17.5654 14.8409 17.4564 14.2428 17.1578 13.734C16.8593 13.2252 16.3904 12.8383 15.8342 12.6417V11.6667C15.8342 11.0036 15.5708 10.3677 15.1019 9.8989C14.6331 9.43006 13.9972 9.16667 13.3342 9.16667H10.8342V7.35834C11.3901 7.16154 11.8586 6.7746 12.157 6.26586C12.4553 5.75712 12.5642 5.15932 12.4645 4.57805C12.3648 3.99678 12.0629 3.46945 11.6121 3.08921C11.1613 2.70896 10.5906 2.50027 10.0008 2.5Z" fill="#121D24"/>
    </svg>
  );

  const LocationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_location)">
        <path d="M19.3631 18.102L17.9961 14H16.4961L17.3291 18H2.66313L3.49613 14H1.99613L0.628129 18.102C0.281129 19.146 0.896129 20 1.99613 20H17.9961C19.0961 20 19.7111 19.146 19.3631 18.102ZM14.9961 5C14.9961 3.67392 14.4693 2.40215 13.5317 1.46447C12.594 0.526784 11.3222 0 9.99613 0C8.67005 0 7.39828 0.526784 6.46059 1.46447C5.52291 2.40215 4.99613 3.67392 4.99613 5C4.99613 9.775 9.99613 15 9.99613 15C9.99613 15 14.9961 9.775 14.9961 5ZM7.29613 5.06C7.29639 4.34409 7.58097 3.65759 8.08729 3.15146C8.59361 2.64533 9.28022 2.361 9.99613 2.361C10.7121 2.361 11.3987 2.64541 11.905 3.15167C12.4112 3.65792 12.6956 4.34455 12.6956 5.0605C12.6956 5.77645 12.4112 6.46308 11.905 6.96933C11.3987 7.47559 10.7121 7.76 9.99613 7.76C9.28004 7.76 8.59329 7.47554 8.08694 6.96919C7.58059 6.46284 7.29613 5.77608 7.29613 5.06Z" fill="#121D24"/>
      </g>
      <defs>
        <clipPath id="clip0_location">
          <rect width="20" height="20" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );

  const AddressIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.799 5.165L17.424 3.335C17.2626 3.23143 17.0871 3.15161 16.903 3.098C16.7197 3.03817 16.5287 3.00517 16.336 3H9.5L10.301 8H16.336C16.5 8 16.705 7.963 16.902 7.902C17.099 7.841 17.289 7.757 17.423 7.666L19.798 5.834C19.933 5.743 20 5.622 20 5.5C20 5.378 19.933 5.257 19.799 5.165ZM8.5 1H7.5C7.36739 1 7.24021 1.05268 7.14645 1.14645C7.05268 1.24021 7 1.36739 7 1.5V5H3.664C3.498 5 3.294 5.037 3.097 5.099C2.899 5.159 2.71 5.242 2.576 5.335L0.201 7.165C0.066 7.256 0 7.378 0 7.5C0 7.621 0.066 7.742 0.201 7.835L2.576 9.667C2.71 9.758 2.899 9.842 3.097 9.902C3.294 9.963 3.498 10 3.664 10H7V18.5C7 18.6326 7.05268 18.7598 7.14645 18.8536C7.24021 18.9473 7.36739 19 7.5 19H8.5C8.63261 19 8.75979 18.9473 8.85355 18.8536C8.94732 18.7598 9 18.6326 9 18.5V1.5C9 1.36739 8.94732 1.24021 8.85355 1.14645C8.75979 1.05268 8.63261 1 8.5 1Z" fill="#8695A0"/>
    </svg>
  );

  const CameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 hover:bg-gray-100 p-2 rounded-full transition-all w-fit block md:hidden"
        >
          <img src={ReturnArrow} alt="Back" className="w-6 h-6 lg:w-5 lg:h-5" />
        </button>
      )}
      {/* Display Picture Upload */}
      <div className="flex flex-col items-center mb-6">
        <label
          className={`cursor-pointer relative overflow-hidden bg-[#C4D3DC] hover:bg-[#B0C4CE] text-white w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-md group
            ${getFieldError('displayPic') ? 'ring-4 ring-red-500/40' : ''} ${isDragging ? 'ring-4 ring-[#86D294] scale-105' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="Upload or drop image"
        >
          {previewUrl ? (
            <img 
              src={previewUrl}
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <CameraIcon />
          )}

          <div className={`absolute inset-0 bg-black/20 transition-opacity flex items-center justify-center ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {isDragging ? (
              <span className="text-white font-bold text-sm">Drop to upload</span>
            ) : (
              <CameraIcon />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) onChange('displayPic', f);
            }}
          />
        </label>
        
        {showLabels && (
          <label className="text-sm font-bold text-gray-500 mt-3">
            Display picture <span className="text-gray-300 font-normal">(optional)</span>
            {getFieldError('displayPic') && (
              <span className="text-red-500 text-xs ml-2 font-semibold">
                ({getFieldError('displayPic')})
              </span>
            )}
          </label>
        )}
      </div>

      {/* First Name */}
      <div className="flex flex-col gap-2">
        {showLabels && (
          <label className="text-xs font-bold text-gray-500 ml-1">
            First Name <span className="text-red-500">*</span>
          </label>
        )}
        <div className="flex flex-col">
          <InputField
            icon={<PersonIcon />}
            placeholder="Input first name"
            value={getFieldValue('firstName')}
            onChange={(e) => onChange('firstName', e.target.value)}
            hasError={!!getFieldError('firstName')}
          />
          {getFieldError('firstName') && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">
              {getFieldError('firstName')}
            </p>
          )}
        </div>
      </div>

      {/* Last Name */}
      <div className="flex flex-col gap-2">
        {showLabels && (
          <label className="text-xs font-bold text-gray-500 ml-1">
            Last Name <span className="text-red-500">*</span>
          </label>
        )}
        <div className="flex flex-col">
          <InputField
            icon={<PersonIcon />}
            placeholder="Input last name"
            value={getFieldValue('lastName')}
            onChange={(e) => onChange('lastName', e.target.value)}
            hasError={!!getFieldError('lastName')}
          />
          {getFieldError('lastName') && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">
              {getFieldError('lastName')}
            </p>
          )}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="flex flex-col gap-2">
        {showLabels && (
          <label className="text-xs font-bold text-gray-500 ml-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
        )}
        <div className="flex flex-col">
          <InputField
            icon={<CalendarIcon />}
            type="date"
            placeholder="-- / -- / ----"
            value={getFieldValue('dob')}
            onChange={(e) => onChange('dob', e.target.value)}
            hasError={!!getFieldError('dob')}
          />
          {getFieldError('dob') && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">
              {getFieldError('dob')}
            </p>
          )}
        </div>
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-2">
        {showLabels && (
          <label className="text-xs font-bold text-gray-500 ml-1">
            Gender <span className="text-red-500">*</span>
          </label>
        )}
        <div className="flex flex-col">
          <CustomDropdown
            icon={<GenderIcon />}
            placeholder="Select gender"
            value={getFieldValue('gender')}
            options={["Male", "Female"]}
            onChange={(val) => onChange('gender', val)}
            isOpen={activeDropdown === `gender_${studentIndex}`}
            onToggle={() => setActiveDropdown(activeDropdown === `gender_${studentIndex}` ? null : `gender_${studentIndex}`)}
            hasError={!!getFieldError('gender')}
          />
          {getFieldError('gender') && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">
              {getFieldError('gender')}
            </p>
          )}
        </div>
      </div>

      {/* Department */}
      <div className="flex flex-col gap-2">
        {showLabels && (
          <label className="text-xs font-bold text-gray-500 ml-1">
            Department <span className="text-red-500">*</span>
          </label>
        )}
        <div className="flex flex-col">
          <CustomDropdown
            icon={<DepartmentIcon />}
            placeholder="Select department"
            value={getFieldValue('department')}
            options={["Science", "Arts", "Commercial"]}
            onChange={(val) => onChange('department', val)}
            isOpen={activeDropdown === `dept_${studentIndex}`}
            onToggle={() => setActiveDropdown(activeDropdown === `dept_${studentIndex}` ? null : `dept_${studentIndex}`)}
            hasError={!!getFieldError('department')}
          />
          {getFieldError('department') && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">
              {getFieldError('department')}
            </p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        {showLabels && (
          <label className="text-xs font-bold text-gray-500 ml-1">
            Location <span className="text-red-500">*</span>
          </label>
        )}
        <div className="flex flex-col">
          <InputField
            icon={<LocationIcon />}
            placeholder="Input location"
            value={getFieldValue('location')}
            onChange={(e) => onChange('location', e.target.value)}
            hasError={!!getFieldError('location')}
          />
          {getFieldError('location') && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">
              {getFieldError('location')}
            </p>
          )}
        </div>
        {/* Use current location link */}
        <button type="button" className="text-[#E33629] text-xs font-medium ml-1 flex items-center gap-1 w-fit">
          <span>📍</span> Use current location on map.
        </button>
      </div>

      {/* Address (Optional) */}
      <div className="flex flex-col gap-2">
        {showLabels && (
          <label className="text-xs font-bold text-gray-500 ml-1">
            Address <span className="text-gray-300 font-normal">(optional)</span>
          </label>
        )}
        <div className="flex items-center bg-white rounded-xl px-4 h-[55px] border border-transparent focus-within:border-[#09314F] transition-all w-full">
          <span className="text-gray-400 mr-3"><AddressIcon /></span>
          <input
            type="text"
            placeholder="Input address"
            value={getFieldValue('address')}
            onChange={(e) => onChange('address', e.target.value)}
            className="bg-transparent w-full outline-none text-gray-700 font-medium placeholder-gray-400"
          />
        </div>
      </div>
    </>
  );
}







const SignUp = () => {
  const navigate = useNavigate();
  // mix the text with SESSION_SECRET so it's unique to this window
  const SESSION_KEY = "TC_SECURE_V1" + Math.random().toString(36).substring(7);

  const encrypt = (data) => {
    try {
      const text = JSON.stringify(data);
      return btoa(`${SESSION_KEY}|${text}`);
    } catch (e) {
      return null;
    }
  };

  const decrypt = (data) => {
    try {
      if (!data) return null;
      const decoded = atob(data);
      const [key, json] = decoded.split("|");
      if (key !== SESSION_KEY) return null;
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  };

  const [step, setStep] = useState(() => {
    return decrypt(sessionStorage.getItem("_tc_step")) || 1;
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [userRole, setUserRole] = useState(() => {
    return decrypt(sessionStorage.getItem("_tc_role")) || null;
  });


  const [errors, setErrors] = useState({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const [otpTimer, setOtpTimer] = useState(60);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [displayPic, setDisplayPic] = useState(null);
  const [biodataErrors, setBiodataErrors] = useState({});
  const [guardianErrors, setGuardianErrors] = useState({});

  // Validation function for biodata
const validateBiodataField = (field, value) => {
  switch (field) {
    case 'firstName':
    case 'lastName':
      if (!value || !value.trim()) {
        return `${field === 'firstName' ? 'First' : 'Last'} name is required`;
      }
      if (value.trim().length < 2) {
        return `${field === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
      }
      return null;

    case 'dob':
      if (!value) {
        return 'Date of birth is required';
      }
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 100) {
        return 'Please enter a valid date of birth';
      }
      return null;

    case 'gender':
      if (!value) {
        return 'Please select your gender';
      }
      return null;

    case 'department':
      if (!value) {
        return 'Please select your department';
      }
      return null;

    case 'location':
      if (!value || !value.trim()) {
        return 'Location is required';
      }
      return null;

    default:
      return null;
  }
};

// Validate all biodata fields
const validateAllBiodataFields = (studentData) => {
  const errors = {};
  const fields = ['firstName', 'lastName', 'dob', 'gender', 'department', 'location'];
  
  fields.forEach(field => {
    const error = validateBiodataField(field, studentData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

  // Step 4 (Guardian Add Student) State
  const [students, setStudents] = useState([
    { firstName: "", lastName: "", identity: "", trainings: ["", "", "", ""] },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [studentPassword, setStudentPassword] = useState("");
  const [confirmStudentPassword, setConfirmStudentPassword] = useState("");
  // show/hide toggles for guardian password fields
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showConfirmStudentPassword, setShowConfirmStudentPassword] = useState(false);

  // Eye icon for password visibility toggle
  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0032 12C11.1078 12 12.0032 11.1046 12.0032 10C12.0032 8.89543 11.1078 8 10.0032 8C8.89861 8 8.00318 8.89543 8.00318 10C8.00318 11.1046 8.89861 12 10.0032 12Z" fill="#121D24"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M0.460938 10C1.73519 5.94291 5.52549 3 10.0031 3C14.4808 3 18.2711 5.94288 19.5453 9.99996C18.2711 14.0571 14.4808 17 10.0031 17C5.5255 17 1.73521 14.0571 0.460938 10ZM14.0032 10C14.0032 12.2091 12.2123 14 10.0032 14C7.79404 14 6.00318 12.2091 6.00318 10C6.00318 7.79086 7.79404 6 10.0032 6C12.2123 6 14.0032 7.79086 14.0032 10Z" fill="#121D24"/>
    </svg>
  );

  const [selectedExams, setSelectedExams] = useState(["JAMB"]);
  const [visibleExams, setVisibleExams] = useState(["JAMB"]);
  const [examError, setExamError] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Track which exam is open
  const [selectedSubjects, setSelectedSubjects] = useState({});

  const toggleSubject = (exam, subject) => {
    const current = selectedSubjects[exam] || [];
    const limit = exam === "JAMB" ? 4 : 9;

    if (current.includes(subject)) {
      setSelectedSubjects({
        ...selectedSubjects,
        [exam]: current.filter((s) => s !== subject),
      });
    } else if (current.length < limit) {
      setSelectedSubjects({
        ...selectedSubjects,
        [exam]: [...current, subject],
      });
    }
  };

  const toggleExam = (exam) => {
    setExamError(false);
    if (selectedExams.includes(exam)) {
      setSelectedExams(selectedExams.filter((item) => item !== exam));
    } else {
      setSelectedExams([...selectedExams, exam]);
    }
  };

  const addNextExam = () => {
    const fullPool = ["JAMB", "WAEC", "GCE", "NECO"];
    const nextExam = fullPool.find(ex => !visibleExams.includes(ex));
    if (nextExam) {
      setVisibleExams([...visibleExams, nextExam]);
    }
  };

  const removeVisibleExam = (exam) => {
    if (exam === "JAMB") return; // JAMB is permanent
    setVisibleExams(visibleExams.filter(ex => ex !== exam));
    setSelectedExams(selectedExams.filter(ex => ex !== exam));
  };





  const ALL_SUBJECTS = [
    "Mathematics",
    "English",
    "Physics",
    "Biology",
    "Chemistry",
    "Financial Accounting",
    "Economics",
    "French",
    "Literature in English",
    "Commerce",
    "Geography",
    "Government",
    "Agricultural Science",
    "CRS/IRS",
    "Civic",
    "Further Maths",
    "ICT",
    "Technical Drawing",
    "Igbo",
    "Hausa",
    "Yoruba",
  ];

  const [selectedDurations, setSelectedDurations] = useState({});

  const PRICES = {
  JAMB: { Monthly: 3200, Quarterly: 9000, Biannually: 17000, Annually: 32000 },
  WAEC: { Monthly: 4500, Quarterly: 12000, Biannually: 22000, Annually: 38500 },
  NECO: { Monthly: 4000, Quarterly: 11000, Biannually: 20000, Annually: 35000 },
  GCE: { Monthly: 4500, Quarterly: 12000, Biannually: 22000, Annually: 38500 }
};

const DURATIONS = ["Monthly", "Quarterly", "Biannually", "Annually"];

  // Helper to calculate total for student
  const calculateStudentTotal = () => {
    return selectedExams.reduce((acc, exam) => {
      const duration = selectedDurations[exam] || "Monthly";
      return acc + (PRICES[exam]?.[duration] || 0);
    }, 0).toLocaleString();
  };

const [selectedPayment, setSelectedPayment] = useState(null);
  useEffect(() => {
    
    // Every time the brain changes, we lock the new data in the vault
    sessionStorage.setItem("_tc_step", encrypt(step));
    if (userRole) sessionStorage.setItem("_tc_role", encrypt(userRole));
  }, [step, userRole]);





  // Timer for OTP resend
  useEffect(() => {
    if (step !== 3) return; // Only run timer when on step 3

    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer, step]);

  const updateStudent = (index, field, value) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    setStudents(updated);
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 3) inputRefs[index + 1].current.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // --- Step 3 Handler ---
  const handleStep3Submit = () => {
    // 1. Combine the array into a single string "1234"
    const otpCode = otp.join("");

    // 2. Validate length
    if (otpCode.length < 4) {
      setFormError("Please enter the complete 4-digit code.");
      // Auto-clear error after 3 seconds
      setTimeout(() => setFormError(""), 3000);
      return;
    }

    // 3. (Optional) Simulate API Call here
    console.log(`Verifying OTP for ${userRole}:`, otpCode);

    // 4. Move to next step
    setStep(4);
  };

  const handleStep4Submit = () => {
  if (userRole === "student") {
    // Validate student biodata
    const studentData = {
      firstName,
      lastName,
      dob,
      gender,
      department,
      location,
      address,
      displayPic
    };

    const errors = validateAllBiodataFields(studentData);
    
    if (errors) {
      setBiodataErrors(errors);
      return;
    }

    setBiodataErrors({});
    console.log("Student biodata valid:", studentData);
    setStep(5);
    
  } else if (userRole === "guardian") {
    // Validate guardian data
    const errors = {};
    let hasErrors = false;

    // Validate each student
    students.forEach((student, index) => {
      const studentErrors = {};
      
      if (!student.firstName?.trim()) {
        studentErrors.firstName = 'First name is required';
        hasErrors = true;
      }
      if (!student.lastName?.trim()) {
        studentErrors.lastName = 'Last name is required';
        hasErrors = true;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(\+?234|0)(70|80|81|90|91)\d{8}$/;
      
      if (!student.identity?.trim()) {
        studentErrors.identity = 'Email or phone is required';
        hasErrors = true;
      } else if (!emailRegex.test(student.identity) && !phoneRegex.test(student.identity)) {
        studentErrors.identity = 'Invalid email or phone';
        hasErrors = true;
      }

      if (Object.keys(studentErrors).length > 0) {
        errors[`student_${index}`] = studentErrors;
      }
    });

    // Validate passwords
    if (!studentPassword || studentPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      hasErrors = true;
    }
    if (studentPassword !== confirmStudentPassword) {
      errors.passwordMatch = 'Passwords do not match';
      hasErrors = true;
    }

    if (hasErrors) {
      setGuardianErrors(errors);
      return;
    }

    setGuardianErrors({});
    console.log("Guardian data valid");
    setStep(5);
  }
};
 const handleStep5Submit = () => {
  if (userRole === 'student') {
    // Student validation: Must pick at least one exam from the grid
    if (selectedExams.length === 0) {
      setExamError(true);
      return;
    }
    setStep(6); 
  } else if (userRole === 'guardian') {
    // Validate all student biodata
    const errors = {};
    let hasErrors = false;

    students.forEach((student, index) => {
      const studentErrors = validateAllBiodataFields(student);
      if (studentErrors) {
        errors[`student_${index}`] = studentErrors;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setGuardianErrors(errors);
      return;
    }

    setGuardianErrors({});
    setStep(6);
  }
};

  const handleStep6Submit = () => {
    if (userRole === 'student') {
    // 1. Check if every selected exam has at least one subject
    const examsWithNoSubjects = selectedExams.filter(
      (exam) => !selectedSubjects[exam] || selectedSubjects[exam].length === 0
    );

    if (examsWithNoSubjects.length > 0) {
      alert(`Please select subjects for: ${examsWithNoSubjects.join(", ")}`);
      return;
    }

    // 2. Optional: Add a check for the minimum (e.g., WAEC usually requires 8-9)
    const incompleteExams = selectedExams.filter((exam) => {
      const count = selectedSubjects[exam]?.length || 0;
      return exam !== 'JAMB' && count < 8; // Adjust minimum as needed
    });
    }
    setStep(7);
  }
  // Add these handler functions in your SignUp component

// ========== STEP 7 HANDLERS ==========

const handleStudentStep7Submit = () => {
  // 1. Validate that all selected exams have durations
  const examsWithoutDuration = selectedExams.filter(
    exam => !selectedDurations[exam]
  );

  if (examsWithoutDuration.length > 0) {
    alert(`Please select duration for: ${examsWithoutDuration.join(", ")}`);
    return;
  }

  // 2. Calculate total to verify
  let total = 0;
  selectedExams.forEach(exam => {
    const duration = selectedDurations[exam];
    if (PRICES[exam] && PRICES[exam][duration]) {
      total += PRICES[exam][duration];
    }
  });

  if (total === 0) {
    alert("Unable to calculate total. Please check your selections.");
    return;
  }

  // 3. Log the data (for debugging/API preparation)
  console.log("Student Step 7 Data:", {
    exams: selectedExams,
    durations: selectedDurations,
    total: total
  });

  // 4. Move to payment
  setStep(8);
};

const handleGuardianStep7Submit = () => {
  // 1. Validate that all students with trainings have durations
  const errors = [];
  
  students.forEach((student, idx) => {
    const trainings = student.trainings?.filter(t => t !== "") || [];
    
    if (trainings.length > 0) {
      trainings.forEach(exam => {
        if (!student.durations || !student.durations[exam]) {
          errors.push(`Student ${idx + 1}: ${exam} needs a duration`);
        }
      });
    }
  });

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  // 2. Calculate total
  let total = 0;
  students.forEach(student => {
    if (student.durations && student.trainings) {
      student.trainings.filter(t => t !== "").forEach(exam => {
        const duration = student.durations[exam];
        if (duration && PRICES[exam] && PRICES[exam][duration]) {
          total += PRICES[exam][duration];
        }
      });
    }
  });

  if (total === 0) {
    alert("Unable to calculate total. Please check your selections.");
    return;
  }

  // 3. Log the data
  console.log("Guardian Step 7 Data:", {
    students: students,
    total: total
  });

  // 4. Move to payment
  setStep(8);
};



const handleStudentStep8Submit = (paymentMethod) => {
  if (!paymentMethod) {
    alert('Please select a payment method');
    return;
  }

  // 1. Calculate final total
  let total = 0;
  selectedExams.forEach(exam => {
    const duration = selectedDurations[exam];
    if (PRICES[exam] && PRICES[exam][duration]) {
      total += PRICES[exam][duration];
    }
  });

  // 2. Prepare payload for API
  const payload = {
    userRole: "student",
    email: email,
    firstName: firstName,
    lastName: lastName,
    dob: dob,
    gender: gender,
    department: department,
    location: location,
    address: address,
    displayPic: displayPic,
    examinations: selectedExams.map(exam => ({
      exam: exam,
      duration: selectedDurations[exam],
      subjects: selectedSubjects[exam] || [],
      price: PRICES[exam][selectedDurations[exam]]
    })),
    totalAmount: total,
    paymentMethod: paymentMethod
  };

  // 3. Log payload (replace with actual API call)
  console.log("Student Final Payload:", payload);

  // 4. Simulate payment processing
  console.log(`Processing ${paymentMethod} payment of ₦${total.toLocaleString()}...`);

  // TODO: Add actual payment API integration here
  // Example:
  // try {
  //   const response = await fetch('/api/payment/initiate', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload)
  //   });
  //   const data = await response.json();
  //   if (data.success) {
  //     setStep(9); // Go to success screen
  //   }
  // } catch (error) {
  //   alert('Payment failed. Please try again.');
  // }

  // 5. For now, just move to success screen
  setTimeout(() => {
    setStep(9);
  }, 1000); // Simulate processing delay
};

const handleGuardianStep8Submit = (paymentMethod) => {
  if (!paymentMethod) {
    alert('Please select a payment method');
    return;
  }

  // 1. Calculate final total
  let total = 0;
  students.forEach(student => {
    if (student.durations && student.trainings) {
      student.trainings.filter(t => t !== "").forEach(exam => {
        const duration = student.durations[exam];
        if (duration && PRICES[exam] && PRICES[exam][duration]) {
          total += PRICES[exam][duration];
        }
      });
    }
  });

  // 2. Prepare payload for API
  const payload = {
    userRole: "guardian",
    email: email,
    studentPassword: studentPassword,
    students: students.map((student, idx) => ({
      firstName: student.firstName,
      lastName: student.lastName,
      identity: student.identity,
      examinations: student.trainings?.filter(t => t !== "").map(exam => ({
        exam: exam,
        duration: student.durations?.[exam],
        price: PRICES[exam]?.[student.durations?.[exam]] || 0
      })) || []
    })),
    totalAmount: total,
    paymentMethod: paymentMethod
  };

  // 3. Log payload
  console.log("Guardian Final Payload:", payload);

  // 4. Simulate payment processing
  console.log(`Processing ${paymentMethod} payment of ₦${total.toLocaleString()}...`);

  // TODO: Add actual payment API integration here

  // 5. Move to success screen
  setTimeout(() => {
    setStep(9);
  }, 1000);
};
  //  const handleRoleSelect = (role) => {
  //   setUserRole(role);
  //   setShowError(false);
  // };


  // 5. STEP 3 RENDER OTP




  // 5. STEP 3 RENDER OTP
  const renderStepThree = () => {
    const accentImg = userRole === "student" ? otp_img_student : otp_img_parent;

    return (
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-white font-sans overflow-x-hidden">
        
        {/* --- IMAGE SECTION (Top on mobile, Right on Desktop) --- */}
        <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${accentImg})` }}
          />

          {/* Login Button (Hidden on Mobile) */}
          <div className="hidden md:block absolute bottom-[60px] left-0">
            <button
              className="px-10 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
              style={{ borderRadius: "0px 20px 20px 0px" }}
            >
              Login
            </button>
          </div>
        </div>

        {/* --- FORM SECTION --- */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center bg-[#F9FAFB] order-2 md:order-1 px-6 py-10 lg:px-[100px] lg:py-[60px] overflow-y-auto">
          <div className="w-full max-w-[448px] mx-auto text-center mt-4 md:mt-10">
            <div className="relative w-full flex items-center justify-center mb-6">
              {/* Back Button */}
              <button
                onClick={() => setStep(2)}
                className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
              >
                <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-[#09314F] uppercase tracking-tight">
                OTP VERIFICATION
              </h1>
            </div>
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 mb-6 text-sm md:text-base">
                We have sent an OTP to your email: <br /><span className="font-bold text-[#09314F]">{email}</span>
              </p>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs font-semibold">{formError}</p>
                </div>
              )}
              
              <div className="flex justify-between gap-2 md:gap-4 mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={inputRefs[i]}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className={`w-full max-w-[60px] md:max-w-[70px] h-[70px] md:h-[80px] bg-white border-2 rounded-xl text-center text-2xl md:text-3xl font-bold outline-none transition-all ${
                      formError
                        ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                        : 'border-transparent focus:border-[#09314F]'
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-600 text-xs md:text-sm mb-6">
                If you didn't get verification code yet. <br className="md:hidden" /> Resend code in{" "}
                <span className="font-bold text-[#F8BD00]">{otpTimer}</span>{" "}
                seconds
              </p>

              <button
                onClick={handleStep3Submit}
                className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
                style={{
                  background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)",
                }}
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 6. STEP 4 RENDER (Student Biodata)
  const renderStudentStepFour = () => {
    const handleFieldChange = (field, value) => {
      switch(field) {
        case 'firstName': setFirstName(value); break;
        case 'lastName': setLastName(value); break;
        case 'dob': setDob(value); break;
        case 'gender': setGender(value); break;
        case 'department': setDepartment(value); break;
        case 'location': setLocation(value); break;
        case 'address': setAddress(value); break;
        case 'displayPic': setDisplayPic(value); break;
      }
      if (biodataErrors[field]) {
        setBiodataErrors({ ...biodataErrors, [field]: null });
      }
    };

    const studentData = { firstName, lastName, dob, gender, department, location, address, displayPic };

    return (
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-white font-sans overflow-x-hidden">
        
        {/* --- IMAGE SECTION --- */}
        <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
          <img src={otp_img_student} alt="Student Biodata" className="w-full h-full object-cover" />
          <button
            onClick={() => setStep(3)}
            className="absolute left-6 top-6 md:left-10 md:top-8 bg-white/80 backdrop-blur-sm md:bg-transparent w-10 h-10 md:w-auto md:h-auto rounded-full flex items-center justify-center hover:text-gray-500 transition-all shadow-md md:shadow-none z-20"
          >
            <img src={ReturnArrow} alt="Back" className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" />
          </button>
        </div>

        {/* --- FORM SECTION --- */}
        <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-[#F9FAFB] order-2 md:order-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-[500px] mx-auto my-auto pb-4 transition-all">
            <div className="relative w-full flex items-center justify-center mb-2 mt-4 transition-all">
              <button
                onClick={() => setStep(3)}
                className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
              >
                <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Student Biodata</h1>
            </div>
            <p className="text-center text-gray-400 mb-8 text-sm md:text-base">Filling in your student biometric data.</p>

            <div className="flex flex-col gap-6">
              <StudentBiodataFields
                student={studentData}
                onChange={handleFieldChange}
                errors={biodataErrors}
                showLabels={true}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                studentIndex="student_4"
              />

              <button
                className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold mt-4 shadow-lg transition-all active:scale-95 flex items-center justify-center"
                onClick={handleStep4Submit}
                style={{ background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)" }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGuardianStepFour = () => {
    const addStudent = () => {
      setStudents([...students, { firstName: "", lastName: "", identity: "" }]);
      setActiveTab(students.length);
    };

    const toggleTab = (index) => {
      if (activeTab !== index) setActiveTab(index);
    };

    return (
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-white font-sans overflow-x-hidden">
        
        {/* --- IMAGE SECTION --- */}
        <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
          <img src={select_student} alt="Guardian Add Student" className="w-full h-full object-cover" />
        </div>

        {/* --- FORM SECTION --- */}
        <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-white order-2 md:order-1 overflow-y-auto">
          
          <div className="w-full max-w-[500px] mx-auto my-auto pb-4">
            <div className="relative w-full flex items-center justify-center mb-4 mt-4">
              <button
                onClick={() => setStep(3)}
                className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
              >
                <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Add Student</h1>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center mb-6 border border-gray-100">
              <p className="text-gray-500 text-sm leading-relaxed">
                Add your child(ren) via email or phone. They will receive a confirmation to access their information. <br />
                <span className="text-[#09314F] font-bold text-xs uppercase">(Optional)</span>
              </p>
            </div>

            {/* Student Stack */}
            <div className="flex flex-col gap-3 mb-6">
              {students.map((student, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">
                  <div
                    onClick={() => toggleTab(index)}
                    className={`flex justify-between items-center p-4 cursor-pointer select-none transition-colors 
                    ${activeTab === index ? "bg-white border-b border-gray-100" : "bg-[#F9F4F3] hover:bg-gray-100"}`}
                  >
                    <span className="font-bold text-[#09314F] text-sm uppercase">
                      Student {index + 1} {student.firstName && <span className="text-gray-400 font-normal normal-case">— {student.firstName}</span>}
                    </span>
                    <span className="text-[#09314F] transform transition-transform duration-300" style={{ rotate: activeTab === index ? "180deg" : "0deg" }}>▼</span>
                  </div>
                  {activeTab === index && (
                    <div className="p-5 bg-white flex flex-col gap-4 animate-fadeIn">
                      <div className="flex gap-3">
                        <div className="w-1/2">
                          <label className="text-xs font-bold text-gray-500 ml-1 mb-1">First Name</label>
                          <input
                            placeholder="First Name"
                            value={student.firstName}
                            onChange={(e) => updateStudent(index, "firstName", e.target.value)}
                            className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border transition-all ${
                              guardianErrors && guardianErrors[`student_${index}`]?.firstName
                                ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                : 'border-gray-300 focus:border-[#09314F]'
                            }`}
                          />
                          {guardianErrors && guardianErrors[`student_${index}`]?.firstName && (
                            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors[`student_${index}`].firstName}</p>
                          )}
                        </div>
                        <div className="w-1/2">
                          <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Last Name</label>
                          <input
                            placeholder="Last Name"
                            value={student.lastName}
                            onChange={(e) => updateStudent(index, "lastName", e.target.value)}
                            className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border transition-all ${
                              guardianErrors && guardianErrors[`student_${index}`]?.lastName
                                ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                : 'border-gray-300 focus:border-[#09314F]'
                            }`}
                          />
                          {guardianErrors && guardianErrors[`student_${index}`]?.lastName && (
                            <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors[`student_${index}`].lastName}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Email or Phone Number</label>
                        <input
                          placeholder="child@email.com or +234..."
                          value={student.identity}
                          onChange={(e) => updateStudent(index, "identity", e.target.value)}
                          className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border transition-all ${
                            guardianErrors && guardianErrors[`student_${index}`]?.identity
                              ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                              : 'border-gray-300 focus:border-[#09314F]'
                          }`}
                        />
                        {guardianErrors && guardianErrors[`student_${index}`]?.identity && (
                          <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors[`student_${index}`].identity}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addStudent}
              className="w-full h-[50px] border-2 border-dashed border-[#09314F]/30 text-[#09314F] font-bold rounded-xl hover:bg-[#09314F]/5 transition-all mb-8 flex items-center justify-center gap-2"
            >
              <span>Add another</span>
              <span className="text-xl">+</span>
            </button>

            {/* General Password */}
            <div className="flex gap-4 mb-6">
              <div className="w-1/2">
                <label className="text-xs font-bold text-gray-500 ml-1 mb-1">General Password</label>
                <div className="relative">
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border ${guardianErrors.password ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'focus:border-[#09314F]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    aria-label={showStudentPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:opacity-70 transition-all"
                  >
                    <EyeIcon />
                  </button>
                </div>
                {guardianErrors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors.password}</p>
                )}
              </div>

              <div className="w-1/2">
                <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmStudentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmStudentPassword}
                    onChange={(e) => setConfirmStudentPassword(e.target.value)}
                    className={`w-full h-[50px] bg-white px-4 rounded-lg outline-none text-sm border ${guardianErrors.passwordMatch ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'focus:border-[#09314F]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmStudentPassword(!showConfirmStudentPassword)}
                    aria-label={showConfirmStudentPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:opacity-70 transition-all"
                  >
                    <EyeIcon />
                  </button>
                </div>
                {guardianErrors.passwordMatch && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{guardianErrors.passwordMatch}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleStep4Submit}
              className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center"
              style={{ background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)" }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderGuardianStepFive = () => {
    return (
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans bg-white overflow-x-hidden">
        
        {/* --- IMAGE SECTION (Top on mobile, Right on Desktop) --- */}
        <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
          <img 
            src={select_student} 
            alt="Student Biodata" 
            className="w-full h-full object-cover" 
          />
          {/* Login Button (Hidden on Mobile) */}
          <div className="hidden md:block absolute bottom-[60px] left-0">
            <button
              className="px-10 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
              style={{ borderRadius: "0px 20px 20px 0px" }}
            >
              Login
            </button>
          </div>
        </div>

        {/* --- FORM SECTION (Bottom on mobile, Left on Desktop) --- */}
        <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-[#F9FAFB] order-2 md:order-1 overflow-y-auto">
          <div className="w-full max-w-[550px] mx-auto my-auto pb-4 transition-all">
            <div className="relative w-full flex items-center justify-center mb-4 mt-4">
              <button
                onClick={() => setStep(4)}
                className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
              >
                <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Student Biodata</h1>
            </div>
            <p className="text-center text-gray-400 mb-8 text-sm md:text-base">Filling in your student biometric data.</p>

            {/* Accordion for Multiple Students */}
            <div className="flex flex-col gap-4">
              {students.map((student, index) => (
                <div
                  key={index}
                  className={`border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white transition-all ${guardianErrors && guardianErrors[`student_${index}`] ? 'ring-4 ring-red-500/20' : ''}`}
                >
                  <div
                    onClick={() => setActiveTab(index)}
                    className={`relative flex justify-between items-center p-4 cursor-pointer transition-colors
                      ${activeTab === index ? "bg-[#F9F4F3] border-b" : "bg-white hover:bg-gray-50"}`}
                  >
                    <span className="font-bold text-[#09314F] uppercase text-xs">
                      Student {index + 1} {student.firstName && <span className="text-gray-400 font-normal normal-case">— {student.firstName}</span>}
                    </span>

                    {/* Error indicator for this student if validation found issues */}
                    {guardianErrors && guardianErrors[`student_${index}`] && (
                      <span className="absolute top-2 right-8 w-3 h-3 bg-red-500 rounded-full" title="This student has errors"></span>
                    )}

                    <span className="text-[#09314F] transform transition-transform duration-300" style={{ rotate: activeTab === index ? "180deg" : "0deg" }}>▼</span>
                  </div>

                  {activeTab === index && (
                    <div className="flex flex-col gap-5 px-6 py-8 md:px-8">
                      <StudentBiodataFields
                        student={student}
                        onChange={(field, value) => updateStudent(index, field, value)}
                        errors={guardianErrors[`student_${index}`] || {}}
                        showLabels={true}
                        studentIndex={index}
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
                      />
                      
                      {/* Display error messages below fields */}
                      {guardianErrors && guardianErrors[`student_${index}`] && (
                        <div className="mt-4 space-y-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                          {Object.entries(guardianErrors[`student_${index}`]).map(([field, error]) => (
                            <p key={field} className="text-red-600 text-xs font-semibold">{error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleStep5Submit}
              disabled={students.length === 0}
              className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold mt-10 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: students.length === 0 ? "#cccccc" : "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)",
              }}
            >
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStudentStepFive = () => {
    const examOptions = ["JAMB", "WAEC", "NECO", "GCE"];

    return (
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F4F4F4] font-sans overflow-x-hidden">
        
        {/* --- IMAGE SECTION (Right on Desktop, Top on Mobile) --- */}
        <div className="w-full h-[250px] md:w-1/2 md:h-full relative order-1 md:order-2">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${otp_img_student})` }}
          />
        </div>

        {/* --- FORM SECTION (Left on Desktop, Bottom on Mobile) --- */}
        <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          <div className="w-full max-w-[500px] mx-auto my-auto flex flex-col transition-all">
            
            {/* Header with Back Button */}
            <div className="relative w-full flex items-center justify-center mb-6 mt-4 transition-all">
              <button
                onClick={() => setStep(4)}
                className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
              >
                <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Select Training</h1>
            </div>

            {/* White Card */}
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
              <p className="text-gray-500 text-xs md:text-sm mb-10 leading-relaxed text-center max-w-[340px]">
                Select the examinations you're about to write, you have the option of selection more than 1 examination.
              </p>

              {/* 2x2 Grid of Exams */}
              <div className="grid grid-cols-2 gap-4 w-full mb-10">
                {examOptions.map((exam) => {
                  const isSelected = selectedExams.includes(exam);
                  return (
                    <button
                      key={exam}
                      onClick={() => toggleExam(exam)}
                      className={`h-[50px] md:h-[55px] rounded-lg font-bold flex items-center justify-between px-5 transition-all duration-300
                        ${isSelected 
                          ? "bg-[#76D287] text-white shadow-md shadow-green-100" 
                          : "bg-[#D1D5DB] text-[#4B5563] hover:bg-gray-400"
                        }`}
                    >
                      <span className="text-sm uppercase tracking-wide">{exam}</span>
                      {isSelected && <span className="text-sm">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Error Message */}
              {examError && (
                <p className="text-red-500 text-xs font-bold mb-4">
                  Select at least 1 examination
                </p>
              )}

              {/* Continue Button */}
              <button
                onClick={handleStep5Submit}
                className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center"
                style={{
                  background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

const renderGuardianStepSix = () => {
  const examOptions = ["JAMB", "WAEC", "NECO", "GCE"];

  const toggleStudentExam = (studentIdx, exam) => {
    const updated = [...students];
    if (!updated[studentIdx].trainings) {
      updated[studentIdx].trainings = [];
    }
    
    const currentTrainings = updated[studentIdx].trainings.filter(t => t !== "");
    if (currentTrainings.includes(exam)) {
      updated[studentIdx].trainings = currentTrainings.filter(t => t !== exam);
    } else {
      updated[studentIdx].trainings = [...currentTrainings, exam];
    }
    setStudents(updated);
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F4F4F4] font-sans overflow-x-hidden">
      
      {/* --- IMAGE SECTION (Right on Desktop, Top on Mobile) --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${signup_img})` }}
        />
      </div>

      {/* --- FORM SECTION (Left on Desktop, Bottom on Mobile) --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[500px] mx-auto my-auto flex flex-col transition-all">
          
          {/* Header with Back Button */}
          <div className="relative w-full flex items-center justify-center mb-10 transition-all">
            <button
              onClick={() => setStep(5)}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Select Training</h1>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 italic">
            <p className="text-gray-400 text-xs md:text-sm mb-10 leading-relaxed text-center">
              Select the examinations you're about to write, you have the option of selection more than 1 examination.
            </p>

            <div className="flex flex-col gap-4 mb-10">
              {students.map((student, index) => (
                <div key={index} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div
                    onClick={() => setActiveTab(activeTab === index ? null : index)}
                    className={`flex justify-between items-center p-4 cursor-pointer transition-colors
                      ${activeTab === index ? "bg-[#F9F4F3] border-b" : "bg-white hover:bg-gray-50"}`}
                  >
                    <span className="font-bold text-[#09314F] text-xs md:text-sm uppercase">
                      Student {index + 1} {student.firstName && <span className="text-gray-400 font-normal normal-case">— {student.firstName}</span>}
                    </span>
                    <span className={`transition-transform flex items-center text-[#09314F] ${activeTab === index ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>

                  {activeTab === index && (
                    <div className="p-6 bg-white">
                      <div className="grid grid-cols-2 gap-4">
                        {examOptions.map((exam) => {
                          const isSelected = student.trainings?.includes(exam);
                          return (
                            <button
                              key={exam}
                              onClick={() => toggleStudentExam(index, exam)}
                              className={`h-[45px] md:h-[50px] rounded-lg font-bold flex items-center justify-between px-4 transition-all duration-300
                                ${isSelected 
                                  ? "bg-[#76D287] text-white shadow-md shadow-green-100" 
                                  : "bg-[#D1D5DB] text-[#4B5563] hover:bg-gray-400"
                                }`}
                            >
                              <span className="text-[11px] md:text-xs uppercase tracking-wide">{exam}</span>
                              {isSelected && <span className="text-xs">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleStep6Submit}
              className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center"
              style={{ background: 'linear-gradient(90deg, #09314F 0%, #E33629 100%)' }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderStudentStepSix = () => {
    return (
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F8F9FA] font-sans overflow-x-hidden">
        
        {/* --- IMAGE SECTION (Top on mobile, Right on Desktop) --- */}
        <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${select_student})` }}
          />
        </div>

        {/* --- FORM SECTION (Bottom on mobile, Left on Desktop) --- */}
        <div className="w-full md:w-1/2 h-full flex flex-col px-4 py-10 lg:px-[80px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          <div className="w-full max-w-[550px] mx-auto my-auto flex flex-col transition-all">
            <div className="relative w-full flex items-center justify-center mb-2 mt-4 transition-all">
              <button
                onClick={() => setStep(5)}
                className="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
              >
                <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-[#09314F]">Subject Selection</h1>
            </div>
            <p className="text-gray-400 text-[11px] md:text-xs text-left md:text-center mb-8">
              Select your preferred subjects for your examination.
            </p>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible relative">
              {/* Header */}
              <div className="grid grid-cols-3 bg-[#09314F] text-white p-3 md:p-4 rounded-t-2xl text-[9px] md:text-[10px] font-bold uppercase text-center italic">
                <div>Examination</div>
                <div>Subjects</div>
                <div className="whitespace-nowrap">Subject Limit</div>
              </div>

              {/* Rows */}
              <div className="min-h-[200px]">
                {selectedExams.map((exam) => (
                  <div
                    key={exam}
                    className="grid grid-cols-3 items-center border-b border-gray-50 p-4 md:p-6 text-center relative"
                  >
                    <div className="font-black text-[#09314F] text-[10px] md:text-xs uppercase tracking-tighter">
                      {exam}
                    </div>

                    {/* The Dropdown Trigger Area */}
                    <div className="relative flex justify-center">
                      <CustomDropdown
                        isSmall={true}
                        multiSelect={true}
                        placeholder="Select..."
                        value={selectedSubjects[exam]}
                        options={ALL_SUBJECTS}
                        onChange={(sub) => toggleSubject(exam, sub)}
                        isOpen={activeDropdown === exam}
                        onToggle={() => setActiveDropdown(activeDropdown === exam ? null : exam)}
                      />
                    </div>

                    {/* Limiter Counter */}
                    <div className="font-bold text-[#09314F] text-[10px] md:text-xs">
                      {selectedSubjects[exam]?.length || 0} /{" "}
                      {exam === "JAMB" ? "4" : "8-9"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Button Area */}
              <div className="p-6 pt-10">
                <button
                  onClick={() => setStep(7)}
                  className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
                  style={{
                    background: "linear-gradient(90deg, #09314F 0%, #E33629 100%)",
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStudentStepSeven = () => {
    return (
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-white font-sans overflow-x-hidden">
        
        {/* --- IMAGE SECTION --- */}
        <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${signup_img})` }}
          />
        </div>

        {/* --- FORM SECTION --- */}
        <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          <div className="w-full max-w-[550px] mx-auto my-auto flex flex-col transition-all">
            <div className="relative w-full flex items-center justify-center mb-2 mt-4 transition-all">
              <button
                onClick={() => setStep(6)}
                className="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
              >
                <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Training Duration</h1>
            </div>
            <p className="text-gray-400 text-[11px] md:text-xs text-left md:text-center mb-8">Select your preferred training duration for your examination.</p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mb-auto">
              <div className="grid grid-cols-3 bg-[#09314F] text-white p-3 md:p-4 rounded-t-2xl text-[9px] md:text-[10px] font-bold uppercase text-center italic">
                <div>Examination</div>
                <div>Duration</div>
                <div>Amount</div>
              </div>

              {selectedExams.map((exam) => (
                <div key={exam} className="grid grid-cols-3 items-center border-b border-gray-50 p-4 md:p-6 text-center relative">
                  <div className="font-black text-[#09314F] text-[10px] md:text-xs uppercase whitespace-nowrap overflow-hidden text-ellipsis px-1">{exam}</div>
                  
                  <div className="relative flex justify-center">
                    <CustomDropdown
                      isSmall={true}
                      placeholder="Select"
                      value={selectedDurations[exam]}
                      options={DURATIONS}
                      onChange={(dur) => setSelectedDurations({...selectedDurations, [exam]: dur})}
                      isOpen={activeDropdown === `duration_${exam}`}
                      onToggle={() => setActiveDropdown(activeDropdown === `duration_${exam}` ? null : `duration_${exam}`)}
                    />
                  </div>

                  <div className="font-black text-[#09314F] text-[10px] md:text-xs">
                    ₦{PRICES[exam][selectedDurations[exam] || "Monthly"]?.toLocaleString()}
                  </div>
                </div>
              ))}

              <div className="p-6 pt-10">
                <button className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  onClick={handleStudentStep7Submit}
                  style={{ background: 'linear-gradient(90deg, #09314F 0%, #E33629 100%)' }}>
                  Continue - ₦{calculateStudentTotal()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

const renderGuardianStepSeven = () => {
  const calculateTotal = () => {
    let total = 0;
    
    students.forEach(student => {
      if (student.durations && student.trainings) {
        student.trainings.filter(t => t !== "").forEach(exam => {
          const duration = student.durations[exam];
          if (duration && PRICES[exam] && PRICES[exam][duration]) {
            total += PRICES[exam][duration];
          }
        });
      }
    });
    
    return total.toLocaleString();
  };

  const updateStudentDuration = (studentIdx, exam, duration) => {
    const updated = [...students];
    if (!updated[studentIdx].durations) {
      updated[studentIdx].durations = {};
    }
    updated[studentIdx].durations[exam] = duration;
    setStudents(updated);
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-white font-sans overflow-x-hidden">
      
      {/* --- IMAGE SECTION --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${signup_img})` }}
        />
      </div>

      {/* --- FORM SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[500px] mx-auto my-auto flex flex-col transition-all">
          <div className="relative w-full flex items-center justify-center mb-2 mt-4 transition-all">
            <button 
              onClick={() => setStep(6)} 
              className="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
            >
              <img src={ReturnArrow} alt="Back" className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Select Duration</h1>
          </div>
          <p className="text-gray-400 text-[10px] md:text-xs text-left md:text-center mb-8">
            Select your preferred training duration for each student.
          </p>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-auto">
            {students.map((student, idx) => (
              <div key={idx} className="border-b border-gray-100 mb-4 pb-4 last:border-0">
                <div 
                  className="flex justify-between items-center py-2 cursor-pointer group" 
                  onClick={() => setActiveTab(activeTab === idx ? null : idx)}
                >
                  <span className="font-bold text-[#09314F] text-xs md:text-sm uppercase">
                    Student {idx + 1}
                  </span>
                  <span className={`transition-transform flex items-center text-[#09314F] ${activeTab === idx ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                 
                {activeTab === idx && (
                  <div className="flex flex-col gap-4 mt-4 animate-fadeIn">
                    {student.trainings && student.trainings.filter(t => t !== "").map((exam, examIdx) => (
                      <div key={`${exam}-${examIdx}`} className="flex items-center justify-between gap-4 p-3 bg-[#FDF2F2] rounded-xl">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-black text-[#09314F] uppercase tracking-tighter">
                            {exam}
                          </label>
                          <span className="text-[11px] font-bold text-[#E33629]">
                            ₦{PRICES[exam]?.[student.durations?.[exam] || DURATIONS[0]]?.toLocaleString() || '0'}
                          </span>
                        </div>
                         
                        <div className="flex-1 max-w-[120px]">
                          <CustomDropdown
                            isSmall={true}
                            placeholder="Select"
                            value={student.durations?.[exam]}
                            options={DURATIONS}
                            onChange={(dur) => updateStudentDuration(idx, exam, dur)}
                            isOpen={activeDropdown === `guardian_dur_${idx}_${exam}`}
                            onToggle={() => setActiveDropdown(activeDropdown === `guardian_dur_${idx}_${exam}` ? null : `guardian_dur_${idx}_${exam}`)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button 
              onClick={() => handleGuardianStep7Submit()}
              className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold mt-8 flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
              style={{ background: 'linear-gradient(90deg, #09314F 0%, #E33629 100%)' }}
            >
              Continue - ₦{calculateTotal()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== STEP 8: PAYMENT METHOD ==========
const renderStudentStepEight = () => {
  const paymentMethods = [
    { id: 'paystack', label: 'Paystack' },
    { id: 'paypal', label: 'Paypal' },
    { id: 'inter-switch', label: 'Inter-switch' }
  ];

  const handlePaymentSubmit = () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }
    // Process payment here
    console.log('Processing payment via:', selectedPayment);
    setStep(9); // Move to success screen
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans bg-white overflow-x-hidden">
      {/* --- IMAGE SECTION (Top on mobile, Right on Desktop) --- */}
      <div className="w-full h-[192px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <img 
          src={otp_img_student} 
          alt="Payment" 
          className="w-full h-full object-cover" 
        />
        {/* Login Button (Hidden on Mobile) */}
        <div className="hidden md:block absolute bottom-[60px] left-0">
          <button
            className="px-10 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
            style={{ borderRadius: "0px 20px 20px 0px" }}
          >
            Login
          </button>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-[#F9FAFB] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[448px] mx-auto my-auto text-center transition-all">
          <div className="relative w-full flex items-center justify-center mb-6 transition-all">
            <button 
              onClick={() => setStep(7)} 
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img src={ReturnArrow} alt="Back" className="h-6 w-6 lg:h-5 lg:w-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Payment Method</h1>
          </div>
          <p className="text-gray-400 text-sm mb-8">Select a preferred method of payment</p>

          <div className="flex flex-col gap-4 mb-8">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full h-[55px] rounded-xl border-2 px-6 flex items-center justify-between transition-all
                  ${selectedPayment === method.id 
                    ? 'border-[#09314F] bg-[#F9F4F3]' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <span className="font-semibold text-[#09314F]">{method.label}</span>
                <span className="text-gray-400">→</span>
              </button>
            ))}
          </div>

          <button
            onClick={handlePaymentSubmit}
            className="w-full h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, #0F2C45 0%, #A92429 100%)' }}
          >
            Continue - ₦{calculateStudentTotal()}
          </button>
        </div>
      </div>
    </div>
  );
};

const renderGuardianStepEight = () => {
  
  
  const paymentMethods = [
    { id: 'paystack', label: 'Paystack' },
    { id: 'paypal', label: 'Paypal' },
    { id: 'inter-switch', label: 'Inter-switch' }
  ];

  // Calculate total from students' selections
  const calculateTotal = () => {
    let total = 0;
    students.forEach(student => {
      if (student.durations && student.trainings) {
        student.trainings.filter(t => t !== "").forEach(exam => {
          const duration = student.durations[exam];
          if (duration && PRICES[exam] && PRICES[exam][duration]) {
            total += PRICES[exam][duration];
          }
        });
      }
    });
    return total.toLocaleString();
  };

  const handlePaymentSubmit = () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }
    console.log('Processing payment via:', selectedPayment);
    setStep(9);
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans bg-white overflow-x-hidden">
      {/* --- IMAGE SECTION (Top on mobile, Right on Desktop) --- */}
      <div className="w-full h-[192px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <img 
          src={select_student} 
          alt="Payment" 
          className="w-full h-full object-cover" 
        />
        {/* Login Button (Hidden on Mobile) */}
        <div className="hidden md:block absolute bottom-[60px] left-0">
          <button
            className="px-10 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
            style={{ borderRadius: "0px 20px 20px 0px" }}
          >
            Login
          </button>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-[#F9FAFB] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[448px] mx-auto my-auto text-center transition-all">
          <div className="relative w-full flex items-center justify-center mb-6 transition-all">
            <button 
              onClick={() => setStep(7)} 
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img src={ReturnArrow} alt="Back" className="h-6 w-6 lg:h-5 lg:w-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Payment Method</h1>
          </div>
          <p className="text-gray-400 text-sm mb-8">Select a preferred method of payment</p>

          <div className="flex flex-col gap-4 mb-8">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full h-[55px] rounded-xl border-2 px-6 flex items-center justify-between transition-all
                  ${selectedPayment === method.id 
                    ? 'border-[#09314F] bg-[#F9F4F3]' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <span className="font-semibold text-[#09314F]">{method.label}</span>
                <span className="text-gray-400">→</span>
              </button>
            ))}
          </div>

          <button
            onClick={handlePaymentSubmit}
            className="w-full h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(90deg, #0F2C45 0%, #A92429 100%)' }}
          >
            Continue - ₦{calculateTotal()}
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== STEP 9: SUCCESS SCREEN ==========
const renderStudentSuccessScreen = () => {
  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans bg-white overflow-x-hidden">
      {/* --- IMAGE SECTION (Top on mobile, Right on Desktop) --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <img 
          src={otp_img_student} 
          alt="Success" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-white order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[400px] mx-auto my-auto text-center transition-all">
          {/* Success Icon */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#09314F] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#09314F] mb-4">Payment Successful!</h1>

          {/* Access Info */}
          <p className="text-gray-500 text-sm mb-2">You now have access for</p>
          <div className="mb-8">
            {selectedExams.map((exam, idx) => (
              <p key={idx} className="text-[#09314F] font-semibold text-sm">
                {exam} - {selectedDurations[exam] || 'Monthly'}
              </p>
            ))}
          </div>

          {/* Dashboard Button */}
          <button
            onClick={() => {
              // Navigate to dashboard
              console.log('Going to dashboard...');
            }}
            className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(90deg, #0F2C45 0%, #A92429 100%)' }}
          >
            Go To Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const renderGuardianSuccessScreen = () => {
  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans bg-white overflow-x-hidden">
      {/* --- IMAGE SECTION (Top on mobile, Right on Desktop) --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <img 
          src={select_student} 
          alt="Success" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] bg-white order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[400px] mx-auto my-auto text-center transition-all">
          {/* Success Icon */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#09314F] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#09314F] mb-4">Payment Successful!</h1>

          {/* Access Info */}
          <p className="text-gray-500 text-sm mb-4">You now have access for</p>
          <div className="mb-8 space-y-2">
            {students.map((student, idx) => (
              <div key={idx} className="text-left bg-[#F9F4F3] p-3 rounded-lg">
                <p className="text-[#09314F] font-bold text-xs uppercase">Student {idx + 1}</p>
                {student.trainings && student.trainings.filter(t => t !== "").map((exam, examIdx) => (
                  <p key={examIdx} className="text-gray-600 text-xs">
                    {exam} - {student.durations?.[exam] || 'Monthly'}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Dashboard Button */}
          <button
            onClick={() => {
              console.log('Going to dashboard...');
            }}
            className="w-full h-[55px] md:h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(90deg, #0F2C45 0%, #A92429 100%)' }}
          >
            Go To Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

  if (showSplash) return <SplashScreen />;

  if (step === 1) {
    return (
      <StepOne
        userRole={userRole}
        setUserRole={setUserRole}
        setStep={setStep}
      />
    );
  }
  if (step === 2) {
    return (
      <StepTwo
        userRole={userRole}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        setStep={setStep}
      />
    );
  }
  if (step === 3) return renderStepThree();
  if (step === 4) {
    return userRole === "student"
      ? renderStudentStepFour()
      : renderGuardianStepFour();
  }
  if (step === 5) {
    return userRole === "student"
      ? renderStudentStepFive()
      : renderGuardianStepFive();
  }
  if (step === 6) {
    return userRole === "student"
      ? renderStudentStepSix()
      : renderGuardianStepSix();
  }
  if (step === 7) {
    return userRole === "student"
    ? renderStudentStepSeven()
    :  renderGuardianStepSeven();
  }
  if (step === 8) {
  return userRole === "student"
    ? renderStudentStepEight()
    : renderGuardianStepEight();
}
if (step === 9) {
  return userRole === "student"
    ? renderStudentSuccessScreen()
    : renderGuardianSuccessScreen();
}

  return null;
};

export default SignUp;




