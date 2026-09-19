import mongoose from "mongoose";

const VALID_THEMES = ["Minimal Light", "Dark Slate", "Gradient"];
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const SAFE_URL_REGEX = /^https?:\/\/.+/;

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, "Platform is required"],
      trim: true,
    },
    label: {
      type: String,
      default: null,
      trim: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
      validate: {
        validator: (url) => {
          try {
            const parsed = new URL(url);
            return ["http:", "https:"].includes(parsed.protocol);
          } catch {
            return false;
          }
        },
        message: "Social link URL must be a valid HTTP or HTTPS URL",
      },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const bioProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [USERNAME_REGEX, "Username can only contain letters, numbers, hyphens, and underscores"],
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
      maxlength: [100, "Display name cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    theme: {
      type: String,
      required: [true, "Theme is required"],
      enum: {
        values: VALID_THEMES,
        message: "Theme must be one of: Minimal Light, Dark Slate, Gradient",
      },
      default: "Minimal Light",
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: [],
      validate: {
        validator: (links) => links.length <= 10,
        message: "Cannot have more than 10 social links",
      },
    },
  },
  {
    timestamps: true,
  }
);

const BioProfile = mongoose.model("BioProfile", bioProfileSchema);

export default BioProfile;
