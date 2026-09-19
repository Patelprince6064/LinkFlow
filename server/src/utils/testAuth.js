import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { generateSecureToken, hashToken, compareTokenHash, hashPassword, comparePassword } from "../utils/token.js";
import crypto from "crypto";

let passed = 0;
let failed = 0;

const test = (name, fn) => {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${error.message}`);
    failed++;
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

console.log("\nAuth Utility Tests\n");

// --- JWT ---
console.log("JWT Utilities:");

test("generates and verifies access token", () => {
  const user = { _id: "507f1f77bcf86cd799439011", role: "user" };
  const token = generateAccessToken(user);
  const payload = verifyAccessToken(token);
  assert(payload.sub === user._id, "sub should match user id");
  assert(payload.type === "access", "type should be access");
  assert(payload.role === "user", "role should be user");
});

test("generates and verifies refresh token", () => {
  const user = { _id: "507f1f77bcf86cd799439011", role: "user" };
  const jti = crypto.randomUUID();
  const token = generateRefreshToken(user, jti);
  const payload = verifyRefreshToken(token);
  assert(payload.sub === user._id, "sub should match user id");
  assert(payload.type === "refresh", "type should be refresh");
  assert(payload.jti === jti, "jti should match");
});

test("rejects invalid access token", () => {
  try {
    verifyAccessToken("invalid.token.here");
    assert(false, "Should have thrown");
  } catch (err) {
    assert(err.name === "JsonWebTokenError" || err.message.includes("invalid"), "Should be JWT error");
  }
});

test("rejects invalid refresh token", () => {
  try {
    verifyRefreshToken("invalid.token.here");
    assert(false, "Should have thrown");
  } catch (err) {
    assert(err.name === "JsonWebTokenError" || err.message.includes("invalid"), "Should be JWT error");
  }
});

// --- TOKEN HASHING ---
console.log("\nToken Hashing:");

test("generates secure token (32 bytes hex)", () => {
  const token = generateSecureToken();
  assert(typeof token === "string", "Should be string");
  assert(token.length === 64, `Should be 64 hex chars, got ${token.length}`);
  assert(/^[a-f0-9]+$/.test(token), "Should be hex");
});

test("hashes and compares token", async () => {
  const token = generateSecureToken();
  const hash = await hashToken(token);
  const match = await compareTokenHash(token, hash);
  assert(match === true, "Should match");
});

test("rejects wrong token against hash", async () => {
  const token = generateSecureToken();
  const hash = await hashToken(token);
  const match = await compareTokenHash("wrong-token", hash);
  assert(match === false, "Should not match");
});

// --- PASSWORD ---
console.log("\nPassword Hashing:");

test("hashes and compares password", async () => {
  const password = "testpassword123";
  const hash = await hashPassword(password);
  const match = await comparePassword(password, hash);
  assert(match === true, "Should match");
});

test("rejects wrong password", async () => {
  const hash = await hashPassword("correct");
  const match = await comparePassword("wrong", hash);
  assert(match === false, "Should not match");
});

test("produces different hashes for same password", async () => {
  const hash1 = await hashPassword("samepassword");
  const hash2 = await hashPassword("samepassword");
  assert(hash1 !== hash2, "Hashes should differ (random salt)");
});

// --- RESULTS ---
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
process.exit(failed > 0 ? 1 : 0);
