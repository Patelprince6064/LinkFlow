import Link from "../models/Link.js";
import AppError from "../utils/AppError.js";
import { comparePassword } from "../utils/token.js";
import { cacheGet, cacheSet } from "../utils/cache.js";

export const resolveShortLink = async (shortCode, passwordAttempt) => {
  if (!shortCode) {
    throw new AppError("Short code is required", 400);
  }

  const cacheKey = `redirect:${shortCode}`;
  let link = await cacheGet(cacheKey);
  if (!link) {
    link = await Link.findOne({ shortCode }).lean();
    if (link) {
      await cacheSet(cacheKey, link, 60);
    }
  }

  if (!link) {
    throw new AppError("Short link not found", 404);
  }

  if (!link.isActive) {
    throw new AppError("This short link has been disabled", 404);
  }

  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    throw new AppError("This short link has expired", 410);
  }

  if (link.passwordHash) {
    if (!passwordAttempt) {
      throw new AppError("This link is password protected", 401);
    }
    const ok = await comparePassword(passwordAttempt, link.passwordHash);
    if (!ok) {
      throw new AppError("Incorrect password", 401);
    }
  }

  return { linkId: link._id, destinationUrl: link.destinationUrl };
};
