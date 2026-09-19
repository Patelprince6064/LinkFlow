import * as linkService from "../services/link.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const createLink = asyncHandler(async (req, res) => {
  const { destinationUrl, customSlug } = req.body;
  const link = await linkService.createLink({
    userId: req.user.id,
    destinationUrl,
    customSlug,
  });

  res.status(201).json({
    success: true,
    message: "Short link created successfully",
    data: { link },
  });
});

export const getLinks = asyncHandler(async (req, res) => {
  const { page, limit, search, isActive } = req.query;
  const result = await linkService.getUserLinks({
    userId: req.user.id,
    page,
    limit,
    search,
    isActive,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getLink = asyncHandler(async (req, res) => {
  const link = await linkService.getLinkById({
    userId: req.user.id,
    linkId: req.params.id,
  });

  res.status(200).json({
    success: true,
    data: { link },
  });
});

export const updateLink = asyncHandler(async (req, res) => {
  const { destinationUrl, customSlug, isActive } = req.body;
  const link = await linkService.updateLink({
    userId: req.user.id,
    linkId: req.params.id,
    destinationUrl,
    customSlug,
    isActive,
  });

  res.status(200).json({
    success: true,
    message: "Link updated successfully",
    data: { link },
  });
});

export const deleteLink = asyncHandler(async (req, res) => {
  await linkService.deleteLink({
    userId: req.user.id,
    linkId: req.params.id,
  });

  res.status(200).json({
    success: true,
    message: "Short link deleted successfully",
  });
});
