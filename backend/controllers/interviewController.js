// import asyncHandler from "express-async-handler";
// import Interview from "../models/Interview.js";
// import Question from "../models/Question.js";
// import Answer from "../models/Answer.js";
// import Report from "../models/Report.js";
// import Resume from "../models/Resume.js";
// import Notification from "../models/Notification.js";
// import Session from "../models/Session.js";
// import {
//   generateInterviewQuestions,
//   evaluateAnswer,
//   generateReportSummary,
// } from "../utils/geminiClient.js";

// // @route POST /api/interviews
// // Creates an interview and generates AI questions immediately
// export const createInterview = asyncHandler(async (req, res) => {
//   const {
//     role,
//     experienceLevel,
//     difficulty,
//     interviewType,
//     numberOfQuestions,
//     jobDescription,
//     useResume,
//   } = req.body;

//   let resumeDoc = null;
//   let resumeContext = "";
//   if (useResume) {
//     resumeDoc = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
//     if (resumeDoc) {
//       resumeContext = [
//         resumeDoc.parsed?.skills?.join(", "),
//         resumeDoc.parsed?.experience?.join("; "),
//         resumeDoc.parsed?.projects?.join("; "),
//       ]
//         .filter(Boolean)
//         .join(" | ");

//       if (!resumeContext && resumeDoc.rawText) {
//         resumeContext = resumeDoc.rawText.substring(0, 3000);
//       }
//     }
//   }

//   const interview = await Interview.create({
//     user: req.user._id,
//     role,
//     experienceLevel,
//     difficulty,
//     interviewType,
//     numberOfQuestions,
//     jobDescription,
//     resumeSnapshot: resumeDoc?._id,
//     status: "created",
//   });

//   const start = Date.now();
//   const aiQuestions = await generateInterviewQuestions({
//     role,
//     experienceLevel,
//     difficulty,
//     interviewType,
//     numberOfQuestions,
//     resumeContext,
//     jobDescription,
//   });

//   const questionDocs = await Question.insertMany(
//     aiQuestions.map((q) => ({
//       interview: interview._id,
//       order: q.order,
//       text: q.text,
//       category: q.category,
//       topic: q.topic,
//       idealAnswerPoints: q.idealAnswerPoints,
//     }))
//   );

//   interview.questions = questionDocs.map((q) => q._id);
//   interview.status = "in_progress";
//   interview.startedAt = new Date();
//   await interview.save();

//   await Session.create({
//     user: req.user._id,
//     action: "ai_question_gen",
//     meta: { latencyMs: Date.now() - start, count: questionDocs.length },
//   });

//   res.status(201).json({
//     success: true,
//     interview,
//     questions: questionDocs,
//   });
// });

// // @route GET /api/interviews
// export const listInterviews = asyncHandler(async (req, res) => {
//   const { status } = req.query;
//   const filter = { user: req.user._id };
//   if (status) filter.status = status;

//   const interviews = await Interview.find(filter).sort({ createdAt: -1 });
//   res.json({ success: true, interviews });
// });

// // @route GET /api/interviews/:id
// export const getInterview = asyncHandler(async (req, res) => {
//   const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate(
//     "questions"
//   );
//   if (!interview) {
//     res.status(404);
//     throw new Error("Interview not found");
//   }
//   res.json({ success: true, interview });
// });

// // @route POST /api/interviews/:id/answer
// // Submits an answer for a specific question and returns AI evaluation
// export const submitAnswer = asyncHandler(async (req, res) => {
//   const { questionId, userText } = req.body;

//   const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
//   if (!interview) {
//     res.status(404);
//     throw new Error("Interview not found");
//   }

//   const question = await Question.findOne({ _id: questionId, interview: interview._id });
//   if (!question) {
//     res.status(404);
//     throw new Error("Question not found in this interview");
//   }

//   const start = Date.now();
//   const evaluation = await evaluateAnswer({
//     questionText: question.text,
//     category: question.category,
//     idealAnswerPoints: question.idealAnswerPoints,
//     userAnswer: userText,
//   });

//   const answer = await Answer.create({
//     interview: interview._id,
//     question: question._id,
//     userText,
//     evaluation,
//     evaluatedAt: new Date(),
//   });

//   question.answer = answer._id;
//   await question.save();

