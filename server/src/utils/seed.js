import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Link from "../models/Link.js";
import BioProfile from "../models/BioProfile.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding");

    await User.deleteMany({});
    await Link.deleteMany({});
    await BioProfile.deleteMany({});
    console.log("Cleared existing data");

    const user = await User.create({
      name: "Dev User",
      email: "dev@linkhub.local",
      passwordHash: "$2b$10$placeholderhashfordevelopmentonly",
      role: "user",
    });
    console.log(`Created user: ${user.email} (${user._id})`);

    const link = await Link.create({
      user: user._id,
      destinationUrl: "https://github.com",
      shortCode: "dev-link",
      clickCount: 0,
      isActive: true,
    });
    console.log(`Created link: /r/${link.shortCode} -> ${link.destinationUrl}`);

    const bioProfile = await BioProfile.create({
      user: user._id,
      username: "devuser",
      displayName: "Dev User",
      bio: "Development profile for testing",
      theme: "Minimal Light",
      socialLinks: [
        {
          platform: "GitHub",
          label: "My GitHub",
          url: "https://github.com",
          order: 0,
        },
      ],
    });
    console.log(`Created bio profile: /bio/${bioProfile.username}`);

    console.log("\nSeed complete. Development data created:");
    console.log(`  - 1 User (${user.email})`);
    console.log(`  - 1 Link (${link.shortCode})`);
    console.log(`  - 1 BioProfile (${bioProfile.username})`);
    console.log("\nAll data is clearly labeled as development data.");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedData();
