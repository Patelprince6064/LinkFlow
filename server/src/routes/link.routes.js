import { Router } from "express";
import * as linkController from "../controllers/link.controller.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";
import { validateMongoId } from "../utils/validation.js";
import AppError from "../utils/AppError.js";

const router = Router();

router.use(requireAuth);

const validateLinkId = (req, res, next) => {
  if (!validateMongoId(req.params.id)) {
    throw new AppError("Invalid link ID format", 400);
  }
  next();
};

router.post(
  "/",
  validateBody({
    destinationUrl: { required: true, type: "string", maxLength: 2048 },
    customSlug: { type: "string", maxLength: 20 },
  }),
  linkController.createLink
);

router.get("/", linkController.getLinks);
router.get("/:id", validateLinkId, linkController.getLink);
router.patch(
  "/:id",
  validateLinkId,
  validateBody({
    destinationUrl: { type: "string", maxLength: 2048 },
    customSlug: { type: "string", maxLength: 20 },
    isActive: { type: "boolean" },
  }),
  linkController.updateLink
);
router.delete("/:id", validateLinkId, linkController.deleteLink);

export default router;
