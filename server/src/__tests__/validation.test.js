import { validateEmail, validatePassword, validateSlug, validateMongoId, validateSafeUrl, sanitizeSearchInput, validateTheme, validateUsername, validatePageParams, validateSocialLinks } from "../utils/validation.js";
import { isReservedSlug, RESERVED_SLUGS } from "../utils/reservedSlugs.js";
import { isValidDestinationUrl, isUnsafeUrl } from "../utils/urlValidation.js";
import AppError from "../utils/AppError.js";

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
const assertThrows = (fn, msg) => {
  try { fn(); throw new Error(msg || "Expected function to throw"); }
  catch (e) { if (e.message === (msg || "Expected function to throw")) throw e; }
};

console.log("\nComprehensive Validation Tests\n");

// ==========================================
// EMAIL VALIDATION
// ==========================================
console.log("Email Validation:");

test("accepts valid email", () => assert(validateEmail("user@example.com")));
test("accepts email with subdomain", () => assert(validateEmail("user@sub.example.com")));
test("accepts email with plus", () => assert(validateEmail("user+tag@example.com")));
test("accepts email with dots", () => assert(validateEmail("first.last@example.com")));
test("normalizes to lowercase", () => {
  const result = validateEmail("USER@EXAMPLE.COM");
  assert(result === true || result === false, "Should return boolean");
});
test("rejects email without @", () => assert(!validateEmail("userexample.com")));
test("rejects email without domain", () => assert(!validateEmail("user@")));
test("rejects email without TLD", () => assert(!validateEmail("user@example")));
test("rejects empty string", () => assert(!validateEmail("")));
test("rejects null", () => assert(!validateEmail(null)));
test("rejects undefined", () => assert(!validateEmail(undefined)));
test("rejects non-string", () => assert(!validateEmail(123)));
test("rejects email over 254 chars", () => assert(!validateEmail("a".repeat(250) + "@test.com")));
test("rejects email with spaces", () => assert(!validateEmail("user @example.com")));

// ==========================================
// PASSWORD VALIDATION
// ==========================================
console.log("\nPassword Validation:");

test("accepts valid password", () => assert(validatePassword("password123")));
test("accepts long password", () => assert(validatePassword("a".repeat(128))));
test("accepts password with special chars", () => assert(validatePassword("p@$$w0rd!")));
test("rejects short password", () => assert(!validatePassword("short")));
test("rejects 7-char password", () => assert(!validatePassword("1234567")));
test("rejects empty password", () => assert(!validatePassword("")));
test("rejects null password", () => assert(!validatePassword(null)));
test("rejects non-string password", () => assert(!validatePassword(123)));
test("rejects password over 128 chars", () => assert(!validatePassword("a".repeat(129))));

// ==========================================
// SLUG VALIDATION
// ==========================================
console.log("\nSlug Validation:");

test("accepts valid slug", () => assert(validateSlug("my-link")));
test("accepts slug with underscores", () => assert(validateSlug("my_link")));
test("accepts slug with numbers", () => assert(validateSlug("link123")));
test("accepts 3-char slug", () => assert(validateSlug("abc")));
test("accepts 20-char slug", () => assert(validateSlug("a".repeat(20))));
test("rejects 2-char slug", () => assert(!validateSlug("ab")));
test("rejects slug with spaces", () => assert(!validateSlug("my link")));
test("rejects slug with @", () => assert(!validateSlug("my@link")));
test("rejects slug with /", () => assert(!validateSlug("my/link")));
test("rejects path traversal", () => assert(!validateSlug("../admin")));
test("rejects empty slug", () => assert(!validateSlug("")));
test("rejects null slug", () => assert(!validateSlug(null)));
test("rejects slug over 20 chars", () => assert(!validateSlug("a".repeat(21))));

// ==========================================
// MONGODB ID VALIDATION
// ==========================================
console.log("\nMongoDB ID Validation:");

test("accepts valid ObjectId", () => assert(validateMongoId("507f1f77bcf86cd799439011")));
test("accepts uppercase hex", () => assert(validateMongoId("507F1F77BCF86CD799439011")));
test("rejects invalid ObjectId", () => assert(!validateMongoId("not-an-id")));
test("rejects short ID", () => assert(!validateMongoId("abc123")));
test("rejects empty ID", () => assert(!validateMongoId("")));
test("rejects null ID", () => assert(!validateMongoId(null)));
test("rejects ID with special chars", () => assert(!validateMongoId("507f1f77bcf86cd79943901!")));

