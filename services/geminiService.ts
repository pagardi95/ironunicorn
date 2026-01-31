
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

/**
 * Holt den API-Key. Priorisiert den injizierten Prozess-Key.
 */
const getApiKey = (): string => {
  try {
    const key = (process.env as any).API_KEY || (import.meta as any).env?.VITE_API_KEY || "";
    return key.trim();
  } catch (e) {
    return "";
  }
};

export async function generateUnicornAvatar(stats: UserStats): Promise<string | null> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("AVATAR: Kein API_KEY gefunden. Versuche Generierung ohne expliziten Key (Browser-Injektion)...");
  }

  try {
    // Erstelle Instanz direkt vor dem Call für aktuellsten Key-Status
    const ai = new GoogleGenAI({ apiKey });
    const { level, isStrongStart } = stats;
    
    // Einfacherer, kraftvoller Prompt um Sicherheitsfilter-Fehlalarme zu vermeiden
    const physique = (isStrongStart || level > 10) ? "massive bodybuilding muscles" : "athletic muscular physique";
    const prompt = `Full body shot of a muscular anthropomorphic unicorn standing on two legs, ${physique}, heroic pose, dark epic fitness gym background, cinematic lighting, 3d digital art style, high resolution.`;

    console.log("AVATAR: Sende Request an gemini-2.5-flash-image...");
    
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

    if (!response.candidates?.[0]) {
      console.error("AVATAR: Keine Candidates in der Antwort. Möglicherweise durch Sicherheitsfilter blockiert.");
      return null;
    }

    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData?.data) {
        console.log("AVATAR: Erfolg! Bilddaten empfangen.");
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    console.error("AVATAR: Antwort erhalten, aber kein Bild-Part gefunden.", response);
    return null;
  } catch (error: any) {
    const msg = error.message || String(error);
    console.error("AVATAR CRITICAL ERROR:", msg);
    
    if (msg.includes("Requested entity was not found") || msg.includes("API key not valid")) {
      console.error("HINWEIS: API Key scheint ungültig zu sein.");
    }
    return null;
  }
}

export async function getUnicornWisdomPrompt(topic: string): Promise<string> {
  const apiKey = getApiKey();
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gib mir einen extrem kurzen, motivierenden Fitness-Tipp (max 10 Wörter) zu: ${topic}. Vibe: Kraftvoll, Einhorn-Thematik.`,
    });
    return response.text || "Konsistenz schlägt Talent.";
  } catch (error) {
    return "Dein Horn wächst mit jedem Satz.";
  }
}
