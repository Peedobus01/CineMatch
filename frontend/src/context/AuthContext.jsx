import { createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = "cinematch_token";
const STORAGE_USER_KEY = "cinematch_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On first load, if a token exists, verify it's still valid by fetching /me.
  // This catches the case where the token expired while the tab was closed.
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => {
        // interceptor in api.js already clears storage + redirects on 401
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const register = useCallback(async (payload) => {
    setError(null);
    try {
      const data = await authService.register(payload);
      persistSession(data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const login = useCallback(async (payload) => {
    setError(null);
    try {
      const data = await authService.login(payload);
      persistSession(data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, register, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
