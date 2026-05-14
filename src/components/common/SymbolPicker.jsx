import React, { useState, useRef, useEffect } from "react";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

const SYMBOL_CATEGORIES = [
  {
    name: "Common",
    symbols: ["°", "π", "√", "∞", "±", "÷", "×", "≈", "≠", "≤", "≥", "±", "→", "⇒", "↔"]
  },
  {
    name: "Greek",
    symbols: ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω", "Δ", "Σ", "Ω"]
  },
  {
    name: "Math",
    symbols: ["∫", "∑", "∏", "∂", "∆", "∇", "∝", "∠", "⊥", "‖", "≡", "⊕", "⊗", "∅", "∈", "∉", "⊆", "⊂", "∪", "∩"]
  },
  {
    name: "Powers",
    symbols: ["¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "⁰", "ⁿ", "ᵃ", "ᵇ", "ˣ", "ʸ", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉", "₀", "ₓ", "ᵧ"]
  },
  {
    name: "Science",
    symbols: ["℃", "℉", "ℏ", "Å", "λ", "μ", "ρ", "φ", "ψ", "ζ", "ν", "τ", "ε", "κ"]
  }
];

export default function SymbolPicker({ onSelect, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(SYMBOL_CATEGORIES[0].name);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSymbolClick = (symbol) => {
    onSelect(symbol);
    // Keep open for multiple symbols? Usually better to close or stay open.
    // Let's stay open for convenience, close with X.
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-[#BB9E7F] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Insert Symbol"
      >
        <SparklesIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-72 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 z-[250] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
            <span className="text-[10px] font-black text-[#0F2843] dark:text-white uppercase tracking-widest">Symbol Palette</span>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-1 p-2 bg-white dark:bg-gray-900 overflow-x-auto no-scrollbar">
            {SYMBOL_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
                  activeCategory === cat.name
                    ? "bg-[#0F2843] text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="p-4 max-h-48 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-6 gap-2">
              {SYMBOL_CATEGORIES.find(c => c.name === activeCategory).symbols.map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSymbolClick(sym)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-[#BB9E7F] hover:text-white rounded-xl text-lg font-bold transition-all active:scale-90"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
          
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest text-center italic">Click symbol to insert at cursor</p>
          </div>
        </div>
      )}
    </div>
  );
}
