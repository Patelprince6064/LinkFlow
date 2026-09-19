import { verifyAccessToken } from "../utils/jwt.js";
import { ACCESS_COOKIE } from "../utils/cookie.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

const requireAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.[ACCESS_COOKIE] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError("Invalid or expired access token", 401);
    }

    if (payload.type !== "access") {
      throw new AppError("Invalid token type", 401);
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
