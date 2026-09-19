import crypto from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashToken = async (token) => {
  return bcrypt.hash(token, SALT_ROUNDS);
};

export const compareTokenHash = async (token, hash) => {
  return bcrypt.compare(token, hash);
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
