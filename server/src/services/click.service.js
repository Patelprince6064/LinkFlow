import ClickEvent from "../models/ClickEvent.js";
import Link from "../models/Link.js";
import logger from "../utils/logger.js";

export const recordClick = async ({ linkId, referrer, deviceType, ipHash, browser, os, country }) => {
  try {
    await ClickEvent.create({
      link: linkId,
      referrer: referrer || "Direct",
      deviceType,
      ipHash,
      browser: browser || "Other",
      os: os || "Other",
      country: country || "Unknown",
    });

    await Link.findByIdAndUpdate(linkId, { $inc: { clickCount: 1 } });
  } catch (error) {
    logger.error("[TELEMETRY] Failed to record click", { linkId: String(linkId), error: error.message });
  }
};
