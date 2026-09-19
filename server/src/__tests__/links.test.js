import { connectTestDB, disconnectTestDB, clearCollections } from "./helpers/testDB.js";
import { testUser, testUser2, testLink, testLinkWithSlug } from "./helpers/fixtures.js";
import User from "../models/User.js";
import Link from "../models/Link.js";
import * as linkService from "../services/link.service.js";
import { generateShortCode, isValidSlug } from "../utils/shortCode.js";
import { isReservedSlug } from "../utils/reservedSlugs.js";
import { isValidDestinationUrl, isUnsafeUrl } from "../utils/urlValidation.js";

let passed = 0;
let failed = 0;
let skipped = 0;

const test = (name, fn) => {
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      return result
        .then(() => { console.log(`  ✓ ${name}`); passed++; })
        .catch((error) => {
          if (error.message.includes("SKIP")) { console.log(`  ⊘ ${name} (skipped)`); skipped++; }
          else { console.log(`  ✗ ${name}`); console.log(`    ${error.message}`); failed++; }
        });
    }
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    if (error.message.includes("SKIP")) { console.log(`  ⊘ ${name} (skipped)`); skipped++; }
    else { console.log(`  ✗ ${name}`); console.log(`    ${error.message}`); failed++; }
  }
};

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const assertEqual = (a, b, msg) => { if (a !== b) throw new Error(`${msg || "assertEqual"}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

let userId;
let userId2;

const setup = async () => {
  await connectTestDB();
  await clearCollections();
  const user1 = await User.create({ name: testUser.name, email: testUser.email.toLowerCase(), passwordHash: "dummyhash", isEmailVerified: true });
  const user2 = await User.create({ name: testUser2.name, email: testUser2.email.toLowerCase(), passwordHash: "dummyhash", isEmailVerified: true });
  userId = user1._id.toString();
  userId2 = user2._id.toString();
};

const teardown = async () => {
  await clearCollections();
};

console.log("\nLink Tests (requires MongoDB)\n");

const runTests = async () => {
  await setup();

  // ==========================================
  // SHORT CODE GENERATION
  // ==========================================
  console.log("Short Code Generation:");

  test("generates 6-character code", () => {
    const code = generateShortCode();
    assertEqual(code.length, 6, "Code length");
  });

  test("generates alphanumeric codes", () => {
    const code = generateShortCode();
    assert(/^[a-zA-Z0-9]+$/.test(code), "Code should be alphanumeric");
  });

  test("generates unique codes", () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) codes.add(generateShortCode());
    assert(codes.size > 90, "Should generate mostly unique codes");
  });

  // ==========================================
  // SLUG VALIDATION
  // ==========================================
  console.log("\nSlug Validation:");

  test("accepts valid slug", () => assert(isValidSlug("my-link")));
  test("accepts slug with underscores", () => assert(isValidSlug("my_link")));
  test("accepts slug with numbers", () => assert(isValidSlug("link123")));
  test("rejects slug under 3 chars", () => assert(!isValidSlug("ab")));
  test("rejects slug with spaces", () => assert(!isValidSlug("my link")));
  test("rejects slug with special chars", () => assert(!isValidSlug("my@link")));
  test("rejects empty slug", () => assert(!isValidSlug("")));

  // ==========================================
  // URL VALIDATION
  // ==========================================
  console.log("\nURL Validation:");

  test("accepts valid HTTPS URL", () => assert(isValidDestinationUrl("https://example.com")));
  test("accepts valid HTTP URL", () => assert(isValidDestinationUrl("http://example.com")));
  test("accepts URL with path", () => assert(isValidDestinationUrl("https://example.com/path?q=1")));
  test("rejects javascript URL", () => assert(!isValidDestinationUrl("javascript:alert(1)")));
  test("rejects data URL", () => assert(!isValidDestinationUrl("data:text/html")));
  test("rejects file URL", () => assert(!isValidDestinationUrl("file:///etc/passwd")));
  test("rejects empty URL", () => assert(!isValidDestinationUrl("")));
  test("rejects random string", () => assert(!isValidDestinationUrl("not-a-url")));

  test("detects javascript URL as unsafe", () => assert(isUnsafeUrl("javascript:alert(1)")));
  test("detects data URL as unsafe", () => assert(isUnsafeUrl("data:text/html")));
  test("does not flag https as unsafe", () => assert(!isUnsafeUrl("https://example.com")));

  // ==========================================
  // LINK CREATION
  // ==========================================
  console.log("\nLink Creation:");

  await test("creates link with auto-generated short code", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    assert(link.id, "Should have id");
    assertEqual(link.shortCode.length, 6, "Short code should be 6 chars");
    assertEqual(link.destinationUrl, "https://example.com");
    assertEqual(link.clickCount, 0);
    assertEqual(link.isActive, true);
    assert(link.shortUrl, "Should have shortUrl");
  });

  await test("creates link with custom slug", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com", customSlug: "my-custom" });
    assertEqual(link.shortCode, "my-custom");
  });

  await test("rejects invalid destination URL", async () => {
    try {
      await linkService.createLink({ userId, destinationUrl: "not-a-url" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects javascript URL", async () => {
    try {
      await linkService.createLink({ userId, destinationUrl: "javascript:alert(1)" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects reserved slug", async () => {
    try {
      await linkService.createLink({ userId, destinationUrl: "https://example.com", customSlug: "api" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects duplicate slug", async () => {
    await linkService.createLink({ userId, destinationUrl: "https://example.com", customSlug: "taken-slug" });
    try {
      await linkService.createLink({ userId, destinationUrl: "https://other.com", customSlug: "taken-slug" });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 409);
    }
  });

  await test("rejects missing destination URL", async () => {
    try {
      await linkService.createLink({ userId });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects invalid slug characters", async () => {
    try {
      await linkService.createLink({ userId, destinationUrl: "https://example.com", customSlug: "my slug!" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects slug too short", async () => {
    try {
      await linkService.createLink({ userId, destinationUrl: "https://example.com", customSlug: "ab" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("rejects destination URL without protocol", async () => {
    try {
      await linkService.createLink({ userId, destinationUrl: "example.com" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  // ==========================================
  // LINK OWNERSHIP
  // ==========================================
  console.log("\nLink Ownership:");

  await test("user can read their own link", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    const result = await linkService.getLinkById({ userId, linkId: link.id });
    assert(result, "Should return link");
    assertEqual(result.id, link.id);
  });

  await test("user cannot read another user's link", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    try {
      await linkService.getLinkById({ userId: userId2, linkId: link.id });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  await test("user can update their own link", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    const updated = await linkService.updateLink({ userId, linkId: link.id, destinationUrl: "https://updated.com" });
    assertEqual(updated.destinationUrl, "https://updated.com");
  });

  await test("user cannot update another user's link", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    try {
      await linkService.updateLink({ userId: userId2, linkId: link.id, destinationUrl: "https://hacked.com" });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  await test("user can delete their own link", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    const result = await linkService.deleteLink({ userId, linkId: link.id });
    assertEqual(result, true);
    try {
      await linkService.getLinkById({ userId, linkId: link.id });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  await test("user cannot delete another user's link", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    try {
      await linkService.deleteLink({ userId: userId2, linkId: link.id });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  // ==========================================
  // LINK SEARCH & PAGINATION
  // ==========================================
  console.log("\nLink Search & Pagination:");

  await test("returns paginated results", async () => {
    await clearCollections();
    const u = await User.create({ name: testUser.name, email: testUser.email.toLowerCase(), passwordHash: "hash", isEmailVerified: true });
    const uid = u._id.toString();

    for (let i = 0; i < 15; i++) {
      await linkService.createLink({ userId: uid, destinationUrl: `https://example.com/${i}` });
    }

    const page1 = await linkService.getUserLinks({ userId: uid, page: 1, limit: 10 });
    assertEqual(page1.links.length, 10);
    assertEqual(page1.pagination.page, 1);
    assertEqual(page1.pagination.total, 15);
    assertEqual(page1.pagination.totalPages, 2);

    const page2 = await linkService.getUserLinks({ userId: uid, page: 2, limit: 10 });
    assertEqual(page2.links.length, 5);
    assertEqual(page2.pagination.page, 2);
  });

  await test("search filters by destination URL", async () => {
    await clearCollections();
    const u = await User.create({ name: testUser.name, email: testUser.email.toLowerCase(), passwordHash: "hash", isEmailVerified: true });
    const uid = u._id.toString();

    await linkService.createLink({ userId: uid, destinationUrl: "https://github.com/user" });
    await linkService.createLink({ userId: uid, destinationUrl: "https://google.com" });
    await linkService.createLink({ userId: uid, destinationUrl: "https://github.com/other" });

    const result = await linkService.getUserLinks({ userId: uid, search: "github" });
    assertEqual(result.links.length, 2);
  });

  await test("search filters by short code", async () => {
    await clearCollections();
    const u = await User.create({ name: testUser.name, email: testUser.email.toLowerCase(), passwordHash: "hash", isEmailVerified: true });
    const uid = u._id.toString();

    await linkService.createLink({ userId: uid, destinationUrl: "https://example.com/1", customSlug: "abc-xyz" });
    await linkService.createLink({ userId: uid, destinationUrl: "https://example.com/2" });

    const result = await linkService.getUserLinks({ userId: uid, search: "abc" });
    assertEqual(result.links.length, 1);
  });

  await test("user isolation in search", async () => {
    await clearCollections();
    const u1 = await User.create({ name: testUser.name, email: testUser.email.toLowerCase(), passwordHash: "hash", isEmailVerified: true });
    const u2 = await User.create({ name: testUser2.name, email: testUser2.email.toLowerCase(), passwordHash: "hash", isEmailVerified: true });

    await linkService.createLink({ userId: u1._id.toString(), destinationUrl: "https://example.com" });
    await linkService.createLink({ userId: u2._id.toString(), destinationUrl: "https://example.com" });

    const result = await linkService.getUserLinks({ userId: u1._id.toString() });
    assertEqual(result.links.length, 1, "User should only see their own links");
  });

  await test("invalid page defaults to page 1", async () => {
    await clearCollections();
    const u = await User.create({ name: testUser.name, email: testUser.email.toLowerCase(), passwordHash: "hash", isEmailVerified: true });
    const result = await linkService.getUserLinks({ userId: u._id.toString(), page: "abc" });
    assertEqual(result.pagination.page, 1);
  });

  await test("limit is capped at 50", async () => {
    await clearCollections();
    const u = await User.create({ name: testUser.name, email: testUser.email.toLowerCase(), passwordHash: "hash", isEmailVerified: true });
    const result = await linkService.getUserLinks({ userId: u._id.toString(), limit: 100 });
    assertEqual(result.pagination.limit, 50);
  });

  // ==========================================
  // LINK UPDATE
  // ==========================================
  console.log("\nLink Update:");

  await test("update destination URL", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://old.com" });
    const updated = await linkService.updateLink({ userId, linkId: link.id, destinationUrl: "https://new.com" });
    assertEqual(updated.destinationUrl, "https://new.com");
  });

  await test("update custom slug", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com", customSlug: "old-slug" });
    const updated = await linkService.updateLink({ userId, linkId: link.id, customSlug: "new-slug" });
    assertEqual(updated.shortCode, "new-slug");
  });

  await test("toggle isActive", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    assertEqual(link.isActive, true);
    const updated = await linkService.updateLink({ userId, linkId: link.id, isActive: false });
    assertEqual(updated.isActive, false);
    const reactivated = await linkService.updateLink({ userId, linkId: link.id, isActive: true });
    assertEqual(reactivated.isActive, true);
  });

  await test("update rejects invalid URL", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    try {
      await linkService.updateLink({ userId, linkId: link.id, destinationUrl: "not-a-url" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("update rejects reserved slug", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    try {
      await linkService.updateLink({ userId, linkId: link.id, customSlug: "api" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw error");
    }
  });

  await test("update rejects duplicate slug", async () => {
    await linkService.createLink({ userId, destinationUrl: "https://example.com", customSlug: "slug-a" });
    const link2 = await linkService.createLink({ userId, destinationUrl: "https://other.com", customSlug: "slug-b" });
    try {
      await linkService.updateLink({ userId, linkId: link2.id, customSlug: "slug-a" });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 409);
    }
  });

  await test("update non-existent link fails", async () => {
    try {
      await linkService.updateLink({ userId, linkId: "507f1f77bcf86cd799439011", destinationUrl: "https://new.com" });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  // ==========================================
  // LINK DELETE
  // ==========================================
  console.log("\nLink Delete:");

  await test("delete removes link", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    await linkService.deleteLink({ userId, linkId: link.id });
    try {
      await linkService.getLinkById({ userId, linkId: link.id });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  await test("delete non-existent link fails", async () => {
    try {
      await linkService.deleteLink({ userId, linkId: "507f1f77bcf86cd799439011" });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  await test("delete does not affect other user's links", async () => {
    const link = await linkService.createLink({ userId, destinationUrl: "https://example.com" });
    try {
      await linkService.deleteLink({ userId: userId2, linkId: link.id });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
    const stillExists = await linkService.getLinkById({ userId, linkId: link.id });
    assert(stillExists, "Link should still exist for owner");
  });

  await teardown();

  // ==========================================
  // RESERVED SLUGS
  // ==========================================
  console.log("\nReserved Slugs:");

  test("api is reserved", () => assert(isReservedSlug("api")));
  test("login is reserved", () => assert(isReservedSlug("login")));
  test("dashboard is reserved", () => assert(isReservedSlug("dashboard")));
  test("admin is reserved", () => assert(isReservedSlug("admin")));
  test("r is reserved", () => assert(isReservedSlug("r")));
  test("bio is reserved", () => assert(isReservedSlug("bio")));
  test("case insensitive", () => assert(isReservedSlug("API")));
  test("non-reserved slug passes", () => assert(!isReservedSlug("mylink123")));

  console.log(`\nResults: ${passed} passed, ${failed} failed, ${skipped} skipped out of ${passed + failed + skipped} tests\n`);
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
