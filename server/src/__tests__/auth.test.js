import jwt from "jsonwebtoken";
import { connectTestDB, disconnectTestDB, clearCollections } from "./helpers/testDB.js";
import { testUser, testUser2, generateAccessToken, generateExpiredToken } from "./helpers/fixtures.js";
import User from "../models/User.js";
import * as authService from "../services/auth.service.js";

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
const assertIncludes = (arr, val, msg) => { if (!arr.includes(val)) throw new Error(`${msg}: expected array to include ${val}`); };

const setup = async () => {
  await connectTestDB();
  await clearCollections();
};

const teardown = async () => {
  await clearCollections();
};

console.log("\nAuthentication Tests (requires MongoDB)\n");

const runTests = async () => {
  await setup();

  // ==========================================
  // REGISTER TESTS
  // ==========================================
  console.log("Register:");

  await test("valid registration creates user", async () => {
    const result = await authService.registerUser(testUser);
    assert(result.user, "Should return user");
    assertEqual(result.user.email, testUser.email.toLowerCase());
    assert(result.user.id, "Should have id");
    assert(result.verificationToken, "Should return verification token");
    const dbUser = await User.findById(result.user.id).select("+passwordHash");
    assert(dbUser, "User should exist in database");
    assert(dbUser.passwordHash, "Password should be hashed");
    assert(dbUser.passwordHash !== testUser.password, "Password should not be stored in plaintext");
  });

  await test("registration normalizes email to lowercase", async () => {
    await clearCollections();
    const result = await authService.registerUser({ ...testUser, email: "UPPER@EXAMPLE.COM" });
    assertEqual(result.user.email, "upper@example.com");
  });

  await test("registration rejects invalid email", async () => {
    await clearCollections();
    try {
      await authService.registerUser({ ...testUser, email: "not-an-email" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode === 400 || e.isOperational, `Expected operational error, got: ${e.message}`);
    }
  });

  await test("registration rejects empty email", async () => {
    await clearCollections();
    try {
      await authService.registerUser({ ...testUser, email: "" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw operational error");
    }
  });

  await test("registration rejects weak password", async () => {
    await clearCollections();
    try {
      await authService.registerUser({ ...testUser, password: "short" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw operational error");
    }
  });

  await test("registration rejects empty password", async () => {
    await clearCollections();
    try {
      await authService.registerUser({ ...testUser, password: "" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw operational error");
    }
  });

  await test("registration rejects duplicate email", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    try {
      await authService.registerUser(testUser);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 409);
    }
  });

  await test("password is never returned in safeUser", async () => {
    await clearCollections();
    const result = await authService.registerUser(testUser);
    const keys = Object.keys(result.user);
    assert(!keys.includes("password"), "Should not include password");
    assert(!keys.includes("passwordHash"), "Should not include passwordHash");
  });

  await test("missing fields cause error", async () => {
    await clearCollections();
    try {
      await authService.registerUser({ name: "", email: "", password: "" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw operational error");
    }
  });

  // ==========================================
  // VERIFY EMAIL TESTS
  // ==========================================
  console.log("\nVerify Email:");

  await test("valid verification token verifies email", async () => {
    await clearCollections();
    const { verificationToken } = await authService.registerUser(testUser);
    assert(verificationToken, "Should have verification token");
    const result = await authService.verifyEmail(verificationToken);
    assert(result.user, "Should return user");
    const dbUser = await User.findById(result.user.id);
    assertEqual(dbUser.isEmailVerified, true);
  });

  await test("invalid token is rejected", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    try {
      await authService.verifyEmail("invalid-token-12345");
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 400);
    }
  });

  await test("expired token is rejected", async () => {
    await clearCollections();
    const user = await User.create({
      name: testUser.name,
      email: testUser.email.toLowerCase(),
      passwordHash: "dummyhash",
      emailVerificationTokenHash: "dummyhash",
      emailVerificationExpires: new Date(Date.now() - 10000), // expired
    });
    try {
      await authService.verifyEmail("some-token");
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 400);
    }
  });

  await test("already verified account rejects duplicate verification", async () => {
    await clearCollections();
    const { verificationToken } = await authService.registerUser(testUser);
    await authService.verifyEmail(verificationToken);
    // Token is cleared after first use, so second attempt should fail
    try {
      await authService.verifyEmail(verificationToken);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 400);
    }
  });

  // ==========================================
  // LOGIN TESTS
  // ==========================================
  console.log("\nLogin:");

  await test("valid credentials return user and set cookies", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    await authService.verifyEmail((await User.findOne({ email: testUser.email.toLowerCase() }))._id.toString());

    // Need to manually verify since we don't have the token hash
    // Let's directly set isEmailVerified
    await User.findOneAndUpdate({ email: testUser.email.toLowerCase() }, { isEmailVerified: true });

    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    const result = await authService.loginUser(testUser, mockRes);
    assert(result.user, "Should return user");
    assertEqual(result.user.email, testUser.email.toLowerCase());
  });

  await test("wrong password is rejected", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    await User.findOneAndUpdate({ email: testUser.email.toLowerCase() }, { isEmailVerified: true });

    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    try {
      await authService.loginUser({ email: testUser.email, password: "wrongpassword" }, mockRes);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 401);
    }
  });

  await test("unknown email is rejected", async () => {
    await clearCollections();
    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    try {
      await authService.loginUser({ email: "nonexistent@example.com", password: "password123" }, mockRes);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 401);
    }
  });

  await test("unverified email is rejected", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    // User is NOT verified
    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    try {
      await authService.loginUser(testUser, mockRes);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 403);
    }
  });

  await test("login with empty credentials is rejected", async () => {
    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    try {
      await authService.loginUser({ email: "", password: "" }, mockRes);
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw operational error");
    }
  });

  // ==========================================
  // REFRESH TESTS
  // ==========================================
  console.log("\nRefresh:");

  await test("valid refresh token rotates tokens", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    await User.findOneAndUpdate({ email: testUser.email.toLowerCase() }, { isEmailVerified: true });

    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    await authService.loginUser(testUser, mockRes);

    const dbUser = await User.findOne({ email: testUser.email.toLowerCase() }).select("+refreshTokenHash");
    const { generateRefreshToken } = await import("../utils/jwt.js");
    const refreshToken = generateRefreshToken(dbUser, "test-jti");

    const result = await authService.refreshSession(refreshToken, mockRes);
    assert(result.user, "Should return user");
  });

  await test("expired refresh token is rejected", async () => {
    const { generateRefreshToken } = await import("../utils/jwt.js");
    const fakeUser = { _id: { toString: () => "507f1f77bcf86cd799439011" }, role: "user" };
    const expiredToken = jwt.sign(
      { sub: "507f1f77bcf86cd799439011", type: "refresh", jti: "test" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "0s" }
    );

    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    try {
      await authService.refreshSession(expiredToken, mockRes);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 401);
    }
  });

  await test("invalid refresh token is rejected", async () => {
    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    try {
      await authService.refreshSession("completely-invalid-token", mockRes);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 401);
    }
  });

  await test("refresh with no token is rejected", async () => {
    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    try {
      await authService.refreshSession(null, mockRes);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 401);
    }
  });

  await test("rotated refresh token cannot be reused", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    await User.findOneAndUpdate({ email: testUser.email.toLowerCase() }, { isEmailVerified: true });

    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    await authService.loginUser(testUser, mockRes);

    const dbUser = await User.findOne({ email: testUser.email.toLowerCase() }).select("+refreshTokenHash");
    const { generateRefreshToken } = await import("../utils/jwt.js");
    const oldRefreshToken = generateRefreshToken(dbUser, "test-jti-old");

    // First refresh should succeed
    await authService.refreshSession(oldRefreshToken, mockRes);

    // Second refresh with same token should fail (token was rotated)
    try {
      await authService.refreshSession(oldRefreshToken, mockRes);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 401);
    }
  });

  // ==========================================
  // LOGOUT TESTS
  // ==========================================
  console.log("\nLogout:");

  await test("logout invalidates session", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    await User.findOneAndUpdate({ email: testUser.email.toLowerCase() }, { isEmailVerified: true });

    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    await authService.loginUser(testUser, mockRes);

    const dbUser = await User.findOne({ email: testUser.email.toLowerCase() }).select("+refreshTokenHash");
    assert(dbUser.refreshTokenHash, "Should have refresh token hash");

    await authService.logoutUser(dbUser._id.toString(), mockRes);

    const updatedUser = await User.findById(dbUser._id).select("+refreshTokenHash");
    assert(!updatedUser.refreshTokenHash, "Refresh token hash should be cleared");
  });

  await test("logout with null userId clears cookies", async () => {
    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    const result = await authService.logoutUser(null, mockRes);
    assertEqual(result, true);
  });

  // ==========================================
  // FORGOT PASSWORD TESTS
  // ==========================================
  console.log("\nForgot Password:");

  await test("forgot password with valid email returns generic message", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    const result = await authService.requestPasswordReset(testUser.email);
    assert(result.message, "Should return message");
    assert(result.message.includes("If an account exists"), "Should return generic message");
  });

  await test("forgot password with unknown email returns same message", async () => {
    await clearCollections();
    const result = await authService.requestPasswordReset("nonexistent@example.com");
    assert(result.message, "Should return message");
    assert(result.message.includes("If an account exists"), "Should return generic message");
  });

  await test("forgot password prevents account enumeration", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    const result1 = await authService.requestPasswordReset(testUser.email);
    const result2 = await authService.requestPasswordReset("other@example.com");
    assertEqual(result1.message, result2.message, "Messages should be identical");
  });

  // ==========================================
  // RESET PASSWORD TESTS
  // ==========================================
  console.log("\nReset Password:");

  await test("reset password with valid token works", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    await User.findOneAndUpdate({ email: testUser.email.toLowerCase() }, { isEmailVerified: true });

    const { message } = await authService.requestPasswordReset(testUser.email);

    // Get the raw token from the database (it's hashed, so we need to find it differently)
    // Actually, let's generate a token directly for testing
    const { generateSecureToken, hashToken } = await import("../utils/token.js");
    const resetToken = generateSecureToken();
    const tokenHash = await hashToken(resetToken);

    await User.findOneAndUpdate(
      { email: testUser.email.toLowerCase() },
      { passwordResetTokenHash: tokenHash, passwordResetExpires: new Date(Date.now() + 3600000) }
    );

    const result = await authService.resetPassword({ token: resetToken, password: "newpassword123" });
    assertEqual(result, true);

    // Old password should not work
    const mockRes = { cookie: () => {}, clearCookie: () => {} };
    try {
      await authService.loginUser({ email: testUser.email, password: testUser.password }, mockRes);
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 401, "Old password should be rejected");
    }
  });

  await test("reset password with invalid token fails", async () => {
    await clearCollections();
    try {
      await authService.resetPassword({ token: "invalid-token", password: "newpassword123" });
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 400);
    }
  });

  await test("reset password clears refresh tokens", async () => {
    await clearCollections();
    await authService.registerUser(testUser);
    await User.findOneAndUpdate({ email: testUser.email.toLowerCase() }, { isEmailVerified: true });

    const { generateSecureToken, hashToken } = await import("../utils/token.js");
    const resetToken = generateSecureToken();
    const tokenHash = await hashToken(resetToken);

    await User.findOneAndUpdate(
      { email: testUser.email.toLowerCase() },
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: new Date(Date.now() + 3600000),
        refreshTokenHash: "some-old-hash",
      }
    );

    await authService.resetPassword({ token: resetToken, password: "newpassword123" });

    const user = await User.findById((await User.findOne({ email: testUser.email.toLowerCase() }))._id).select("+refreshTokenHash");
    assert(!user.refreshTokenHash, "Refresh token hash should be cleared");
  });

  await test("reset password with weak password fails", async () => {
    await clearCollections();
    const { generateSecureToken, hashToken } = await import("../utils/token.js");
    const resetToken = generateSecureToken();
    const tokenHash = await hashToken(resetToken);

    const user = await User.create({
      name: testUser.name,
      email: testUser.email.toLowerCase(),
      passwordHash: "dummyhash",
      isEmailVerified: true,
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: new Date(Date.now() + 3600000),
    });

    try {
      await authService.resetPassword({ token: resetToken, password: "short" });
      throw new Error("Should have thrown");
    } catch (e) {
      assert(e.statusCode || e.isOperational, "Should throw operational error");
    }
  });

  // ==========================================
  // GET CURRENT USER TESTS
  // ==========================================
  console.log("\nGet Current User:");

  await test("get current user returns user data", async () => {
    await clearCollections();
    const { user } = await authService.registerUser(testUser);
    const result = await authService.getCurrentUser(user.id);
    assert(result, "Should return user");
    assertEqual(result.email, testUser.email.toLowerCase());
  });

  await test("get current user with invalid ID fails", async () => {
    await clearCollections();
    try {
      await authService.getCurrentUser("507f1f77bcf86cd799439011");
      throw new Error("Should have thrown");
    } catch (e) {
      assertEqual(e.statusCode, 404);
    }
  });

  await teardown();

  // ==========================================
  // COOKIE SECURITY TESTS
  // ==========================================
  console.log("\nCookie Security:");

  await test("access token cookie has httpOnly flag", async () => {
    const { accessTokenOptions } = await import("../utils/cookie.js");
    assertEqual(accessTokenOptions.httpOnly, true, "httpOnly should be true");
  });

  await test("refresh token cookie has httpOnly flag", async () => {
    const { refreshTokenOptions } = await import("../utils/cookie.js");
    assertEqual(refreshTokenOptions.httpOnly, true, "httpOnly should be true");
  });

  await test("access token cookie path is /", async () => {
    const { accessTokenOptions } = await import("../utils/cookie.js");
    assertEqual(accessTokenOptions.path, "/", "Path should be /");
  });

  await test("access token cookie maxAge is 15 minutes", async () => {
    const { accessTokenOptions } = await import("../utils/cookie.js");
    assertEqual(accessTokenOptions.maxAge, 15 * 60 * 1000, "maxAge should be 15 minutes");
  });

  await test("refresh token cookie maxAge is 7 days", async () => {
    const { refreshTokenOptions } = await import("../utils/cookie.js");
    assertEqual(refreshTokenOptions.maxAge, 7 * 24 * 60 * 60 * 1000, "maxAge should be 7 days");
  });

  // ==========================================
  // JWT TOKEN TESTS
  // ==========================================
  console.log("\nJWT Tokens:");

  await test("access token contains correct fields", async () => {
    const { generateAccessToken } = await import("../utils/jwt.js");
    const mockUser = { _id: { toString: () => "507f1f77bcf86cd799439011" }, role: "user" };
    const token = generateAccessToken(mockUser);
    const decoded = jwt.decode(token);
    assertEqual(decoded.sub, "507f1f77bcf86cd799439011");
    assertEqual(decoded.type, "access");
    assertEqual(decoded.role, "user");
  });

  await test("refresh token contains correct fields", async () => {
    const { generateRefreshToken } = await import("../utils/jwt.js");
    const mockUser = { _id: { toString: () => "507f1f77bcf86cd799439011" }, role: "user" };
    const token = generateRefreshToken(mockUser, "test-uuid");
    const decoded = jwt.decode(token);
    assertEqual(decoded.sub, "507f1f77bcf86cd799439011");
    assertEqual(decoded.type, "refresh");
    assertEqual(decoded.jti, "test-uuid");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed, ${skipped} skipped out of ${passed + failed + skipped} tests\n`);
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
