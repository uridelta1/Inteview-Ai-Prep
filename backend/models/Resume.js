import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "docx"], required: true },
    originalName: { type: String },
    rawText: { type: String }, // extracted text

    parsed: {
      skills: [{ type: String }],
      experience: [{ type: String }],
      education: [{ type: String }],
      projects: [{ type: String }],
      certifications: [{ type: String }],
    },

    analysis: {
      atsScore: { type: Number, min: 0, max: 100 },
      missingSkills: [{ type: String }],
      improvements: [{ type: String }],
      grammarSuggestions: [{ type: String }],
      formattingSuggestions: [{ type: String }],
      analyzedAt: { type: Date },
    },

    jobDescriptionMatch: {
      jobDescription: { type: String },
      matchPercentage: { type: Number, min: 0, max: 100 },
      missingSkills: [{ type: String }],
      keywords: [{ type: String }],
      suggestions: [{ type: String }],
      analyzedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
