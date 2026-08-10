import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Interview from "../models/Interview.js";
import Report from "../models/Report.js";
import Session from "../models/Session.js";
import Notification from "../models/Notification.js";

// @route GET /api/admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await User.countDocuments(filter);

  res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @route GET /api/admin/users/:id
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("resume");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const interviewCount = await Interview.countDocuments({ user: user._id });
  const avgScoreAgg = await Report.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: null, avg: { $avg: "$overallScore" } } },
  ]);

  res.json({
    success: true,
    user,
    stats: { interviewCount, averageScore: Math.round(avgScoreAgg[0]?.avg || 0) },
  });
});

// @route PUT /api/admin/users/:id/role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["candidate", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, user: user.toSafeObject() });
});

// @route PUT /api/admin/users/:id/status
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, user: user.toSafeObject() });
});

// @route DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, message: "User deleted" });
});

// @route GET /api/admin/analytics
export const getAnalytics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalCandidates = await User.countDocuments({ role: "candidate" });
  const totalInterviews = await Interview.countDocuments();
  const completedInterviews = await Interview.countDocuments({ status: "completed" });

  const avgScoreAgg = await Report.aggregate([
    { $group: { _id: null, avg: { $avg: "$overallScore" } } },
  ]);

  const interviewsByRole = await Interview.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const interviewsByType = await Interview.aggregate([
    { $group: { _id: "$interviewType", count: { $sum: 1 } } },
  ]);

  const signupsOverTime = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 90 },
  ]);

  const interviewsOverTime = await Interview.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 90 },
  ]);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      totalCandidates,
      totalInterviews,
      completedInterviews,
      completionRate: totalInterviews ? Math.round((completedInterviews / totalInterviews) * 100) : 0,
      averageScore: Math.round(avgScoreAgg[0]?.avg || 0),
      interviewsByRole,
      interviewsByType,
      signupsOverTime,
      interviewsOverTime,
    },
  });
});

// @route GET /api/admin/ai-usage
export const getAiUsage = asyncHandler(async (req, res) => {
  const usageByAction = await Session.aggregate([
    { $match: { action: { $in: ["ai_question_gen", "ai_evaluation", "resume_analysis", "jd_analysis"] } } },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
        avgLatencyMs: { $avg: "$meta.latencyMs" },
      },
    },
  ]);

  const usageOverTime = await Session.aggregate([
    { $match: { action: { $in: ["ai_question_gen", "ai_evaluation", "resume_analysis", "jd_analysis"] } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 90 },
  ]);

  res.json({ success: true, usageByAction, usageOverTime });
});

// @route GET /api/admin/logs
export const getSystemLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, userId } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (userId) filter.user = userId;

  const logs = await Session.find(filter)
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Session.countDocuments(filter);

  res.json({ success: true, logs, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @route POST /api/admin/broadcast
export const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, role } = req.body;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select("_id");

  await Notification.insertMany(
    users.map((u) => ({ user: u._id, type: "system", title, message }))
  );

  res.json({ success: true, message: `Notification sent to ${users.length} users` });
});
