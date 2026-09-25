import React from 'react';
import { 
  PlusIcon, 
  CheckCircleIcon,
  TrashIcon,
  ChevronDownIcon,
  PaperClipIcon,
  DocumentTextIcon,
  ListBulletIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import SymbolPicker from "../../../../common/SymbolPicker";
import {
  uploadExamImage,
  sanitizeExamHtml,
  extractOptionTextAndImage,
  combineOptionTextAndImage,
  extractExplanationTextAndImage,
  combineExplanationTextAndImage
} from "../../../../../utils/examImageUploader";

const superscriptMap = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'a': 'ᵃ', 'b': 'ᵇ',
  'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'o': 'ᵒ',
  'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'z': 'ᶻ',
  'A': 'ᴬ', 'B': 'ᴮ', 'D': 'ᴰ', 'E': 'ᴱ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ', 'K': 'ᴲ', 'L': 'ᴸ', 'M': 'ᴹ',
  'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'R': 'ᴿ', 'T': 'ᵀ', 'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ'
};

const subscriptMap = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'x': 'ₓ', 'y': 'ᵧ', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ',
  'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ',
  't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ'
};

const makeUnicodeFraction = (num, den) => {
  const commonFractions = {
    '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
    '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘', '1/6': '⅙',
    '5/6': '⅚', '1/7': '⅐', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝',
    '7/8': '⅞', '1/9': '⅑', '1/10': '⅒'
  };

  const key = `${num}/${den}`;
  if (commonFractions[key]) {
    return commonFractions[key];
  }

  // Convert to high-fidelity unicode fraction using superscripts and fractional slash
  const convertedNum = num.split('').map(char => superscriptMap[char] || char).join('');
  const convertedDen = den.split('').map(char => subscriptMap[char] || char).join('');
  return `${convertedNum}⁄${convertedDen}`;
};

const transformTextContent = (text) => {
  if (!text) return text;
  let result = text;

  // SKIP transformation if there are 3+ consecutive underscores (fill-in-the-blank pattern)
  if (/_{3,}/.test(result)) {
    return result;
  }

  // 1. Convert LaTeX Fractions \frac{num}{den} and \frac12
  result = result.replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, (match, num, den) => {
    return makeUnicodeFraction(num.trim(), den.trim());
  });
  result = result.replace(/\\frac\s*([a-zA-Z0-9])\s*([a-zA-Z0-9])/g, (match, num, den) => {
    return makeUnicodeFraction(num.trim(), den.trim());
  });

  // 2. Strip LaTeX text unit formatting wraps like \text{ m} or \mathrm{ m}
  result = result.replace(/\\(text|mathrm)\s*\{([^}]+)\}/g, '$2');

  // 2. Common LaTeX/scientific symbols mapping
  const latexMap = {
    '\\^\\\\circ': '°',
    '\\^\\{?\\\\circ\\}?': '°',
    '\\\\circ': '°',
    '\\\\degree': '°',
    '\\\\pi': 'π',
    '\\\\theta': 'θ',
    '\\\\alpha': 'α',
    '\\\\beta': 'β',
    '\\\\gamma': 'γ',
    '\\\\delta': 'δ',
    '\\\\epsilon': 'ε',
    '\\\\lambda': 'λ',
    '\\\\mu': 'μ',
    '\\\\rho': 'ρ',
    '\\\\sigma': 'σ',
    '\\\\tau': 'τ',
    '\\\\omega': 'ω',
    '\\\\Delta': 'Δ',
    '\\\\Omega': 'Ω',
    '\\\\infty': '∞',
    '\\\\pm': '±',
    '\\\\div': '÷',
    '\\\\times': '×',
    '\\\\approx': '≈',
    '\\\\neq': '≠',
    '\\\\leq': '≤',
    '\\\\geq': '≥',
    '\\\\sqrt': '√',
    '\\\\to': '→',
    '\\\\rightarrow': '→',
    '\\\\Leftarrow': '⇐',
    '\\\\Rightarrow': '⇒',
    '\\\\leftrightarrow': '↔'
  };

  // Replace standard LaTeX math commands
  Object.entries(latexMap).forEach(([pattern, unicode]) => {
    const regex = new RegExp(pattern, 'g');
    result = result.replace(regex, unicode);
  });

  // Superscripts replacement: ^2 or ^{2}
  result = result.replace(/\^\{?([0-9+\-()nixyab])\}?/g, (match, p1) => {
    return superscriptMap[p1] || match;
  });

  // Subscripts replacement: _2 or _{2}
  result = result.replace(/_\{?([0-9+\-()xy])\}?/g, (match, p1) => {
    return subscriptMap[p1] || match;
  });

  // Strip LaTeX math wrapper dollars $...$ but preserve contents
  result = result.replace(/\$([^$]+)\$/g, '$1');

  return result;
};

