// import logger from "./logger.js";

// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// const OPENROUTER_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
// const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// // Aggressive token limits for free model
// const MAX_OUTPUT_TOKENS = 1024; // Free model may have stricter limits
// const MAX_INPUT_CHARS = {
//   analyzeResume: 2000,
//   analyzeJobDescription: 1500,
//   generateQuestions: 1500,
//   evaluateAnswer: 1000,
//   generateReport: 1000,
//   default: 1500
// };

// /**
//  * Truncate text to save tokens for free model
//  */
// const truncateText = (text, maxChars) => {
//   if (!text) return "";
//   if (text.length <= maxChars) return text;
//   return text.slice(0, maxChars) + "... (truncated)";
// };

// /**
//  * Core call wrapper for OpenRouter with free NVIDIA model
//  */
// const callOpenRouter = async (prompt, maxTokens = MAX_OUTPUT_TOKENS) => {
//   const start = Date.now();
  
//   if (!OPENROUTER_API_KEY) {
//     logger.error("OpenRouter API key is not configured");
//     throw new Error("AI service is not configured. Please set OPENROUTER_API_KEY.");
//   }

//   try {
//     const promptSize = prompt.length;
//     logger.debug(`Prompt size: ${promptSize} characters (~${Math.ceil(promptSize/4)} tokens)`);

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
//             content: "You are a helpful AI assistant. Respond with valid JSON only. Be concise and focused."
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ],
//         temperature: 0.5, // Lower temperature for more consistent JSON output
//         max_tokens: maxTokens,
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       logger.error(`OpenRouter API error: ${response.status} - ${errorText}`);
      
//       if (response.status === 402) {
//         throw new Error("Insufficient credits. Please add credits or switch to another free model.");
//       }
//       if (response.status === 429) {
//         throw new Error("Rate limit exceeded. Please wait a moment and try again.");
//       }
//       throw new Error(`OpenRouter API error: ${response.status}`);
//     }

//     const result = await response.json();
//     const text = result.choices[0]?.message?.content || "";
//     const latencyMs = Date.now() - start;
//     logger.debug(`OpenRouter call completed in ${latencyMs}ms`);

//     if (result.usage) {
//       logger.debug(`Token usage - Prompt: ${result.usage.prompt_tokens}, Completion: ${result.usage.completion_tokens}, Total: ${result.usage.total_tokens}`);
//     }

//     try {
//       return { data: JSON.parse(text), latencyMs };
//     } catch {
//       const cleaned = text.replace(/```json|```/g, "").trim();
//       return { data: JSON.parse(cleaned), latencyMs };
//     }
//   } catch (err) {
//     logger.error(`OpenRouter API error: ${err.message}`);
//     if (err.message.includes("402") || err.message.includes("credits")) {
//       throw new Error("OpenRouter credit limit exceeded. Please add credits or use the free model.");
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
//   // Aggressive truncation for free model
//   const truncatedResume = resumeContext ? truncateText(resumeContext, MAX_INPUT_CHARS.generateQuestions) : "";
//   const truncatedJobDesc = jobDescription ? truncateText(jobDescription, MAX_INPUT_CHARS.generateQuestions) : "";

//   const prompt = `
// Generate ${numberOfQuestions} interview questions for:
// Role: ${role}
// Level: ${experienceLevel}
// Difficulty: ${difficulty}
// Type: ${interviewType}
// ${truncatedResume ? `Resume: ${truncatedResume}` : ""}
// ${truncatedJobDesc ? `JD: ${truncatedJobDesc}` : ""}

// Return JSON only:
// {
//   "questions": [
//     {
//       "order": 1,
//       "text": "question",
//       "category": "technical|hr|behavioral|situational",
//       "topic": "topic",
//       "idealAnswerPoints": ["point1", "point2"]
//     }
//   ]
// }
// `;
//   const { data } = await callOpenRouter(prompt, 1024);
//   return data.questions;
// };

// export const evaluateAnswer = async ({ questionText, category, idealAnswerPoints, userAnswer }) => {
//   const truncatedAnswer = truncateText(userAnswer, MAX_INPUT_CHARS.evaluateAnswer);

