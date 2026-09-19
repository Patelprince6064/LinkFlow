import detectDeviceType from "../utils/deviceDetector.js";
import hashIp from "../utils/ipHash.js";
import { generateShortCode } from "../utils/shortCode.js";
import { MOBILE_USER_AGENTS, DESKTOP_USER_AGENTS, TABLET_USER_AGENTS } from "./helpers/fixtures.js";

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

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const assertEqual = (a, b, msg) => { if (a !== b) throw new Error(`${msg || "assertEqual"}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

console.log("\nRedirect & Telemetry Tests (no database required)\n");

// ==========================================
// DEVICE DETECTION
// ==========================================
console.log("Device Detection:");

test("detects iPhone as Mobile", () => {
  assertEqual(detectDeviceType(MOBILE_USER_AGENTS.iPhone), "Mobile");
});

test("detects Android phone as Mobile", () => {
  assertEqual(detectDeviceType(MOBILE_USER_AGENTS.android), "Mobile");
});

test("detects Chrome Desktop as Desktop", () => {
  assertEqual(detectDeviceType(DESKTOP_USER_AGENTS.chrome), "Desktop");
});

test("detects Firefox Desktop as Desktop", () => {
  assertEqual(detectDeviceType(DESKTOP_USER_AGENTS.firefox), "Desktop");
});

test("detects iPad as Tablet", () => {
  assertEqual(detectDeviceType(TABLET_USER_AGENTS.iPad), "Tablet");
});

test("detects Android tablet as Tablet", () => {
  assertEqual(detectDeviceType(TABLET_USER_AGENTS.androidTablet), "Tablet");
});

test("defaults to Desktop for empty user agent", () => {
  assertEqual(detectDeviceType(""), "Desktop");
});

test("defaults to Desktop for null user agent", () => {
  assertEqual(detectDeviceType(null), "Desktop");
});

test("defaults to Desktop for undefined user agent", () => {
  assertEqual(detectDeviceType(undefined), "Desktop");
});

// ==========================================
// IP HASHING
// ==========================================
console.log("\nIP Hashing:");

test("hashes IP address with SHA-256", () => {
  const hash = hashIp("192.168.1.1");
  assert(hash, "Should return hash");
  assertEqual(hash.length, 64, "SHA-256 hex is 64 chars");
});

test("returns null for null IP", () => {
  assertEqual(hashIp(null), null);
});

test("returns null for empty IP", () => {
  assertEqual(hashIp(""), null);
});

test("same IP produces same hash (deterministic)", () => {
  const hash1 = hashIp("10.0.0.1");
  const hash2 = hashIp("10.0.0.1");
  assertEqual(hash1, hash2);
});

test("different IPs produce different hashes", () => {
  const hash1 = hashIp("10.0.0.1");
  const hash2 = hashIp("10.0.0.2");
  assert(hash1 !== hash2, "Hashes should differ");
});

test("hash does not contain raw IP", () => {
  const ip = "192.168.1.100";
  const hash = hashIp(ip);
  assert(!hash.includes(ip), "Hash should not contain raw IP");
});

test("hash is lowercase hex", () => {
  const hash = hashIp("127.0.0.1");
  assert(/^[0-9a-f]{64}$/.test(hash), "Hash should be lowercase hex");
});

// ==========================================
// SHORT CODE GENERATION
// ==========================================
console.log("\nShort Code Generation:");

test("generates exactly 6 characters", () => {
  const code = generateShortCode();
  assertEqual(code.length, 6);
});

test("generates alphanumeric code", () => {
  const code = generateShortCode();
  assert(/^[a-zA-Z0-9]+$/.test(code));
});

test("generates unique codes (100 samples)", () => {
  const codes = new Set();
  for (let i = 0; i < 100; i++) codes.add(generateShortCode());
  assert(codes.size > 95, `Expected >95 unique, got ${codes.size}`);
});

test("code does not contain URL-unsafe characters", () => {
  for (let i = 0; i < 50; i++) {
    const code = generateShortCode();
    assert(/^[a-zA-Z0-9]+$/.test(code), `Code "${code}" contains unsafe chars`);
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
process.exit(failed > 0 ? 1 : 0);
