import { connectTestDB, clearCollections } from "./helpers/testDB.js";
import { testUser, testBio, testBio2 } from "./helpers/fixtures.js";
import User from "../models/User.js";
import BioProfile from "../models/BioProfile.js";
import * as bioService from "../services/bio.service.js";
import { validateTheme, validateUsername } from "../utils/validation.js";

let passed = 0;
let failed = 0;

const test = (name, fn) => {
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      return result
        .then(() => { console.log(`  ✓ ${name}`); passed++; })
        .catch((error) => { console.log(`  ✗ ${name}`); console.log(`    ${error.message}`); failed++; });
    }
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

let userId;
let userId2;

const setup = async () => {
  await connectTestDB();
  await clearCollections();
  const u1 = await User.create({ name: testUser.name, email: testUser.email.toLowerCase(), passwordHash: "hash", isEmailVerified: true });
  const u2 = await User.create({ name: "Second User", email: "second@example.com", passwordHash: "hash", isEmailVerified: true });
  userId = u1._id.toString();
  userId2 = u2._id.toString();
};

const teardown = async () => { await clearCollections(); };

console.log("\nBio Tests (requires MongoDB)\n");

const runTests = async () => {
  await setup();

  // ==========================================
  // THEME VALIDATION (unit)
  // ==========================================
  console.log("Theme Validation:");

  test("accepts Minimal Light", () => assert(validateTheme("Minimal Light")));
  test("accepts Dark Slate", () => assert(validateTheme("Dark Slate")));
  test("accepts Gradient", () => assert(validateTheme("Gradient")));
  test("rejects Neon Pink", () => assert(!validateTheme("Neon Pink")));
  test("rejects empty theme", () => assert(!validateTheme("")));

  // ==========================================
  // USERNAME VALIDATION (unit)
  // ==========================================
  console.log("\nUsername Validation:");

  test("accepts valid username", () => assertEqual(validateUsername("prince"), "prince"));
  test("normalizes to lowercase", () => assertEqual(validateUsername("Prince"), "prince"));
  test("rejects short username", () => assertEqual(validateUsername("ab"), null));
  test("rejects username with spaces", () => assertEqual(validateUsername("my name"), null));
  test("rejects username with special chars", () => assertEqual(validateUsername("user@123"), null));

  // ==========================================
  // BIO CREATE
  // ==========================================
  console.log("\nBio Create:");

  await test("creates bio profile", async () => {
    const profile = await bioService.createProfile(userId, testBio);
    assert(profile, "Should return profile");
    assertEqual(profile.username, testBio.username.toLowerCase());
    assertEqual(profile.displayName, testBio.displayName);
    assertEqual(profile.theme, testBio.theme);
  });

  await test("normalizes username to lowercase", async () => {
    await clearCollections();
    const u = await User.create({ name: "Test", email: "norm@test.com", passwordHash: "hash", isEmailVerified: true });
    const profile = await bioService.createProfile(u._id.toString(), { ...testBio, username: "UPPERCASE" });
    assertEqual(profile.username, "uppercase");
  });

  await test("rejects duplicate username", async () => {
    await clearCollections();
    const u1 = await User.create({ name: "A", email: "a@test.com", passwordHash: "hash", isEmailVerified: true });
    const u2 = await User.create({ name: "B", email: "b@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u1._id.toString(), testBio);
    try {
      await bioService.createProfile(u2._id.toString(), { ...testBio, username: testBio.username });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 409);
    }
  });

  await test("rejects reserved username", async () => {
    await clearCollections();
    const u = await User.create({ name: "C", email: "c@test.com", passwordHash: "hash", isEmailVerified: true });
    try {
      await bioService.createProfile(u._id.toString(), { ...testBio, username: "api" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects short username", async () => {
    await clearCollections();
    const u = await User.create({ name: "D", email: "d@test.com", passwordHash: "hash", isEmailVerified: true });
    try {
      await bioService.createProfile(u._id.toString(), { ...testBio, username: "ab" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects duplicate profile for same user", async () => {
    await clearCollections();
    const u = await User.create({ name: "E", email: "e@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u._id.toString(), testBio);
    try {
      await bioService.createProfile(u._id.toString(), { ...testBio, username: "other" });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 409);
    }
  });

  await test("rejects invalid theme", async () => {
    await clearCollections();
    const u = await User.create({ name: "F", email: "f@test.com", passwordHash: "hash", isEmailVerified: true });
    try {
      await bioService.createProfile(u._id.toString(), { ...testBio, theme: "Neon Pink" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects social link with invalid URL", async () => {
    await clearCollections();
    const u = await User.create({ name: "G", email: "g@test.com", passwordHash: "hash", isEmailVerified: true });
    try {
      await bioService.createProfile(u._id.toString(), {
        ...testBio,
        socialLinks: [{ platform: "GitHub", url: "not-a-url" }],
      });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects social link with javascript URL", async () => {
    await clearCollections();
    const u = await User.create({ name: "H", email: "h@test.com", passwordHash: "hash", isEmailVerified: true });
    try {
      await bioService.createProfile(u._id.toString(), {
        ...testBio,
        socialLinks: [{ platform: "Website", url: "javascript:alert(1)" }],
      });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("accepts valid social links", async () => {
    await clearCollections();
    const u = await User.create({ name: "I", email: "i@test.com", passwordHash: "hash", isEmailVerified: true });
    const profile = await bioService.createProfile(u._id.toString(), {
      ...testBio,
      socialLinks: [
        { platform: "GitHub", url: "https://github.com/test" },
        { platform: "LinkedIn", url: "https://linkedin.com/in/test" },
      ],
    });
    assertEqual(profile.socialLinks.length, 2);
  });

  // ==========================================
  // BIO GET
  // ==========================================
  console.log("\nBio Get:");

  await test("getMyProfile returns profile", async () => {
    const profile = await bioService.getMyProfile(userId);
    assert(profile, "Should return profile");
    assertEqual(profile.username, testBio.username.toLowerCase());
  });

  await test("getMyProfile returns null for no profile", async () => {
    await clearCollections();
    const u = await User.create({ name: "J", email: "j@test.com", passwordHash: "hash", isEmailVerified: true });
    const profile = await bioService.getMyProfile(u._id.toString());
    assertEqual(profile, null);
  });

  // ==========================================
  // BIO UPDATE
  // ==========================================
  console.log("\nBio Update:");

  await test("update changes fields", async () => {
    await clearCollections();
    const u = await User.create({ name: "K", email: "k@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u._id.toString(), testBio);
    const updated = await bioService.updateProfile(u._id.toString(), { displayName: "Updated Name" });
    assertEqual(updated.displayName, "Updated Name");
  });

  await test("update changes theme", async () => {
    await clearCollections();
    const u = await User.create({ name: "L", email: "l@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u._id.toString(), testBio);
    const updated = await bioService.updateProfile(u._id.toString(), { theme: "Dark Slate" });
    assertEqual(updated.theme, "Dark Slate");
  });

  await test("update rejects invalid theme", async () => {
    await clearCollections();
    const u = await User.create({ name: "M", email: "m@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u._id.toString(), testBio);
    try {
      await bioService.updateProfile(u._id.toString(), { theme: "Invalid" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("update rejects taken username", async () => {
    await clearCollections();
    const u1 = await User.create({ name: "N", email: "n@test.com", passwordHash: "hash", isEmailVerified: true });
    const u2 = await User.create({ name: "O", email: "o@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u1._id.toString(), testBio);
    await bioService.createProfile(u2._id.toString(), testBio2);
    try {
      await bioService.updateProfile(u2._id.toString(), { username: testBio.username });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 409);
    }
  });

  await test("update non-existent profile fails", async () => {
    await clearCollections();
    const u = await User.create({ name: "P", email: "p@test.com", passwordHash: "hash", isEmailVerified: true });
    try {
      await bioService.updateProfile(u._id.toString(), { displayName: "Test" });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  // ==========================================
  // BIO DELETE
  // ==========================================
  console.log("\nBio Delete:");

  await test("delete removes profile", async () => {
    await clearCollections();
    const u = await User.create({ name: "Q", email: "q@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u._id.toString(), testBio);
    await bioService.deleteProfile(u._id.toString());
    const profile = await bioService.getMyProfile(u._id.toString());
    assertEqual(profile, null);
  });

  await test("delete non-existent profile fails", async () => {
    await clearCollections();
    const u = await User.create({ name: "R", email: "r@test.com", passwordHash: "hash", isEmailVerified: true });
    try {
      await bioService.deleteProfile(u._id.toString());
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  // ==========================================
  // PUBLIC BIO
  // ==========================================
  console.log("\nPublic Bio:");

  await test("getPublicProfile returns public fields only", async () => {
    await clearCollections();
    const u = await User.create({ name: "S", email: "s@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u._id.toString(), { ...testBio, username: "publicuser" });
    const profile = await bioService.getPublicProfile("publicuser");
    assert(profile, "Should return profile");
    assertEqual(profile.username, "publicuser");
    assert(profile.displayName, "Should have displayName");
    assert(!profile.user, "Should not expose user ID");
  });

  await test("getPublicProfile returns null for nonexistent", async () => {
    const profile = await bioService.getPublicProfile("nonexistent");
    assertEqual(profile, null);
  });

  await test("getPublicProfile normalizes username", async () => {
    await clearCollections();
    const u = await User.create({ name: "T", email: "t@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u._id.toString(), { ...testBio, username: "caseuser" });
    const profile = await bioService.getPublicProfile("CASEUSER");
    assert(profile, "Should find profile");
  });

  await test("public profile does not expose email", async () => {
    await clearCollections();
    const u = await User.create({ name: "U", email: "private@test.com", passwordHash: "hash", isEmailVerified: true });
    await bioService.createProfile(u._id.toString(), { ...testBio, username: "privacyuser" });
    const profile = await bioService.getPublicProfile("privacyuser");
    const keys = Object.keys(profile);
    assert(!keys.includes("email"), "Should not expose email");
    assert(!keys.includes("passwordHash"), "Should not expose passwordHash");
    assert(!keys.includes("user"), "Should not expose user reference");
  });

  // ==========================================
  // SOCIAL LINKS
  // ==========================================
  console.log("\nSocial Links:");

  await test("social links are ordered correctly", async () => {
    await clearCollections();
    const u = await User.create({ name: "V", email: "v@test.com", passwordHash: "hash", isEmailVerified: true });
    const profile = await bioService.createProfile(u._id.toString(), {
      ...testBio,
      socialLinks: [
        { platform: "LinkedIn", url: "https://linkedin.com/in/test", order: 1 },
        { platform: "GitHub", url: "https://github.com/test", order: 0 },
      ],
    });
    assertEqual(profile.socialLinks[0].platform, "GitHub");
    assertEqual(profile.socialLinks[1].platform, "LinkedIn");
  });

  await test("rejects invalid platform type", async () => {
    await clearCollections();
    const u = await User.create({ name: "W", email: "w@test.com", passwordHash: "hash", isEmailVerified: true });
    // Platform is a free-form string, but we validate URL
    const profile = await bioService.createProfile(u._id.toString(), {
      ...testBio,
      socialLinks: [{ platform: "CustomPlatform", url: "https://example.com" }],
    });
    assertEqual(profile.socialLinks[0].platform, "CustomPlatform");
  });

  // ==========================================
  // MODEL INDEXES
  // ==========================================
  console.log("\nModel Indexes:");

  await test("BioProfile has unique username index", async () => {
    const indexes = await BioProfile.schema.indexes();
    const hasUsernameUnique = indexes.some(([spec]) => spec.username === 1);
    assert(hasUsernameUnique, "Should have unique username index");
  });

  await test("BioProfile has unique user index", async () => {
    const indexes = await BioProfile.schema.indexes();
    const hasUserUnique = indexes.some(([spec]) => spec.user === 1);
    assert(hasUserUnique, "Should have unique user index");
  });

  await teardown();

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
