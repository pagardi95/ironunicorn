
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

/**
 * Generates a unicorn avatar based on user stats.
 * Uses gemini-2.5-flash-image as the default image generation model.
 */
export async function generateUnicornAvatar(stats: UserStats): Promise<string | null> {
  // Always create instance inside call to use most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const { level, isStrongStart } = stats;
  
  // Define prompt based on user evolution level.
  const physique = (isStrongStart || level > 10) ? "extremely massive bodybuilding muscles" : "athletic muscular physique";
  const prompt = `Full body shot of a muscular anthropomorphic unicorn standing on two legs, ${physique}, heroic pose, dark epic fitness gym background, cinematic lighting, 3d digital art style, high resolution, masterpiece.`;

  console.log("AVATAR: Requesting generation from gemini-2.5-flash-image...");
  
  // We do not wrap this in a try-catch here so the caller (Dashboard) can catch and identify 429/quota errors
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  const candidate = response.candidates?.[0];
  if (!candidate || !candidate.content || !candidate.content.parts) {
    console.error("AVATAR ERROR: Invalid response structure.", response);
    return null;
  }

  // Iterate through parts to find image data
  for (const part of candidate.content.parts) {
    if (part.inlineData && part.inlineData.data) {
      console.log("AVATAR SUCCESS: Image data received.");
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return null;
}

/**
 * Generates a motivational fitness tip.
 * Uses gemini-3-flash-preview for basic text tasks.
 */
export async function getUnicornWisdomPrompt(topic: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gib mir einen extrem kurzen, motivierenden Fitness-Tipp (max 10 Wörter) zu: ${topic}. Vibe: Kraftvoll, Einhorn-Thematik.`,
    });
    return response.text || "Konsistenz schlägt Talent.";
  } catch (error) {
    console.error("WISDOM ERROR:", error);
    return "Dein Horn wächst mit jedem Satz.";
  }
}
