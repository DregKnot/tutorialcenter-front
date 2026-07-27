/**
 * Decodes HTML entities (like &#39;, &amp;, &quot;, &nbsp;, etc.) into clean readable characters.
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return str || "";
  try {
    if (typeof window !== "undefined" && window.DOMParser) {
      const doc = new DOMParser().parseFromString(str, "text/html");
      return doc.documentElement.textContent || str;
    }
  } catch (e) {
    // Fallback if DOMParser fails
  }
  return str
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");
}

/**
 * Strips HTML tags while preserving readability by converting block tags (<p>, <br>, <li>, etc.) 
 * to proper spacing/newlines, and decodes HTML entities so text never shows odd characters like #39.
 */
export function stripHtmlAndDecode(str) {
  if (!str || typeof str !== "string") return str || "";
  
  // 1. Replace block-level tags and line breaks with spaces so words aren't squashed together
  let cleaned = str
    .replace(/<\/(p|div|h[1-6]|ul|ol|table|tr|blockquote|li)>/gi, " ")
    .replace(/<(br|br\s*\/|hr\s*\/?)>/gi, " ")
    .replace(/&nbsp;/gi, " ");

  // 2. Strip remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>?/gm, "");

  // 3. Decode HTML entities (like &#39; -> ', &amp; -> &)
  cleaned = decodeHtmlEntities(cleaned);

  // 4. Clean up multiple consecutive whitespace characters and trim
  return cleaned.replace(/\s+/g, " ").trim();
}
