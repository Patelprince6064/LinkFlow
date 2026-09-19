import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

router.post(
  "/register",
  validateBody({
    name: { required: true, type: "string", minLength: 1, maxLength: 80 },
    email: { required: true, type: "string", maxLength: 254 },
    password: { required: true, type: "string", minLength: 8, maxLength: 128 },
  }),
  authController.register
);

router.post(
  "/verify-email",
  validateBody({
    token: { required: true, type: "string", minLength: 1 },
  }),
  authController.verifyEmail
);

router.post(
  "/login",
  validateBody({
    email: { required: true, type: "string" },
    password: { required: true, type: "string" },
  }),
  authController.login
);

router.post("/refresh", authController.refresh);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

router.post(
  "/forgot-password",
  validateBody({
    email: { required: true, type: "string" },
  }),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validateBody({
    token: { required: true, type: "string", minLength: 1 },
    password: { required: true, type: "string", minLength: 8, maxLength: 128 },
  }),
  authController.resetPassword
);

export default router;
