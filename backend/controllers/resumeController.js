import asyncHandler from "express-async-handler";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Resume from "../models/Resume.js";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { extractResumeText, mimeToFileType } from "../utils/resumeParser.js";
import { analyzeResume, analyzeJobDescriptionMatch } from "../utils/geminiClient.js";

const uploadBufferToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

// @route POST /api/resume/upload
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No resume file uploaded");
  }

  const fileType = mimeToFileType(req.file.mimetype);
  const rawText = await extractResumeText(req.file.buffer, fileType);

  let fileUrl = "local_placeholder";
  try {
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, "interviewai/resumes");
    fileUrl = uploaded.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed, using placeholder", err.message);
  }

  const resume = await Resume.create({
    user: req.user._id,
    fileUrl,
    fileType,
    originalName: req.file.originalname,
    rawText,
  });

  await User.findByIdAndUpdate(req.user._id, { resume: resume._id });

  res.status(201).json({ success: true, resume });
});

// @route GET /api/resume/me
export const getMyResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, resume });
});

// @route POST /api/resume/:id/analyze
export const analyzeMyResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  const start = Date.now();
  const { parsed, analysis } = await analyzeResume({ resumeText: resume.rawText });

  resume.parsed = parsed;
  resume.analysis = { ...analysis, analyzedAt: new Date() };
  await resume.save();

  await Session.create({
    user: req.user._id,
    action: "resume_analysis",
    meta: { latencyMs: Date.now() - start },
  });

  res.json({ success: true, resume });
});

// @route POST /api/resume/:id/match-jd
export const matchJobDescription = asyncHandler(async (req, res) => {
  const { jobDescription } = req.body;
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  const start = Date.now();
  const result = await analyzeJobDescriptionMatch({ resumeText: resume.rawText, jobDescription });

  resume.jobDescriptionMatch = { jobDescription, ...result, analyzedAt: new Date() };
  await resume.save();

  await Session.create({
    user: req.user._id,
    action: "jd_analysis",
    meta: { latencyMs: Date.now() - start },
  });

  res.json({ success: true, resume });
});
