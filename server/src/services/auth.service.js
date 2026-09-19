import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { generateSecureToken, hashToken, compareTokenHash, hashPassword, comparePassword } from "../utils/token.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { setAccessCookie, setRefreshCookie, clearAuthCookies } from "../utils/cookie.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.service.js";
import crypto from "crypto";

const PASSWORD_MIN_LENGTH = 8;

const validatePassword = (password) => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new AppError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`, 400);
  }
};

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
});

export const registerUser = async ({ name, email, password }) => {
  validatePassword(password);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = generateSecureToken();
  const emailVerificationTokenHash = hashToken(verificationToken);
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    emailVerificationTokenHash,
    emailVerificationExpires,
  });

  // Always log token in dev for easy testing
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[EMAIL VERIFICATION] Token: ${verificationToken}`);
    console.log(`[EMAIL VERIFICATION] URL: ${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}\n`);
  }

  // Send real verification email
  await sendVerificationEmail({ name: user.name, email: user.email, token: verificationToken });

  return { user: safeUser(user), verificationToken };
};

export const verifyEmail = async (token) => {
  if (!token) {
    throw new AppError("Verification token is required", 400);
  }

  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationTokenHash +emailVerificationExpires");

  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateModifiedOnly: true });

  return { user: safeUser(user) };
};

export const loginUser = async ({ email, password }, res) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash +refreshTokenHash");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  const accessToken = generateAccessToken(user);
  const jti = crypto.randomUUID();
  const refreshToken = generateRefreshToken(user, jti);
  const refreshTokenHash = hashToken(refreshToken);

  user.refreshTokenHash = refreshTokenHash;
  await user.save({ validateModifiedOnly: true });

  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);

  return { user: safeUser(user) };
};

export const refreshSession = async (token, res) => {
  if (!token) {
    throw new AppError("Refresh token is required", 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    clearAuthCookies(res);
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (payload.type !== "refresh") {
    clearAuthCookies(res);
    throw new AppError("Invalid token type", 401);
  }

  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (!user) {
    clearAuthCookies(res);
    throw new AppError("User not found", 401);
  }

  const isValidRefresh = compareTokenHash(token, user.refreshTokenHash);
  if (!isValidRefresh) {
    user.refreshTokenHash = undefined;
    await user.save({ validateModifiedOnly: true });
    clearAuthCookies(res);
    throw new AppError("Refresh token has been revoked", 401);
  }

  const newAccessToken = generateAccessToken(user);
  const newJti = crypto.randomUUID();
  const newRefreshToken = generateRefreshToken(user, newJti);
  const newRefreshTokenHash = hashToken(newRefreshToken);

  user.refreshTokenHash = newRefreshTokenHash;
  await user.save({ validateModifiedOnly: true });

  setAccessCookie(res, newAccessToken);
  setRefreshCookie(res, newRefreshToken);

  return { user: safeUser(user) };
};

export const logoutUser = async (userId, res) => {
  if (userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
  }
  clearAuthCookies(res);
  return true;
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return { message: "If an account exists for this email, password reset instructions have been generated." };
  }

  const resetToken = generateSecureToken();
  const passwordResetTokenHash = hashToken(resetToken);
  const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

  user.passwordResetTokenHash = passwordResetTokenHash;
  user.passwordResetExpires = passwordResetExpires;
  await user.save({ validateModifiedOnly: true });

  // Always log token in dev for easy testing
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[PASSWORD RESET] Token: ${resetToken}`);
    console.log(`[PASSWORD RESET] URL: ${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}\n`);
  }

  // Send real password reset email
  await sendPasswordResetEmail({ name: user.name, email: user.email, token: resetToken });

  return { message: "If an account exists for this email, password reset instructions have been generated." };
};

export const resetPassword = async ({ token, password }) => {
  validatePassword(password);

  if (!token) {
    throw new AppError("Reset token is required", 400);
  }

  const tokenHash = hashToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpires +refreshTokenHash");

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const passwordHash = await hashPassword(password);
  user.passwordHash = passwordHash;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenHash = undefined;
  await user.save({ validateModifiedOnly: true });

  return true;
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return safeUser(user);
};
