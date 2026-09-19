import mongoose from "mongoose";
import User from "../models/User.js";
import Link from "../models/Link.js";
import ClickEvent from "../models/ClickEvent.js";
import BioProfile from "../models/BioProfile.js";

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

console.log("\nSchema Validation Tests (no database required)\n");

// --- USER ---
console.log("User Model:");

test("creates a valid user", () => {
  const user = new User({
    name: "Test User",
    email: "test@example.com",
    passwordHash: "hashedpassword",
  });
  const error = user.validateSync();
  assert(!error, "Should not have validation errors");
});

test("rejects user without name", () => {
  const user = new User({ email: "a@b.com", passwordHash: "h" });
  const error = user.validateSync();
  assert(error?.errors?.name, "Should require name");
});

test("rejects user without email", () => {
  const user = new User({ name: "No Email", passwordHash: "h" });
  const error = user.validateSync();
  assert(error?.errors?.email, "Should require email");
});

test("rejects user without passwordHash", () => {
  const user = new User({ name: "No Pass", email: "n@p.com" });
  const error = user.validateSync();
  assert(error?.errors?.passwordHash, "Should require passwordHash");
});

test("rejects invalid email format", () => {
  const user = new User({ name: "Bad", email: "notanemail", passwordHash: "h" });
  const error = user.validateSync();
  assert(error?.errors?.email, "Should reject invalid email");
});

test("normalizes email to lowercase", () => {
  const user = new User({ name: "Lower", email: "UPPER@TEST.COM", passwordHash: "h" });
  assert(user.email === "upper@test.com", "Email should be lowercase");
});

test("defaults role to user", () => {
  const user = new User({ name: "R", email: "r@t.co", passwordHash: "h" });
  assert(user.role === "user", "Role should default to user");
});

test("rejects invalid role", () => {
  const user = new User({ name: "R", email: "r2@t.co", passwordHash: "h", role: "superadmin" });
  const error = user.validateSync();
  assert(error?.errors?.role, "Should reject invalid role");
});

// --- LINK ---
console.log("\nLink Model:");

test("creates a valid link", () => {
  const link = new Link({
    user: new mongoose.Types.ObjectId(),
    destinationUrl: "https://example.com",
    shortCode: "test123",
  });
  const error = link.validateSync();
  assert(!error, "Should not have validation errors");
});

test("rejects link without destinationUrl", () => {
  const link = new Link({ user: new mongoose.Types.ObjectId(), shortCode: "nourl" });
  const error = link.validateSync();
  assert(error?.errors?.destinationUrl, "Should require destinationUrl");
});

test("rejects link without shortCode", () => {
  const link = new Link({ user: new mongoose.Types.ObjectId(), destinationUrl: "https://a.com" });
  const error = link.validateSync();
  assert(error?.errors?.shortCode, "Should require shortCode");
});

test("rejects link without user", () => {
  const link = new Link({ destinationUrl: "https://a.com", shortCode: "nouser" });
  const error = link.validateSync();
  assert(error?.errors?.user, "Should require user");
});

test("rejects ftp:// destination URL", () => {
  const link = new Link({
    user: new mongoose.Types.ObjectId(),
    destinationUrl: "ftp://files.example.com",
    shortCode: "ftp",
  });
  const error = link.validateSync();
  assert(error?.errors?.destinationUrl, "Should reject ftp URLs");
});

test("rejects shortCode with spaces", () => {
  const link = new Link({
    user: new mongoose.Types.ObjectId(),
    destinationUrl: "https://example.com",
    shortCode: "has space",
  });
  const error = link.validateSync();
  assert(error?.errors?.shortCode, "Should reject shortCode with spaces");
});

test("rejects shortCode with special characters", () => {
  const link = new Link({
    user: new mongoose.Types.ObjectId(),
    destinationUrl: "https://example.com",
    shortCode: "has@special",
  });
  const error = link.validateSync();
  assert(error?.errors?.shortCode, "Should reject shortCode with @");
});

test("accepts shortCode with hyphens and underscores", () => {
  const link = new Link({
    user: new mongoose.Types.ObjectId(),
    destinationUrl: "https://example.com",
    shortCode: "my-link_123",
  });
  const error = link.validateSync();
  assert(!error, "Should accept hyphens and underscores");
});

test("defaults isActive to true", () => {
  const link = new Link({
    user: new mongoose.Types.ObjectId(),
    destinationUrl: "https://example.com",
    shortCode: "active",
  });
  assert(link.isActive === true, "isActive should default to true");
});

test("defaults clickCount to 0", () => {
  const link = new Link({
    user: new mongoose.Types.ObjectId(),
    destinationUrl: "https://example.com",
    shortCode: "clicks",
  });
  assert(link.clickCount === 0, "clickCount should default to 0");
});

test("rejects negative clickCount", () => {
  const link = new Link({
    user: new mongoose.Types.ObjectId(),
    destinationUrl: "https://example.com",
    shortCode: "neg",
    clickCount: -1,
  });
  const error = link.validateSync();
  assert(error?.errors?.clickCount, "Should reject negative clickCount");
});

// --- CLICK EVENT ---
console.log("\nClickEvent Model:");

test("creates a valid click event", () => {
  const click = new ClickEvent({
    link: new mongoose.Types.ObjectId(),
    deviceType: "Desktop",
  });
  const error = click.validateSync();
  assert(!error, "Should not have validation errors");
});

test("rejects click without deviceType", () => {
  const click = new ClickEvent({ link: new mongoose.Types.ObjectId() });
  const error = click.validateSync();
  assert(error?.errors?.deviceType, "Should require deviceType");
});

