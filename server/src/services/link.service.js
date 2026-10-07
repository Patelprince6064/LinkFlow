import Link from "../models/Link.js";
import AppError from "../utils/AppError.js";
import { generateShortCode, isValidSlug, MAX_RETRIES } from "../utils/shortCode.js";
import { isReservedSlug } from "../utils/reservedSlugs.js";
import { isValidDestinationUrl } from "../utils/urlValidation.js";
import { buildShortUrl } from "../utils/shortUrl.js";
import { sanitizeSearchInput } from "../utils/validation.js";
import { hashPassword } from "../utils/token.js";

const MAX_PAGE_LIMIT = 50;
const LINK_PASSWORD_MIN = 4;
const LINK_PASSWORD_MAX = 64;

export const parseExpiresAt = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError("expiresAt must be a valid date", 400);
  }
  if (date.getTime() <= Date.now()) {
    throw new AppError("Expiry must be in the future", 400);
  }
  return date;
};

export const validateLinkPassword = (password) => {
  if (password === undefined) return undefined;
  if (password === null || password === "") return null;
  if (typeof password !== "string" || password.length < LINK_PASSWORD_MIN || password.length > LINK_PASSWORD_MAX) {
    throw new AppError(`Link password must be ${LINK_PASSWORD_MIN}-${LINK_PASSWORD_MAX} characters`, 400);
  }
  return password;
};

const sanitizeLink = (link) => ({
  id: (link._id || link.id)?.toString(),
  destinationUrl: link.destinationUrl,
  shortCode: link.shortCode,
  shortUrl: buildShortUrl(link.shortCode),
  clickCount: link.clickCount,
  isActive: link.isActive,
  expiresAt: link.expiresAt || null,
  hasPassword: Boolean(link.passwordHash),
  isExpired: link.expiresAt ? new Date(link.expiresAt).getTime() < Date.now() : false,
  createdAt: link.createdAt,
  updatedAt: link.updatedAt,
});

export const createLink = async ({ userId, destinationUrl, customSlug, expiresAt, password }) => {
  if (!destinationUrl) {
    throw new AppError("Destination URL is required", 400);
  }

  if (!isValidDestinationUrl(destinationUrl)) {
    throw new AppError("Destination URL must be a valid HTTP or HTTPS URL", 400);
  }

  let shortCode;

  if (customSlug) {
    if (!isValidSlug(customSlug)) {
      throw new AppError(
        "Custom slug must be 3-20 characters and contain only letters, numbers, hyphens, and underscores",
        400
      );
    }

    if (isReservedSlug(customSlug)) {
      throw new AppError("This short code is reserved and cannot be used", 400);
    }

    const existing = await Link.findOne({ shortCode: customSlug });
    if (existing) {
      throw new AppError("This short code is already in use", 409);
    }

    shortCode = customSlug;
  } else {
    shortCode = await generateUniqueShortCode();
  }

  const parsedExpiry = parseExpiresAt(expiresAt);
  const cleanPassword = validateLinkPassword(password);

  const link = await Link.create({
    user: userId,
    destinationUrl,
    shortCode,
    expiresAt: parsedExpiry ?? null,
    passwordHash: cleanPassword ? await hashPassword(cleanPassword) : null,
  });

  return sanitizeLink(link);
};

const generateUniqueShortCode = async () => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = generateShortCode();
    const existing = await Link.findOne({ shortCode: code });
    if (!existing) {
      return code;
    }
  }
  throw new AppError("Unable to generate a unique short code. Please try again.", 500);
};

export const getUserLinks = async ({ userId, page = 1, limit = 10, search, isActive }) => {
  const numLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), MAX_PAGE_LIMIT);
  const numPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (numPage - 1) * numLimit;

  const query = { user: userId };

  if (search) {
    const sanitized = sanitizeSearchInput(search);
    if (sanitized) {
      const regex = new RegExp(sanitized, "i");
      query.$or = [{ destinationUrl: regex }, { shortCode: regex }];
    }
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true" || isActive === true;
  }

  const [links, total] = await Promise.all([
    Link.find(query).sort({ createdAt: -1 }).skip(skip).limit(numLimit),
    Link.countDocuments(query),
  ]);

  return {
    links: links.map(sanitizeLink),
    pagination: {
      page: numPage,
      limit: numLimit,
      total,
      totalPages: Math.ceil(total / numLimit),
    },
  };
};

export const getLinkById = async ({ userId, linkId }) => {
  const link = await Link.findOne({ _id: linkId, user: userId });
  if (!link) {
    throw new AppError("Link not found", 404);
  }
  return sanitizeLink(link);
};

export const updateLink = async ({ userId, linkId, destinationUrl, customSlug, isActive, expiresAt, password }) => {
  const link = await Link.findOne({ _id: linkId, user: userId });
  if (!link) {
    throw new AppError("Link not found", 404);
  }

  if (destinationUrl !== undefined) {
    if (!isValidDestinationUrl(destinationUrl)) {
      throw new AppError("Destination URL must be a valid HTTP or HTTPS URL", 400);
    }
    link.destinationUrl = destinationUrl;
  }

  if (customSlug !== undefined && customSlug !== link.shortCode) {
    if (!isValidSlug(customSlug)) {
      throw new AppError(
        "Custom slug must be 3-20 characters and contain only letters, numbers, hyphens, and underscores",
        400
      );
    }

    if (isReservedSlug(customSlug)) {
      throw new AppError("This short code is reserved and cannot be used", 400);
    }

    const existing = await Link.findOne({ shortCode: customSlug, _id: { $ne: link._id } });
    if (existing) {
      throw new AppError("This short code is already in use", 409);
    }

    link.shortCode = customSlug;
  }

  if (isActive !== undefined) {
    link.isActive = isActive;
  }

  if (expiresAt !== undefined) {
    link.expiresAt = parseExpiresAt(expiresAt);
  }

  if (password !== undefined) {
    const cleanPassword = validateLinkPassword(password);
    link.passwordHash = cleanPassword ? await hashPassword(cleanPassword) : null;
  }

  await link.save();
  return sanitizeLink(link);
};

export const deleteLink = async ({ userId, linkId }) => {
  const link = await Link.findOneAndDelete({ _id: linkId, user: userId });
  if (!link) {
    throw new AppError("Link not found", 404);
  }
  return true;
};
