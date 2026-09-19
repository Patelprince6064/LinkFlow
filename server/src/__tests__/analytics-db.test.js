import { connectTestDB, clearCollections } from "./helpers/testDB.js";
import { testUser } from "./helpers/fixtures.js";
import User from "../models/User.js";
import Link from "../models/Link.js";
import ClickEvent from "../models/ClickEvent.js";
import * as analyticsService from "../services/analytics.service.js";

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
let linkId;
let linkId2;

const setup = async () => {
  await connectTestDB();
  await clearCollections();
  const user = await User.create({ name: testUser.name, email: testUser.email.toLowerCase(), passwordHash: "hash", isEmailVerified: true });
  userId = user._id.toString();

  const link = await Link.create({ user: userId, destinationUrl: "https://example.com", shortCode: "abc123", clickCount: 0, isActive: true });
  linkId = link._id.toString();

  const link2 = await Link.create({ user: userId, destinationUrl: "https://other.com", shortCode: "def456", clickCount: 0, isActive: true });
  linkId2 = link2._id.toString();

  // Create click events
  const now = new Date();
  const clicks = [
    { link: linkId, referrer: "https://google.com", deviceType: "Desktop", ipHash: "hash1", timestamp: new Date(now - 6 * 86400000) },
    { link: linkId, referrer: "https://instagram.com", deviceType: "Mobile", ipHash: "hash2", timestamp: new Date(now - 5 * 86400000) },
    { link: linkId, referrer: "Direct", deviceType: "Desktop", ipHash: "hash3", timestamp: new Date(now - 4 * 86400000) },
    { link: linkId, referrer: "https://google.com", deviceType: "Mobile", ipHash: "hash4", timestamp: new Date(now - 3 * 86400000) },
    { link: linkId, referrer: "Direct", deviceType: "Tablet", ipHash: "hash5", timestamp: new Date(now - 2 * 86400000) },
    { link: linkId, referrer: "https://twitter.com", deviceType: "Desktop", ipHash: "hash6", timestamp: new Date(now - 1 * 86400000) },
    { link: linkId2, referrer: "https://google.com", deviceType: "Mobile", ipHash: "hash7", timestamp: new Date(now - 2 * 86400000) },
  ];
  await ClickEvent.insertMany(clicks);
};

const teardown = async () => { await clearCollections(); };

console.log("\nAnalytics DB Tests (requires MongoDB)\n");

