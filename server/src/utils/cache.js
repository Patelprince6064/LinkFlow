import Redis from "ioredis";
import logger from "./logger.js";

let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, enableReadyCheck: false });
  redis.on("error", (err) => logger.warn("Redis error, falling back to DB", { error: err.message }));
} else {
  logger.warn("REDIS_URL not set — redirect cache disabled, using MongoDB directly.");
}

const mem = new Map();
const MEM_TTL_MS = 60 * 1000;

export const cacheGet = async (key) => {
  if (redis) {
    try {
      const hit = await redis.get(key);
      return hit ? JSON.parse(hit) : null;
    } catch {
      return null;
    }
  }
  const entry = mem.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    mem.delete(key);
    return null;
  }
  return entry.value;
};

export const cacheSet = async (key, value, ttlSeconds = 60) => {
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return;
    } catch {
      /* fall through to memory */
    }
  }
  mem.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
};

export const cacheDel = async (key) => {
  if (redis) {
    try {
      await redis.del(key);
    } catch {
      /* ignore */
    }
  }
  mem.delete(key);
};

export default { cacheGet, cacheSet, cacheDel };
