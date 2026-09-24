import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://tutorialcenter-back.test" ||
  "http://localhost:8000";

/**
 * Uploads an image file to the backend link storage disk.
 * Returns the short link URL and storage path.
 * Never stores raw base64.
 */
export async function uploadExamImage(file) {
  if (!file) throw new Error("No file provided.");

  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file (PNG, JPG, WebP, SVG, GIF).");
  }

  // 5MB limit
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("Image size exceeds 5MB limit. Please choose a smaller image.");
  }

  const token = localStorage.getItem("staff_token") || localStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(
    `${API_BASE_URL}/api/admin/past-questions/upload-image`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data; // { success: true, url, relative_url, path }
}

/**
 * Strips raw base64 data URIs while preserving clean storage links and valid HTML images.
 */
export function sanitizeExamHtml(html) {
  if (!html) return html;
  let cleaned = html;

  // Strip any data:image/...;base64,... strings
  if (/data:image\//i.test(cleaned)) {
    cleaned = cleaned.replace(
      /data:image\/[a-zA-Z0-9+/]+;base64,[^"'\s>]+/gi,
      ""
    );
    // Remove empty img tags that may have held stripped base64
    cleaned = cleaned.replace(/<img[^>]*src=["']\s*["'][^>]*>/gi, "");
  }

  return cleaned;
}

/**
 * Extracts plain text and the first attached image URL from an option_text string.
 */
export function extractOptionTextAndImage(optionText) {
  if (!optionText || typeof optionText !== "string") {
    return { text: "", imageUrl: null };
  }

  const imgMatch = optionText.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch) {
    const imageUrl = imgMatch[1];
    // Strip img tag from text representation
    const text = optionText.replace(/<img[^>]*>/gi, "").trim();
    return { text, imageUrl };
  }

  return { text: optionText, imageUrl: null };
}

/**
 * Combines plain text and an optional image URL into a clean option_text string.
 */
export function combineOptionTextAndImage(text, imageUrl, label = "") {
  const cleanText = (text || "").trim();
  if (!imageUrl) return cleanText;

  const imgTag = `<img src="${imageUrl}" alt="Option ${label || ''}" class="exam-option-img" />`;
  return cleanText ? `${cleanText} ${imgTag}` : imgTag;
}
