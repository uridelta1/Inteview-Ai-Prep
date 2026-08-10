import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import {
  uploadResume,
  getMyResume,
  analyzeMyResume,
  matchJobDescription,
} from "../controllers/resumeController.js";

const router = express.Router();

router.use(protect);
router.post("/upload", upload.single("resume"), uploadResume);
router.get("/me", getMyResume);
router.post("/:id/analyze", aiLimiter, analyzeMyResume);
router.post("/:id/match-jd", aiLimiter, matchJobDescription);

export default router;
