import crypto from "crypto";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Session from "../models/Session.js";
import Notification from "../models/Notification.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/generateTokens.js";
import sendEmail, { verificationEmailTemplate, resetPasswordEmailTemplate } from "../utils/sendEmail.js";
import logger from "../utils/logger.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const issueTokens = async (user, req) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5); // keep last 5 devices
  user.lastLoginAt = new Date();
  await user.save();

  await Session.create({
    user: user._id,
    refreshToken,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    action: "login",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: crypto.createHash("sha256").update(verificationToken).digest("hex"),
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  const link = `${CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your InterviewAI account",
    html: verificationEmailTemplate(user.name, link),
  });

  await Notification.create({
    user: user._id,
    type: "welcome",
    title: "Welcome to InterviewAI 🎉",
    message: "Complete your profile and upload your resume to get personalized mock interviews.",
    link: "/profile",
  });

  const { accessToken, refreshToken } = await issueTokens(user, req);

  res.status(201).json({
    success: true,
    message: "Registered successfully. Please check your email to verify your account.",
    accessToken,
    refreshToken,
    user: user.toSafeObject(),
  });
});

// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated. Contact support.");
  }

  const { accessToken, refreshToken } = await issueTokens(user, req);

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: user.toSafeObject(),
  });
});

// @route POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    res.status(401);
    throw new Error("Refresh token invalid or expired");
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    res.status(401);
    throw new Error("Refresh token not recognized, please log in again");
  }

  const accessToken = generateAccessToken(user._id, user.role);
  res.json({ success: true, accessToken });
});

// @route POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: refreshToken } });
    await Session.updateMany({ user: req.user._id, refreshToken }, { isActive: false });
  }
  res.json({ success: true, message: "Logged out successfully" });
});

// @route POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond success to avoid leaking which emails are registered
  if (!user) {
    return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  const link = `${CLIENT_URL}/reset-password/${resetToken}`;
  
  // Log the link to the console for easy local testing
  logger.info(`[FORGOT PASSWORD LINK] For ${user.email}: ${link}`);
  
  await sendEmail({
    to: user.email,
    subject: "Reset your InterviewAI password",
    html: resetPasswordEmailTemplate(user.name, link),
  });

  res.json({ success: true, message: "If that email exists, a reset link has been sent." });
});

// @route POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    res.status(400);
    throw new Error("Reset link is invalid or has expired");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // invalidate all sessions
  await user.save();

  res.json({ success: true, message: "Password reset successfully. Please log in." });
});

// @route GET /api/auth/verify-email/:token
export const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    res.status(400);
    throw new Error("Verification link is invalid or has expired");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Email verified successfully" });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});
