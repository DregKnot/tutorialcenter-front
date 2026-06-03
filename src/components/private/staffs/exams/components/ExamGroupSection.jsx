import React from 'react';
import { 
  PlusIcon, 
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  CameraIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function ExamGroupSection({
  groupType,
  isGroupCreationMode,
  setIsGroupCreationMode,
  selectedGroupId,
  setSelectedGroupId,
  groupTitle,
  setGroupTitle,
  groupContent,
  setGroupContent,
  groupImagePreview,
  setGroupImagePreview,
  handleGroupImageChange,
  sortOrder,
  setSortOrder,
  groupSearchTerm,
  setGroupSearchTerm,
  allGroups,
  fetchGroupDetails,
  handleSubmitGroup
}) {
  if (groupType === "none") return null;

  return (
    <div className={`px-8 md:px-12 py-16 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-8 duration-500 relative ${isGroupCreationMode ? "z-[110] bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl scale-[1.02]" : ""}`}>
      
      <div className="flex items-center gap-6 mb-12">
        <div className="w-14 h-14 bg-[#BB9E7F]/10 rounded-[24px] flex items-center justify-center">
          <RectangleGroupIcon className="w-7 h-7 text-[#BB9E7F]" />
        </div>
        <div>
          <h3 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Group Assets</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Configure shared context for this question module</p>
        </div>
      </div>

      {/* Group Asset Management Overlay (Blur effect) */}
      {isGroupCreationMode && (
        <div 
          className="fixed inset-0 z-[100] backdrop-blur-[2px] bg-white/10 dark:bg-black/10 transition-all duration-300"
          onClick={() => setIsGroupCreationMode(false)}
        />
      )}

      <div className={`space-y-12 transition-all duration-300 ${isGroupCreationMode ? "relative z-[110]" : ""}`}>
        {/* Selected Group Info Card - Shows when a group is selected */}
        {selectedGroupId && !isGroupCreationMode && (
          <div className="bg-gradient-to-r from-[#BB9E7F]/5 to-[#76D287]/5 border-2 border-[#BB9E7F]/20 rounded-[28px] p-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Currently Editing</p>
                <p className="text-lg font-black text-[#0F2843] dark:text-white mb-3">{groupTitle}</p>
                <div className="space-y-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  {groupContent && (
                    <p>
                      <span className="text-[#BB9E7F]">Content:</span> {groupContent.replace(/<[^>]*>/g, '').substring(0, 60)}...
                    </p>
                  )}
                  <p>
                    <span className="text-[#BB9E7F]">Sort Order:</span> {sortOrder}
                  </p>
                  {groupImagePreview && (
                    <p>
                      <span className="text-[#BB9E7F]">Visual Aid:</span> Loaded
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedGroupId("");
                  setGroupSearchTerm("");
                  setGroupTitle("");
                  setGroupContent("");
                  setGroupImagePreview(null);
                }}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Group Title Selection/Creation */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Group Title</label>
              <button 
                type="button"
                onClick={() => {
                  setIsGroupCreationMode(true);
                  setSelectedGroupId("");
                  setGroupTitle("");
                  setGroupContent("");
                  setGroupImagePreview(null);
                  setSortOrder(1);
                }}
                className="text-[10px] font-black text-[#BB9E7F] hover:text-[#0F2843] flex items-center gap-1 transition-colors uppercase"
              >
                <PlusIcon className="w-3 h-3" /> Create New Title
              </button>
            </div>

            {!isGroupCreationMode ? (
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="Search existing groups..."
                  value={groupSearchTerm}
                  onChange={(e) => {
                    setGroupSearchTerm(e.target.value);
                    if (selectedGroupId) {
                      setSelectedGroupId("");
                      setGroupTitle("");
                      setGroupContent("");
                      setGroupImagePreview(null);
                    }
                  }}
                  className={`w-full pl-16 pr-14 py-5 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner transition-all ${
                    selectedGroupId 
                      ? "bg-[#76D287]/10 border-2 border-[#76D287]/40 dark:bg-[#76D287]/20" 
                      : "bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30"
                  }`}
                />

                {/* Inline Clear Button when a group is selected */}
                {selectedGroupId && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedGroupId("");
                      setGroupSearchTerm("");
                      setGroupTitle("");
                      setGroupContent("");
                      setGroupImagePreview(null);
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
                
                {/* Group Search Results Dropdown */}
                {!selectedGroupId && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[24px] shadow-2xl z-[120] max-h-[300px] overflow-y-auto custom-scrollbar opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible hover:opacity-100 hover:visible transition-all">
                    {allGroups.filter(g => g.title?.toLowerCase().includes(groupSearchTerm.toLowerCase())).length > 0 ? (
                      allGroups.filter(g => g.title?.toLowerCase().includes(groupSearchTerm.toLowerCase())).map(group => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => {
                            setSelectedGroupId(group.id);
                            setGroupSearchTerm(group.title);
                            setGroupTitle(group.title || "");
                            setGroupContent(group.content || "");
                            setSortOrder(group.sort_order || 1);
                            if (group.image) {
                              const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
                              setGroupImagePreview(group.image.startsWith('http') ? group.image : `${API_BASE_URL}/storage/${group.image}`);
                            } else {
                              setGroupImagePreview(null);
                            }
                            fetchGroupDetails(group.id);
                          }}
                          className="w-full px-8 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group/item"
                        >
                          <div>
                            <p className="font-black text-[#0F2843] dark:text-white text-sm">{group.title}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{group.type || "General"}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#BB9E7F]/10 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <ChevronDownIcon className="w-4 h-4 text-[#BB9E7F] -rotate-90" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-400 text-sm font-bold">No groups found</p>
                      </div>
                    )}
                  </div>
                )}
                

              </div>
            ) : (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="relative group">
                  <input 
                    type="text"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    placeholder="Enter new group title..."
                    autoFocus
                    className="w-full px-8 py-5 bg-white dark:bg-gray-800 border-2 border-[#BB9E7F] rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none shadow-xl animate-pulse focus:animate-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setIsGroupCreationMode(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#0F2843] dark:hover:text-white"
                  >
                    <XMarkIcon className="w-5 h-5 text-red-400 hover:text-red-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sort Order - Now visible both in creation and edit mode */}
          {(isGroupCreationMode || selectedGroupId) && (
            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Sort Order</label>
              <input 
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#BB9E7F]/30 rounded-[28px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Group Content (WYSIWYG) - Only show when group is selected or creating */}
        {(isGroupCreationMode || selectedGroupId) && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Content / Narrative</label>
            <div className="quill-wrapper bg-gray-50 dark:bg-gray-900 rounded-[32px] border-2 border-transparent focus-within:border-[#BB9E7F]/30 overflow-hidden shadow-inner [&_.ql-editor]:min-h-[250px] [&_.ql-toolbar]:bg-white dark:[&_.ql-toolbar]:bg-gray-800">
              <ReactQuill
                theme="snow"
                value={groupContent || ""}
                onChange={setGroupContent}
                placeholder="Enter the comprehension text, instructions, or scenario details here..."
                className="[&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["blockquote", "link"],
                    ["clean"],
                  ],
                }}
              />
            </div>
          </div>
        )}

        {/* Group Image Upload - Only show when group is selected or creating */}
        {(isGroupCreationMode || selectedGroupId) && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Group Visual Aid (Optional)</label>
            <div className={`relative group border-2 border-dashed rounded-[40px] overflow-hidden bg-gray-50 dark:bg-gray-900/50 transition-all ${
              groupImagePreview ? "border-[#76D287]/30" : "border-gray-200 dark:border-gray-700 hover:border-[#BB9E7F]/40"
            }`}>
              {groupImagePreview ? (
                <div className="relative aspect-video">
                  <img src={groupImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <CameraIcon className="w-12 h-12 text-white" />
                  </div>
                </div>
              ) : (
                <div className="p-16 flex flex-col items-center justify-center text-center gap-6 cursor-pointer">
                  <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[32px] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpenIcon className="w-12 h-12 text-[#BB9E7F]" />
                  </div>
                  <div>
                    <p className="text-[#0F2843] dark:text-white font-black text-xl">Upload Visual Assets</p>
                    <p className="text-gray-400 text-sm font-bold mt-2">Diagrams, maps, or illustrations for this group</p>
                  </div>
                </div>
              )}
              <input type="file" onChange={handleGroupImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        )}

        {/* Form Submit Button - Appears at the end */}
        {(isGroupCreationMode || selectedGroupId) && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-8 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-300">
            <button
              type="button"
              onClick={handleSubmitGroup}
              className="w-full sm:w-auto px-8 py-5 bg-[#BB9E7F] hover:bg-[#a88d65] text-[#0F2843] font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5 text-[#0F2843]" />
              {isGroupCreationMode ? "Create Group" : "Update Group"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsGroupCreationMode(false);
                setSelectedGroupId("");
                setGroupSearchTerm("");
                setGroupTitle("");
                setGroupContent("");
                setGroupImagePreview(null);
              }}
              className="w-full sm:w-auto px-8 py-5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-400 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
