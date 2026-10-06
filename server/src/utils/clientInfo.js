/**
 * Lightweight client-environment parsing — no external dependencies.
 * Browser/OS are coarse buckets for analytics dashboards, not fingerprinting.
 * Country comes only from hosting-provider geo headers (opt-in infra signal);
 * we never do IP geolocation and never store raw IPs (see ipHash.js).
 */

export const detectBrowser = (userAgent) => {
  if (!userAgent) return "Other";
  const ua = userAgent.toLowerCase();

  // Order matters: Edge/Opera/Samsung all embed "chrome" in their UA strings.
  if (ua.includes("edg/") || ua.includes("edga") || ua.includes("edgios")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("samsungbrowser")) return "Samsung Internet";
  if (ua.includes("chrome") || ua.includes("crios")) return "Chrome";
  if (ua.includes("firefox") || ua.includes("fxios")) return "Firefox";
  if (ua.includes("safari")) return "Safari";
  return "Other";
};

export const detectOS = (userAgent) => {
  if (!userAgent) return "Other";
  const ua = userAgent.toLowerCase();

  if (ua.includes("windows")) return "Windows";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "iOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("mac os")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  return "Other";
};

/**
 * Reads provider-injected geo headers (Render/Cloudflare/Vercel set these
 * when configured). Returns an ISO 3166-1 alpha-2 code or "Unknown".
 * In local dev no header exists, so everything is honestly "Unknown".
 */
export const detectCountry = (req) => {
  if (!req || typeof req.get !== "function") return "Unknown";
  const raw =
    req.get("cf-ipcountry") || req.get("x-vercel-ip-country") || req.get("x-country-code");
  if (!raw) return "Unknown";
  const code = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : "Unknown";
};
