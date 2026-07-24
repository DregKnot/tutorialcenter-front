import React from 'react';

const JoinMethodModal = ({ isOpen, onClose, onJoinWeb, onJoinApp }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
            Choose Join Method
          </h3>
          <p className="text-sm text-center text-gray-500 mb-6">
            How would you like to join this meeting?
          </p>

          <div className="space-y-3">
            <button
              onClick={onJoinApp}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.585 22l-1.34-6.335-3.076 3.076c.074.843.434 1.637 1.051 2.254.673.673 1.547 1.026 2.457 1.005h.908zM19.416 2l1.34 6.335 3.075-3.076c-.074-.843-.434-1.637-1.051-2.254-.673-.673-1.547-1.026-2.457-1.005h-.907zM20 15v5c0 1.103-.897 2-2 2H6c-1.103 0-2-.897-2-2v-5c0-1.103.897-2 2-2h12c1.103 0 2 .897 2 2z"/>
              </svg>
              <span>Join via Zoom App</span>
            </button>
            
            <button
              onClick={onJoinWeb}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>Join on Web</span>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinMethodModal;
