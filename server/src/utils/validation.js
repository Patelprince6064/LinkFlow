import AppError from "./AppError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;
const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length <= 254 && EMAIL_REGEX.test(trimmed);
};

export const validatePassword = (password, minLength = 8) => {
  if (!password || typeof password !== "string") return false;
  return password.length >= minLength && password.length <= 128;
};

export const validateName = (name) => {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 80;
};

export const validateSlug = (slug) => {
  if (!slug || typeof slug !== "string") return false;
  return slug.length >= 3 && slug.length <= 20 && SLUG_REGEX.test(slug);
};

export const validateMongoId = (id) => {
  if (!id || typeof id !== "string") return false;
  return MONGO_ID_REGEX.test(id);
};

export const validateSafeUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const sanitizeSearchInput = (input) => {
  if (!input || typeof input !== "string") return null;
  const cleaned = input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").trim();
  return cleaned.length > 0 && cleaned.length <= 100 ? cleaned : null;
};

export const validatePageParams = ({ page, limit }) => {
  const numPage = Math.max(parseInt(page, 10) || 1, 1);
  const numLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  return { page: numPage, limit: numLimit };
};

export const validateTheme = (theme) => {
  const validThemes = ["Minimal Light", "Dark Slate", "Gradient"];
  return validThemes.includes(theme);
};

export const validateSocialLinks = (socialLinks) => {
  if (!Array.isArray(socialLinks)) return [];
  if (socialLinks.length > 10) {
    throw new AppError("Cannot have more than 10 social links", 400);
  }
  for (const link of socialLinks) {
    if (!link.platform || typeof link.platform !== "string") {
      throw new AppError("Each social link requires a platform", 400);
    }
    if (!link.url || !validateSafeUrl(link.url)) {
      throw new AppError("Each social link requires a valid HTTP/HTTPS URL", 400);
    }
  }
  return socialLinks.map((link, i) => ({
    platform: link.platform.trim().slice(0, 50),
    label: link.label?.trim()?.slice(0, 50) || null,
    url: link.url.trim().slice(0, 500),
    order: typeof link.order === "number" ? link.order : i,
  }));
};

export const validateUsername = (username) => {
  if (!username || typeof username !== "string") return null;
  const trimmed = username.trim().toLowerCase();
  if (trimmed.length < 3 || trimmed.length > 30) return null;
  if (!SLUG_REGEX.test(trimmed)) return null;
  return trimmed;
};
