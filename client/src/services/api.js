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

let inMemoryRefreshToken = null;
let inMemoryAccessToken = null;
try {
  // localStorage (not sessionStorage): survives new tabs + browser restarts,
  // which matters because cross-origin (Vercel -> Render) third-party cookies
  // are often blocked, so the Bearer fallback is the real session carrier.
  inMemoryRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || null;
  inMemoryAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || null;
} catch {
  /* private-mode storage may throw; fall back to memory only */
}

export const hasStoredSession = () => !!(inMemoryAccessToken || inMemoryRefreshToken);

export const setTokens = (accessToken, refreshToken) => {
  inMemoryAccessToken = accessToken || null;
  inMemoryRefreshToken = refreshToken || null;
  try {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
};

export const clearTokens = () => {
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
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
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      resolve(api(config));
    }
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
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
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
