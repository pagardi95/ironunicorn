
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";
import { EVOLUTION_STAGES } from "../constants";

/**
 * Ermittelt das passende statische Bild basierend auf dem Level.
 * Durchläuft die Schwellenwerte abwärts.
 */
export function getStaticEvolutionImage(level: number): string {
  const levels = Object.keys(EVOLUTION_STAGES).map(Number).sort((a, b) => b - a);
  for (const l of levels) {
    if (level >= l) return EVOLUTION_STAGES[l].url;
  }
  return EVOLUTION_STAGES[1].url;
}

/**
 * Ermittelt die Stufen-Informationen für die UI.
 */
export function getEvolutionInfo(level: number) {
  const levels = Object.keys(EVOLUTION_STAGES).map(Number).sort((a, b) => b - a);
  for (const l of levels) {
    if (level >= l) return EVOLUTION_STAGES[l];
  }
  return EVOLUTION_STAGES[1];
}

/**
 * Generiert ein Einhorn-Avatar. 
 */
export async function generateUnicornAvatar(stats: UserStats, forceAI: boolean = false): Promise<string | null> {
  const { level, isStrongStart } = stats;

  if (!forceAI && !process.env.API_KEY) {
    return getStaticEvolutionImage(level);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const physique = (isStrongStart || level > 30) ? "monstrous bodybuilder physique" : "defined muscular athlete";
    const prompt = `Epic full body shot of a muscular anthropomorphic unicorn standing upright, ${physique}, heroic god-like pose, dark mystical gym environment, cinematic volumetric lighting, 8k resolution, photorealistic digital art.`;

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
    console.warn("AI Fallback active.");
  }

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