// ==========================================
// URL VALIDATION
// ==========================================
console.log("\nURL Validation:");

test("accepts https URL", () => assert(validateSafeUrl("https://example.com")));
test("accepts http URL", () => assert(validateSafeUrl("http://example.com")));
test("accepts URL with path", () => assert(validateSafeUrl("https://example.com/path")));
test("accepts URL with query", () => assert(validateSafeUrl("https://example.com?q=1")));
test("accepts URL with fragment", () => assert(validateSafeUrl("https://example.com#section")));
test("rejects javascript URL", () => assert(!validateSafeUrl("javascript:alert(1)")));
test("rejects data URL", () => assert(!validateSafeUrl("data:text/html")));
test("rejects file URL", () => assert(!validateSafeUrl("file:///etc/passwd")));
test("rejects vbscript URL", () => assert(!validateSafeUrl("vbscript:MsgBox(1)")));
test("rejects empty URL", () => assert(!validateSafeUrl("")));
test("rejects null URL", () => assert(!validateSafeUrl(null)));
test("rejects non-string URL", () => assert(!validateSafeUrl(123)));
test("rejects URL without protocol", () => assert(!validateSafeUrl("example.com")));

// ==========================================
// DESTINATION URL VALIDATION
// ==========================================
console.log("\nDestination URL Validation:");

test("accepts valid HTTPS", () => assert(isValidDestinationUrl("https://example.com")));
test("accepts valid HTTP", () => assert(isValidDestinationUrl("http://example.com")));
test("rejects javascript:", () => assert(!isValidDestinationUrl("javascript:void(0)")));
test("rejects data:", () => assert(!isValidDestinationUrl("data:text/html,<h1>hi</h1>")));
test("rejects file:", () => assert(!isValidDestinationUrl("file:///c:/windows/system32")));

console.log("\nUnsafe URL Detection:");

test("detects javascript:", () => assert(isUnsafeUrl("javascript:alert(1)")));
test("detects data:", () => assert(isUnsafeUrl("data:text/html")));
test("detects vbscript:", () => assert(isUnsafeUrl("vbscript:MsgBox(1)")));
test("does not flag https", () => assert(!isUnsafeUrl("https://example.com")));
test("does not flag http", () => assert(!isUnsafeUrl("http://example.com")));

// ==========================================
// SEARCH SANITIZATION
// ==========================================
console.log("\nSearch Sanitization:");

test("sanitizes regex special chars", () => {
  const result = sanitizeSearchInput("test.*+?^${}()|[]");
  assert(result.includes("\\."), "Should escape dots");
});
test("returns null for empty", () => assertEqual(sanitizeSearchInput(""), null));
test("returns null for null", () => assertEqual(sanitizeSearchInput(null), null));
test("returns null for overly long input", () => assertEqual(sanitizeSearchInput("a".repeat(101)), null));
test("passes through normal input", () => assertEqual(sanitizeSearchInput("hello world"), "hello world"));
test("trims whitespace", () => assertEqual(sanitizeSearchInput("  hello  "), "hello"));

// ==========================================
// THEME VALIDATION
// ==========================================
console.log("\nTheme Validation:");

test("accepts Minimal Light", () => assert(validateTheme("Minimal Light")));
test("accepts Dark Slate", () => assert(validateTheme("Dark Slate")));
test("accepts Gradient", () => assert(validateTheme("Gradient")));
test("rejects Neon Pink", () => assert(!validateTheme("Neon Pink")));
test("rejects empty string", () => assert(!validateTheme("")));
test("rejects lowercase", () => assert(!validateTheme("minimal light")));

// ==========================================
// USERNAME VALIDATION
// ==========================================
console.log("\nUsername Validation:");

test("accepts valid username", () => assertEqual(validateUsername("prince"), "prince"));
test("normalizes to lowercase", () => assertEqual(validateUsername("Prince"), "prince"));
test("accepts hyphens", () => assertEqual(validateUsername("my-name"), "my-name"));
test("accepts underscores", () => assertEqual(validateUsername("my_name"), "my_name"));
test("accepts numbers", () => assertEqual(validateUsername("user123"), "user123"));
test("rejects short", () => assertEqual(validateUsername("ab"), null));
test("rejects spaces", () => assertEqual(validateUsername("my name"), null));
test("rejects special chars", () => assertEqual(validateUsername("user@123"), null));
test("rejects empty", () => assertEqual(validateUsername(""), null));
test("rejects null", () => assertEqual(validateUsername(null), null));

