import axios from "axios";

const REFRESH_TOKEN_KEY = "lh_rt";
const ACCESS_TOKEN_KEY = "lh_at";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let inMemoryRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || null;
let inMemoryAccessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || null;

export const setTokens = (accessToken, refreshToken) => {
  inMemoryAccessToken = accessToken || null;
  inMemoryRefreshToken = refreshToken || null;
  if (accessToken) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const clearTokens = () => {
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

api.interceptors.request.use((config) => {
  if (inMemoryAccessToken) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  return config;
});

const SKIP_REFRESH_URLS = [
  "/v1/auth/login",
  "/v1/auth/register",
  "/v1/auth/refresh",
  "/v1/auth/logout",
  "/v1/auth/me",
];

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ reject }) => {
    reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const shouldSkip = SKIP_REFRESH_URLS.some((endpoint) =>
        originalRequest.url?.includes(endpoint)
      );

      if (shouldSkip) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshPayload = inMemoryRefreshToken
          ? { refreshToken: inMemoryRefreshToken }
          : {};
        const refreshResponse = await api.post(
          "/v1/auth/refresh",
          refreshPayload
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken;
        if (newAccessToken || newRefreshToken) {
          setTokens(newAccessToken, newRefreshToken);
        }

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
