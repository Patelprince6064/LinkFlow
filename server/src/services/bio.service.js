import BioProfile from "../models/BioProfile.js";
import AppError from "../utils/AppError.js";

const RESERVED_USERNAMES = [
  "api",
  "login",
  "register",
  "dashboard",
  "admin",
  "auth",
  "r",
  "bio",
  "favicon",
  "assets",
  "reset-password",
  "verify-email",
  "forgot-password",
];

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

const PUBLIC_FIELDS = "username avatar displayName bio theme socialLinks";

const validateUsername = (username) => {
  if (!username || typeof username !== "string") {
    throw new AppError("Username is required", 400);
  }

  const trimmed = username.trim().toLowerCase();

  if (trimmed.length < 3 || trimmed.length > 30) {
    throw new AppError("Username must be 3-30 characters", 400);
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    throw new AppError("Username can only contain letters, numbers, hyphens, and underscores", 400);
  }

  if (RESERVED_USERNAMES.includes(trimmed)) {
    throw new AppError("This username is reserved", 400);
  }

  return trimmed;
};

const validateSocialLinks = (socialLinks) => {
  if (!Array.isArray(socialLinks)) return [];

  if (socialLinks.length > 10) {
    throw new AppError("Cannot have more than 10 social links", 400);
  }

  for (const link of socialLinks) {
    if (!link.platform || typeof link.platform !== "string") {
      throw new AppError("Each social link requires a platform", 400);
    }
    if (!link.url || typeof link.url !== "string") {
      throw new AppError("Each social link requires a URL", 400);
    }
    try {
      const parsed = new URL(link.url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new AppError("Social link URLs must use HTTP or HTTPS", 400);
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError("Social link URL is invalid", 400);
    }
  }

  return socialLinks.map((link, i) => ({
    platform: link.platform.trim(),
    label: link.label?.trim() || null,
    url: link.url.trim(),
    order: typeof link.order === "number" ? link.order : i,
  }));
};

export const getMyProfile = async (userId) => {
  return BioProfile.findOne({ user: userId }).lean();
};

export const createProfile = async (userId, data) => {
  const existing = await BioProfile.findOne({ user: userId });
  if (existing) {
    throw new AppError("You already have a bio profile. Use PATCH to update it.", 409);
  }

  const username = validateUsername(data.username);
  const usernameTaken = await BioProfile.findOne({ username });
  if (usernameTaken) {
    throw new AppError("This username is already taken", 409);
  }

  const socialLinks = validateSocialLinks(data.socialLinks);

  const profile = await BioProfile.create({
    user: userId,
    username,
    avatar: data.avatar?.trim() || null,
    displayName: data.displayName?.trim() || username,
    bio: data.bio?.trim() || "",
    theme: data.theme || "Minimal Light",
    socialLinks,
  });

  return profile;
};

export const updateProfile = async (userId, data) => {
  const profile = await BioProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError("Bio profile not found. Create one first.", 404);
  }

  if (data.username !== undefined) {
    const newUsername = validateUsername(data.username);
    if (newUsername !== profile.username) {
      const taken = await BioProfile.findOne({ username: newUsername });
      if (taken) {
        throw new AppError("This username is already taken", 409);
      }
    }
    profile.username = newUsername;
  }

  if (data.displayName !== undefined) {
    if (!data.displayName || !data.displayName.trim()) {
      throw new AppError("Display name is required", 400);
    }
    profile.displayName = data.displayName.trim();
  }

  if (data.bio !== undefined) {
    profile.bio = data.bio?.trim() || "";
  }

  if (data.theme !== undefined) {
    const validThemes = ["Minimal Light", "Dark Slate", "Gradient"];
    if (!validThemes.includes(data.theme)) {
      throw new AppError("Theme must be one of: Minimal Light, Dark Slate, Gradient", 400);
    }
    profile.theme = data.theme;
  }

  if (data.avatar !== undefined) {
    profile.avatar = data.avatar?.trim() || null;
  }

  if (data.socialLinks !== undefined) {
    profile.socialLinks = validateSocialLinks(data.socialLinks);
  }

  await profile.save();
  return profile;
};

export const deleteProfile = async (userId) => {
  const profile = await BioProfile.findOneAndDelete({ user: userId });
  if (!profile) {
    throw new AppError("Bio profile not found", 404);
  }
  return profile;
};

export const getPublicProfile = async (username) => {
  if (!username || typeof username !== "string") {
    throw new AppError("Username is required", 400);
  }

  const profile = await BioProfile.findOne({ username: username.toLowerCase().trim() })
    .select(PUBLIC_FIELDS)
    .lean();

  return profile;
};
