import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info("MongoDB connected", { host: `${conn.connection.host}:${conn.connection.port}/${conn.connection.name}` });
    return conn;
  } catch (error) {
    logger.error("MongoDB connection error", { error: error.message });
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error", { error: err.message });
});

export default connectDB;
