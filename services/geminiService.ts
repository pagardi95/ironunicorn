
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

const getApiKey = (): string => {
  try {
    if (typeof process !== 'undefined' && (process.env as any).API_KEY) return (process.env as any).API_KEY;
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_KEY) return (import.meta as any).env.VITE_API_KEY;
  } catch (e) {}
  return "";
};

export async function generateUnicornAvatar(stats: UserStats): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API_KEY fehlt - Avatar-Generierung übersprungen.");
    return null;
  }

  try {
    const { evolution, level, isStrongStart } = stats;
    const ai = new GoogleGenAI({ apiKey });
    
    let baseDescription = "A muscular, anthropomorphic unicorn standing on two legs like a bodybuilder. Dark background, epic lighting, cinematic style. No kitsch, pure power.";
    
    let physicality = "";
    if (isStrongStart || level > 15) {
      physicality = "extremely muscular, vascular physique, pro-bodybuilder proportions.";
    } else {
      physicality = "lean but athletic physique, beginning muscle definition, slim waist.";
    }

    let details = "";
    if (evolution.chest > 50) details += " Massive pectoral muscles.";
    if (evolution.arms > 50) details += " Gigantic biceps and triceps.";
    if (evolution.legs > 50) details += " Powerful quad and calf muscles.";
    if (evolution.horn > 50) details += " A glowing, crystalline horn with magical energy sparks.";
    
    if (level >= 100) {
      details = "A god-like mythical being, colossal muscles, armor made of starlight and iron, epic celestial aura, the legendary Iron Unicorn.";
    }

    const fullPrompt = `${baseDescription} This unicorn is ${physicality} ${details} Standing on two legs, aggressive but noble pose.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating avatar:", error);
    return null;
  }
}

export async function getUnicornWisdomPrompt(topic: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) return "Bleib dran, das Horn wächst mit dem Widerstand.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gib mir einen kurzen, motivierenden und fachlich fundierten Tipp zum Thema ${topic} für die Iron Unicorn Fitness App. Tonalität: Kompetent, nahbar, mit einem Hauch Unicorn-Humor. Maximal 2 Sätze.`,
    });
    return response.text || "Bleib dran, das Horn wächst mit dem Widerstand.";
  } catch (error) {
    return "Konsistenz ist der Schlüssel zum Erfolg.";
  }
}
