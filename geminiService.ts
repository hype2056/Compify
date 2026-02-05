import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MathSolution, VerificationResult } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the structured schema for the response
const similarProblemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short title for the problem" },
    source: { type: Type.STRING, description: "The origin of the problem (e.g., AMC 12B 2021, Problem 15)" },
    problemText: { type: Type.STRING, description: "The full, verbatim problem statement." },
    similarityLogic: { type: Type.STRING, description: "Explain the shared mathematical concept, theorem, or trick (e.g., 'Both use Power of a Point') that makes this problem relevant." },
    difficulty: { type: Type.STRING, description: "Difficulty rating (e.g., 1-10 or Easy/Medium/Hard)" },
  },
  required: ["title", "source", "problemText", "similarityLogic", "difficulty"],
};

const mathSolutionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    originalProblemOCR: { type: Type.STRING, description: "The transcribed text of the user's problem (if image was provided)" },
    stepByStepSolution: { type: Type.STRING, description: "A comprehensive, step-by-step rigorous proof/solution. Use LaTeX for all math." },
    finalAnswer: { type: Type.STRING, description: "The final boxed answer" },
    similarProblems: {
      type: Type.ARRAY,
      items: similarProblemSchema,
      description: "List of 3 distinct problems from the AOPS dataset that utilize the exact same mathematical logic.",
    },
  },
  required: ["stepByStepSolution", "finalAnswer", "similarProblems"],
};

const verificationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { type: Type.BOOLEAN, description: "True if the user's logic and answer are correct." },
    feedback: { type: Type.STRING, description: "Constructive feedback on the student's approach. If incorrect, explain the mistake without giving the answer immediately if possible, or give a hint." },
    correctSolution: { type: Type.STRING, description: "The correct step-by-step solution using LaTeX." }
  },
  required: ["isCorrect", "feedback", "correctSolution"]
};

export const solveMathProblem = async (
  prompt: string,
  base64Image?: string
): Promise<MathSolution> => {
  try {
    const parts: any[] = [];

    if (base64Image) {
      const cleanBase64 = base64Image.split(',')[1] || base64Image;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
      parts.push({
        text: "Analyze this image. Perform high-accuracy OCR to extract the math problem text."
      });
    }

    parts.push({
      text: prompt || "Solve the following math problem."
    });

    parts.push({
      text: `
      SYSTEM INSTRUCTION:
      You are an expert Math Olympiad Coach with access to the AOPS dataset.
      
      Your task is 3-fold:
      1. TRANSCRIPTION: If an image is provided, accurately transcribe the math notation using LaTeX.
      2. SOLUTION: Provide a rigorous, step-by-step solution. Ensure this field is NEVER empty. Explain every step clearly.
      3. RETRIEVAL: Retrieve 3 similar problems from the AOPS dataset.
      
      Output strictly in JSON format matching the provided schema.
      `
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: mathSolutionSchema,
        thinkingConfig: { thinkingBudget: 4096 }
      },
    });

    if (!response.text) throw new Error("No response generated.");
    return JSON.parse(response.text) as MathSolution;

  } catch (error) {
    console.error("Error in solveMathProblem:", error);
    throw error;
  }
};

export const verifySolution = async (
  problemText: string,
  userSolution: string
): Promise<VerificationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{
          text: `
            You are a Math Tutor.
            
            Original Problem: ${problemText}
            
            Student's Solution: ${userSolution}
            
            Task:
            1. Determine if the student's solution is correct.
            2. Provide helpful feedback.
            3. Provide the full correct solution (LaTeX formatted).
            
            Output JSON matching the schema.
          `
        }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: verificationSchema,
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    if (!response.text) throw new Error("No verification response.");
    return JSON.parse(response.text) as VerificationResult;
  } catch (error) {
    console.error("Verification failed", error);
    throw error;
  }
};