//   const prompt = `
// Evaluate answer:
// Q: ${questionText}
// Category: ${category}
// Key points: ${JSON.stringify(idealAnswerPoints || [])}
// Answer: ${truncatedAnswer}

// Return JSON:
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
//   const { data } = await callOpenRouter(prompt, 800);
//   return data;
// };

// export const analyzeResume = async ({ resumeText }) => {
//   const truncatedResume = truncateText(resumeText, MAX_INPUT_CHARS.analyzeResume);

//   const prompt = `
// Analyze resume:
// ${truncatedResume}

// Return JSON:
// {
//   "parsed": {
//     "skills": ["string"],
//     "experience": ["string"],
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
//   const { data } = await callOpenRouter(prompt, 1024);
//   return data;
// };

// export const analyzeJobDescriptionMatch = async ({ resumeText, jobDescription }) => {
//   const truncatedResume = truncateText(resumeText, MAX_INPUT_CHARS.analyzeJobDescription);
//   const truncatedJobDesc = truncateText(jobDescription, MAX_INPUT_CHARS.analyzeJobDescription);

//   const prompt = `
// Match resume to JD:
// Resume: ${truncatedResume}
// JD: ${truncatedJobDesc}

// Return JSON:
// {
//   "matchPercentage": 0,
//   "missingSkills": ["string"],
//   "keywords": ["string"],
//   "suggestions": ["string"]
// }
// `;
//   const { data } = await callOpenRouter(prompt, 1024);
//   return data;
// };

// export const generateReportSummary = async ({ role, answers }) => {
//   const simplified = answers.map((a) => ({
//     category: a.category,
//     score: a.evaluation?.overallScore,
//   }));

//   const prompt = `
// Summarize interview for ${role}:
// ${JSON.stringify(simplified)}

// Return JSON:
// {
//   "overallScore": 0,
//   "technicalScore": 0,
//   "communicationScore": 0,
//   "confidenceScore": 0,
//   "strengths": ["string"],
//   "weaknesses": ["string"],
//   "recommendedTopics": ["string"],
//   "summary": "brief summary"
// }
// `;
//   const { data } = await callOpenRouter(prompt, 800);
//   return data;
// };

// export default { model: OPENROUTER_MODEL };

// import axios from "axios";
// import logger from "./logger.js";

// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// const OPENROUTER_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
// const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// // Aggressive token limits for free model
// const MAX_OUTPUT_TOKENS = 1024;
// const MAX_INPUT_CHARS = {
//   analyzeResume: 2000,
//   analyzeJobDescription: 1500,
//   generateQuestions: 1500,
//   evaluateAnswer: 1000,
//   generateReport: 1000,
//   default: 1500
// };

// /**
//  * Truncate text to save tokens for free model
//  */
// const truncateText = (text, maxChars) => {
//   if (!text) return "";
//   if (text.length <= maxChars) return text;
//   return text.slice(0, maxChars) + "... (truncated)";
// };

// /**
//  * Core call wrapper for OpenRouter with free NVIDIA model
//  */
// const callOpenRouter = async (prompt, maxTokens = MAX_OUTPUT_TOKENS) => {
//   const start = Date.now();
  
//   if (!OPENROUTER_API_KEY) {
//     logger.error("OpenRouter API key is not configured");
//     throw new Error("AI service is not configured. Please set OPENROUTER_API_KEY.");
//   }

//   try {
//     const promptSize = prompt.length;
//     logger.debug(`Prompt size: ${promptSize} characters (~${Math.ceil(promptSize/4)} tokens)`);

//     const response = await axios({
//       method: "POST",
//       url: OPENROUTER_BASE_URL,
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
//         "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
//         "X-Title": "Interview Mocker",
//       },
//       data: {
//         model: OPENROUTER_MODEL,
//         messages: [
//           {
//             role: "system",
//             content: "You are a helpful AI assistant. Respond with valid JSON only. Be concise and focused."
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ],
//         temperature: 0.5,
//         max_tokens: maxTokens,
//       },
//       timeout: 30000, // 30 seconds timeout
//     });

