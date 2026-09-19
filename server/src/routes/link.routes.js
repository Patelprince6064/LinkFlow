import { Router } from "express";
import * as linkController from "../controllers/link.controller.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

router.post("/", linkController.createLink);
router.get("/", linkController.getLinks);
router.get("/:id", linkController.getLink);
router.patch("/:id", linkController.updateLink);
router.delete("/:id", linkController.deleteLink);

export default router;
