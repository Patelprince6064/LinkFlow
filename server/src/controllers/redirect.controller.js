import * as redirectService from "../services/redirect.service.js";
import { recordClick } from "../services/click.service.js";
import detectDeviceType from "../utils/deviceDetector.js";
import hashIp from "../utils/ipHash.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const redirect = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const { linkId, destinationUrl } = await redirectService.resolveShortLink(shortCode);

  res.redirect(302, destinationUrl);

  const userAgent = req.get("user-agent");
  const referer = req.get("referer");
  const ip = req.ip;

  recordClick({
    linkId,
    referrer: referer || "Direct",
    deviceType: detectDeviceType(userAgent),
    ipHash: hashIp(ip),
  });
});
