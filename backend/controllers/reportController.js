import asyncHandler from "express-async-handler";
import Report from "../models/Report.js";
import Interview from "../models/Interview.js";
import Answer from "../models/Answer.js";
import { streamReportPdf } from "../utils/pdfExport.js";

// @route GET /api/reports
export const listReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ user: req.user._id })
    .populate("interview", "role interviewType difficulty createdAt completedAt")
    .sort({ createdAt: -1 });
  res.json({ success: true, reports });
});

// @route GET /api/reports/:id
export const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, user: req.user._id }).populate(
    "interview"
  );
  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }
  const answers = await Answer.find({ interview: report.interview._id }).populate("question");
  res.json({ success: true, report, answers });
});

// @route GET /api/reports/:id/export
export const exportReportPdf = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, user: req.user._id }).populate(
    "interview"
  );
  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }
  const answers = await Answer.find({ interview: report.interview._id }).populate("question");

  streamReportPdf({ res, user: req.user, interview: report.interview, report, answers });
});
