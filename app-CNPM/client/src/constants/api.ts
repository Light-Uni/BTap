export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API_BASE_URL = `${API_URL}/api`;

export const resolveAssetUrl = (path?: string | null) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
