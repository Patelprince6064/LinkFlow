import mongoose from "mongoose";
import crypto from "crypto";

const apiKeySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    keyHash: { type: String, required: true, unique: true, select: false },
    prefix: { type: String, required: true },
    lastUsedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

apiKeySchema.index({ user: 1, createdAt: -1 });

export const generateApiKey = () => {
  const raw = `lh_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, keyHash, prefix: raw.slice(0, 10) };
};

const ApiKey = mongoose.model("ApiKey", apiKeySchema);
export default ApiKey;
