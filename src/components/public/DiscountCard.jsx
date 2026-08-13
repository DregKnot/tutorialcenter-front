import React from 'react';

const DiscountCard = ({ title, slashedPrice, actualPrice, savingsText }) => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-white group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      {/* 80% OFF Green Tag on Edge */}
      <div className="absolute top-5 -right-8 bg-green-500 text-white text-xs font-black px-10 py-1.5 uppercase tracking-widest transform rotate-45 shadow-md z-20">
        80% OFF
      </div>

      {/* Top Section (75%) - Discount Price */}
      <div className="relative bg-[#0FFF4F] pt-8 pb-16 px-6 flex-grow overflow-hidden flex flex-col justify-center">
        {savingsText && (
          <div className="absolute top-0 left-0 bg-[#BB9E7F] text-white text-[10px] font-black uppercase px-3 py-1 rounded-br-xl shadow-sm z-10">
            {savingsText}
          </div>
        )}
        <h4 className="text-gray-500 font-bold mb-3 text-sm z-10 relative uppercase tracking-wider">{title}</h4>
        
        {/* Flashy Banner */}
        <div className="inline-block bg-gradient-to-r from-green-400 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest mb-3 w-max shadow-sm z-10 relative">
          Discount Price
        </div>

        <div className="text-5xl font-black text-[#09314F] tracking-tighter drop-shadow-sm z-10 relative flex items-baseline">
          <span className="text-2xl mr-1 text-gray-400 font-bold">₦</span>
          {actualPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </div>
        
        {/* Curved Aesthetic SVG Divider */}
        <svg 
          className="absolute -bottom-1 left-0 w-full h-16 text-[#F0F4F8]" 
          preserveAspectRatio="none" 
          viewBox="0 0 1440 320" 
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,208C960,192,1056,160,1152,138.7C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Bottom Section (25%) - Original Price */}
      <div className="bg-[#F0F4F8] px-6 pb-6 pt-2 relative z-10">
        <p className="text-[10px] font-bold text-[#09314F]/50 uppercase tracking-widest mb-1">Original Price</p>
        <div className="text-2xl font-black text-[#09314F]/40 line-through tracking-tight flex items-baseline">
          <span className="text-lg mr-1 font-bold">₦</span>
          {slashedPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </div>
      </div>
    </div>
  );
};

export default DiscountCard;
