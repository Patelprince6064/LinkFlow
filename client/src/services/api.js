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

export const hasStoredSession = () => {
  if (inMemoryAccessToken || inMemoryRefreshToken) return true;
  try {
    return !!(localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY));
  } catch {
    return false;
  }
};

// Storage-first read: another tab may have rotated tokens after this tab
// loaded its in-memory copy, so always prefer the freshest persisted value.
const readStoredRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || inMemoryRefreshToken;
  } catch {
    return inMemoryRefreshToken;
  }
};

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

let refreshPromise = null;

/**
 * Single shared refresh for the whole tab. Concurrent 401s (boot-time /me +
 * React Query fetches, StrictMode double-effects) previously each fired their
 * own POST /refresh with the same token — the losers hit the server AFTER
 * rotation and got flagged as token reuse, permanently killing the session.
 * Now every concurrent caller awaits the same in-flight request.
 */
export const refreshTokens = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const attempted = readStoredRefreshToken();
      try {
        const res = await api.post("/v1/auth/refresh", attempted ? { refreshToken: attempted } : {});
        const { accessToken, refreshToken } = res.data?.data || {};
        if (accessToken || refreshToken) {
          setTokens(accessToken, refreshToken);
        }
        return res;
      } catch (err) {
        if (err.response?.status === 401) {
          // Another tab may have won a cross-tab rotation race after we read
          // our token: retry once with whatever is freshest in storage now.
          const latest = readStoredRefreshToken();
          if (latest && latest !== attempted) {
            const retry = await api.post("/v1/auth/refresh", { refreshToken: latest });
            const { accessToken, refreshToken } = retry.data?.data || {};
            if (accessToken || refreshToken) {
              setTokens(accessToken, refreshToken);
            }
            return retry;
          }
        }
        throw err;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
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

      originalRequest._retry = true;

      try {
        await refreshTokens();
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
