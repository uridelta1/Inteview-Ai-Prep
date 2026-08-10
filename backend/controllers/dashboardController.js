import asyncHandler from "express-async-handler";
import Interview from "../models/Interview.js";
import Report from "../models/Report.js";
import Notification from "../models/Notification.js";

// @route GET /api/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const completedInterviews = await Interview.find({ user: userId, status: "completed" }).sort({
    completedAt: 1,
  });

  const reports = await Report.find({ user: userId }).sort({ createdAt: 1 });

  const totalInterviews = await Interview.countDocuments({ user: userId });
  const totalCompleted = completedInterviews.length;

  const avgScore = reports.length
    ? Math.round(reports.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reports.length)
    : 0;

  const bestPerformance = reports.reduce(
    (best, r) => (r.overallScore > (best?.overallScore ?? -1) ? r : best),
    null
  );

  // Aggregate weak/strong topics across all reports
  const weaknessCount = {};
  const strengthCount = {};
  reports.forEach((r) => {
    (r.weaknesses || []).forEach((w) => (weaknessCount[w] = (weaknessCount[w] || 0) + 1));
    (r.strengths || []).forEach((s) => (strengthCount[s] = (strengthCount[s] || 0) + 1));
  });
  const topWeakAreas = Object.entries(weaknessCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);
  const topStrongAreas = Object.entries(strengthCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  const progressChart = reports.map((r) => ({
    date: r.createdAt,
    overallScore: r.overallScore,
    technicalScore: r.technicalScore,
    communicationScore: r.communicationScore,
    confidenceScore: r.confidenceScore,
  }));

  const recentInterviews = await Interview.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("report");

  const unreadNotifications = await Notification.countDocuments({ user: userId, isRead: false });

  res.json({
    success: true,
    stats: {
      totalInterviews,
      totalCompleted,
      averageScore: avgScore,
      bestPerformance: bestPerformance
        ? { score: bestPerformance.overallScore, reportId: bestPerformance._id }
        : null,
      topWeakAreas,
      topStrongAreas,
      unreadNotifications,
    },
    progressChart,
    recentInterviews,
  });
});

// @route GET /api/dashboard/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);
  res.json({ success: true, notifications });
});

// @route PUT /api/dashboard/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, user: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
});

// @route PUT /api/dashboard/notifications/read-all
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});
