import * as bioService from "../services/bio.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await bioService.getMyProfile(req.user.id);

  if (!profile) {
    return res.status(200).json({ success: true, data: null });
  }

  res.status(200).json({ success: true, data: profile });
});

export const createProfile = asyncHandler(async (req, res) => {
  const profile = await bioService.createProfile(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Bio profile created", data: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await bioService.updateProfile(req.user.id, req.body);
  res.status(200).json({ success: true, message: "Bio profile updated", data: profile });
});

export const deleteProfile = asyncHandler(async (req, res) => {
  await bioService.deleteProfile(req.user.id);
  res.status(200).json({ success: true, message: "Bio profile deleted" });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await bioService.getPublicProfile(req.params.username);

  if (!profile) {
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  res.status(200).json({ success: true, data: profile });
});
