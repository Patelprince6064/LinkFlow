import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setTokens, clearTokens } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/v1/auth/me");
      setUser(response.data.data.user);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const refreshResponse = await api.post("/v1/auth/refresh");
          const { accessToken, refreshToken } = refreshResponse.data.data || {};
          if (accessToken || refreshToken) {
            setTokens(accessToken, refreshToken);
          }
          const retryResponse = await api.get("/v1/auth/me");
          setUser(retryResponse.data.data.user);
        } catch {
          clearTokens();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const register = async (name, email, password) => {
    const response = await api.post("/v1/auth/register", { name, email, password });
    return response.data;
  };

  const verifyEmail = async (token) => {
    const response = await api.post("/v1/auth/verify-email", { token });
    return response.data;
  };

  const login = async (email, password) => {
    const response = await api.post("/v1/auth/login", { email, password });
    setUser(response.data.data.user);
    const { accessToken, refreshToken } = response.data.data;
    if (accessToken || refreshToken) {
      setTokens(accessToken, refreshToken);
    }
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/v1/auth/logout");
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    const response = await api.post("/v1/auth/forgot-password", { email });
    return response.data;
  };

  const resetPassword = async (token, password) => {
    const response = await api.post("/v1/auth/reset-password", { token, password });
    return response.data;
  };

  const value = {
    user,
    loading,
    register,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
