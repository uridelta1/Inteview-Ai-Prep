import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @route GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("resume");
  res.json({ success: true, user });
});

// @route PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, skills, experience, education, linkedin, github, avatarUrl } = req.body;

  const user = await User.findById(req.user._id);
  if (name !== undefined) user.name = name;
  if (skills !== undefined) user.skills = skills;
  if (experience !== undefined) user.experience = experience;
  if (education !== undefined) user.education = education;
  if (linkedin !== undefined) user.linkedin = linkedin;
  if (github !== undefined) user.github = github;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @route PUT /api/users/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();

  res.json({ success: true, message: "Password changed. Please log in again." });
});

// @route DELETE /api/users/account
export const deactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.isActive = false;
  user.refreshTokens = [];
  await user.save();
  res.json({ success: true, message: "Account deactivated" });
});
