import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

router.get("/overview", analyticsController.overview);
router.get("/clicks-over-time", analyticsController.clicksOverTime);
router.get("/referrers", analyticsController.referrers);
router.get("/devices", analyticsController.devices);
router.get("/links/:linkId", analyticsController.linkAnalytics);

export default router;
