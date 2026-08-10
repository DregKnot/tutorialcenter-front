import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const RecordedClasses = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recordedClasses, setRecordedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setIsClassActive, token } = useAuth();
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

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

  // Fetch recorded classes from backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        };
        const response = await axios.get(`${API_BASE_URL}/api/students/recorded-classes`, { headers });
        if (response.data?.success) {
          setRecordedClasses(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch recorded classes", err);
        const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Could not load recorded classes.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchClasses();
  }, [token, API_BASE_URL]);

  const filteredClasses = recordedClasses.filter(c => 
    (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
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
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Icon icon="lucide:loader-2" className="w-8 h-8 text-[#E83831] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-semibold">{error}</div>
        ) : filteredClasses.length > 0 ? (
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
                    <span className="inline-block px-2.5 py-1 bg-[#09314F]/10 dark:bg-gray-700 text-[#09314F] dark:text-blue-300 text-[10px] font-black uppercase tracking-wider rounded-md">
                      {cls.subject}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Icon icon="lucide:calendar" className="w-3.5 h-3.5" />
                      {cls.date}
                    </span>
                  </div>

                  {/* Subtitle / Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
                      <Icon icon="lucide:user" className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{cls.tutor}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight mb-2 group-hover:text-[#E83831] transition-colors line-clamp-2">
                    {cls.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#09314F] text-white flex items-center justify-center text-[10px] font-bold">
                        {cls.tutor?.[0] || "T"}
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {cls.tutor || "Instructor"}
                      </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <Icon icon="lucide:x" className="w-6 h-6" />
          </button>

          <div className="w-full max-w-6xl w-11/12 h-[80vh] md:h-[90vh] flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Fullscreen indicator helper */}
            <div className="absolute top-4 left-4 bg-black/60 px-4 py-2 rounded-lg text-white font-semibold text-sm backdrop-blur-sm z-10 flex items-center gap-2">
              <Icon icon="lucide:maximize" className="w-4 h-4"/> Use player controls to expand fullscreen
            </div>
            {selectedVideo.videoId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.videoId}?autoplay=1&modestbranding=1&rel=0&controls=1`}
                title="Recorded Masterclass"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              ></iframe>
            ) : (
              <iframe
                className="w-full h-full"
                src={selectedVideo.videoUrl}
                title="Recorded Masterclass"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default RecordedClasses;
