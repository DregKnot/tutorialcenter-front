import React from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function BatchSubmissionOverlay({
  questions,
  submissionStatus,
  submissionErrors,
  isBatchSubmitting,
  batchComplete,
  onClose,
  onRetryFailed
}) {
  if (!isBatchSubmitting && !batchComplete) return null;

  const totalQuestions = questions.filter(q => !q.isSaved || submissionStatus[q.tempId]).length;
  const processed = Object.values(submissionStatus).filter(s => s === 'success' || s === 'failed').length;
  const successCount = Object.values(submissionStatus).filter(s => s === 'success').length;
  const failedCount = Object.values(submissionStatus).filter(s => s === 'failed').length;
  const progressPercent = totalQuestions > 0 ? (processed / totalQuestions) * 100 : 0;

  const allDone = batchComplete;
  const allSuccess = allDone && failedCount === 0;
  const hasFailed = failedCount > 0;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitting':
        return (
          <div className="w-8 h-8 rounded-full border-[3px] border-[#BB9E7F]/30 border-t-[#BB9E7F] animate-spin" />
        );
      case 'success':
        return <CheckCircleIcon className="w-8 h-8 text-[#76D287]" />;
      case 'failed':
        return <XCircleIcon className="w-8 h-8 text-red-500" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full border-[3px] border-gray-300 dark:border-gray-600" />
        );
    }
  };

  const getStatusLabel = (tempId, status) => {
    switch (status) {
      case 'submitting':
        return <span className="text-[#BB9E7F] font-bold text-xs uppercase tracking-widest">Submitting...</span>;
      case 'success':
        return <span className="text-[#76D287] font-bold text-xs uppercase tracking-widest">Successfully created</span>;
      case 'failed':
        return <span className="text-red-500 font-bold text-xs uppercase tracking-widest">{submissionErrors[tempId] || 'Failed'}</span>;
      default:
        return <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Waiting...</span>;
    }
  };

  const getRowBg = (status) => {
    switch (status) {
      case 'success':
        return 'bg-[#76D287]/5 border-[#76D287]/20';
      case 'failed':
        return 'bg-red-500/5 border-red-500/20';
      case 'submitting':
        return 'bg-[#BB9E7F]/5 border-[#BB9E7F]/20';
      default:
        return 'bg-white/5 border-white/10';
    }
  };
  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center animate-in fade-in duration-500">
      <style>{`
        @keyframes continuousGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-pulse-gradient {
          background: linear-gradient(-45deg, #4187d29f 0%, #1d4fd891 20%, #bb9e7fa0 40%, #1b3d6095 60%, #0a1625a4 80%, #0f2843b6 100%);
          background-size: 200% 200%;
          animation: continuousGradient 20s linear alternate infinite;
        }
      `}</style>
      
      {/* 100% Opaque High-Intensity Color Gradient Backdrop - Blocks any white background leak */}
      <div className="absolute inset-0 animate-pulse-gradient backdrop-blur-[8px]" />

      {/* Main Lens Container */}
      <div className="relative w-[90vw] max-w-2xl max-h-[85vh] flex flex-col">

        {/* Corner Brackets - Google Lens Style */}
        {/* Top Left */}
        <div className="absolute -top-4 -left-4 w-16 h-16 border-t-[4px] border-l-[4px] border-[#BB9E7F] rounded-tl-[20px]" />
        {/* Top Right */}
        <div className="absolute -top-4 -right-4 w-16 h-16 border-t-[4px] border-r-[4px] border-[#BB9E7F] rounded-tr-[20px]" />
        {/* Bottom Left */}
        <div className="absolute -bottom-4 -left-4 w-16 h-16 border-b-[4px] border-l-[4px] border-[#BB9E7F] rounded-bl-[20px]" />
        {/* Bottom Right */}
        <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-[4px] border-r-[4px] border-[#BB9E7F] rounded-br-[20px]" />

        {/* Progress Bar at Top */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              allSuccess ? 'bg-[#76D287]' : hasFailed && allDone ? 'bg-gradient-to-r from-[#76D287] to-red-500' : 'bg-gradient-to-r from-[#BB9E7F] to-[#76D287]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          {allDone ? (
            <>
              {allSuccess ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 bg-[#76D287]/20 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                    <CheckCircleIcon className="w-10 h-10 text-[#76D287]" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">All Questions Created!</h2>
                  <p className="text-[#BB9E7F] text-xs font-bold uppercase tracking-[0.3em] mt-2">{successCount} of {totalQuestions} processed successfully</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                    <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Batch Complete</h2>
                  <p className="text-red-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">{failedCount} failed · {successCount} succeeded</p>
                </>
              )}
            </>
          ) : (
            <>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Submitting Questions</h2>
              <p className="text-[#BB9E7F] text-xs font-bold uppercase tracking-[0.3em] mt-2">Processing {processed} of {totalQuestions}</p>
            </>
          )}
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 min-h-0 max-h-[45vh]">
          {questions.filter(q => submissionStatus[q.tempId]).map((q, idx) => {
            const status = submissionStatus[q.tempId] || 'idle';
            return (
              <div 
                key={q.tempId}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-500 animate-in slide-in-from-left duration-300 ${getRowBg(status)}`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(status)}
                </div>

                {/* Question Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-black text-sm">
                      Q{q.questionNumber || '?'}
                    </span>
                    <span className="text-white/40 text-xs truncate max-w-[200px]">
                      {q.questionText ? q.questionText.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...' : 'No text'}
                    </span>
                  </div>
                  <div className="mt-1">
                    {getStatusLabel(q.tempId, status)}
                  </div>
                </div>

                {/* Question Index Badge */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                  status === 'success' ? 'bg-[#76D287]/20 text-[#76D287]' :
                  status === 'failed' ? 'bg-red-500/20 text-red-500' :
                  status === 'submitting' ? 'bg-[#BB9E7F]/20 text-[#BB9E7F]' :
                  'bg-white/10 text-white/40'
                }`}>
                  {idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        {allDone && (
          <div className="flex items-center gap-4 mt-8 animate-in slide-in-from-bottom duration-500">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-white/10 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {allSuccess ? 'Done' : 'Close'}
            </button>
            {hasFailed && (
              <button
                type="button"
                onClick={onRetryFailed}
                className="flex-[2] py-5 bg-[#BB9E7F] text-[#0F2843] font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-[#BB9E7F]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#BB9E7F]/30"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Retry {failedCount} Failed Question{failedCount > 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
