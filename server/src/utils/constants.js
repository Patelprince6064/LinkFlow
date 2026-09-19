export const RESERVED_SHORT_CODES = [
  "api",
  "login",
  "register",
  "dashboard",
  "admin",
  "r",
  "bio",
  "auth",
  "health",
  "settings",
  "profile",
  "links",
  "analytics",
];

export const RESERVED_USERNAMES = [
  "admin",
  "api",
  "login",
  "register",
  "dashboard",
  "r",
  "bio",
  "auth",
  "settings",
  "profile",
  "links",
  "analytics",
  "www",
  "mail",
  "support",
];

export const isValidShortCode = (code) => /^[a-zA-Z0-9_-]{3,20}$/.test(code);

export const isValidUsername = (username) => /^[a-zA-Z0-9_-]{3,30}$/.test(username);

export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};
