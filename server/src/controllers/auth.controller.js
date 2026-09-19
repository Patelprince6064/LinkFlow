import * as authService from "../services/auth.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user } = await authService.registerUser({ name, email, password });

  res.status(201).json({
    success: true,
    message: "Registration successful. Please verify your email.",
    data: { user },
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const { user } = await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: { user },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user } = await authService.loginUser({ email, password }, res);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refresh_token;
  const { user } = await authService.refreshSession(token, res);

  res.status(200).json({
    success: true,
    message: "Session refreshed",
    data: { user },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user?.id, res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { message } = await authService.requestPasswordReset(email);

  res.status(200).json({
    success: true,
    message,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword({ token, password });

  res.status(200).json({
    success: true,
    message: "Password reset successful. Please log in with your new password.",
  });
});
