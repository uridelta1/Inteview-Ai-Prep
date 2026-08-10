import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import validate from "../middleware/validate.js";
import {
  createInterview,
  listInterviews,
  getInterview,
  submitAnswer,
  completeInterview,
  abandonInterview,
} from "../controllers/interviewController.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  aiLimiter,
  [
    body("role").notEmpty(),
    body("experienceLevel").isIn(["fresher", "junior", "mid", "senior"]),
    body("difficulty").isIn(["easy", "medium", "hard"]),
    body("interviewType").isIn(["technical", "hr", "mixed"]),
    body("numberOfQuestions").isInt({ min: 1, max: 30 }),
  ],
  validate,
  createInterview
);

router.get("/", listInterviews);
router.get("/:id", getInterview);
router.post(
  "/:id/answer",
  aiLimiter,
  [body("questionId").notEmpty(), body("userText").trim().notEmpty()],
  validate,
  submitAnswer
);
router.post("/:id/complete", aiLimiter, completeInterview);
router.delete("/:id", abandonInterview);

export default router;
