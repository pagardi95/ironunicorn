
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";
import { EVOLUTION_STAGES } from "../constants";

/**
 * Ermittelt das passende statische Bild basierend auf dem Level.
 */
export function getStaticEvolutionImage(level: number): string {
  if (level >= 75) return EVOLUTION_STAGES[75];
  if (level >= 50) return EVOLUTION_STAGES[50];
  if (level >= 25) return EVOLUTION_STAGES[25];
  if (level >= 10) return EVOLUTION_STAGES[10];
  return EVOLUTION_STAGES[1];
}

/**
 * Generiert ein Einhorn-Avatar. 
 * Versucht KI-Generierung, falls ein Key vorhanden ist, nutzt sonst die statische Evolution.
 */
export async function generateUnicornAvatar(stats: UserStats, forceAI: boolean = false): Promise<string | null> {
  const { level, isStrongStart } = stats;

  // Standard-Fall: Statisches Bild (Quota-safe & schnell)
  if (!forceAI && !process.env.API_KEY) {
    return getStaticEvolutionImage(level);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const physique = (isStrongStart || level > 10) ? "extremely massive bodybuilding muscles" : "athletic muscular physique";
    const prompt = `Full body shot of a muscular anthropomorphic unicorn standing on two legs, ${physique}, heroic pose, dark epic fitness gym background, cinematic lighting, 3d digital art style, high resolution, masterpiece.`;

    console.log("AVATAR: Requesting AI generation...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error: any) {
    console.warn("AI Generation failed, falling back to static evolution.", error.message);
  }

  // Fallback zu statischem Bild bei Fehlern
  return getStaticEvolutionImage(level);
}

/**
 * Generates a motivational fitness tip.
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
    return "Dein Horn wächst mit jedem Satz.";
  }
}
