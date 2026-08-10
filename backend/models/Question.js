import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, index: true },
    order: { type: Number, required: true },
    text: { type: String, required: true },
    category: { type: String, enum: ["technical", "hr", "behavioral", "situational"], required: true },
    topic: { type: String }, // e.g. "React Hooks", "System Design", "Leadership"
    idealAnswerPoints: [{ type: String }], // key points AI expects
    answer: { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
