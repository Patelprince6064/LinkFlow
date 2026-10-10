import crypto from "crypto";
import ApiKey from "../models/ApiKey.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

const hashKey = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

/** Allows `Authorization: Bearer <JWT>` / cookie (via requireAuth) OR `x-api-key: lh_...`. */
const apiKeyAuth = async (req, _res, next) => {
  try {
    const raw = req.headers["x-api-key"];
    if (!raw || typeof raw !== "string") {
      throw new AppError("Authentication required", 401);
    }
    const key = await ApiKey.findOne({ keyHash: hashKey(raw) }).select("+keyHash");
    if (!key || !key.isActive) {
      throw new AppError("Invalid API key", 401);
    }
    const user = await User.findById(key.user);
    if (!user) {
      throw new AppError("User not found", 401);
    }
    key.lastUsedAt = new Date();
    await key.save({ validateBeforeSave: false });
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      authMethod: "api-key",
    };
    next();
  } catch (error) {
    next(error);
  }
};

export default apiKeyAuth;
