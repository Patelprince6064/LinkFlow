import ClickEvent from "../models/ClickEvent.js";
import Link from "../models/Link.js";

export const recordClick = async ({ linkId, referrer, deviceType, ipHash }) => {
  try {
    await ClickEvent.create({
      link: linkId,
      referrer: referrer || "Direct",
      deviceType,
      ipHash,
    });

    await Link.findByIdAndUpdate(linkId, { $inc: { clickCount: 1 } });
  } catch (error) {
    console.error(`[TELEMETRY] Failed to record click for link ${linkId}:`, error.message);
  }
};
