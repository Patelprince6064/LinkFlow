import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
console.log("Connecting to MongoDB...");

await mongoose.connect(MONGODB_URI);
console.log("✅ Connected!");

const db = mongoose.connection.db;
const users = db.collection("users");

// Show all users
const allUsers = await users.find({}, { projection: { email: 1, isEmailVerified: 1, name: 1 } }).toArray();
console.log("\n📋 All users:", JSON.stringify(allUsers, null, 2));

// Verify all unverified users
const result = await users.updateMany(
  { isEmailVerified: { $ne: true } },
  {
    $set: { isEmailVerified: true },
    $unset: { emailVerificationTokenHash: "", emailVerificationExpires: "" }
  }
);

console.log(`\n✅ Verified ${result.modifiedCount} user(s)`);

await mongoose.disconnect();
console.log("🔌 Done!");
process.exit(0);
