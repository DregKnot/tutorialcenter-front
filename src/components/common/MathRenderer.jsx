import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * MathRenderer parses and renders LaTeX math within plain text strings.
 * Supports:
 * - Block math: $$ ... $$ or \[ ... \]
 * - Inline math: $ ... $ or \( ... \)
 * - Direct LaTeX expressions (e.g. "\times", "\frac", "\sqrt")
 */
export default function MathRenderer({ text, className = "" }) {
  const renderedHtml = useMemo(() => {
    if (!text || typeof text !== "string") return "";

    try {
      // Regex to find math delimiters:
      // Group 1 ($$ / \[): Block math
      // Group 2 ($ / \(): Inline math
      const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?!\$)[\s\S]*?\$|\\\([\s\S]*?\\\))/g;

      // If text doesn't contain standard delimiters but contains explicit LaTeX commands, wrap it
      let processedText = text;
      const hasDelimiters = /(\$\$|\\\[|\$|\\\()/.test(processedText);
      const hasLatexCommands = /(\\(times|frac|sqrt|text|pm|alpha|beta|theta|pi|int|sum|vec|cdot|degree|circ|le|ge|neq|approx|rightarrow|infty|left|right))\b/.test(processedText);

      if (!hasDelimiters && hasLatexCommands) {
        processedText = `\\(${processedText}\\)`;
      }

      // Split text into regular tokens and math tokens
      const parts = processedText.split(mathRegex);

      return parts
        .map((part) => {
          if (!part) return "";

          // Block Math: $$ ... $$ or \[ ... \]
          if (
            (part.startsWith("$$") && part.endsWith("$$")) ||
            (part.startsWith("\\[") && part.endsWith("\\]"))
          ) {
            const math = part.startsWith("$$") ? part.slice(2, -2) : part.slice(2, -2);
            return katex.renderToString(math.trim(), {
              displayMode: true,
              throwOnError: false,
              output: "htmlAndMathml"
            });
          }

          // Inline Math: $ ... $ or \( ... \)
          if (
            (part.startsWith("$") && part.endsWith("$")) ||
            (part.startsWith("\\(") && part.endsWith("\\)"))
          ) {
            const math = part.startsWith("$") ? part.slice(1, -1) : part.slice(2, -2);
            return katex.renderToString(math.trim(), {
              displayMode: false,
              throwOnError: false,
              output: "htmlAndMathml"
            });
          }

          // Regular text: sanitize HTML entities and preserve line breaks
          return part
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br/>");
        })
        .join("");
    } catch (err) {
      console.warn("MathRenderer error:", err);
      return text;
    }
  }, [text]);

  return (
    <span
      className={`inline-block math-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
