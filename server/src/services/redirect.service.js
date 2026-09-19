import Link from "../models/Link.js";
import AppError from "../utils/AppError.js";

export const resolveShortLink = async (shortCode) => {
  if (!shortCode) {
    throw new AppError("Short code is required", 400);
  }

  const link = await Link.findOne({ shortCode });

  if (!link) {
    throw new AppError("Short link not found", 404);
  }

  if (!link.isActive) {
    throw new AppError("This short link has been disabled", 404);
  }

  return { linkId: link._id, destinationUrl: link.destinationUrl };
};
