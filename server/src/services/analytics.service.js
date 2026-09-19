import mongoose from "mongoose";
import Link from "../models/Link.js";
import ClickEvent from "../models/ClickEvent.js";
import AppError from "../utils/AppError.js";

const MAX_DATE_RANGE_DAYS = 90;

const parseDateRange = (startDate, endDate) => {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (diffDays > MAX_DATE_RANGE_DAYS) {
    throw new AppError(`Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days`, 400);
  }

  return { start, end: new Date(end.getTime() + 86400000) };
};

const getUserLinkIds = async (userId) => {
  const links = await Link.find({ user: userId }).select("_id").lean();
  return links.map((l) => l._id);
};

export const getOverview = async ({ userId, startDate, endDate }) => {
  const { start, end } = parseDateRange(startDate, endDate);
  const linkIds = await getUserLinkIds(userId);

  if (linkIds.length === 0) {
    const totalLinks = await Link.countDocuments({ user: userId });
    const activeLinks = await Link.countDocuments({ user: userId, isActive: true });
    return { totalClicks: 0, totalLinks, activeLinks, topLink: null };
  }

  const [clickResult, totalLinks, activeLinks, topLinkResult] = await Promise.all([
    ClickEvent.aggregate([
      { $match: { link: { $in: linkIds }, timestamp: { $gte: start, $lt: end } } },
      { $count: "total" },
    ]),
    Link.countDocuments({ user: userId }),
    Link.countDocuments({ user: userId, isActive: true }),
    ClickEvent.aggregate([
      { $match: { link: { $in: linkIds }, timestamp: { $gte: start, $lt: end } } },
      { $group: { _id: "$link", clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "links",
          localField: "_id",
          foreignField: "_id",
          as: "link",
        },
      },
      { $unwind: "$link" },
      { $project: { _id: 1, shortCode: "$link.shortCode", clicks: 1 } },
    ]),
  ]);

  const totalClicks = clickResult[0]?.total || 0;
  const topLink = topLinkResult[0]
    ? { id: topLinkResult[0]._id, shortCode: topLinkResult[0].shortCode, clicks: topLinkResult[0].clicks }
    : null;

  return { totalClicks, totalLinks, activeLinks, topLink };
};

export const getClicksOverTime = async ({ userId, startDate, endDate }) => {
  const { start, end } = parseDateRange(startDate, endDate);
  const linkIds = await getUserLinkIds(userId);

  if (linkIds.length === 0) return [];

  const results = await ClickEvent.aggregate([
    { $match: { link: { $in: linkIds }, timestamp: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        clicks: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const clicksMap = new Map(results.map((r) => [r._id, r.clicks]));
  const data = [];
  const current = new Date(start);
  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];
    data.push({ date: dateStr, clicks: clicksMap.get(dateStr) || 0 });
    current.setDate(current.getDate() + 1);
  }

  return data;
};

export const getTopReferrers = async ({ userId, startDate, endDate, limit = 10 }) => {
  const { start, end } = parseDateRange(startDate, endDate);
  const linkIds = await getUserLinkIds(userId);

  if (linkIds.length === 0) return [];

  return ClickEvent.aggregate([
    { $match: { link: { $in: linkIds }, timestamp: { $gte: start, $lt: end } } },
    { $group: { _id: "$referrer", clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } },
    { $limit: Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50) },
    { $project: { _id: 0, referrer: "$_id", clicks: 1 } },
  ]);
};

export const getDeviceDistribution = async ({ userId, startDate, endDate }) => {
  const { start, end } = parseDateRange(startDate, endDate);
  const linkIds = await getUserLinkIds(userId);

  const devices = ["Mobile", "Desktop", "Tablet"];

  if (linkIds.length === 0) {
    return devices.map((d) => ({ deviceType: d, clicks: 0, percentage: 0 }));
  }

  const results = await ClickEvent.aggregate([
    { $match: { link: { $in: linkIds }, timestamp: { $gte: start, $lt: end } } },
    { $group: { _id: "$deviceType", clicks: { $sum: 1 } } },
  ]);

  const total = results.reduce((sum, r) => sum + r.clicks, 0);
  const deviceMap = new Map(results.map((r) => [r._id, r.clicks]));

  return devices.map((d) => ({
    deviceType: d,
    clicks: deviceMap.get(d) || 0,
    percentage: total > 0 ? Math.round(((deviceMap.get(d) || 0) / total) * 100) : 0,
  }));
};

export const getLinkAnalytics = async ({ userId, linkId, startDate, endDate }) => {
  const link = await Link.findOne({ _id: linkId, user: userId });
  if (!link) {
    throw new AppError("Link not found", 404);
  }

  const { start, end } = parseDateRange(startDate, endDate);

  const [totalClicks, clicksOverTime, referrers, devices] = await Promise.all([
    ClickEvent.countDocuments({ link: linkId, timestamp: { $gte: start, $lt: end } }),
    ClickEvent.aggregate([
      { $match: { link: new mongoose.Types.ObjectId(linkId), timestamp: { $gte: start, $lt: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    ClickEvent.aggregate([
      { $match: { link: new mongoose.Types.ObjectId(linkId), timestamp: { $gte: start, $lt: end } } },
      { $group: { _id: "$referrer", clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, referrer: "$_id", clicks: 1 } },
    ]),
    ClickEvent.aggregate([
      { $match: { link: new mongoose.Types.ObjectId(linkId), timestamp: { $gte: start, $lt: end } } },
      { $group: { _id: "$deviceType", clicks: { $sum: 1 } } },
    ]),
  ]);

  const clicksMap = new Map(clicksOverTime.map((r) => [r._id, r.clicks]));
  const timeData = [];
  const current = new Date(start);
  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];
    timeData.push({ date: dateStr, clicks: clicksMap.get(dateStr) || 0 });
    current.setDate(current.getDate() + 1);
  }

  const totalDeviceClicks = devices.reduce((sum, d) => sum + d.clicks, 0);
  const deviceMap = new Map(devices.map((d) => [d._id, d.clicks]));
  const deviceData = ["Mobile", "Desktop", "Tablet"].map((d) => ({
    deviceType: d,
    clicks: deviceMap.get(d) || 0,
    percentage: totalDeviceClicks > 0 ? Math.round(((deviceMap.get(d) || 0) / totalDeviceClicks) * 100) : 0,
  }));

  return {
    link: { id: link._id, shortCode: link.shortCode, destinationUrl: link.destinationUrl },
    totalClicks,
    clicksOverTime: timeData,
    referrers,
    devices: deviceData,
  };
};
