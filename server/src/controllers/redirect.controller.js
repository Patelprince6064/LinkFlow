import * as redirectService from "../services/redirect.service.js";
import { recordClick } from "../services/click.service.js";
import detectDeviceType from "../utils/deviceDetector.js";
import { detectBrowser, detectOS, detectCountry } from "../utils/clientInfo.js";
import { renderPasswordGateHtml, renderExpiredHtml } from "../utils/redirectHtml.js";
import hashIp from "../utils/ipHash.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const redirect = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;
  const passwordAttempt = req.query.password || req.query.p || req.body?.password || req.headers["x-link-password"];

  let resolved;
  try {
    resolved = await redirectService.resolveShortLink(shortCode, passwordAttempt);
  } catch (error) {
    const isBrowserHtml =
      req.accepts("html") && !req.xhr && !req.headers["x-requested-with"] && !req.headers["x-link-password"];
    if (isBrowserHtml) {
      if (error.statusCode === 401) {
        return res.status(401).send(renderPasswordGateHtml(shortCode, Boolean(passwordAttempt)));
      }
      if (error.statusCode === 410) {
        return res.status(410).send(renderExpiredHtml());
      }
    }
    throw error;
  }

  const { linkId, destinationUrl } = resolved;

  res.redirect(302, destinationUrl);

  const userAgent = req.get("user-agent");
  const referer = req.get("referer");
  const ip = req.ip;

  recordClick({
    linkId,
    referrer: referer || "Direct",
    deviceType: detectDeviceType(userAgent),
    ipHash: hashIp(ip),
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    country: detectCountry(req),
  });
});
