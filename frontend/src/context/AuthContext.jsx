import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setAccessToken } from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistSession = ({ user, accessToken, refreshToken }) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    setAccessToken(accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    persistSession(data);
    return data.user;
  };

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", { refreshToken: localStorage.getItem("refreshToken") });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch {
      // token invalid - handled by interceptor
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) await refreshMe();
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
