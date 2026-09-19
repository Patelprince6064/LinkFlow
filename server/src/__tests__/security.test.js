import { validateEmail, validatePassword, validateSlug, validateMongoId, validateSafeUrl, sanitizeSearchInput, validateTheme, validateUsername } from "../utils/validation.js";
import { isReservedSlug, RESERVED_SLUGS } from "../utils/reservedSlugs.js";
import { isValidDestinationUrl, isUnsafeUrl } from "../utils/urlValidation.js";

let passed = 0;
let failed = 0;

const test = (name, fn) => {
  try {
    fn();
    console.log("  \u2713 " + name);
    passed++;
  } catch (error) {
    console.log("  \u2717 " + name);
    console.log("    " + error.message);
    failed++;
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

console.log("\nSecurity Tests\n");

console.log("Email Validation:");

test("accepts valid email", () => {
  assert(validateEmail("user@example.com") === true, "Should accept valid email");
});

test("rejects email without @", () => {
  assert(validateEmail("userexample.com") === false, "Should reject email without @");
});

test("rejects empty email", () => {
  assert(validateEmail("") === false, "Should reject empty email");
});

test("rejects null email", () => {
  assert(validateEmail(null) === false, "Should reject null email");
});

test("rejects email over 254 chars", () => {
  assert(validateEmail("a".repeat(250) + "@test.com") === false, "Should reject long email");
});

console.log("\nPassword Validation:");

test("accepts valid password", () => {
  assert(validatePassword("password123") === true, "Should accept valid password");
});

test("rejects short password", () => {
  assert(validatePassword("short") === false, "Should reject short password");
});

test("rejects empty password", () => {
  assert(validatePassword("") === false, "Should reject empty password");
});

test("rejects null password", () => {
  assert(validatePassword(null) === false, "Should reject null password");
});

test("rejects password over 128 chars", () => {
  assert(validatePassword("a".repeat(129)) === false, "Should reject long password");
});

console.log("\nSlug Validation:");

test("accepts valid slug", () => {
  assert(validateSlug("my-link") === true, "Should accept valid slug");
});

test("rejects slug with spaces", () => {
  assert(validateSlug("my link") === false, "Should reject slug with spaces");
});

test("rejects short slug", () => {
  assert(validateSlug("ab") === false, "Should reject slug under 3 chars");
});

test("rejects slug with special chars", () => {
  assert(validateSlug("my@link") === false, "Should reject slug with @");
});

test("rejects path traversal slug", () => {
  assert(validateSlug("../admin") === false, "Should reject path traversal");
});

test("rejects empty slug", () => {
  assert(validateSlug("") === false, "Should reject empty slug");
});

console.log("\nMongoDB ID Validation:");

test("accepts valid ObjectId", () => {
  assert(validateMongoId("507f1f77bcf86cd799439011") === true, "Should accept valid ObjectId");
});

test("rejects invalid ObjectId", () => {
  assert(validateMongoId("not-an-id") === false, "Should reject invalid ObjectId");
});

test("rejects short ID", () => {
  assert(validateMongoId("abc123") === false, "Should reject short ID");
});

test("rejects empty ID", () => {
  assert(validateMongoId("") === false, "Should reject empty ID");
});

console.log("\nURL Validation:");

test("accepts https URL", () => {
  assert(validateSafeUrl("https://example.com") === true, "Should accept https");
});

test("accepts http URL", () => {
  assert(validateSafeUrl("http://example.com") === true, "Should accept http");
});

test("rejects javascript URL", () => {
  assert(validateSafeUrl("javascript:alert(1)") === false, "Should reject javascript:");
});

test("rejects data URL", () => {
  assert(validateSafeUrl("data:text/html,<script>alert(1)</script>") === false, "Should reject data:");
});

test("rejects file URL", () => {
  assert(validateSafeUrl("file:///etc/passwd") === false, "Should reject file:");
});

test("rejects empty URL", () => {
  assert(validateSafeUrl("") === false, "Should reject empty URL");
});

test("rejects null URL", () => {
  assert(validateSafeUrl(null) === false, "Should reject null URL");
});

test("rejects vbscript URL", () => {
  assert(validateSafeUrl("vbscript:MsgBox(1)") === false, "Should reject vbscript:");
});

console.log("\nSearch Sanitization:");

test("sanitizes regex special chars", () => {
  const result = sanitizeSearchInput("test.*+?^${}()|[]");
  assert(result === "test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]", "Should escape regex chars");
});

test("returns null for empty input", () => {
  assert(sanitizeSearchInput("") === null, "Should return null for empty");
});

test("returns null for null input", () => {
  assert(sanitizeSearchInput(null) === null, "Should return null for null");
});

test("returns null for overly long input", () => {
  assert(sanitizeSearchInput("a".repeat(101)) === null, "Should return null for >100 chars");
});

test("passes through normal input", () => {
  assert(sanitizeSearchInput("hello world") === "hello world", "Should pass through normal input");
});

console.log("\nTheme Validation:");

test("accepts Minimal Light", () => {
  assert(validateTheme("Minimal Light") === true, "Should accept Minimal Light");
});

test("accepts Dark Slate", () => {
  assert(validateTheme("Dark Slate") === true, "Should accept Dark Slate");
});

test("accepts Gradient", () => {
  assert(validateTheme("Gradient") === true, "Should accept Gradient");
});

test("rejects invalid theme", () => {
  assert(validateTheme("Neon Pink") === false, "Should reject invalid theme");
});

console.log("\nUsername Validation:");

test("accepts valid username", () => {
  assert(validateUsername("prince") === "prince", "Should accept valid username");
});

test("normalizes to lowercase", () => {
  assert(validateUsername("Prince") === "prince", "Should normalize to lowercase");
});

test("rejects short username", () => {
  assert(validateUsername("ab") === null, "Should reject username under 3 chars");
});

test("rejects username with spaces", () => {
  assert(validateUsername("my name") === null, "Should reject username with spaces");
});

test("rejects username with special chars", () => {
  assert(validateUsername("user@123") === null, "Should reject username with @");
});

console.log("\nReserved Slugs:");

test("api is reserved", () => {
  assert(isReservedSlug("api") === true, "Should reserve api");
});

test("login is reserved", () => {
  assert(isReservedSlug("login") === true, "Should reserve login");
});

test("dashboard is reserved", () => {
  assert(isReservedSlug("dashboard") === true, "Should reserve dashboard");
});

test("case insensitive reservation", () => {
  assert(isReservedSlug("API") === true, "Should be case insensitive");
});

test("non-reserved slug passes", () => {
  assert(isReservedSlug("mylink123") === false, "Should not reserve mylink123");
});

console.log("\nUnsafe URL Detection:");

test("detects javascript URL", () => {
  assert(isUnsafeUrl("javascript:alert(1)") === true, "Should detect javascript:");
});

test("detects data URL", () => {
  assert(isUnsafeUrl("data:text/html") === true, "Should detect data:");
});

test("does not flag safe URL", () => {
  assert(isUnsafeUrl("https://example.com") === false, "Should not flag https");
});

console.log("\nResults: " + passed + " passed, " + failed + " failed out of " + (passed + failed) + " tests\n");
process.exit(failed > 0 ? 1 : 0);
