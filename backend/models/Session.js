import mongoose from "mongoose";

// Tracks login sessions (for admin "System Logs" / active sessions view)
// and can double as a lightweight audit log for AI API usage.
const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshToken: { type: String, select: false },
    userAgent: { type: String },
    ip: { type: String },
    action: {
      type: String,
      enum: ["login", "logout", "ai_question_gen", "ai_evaluation", "resume_analysis", "jd_analysis"],
      default: "login",
    },
    meta: { type: mongoose.Schema.Types.Mixed }, // e.g. { tokensUsed, model, latencyMs }
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

sessionSchema.index({ createdAt: -1 });

export default mongoose.model("Session", sessionSchema);