//   await Session.create({
//     user: req.user._id,
//     action: "ai_evaluation",
//     meta: { latencyMs: Date.now() - start },
//   });

//   res.status(201).json({ success: true, answer });
// });

// // @route POST /api/interviews/:id/complete
// // Finalizes interview, generates aggregate report
// export const completeInterview = asyncHandler(async (req, res) => {
//   const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate(
//     "questions"
//   );
//   if (!interview) {
//     res.status(404);
//     throw new Error("Interview not found");
//   }

//   const answers = await Answer.find({ interview: interview._id }).populate("question");
//   if (answers.length === 0) {
//     res.status(400);
//     throw new Error("Cannot complete an interview with no answered questions");
//   }

//   const answersForSummary = answers.map((a) => ({
//     category: a.question.category,
//     topic: a.question.topic,
//     evaluation: a.evaluation,
//   }));

//   const summary = await generateReportSummary({ role: interview.role, answers: answersForSummary });

//   const report = await Report.create({
//     interview: interview._id,
//     user: req.user._id,
//     ...summary,
//   });

//   interview.status = "completed";
//   interview.completedAt = new Date();
//   interview.durationSeconds = interview.startedAt
//     ? Math.round((interview.completedAt - interview.startedAt) / 1000)
//     : undefined;
//   interview.report = report._id;
//   await interview.save();

//   await Notification.create({
//     user: req.user._id,
//     type: "report_ready",
//     title: "Your interview report is ready",
//     message: `You scored ${summary.overallScore}/100 in your ${interview.role} mock interview.`,
//     link: `/reports/${report._id}`,
//   });

//   res.json({ success: true, interview, report });
// });

// // @route DELETE /api/interviews/:id
// export const abandonInterview = asyncHandler(async (req, res) => {
//   const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
//   if (!interview) {
//     res.status(404);
//     throw new Error("Interview not found");
//   }
//   interview.status = "abandoned";
//   await interview.save();
//   res.json({ success: true, message: "Interview abandoned" });
// });


// import asyncHandler from "express-async-handler";
// import Interview from "../models/Interview.js";
// import Question from "../models/Question.js";
// import Answer from "../models/Answer.js";
// import Report from "../models/Report.js";
// import Resume from "../models/Resume.js";
// import Notification from "../models/Notification.js";
// import Session from "../models/Session.js";
// import {
//   generateInterviewQuestions,
//   evaluateAnswer,
//   generateReportSummary,
// } from "../utils/openRouterClient.js"; // Changed from geminiClient to openRouterClient

// // @route POST /api/interviews
// // Creates an interview and generates AI questions immediately
// export const createInterview = asyncHandler(async (req, res) => {
//   const {
//     role,
//     experienceLevel,
//     difficulty,
//     interviewType,
//     numberOfQuestions,
//     jobDescription,
//     useResume,
//   } = req.body;

//   let resumeDoc = null;
//   let resumeContext = "";
//   if (useResume) {
//     resumeDoc = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
//     if (resumeDoc) {
//       resumeContext = [
//         resumeDoc.parsed?.skills?.join(", "),
//         resumeDoc.parsed?.experience?.join("; "),
//         resumeDoc.parsed?.projects?.join("; "),
//       ]
//         .filter(Boolean)
//         .join(" | ");

//       if (!resumeContext && resumeDoc.rawText) {
//         // Further truncate to save tokens for free model
//         resumeContext = resumeDoc.rawText.substring(0, 2000);
//       }
//     }
//   }

//   const interview = await Interview.create({
//     user: req.user._id,
//     role,
//     experienceLevel,
//     difficulty,
//     interviewType,
//     numberOfQuestions,
//     jobDescription,
//     resumeSnapshot: resumeDoc?._id,
//     status: "created",
//   });

//   const start = Date.now();
//   const aiQuestions = await generateInterviewQuestions({
//     role,
//     experienceLevel,
//     difficulty,
//     interviewType,
//     numberOfQuestions,
//     resumeContext,
//     jobDescription,
//   });

//   const questionDocs = await Question.insertMany(
//     aiQuestions.map((q) => ({
//       interview: interview._id,
//       order: q.order,
//       text: q.text,
//       category: q.category,
//       topic: q.topic,
//       idealAnswerPoints: q.idealAnswerPoints,
//     }))
//   );

