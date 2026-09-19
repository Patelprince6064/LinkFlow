import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/v1/auth/me");
      setUser(response.data.data.user);
    } catch {
      setUser(null);
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
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/v1/auth/logout");
    } finally {
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