test("rejects click without link", () => {
  const click = new ClickEvent({ deviceType: "Mobile" });
  const error = click.validateSync();
  assert(error?.errors?.link, "Should require link");
});

test("accepts Mobile deviceType", () => {
  const click = new ClickEvent({ link: new mongoose.Types.ObjectId(), deviceType: "Mobile" });
  assert(!click.validateSync(), "Should accept Mobile");
});

test("accepts Desktop deviceType", () => {
  const click = new ClickEvent({ link: new mongoose.Types.ObjectId(), deviceType: "Desktop" });
  assert(!click.validateSync(), "Should accept Desktop");
});

test("accepts Tablet deviceType", () => {
  const click = new ClickEvent({ link: new mongoose.Types.ObjectId(), deviceType: "Tablet" });
  assert(!click.validateSync(), "Should accept Tablet");
});

test("rejects SmartTV deviceType", () => {
  const click = new ClickEvent({ link: new mongoose.Types.ObjectId(), deviceType: "SmartTV" });
  const error = click.validateSync();
  assert(error?.errors?.deviceType, "Should reject SmartTV");
});

test("defaults timestamp to now", () => {
  const before = Date.now();
  const click = new ClickEvent({ link: new mongoose.Types.ObjectId(), deviceType: "Mobile" });
  const after = Date.now();
  assert(click.timestamp >= before && click.timestamp <= after, "Timestamp should be now");
});

test("allows null referrer", () => {
  const click = new ClickEvent({
    link: new mongoose.Types.ObjectId(),
    deviceType: "Desktop",
    referrer: null,
  });
  assert(!click.validateSync(), "Should allow null referrer");
});

test("allows null ipHash", () => {
  const click = new ClickEvent({
    link: new mongoose.Types.ObjectId(),
    deviceType: "Desktop",
    ipHash: null,
  });
  assert(!click.validateSync(), "Should allow null ipHash");
});

// --- BIO PROFILE ---
console.log("\nBioProfile Model:");

test("creates a valid bio profile", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "testbio",
    displayName: "Test Bio",
    theme: "Minimal Light",
  });
  assert(!bio.validateSync(), "Should not have validation errors");
});

test("rejects bio without username", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    displayName: "No Username",
    theme: "Minimal Light",
  });
  const error = bio.validateSync();
  assert(error?.errors?.username, "Should require username");
});

test("rejects bio without displayName", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "nodisplay",
    theme: "Minimal Light",
  });
  const error = bio.validateSync();
  assert(error?.errors?.displayName, "Should require displayName");
});

test("defaults theme to Minimal Light when omitted", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "notheme",
    displayName: "No Theme",
  });
  const error = bio.validateSync();
  assert(!error, "Should not error when theme defaults");
  assert(bio.theme === "Minimal Light", "Theme should default to Minimal Light");
});

test("rejects invalid theme", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "badtheme",
    displayName: "Bad",
    theme: "Neon Pink",
  });
  const error = bio.validateSync();
  assert(error?.errors?.theme, "Should reject invalid theme");
});

test("accepts Minimal Light theme", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "minimal-light-user",
    displayName: "ML",
    theme: "Minimal Light",
  });
  assert(!bio.validateSync(), "Should accept Minimal Light");
});

test("accepts Dark Slate theme", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "dark-slate-user",
    displayName: "DS",
    theme: "Dark Slate",
  });
  assert(!bio.validateSync(), "Should accept Dark Slate");
});

test("accepts Gradient theme", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "grad",
    displayName: "Grad",
    theme: "Gradient",
  });
  assert(!bio.validateSync(), "Should accept Gradient");
});

test("defaults theme to Minimal Light", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "default",
    displayName: "Default",
  });
  assert(bio.theme === "Minimal Light", "Theme should default to Minimal Light");
});

test("rejects username with spaces", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "has space",
    displayName: "Space",
    theme: "Minimal Light",
  });
  const error = bio.validateSync();
  assert(error?.errors?.username, "Should reject username with spaces");
});

test("accepts username with hyphens and underscores", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "my-name_123",
    displayName: "Valid",
    theme: "Minimal Light",
  });
  assert(!bio.validateSync(), "Should accept hyphens and underscores");
});

test("validates social link URL format", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "social",
    displayName: "Social",
    theme: "Minimal Light",
    socialLinks: [{ platform: "GitHub", url: "not-a-url", order: 0 }],
  });
  const error = bio.validateSync();
  assert(error, "Should reject invalid social link URL");
});

test("accepts valid social links", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "validsocial",
    displayName: "Valid",
    theme: "Minimal Light",
    socialLinks: [
      { platform: "GitHub", url: "https://github.com/user", order: 0 },
      { platform: "LinkedIn", url: "https://linkedin.com/in/user", order: 1 },
    ],
  });
  assert(!bio.validateSync(), "Should accept valid social links");
});

test("limits social links to 10", () => {
  const links = Array.from({ length: 11 }, (_, i) => ({
    platform: `P${i}`,
    url: `https://e.com/${i}`,
    order: i,
  }));
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "toomany",
    displayName: "Too Many",
    theme: "Minimal Light",
    socialLinks: links,
  });
  const error = bio.validateSync();
  assert(error?.errors?.socialLinks, "Should reject more than 10 social links");
});

test("accepts empty socialLinks array", () => {
  const bio = new BioProfile({
    user: new mongoose.Types.ObjectId(),
    username: "empty",
    displayName: "Empty",
    theme: "Minimal Light",
    socialLinks: [],
  });
  assert(!bio.validateSync(), "Should accept empty socialLinks");
});

// --- RESULTS ---
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
process.exit(failed > 0 ? 1 : 0);
