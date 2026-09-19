import { Router } from "express";
import * as bioController from "../controllers/bio.controller.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.get("/me", requireAuth, bioController.getMyProfile);
router.post("/", requireAuth, bioController.createProfile);
router.patch("/", requireAuth, bioController.updateProfile);
router.delete("/", requireAuth, bioController.deleteProfile);
router.get("/:username", bioController.getPublicProfile);

export default router;
