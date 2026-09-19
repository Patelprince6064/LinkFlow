import mongoose from "mongoose";

const SHORT_CODE_REGEX = /^[a-zA-Z0-9_-]+$/;
const SAFE_URL_REGEX = /^https?:\/\/.+/;

const linkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    destinationUrl: {
      type: String,
      required: [true, "Destination URL is required"],
      trim: true,
      match: [SAFE_URL_REGEX, "Please provide a valid HTTP/HTTPS URL"],
      validate: {
        validator: (url) => {
          try {
            const parsed = new URL(url);
            return ["http:", "https:"].includes(parsed.protocol);
          } catch {
            return false;
          }
        },
        message: "Destination URL must be a valid HTTP or HTTPS URL",
      },
    },
    shortCode: {
      type: String,
      required: [true, "Short code is required"],
      unique: true,
      trim: true,
      minlength: [3, "Short code must be at least 3 characters"],
      maxlength: [20, "Short code cannot exceed 20 characters"],
      match: [SHORT_CODE_REGEX, "Short code can only contain letters, numbers, hyphens, and underscores"],
    },
    clickCount: {
      type: Number,
      default: 0,
      min: [0, "Click count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

linkSchema.index({ user: 1, createdAt: -1 });

const Link = mongoose.model("Link", linkSchema);

export default Link;
