const sanitize = (value) => {
  if (typeof value === "string") return value.replace(/[\r\n]/g, "").slice(0, 200);
  if (typeof value === "number") return value;
  return "[redacted]";
};

const logger = {
  info: (message, meta = {}) => {
    const safe = Object.fromEntries(
      Object.entries(meta).map(([k, v]) => [k, sanitize(v)])
    );
    console.log(JSON.stringify({ level: "info", message, ...safe, timestamp: new Date().toISOString() }));
  },
  warn: (message, meta = {}) => {
    const safe = Object.fromEntries(
      Object.entries(meta).map(([k, v]) => [k, sanitize(v)])
    );
    console.warn(JSON.stringify({ level: "warn", message, ...safe, timestamp: new Date().toISOString() }));
  },
  error: (message, meta = {}) => {
    const safe = Object.fromEntries(
      Object.entries(meta).map(([k, v]) => [k, sanitize(v)])
    );
    console.error(JSON.stringify({ level: "error", message, ...safe, timestamp: new Date().toISOString() }));
  },
};

export default logger;
