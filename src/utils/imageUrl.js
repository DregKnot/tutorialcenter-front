/**
 * Resolves full URL for backend-hosted storage assets (e.g. blog featured images).
 * If the URL is already an absolute URL (http/https/data:), it returns it as-is.
 * Otherwise, it prepends the backend API base URL.
 */
export const getBlogImageUrl = (imagePath, fallback = "") => {
  if (!imagePath) return fallback;
  
  // If already absolute or base64 blob
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  const apiBase = (process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test").replace(/\/$/, "");
  const formattedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${apiBase}${formattedPath}`;
};
