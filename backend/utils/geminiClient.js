// import { GoogleGenerativeAI } from "@google/generative-ai";
// import logger from "./logger.js";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// const model = genAI.getGenerativeModel({
//   model: MODEL_NAME,
//   generationConfig: {
//     responseMimeType: "application/json",
//     temperature: 0.7,
//   },
// });

// /**
//  * Core call wrapper - sends a prompt, parses JSON response, retries once on parse failure.
//  */
// const callGemini = async (prompt) => {
//   const start = Date.now();
//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();
//     const latencyMs = Date.now() - start;
//     logger.debug(`Gemini call completed in ${latencyMs}ms`);
//     try {
//       return { data: JSON.parse(text), latencyMs };
//     } catch {
//       // Sometimes the model wraps JSON in markdown fences despite instructions
//       const cleaned = text.replace(/```json|```/g, "").trim();
//       return { data: JSON.parse(cleaned), latencyMs };
//     }
//   } catch (err) {
//     logger.error(`Gemini API error: ${err.message}`);
//     throw new Error("AI service is temporarily unavailable. Please try again.");
//   }
// };

// export const generateInterviewQuestions = async ({
//   role,
//   experienceLevel,
//   difficulty,
//   interviewType,
//   numberOfQuestions,
//   resumeContext,
//   jobDescription,
// }) => {
//   const prompt = `
// You are a senior technical interviewer generating a mock interview question set.

// Candidate role: ${role}
// Experience level: ${experienceLevel}
// Difficulty: ${difficulty}
// Interview type: ${interviewType} (technical / hr / mixed)
// Number of questions: ${numberOfQuestions}
// ${resumeContext ? `Candidate resume summary: ${resumeContext}` : ""}
// ${jobDescription ? `Target job description: ${jobDescription}` : ""}

// Generate exactly ${numberOfQuestions} interview questions tailored to this candidate.
// If interviewType is "mixed", blend technical and HR/behavioral questions.
// Each question needs 2-4 concise ideal-answer key points an evaluator should look for.

// Respond ONLY with valid JSON in this exact shape, no markdown, no commentary:
// {
//   "questions": [
//     {
//       "order": 1,
//       "text": "question text",
//       "category": "technical" | "hr" | "behavioral" | "situational",
//       "topic": "short topic label",
//       "idealAnswerPoints": ["point1", "point2"]
//     }
//   ]
// }
// `;
//   const { data } = await callGemini(prompt);
//   return data.questions;
// };

// export const evaluateAnswer = async ({ questionText, category, idealAnswerPoints, userAnswer }) => {
//   const prompt = `
// You are an expert interview evaluator. Evaluate the candidate's answer below.

// Question: ${questionText}
// Category: ${category}
// Key points a strong answer should cover: ${JSON.stringify(idealAnswerPoints || [])}
// Candidate's answer: """${userAnswer}"""

// Score each dimension from 0-10 (integers), then compute an overall score (0-10, can be decimal, weighted average).
// Provide specific, constructive feedback (2-4 sentences), a concise model/correct answer, and 2-3 improvement suggestions.

// Respond ONLY with valid JSON in this exact shape:
// {
//   "technicalAccuracy": 0,
//   "communication": 0,
//   "confidence": 0,
//   "problemSolving": 0,
//   "clarity": 0,
//   "overallScore": 0,
//   "feedback": "string",
//   "correctAnswer": "string",
//   "improvementSuggestions": ["string", "string"]
// }
// `;
//   const { data } = await callGemini(prompt);
//   return data;
// };

// export const analyzeResume = async ({ resumeText }) => {
//   const prompt = `
// You are an ATS (Applicant Tracking System) and resume expert.

// Resume text:
// """${resumeText.slice(0, 8000)}"""

// Analyze this resume and extract structured data plus improvement feedback.

// Respond ONLY with valid JSON in this exact shape:
// {
//   "parsed": {
//     "skills": ["string"],
//     "experience": ["string - one entry per role/summary line"],
//     "education": ["string"],
//     "projects": ["string"],
//     "certifications": ["string"]
//   },
//   "analysis": {
//     "atsScore": 0,
//     "missingSkills": ["string"],
//     "improvements": ["string"],
//     "grammarSuggestions": ["string"],
//     "formattingSuggestions": ["string"]
//   }
// }
// `;
//   const { data } = await callGemini(prompt);
//   return data;
// };

// export const analyzeJobDescriptionMatch = async ({ resumeText, jobDescription }) => {
//   const prompt = `
// Compare this candidate's resume against the target job description.

// Resume:
// """${resumeText.slice(0, 6000)}"""

// Job Description:
// """${jobDescription.slice(0, 4000)}"""

