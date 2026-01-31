
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

/**
 * Generates a unicorn avatar based on user stats.
 * Uses gemini-2.5-flash-image as the default image generation model.
 */
export async function generateUnicornAvatar(stats: UserStats): Promise<string | null> {
  try {
    // Guidelines: Always create a new GoogleGenAI instance right before making an API call.
    // Use process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const { level, isStrongStart } = stats;
    
    // Define prompt based on user evolution level.
    const physique = (isStrongStart || level > 10) ? "extremely massive bodybuilding muscles" : "athletic muscular physique";
    const prompt = `Full body shot of a muscular anthropomorphic unicorn standing on two legs, ${physique}, heroic pose, dark epic fitness gym background, cinematic lighting, 3d digital art style, high resolution, masterpiece.`;

    console.log("AVATAR: Requesting generation from gemini-2.5-flash-image...");
    
    // Guidelines: Use ai.models.generateContent for image generation with gemini-2.5-flash-image.
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

    // Safeguard candidate access
    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      console.error("AVATAR ERROR: No valid candidates or parts in the response.", response);
      return null;
    }

    // Guidelines: Iterate through all parts to find the image part (inlineData).
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        console.log("AVATAR SUCCESS: Image data received.");
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    console.error("AVATAR ERROR: No inlineData part found in candidates.", candidate.content.parts);
    return null;
  } catch (error: any) {
    console.error("AVATAR CRITICAL ERROR:", error.message || String(error));
    return null;
  }
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
    // Guidelines: Directly access the .text property
    return response.text || "Konsistenz schlägt Talent.";
  } catch (error) {
    console.error("WISDOM ERROR:", error);
    return "Dein Horn wächst mit jedem Satz.";
  }
}
