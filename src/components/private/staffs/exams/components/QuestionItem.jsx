import React from 'react';
import { 
  PlusIcon, 
  CheckCircleIcon,
  TrashIcon,
  ChevronDownIcon,
  PaperClipIcon,
  DocumentTextIcon,
  ListBulletIcon
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import SymbolPicker from "../../../../common/SymbolPicker";

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
  // Helper to strip HTML for summary
  const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ") : "";
  const textSnippet = stripHtml(q.questionText);

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
            <h3 className="text-sm md:text-base font-black text-[#0F2843] dark:text-white uppercase tracking-tight truncate">
              {q.isExpanded ? (isEditMode ? 'Editing Question' : 'Question Configuration') : (textSnippet ? textSnippet.substring(0, 80) + '...' : 'Blank Question')}
            </h3>
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
            <div className="quill-wrapper bg-gray-50 dark:bg-gray-900 rounded-[32px] border-2 border-transparent focus-within:border-blue-500/30 overflow-hidden shadow-inner [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!">
              <ReactQuill 
                theme="snow" 
                value={q.questionText} 
                onChange={(val) => {
                  if (val && (val.includes('$') || val.includes('\\') || val.includes('&') || val.includes('^') || val.includes('_'))) {
                    const transformed = transformSymbols(val);
                    if (transformed !== val) {
                      updateQuestionField(qIdx, "questionText", transformed);
                      return;
                    }
                  }
                  updateQuestionField(qIdx, "questionText", val);
                }} 
                placeholder="Type your question here..." 
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
                {q.questionType === "multiple_choice" && (
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
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in duration-300">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center font-black text-[#0F2843] dark:text-white shrink-0">
                      {opt.label}
                    </div>
                    <div className="flex-1 relative group/input w-full">
                      <input 
                        id={`option-input-${qIdx}-${optIdx}`}
                        type="text"
                        value={opt.option_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && (val.includes('$') || val.includes('\\') || val.includes('&') || val.includes('^') || val.includes('_'))) {
                            const transformed = transformTextContent(val);
                            if (transformed !== val) {
                              handleOptionChange(qIdx, optIdx, "option_text", transformed);
                              return;
                            }
                          }
                          handleOptionChange(qIdx, optIdx, "option_text", val);
                        }}
                        placeholder={`Option ${opt.label} text...`}
                        className="w-full px-6 py-4 pr-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/30 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none shadow-inner"
                      />
                      {isScienceSubject() && (
                        <SymbolPicker 
                          onSelect={(sym) => insertSymbol(qIdx, optIdx, sym)} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-100 transition-opacity" 
                        />
                      )}
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
                      {q.questionType === "multiple_choice" && q.options.length > 2 && (
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
                ))}
              </div>
            </div>
          )}

          {/* Explanation Section */}
          <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Explanation / Answer Key</label>
            <div className="quill-wrapper bg-gray-50 dark:bg-gray-900 rounded-[32px] border-2 border-transparent focus-within:border-blue-500/30 overflow-hidden shadow-inner [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-[#0F2843]! dark:[&_.ql-editor]:text-white!">
              <ReactQuill 
                theme="snow" 
                value={q.explanation} 
                onChange={(val) => {
                  if (val && (val.includes('$') || val.includes('\\') || val.includes('&') || val.includes('^') || val.includes('_'))) {
                    const transformed = transformSymbols(val);
                    if (transformed !== val) {
                      updateQuestionField(qIdx, "explanation", transformed);
                      return;
                    }
                  }
                  updateQuestionField(qIdx, "explanation", val);
                }} 
                placeholder="Explain why the answer is correct..." 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
