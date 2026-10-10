import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";
import requestLogger from "./middleware/requestLogger.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.routes.js";
import linkRoutes from "./routes/link.routes.js";
import redirectRoutes from "./routes/redirect.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import bioRoutes from "./routes/bio.routes.js";
import apiKeyRoutes from "./routes/apikey.routes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
app.use(requestLogger);

if (env.NODE_ENV === "production") {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", apiLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many authentication attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/v1/auth/register", authLimiter);
  app.use("/api/v1/auth/login", authLimiter);
  app.use("/api/v1/auth/forgot-password", authLimiter);
  app.use("/api/v1/auth/reset-password", authLimiter);
  app.use("/api/v1/auth/resend-verification", authLimiter);
  app.use("/api/v1/auth/refresh", authLimiter);

  const redirectLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: { success: false, message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/r", redirectLimiter);

  const bioLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    message: { success: false, message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/v1/bio", bioLimiter);
}

app.use("/api", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/links", linkRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/bio", bioRoutes);
app.use("/api/v1/api-keys", apiKeyRoutes);
app.use("/r", redirectRoutes);

// OpenAPI JSON (serves checked-in spec; null when missing in some deploys)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.get("/api/openapi.json", (_req, res) => {
  const specPath = path.join(__dirname, "docs", "openapi.json");
  if (!fs.existsSync(specPath)) {
    return res.status(404).json({ success: false, message: "OpenAPI spec not found" });
  }
  res.type("application/json").send(fs.readFileSync(specPath, "utf8"));
});

app.use(notFound);
app.use(errorHandler);

export default app;
