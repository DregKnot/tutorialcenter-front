import React from 'react';
import { Icon } from '@iconify/react';

const EmbeddedVideoModal = ({ videoUrl, videoId, onClose }) => {
  if (!videoUrl && !videoId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
      >
        <Icon icon="lucide:x" className="w-6 h-6" />
      </button>

      <div className="w-full max-w-6xl w-11/12 h-[80vh] md:h-[90vh] flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Fullscreen indicator helper */}
        <div className="absolute top-4 left-4 bg-black/60 px-4 py-2 rounded-lg text-white font-semibold text-sm backdrop-blur-sm z-10 flex items-center gap-2 pointer-events-none">
          <Icon icon="lucide:maximize" className="w-4 h-4"/> Use player controls to expand fullscreen
        </div>
        {videoId ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1`}
            title="Recorded Masterclass"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          ></iframe>
        ) : (
          <iframe
            className="w-full h-full"
            src={videoUrl}
            title="Recorded Masterclass"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default EmbeddedVideoModal;