//   interview.questions = questionDocs.map((q) => q._id);
//   interview.status = "in_progress";
//   interview.startedAt = new Date();
//   await interview.save();

//   await Session.create({
//     user: req.user._id,
//     action: "ai_question_gen",
//     meta: { latencyMs: Date.now() - start, count: questionDocs.length },
//   });

//   res.status(201).json({
//     success: true,
//     interview,
//     questions: questionDocs,
//   });
// });

// // @route GET /api/interviews
// export const listInterviews = asyncHandler(async (req, res) => {
//   const { status } = req.query;
//   const filter = { user: req.user._id };
//   if (status) filter.status = status;

//   const interviews = await Interview.find(filter).sort({ createdAt: -1 });
//   res.json({ success: true, interviews });
// });

// // @route GET /api/interviews/:id
// export const getInterview = asyncHandler(async (req, res) => {
//   const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate(
//     "questions"
//   );
//   if (!interview) {
//     res.status(404);
//     throw new Error("Interview not found");
//   }
//   res.json({ success: true, interview });
// });

// // @route POST /api/interviews/:id/answer
// // Submits an answer for a specific question and returns AI evaluation
// export const submitAnswer = asyncHandler(async (req, res) => {
//   const { questionId, userText } = req.body;

//   const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
//   if (!interview) {
//     res.status(404);
//     throw new Error("Interview not found");
//   }

//   const question = await Question.findOne({ _id: questionId, interview: interview._id });
//   if (!question) {
//     res.status(404);
//     throw new Error("Question not found in this interview");
//   }

//   // Truncate long answers for free model to save tokens
//   const truncatedUserText = userText.length > 1500 ? userText.substring(0, 1500) + "..." : userText;

//   const start = Date.now();
//   const evaluation = await evaluateAnswer({
//     questionText: question.text,
//     category: question.category,
//     idealAnswerPoints: question.idealAnswerPoints,
//     userAnswer: truncatedUserText,
//   });

//   const answer = await Answer.create({
//     interview: interview._id,
//     question: question._id,
//     userText: truncatedUserText,
//     evaluation,
//     evaluatedAt: new Date(),
//   });

//   question.answer = answer._id;
//   await question.save();

//   await Session.create({
//     user: req.user._id,
//     action: "ai_evaluation",
//     meta: { latencyMs: Date.now() - start },
//   });

//   res.status(201).json({ success: true, answer });
// });

// // @route POST /api/interviews/:id/complete
// // Finalizes interview, generates aggregate report
// export const completeInterview = asyncHandler(async (req, res) => {
//   const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate(
//     "questions"
//   );
//   if (!interview) {
//     res.status(404);
//     throw new Error("Interview not found");
//   }

//   const answers = await Answer.find({ interview: interview._id }).populate("question");
//   if (answers.length === 0) {
//     res.status(400);
//     throw new Error("Cannot complete an interview with no answered questions");
//   }

//   const answersForSummary = answers.map((a) => ({
//     category: a.question.category,
//     topic: a.question.topic,
//     evaluation: a.evaluation,
//   }));

//   const summary = await generateReportSummary({ role: interview.role, answers: answersForSummary });

//   const report = await Report.create({
//     interview: interview._id,
//     user: req.user._id,
//     ...summary,
//   });

//   interview.status = "completed";
//   interview.completedAt = new Date();
//   interview.durationSeconds = interview.startedAt
//     ? Math.round((interview.completedAt - interview.startedAt) / 1000)
//     : undefined;
//   interview.report = report._id;
//   await interview.save();

//   await Notification.create({
//     user: req.user._id,
//     type: "report_ready",
//     title: "Your interview report is ready",
//     message: `You scored ${summary.overallScore}/100 in your ${interview.role} mock interview.`,
//     link: `/reports/${report._id}`,
//   });

//   res.json({ success: true, interview, report });
// });

// // @route DELETE /api/interviews/:id
// export const abandonInterview = asyncHandler(async (req, res) => {
//   const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
//   if (!interview) {
//     res.status(404);
//     throw new Error("Interview not found");
//   }
//   interview.status = "abandoned";
//   await interview.save();
//   res.json({ success: true, message: "Interview abandoned" });
// });

