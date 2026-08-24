import React from 'react';

const SectionSkeleton = () => {
  return (
    <div className="w-full bg-white dark:bg-[#06243A] py-16">
      <div className="Container">
        <div className="grid md:grid-cols-2 gap-10 items-center animate-pulse">
          
          {/* Text Content Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="w-24 h-6 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="w-3/4 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
            
            <div className="flex flex-col gap-3">
              <div className="w-full h-4 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
              <div className="w-4/6 h-4 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
            </div>

            <div className="w-32 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl mt-6"></div>
          </div>

          {/* Image Skeleton */}
          <div className="w-full h-[300px] md:h-[400px] bg-gray-100 dark:bg-gray-800/50 rounded-2xl"></div>

        </div>
      </div>
    </div>
  );
};

export default SectionSkeleton;
