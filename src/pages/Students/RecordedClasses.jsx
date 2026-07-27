import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthContext";

const mockClasses = [
  {
    id: 1,
    title: "Introduction to Calculus & Limits",
    subject: "Mathematics",
    date: "Oct 24, 2023",
    duration: "1h 45m",
    videoId: "dQw4w9WgXcQ",
    color: "from-blue-500 to-cyan-400"
  },
  {
    id: 2,
    title: "Cellular Respiration In-depth",
    subject: "Biology",
    date: "Oct 22, 2023",
    duration: "2h 10m",
    videoId: "dQw4w9WgXcQ",
    color: "from-emerald-500 to-teal-400"
  },
  {
    id: 3,
    title: "Newton's Laws of Motion",
    subject: "Physics",
    date: "Oct 20, 2023",
    duration: "1h 30m",
    videoId: "dQw4w9WgXcQ",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 4,
    title: "Chemical Bonding Fundamentals",
    subject: "Chemistry",
    date: "Oct 18, 2023",
    duration: "1h 55m",
    videoId: "dQw4w9WgXcQ",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    title: "World War II - Overview",
    subject: "History",
    date: "Oct 15, 2023",
    duration: "1h 15m",
    videoId: "dQw4w9WgXcQ",
    color: "from-yellow-500 to-amber-600"
  },
  {
    id: 6,
    title: "Grammar & Sentence Structure",
    subject: "English",
    date: "Oct 14, 2023",
    duration: "1h 00m",
    videoId: "dQw4w9WgXcQ",
    color: "from-sky-500 to-indigo-500"
  }
];

const RecordedClasses = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { setIsClassActive } = useAuth();

  // Prevent autologout while watching a recorded class
  useEffect(() => {
    if (selectedVideo) {
      setIsClassActive(true);
    } else {
      setIsClassActive(false);
    }

    return () => {
      setIsClassActive(false);
    };
  }, [selectedVideo, setIsClassActive]);

  const filteredClasses = mockClasses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      pagetitle="Recorded Classes"
      hideRightPanel={true}
      hideHeader={false}
    >
      <div className="w-full max-w-[1400px] mx-auto pb-10">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#09314F] dark:text-white tracking-tight mb-2">
            Recorded Masterclasses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Catch up on sessions you missed or review topics for your upcoming exams.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search classes by title or subject..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E83831]/20 focus:border-[#E83831] transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold text-gray-600 dark:text-gray-300">
              <Icon icon="lucide:filter" className="w-4 h-4" />
              Filter
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold text-gray-600 dark:text-gray-300">
              <Icon icon="lucide:arrow-down-up" className="w-4 h-4" />
              Sort
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClasses.map((cls) => (
              <div 
                key={cls.id} 
                className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedVideo(cls)}
              >
                {/* Thumbnail Area */}
                <div className={`relative aspect-video w-full bg-gradient-to-br ${cls.color} flex items-center justify-center overflow-hidden`}>
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_2px,transparent_2px)] bg-[size:16px_16px]"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-transform duration-300">
                    <Icon icon="lucide:play" className="w-6 h-6 text-white ml-1" />
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-md tracking-wider">
                    {cls.duration}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-[#09314F] dark:text-blue-300 text-[10px] font-black uppercase tracking-wider rounded-md">
                      {cls.subject}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Icon icon="lucide:calendar" className="w-3.5 h-3.5" />
                      {cls.date}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight mb-2 group-hover:text-[#E83831] transition-colors line-clamp-2">
                    {cls.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Icon icon="lucide:user" className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Instructor</span>
                    </div>
                    <button className="text-[#E83831] text-xs font-black uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                      Watch <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center p-20 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 mt-8">
            <Icon icon="lucide:video-off" className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-black text-gray-400 mb-2">No recorded classes yet</h3>
            <p className="text-sm text-gray-400 max-w-md text-center">
              {searchQuery ? `We couldn't find any recordings matching "${searchQuery}". Try adjusting your search.` : "When your live sessions end, their recordings will appear here for you to re-watch anytime."}
            </p>
          </div>
        )}

      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col relative">
            
            {/* Modal Header */}
            <div className="absolute top-0 inset-x-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-3">
                <span className="bg-[#E83831] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">
                  {selectedVideo.subject}
                </span>
                <h3 className="text-white font-bold text-sm md:text-base drop-shadow-md">
                  {selectedVideo.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="pointer-events-auto w-10 h-10 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full aspect-video bg-black relative">
              <iframe
                src={`https://youtu.be/MOclJJ7IpSY?si=XCMpWZgAvTDQK95s`}
                title="Recorded Class Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
            
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default RecordedClasses;