import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Interview from "../models/Interview.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import Report from "../models/Report.js";
import Resume from "../models/Resume.js";
import Notification from "../models/Notification.js";
import Session from "../models/Session.js";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateReportSummary,
} from "../utils/openRouterClient.js";

// ============================================
// VALIDATION HELPERS
// ============================================

const validateInterviewInput = (data) => {
  const { role, experienceLevel, difficulty, interviewType, numberOfQuestions } = data;
  
  if (!role || role.trim().length < 2) {
    throw new Error("Role is required and must be at least 2 characters");
  }
  if (!experienceLevel) {
    throw new Error("Experience level is required");
  }
  if (!difficulty) {
    throw new Error("Difficulty level is required");
  }
  if (!interviewType) {
    throw new Error("Interview type is required");
  }
  if (!numberOfQuestions || numberOfQuestions < 1 || numberOfQuestions > 30) {
    throw new Error("Number of questions must be between 1 and 30");
  }
};

// ============================================
// @route POST /api/interviews
// @desc Create interview & generate AI questions
// ============================================

export const createInterview = asyncHandler(async (req, res) => {
  const {
    role,
    experienceLevel,
    difficulty,
    interviewType,
    numberOfQuestions,
    jobDescription,
    useResume = false,
  } = req.body;

  // 1. Validate input
  validateInterviewInput(req.body);

  // 2. Get resume context if needed
  let resumeDoc = null;
  let resumeContext = "";

  if (useResume) {
    resumeDoc = await Resume.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    if (resumeDoc) {
      resumeContext = [
        resumeDoc.parsed?.skills?.join(", "),
        resumeDoc.parsed?.experience?.join("; "),
        resumeDoc.parsed?.projects?.join("; "),
      ]
        .filter(Boolean)
        .join(" | ")
        .substring(0, 2000); // Limit for API tokens

      // Fallback to raw text if no parsed data
      if (!resumeContext && resumeDoc.rawText) {
        resumeContext = resumeDoc.rawText.substring(0, 2000);
      }
    }
  }

  // 3. Start session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 4. Create interview
    const interview = await Interview.create([{
      user: req.user._id,
      role: role.trim(),
      experienceLevel,
      difficulty,
      interviewType,
      numberOfQuestions,
      jobDescription: jobDescription?.trim(),
      resumeSnapshot: resumeDoc?._id,
      status: "created",
    }], { session });

    const interviewDoc = interview[0];

    // 5. Generate AI questions
    const startTime = Date.now();
    const aiQuestions = await generateInterviewQuestions({
      role: role.trim(),
      experienceLevel,
      difficulty,
      interviewType,
      numberOfQuestions,
      resumeContext,
      jobDescription: jobDescription?.trim(),
    });

    // 6. Validate AI response
    if (!aiQuestions || !Array.isArray(aiQuestions) || aiQuestions.length === 0) {
      throw new Error("Failed to generate questions. Please try again.");
    }

    // 7. Create question documents
    const questionDocs = await Question.insertMany(
      aiQuestions.map((q, index) => ({
        interview: interviewDoc._id,
        order: q.order || index + 1,
        text: q.text?.trim(),
        category: q.category || "technical",
        topic: q.topic || "general",
        idealAnswerPoints: q.idealAnswerPoints || [],
      })),
      { session }
    );

    // 8. Update interview with questions
    interviewDoc.questions = questionDocs.map((q) => q._id);
    interviewDoc.status = "in_progress";
    interviewDoc.startedAt = new Date();
    await interviewDoc.save({ session });

    // 9. Log session
    await Session.create([{
      user: req.user._id,
      action: "ai_question_gen",
      meta: {
        latencyMs: Date.now() - startTime,
        count: questionDocs.length,
        model: "nemotron",
      },
    }], { session });

    // 10. Commit transaction
    await session.commitTransaction();

    // 11. Send response
    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview: {
        id: interviewDoc._id,
        role: interviewDoc.role,
        status: interviewDoc.status,
        totalQuestions: questionDocs.length,
      },
      questions: questionDocs.map((q) => ({
        id: q._id,
        order: q.order,
        text: q.text,
        category: q.category,
        topic: q.topic,
      })),
    });

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// ============================================
// @route GET /api/interviews
// @desc Get all interviews for current user
// ============================================

