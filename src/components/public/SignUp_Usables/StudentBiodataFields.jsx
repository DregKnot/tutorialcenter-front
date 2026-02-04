import React, { useState, useEffect, useRef } from 'react';
import InputField from './InputField';
import CustomDropdown from './CustomDropdown';
import ReturnArrow from "../../../assets/svg/return arrow.svg"; // Adjust path if needed, usually imported in parent but here it's used for mobile back?
// Actually ReturnArrow is used in line 215. I need to check the path.
// The file is in src/components/public/ so path to assets is ../../assets/svg/return arrow.svg
// which matches.

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

export default StudentBiodataFields;