const transformSymbols = (html) => {
  if (!html) return html;
  if (typeof DOMParser === 'undefined') return html;

  // SKIP transformation if there are 3+ consecutive underscores (fill-in-the-blank pattern)
  if (/_{3,}/.test(html)) {
    return html;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const walk = (node) => {
      const TEXT_NODE = 3;
      if (node.nodeType === TEXT_NODE) {
        node.nodeValue = transformTextContent(node.nodeValue);
      } else {
        for (let child = node.firstChild; child; child = child.nextSibling) {
          walk(child);
        }
      }
    };

    walk(doc.body);
    return doc.body.innerHTML;
  } catch (e) {
    console.warn("Symbol parser failed, falling back to raw html", e);
    return html;
  }
};
const stripImagesFromHtml = (html) => {
  return sanitizeExamHtml(html);
};

// Define allowed formats including image for diagrams
const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'indent', 'link', 'image', 'video', 'script'
];

const quillModulesExplanation = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    handlers: {
      image: function() {
        const quill = this.quill;
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/jpeg,image/png,image/jpg,image/webp,image/gif,image/svg+xml');
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            const res = await uploadExamImage(file);
            const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
            quill.insertEmbed(range.index, 'image', res.url);
            quill.setSelection(range.index + 1);
          } catch (err) {
            console.error("Quill image upload error:", err);
            alert(err.response?.data?.message || err.message || "Failed to upload image.");
          }
        };
      }
    }
  }
};

