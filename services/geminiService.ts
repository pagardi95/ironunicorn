
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

export async function generateUnicornAvatar(stats: UserStats): Promise<string | null> {
  try {
    const { evolution, level, isStrongStart } = stats;
    
    // Initialize GoogleGenAI inside the function to ensure the correct context
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let baseDescription = "A muscular, anthropomorphic unicorn standing on two legs like a bodybuilder. Dark background, epic lighting, cinematic style. No kitsch, pure power.";
    
    // Physical state description
    let physicality = "";
    if (isStrongStart || level > 15) {
      physicality = "extremely muscular, vascular physique, pro-bodybuilder proportions.";
    } else {
      physicality = "lean but athletic physique, beginning muscle definition, slim waist.";
    }

    // Part specific evolution
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
  try {
    // Initialize GoogleGenAI inside the function
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gib mir einen kurzen, motivierenden und fachlich fundierten Tipp zum Thema ${topic} für die Iron Unicorn Fitness App. Tonalität: Kompetent, nahbar, mit einem Hauch Unicorn-Humor. Maximal 2 Sätze.`,
    });
    // Ensure accessing .text as a property, not a method
    return response.text || "Bleib dran, das Horn wächst mit dem Widerstand.";
  } catch (error) {
    return "Konsistenz ist der Schlüssel zum Erfolg.";
  }
}