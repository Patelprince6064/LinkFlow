import env from "../config/env.js";

export const buildShortUrl = (shortCode) => {
  const base = env.PUBLIC_BASE_URL || "http://localhost:5000";
  return `${base.replace(/\/$/, "")}/r/${shortCode}`;
};
