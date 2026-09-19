import * as analyticsService from "../services/analytics.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const overview = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const data = await analyticsService.getOverview({
    userId: req.user.id,
    startDate,
    endDate,
  });

  res.status(200).json({ success: true, data });
});

export const clicksOverTime = asyncHandler(async (req, res) => {
  const { startDate, endDate, interval } = req.query;
  const data = await analyticsService.getClicksOverTime({
    userId: req.user.id,
    startDate,
    endDate,
    interval,
  });

  res.status(200).json({ success: true, data });
});

export const referrers = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit } = req.query;
  const data = await analyticsService.getTopReferrers({
    userId: req.user.id,
    startDate,
    endDate,
    limit,
  });

  res.status(200).json({ success: true, data });
});

export const devices = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const data = await analyticsService.getDeviceDistribution({
    userId: req.user.id,
    startDate,
    endDate,
  });

  res.status(200).json({ success: true, data });
});

export const linkAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const data = await analyticsService.getLinkAnalytics({
    userId: req.user.id,
    linkId: req.params.linkId,
    startDate,
    endDate,
  });

  res.status(200).json({ success: true, data });
});
