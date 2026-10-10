import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api, { setTokens, hasStoredSession, refreshTokens } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const forceLogout = useCallback(() => {
    clearTokens();
    setUser(null);
    setLoading(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  const fetchUser = useCallback(async () => {
    // No stored tokens and no cookies to try -> skip /me entirely so
    // logged-out visitors don't spam 401s in the console.
    if (!hasStoredSession()) {
      try {
        const response = await api.get("/v1/auth/me");
        setUser(response.data.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
      return;
    }
    try {
      const response = await api.get("/v1/auth/me");
      setUser(response.data.data.user);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          // Shared deduped refresh: concurrent queries awaiting the same
          // rotation all receive the fresh pair instead of racing.
          await refreshTokens();
          const retryResponse = await api.get("/v1/auth/me");
          setUser(retryResponse.data.data.user);
        } catch {
          // Session is dead (rotated secrets, revoked token, expired refresh):
          // drop to login instead of leaving a zombie dashboard behind.
          forceLogout();
          return;
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [forceLogout]);

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

  const resendVerification = async (email) => {
    const response = await api.post("/v1/auth/resend-verification", { email });
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
      forceLogout();
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
    resendVerification,
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
