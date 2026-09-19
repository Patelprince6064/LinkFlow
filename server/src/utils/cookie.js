import env from "../config/env.js";

const isProduction = env.NODE_ENV === "production";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
};

export const accessTokenOptions = {
  ...baseCookieOptions,
  maxAge: 15 * 60 * 1000,
};

export const refreshTokenOptions = {
  ...baseCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setAccessCookie = (res, token) => {
  res.cookie(ACCESS_COOKIE, token, accessTokenOptions);
};

export const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE, token, refreshTokenOptions);
};

export const clearAccessCookie = (res) => {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
};

export const clearAuthCookies = (res) => {
  clearAccessCookie(res);
  clearRefreshCookie(res);
};
