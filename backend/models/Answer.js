import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    userText: { type: String, required: true },

    evaluation: {
      technicalAccuracy: { type: Number, min: 0, max: 10 },
      communication: { type: Number, min: 0, max: 10 },
      confidence: { type: Number, min: 0, max: 10 },
      problemSolving: { type: Number, min: 0, max: 10 },
      clarity: { type: Number, min: 0, max: 10 },
      overallScore: { type: Number, min: 0, max: 10 },
      feedback: { type: String },
      correctAnswer: { type: String },
      improvementSuggestions: [{ type: String }],
    },

    evaluatedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Answer", answerSchema);
