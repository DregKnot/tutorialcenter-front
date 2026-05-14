import React from "react";
import { 
  XMarkIcon, 
  AcademicCapIcon, 
  TrashIcon, 
  PencilSquareIcon,
  BookOpenIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

export default function SubjectDetailModal({ isOpen, subject, course, onClose, onDelete, onEdit }) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-[#0F2843]/60 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[90vh] rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20">
        
        {/* Left Side: Banner Section */}
        <div className="relative w-full md:w-[45%] h-64 md:h-auto overflow-hidden shrink-0 group">
          {subject.banner ? (
            <img 
              src={subject.banner.startsWith('http') ? subject.banner : `${API_BASE_URL}/storage/${subject.banner}`} 
              alt={subject.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[#0F2843] flex flex-col items-center justify-center gap-4">
              <AcademicCapIcon className="w-20 h-20 text-[#BB9E7F]/20" />
              <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">No Subject Banner</span>
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2843] via-transparent to-transparent opacity-60 md:opacity-80" />
          
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-[#BB9E7F] text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-lg">Subject Module</span>
              <div className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-lg border border-white/5">
                <CheckBadgeIcon className="w-3 h-3 text-[#76D287]" />
                Active
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-2xl uppercase leading-tight">{subject.name}</h2>
          </div>
        </div>

        {/* Right Side: Content Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:bg-[#E83831] hover:text-white transition-all active:scale-90 z-20"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="p-8 sm:p-12 space-y-12">
            {/* Syllabus Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#BB9E7F] rounded-full"></div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">Syllabus Overview</h3>
              </div>
              <p className="text-lg text-[#0F2843] dark:text-gray-300 leading-relaxed font-bold whitespace-pre-wrap">
                {subject.description?.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ") || "This subject module provides in-depth comprehensive learning materials and interactive sessions designed to help students master the complexities of the topic and prepare for excellence."}
              </p>
            </div>

            {/* Parent Curriculum & Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700">
                  <BookOpenIcon className="w-8 h-8 text-[#BB9E7F] mb-4" />
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Parent Curriculum</h4>
                  <p className="text-lg font-black text-[#0F2843] dark:text-white tracking-tight uppercase leading-tight">
                    {course?.title || "Standalone Subject"}
                  </p>
               </div>

               <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700">
                  <AcademicCapIcon className="w-8 h-8 text-[#76D287] mb-4" />
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Academic Departments</h4>
                  <p className="text-lg font-black text-[#0F2843] dark:text-white tracking-tight uppercase leading-tight">
                    {Array.isArray(subject.departments) ? subject.departments.join(", ") : (subject.departments || "All Tracks")}
                  </p>
               </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onEdit(subject)}
                className="flex-1 py-5 bg-[#0F2843] text-white font-black rounded-3xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
              >
                <PencilSquareIcon className="w-5 h-5 text-[#BB9E7F]" />
                Edit Module
              </button>
              <button 
                onClick={() => onDelete(subject.id)}
                className="flex-1 py-5 bg-red-50 text-red-500 font-black rounded-3xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm uppercase tracking-widest text-xs"
              >
                <TrashIcon className="w-5 h-5" />
                Terminate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