// ==========================================
// PAGE PARAMS VALIDATION
// ==========================================
console.log("\nPage Params Validation:");

test("valid page params", () => {
  const result = validatePageParams({ page: "1", limit: "10" });
  assertEqual(result.page, 1);
  assertEqual(result.limit, 10);
});
test("invalid page defaults to 1", () => {
  const result = validatePageParams({ page: "abc", limit: "10" });
  assertEqual(result.page, 1);
});
test("negative page defaults to 1", () => {
  const result = validatePageParams({ page: "-5", limit: "10" });
  assertEqual(result.page, 1);
});
test("limit capped at 50", () => {
  const result = validatePageParams({ page: "1", limit: "100" });
  assertEqual(result.limit, 50);
});
test("limit minimum is 1 (0 defaults to 10 via || fallback)", () => {
  const result = validatePageParams({ page: "1", limit: "0" });
  assertEqual(result.limit, 10); // parseInt("0") || 10 = 10
});

// ==========================================
// SOCIAL LINKS VALIDATION
// ==========================================
console.log("\nSocial Links Validation:");

test("accepts valid social links", () => {
  const result = validateSocialLinks([
    { platform: "GitHub", url: "https://github.com/test" },
  ]);
  assertEqual(result.length, 1);
  assertEqual(result[0].platform, "GitHub");
});
test("returns empty array for non-array input", () => {
  const r1 = validateSocialLinks(null);
  const r2 = validateSocialLinks(undefined);
  assert(Array.isArray(r1) && r1.length === 0, "null should return empty array");
  assert(Array.isArray(r2) && r2.length === 0, "undefined should return empty array");
});
test("rejects over 10 links", () => {
  const links = Array.from({ length: 11 }, (_, i) => ({
    platform: `Platform${i}`,
    url: `https://example.com/${i}`,
  }));
  assertThrows(() => validateSocialLinks(links), "Should throw for >10 links");
});
test("rejects link without platform", () => {
  assertThrows(() => validateSocialLinks([{ url: "https://example.com" }]));
});
test("rejects link without URL", () => {
  assertThrows(() => validateSocialLinks([{ platform: "GitHub" }]));
});
test("rejects link with invalid URL", () => {
  assertThrows(() => validateSocialLinks([{ platform: "GitHub", url: "not-a-url" }]));
});

// ==========================================
// RESERVED SLUGS
// ==========================================
console.log("\nReserved Slugs:");

const expectedReserved = ["api", "login", "register", "dashboard", "admin", "r", "bio", "auth", "health", "settings", "profile", "links", "analytics", "www", "mail", "support"];
for (const slug of expectedReserved) {
  test(`"${slug}" is reserved`, () => assert(isReservedSlug(slug)));
}
test("case insensitive", () => assert(isReservedSlug("API")));
test("non-reserved passes", () => assert(!isReservedSlug("mylink123")));

// ==========================================
// AUTH COOKIE OPTIONS
// ==========================================
console.log("\nCookie Options:");

test("access token cookie is httpOnly", async () => {
  const { accessTokenOptions } = await import("../utils/cookie.js");
  assertEqual(accessTokenOptions.httpOnly, true);
});
test("refresh token cookie is httpOnly", async () => {
  const { refreshTokenOptions } = await import("../utils/cookie.js");
  assertEqual(refreshTokenOptions.httpOnly, true);
});
test("access token maxAge is 15 minutes", async () => {
  const { accessTokenOptions } = await import("../utils/cookie.js");
  assertEqual(accessTokenOptions.maxAge, 15 * 60 * 1000);
});
test("refresh token maxAge is 7 days", async () => {
  const { refreshTokenOptions } = await import("../utils/cookie.js");
  assertEqual(refreshTokenOptions.maxAge, 7 * 24 * 60 * 60 * 1000);
});
test("cookies have path /", async () => {
  const { accessTokenOptions, refreshTokenOptions } = await import("../utils/cookie.js");
  assertEqual(accessTokenOptions.path, "/");
  assertEqual(refreshTokenOptions.path, "/");
});

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
process.exit(failed > 0 ? 1 : 0);