// Respond ONLY with valid JSON in this exact shape:
// {
//   "matchPercentage": 0,
//   "missingSkills": ["string"],
//   "keywords": ["string - important JD keywords"],
//   "suggestions": ["string - how to improve the resume for this JD"]
// }
// `;
//   const { data } = await callGemini(prompt);
//   return data;
// };

// export const generateReportSummary = async ({ role, answers }) => {
//   const simplified = answers.map((a) => ({
//     category: a.category,
//     topic: a.topic,
//     overallScore: a.evaluation?.overallScore,
//     feedback: a.evaluation?.feedback,
//   }));

//   const prompt = `
// You are summarizing a completed mock interview for role: ${role}.

// Per-question results: ${JSON.stringify(simplified)}

// Produce an overall performance summary.

// Respond ONLY with valid JSON in this exact shape:
// {
//   "overallScore": 0,
//   "technicalScore": 0,
//   "communicationScore": 0,
//   "confidenceScore": 0,
//   "strengths": ["string"],
//   "weaknesses": ["string"],
//   "recommendedTopics": ["string"],
//   "summary": "2-4 sentence narrative summary of performance"
// }
// Scores should be 0-100 scale.
// `;
//   const { data } = await callGemini(prompt);
//   return data;
// };

// export default { model: MODEL_NAME };


// import logger from "./logger.js";

// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
// const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// /**
//  * Core call wrapper - sends a prompt to OpenRouter, parses JSON response, retries once on parse failure.
//  */
// const callOpenRouter = async (prompt) => {
//   const start = Date.now();
  
//   if (!OPENROUTER_API_KEY) {
//     logger.error("OpenRouter API key is not configured");
//     throw new Error("AI service is not configured. Please set OPENROUTER_API_KEY.");
//   }

//   try {
//     const response = await fetch(OPENROUTER_BASE_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
//         "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
//         "X-Title": "Interview Mocker",
//       },
//       body: JSON.stringify({
//         model: OPENROUTER_MODEL,
//         messages: [
//           {
//             role: "system",
//             content: "You are a helpful AI assistant. Always respond with valid JSON only, no markdown formatting, no commentary."
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ],
//         temperature: 0.7,
//         response_format: { type: "json_object" },
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       logger.error(`OpenRouter API error: ${response.status} - ${errorText}`);
//       throw new Error(`OpenRouter API error: ${response.status}`);
//     }

//     const result = await response.json();
//     const text = result.choices[0]?.message?.content || "";
//     const latencyMs = Date.now() - start;
//     logger.debug(`OpenRouter call completed in ${latencyMs}ms`);

//     try {
//       return { data: JSON.parse(text), latencyMs };
//     } catch {
//       // Sometimes the model wraps JSON in markdown fences despite instructions
//       const cleaned = text.replace(/```json|```/g, "").trim();
//       return { data: JSON.parse(cleaned), latencyMs };
//     }
//   } catch (err) {
//     logger.error(`OpenRouter API error: ${err.message}`);
//     if (err.message.includes("429")) {
//       throw new Error("Rate limit exceeded. Please try again in a moment.");
//     }
//     throw new Error("AI service is temporarily unavailable. Please try again.");
//   }
// };

// export const generateInterviewQuestions = async ({
//   role,
//   experienceLevel,
//   difficulty,
//   interviewType,
//   numberOfQuestions,
//   resumeContext,
//   jobDescription,
// }) => {
//   const prompt = `
// You are a senior technical interviewer generating a mock interview question set.

// Candidate role: ${role}
// Experience level: ${experienceLevel}
// Difficulty: ${difficulty}
// Interview type: ${interviewType} (technical / hr / mixed)
// Number of questions: ${numberOfQuestions}
// ${resumeContext ? `Candidate resume summary: ${resumeContext}` : ""}
// ${jobDescription ? `Target job description: ${jobDescription}` : ""}

// Generate exactly ${numberOfQuestions} interview questions tailored to this candidate.
// If interviewType is "mixed", blend technical and HR/behavioral questions.
// Each question needs 2-4 concise ideal-answer key points an evaluator should look for.

// Respond ONLY with valid JSON in this exact shape, no markdown, no commentary:
// {
//   "questions": [
//     {
//       "order": 1,
//       "text": "question text",
//       "category": "technical" | "hr" | "behavioral" | "situational",
//       "topic": "short topic label",
//       "idealAnswerPoints": ["point1", "point2"]
//     }
//   ]
// }
// `;
//   const { data } = await callOpenRouter(prompt);
//   return data.questions;
// };

// export const evaluateAnswer = async ({ questionText, category, idealAnswerPoints, userAnswer }) => {
//   const prompt = `
// You are an expert interview evaluator. Evaluate the candidate's answer below.

// Question: ${questionText}
// Category: ${category}
// Key points a strong answer should cover: ${JSON.stringify(idealAnswerPoints || [])}
// Candidate's answer: """${userAnswer}"""

