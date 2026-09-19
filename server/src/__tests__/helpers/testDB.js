import mongoose from "mongoose";
import env from "../config/testEnv.js";

let isConnected = false;

export const connectTestDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(env.MONGODB_URI);
    isConnected = true;
    console.log(`  Connected to test database: ${env.MONGODB_URI}`);
  } catch (error) {
    console.error(`  Failed to connect to test database: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectTestDB = async () => {
  if (!isConnected) return;

  try {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    isConnected = false;
    console.log("  Disconnected from test database (dropped)");
  } catch (error) {
    console.error(`  Error disconnecting: ${error.message}`);
    await mongoose.disconnect();
    isConnected = false;
  }
};

export const clearCollections = async () => {
  if (!isConnected) return;

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
