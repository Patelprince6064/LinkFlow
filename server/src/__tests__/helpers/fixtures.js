import jwt from "jsonwebtoken";
import env from "../../config/testEnv.js";

export const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

export const testUser2 = {
  name: "Second User",
  email: "second@example.com",
  password: "password456",
};

export const testLink = {
  destinationUrl: "https://example.com",
  customSlug: null,
};

export const testLinkWithSlug = {
  destinationUrl: "https://example.com/page",
  customSlug: "my-custom",
};

export const testBio = {
  username: "testuser",
  displayName: "Test User",
  bio: "This is a test bio",
  theme: "Minimal Light",
  socialLinks: [
    { platform: "GitHub", url: "https://github.com/testuser", order: 0 },
    { platform: "LinkedIn", url: "https://linkedin.com/in/testuser", order: 1 },
  ],
};

export const testBio2 = {
  username: "testuser2",
  displayName: "Test User 2",
  bio: "Second test bio",
  theme: "Dark Slate",
  socialLinks: [],
};

export const generateAccessToken = (userId, role = "user") => {
  return jwt.sign({ sub: userId, role, type: "access" }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId, jti = "test-jti") => {
  return jwt.sign({ sub: userId, type: "refresh", jti }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const generateExpiredToken = (userId, role = "user") => {
  return jwt.sign({ sub: userId, role, type: "access" }, env.JWT_ACCESS_SECRET, { expiresIn: "0s" });
};

export const generateWrongTypeToken = (userId) => {
  return jwt.sign({ sub: userId, type: "access" }, env.JWT_REFRESH_SECRET, { expiresIn: "15m" });
};

export const MOBILE_USER_AGENTS = {
  iPhone: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
};

export const DESKTOP_USER_AGENTS = {
  chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  firefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
};

export const TABLET_USER_AGENTS = {
  iPad: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  androidTablet: "Mozilla/5.0 (Linux; Android 14; SM-X900) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};
