
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

/**
 * Holt den API-Key aus allen möglichen Quellen (Vite, Vercel, Global).
 */
const getApiKey = (): string => {
  try {
    // 1. Direkt über process.env (Vite 'define' Ersetzung)
    const envKey = process.env.API_KEY;
    if (envKey && envKey !== 'undefined' && envKey !== '') return envKey;

    // 2. Über import.meta.env (Vite Standard)
    const metaKey = (import.meta as any).env?.VITE_API_KEY;
    if (metaKey && metaKey !== 'undefined' && metaKey !== '') return metaKey;

    // 3. Fallback auf window
    const winKey = (window as any).process?.env?.API_KEY;
    if (winKey && winKey !== 'undefined' && winKey !== '') return winKey;
  } catch (e) {
    console.warn("Fehler beim Zugriff auf API_KEY:", e);
  }
  return "";
};

export async function generateUnicornAvatar(stats: UserStats): Promise<string | null> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("AVATAR ERROR: Kein API_KEY gefunden. Bitte in Vercel als API_KEY hinterlegen.");
    return null;
  }

  console.log("AVATAR START: Generiere Einhorn für Level", stats.level);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const { evolution, level, isStrongStart } = stats;
    
    // Dynamische Beschreibung basierend auf den Stats
    let muscleDescription = isStrongStart || level > 10 
      ? "extremely muscular and vascular bodybuilder physique" 
      : "athletic and toned muscular physique";
    
    let partsDetail = "";
    if (evolution.chest > 40) partsDetail += " massive pectoral muscles,";
    if (evolution.arms > 40) partsDetail += " bulging biceps,";
    if (evolution.horn > 15) partsDetail += " a glowing energy horn,";

    const prompt = `A highly detailed, cinematic, anthropomorphic unicorn standing on two legs. It has an ${muscleDescription}.${partsDetail} Dark epic background with dramatic rim lighting. 3D render style, octane render, masterpiece, no kitsch, pure strength and power.`;

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

    console.log("AVATAR RESPONSE: API hat geantwortet.");

    // Suche nach dem Bild-Teil in der Antwort
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          console.log("AVATAR SUCCESS: Bild-Daten empfangen.");
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    console.error("AVATAR ERROR: Keine Bild-Daten in der API-Antwort gefunden.", response);
    return null;
  } catch (error: any) {
    console.error("AVATAR CRITICAL ERROR:", error.message || error);
    return null;
  }
}

export async function getUnicornWisdomPrompt(topic: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) return "Konsistenz ist der Schlüssel zum Erfolg.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gib mir einen kurzen, motivierenden Fitness-Tipp zum Thema ${topic}. Maximal 15 Wörter. Einhorn-Vibe.`,
    });
    return response.text || "Dein Horn wächst mit jedem Satz.";
  } catch (error) {
    return "Dein Horn wächst mit jedem Satz.";
  }
}
