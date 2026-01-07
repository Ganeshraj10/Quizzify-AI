
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, QuestionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateQuizQuestions = async (
  topic: string,
  count: number,
  difficulty: Difficulty
) => {
  const prompt = `Generate a high-quality academic quiz on the topic of "${topic}". 
  The difficulty level should be ${difficulty}.
  Include ${count} questions.
  Mix MCQ and True/False questions.
  Provide detailed explanations for each answer.
  Add real-world examples in the explanations.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The question text" },
            type: { type: Type.STRING, enum: Object.values(QuestionType), description: "Type of question" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of options for MCQ (empty for True/False)"
            },
            correctAnswer: { type: Type.STRING, description: "The correct answer" },
            explanation: { type: Type.STRING, description: "Detailed explanation of why this answer is correct" },
            difficulty: { type: Type.STRING, enum: Object.values(Difficulty) },
            marks: { type: Type.NUMBER }
          },
          required: ["text", "type", "correctAnswer", "explanation", "difficulty", "marks"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const analyzePerformance = async (attemptData: any) => {
  const prompt = `Analyze this student's quiz performance and provide constructive feedback, key areas for improvement, and a summary of their knowledge gaps.
  Performance Data: ${JSON.stringify(attemptData)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING },
          weakTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          conceptRecap: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};
