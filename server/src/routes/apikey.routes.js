import { Router } from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import requireAuth from "../middleware/requireAuth.js";
import ApiKey, { generateApiKey } from "../models/ApiKey.js";

const router = Router();
router.use(requireAuth);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Key name is required" });
    }
    const { raw, keyHash, prefix } = generateApiKey();
    const created = await ApiKey.create({ user: req.user.id, name: name.trim(), keyHash, prefix });
    res.status(201).json({
      success: true,
      message: "API key created. Store it now — it is never shown again.",
      data: { id: created._id, name: created.name, prefix, apiKey: raw },
    });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const keys = await ApiKey.find({ user: req.user.id }).select("-keyHash").sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: keys });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await ApiKey.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ success: false, message: "API key not found" });
    res.status(200).json({ success: true, message: "API key revoked" });
  })
);

export default router;
