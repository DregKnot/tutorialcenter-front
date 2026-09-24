import React, { useMemo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import ExamImageLightbox from "./ExamImageLightbox";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://tutorialcenter-back.test" ||
  "http://localhost:8000";

/**
 * MathRenderer parses and renders LaTeX math within plain text strings,
 * while safely preserving inline exam diagram <img> tags with standardized styles.
 * Supports:
 * - Block math: $$ ... $$ or \[ ... \]
 * - Inline math: $ ... $ or \( ... \)
 * - Direct LaTeX expressions (e.g. "\times", "\frac", "\sqrt")
 * - Safe <img> tags with relative or absolute storage links
 */
export default function MathRenderer({ text, className = "" }) {
  const [lightboxImage, setLightboxImage] = useState(null);

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

          // Regular text: extract and preserve safe <img> tags while escaping other HTML
          const imgRegex = /(<img\s+[^>]*src=["'][^"']+["'][^>]*>)/gi;
          const textSubparts = part.split(imgRegex);

          return textSubparts
            .map((subpart) => {
              if (/^<img\s+/i.test(subpart)) {
                // Extract src, alt, and class safely
                const srcMatch = subpart.match(/src=["']([^"']+)["']/i);
                const altMatch = subpart.match(/alt=["']([^"']*)["']/i);
                const isOptionImg = /class=["'][^"']*exam-option-img/i.test(subpart) || className.includes("exam-option");

                const rawSrc = srcMatch ? srcMatch[1] : "";
                const alt = altMatch ? altMatch[1] : "Exam Diagram";

                if (!rawSrc) return "";

                // Resolve relative /storage/ URLs to absolute URLs
                let resolvedSrc = rawSrc;
                if (!resolvedSrc.startsWith("http://") && !resolvedSrc.startsWith("https://") && !resolvedSrc.startsWith("//")) {
                  resolvedSrc = resolvedSrc.startsWith("/")
                    ? `${API_BASE_URL}${resolvedSrc}`
                    : `${API_BASE_URL}/${resolvedSrc}`;
                }

                const imgClass = isOptionImg
                  ? "exam-option-img cursor-zoom-in"
                  : "exam-diagram-img cursor-zoom-in";

                return `<img src="${resolvedSrc}" alt="${alt}" class="${imgClass}" loading="lazy" />`;
              }

              // Sanitize non-image text: escape HTML entities and preserve line breaks
              return subpart
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br/>");
            })
            .join("");
        })
        .join("");
    } catch (err) {
      console.warn("MathRenderer error:", err);
      return text;
    }
  }, [text, className]);

  const handleContainerClick = (e) => {
    if (e.target && e.target.tagName === "IMG") {
      e.stopPropagation();
      setLightboxImage({
        src: e.target.src,
        alt: e.target.alt || "Exam diagram"
      });
    }
  };

  return (
    <>
      <span
        className={`inline-block math-rendered-content ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
        onClick={handleContainerClick}
      />
      {lightboxImage && (
        <ExamImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}

