import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Link from "../models/Link.js";
import ClickEvent from "../models/ClickEvent.js";
import BioProfile from "../models/BioProfile.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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

const runTests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("\nConnected to MongoDB for model validation tests\n");

    await User.deleteMany({});
    await Link.deleteMany({});
    await ClickEvent.deleteMany({});
    await BioProfile.deleteMany({});

    // --- USER MODEL TESTS ---
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

    test("rejects user without email", () => {
      const user = new User({ name: "No Email", passwordHash: "hash" });
      const error = user.validateSync();
      assert(error?.errors?.email, "Should require email");
    });

    test("rejects duplicate email", async () => {
      await User.create({ name: "A", email: "dup@test.com", passwordHash: "h" });
      try {
        await User.create({ name: "B", email: "dup@test.com", passwordHash: "h" });
        assert(false, "Should have thrown duplicate error");
      } catch (err) {
        assert(err.code === 11000, "Should be duplicate key error");
      }
    });

    test("normalizes email to lowercase", () => {
      const user = new User({
        name: "Lower",
        email: "UPPER@TEST.COM",
        passwordHash: "hash",
      });
      assert(user.email === "upper@test.com", "Email should be lowercase");
    });

    test("rejects invalid email format", () => {
      const user = new User({ name: "Bad", email: "notanemail", passwordHash: "h" });
      const error = user.validateSync();
      assert(error?.errors?.email, "Should reject invalid email");
    });

    test("defaults role to user", () => {
      const user = new User({ name: "R", email: "r@t.co", passwordHash: "h" });
      assert(user.role === "user", "Role should default to user");
    });

    // --- LINK MODEL TESTS ---
    console.log("\nLink Model:");

    let testUser;
    test("creates a valid link", async () => {
      testUser = await User.create({
        name: "Link Owner",
        email: "linkowner@test.com",
        passwordHash: "h",
      });
      const link = new Link({
        user: testUser._id,
        destinationUrl: "https://example.com",
        shortCode: "test123",
      });
      const error = link.validateSync();
      assert(!error, "Should not have validation errors");
    });

    test("rejects link without destinationUrl", () => {
      const link = new Link({
        user: testUser._id,
        shortCode: "nourl",
      });
      const error = link.validateSync();
      assert(error?.errors?.destinationUrl, "Should require destinationUrl");
    });

    test("rejects link without shortCode", () => {
      const link = new Link({
        user: testUser._id,
        destinationUrl: "https://example.com",
      });
      const error = link.validateSync();
      assert(error?.errors?.shortCode, "Should require shortCode");
    });

    test("rejects duplicate shortCode", async () => {
      await Link.create({
        user: testUser._id,
        destinationUrl: "https://a.com",
        shortCode: "dup-code",
      });
      try {
        await Link.create({
          user: testUser._id,
          destinationUrl: "https://b.com",
          shortCode: "dup-code",
        });
        assert(false, "Should have thrown duplicate error");
      } catch (err) {
        assert(err.code === 11000, "Should be duplicate key error");
      }
    });

    test("rejects invalid destination URL (ftp://)", () => {
      const link = new Link({
        user: testUser._id,
        destinationUrl: "ftp://files.example.com",
        shortCode: "ftp-link",
      });
      const error = link.validateSync();
      assert(error?.errors?.destinationUrl, "Should reject ftp URLs");
    });

    test("rejects shortCode with spaces", () => {
      const link = new Link({
        user: testUser._id,
        destinationUrl: "https://example.com",
        shortCode: "has space",
      });
      const error = link.validateSync();
      assert(error?.errors?.shortCode, "Should reject shortCode with spaces");
    });

    test("defaults isActive to true", () => {
      const link = new Link({
        user: testUser._id,
        destinationUrl: "https://example.com",
        shortCode: "active-test",
      });
      assert(link.isActive === true, "isActive should default to true");
    });

    // --- CLICK EVENT MODEL TESTS ---
    console.log("\nClickEvent Model:");

    let testLink;
    test("creates a valid click event", async () => {
      testLink = await Link.create({
        user: testUser._id,
        destinationUrl: "https://clicktest.com",
        shortCode: "click1",
      });
      const click = new ClickEvent({
        link: testLink._id,
        deviceType: "Desktop",
        referrer: "https://google.com",
        ipHash: "abc123hash",
      });
      const error = click.validateSync();
      assert(!error, "Should not have validation errors");
    });

    test("defaults timestamp to now", () => {
      const before = Date.now();
      const click = new ClickEvent({
        link: testLink._id,
        deviceType: "Mobile",
      });
      const after = Date.now();
      assert(click.timestamp >= before && click.timestamp <= after, "Timestamp should be now");
    });

    test("rejects invalid deviceType", () => {
      const click = new ClickEvent({
        link: testLink._id,
        deviceType: "SmartTV",
      });
      const error = click.validateSync();
      assert(error?.errors?.deviceType, "Should reject invalid deviceType");
    });

    test("accepts Mobile deviceType", () => {
      const click = new ClickEvent({
        link: testLink._id,
        deviceType: "Mobile",
      });
      const error = click.validateSync();
      assert(!error, "Should accept Mobile");
    });

    test("accepts Tablet deviceType", () => {
      const click = new ClickEvent({
        link: testLink._id,
        deviceType: "Tablet",
      });
      const error = click.validateSync();
      assert(!error, "Should accept Tablet");
    });

    test("accepts Desktop deviceType", () => {
      const click = new ClickEvent({
        link: testLink._id,
        deviceType: "Desktop",
      });
      const error = click.validateSync();
      assert(!error, "Should accept Desktop");
    });

    test("allows null referrer", () => {
      const click = new ClickEvent({
        link: testLink._id,
        deviceType: "Desktop",
        referrer: null,
      });
      const error = click.validateSync();
      assert(!error, "Should allow null referrer");
    });

    // --- BIO PROFILE MODEL TESTS ---
    console.log("\nBioProfile Model:");

    test("creates a valid bio profile", () => {
      const bio = new BioProfile({
        user: testUser._id,
        username: "testbio",
        displayName: "Test Bio",
        theme: "Minimal Light",
      });
      const error = bio.validateSync();
      assert(!error, "Should not have validation errors");
    });

    test("rejects bio without username", () => {
      const bio = new BioProfile({
        user: testUser._id,
        displayName: "No Username",
        theme: "Minimal Light",
      });
      const error = bio.validateSync();
      assert(error?.errors?.username, "Should require username");
    });

    test("rejects bio without displayName", () => {
      const bio = new BioProfile({
        user: testUser._id,
        username: "nodisplay",
        theme: "Minimal Light",
      });
      const error = bio.validateSync();
      assert(error?.errors?.displayName, "Should require displayName");
    });

    test("rejects duplicate username", async () => {
      await BioProfile.create({
        user: testUser._id,
        username: "dupuser",
        displayName: "Dup",
        theme: "Minimal Light",
      });
      const otherUser = await User.create({
        name: "Other",
        email: "other@test.com",
        passwordHash: "h",
      });
      try {
        await BioProfile.create({
          user: otherUser._id,
          username: "dupuser",
          displayName: "Dup2",
          theme: "Minimal Light",
        });
        assert(false, "Should have thrown duplicate error");
      } catch (err) {
        assert(err.code === 11000, "Should be duplicate key error");
      }
    });

    test("rejects invalid theme", () => {
      const bio = new BioProfile({
        user: testUser._id,
        username: "badtheme",
        displayName: "Bad Theme",
        theme: "Neon Pink",
      });
      const error = bio.validateSync();
      assert(error?.errors?.theme, "Should reject invalid theme");
    });

    test("accepts all valid themes", () => {
      const themes = ["Minimal Light", "Dark Slate", "Gradient"];
      themes.forEach((theme) => {
        const bio = new BioProfile({
          user: testUser._id,
          username: `theme-${theme.replace(/\s/g, "")}`,
          displayName: theme,
          theme,
        });
        const error = bio.validateSync();
        assert(!error, `Should accept theme: ${theme}`);
      });
    });

    test("defaults theme to Minimal Light", () => {
      const bio = new BioProfile({
        user: testUser._id,
        username: "defaulttheme",
        displayName: "Default",
      });
      assert(bio.theme === "Minimal Light", "Theme should default to Minimal Light");
    });

    test("validates social link URLs", () => {
      const bio = new BioProfile({
        user: testUser._id,
        username: "socialtest",
        displayName: "Social",
        theme: "Minimal Light",
        socialLinks: [
          { platform: "GitHub", url: "not-a-url", order: 0 },
        ],
      });
      const error = bio.validateSync();
      assert(error, "Should reject invalid social link URL");
    });

    test("accepts valid social links", () => {
      const bio = new BioProfile({
        user: testUser._id,
        username: "validsocial",
        displayName: "Valid Social",
        theme: "Minimal Light",
        socialLinks: [
          { platform: "GitHub", url: "https://github.com/user", order: 0 },
          { platform: "LinkedIn", url: "https://linkedin.com/in/user", order: 1 },
        ],
      });
      const error = bio.validateSync();
      assert(!error, "Should accept valid social links");
    });

    test("limits social links to 10", () => {
      const links = Array.from({ length: 11 }, (_, i) => ({
        platform: `Platform${i}`,
        url: `https://example.com/${i}`,
        order: i,
      }));
      const bio = new BioProfile({
        user: testUser._id,
        username: "toomany",
        displayName: "Too Many",
        theme: "Minimal Light",
        socialLinks: links,
      });
      const error = bio.validateSync();
      assert(error?.errors?.socialLinks, "Should reject more than 10 social links");
    });

    // --- CLEANUP ---
    await User.deleteMany({});
    await Link.deleteMany({});
    await ClickEvent.deleteMany({});
    await BioProfile.deleteMany({});

    console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Test runner failed:", error.message);
    process.exit(1);
  }
};

runTests();
