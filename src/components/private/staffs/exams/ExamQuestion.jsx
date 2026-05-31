import React from 'react';
import StaffDashboardLayout from '../DashboardLayout.jsx';
import { 
  PlusIcon, 
  IdentificationIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import ExamBodyCreateModal from './ExamBodyCreateModal';
import ExamYearCreateModal from './ExamYearCreateModal';
import ExamGroupSection from './components/ExamGroupSection';
import QuestionItem from './components/QuestionItem';
import BatchSubmissionOverlay from './components/BatchSubmissionOverlay';
import useExamForm from './components/useExamForm';

export default function ExamQuestion() {
  const {
    examBodyId,
    courseId,
    subjectId,
    examYearId,
    groupType, setGroupType,
    groupTitle, setGroupTitle,
    groupContent, setGroupContent,
    groupImagePreview, setGroupImagePreview,
    sortOrder, setSortOrder,
    allGroups,
    selectedGroupId, setSelectedGroupId,
    isGroupCreationMode, setIsGroupCreationMode,
    groupSearchTerm, setGroupSearchTerm,
    questions,
    examBodies,
    courses,
    subjects,
    filteredYears,
    loading,
    fetchingData,
    messageToast,
    isExamBodyModalOpen, setIsExamBodyModalOpen,
    isExamYearModalOpen, setIsExamYearModalOpen,
    isEditMode,
    navigate,
    handleSubjectChange,
    handleBodyChange,
    handleYearChange,
    handleCreateSuccess,
    handleGroupImageChange,
    addQuestion,
    removeQuestion,
    toggleExpand,
    updateQuestionField,
    isDuplicateNumber,
    isScienceSubject,
    insertSymbol,
    handleOptionChange,
    addOption,
    removeOption,
    handleQuestionFilesChange,
    removeFile,
    handleCaptionChange,
    handleSubmit,
    handleSubmitGroup,
    fetchGroupDetails,
    // Batch submission overlay
    submissionStatus,
    submissionErrors,
    isBatchSubmitting,
    batchComplete,
    validationErrors,
    retryFailed,
    closeBatchOverlay,
    // Delete question (edit mode)
    handleDeleteQuestion,
    deleting,
    existingQuestions
  } = useExamForm();

  return (
    <StaffDashboardLayout pagetitle="Exam Question">
      {/* Toast Notification */}
      {messageToast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[250] px-8 py-4 rounded-2xl shadow-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-10 transition-all ${
          messageToast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {messageToast.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
          {messageToast.message}
        </div>
      )}

      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        
        {/* Back Navigation */}
        <button 
          onClick={() => navigate("/staffs/manage-exams")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#0F2843] dark:hover:text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8 transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Page Header Card */}
        <div className="bg-[#0F2843] rounded-[40px] p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-[32px] flex items-center justify-center backdrop-blur-md">
                <IdentificationIcon className="w-8 h-8 md:w-10 md:h-10 text-[#BB9E7F]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase">{isEditMode ? "Edit Question" : "New Question"}</h1>
                <p className="text-[#BB9E7F] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mt-2">{isEditMode ? "Update Existing Question" : "Forge Questions & Groups"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-3xl backdrop-blur-sm border border-white/10">
              <div className={`w-3 h-3 rounded-full ${isEditMode ? 'bg-amber-400' : 'bg-green-400'} animate-pulse`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{isEditMode ? 'Edit Mode' : 'Create Mode'}</span>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#BB9E7F]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        </div>

        {/* Unified Form Container */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white dark:bg-gray-800 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-gray-700 overflow-hidden relative"
        >
          {/* 1. Primary Config - Blurred during group creation */}
          <div className={`p-8 md:p-12 space-y-16 transition-all duration-500 ${isGroupCreationMode ? "blur-[8px] pointer-events-none opacity-30 select-none scale-[0.98]" : ""}`}>
            <div className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Exam Body Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Exam Body</label>
                  <button 
                    type="button" 
                    onClick={() => setIsExamBodyModalOpen(true)}
                    className="text-[10px] font-black text-[#BB9E7F] hover:text-[#0F2843] flex items-center gap-1 transition-colors uppercase"
                  >
                    <PlusIcon className="w-3 h-3" /> New Body
                  </button>
                </div>
                <div className="relative group">
                  <select 
                    value={examBodyId}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-inner"
                  >
                    <option value="">Select Exam Body</option>
                    {examBodies.map(body => (
                      <option key={body.id} value={body.id}>{body.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Selection */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Subject Module</label>
                <div className="relative group">
                  <select 
                    value={subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    required
                    disabled={!courseId}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-inner disabled:opacity-50"
                  >
                    <option value="">{courseId ? "Select Subject" : "Select a course first"}</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exam Year Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Exam Year</label>
                  <button 
                    type="button" 
                    onClick={() => setIsExamYearModalOpen(true)}
                    disabled={!examBodyId || !subjectId}
                    className="text-[10px] font-black text-[#BB9E7F] hover:text-[#0F2843] flex items-center gap-1 transition-colors uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-3 h-3" /> New Year
                  </button>
                </div>
                <div className="relative group">
                  <select 
                    value={examYearId}
                    onChange={(e) => handleYearChange(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-inner"
                  >
                    <option value="">Select Exam Year</option>
                    {filteredYears.map(year => (
                      <option key={year.id} value={year.id}>{year.year} - {year.exam_body?.name || "Exam Body"}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exam Group Category Selection */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Exam Group Category</label>
                <div className="relative group">
                  <select 
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none appearance-none shadow-inner"
                  >
                    <option value="none">None (Single Question)</option>
                    <option value="comprehension">Comprehension</option>
                    <option value="instruction">Instruction</option>
                    <option value="diagram">Diagram</option>
                    <option value="case_study">Case Study</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* 2. Group Assets - Sharp and interactive during creation mode */}
          <ExamGroupSection 
            groupType={groupType}
            isGroupCreationMode={isGroupCreationMode}
            setIsGroupCreationMode={setIsGroupCreationMode}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
            groupTitle={groupTitle}
            setGroupTitle={setGroupTitle}
            groupContent={groupContent}
            setGroupContent={setGroupContent}
            groupImagePreview={groupImagePreview}
            setGroupImagePreview={setGroupImagePreview}
            handleGroupImageChange={handleGroupImageChange}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            groupSearchTerm={groupSearchTerm}
            setGroupSearchTerm={setGroupSearchTerm}
            allGroups={allGroups}
            fetchGroupDetails={fetchGroupDetails}
            handleSubmitGroup={handleSubmitGroup}
          />

          {/* 3. Questions Batch & Footer - Blurred during group creation */}
          <div className={`transition-all duration-500 ${isGroupCreationMode ? "blur-[8px] pointer-events-none opacity-30 select-none scale-[0.98]" : ""}`}>
            
            {/* Existing Questions Count Info Panel (Preceding the Question Batch) */}
            {existingQuestions.length > 0 && (
              <div className="pt-8 border-t border-gray-100 dark:border-gray-700 px-8 md:px-12 mb-8">
                <div className="flex items-center gap-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[24px]">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0F2843] dark:text-white uppercase tracking-tight">
                      {existingQuestions.length} Question{existingQuestions.length > 1 ? 's' : ''} Already Created
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mt-0.5">
                      This exam practice year already contains {existingQuestions.length} saved question{existingQuestions.length > 1 ? 's' : ''}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Questions Batch Section */}
            <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-12 px-8 md:px-12">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-[24px] flex items-center justify-center text-blue-500">
                    <DocumentTextIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Question Batch</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Design your questions for this group</p>
                  </div>
                </div>
                
                {!isEditMode && (
                  <button 
                    type="button"
                    onClick={addQuestion}
                    className="px-6 py-3 bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" /> Add Another Question
                  </button>
                )}
              </div>

              <div className="space-y-0">
                {questions.map((q, qIdx) => (
                  <QuestionItem 
                    key={q.tempId}
                    q={q}
                    qIdx={qIdx}
                    questionsLength={questions.length}
                    isEditMode={isEditMode}
                    toggleExpand={toggleExpand}
                    removeQuestion={removeQuestion}
                    updateQuestionField={updateQuestionField}
                    isDuplicateNumber={isDuplicateNumber}
                    removeFile={removeFile}
                    handleCaptionChange={handleCaptionChange}
                    handleQuestionFilesChange={handleQuestionFilesChange}
                    addOption={addOption}
                    handleOptionChange={handleOptionChange}
                    removeOption={removeOption}
                    isScienceSubject={isScienceSubject}
                    insertSymbol={insertSymbol}
                    validationErrors={validationErrors[q.tempId] || []}
                  />
                ))}
              </div>
            </div>

            {/* Batch Actions Footer */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-12 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => navigate("/staffs/manage-exams")}
                className="w-full md:flex-1 py-6 bg-white dark:bg-gray-700 text-gray-400 font-black rounded-[28px] hover:text-gray-600 transition-all uppercase tracking-[0.2em] text-xs border border-gray-100 dark:border-gray-600 shadow-sm"
              >
                Back to Dashboard
              </button>
              <button 
                type="submit"
                disabled={loading || fetchingData || questions.some((q, i) => isDuplicateNumber(i, q.questionNumber))}
                className="w-full md:flex-[2] py-6 bg-[#0F2843] text-white font-black rounded-[28px] shadow-2xl shadow-[#0F2843]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3"
              >
                {loading ? "Processing Batch..." : (isEditMode ? "Update Changes" : `Create ${questions.length} Question${questions.length > 1 ? 's' : ''}`)}
              </button>
            </div>
          </div>

          {/* Danger Zone - Edit Mode Only */}
          {isEditMode && (
            <div className="p-8 md:p-12 border-t border-red-100 dark:border-red-900/30">
              <div className="bg-red-50 dark:bg-red-900/10 rounded-[32px] p-8 border-2 border-red-100 dark:border-red-900/20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Danger Zone</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1">Permanently delete this question and all its options, attachments, and data.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleDeleteQuestion}
                    disabled={deleting}
                    className="px-8 py-4 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 active:scale-[0.97] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/20 shrink-0"
                  >
                    <TrashIcon className="w-4 h-4" />
                    {deleting ? "Deleting..." : "Delete Question"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Sub-modals */}
      <ExamBodyCreateModal 
        isOpen={isExamBodyModalOpen}
        onClose={() => setIsExamBodyModalOpen(false)}
        onSuccess={(data) => handleCreateSuccess("exam-body", data)}
        initialCourses={courses}
      />

      <ExamYearCreateModal 
        isOpen={isExamYearModalOpen}
        onClose={() => setIsExamYearModalOpen(false)}
        onSuccess={(data) => handleCreateSuccess("exam-year", data)}
        examBodies={examBodies}
        courseId={courseId}
        selectedExamBodyId={examBodyId}
      />

      {/* Batch Submission Overlay */}
      <BatchSubmissionOverlay
        questions={questions}
        submissionStatus={submissionStatus}
        submissionErrors={submissionErrors}
        isBatchSubmitting={isBatchSubmitting}
        batchComplete={batchComplete}
        onClose={closeBatchOverlay}
        onRetryFailed={retryFailed}
      />
    </StaffDashboardLayout>
  );
}
