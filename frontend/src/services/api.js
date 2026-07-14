import axios from "axios";

// In dev, Vite's proxy (see vite.config.js) forwards "/api" to the backend,
// so no base URL is needed locally. In production, set VITE_API_URL to the
// deployed backend's URL (e.g. https://cinematch-api.up.railway.app/api).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cinematch_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, TMDB proxy calls will still work (they're
// public), but any private route will 401 — bounce the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cinematch_token");
      localStorage.removeItem("cinematch_user");
      // Avoid a redirect loop if we're already on the login page
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