export default function QuestionItem({
  q,
  qIdx,
  questionsLength,
  isEditMode,
  toggleExpand,
  removeQuestion,
  updateQuestionField,
  isDuplicateNumber,
  removeFile,
  handleCaptionChange,
  handleQuestionFilesChange,
  addOption,
  handleOptionChange,
  removeOption,
  isScienceSubject,
  insertSymbol,
  validationErrors = []
}) {
  return (
    <div className="border-t border-gray-100 dark:border-gray-700 first:border-t-0">
      {/* Question Header / Toggle */}
      <div 
        onClick={() => toggleExpand(qIdx)}
        className={`p-6 md:p-10 flex items-center justify-between cursor-pointer transition-all ${validationErrors.length > 0 ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500' : q.isExpanded ? 'bg-gray-50/80 dark:bg-gray-900/40' : 'hover:bg-gray-50 dark:hover:bg-gray-900/20'}`}
      >
        <div className="flex items-center gap-6 flex-1 overflow-hidden">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${q.isExpanded ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-[#0F2843] dark:text-white'}`}>
            {q.questionNumber || qIdx + 1}
          </div>
          <div className="overflow-hidden">
            {q.isExpanded ? (
              <h3 className="text-sm md:text-base font-black text-[#0F2843] dark:text-white uppercase tracking-tight truncate">
                {isEditMode ? 'Editing Question' : 'Question Configuration'}
              </h3>
            ) : (
              <div 
                className="text-sm md:text-base text-[#0F2843] dark:text-white truncate quill-content [&_*]:!inline [&>p]:!inline"
                dangerouslySetInnerHTML={{ __html: q.questionText || '<span class="italic text-gray-400">Blank Question</span>' }}
              />
            )}
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              {q.isSaved ? (
                <span className="text-green-500 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> Successfully Saved</span>
              ) : (
                <span>{q.isExpanded ? 'Filling Details' : 'Draft - Click to Expand'}</span>
              )}
              <span className="opacity-30">•</span>
              <span>{q.questionType.replace('_', ' ')}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-4">
          {questionsLength > 1 && !isEditMode && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); removeQuestion(qIdx); }}
              className="p-3 text-gray-300 hover:text-red-500 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
          <div className={`transform transition-transform duration-300 ${q.isExpanded ? 'rotate-180' : ''}`}>
             <ChevronDownIcon className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Question Form Content */}
      {q.isExpanded && (
        <div className="p-8 md:p-12 space-y-10 animate-in slide-in-from-top-4 duration-300 bg-white dark:bg-gray-800">
          {/* Validation Errors Banner */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500/20 rounded-2xl p-5 space-y-2 animate-in shake-x duration-300">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Fix the following issues:</p>
              {validationErrors.map((err, i) => (
                <p key={i} className="text-red-500 text-xs font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                  {err}
                </p>
              ))}
            </div>
          )}
          {/* Question Header: Number & Type & Marks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Q. Number</label>
              <div className="relative">
                <input 
                  type="text"
                  value={q.questionNumber}
                  onChange={(e) => updateQuestionField(qIdx, "questionNumber", e.target.value)}
                  placeholder="e.g. 01"
                  className={`w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 rounded-[24px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner ${
                    isDuplicateNumber(qIdx, q.questionNumber) ? "border-red-500/50 focus:border-red-500" : "border-transparent focus:border-blue-500/30"
                  }`}
                />
                {isDuplicateNumber(qIdx, q.questionNumber) && (
                  <p className="absolute -bottom-5 left-4 text-[8px] text-red-500 font-black uppercase tracking-widest">Duplicate Number</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Question Type</label>
              <select 
                value={q.questionType}
                onChange={(e) => updateQuestionField(qIdx, "questionType", e.target.value)}
                className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/30 rounded-[24px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner appearance-none"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
                <option value="essay">Essay / Theory</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Marks</label>
              <input 
                type="number"
                value={q.marks}
                onChange={(e) => updateQuestionField(qIdx, "marks", e.target.value)}
                className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/30 rounded-[24px] font-black text-[#0F2843] dark:text-white outline-none shadow-inner"
              />
            </div>
          </div>

          {/* Multi-File Upload Section */}
          <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                <PaperClipIcon className="w-5 h-5 text-blue-500" />
                <label className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Question Attachments</label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {q.files.map((file, fIdx) => (
                <div key={fIdx} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[32px] border-2 border-gray-100 dark:border-gray-700 relative group animate-in zoom-in-95">
                  <button 
                    type="button"
                    onClick={() => removeFile(qIdx, fIdx)}
                    className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 text-red-500 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                      <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-black text-[#0F2843] dark:text-white truncate uppercase tracking-tight">{file.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <input 
                    type="text"
                    value={q.captions[fIdx]}
                    onChange={(e) => handleCaptionChange(qIdx, fIdx, e.target.value)}
                    placeholder="Add a caption for this file..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl text-[11px] font-bold outline-none"
                  />
                </div>
              ))}
              
              <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[32px] hover:border-blue-500/40 transition-all group flex flex-col items-center justify-center p-8 min-h-[160px] cursor-pointer">
                <div className="w-12 h-12 bg-blue-500/5 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <PlusIcon className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attach Diagram / File</p>
                <input type="file" multiple onChange={(e) => handleQuestionFilesChange(qIdx, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Question Text (WYSIWYG) */}
          <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Question Text</label>
            <div 
              className="quill-wrapper bg-gray-50 dark:bg-gray-900 rounded-[32px] border-2 border-transparent focus-within:border-blue-500/30 overflow-hidden shadow-inner [&_.ql-editor]:min-h-[280px] [&_.ql-editor]:text-base [&_.ql-editor]:leading-relaxed [&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!"
              onPaste={async (e) => {
                const clipboardData = e.clipboardData;
                if (!clipboardData || !clipboardData.files || clipboardData.files.length === 0) return;
                const file = Array.from(clipboardData.files).find(f => f.type.startsWith('image/'));
                if (file) {
                  e.preventDefault();
                  try {
                    const res = await uploadExamImage(file);
                    const current = q.questionText || "";
                    updateQuestionField(qIdx, "questionText", `${current}<p><img src="${res.url}" alt="Exam Diagram" /></p>`);
                  } catch (err) {
                    alert(err.message || "Failed to upload pasted image.");
                  }
                }
              }}
            >
              <ReactQuill 
                theme="snow" 
                value={q.questionText} 
                modules={quillModules}
                formats={quillFormats}
                onChange={(val, delta, source) => {
                  if (source !== 'user') return;
                  let sanitized = stripImagesFromHtml(val);
                  if (sanitized && (sanitized.includes('$') || sanitized.includes('\\') || sanitized.includes('&') || sanitized.includes('^') || sanitized.includes('_'))) {
                    const transformed = transformSymbols(sanitized);
                    if (transformed !== sanitized) {
                      updateQuestionField(qIdx, "questionText", transformed);
                      return;
                    }
                  }
                  updateQuestionField(qIdx, "questionText", sanitized);
                }} 
                placeholder="Type your question here (click Image icon in toolbar to add diagrams)..." 
              />
            </div>
          </div>

          {/* Options Section (Only for MCQ/TrueFalse) */}
          {(q.questionType === "multiple_choice" || q.questionType === "true_false") && (
            <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                  <ListBulletIcon className="w-5 h-5 text-blue-500" />
                  <label className="text-[11px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Options & Answers</label>
                </div>
                {(q.questionType === "multiple_choice" || q.questionType === "true_false") && (
                  <button 
                    type="button" 
                    onClick={() => addOption(qIdx)}
                    className="text-[10px] font-black text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors uppercase"
                  >
                    <PlusIcon className="w-3 h-3" /> Add Option
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {q.options.map((opt, optIdx) => {
                  const { text: optionTextOnly, imageUrl: optionImageUrl } = extractOptionTextAndImage(opt.option_text);

                  return (
                    <div key={optIdx} className="flex flex-col gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 animate-in fade-in duration-300">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <input 
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, "label", e.target.value)}
                          className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center font-black text-[#0F2843] dark:text-white shrink-0 text-center outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <div className="flex-1 relative group/input w-full">
                          <input 
                            id={`option-input-${qIdx}-${optIdx}`}
                            type="text"
                            value={optionTextOnly}
                            onChange={(e) => {
                              const val = e.target.value;
                              let nextVal = val;
                              if (val && (val.includes('$') || val.includes('\\') || val.includes('&') || val.includes('^') || val.includes('_'))) {
                                const transformed = transformTextContent(val);
                                if (transformed !== val) {
                                  nextVal = transformed;
                                }
                              }
                              const combined = combineOptionTextAndImage(nextVal, optionImageUrl, opt.label);
                              handleOptionChange(qIdx, optIdx, "option_text", combined);
                            }}
                            placeholder={optionImageUrl ? `Option ${opt.label} text (diagram attached)...` : `Option ${opt.label} text...`}
                            className="w-full px-6 py-4 pr-24 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/30 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none shadow-sm"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            {/* Option Diagram Upload Button */}
                            <label
                              htmlFor={`opt-file-${qIdx}-${optIdx}`}
                              className={`p-2 rounded-xl cursor-pointer transition-all ${
                                optionImageUrl
                                  ? "text-blue-600 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100"
                                  : "text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                              title={optionImageUrl ? "Replace Option Diagram" : "Add Image / Diagram to Option"}
                            >
                              <PhotoIcon className="w-5 h-5" />
                              <input
                                id={`opt-file-${qIdx}-${optIdx}`}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp,image/gif,image/svg+xml"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    const res = await uploadExamImage(file);
                                    const combined = combineOptionTextAndImage(optionTextOnly, res.url, opt.label);
                                    handleOptionChange(qIdx, optIdx, "option_text", combined);
                                  } catch (err) {
                                    alert(err.response?.data?.message || err.message || "Failed to upload option image.");
                                  } finally {
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </label>

                            {isScienceSubject() && (
                              <SymbolPicker 
                                onSelect={(sym) => insertSymbol(qIdx, optIdx, sym)} 
                                className="opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-100 transition-opacity" 
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOptionChange(qIdx, optIdx, "is_correct", !opt.is_correct)}
                            className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                              opt.is_correct 
                                ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-200 dark:shadow-none" 
                                : "bg-gray-100 dark:bg-gray-700 text-gray-400 border-transparent hover:border-gray-200"
                            }`}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            {opt.is_correct ? "Correct" : "Mark Correct"}
                          </button>
                          {(q.questionType === "multiple_choice" || q.questionType === "true_false") && q.options.length > 2 && (
                            <button 
                              type="button" 
                              onClick={() => removeOption(qIdx, optIdx)}
                              className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Option Image Attached Preview Card */}
                      {optionImageUrl && (
                        <div className="ml-0 sm:ml-14 flex items-center gap-3 p-2 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-xl w-fit animate-in fade-in zoom-in-95">
                          <img 
                            src={optionImageUrl} 
                            alt={`Option ${opt.label} diagram`} 
                            className="h-12 max-w-[140px] object-contain rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1"
                          />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              Diagram Attached
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium truncate max-w-[160px]">
                              Option {opt.label} image
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const combined = combineOptionTextAndImage(optionTextOnly, null, opt.label);
                              handleOptionChange(qIdx, optIdx, "option_text", combined);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors ml-2"
                            title="Remove Diagram"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Explanation Section */}
          {(() => {
            const { text: expText, imageUrl: expImageUrl } = extractExplanationTextAndImage(q.explanation || "");

            const handleExplanationImageUpload = async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const res = await uploadExamImage(file);
                const combined = combineExplanationTextAndImage(expText, res.url);
                updateQuestionField(qIdx, "explanation", combined);
              } catch (err) {
                console.error("Explanation upload error:", err);
                alert(err.response?.data?.message || err.message || "Failed to upload explanation image.");
              } finally {
                e.target.value = "";
              }
            };

            const handleRemoveExplanationImage = () => {
              const combined = combineExplanationTextAndImage(expText, null);
              updateQuestionField(qIdx, "explanation", combined);
            };

            const handleExplanationTextChange = (val) => {
              let cleaned = val;
              if (cleaned && (cleaned.includes('$') || cleaned.includes('\\') || cleaned.includes('&') || cleaned.includes('^') || cleaned.includes('_'))) {
                const transformed = transformSymbols(cleaned);
                if (transformed) cleaned = transformed;
              }
              const combined = combineExplanationTextAndImage(cleaned, expImageUrl);
              updateQuestionField(qIdx, "explanation", combined);
            };

            const handleExplanationPaste = async (e) => {
              const clipboardData = e.clipboardData;
              if (!clipboardData || !clipboardData.files || clipboardData.files.length === 0) return;
              const file = Array.from(clipboardData.files).find(f => f.type.startsWith('image/'));
              if (file) {
                e.preventDefault();
                try {
                  const res = await uploadExamImage(file);
                  const combined = combineExplanationTextAndImage(expText, res.url);
                  updateQuestionField(qIdx, "explanation", combined);
                } catch (err) {
                  console.error("Paste upload error:", err);
                  alert(err.message || "Failed to upload pasted image.");
                }
              }
            };

            return (
              <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                    Explanation / Answer Key
                  </label>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#BB9E7F]/10 hover:bg-[#BB9E7F]/20 text-[#BB9E7F] text-xs font-bold cursor-pointer transition-colors border border-[#BB9E7F]/30 shadow-sm">
                    <PhotoIcon className="w-4 h-4" />
                    <span>{expImageUrl ? "Change Diagram" : "Attach Diagram"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={handleExplanationImageUpload}
                    />
                  </label>
                </div>

                {/* Explanation Box Container */}
                <div 
                  className="bg-gray-50 dark:bg-gray-900 rounded-[32px] border-2 border-transparent focus-within:border-blue-500/30 overflow-hidden shadow-inner p-4 space-y-4"
                  onPaste={handleExplanationPaste}
                >
                  {/* TOP: Image preview inside the explanation box */}
                  {expImageUrl && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white dark:bg-gray-800 border border-[#BB9E7F]/40 rounded-2xl animate-in fade-in zoom-in-95">
                      <img 
                        src={expImageUrl} 
                        alt="Explanation diagram" 
                        className="max-h-48 max-w-full sm:max-w-xs object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1"
                      />
                      <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                        <span className="text-[10px] font-black text-[#BB9E7F] uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                          <PhotoIcon className="w-3.5 h-3.5" />
                          Explanation Diagram Attached
                        </span>
                        <span className="text-[11px] text-gray-400">
                          In the exam review, this diagram will display directly below the explanation text.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label 
                          className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-gray-500 hover:text-[#BB9E7F] hover:bg-[#BB9E7F]/10 rounded-xl cursor-pointer transition-colors border border-gray-200 dark:border-gray-700" 
                          title="Replace Diagram"
                        >
                          <PhotoIcon className="w-4 h-4" />
                          <span>Replace</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp,image/gif,image/svg+xml"
                            className="hidden"
                            onChange={handleExplanationImageUpload}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveExplanationImage}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
                          title="Remove Diagram"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BOTTOM: Text Editor inside the explanation box */}
                  <div className="quill-wrapper rounded-2xl overflow-hidden [&_.ql-editor]:min-h-[140px] [&_.ql-editor]:text-base [&_.ql-editor]:leading-relaxed [&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!">
                    <ReactQuill 
                      theme="snow" 
                      value={expText} 
                      modules={quillModulesExplanation}
                      formats={quillFormats}
                      onChange={(val, delta, source) => {
                        if (source !== 'user') return;
                        handleExplanationTextChange(val);
                      }} 
                      placeholder="Explain why the answer is correct (text is displayed above the diagram)..." 
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