const runTests = async () => {
  await setup();

  const now = new Date();
  const startDate = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
  const endDate = now.toISOString().split("T")[0];

  // ==========================================
  // OVERVIEW
  // ==========================================
  console.log("Overview:");

  await test("returns total clicks", async () => {
    const data = await analyticsService.getOverview({ userId, startDate, endDate });
    assertEqual(data.totalClicks, 7);
  });

  await test("returns total links", async () => {
    const data = await analyticsService.getOverview({ userId, startDate, endDate });
    assertEqual(data.totalLinks, 2);
  });

  await test("returns active links", async () => {
    const data = await analyticsService.getOverview({ userId, startDate, endDate });
    assertEqual(data.activeLinks, 2);
  });

  await test("returns top link", async () => {
    const data = await analyticsService.getOverview({ userId, startDate, endDate });
    assert(data.topLink, "Should have top link");
    assertEqual(data.topLink.clicks, 6);
  });

  await test("user isolation in overview", async () => {
    const otherUser = await User.create({ name: "Other", email: "other@test.com", passwordHash: "hash", isEmailVerified: true });
    const data = await analyticsService.getOverview({ userId: otherUser._id.toString(), startDate, endDate });
    assertEqual(data.totalClicks, 0);
    assertEqual(data.totalLinks, 0);
  });

  await test("overview with no links returns zero", async () => {
    await clearCollections();
    const u = await User.create({ name: "Empty", email: "empty@test.com", passwordHash: "hash", isEmailVerified: true });
    const data = await analyticsService.getOverview({ userId: u._id.toString(), startDate, endDate });
    assertEqual(data.totalClicks, 0);
    assertEqual(data.totalLinks, 0);
  });

  // ==========================================
  // CLICKS OVER TIME
  // ==========================================
  console.log("\nClicks Over Time:");

  await test("returns daily click data", async () => {
    const data = await analyticsService.getClicksOverTime({ userId, startDate, endDate });
    assert(Array.isArray(data), "Should return array");
    assert(data.length > 0, "Should have data points");
    assert(data[0].date, "Each point should have date");
    assert(typeof data[0].clicks === "number", "Each point should have clicks count");
  });

  await test("zero-fills missing days", async () => {
    const data = await analyticsService.getClicksOverTime({ userId, startDate, endDate });
    const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
    assertEqual(totalClicks, 7, "Total clicks across all days should match");
  });

  await test("user isolation in clicks over time", async () => {
    const otherUser = await User.create({ name: "Other", email: "other2@test.com", passwordHash: "hash", isEmailVerified: true });
    const data = await analyticsService.getClicksOverTime({ userId: otherUser._id.toString(), startDate, endDate });
    const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
    assertEqual(totalClicks, 0);
  });

  // ==========================================
  // REFERRERS
  // ==========================================
  console.log("\nReferrers:");

  await test("returns referrer data", async () => {
    const data = await analyticsService.getTopReferrers({ userId, startDate, endDate });
    assert(Array.isArray(data), "Should return array");
    assert(data.length > 0, "Should have referrers");
  });

  await test("groups Direct referrer", async () => {
    const data = await analyticsService.getTopReferrers({ userId, startDate, endDate });
    const direct = data.find((r) => r.referrer === "Direct");
    assert(direct, "Should have Direct referrer");
    assertEqual(direct.clicks, 2);
  });

  await test("groups google.com referrer", async () => {
    const data = await analyticsService.getTopReferrers({ userId, startDate, endDate });
    const google = data.find((r) => r.referrer === "https://google.com");
    assert(google, "Should have google referrer");
    assertEqual(google.clicks, 2);
  });

  await test("sorted by clicks descending", async () => {
    const data = await analyticsService.getTopReferrers({ userId, startDate, endDate });
    for (let i = 1; i < data.length; i++) {
      assert(data[i - 1].clicks >= data[i].clicks, "Should be sorted descending");
    }
  });

  await test("user isolation in referrers", async () => {
    const otherUser = await User.create({ name: "Other", email: "other3@test.com", passwordHash: "hash", isEmailVerified: true });
    const data = await analyticsService.getTopReferrers({ userId: otherUser._id.toString(), startDate, endDate });
    assertEqual(data.length, 0);
  });

  // ==========================================
  // DEVICE DISTRIBUTION
  // ==========================================
  console.log("\nDevice Distribution:");

  await test("returns all three device types", async () => {
    const data = await analyticsService.getDeviceDistribution({ userId, startDate, endDate });
    assertEqual(data.length, 3);
    const types = data.map((d) => d.deviceType);
    assert(types.includes("Desktop"), "Should include Desktop");
    assert(types.includes("Mobile"), "Should include Mobile");
    assert(types.includes("Tablet"), "Should include Tablet");
  });

  await test("click counts are correct", async () => {
    const data = await analyticsService.getDeviceDistribution({ userId, startDate, endDate });
    const desktop = data.find((d) => d.deviceType === "Desktop");
    const mobile = data.find((d) => d.deviceType === "Mobile");
    const tablet = data.find((d) => d.deviceType === "Tablet");
    assertEqual(desktop.clicks, 3);
    assertEqual(mobile.clicks, 3);
    assertEqual(tablet.clicks, 1);
  });

  await test("percentages add up to 100", async () => {
    const data = await analyticsService.getDeviceDistribution({ userId, startDate, endDate });
    const total = data.reduce((sum, d) => sum + d.percentage, 0);
    assertEqual(total, 100);
  });

  await test("empty state returns zero for all", async () => {
    const otherUser = await User.create({ name: "Other", email: "other4@test.com", passwordHash: "hash", isEmailVerified: true });
    const data = await analyticsService.getDeviceDistribution({ userId: otherUser._id.toString(), startDate, endDate });
    assertEqual(data.length, 3);
    data.forEach((d) => assertEqual(d.clicks, 0));
  });

  // ==========================================
  // PER-LINK ANALYTICS
  // ==========================================
  console.log("\nPer-Link Analytics:");

  await test("returns link analytics", async () => {
    const data = await analyticsService.getLinkAnalytics({ userId, linkId, startDate, endDate });
    assert(data.link, "Should have link info");
    assertEqual(data.link.shortCode, "abc123");
    assertEqual(data.totalClicks, 6);
  });

  await test("returns clicks over time for link", async () => {
    const data = await analyticsService.getLinkAnalytics({ userId, linkId, startDate, endDate });
    assert(Array.isArray(data.clicksOverTime), "Should have clicksOverTime");
  });

  await test("returns referrers for link", async () => {
    const data = await analyticsService.getLinkAnalytics({ userId, linkId, startDate, endDate });
    assert(Array.isArray(data.referrers), "Should have referrers");
  });

  await test("returns devices for link", async () => {
    const data = await analyticsService.getLinkAnalytics({ userId, linkId, startDate, endDate });
    assertEqual(data.devices.length, 3);
  });

  await test("non-owner cannot access link analytics", async () => {
    const otherUser = await User.create({ name: "Other", email: "other5@test.com", passwordHash: "hash", isEmailVerified: true });
    try {
      await analyticsService.getLinkAnalytics({ userId: otherUser._id.toString(), linkId, startDate, endDate });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  await test("non-existent link fails", async () => {
    try {
      await analyticsService.getLinkAnalytics({ userId, linkId: "507f1f77bcf86cd799439011", startDate, endDate });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  await teardown();

  // ==========================================
  // CLICK EVENT MODEL TESTS
  // ==========================================
  console.log("\nClickEvent Model:");

  await test("ClickEvent has link+timestamp index", async () => {
    await connectTestDB();
    const indexes = await ClickEvent.schema.indexes();
    const hasLinkTimestamp = indexes.some(([spec]) => spec.link === 1 && spec.timestamp === -1);
    assert(hasLinkTimestamp, "Should have link+timestamp index");
  });

  await test("ClickEvent has timestamp index", async () => {
    const indexes = await ClickEvent.schema.indexes();
    const hasTimestamp = indexes.some(([spec]) => spec.timestamp === -1 && !spec.link);
    assert(hasTimestamp, "Should have timestamp index");
  });

  // ==========================================
  // LINK MODEL INDEXES
  // ==========================================
  console.log("\nLink Model Indexes:");

  await test("Link has user+createdAt index", async () => {
    await connectTestDB();
    const indexes = await Link.schema.indexes();
    const hasUserCreated = indexes.some(([spec]) => spec.user === 1 && spec["createdAt"] === -1);
    assert(hasUserCreated, "Should have user+createdAt index");
  });

  await test("Link has unique shortCode", async () => {
    const indexes = await Link.schema.indexes();
    const hasShortCodeUnique = indexes.some(([spec]) => spec.shortCode === 1);
    assert(hasShortCodeUnique, "Should have shortCode index");
  });

  // ==========================================
  // USER MODEL INDEXES
  // ==========================================
  console.log("\nUser Model Indexes:");

  await test("User has unique email", async () => {
    await connectTestDB();
    const indexes = await User.schema.indexes();
    const hasEmailUnique = indexes.some(([spec]) => spec.email === 1);
    assert(hasEmailUnique, "Should have email index");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
