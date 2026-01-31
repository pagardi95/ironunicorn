
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";
import { EVOLUTION_STAGES } from "../constants";

/**
 * Ermittelt das passende statische Bild basierend auf dem Level.
 * Diese Funktion ist synchron und extrem schnell für sofortiges Feedback.
 */
export function getStaticEvolutionImage(level: number): string {
  const thresholdLevels = Object.keys(EVOLUTION_STAGES).map(Number).sort((a, b) => b - a);
  for (const l of thresholdLevels) {
    if (level >= l) return EVOLUTION_STAGES[l].url;
  }
  return EVOLUTION_STAGES[1].url;
}

/**
 * Ermittelt die Stufen-Informationen für die UI (Name und Beschreibung).
 */
export function getEvolutionInfo(level: number) {
  const thresholdLevels = Object.keys(EVOLUTION_STAGES).map(Number).sort((a, b) => b - a);
  for (const l of thresholdLevels) {
    if (level >= l) return EVOLUTION_STAGES[l];
  }
  return EVOLUTION_STAGES[1];
}

/**
 * Generiert ein Einhorn-Avatar.
 * Priorisiert statische Bilder für sofortige UX, nutzt KI nur bei explizitem Wunsch.
 */
export async function generateUnicornAvatar(stats: UserStats, forceAI: boolean = false): Promise<string | null> {
  const { level, isStrongStart } = stats;

  // Wenn keine KI-Generierung erzwungen wird oder kein Key da ist, sofort das statische Bild zurückgeben
  if (!forceAI || !process.env.API_KEY) {
    return getStaticEvolutionImage(level);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const physique = (isStrongStart || level > 30) ? "massive bodybuilding muscles" : "muscular athlete";
    const prompt = `Epic full body shot of a muscular anthropomorphic unicorn standing on two legs, ${physique}, heroic pose, dark gym, cinematic lighting.`;

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
  } catch (error) {
    console.warn("AI Generation failed, using static fallback.");
  }

  return getStaticEvolutionImage(level);
}
