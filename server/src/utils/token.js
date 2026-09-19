import crypto from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Deterministic SHA-256 hash for tokens stored in the DB.
 * bcrypt generates a new random salt on every call, so the same token
 * would hash to a different value — making DB lookups by hash impossible.
 * SHA-256 is sufficient here because the token itself is already a
 * cryptographically random 32-byte (64 hex char) value.
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Constant-time comparison to prevent timing attacks when comparing
 * a candidate token against its stored SHA-256 hash.
 */
export const compareTokenHash = (token, storedHash) => {
  const candidateHash = hashToken(token);
  // timingSafeEqual requires equal-length Buffers
  const a = Buffer.from(candidateHash, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
