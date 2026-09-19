import { Router } from "express";
import * as bioController from "../controllers/bio.controller.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

router.get("/me", requireAuth, bioController.getMyProfile);

router.post(
  "/",
  requireAuth,
  validateBody({
    username: { required: true, type: "string", minLength: 3, maxLength: 30 },
    displayName: { required: true, type: "string", minLength: 1, maxLength: 80 },
    bio: { type: "string", maxLength: 300 },
    avatar: { type: "string", maxLength: 500 },
    theme: { type: "string" },
  }),
  bioController.createProfile
);

router.patch(
  "/",
  requireAuth,
  validateBody({
    username: { type: "string", minLength: 3, maxLength: 30 },
    displayName: { type: "string", minLength: 1, maxLength: 80 },
    bio: { type: "string", maxLength: 300 },
    avatar: { type: "string", maxLength: 500 },
    theme: { type: "string" },
  }),
  bioController.updateProfile
);

router.delete("/", requireAuth, bioController.deleteProfile);

router.get("/:username", bioController.getPublicProfile);

export default router;
