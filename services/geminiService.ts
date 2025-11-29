import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cameraMotion: {
      type: Type.STRING,
      description: "Description of camera movement, angle, or lens choice suitable for this shot.",
    },
    lighting: {
      type: Type.STRING,
      description: "Description of lighting setup, mood, and key light sources.",
    },
    storyNote: {
      type: Type.STRING,
      description: "A brief narrative description of the action occurring in the shot.",
    },
  },
  required: ["cameraMotion", "lighting", "storyNote"],
};

export const analyzeStoryboardImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  try {
    // Remove data URL prefix if present to get raw base64
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png", // Assuming PNG or standard image format, the API is flexible with mime types matching data
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this storyboard sketch or reference image. Act as a Cinematographer and Director. Provide a professional description for the Camera Motion, Lighting setup, and a Main Story Note describing the action.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert animation director helper.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
