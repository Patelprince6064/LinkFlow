import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load root .env for development defaults
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Override with test-specific values
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/short_link_bio_hub_test";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret-for-testing-only-32chars!";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret-for-testing-only-32chars!";
process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.PUBLIC_BASE_URL = "http://localhost:5000";
process.env.COOKIE_SECURE = "false";
process.env.COOKIE_SAME_SITE = "lax";

const env = {
  NODE_ENV: "test",
  PORT: 5001,
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_URL: process.env.CLIENT_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
};

export default env;