//     const text = response.data.choices[0]?.message?.content || "";
//     const latencyMs = Date.now() - start;
//     logger.debug(`OpenRouter call completed in ${latencyMs}ms`);

//     if (response.data.usage) {
//       logger.debug(`Token usage - Prompt: ${response.data.usage.prompt_tokens}, Completion: ${response.data.usage.completion_tokens}, Total: ${response.data.usage.total_tokens}`);
//     }

//     try {
//       return { data: JSON.parse(text), latencyMs };
//     } catch {
//       const cleaned = text.replace(/```json|```/g, "").trim();
//       return { data: JSON.parse(cleaned), latencyMs };
//     }
//   } catch (err) {
//     logger.error(`OpenRouter API error: ${err.message}`);
    
//     // Handle different error types
//     if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
//       throw new Error("Request timed out. Please try again.");
//     }
//     if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
//       throw new Error("Network error. Please check your internet connection.");
//     }
//     if (err.response?.status === 402) {
//       throw new Error("Insufficient credits. Please add credits or switch to another free model.");
//     }
//     if (err.response?.status === 429) {
//       throw new Error("Rate limit exceeded. Please wait a moment and try again.");
//     }
//     if (err.response?.status === 401) {
//       throw new Error("Invalid OpenRouter API key. Please check your configuration.");
//     }
    
//     throw new Error(`AI service error: ${err.message}`);
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
//   const truncatedResume = resumeContext ? truncateText(resumeContext, MAX_INPUT_CHARS.generateQuestions) : "";
//   const truncatedJobDesc = jobDescription ? truncateText(jobDescription, MAX_INPUT_CHARS.generateQuestions) : "";

//   const prompt = `
// Generate ${numberOfQuestions} interview questions for:
// Role: ${role}
// Level: ${experienceLevel}
// Difficulty: ${difficulty}
// Type: ${interviewType}
// ${truncatedResume ? `Resume: ${truncatedResume}` : ""}
// ${truncatedJobDesc ? `JD: ${truncatedJobDesc}` : ""}

// Return JSON only:
// {
//   "questions": [
//     {
//       "order": 1,
//       "text": "question",
//       "category": "technical|hr|behavioral|situational",
//       "topic": "topic",
//       "idealAnswerPoints": ["point1", "point2"]
//     }
//   ]
// }
// `;
//   const { data } = await callOpenRouter(prompt, 1024);
//   return data.questions;
// };

// export const evaluateAnswer = async ({ questionText, category, idealAnswerPoints, userAnswer }) => {
//   const truncatedAnswer = truncateText(userAnswer, MAX_INPUT_CHARS.evaluateAnswer);

//   const prompt = `
// Evaluate answer:
// Q: ${questionText}
// Category: ${category}
// Key points: ${JSON.stringify(idealAnswerPoints || [])}
// Answer: ${truncatedAnswer}

// Return JSON:
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
//   const { data } = await callOpenRouter(prompt, 800);
//   return data;
// };

// export const analyzeResume = async ({ resumeText }) => {
//   const truncatedResume = truncateText(resumeText, MAX_INPUT_CHARS.analyzeResume);

//   const prompt = `
// Analyze resume:
// ${truncatedResume}

// Return JSON:
// {
//   "parsed": {
//     "skills": ["string"],
//     "experience": ["string"],
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
//   const { data } = await callOpenRouter(prompt, 1024);
//   return data;
// };

// export const analyzeJobDescriptionMatch = async ({ resumeText, jobDescription }) => {
//   const truncatedResume = truncateText(resumeText, MAX_INPUT_CHARS.analyzeJobDescription);
//   const truncatedJobDesc = truncateText(jobDescription, MAX_INPUT_CHARS.analyzeJobDescription);

//   const prompt = `
// Match resume to JD:
// Resume: ${truncatedResume}
// JD: ${truncatedJobDesc}

