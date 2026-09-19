import { Router } from "express";
import { redirect } from "../controllers/redirect.controller.js";
import rateLimit from "express-rate-limit";

const router = Router();

const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/:shortCode", redirectLimiter, redirect);

export default router;