export const listInterviews = asyncHandler(async (req, res) => {
  const { status, limit = 20, page = 1 } = req.query;
  
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Parallel queries for performance
  const [interviews, totalCount] = await Promise.all([
    Interview.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("role difficulty status createdAt durationSeconds score")
      .lean(),
    Interview.countDocuments(filter),
  ]);

  res.json({
    success: true,
    interviews,
    pagination: {
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    },
  });
});

// ============================================
// @route GET /api/interviews/:id
// @desc Get single interview with questions
// ============================================

export const getInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid interview ID");
  }

  const interview = await Interview.findOne({
    _id: id,
    user: req.user._id,
  })
    .populate({
      path: "questions",
      select: "text category topic order idealAnswerPoints answer",
      options: { sort: { order: 1 } },
    })
    .populate("report", "overallScore summary strengths weaknesses")
    .lean();

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // Check if interview is expired
  const isExpired = interview.status === "in_progress" && 
    Date.now() - new Date(interview.updatedAt).getTime() > 2 * 60 * 60 * 1000;

  res.json({
    success: true,
    interview: {
      ...interview,
      isExpired,
      progress: interview.questions?.length || 0,
    },
  });
});

// ============================================
// @route POST /api/interviews/:id/answer
// @desc Submit answer & get AI evaluation
// ============================================

export const submitAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questionId, userText } = req.body;

  // 1. Validate inputs
  if (!questionId) {
    res.status(400);
    throw new Error("Question ID is required");
  }
  if (!userText || userText.trim().length < 3) {
    res.status(400);
    throw new Error("Answer must be at least 3 characters");
  }

  // 2. Find interview
  const interview = await Interview.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // 3. Check if interview is still active
  if (interview.status !== "in_progress") {
    res.status(400);
    throw new Error(`Cannot submit answer for ${interview.status} interview`);
  }

  // 4. Find question
  const question = await Question.findOne({
    _id: questionId,
    interview: interview._id,
  });

  if (!question) {
    res.status(404);
    throw new Error("Question not found in this interview");
  }

  // 5. Check if already answered
  if (question.answer) {
    res.status(400);
    throw new Error("This question has already been answered");
  }

  // 6. Truncate long answers for API limits
  const truncatedUserText = userText.trim().length > 1500
    ? userText.trim().substring(0, 1500) + "..."
    : userText.trim();

  // 7. Get AI evaluation
  const startTime = Date.now();
  const evaluation = await evaluateAnswer({
    questionText: question.text,
    category: question.category,
    idealAnswerPoints: question.idealAnswerPoints || [],
    userAnswer: truncatedUserText,
  });

  // 8. Save answer
  const answer = await Answer.create({
    interview: interview._id,
    question: question._id,
    userText: truncatedUserText,
    evaluation: {
      score: evaluation.score || 0,
      feedback: evaluation.feedback || "No feedback provided",
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      keywords: evaluation.keywords || [],
    },
    evaluatedAt: new Date(),
  });

  // 9. Update question
  question.answer = answer._id;
  await question.save();

  // 10. Log session
  await Session.create({
    user: req.user._id,
    action: "ai_evaluation",
    meta: {
      latencyMs: Date.now() - startTime,
      questionId: question._id,
      model: "nemotron",
    },
  });

  // 11. Check if all questions answered
  const answeredCount = await Answer.countDocuments({
    interview: interview._id,
  });

  const isComplete = answeredCount >= interview.numberOfQuestions;

  res.status(201).json({
    success: true,
    answer: {
      id: answer._id,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    },
    progress: {
      answered: answeredCount,
      total: interview.numberOfQuestions,
      isComplete,
    },
  });
});

// ============================================
// @route POST /api/interviews/:id/complete
// @desc Complete interview & generate report
// ============================================

