import mongoose from "mongoose";

const clickEventSchema = new mongoose.Schema(
  {
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link",
      required: [true, "Link reference is required"],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    referrer: {
      type: String,
      default: null,
      trim: true,
    },
    deviceType: {
      type: String,
      required: [true, "Device type is required"],
      enum: {
        values: ["Mobile", "Desktop", "Tablet"],
        message: "Device type must be Mobile, Desktop, or Tablet",
      },
    },
    ipHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

clickEventSchema.index({ link: 1, timestamp: -1 });
clickEventSchema.index({ timestamp: -1 });

const ClickEvent = mongoose.model("ClickEvent", clickEventSchema);

export default ClickEvent;
