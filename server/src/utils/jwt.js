import jwt from "jsonwebtoken";
import env from "../config/env.js";

const ACCESS_TOKEN_EXPIRES = env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES = env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, type: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
};

export const generateRefreshToken = (user, jti) => {
  return jwt.sign(
    { sub: user._id.toString(), type: "refresh", jti },
    env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
