// import mongoose from "mongoose";

// const interviewSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

//     role: { type: String, required: true }, // e.g. Frontend Developer, MERN Stack
//     experienceLevel: {
//       type: String,
//       enum: ["fresher", "junior", "mid", "senior"],
//       required: true,
//     },
//     difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
//     interviewType: { type: String, enum: ["technical", "hr", "mixed"], required: true },
//     numberOfQuestions: { type: Number, required: true, min: 1, max: 30 },

//     jobDescription: { type: String },
//     resumeSnapshot: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },

//     status: {
//       type: String,
//       enum: ["created", "in_progress", "completed", "abandoned"],
//       default: "created",
//     },

//     questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
//     report: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },

//     startedAt: { type: Date },
//     completedAt: { type: Date },
//     durationSeconds: { type: Number },
//   },
//   { timestamps: true }
// );

// interviewSchema.index({ user: 1, createdAt: -1 });

// export default mongoose.model("Interview", interviewSchema);

import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, required: true },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior"],
      required: true,
    },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    interviewType: { type: String, enum: ["technical", "hr", "mixed"], required: true },
    numberOfQuestions: { type: Number, required: true, min: 1, max: 30 },
    jobDescription: { type: String },
    resumeSnapshot: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    status: {
      type: String,
      enum: ["created", "in_progress", "completed", "abandoned", "expired"],
      default: "created",
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    report: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
    startedAt: { type: Date },
    completedAt: { type: Date },
    durationSeconds: { type: Number },
  },
  { timestamps: true }
);

// ========== CRITICAL ADDITIONS ==========

// 1. TTL cleanup
interviewSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 86400,
    partialFilterExpression: { status: "in_progress" },
  }
);

// 2. Auto-calculate duration
interviewSchema.pre("save", function(next) {
  if (this.isModified("status") && this.status === "completed") {
    if (!this.startedAt) {
      return next(new Error("Cannot complete without startedAt"));
    }
    this.durationSeconds = Math.floor(
      (this.completedAt || Date.now()) - this.startedAt
    ) / 1000;
    this.completedAt = new Date();
  }
  if (this.isModified("status") && this.status === "in_progress" && !this.startedAt) {
    this.startedAt = new Date();
  }
  next();
});

// 3. Better indexes
interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Interview", interviewSchema);