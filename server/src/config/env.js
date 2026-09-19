import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_URL: (process.env.CLIENT_URL || "http://localhost:5173").trim(),
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  PUBLIC_BASE_URL: (process.env.PUBLIC_BASE_URL || "http://localhost:5000").trim(),
};


const requiredInProduction = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

if (env.NODE_ENV === "production") {
  for (const key of requiredInProduction) {
    if (!env[key]) {
      throw new Error(`Missing required production environment variable: ${key}`);
    }
  }
} else {
  if (!env.MONGODB_URI) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }
}

export default env;