// Score each dimension from 0-10 (integers), then compute an overall score (0-10, can be decimal, weighted average).
// Provide specific, constructive feedback (2-4 sentences), a concise model/correct answer, and 2-3 improvement suggestions.

// Respond ONLY with valid JSON in this exact shape:
// {
//   "technicalAccuracy": 0,
//   "communication": 0,
//   "confidence": 0,
//   "problemSolving": 0,
//   "clarity": 0,
//   "overallScore": 0,
//   "feedback": "string",
//   "correctAnswer": "string",
//   "improvementSuggestions": ["string", "string"]
// }
// `;
//   const { data } = await callOpenRouter(prompt);
//   return data;
// };

// export const analyzeResume = async ({ resumeText }) => {
//   const prompt = `
// You are an ATS (Applicant Tracking System) and resume expert.

// Resume text:
// """${resumeText.slice(0, 8000)}"""

// Analyze this resume and extract structured data plus improvement feedback.

// Respond ONLY with valid JSON in this exact shape:
// {
//   "parsed": {
//     "skills": ["string"],
//     "experience": ["string - one entry per role/summary line"],
//     "education": ["string"],
//     "projects": ["string"],
//     "certifications": ["string"]
//   },
//   "analysis": {
//     "atsScore": 0,
//     "missingSkills": ["string"],
//     "improvements": ["string"],
//     "grammarSuggestions": ["string"],
//     "formattingSuggestions": ["string"]
//   }
// }
// `;
//   const { data } = await callOpenRouter(prompt);
//   return data;
// };

// export const analyzeJobDescriptionMatch = async ({ resumeText, jobDescription }) => {
//   const prompt = `
// Compare this candidate's resume against the target job description.

// Resume:
// """${resumeText.slice(0, 6000)}"""

// Job Description:
// """${jobDescription.slice(0, 4000)}"""

// Respond ONLY with valid JSON in this exact shape:
// {
//   "matchPercentage": 0,
//   "missingSkills": ["string"],
//   "keywords": ["string - important JD keywords"],
//   "suggestions": ["string - how to improve the resume for this JD"]
// }
// `;
//   const { data } = await callOpenRouter(prompt);
//   return data;
// };

// export const generateReportSummary = async ({ role, answers }) => {
//   const simplified = answers.map((a) => ({
//     category: a.category,
//     topic: a.topic,
//     overallScore: a.evaluation?.overallScore,
//     feedback: a.evaluation?.feedback,
//   }));

//   const prompt = `
// You are summarizing a completed mock interview for role: ${role}.

// Per-question results: ${JSON.stringify(simplified)}

// Produce an overall performance summary.

// Respond ONLY with valid JSON in this exact shape:
// {
//   "overallScore": 0,
//   "technicalScore": 0,
//   "communicationScore": 0,
//   "confidenceScore": 0,
//   "strengths": ["string"],
//   "weaknesses": ["string"],
//   "recommendedTopics": ["string"],
//   "summary": "2-4 sentence narrative summary of performance"
// }
// Scores should be 0-100 scale.
// `;
//   const { data } = await callOpenRouter(prompt);
//   return data;
// };

// export default { model: OPENROUTER_MODEL };


import logger from "./logger.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// Aggressive token limits for free model
const MAX_OUTPUT_TOKENS = 1024; // Free model may have stricter limits
const MAX_INPUT_CHARS = {
  analyzeResume: 2000,
  analyzeJobDescription: 1500,
  generateQuestions: 1500,
  evaluateAnswer: 1000,
  generateReport: 1000,
  default: 1500
};

/**
 * Truncate text to save tokens for free model
 */
const truncateText = (text, maxChars) => {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "... (truncated)";
};

/**
 * Core call wrapper for OpenRouter with free NVIDIA model
 */
const callOpenRouter = async (prompt, maxTokens = MAX_OUTPUT_TOKENS) => {
  const start = Date.now();
  
  if (!OPENROUTER_API_KEY) {
    logger.error("OpenRouter API key is not configured");
    throw new Error("AI service is not configured. Please set OPENROUTER_API_KEY.");
  }

  try {
    const promptSize = prompt.length;
    logger.debug(`Prompt size: ${promptSize} characters (~${Math.ceil(promptSize/4)} tokens)`);

    const response = await fetch(OPENROUTER_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Interview Mocker",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant. Respond with valid JSON only. Be concise and focused."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5, // Lower temperature for more consistent JSON output
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`OpenRouter API error: ${response.status} - ${errorText}`);
      
      if (response.status === 402) {
        throw new Error("Insufficient credits. Please add credits or switch to another free model.");
      }
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.choices[0]?.message?.content || "";
    const latencyMs = Date.now() - start;
    logger.debug(`OpenRouter call completed in ${latencyMs}ms`);

    if (result.usage) {
      logger.debug(`Token usage - Prompt: ${result.usage.prompt_tokens}, Completion: ${result.usage.completion_tokens}, Total: ${result.usage.total_tokens}`);
    }

    try {
      return { data: JSON.parse(text), latencyMs };
    } catch {
      const cleaned = text.replace(/```json|```/g, "").trim();
      return { data: JSON.parse(cleaned), latencyMs };
    }
  } catch (err) {
    logger.error(`OpenRouter API error: ${err.message}`);
    if (err.message.includes("402") || err.message.includes("credits")) {
      throw new Error("OpenRouter credit limit exceeded. Please add credits or use the free model.");
    }
    throw new Error("AI service is temporarily unavailable. Please try again.");
  }
};