export const completeInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Find interview with questions
  const interview = await Interview.findOne({
    _id: id,
    user: req.user._id,
  }).populate("questions");

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // 2. Check status
  if (interview.status === "completed") {
    res.status(400);
    throw new Error("Interview already completed");
  }

  if (interview.status === "abandoned") {
    res.status(400);
    throw new Error("Interview was abandoned");
  }

  // 3. Get all answers
  const answers = await Answer.find({ interview: interview._id })
    .populate("question")
    .lean();

  if (answers.length === 0) {
    res.status(400);
    throw new Error("Cannot complete interview with no answered questions");
  }

  // 4. Prepare data for report generation
  const answeredQuestions = answers.filter(a => a.evaluation?.score !== undefined);
  
  if (answeredQuestions.length === 0) {
    res.status(400);
    throw new Error("No valid answers found for report generation");
  }

  // 5. Generate report summary
  const answersForSummary = answeredQuestions.map((a) => ({
    category: a.question?.category || "general",
    topic: a.question?.topic || "general",
    evaluation: a.evaluation,
  }));

  const summary = await generateReportSummary({
    role: interview.role,
    answers: answersForSummary,
  });

  // 6. Create report
  const report = await Report.create({
    interview: interview._id,
    user: req.user._id,
    overallScore: summary.overallScore || 0,
    categoryScores: summary.categoryScores || [],
    strengths: summary.strengths || [],
    weaknesses: summary.weaknesses || [],
    summary: summary.summary || "Report generated successfully",
    recommendations: summary.recommendations || [],
    questionPerformance: answeredQuestions.map((a) => ({
      question: a.question._id,
      score: a.evaluation.score,
      timeTaken: a.evaluation.timeTaken || 0,
      feedback: a.evaluation.feedback,
    })),
  });

  // 7. Update interview
  interview.status = "completed";
  interview.completedAt = new Date();
  interview.durationSeconds = interview.startedAt
    ? Math.round((new Date() - new Date(interview.startedAt)) / 1000)
    : undefined;
  interview.report = report._id;
  interview.score = summary.overallScore;
  await interview.save();

  // 8. Create notification
  await Notification.create({
    user: req.user._id,
    type: "report_ready",
    title: "🎯 Your interview report is ready!",
    message: `You scored ${summary.overallScore}/100 in your ${interview.role} mock interview. Check your detailed report now.`,
    link: `/reports/${report._id}`,
    read: false,
  });

  res.json({
    success: true,
    message: "Interview completed successfully",
    interview: {
      id: interview._id,
      role: interview.role,
      status: interview.status,
      durationSeconds: interview.durationSeconds,
      score: interview.score,
    },
    report: {
      id: report._id,
      overallScore: report.overallScore,
      summary: report.summary,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
    },
  });
});

// ============================================
// @route DELETE /api/interviews/:id
// @desc Abandon interview
// ============================================

export const abandonInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await Interview.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  if (interview.status === "completed") {
    res.status(400);
    throw new Error("Cannot abandon a completed interview");
  }

  interview.status = "abandoned";
  await interview.save();

  res.json({
    success: true,
    message: "Interview abandoned successfully",
    interview: {
      id: interview._id,
      status: interview.status,
    },
  });
});

// ============================================
// @route GET /api/interviews/:id/progress
// @desc Get interview progress
// ============================================

export const getInterviewProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await Interview.findOne({
    _id: id,
    user: req.user._id,
  }).select("numberOfQuestions status startedAt");

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  const answeredCount = await Answer.countDocuments({
    interview: interview._id,
  });

  const totalQuestions = interview.numberOfQuestions;
  const percentage = totalQuestions > 0 
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  res.json({
    success: true,
    progress: {
      answered: answeredCount,
      total: totalQuestions,
      percentage,
      status: interview.status,
      isComplete: answeredCount >= totalQuestions,
    },
  });
});

// ============================================
// @route GET /api/interviews/stats
// @desc Get user interview statistics
// ============================================

export const getInterviewStats = asyncHandler(async (req, res) => {
  const stats = await Interview.aggregate([
    {
      $match: {
        user: req.user._id,
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalCompleted: { $sum: 1 },
        averageScore: { $avg: "$score" },
        totalTimeSpent: { $sum: "$durationSeconds" },
        byRole: {
          $push: {
            role: "$role",
            score: "$score",
            duration: "$durationSeconds",
          },
        },
        byDifficulty: {
          $push: {
            difficulty: "$difficulty",
            score: "$score",
          },
        },
      },
    },
  ]);

  const result = stats[0] || {
    totalCompleted: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    byRole: [],
    byDifficulty: [],
  };

  res.json({
    success: true,
    stats: {
      ...result,
      averageTimeMinutes: Math.round(result.totalTimeSpent / 60),
    },
  });
});