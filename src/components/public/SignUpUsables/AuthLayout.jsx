import React from 'react';
import ReturnArrow from "../../../assets/svg/return arrow.svg";

const AuthLayout = ({
  image,
  title,
  subtitle,
  onBack,
  children,
  isStudent = true // Controls order on desktop/mobile if needed, though usually consistent
}) => {
  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F8F9FA] font-sans overflow-x-hidden">
      
      {/* --- IMAGE SECTION --- */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full bg-gray-200 relative order-1 md:order-2">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        {/* Optional: Login button overlay often seen in sketches? 
            If needed, passing a prop or slot for it would be good. 
            For now, keeping it simple as per most steps.
        */}
      </div>

      {/* --- FORM SECTION --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[80px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[550px] mx-auto my-auto flex flex-col transition-all">
          
          {/* Header */}
          <div className="relative w-full flex items-center justify-center mb-2 mt-4 transition-all">
            {onBack && (
              <button
                onClick={onBack}
                className="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
              >
                <img className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5" src={ReturnArrow} alt="Back" />
              </button>
            )}
            <h1 className="text-2xl md:text-3xl font-black text-[#09314F] text-center">
              {title}
            </h1>
          </div>
          
          {subtitle && (
            <p className="text-gray-400 text-[11px] md:text-xs text-left md:text-center mb-8">
              {subtitle}
            </p>
          )}

          {/* Content */}
          <div className="w-full">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
