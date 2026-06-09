// components/private/Students/StudentsExamFlow/CalculatorRightbar.jsx

import React, { useState } from "react";
// import { Icon } from "@iconify/react";

export default function CalculatorRightbar() {
  const [displayValue, setDisplayValue] = useState("");
  const [history, setHistory] = useState([]);
  const [lastAnswer, setLastAnswer] = useState(0);

  const handleKeyPress = (key) => {
    if (key === "AC") {
      setDisplayValue("");
    } else if (key === "DEL") {
      setDisplayValue((prev) => prev.slice(0, -1));
    } else if (key === "EXP") {
      setDisplayValue((prev) => prev + "e");
    } else if (key === "Ans") {
      setDisplayValue((prev) => prev + String(lastAnswer));
    } else if (key === "=") {
      if (!displayValue.trim()) return;
      try {
        // Safe evaluation of standard expressions (replace 'X' with '*' and evaluate)
        const sanitizedExpression = displayValue.replace(/X/g, "*");
        // eslint-disable-next-line no-eval
        const result = eval(sanitizedExpression);
        const formattedResult = Number(Number(result).toFixed(6)); // Limit precision decimals
        setHistory((prev) => [...prev, `${displayValue} = ${formattedResult}`]);
        setDisplayValue(String(formattedResult));
        setLastAnswer(formattedResult);
      } catch (err) {
        setDisplayValue("Error");
      }
    } else {
      if (displayValue === "Error") {
        setDisplayValue(key);
      } else {
        setDisplayValue((prev) => prev + key);
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const rows = [
    ["7", "8", "9", "DEL", "AC"],
    ["4", "5", "6", "X", "/"],
    ["1", "2", "3", "+", "-"],
    ["0", ".", "EXP", "Ans", "="]
  ];

  return (
    <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-[32px] border border-gray-100 dark:border-[#09314F] p-5 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <span className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-tight">
          Calculator
        </span>
        <span className="text-xs font-black text-[#09314F]/60 dark:text-white/60 tracking-wider">
          BODMAS
        </span>
      </div>

      {/* Calculation History Area */}
      <div className="flex-1 min-h-[160px] max-h-[200px] overflow-y-auto bg-gray-50 dark:bg-[#06243A] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
        <div className="space-y-1 overflow-y-auto max-h-[130px] pr-1">
          {history.length === 0 ? (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-8">
              No History
            </p>
          ) : (
            history.map((h, i) => (
              <p key={i} className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 text-right">
                {h}
              </p>
            ))
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-[9px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest text-right mt-2 hover:underline"
          >
            Clear history
          </button>
        )}
      </div>

      {/* Active Expression Input Display */}
      <div className="bg-gray-50 dark:bg-[#06243A] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-right min-h-[56px] flex items-center justify-end">
        <span className="text-lg font-mono font-bold text-[#09314F] dark:text-white">
          {displayValue || "0"}
        </span>
      </div>

      {/* Keys Grid */}
      <div className="grid gap-2">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-5 gap-2">
            {row.map((key) => {
              const isOperator = ["DEL", "AC", "X", "/", "+", "-", "EXP", "Ans", "="].includes(key);
              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`h-11 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center ${
                    key === "="
                      ? "bg-[#C5A97A] text-white hover:opacity-95 shadow-md"
                      : isOperator
                      ? "bg-gray-100 dark:bg-[#06243A]/80 text-[#09314F] dark:text-[#C5A97A] hover:bg-gray-200"
                      : "bg-gray-50 dark:bg-[#06243A] text-gray-700 dark:text-white hover:bg-gray-100"
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