export const generateInterviewQuestions = async ({
  role,
  experienceLevel,
  difficulty,
  interviewType,
  numberOfQuestions,
  resumeContext,
  jobDescription,
}) => {
  // Aggressive truncation for free model
  const truncatedResume = resumeContext ? truncateText(resumeContext, MAX_INPUT_CHARS.generateQuestions) : "";
  const truncatedJobDesc = jobDescription ? truncateText(jobDescription, MAX_INPUT_CHARS.generateQuestions) : "";

  const prompt = `
Generate ${numberOfQuestions} interview questions for:
Role: ${role}
Level: ${experienceLevel}
Difficulty: ${difficulty}
Type: ${interviewType}
${truncatedResume ? `Resume: ${truncatedResume}` : ""}
${truncatedJobDesc ? `JD: ${truncatedJobDesc}` : ""}

Return JSON only:
{
  "questions": [
    {
      "order": 1,
      "text": "question",
      "category": "technical|hr|behavioral|situational",
      "topic": "topic",
      "idealAnswerPoints": ["point1", "point2"]
    }
  ]
}
`;
  const { data } = await callOpenRouter(prompt, 1024);
  return data.questions;
};

export const evaluateAnswer = async ({ questionText, category, idealAnswerPoints, userAnswer }) => {
  const truncatedAnswer = truncateText(userAnswer, MAX_INPUT_CHARS.evaluateAnswer);

  const prompt = `
Evaluate answer:
Q: ${questionText}
Category: ${category}
Key points: ${JSON.stringify(idealAnswerPoints || [])}
Answer: ${truncatedAnswer}

Return JSON:
{
  "technicalAccuracy": 0,
  "communication": 0,
  "confidence": 0,
  "problemSolving": 0,
  "clarity": 0,
  "overallScore": 0,
  "feedback": "string",
  "correctAnswer": "string",
  "improvementSuggestions": ["string", "string"]
}
`;
  const { data } = await callOpenRouter(prompt, 800);
  return data;
};

export const analyzeResume = async ({ resumeText }) => {
  const truncatedResume = truncateText(resumeText, MAX_INPUT_CHARS.analyzeResume);

  const prompt = `
Analyze resume:
${truncatedResume}

Return JSON:
{
  "parsed": {
    "skills": ["string"],
    "experience": ["string"],
    "education": ["string"],
    "projects": ["string"],
    "certifications": ["string"]
  },
  "analysis": {
    "atsScore": 0,
    "missingSkills": ["string"],
    "improvements": ["string"],
    "grammarSuggestions": ["string"],
    "formattingSuggestions": ["string"]
  }
}
`;
  const { data } = await callOpenRouter(prompt, 1024);
  return data;
};

export const analyzeJobDescriptionMatch = async ({ resumeText, jobDescription }) => {
  const truncatedResume = truncateText(resumeText, MAX_INPUT_CHARS.analyzeJobDescription);
  const truncatedJobDesc = truncateText(jobDescription, MAX_INPUT_CHARS.analyzeJobDescription);

  const prompt = `
Match resume to JD:
Resume: ${truncatedResume}
JD: ${truncatedJobDesc}

Return JSON:
{
  "matchPercentage": 0,
  "missingSkills": ["string"],
  "keywords": ["string"],
  "suggestions": ["string"]
}
`;
  const { data } = await callOpenRouter(prompt, 1024);
  return data;
};

export const generateReportSummary = async ({ role, answers }) => {
  const simplified = answers.map((a) => ({
    category: a.category,
    score: a.evaluation?.overallScore,
  }));

  const prompt = `
Summarize interview for ${role}:
${JSON.stringify(simplified)}

Return JSON:
{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "confidenceScore": 0,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendedTopics": ["string"],
  "summary": "brief summary"
}
`;
  const { data } = await callOpenRouter(prompt, 800);
  return data;
};

export default { model: OPENROUTER_MODEL };