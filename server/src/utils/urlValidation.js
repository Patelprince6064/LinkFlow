const ALLOWED_PROTOCOLS = ["http:", "https:"];
const BLOCKED_PROTOCOLS = ["javascript:", "data:", "file:", "vbscript:"];

export const isValidDestinationUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const isUnsafeUrl = (url) => {
  const lower = url.toLowerCase().trim();
  return BLOCKED_PROTOCOLS.some((proto) => lower.startsWith(proto));
};