// Return JSON:
// {
//   "matchPercentage": 0,
//   "missingSkills": ["string"],
//   "keywords": ["string"],
//   "suggestions": ["string"]
// }
// `;
//   const { data } = await callOpenRouter(prompt, 1024);
//   return data;
// };

// export const generateReportSummary = async ({ role, answers }) => {
//   const simplified = answers.map((a) => ({
//     category: a.category,
//     score: a.evaluation?.overallScore,
//   }));

//   const prompt = `
// Summarize interview for ${role}:
// ${JSON.stringify(simplified)}

// Return JSON:
// {
//   "overallScore": 0,
//   "technicalScore": 0,
//   "communicationScore": 0,
//   "confidenceScore": 0,
//   "strengths": ["string"],
//   "weaknesses": ["string"],
//   "recommendedTopics": ["string"],
//   "summary": "brief summary"
// }
// `;
//   const { data } = await callOpenRouter(prompt, 800);
//   return data;
// };

// export default { model: OPENROUTER_MODEL };

import axios from "axios";
import logger from "./logger.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// Aggressive token limits for free model
const MAX_OUTPUT_TOKENS = 1024;
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

    const response = await axios({
      method: "POST",
      url: OPENROUTER_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Interview Mocker",
      },
      data: {
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
        temperature: 0.5,
        max_tokens: maxTokens,
      },
      timeout: 30000,
    });

    // Log full response for debugging
    logger.debug("OpenRouter response status:", response.status);
    logger.debug("OpenRouter response headers:", response.headers);

    // Check if response has the expected structure
    if (!response.data) {
      logger.error("No data in OpenRouter response");
      throw new Error("Invalid response from OpenRouter API");
    }

    // Check for API errors
    if (response.data.error) {
      logger.error("OpenRouter API error:", response.data.error);
      throw new Error(`OpenRouter API error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
    }

    // Check if choices array exists and has elements
    if (!response.data.choices || !Array.isArray(response.data.choices) || response.data.choices.length === 0) {
      logger.error("Invalid choices array in OpenRouter response:", response.data);
      throw new Error("No completion choices returned from OpenRouter");
    }

    const text = response.data.choices[0]?.message?.content || "";
    
    if (!text) {
      logger.error("Empty content in OpenRouter response:", response.data);
      throw new Error("Empty response from OpenRouter API");
    }

    const latencyMs = Date.now() - start;
    logger.debug(`OpenRouter call completed in ${latencyMs}ms`);

    if (response.data.usage) {
      logger.debug(`Token usage - Prompt: ${response.data.usage.prompt_tokens}, Completion: ${response.data.usage.completion_tokens}, Total: ${response.data.usage.total_tokens}`);
    }

    // Try to parse JSON with better error handling
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      // Try cleaning markdown
      const cleaned = text.replace(/```json|```/g, "").trim();
      try {
        parsedData = JSON.parse(cleaned);
      } catch (secondParseError) {
        logger.error("Failed to parse JSON from OpenRouter response:", text);
        throw new Error("Invalid JSON response from AI service");
      }
    }

    return { data: parsedData, latencyMs };
  } catch (err) {
    logger.error(`OpenRouter API error: ${err.message}`);
    
    // Log the full error for debugging
    if (err.response) {
      logger.error("OpenRouter error response status:", err.response.status);
      logger.error("OpenRouter error response data:", err.response.data);
    }
    
    // Handle different error types
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      throw new Error("Request timed out. Please try again.");
    }
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      throw new Error("Network error. Please check your internet connection.");
    }
    if (err.response?.status === 401) {
      throw new Error("Invalid OpenRouter API key. Please check your configuration.");
    }
    if (err.response?.status === 402) {
      throw new Error("Insufficient credits. Please add credits or switch to another free model.");
    }
    if (err.response?.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (err.response?.status === 404) {
      throw new Error(`Model "${OPENROUTER_MODEL}" not found. Please check the model name.`);
    }
    
    // If it's our custom error, rethrow it
    if (err.message.includes("OpenRouter API error") || err.message.includes("Invalid response")) {
      throw err;
    }
    
    throw new Error(`AI service error: ${err.message}`);
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