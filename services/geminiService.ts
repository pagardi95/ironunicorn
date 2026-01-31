import { GoogleGenAI } from "@google/genai";
import { EVOLUTION_STAGES } from "../constants";

// SUPABASE URL für Fallbacks
const SUPABASE_STORAGE_URL = "https://rsnkmyqbzvwbghfqyjui.supabase.co/storage/v1/object/public/unicorns";

export function getStaticEvolutionImage(level: number): string {
  return `${SUPABASE_STORAGE_URL}/level_${level}.png`;
}

export function getEvolutionInfo(level: number) {
  const thresholdLevels = Object.keys(EVOLUTION_STAGES).map(Number).sort((a, b) => b - a);
  for (const l of thresholdLevels) {
    if (level >= l) return EVOLUTION_STAGES[l];
  }
  return EVOLUTION_STAGES[1];
}

function getEvolutionContext(level: number) {
  if (level <= 10) return { era: "Nature Spirits", colors: "Emerald green, earthy brown", aura: "Floating leaves" };
  if (level <= 25) return { era: "Ancient Marble", colors: "Ivory white, pale gold", aura: "Divine white mist" };
  if (level <= 40) return { era: "Iron Might", colors: "Gunmetal gray, cold steel blue", aura: "Steam" };
  if (level <= 60) return { era: "Cybernetic Neon", colors: "Electric pink, neon cyan", aura: "Digital glitches" };
  if (level <= 80) return { era: "Magma Core", colors: "Obsidian black, molten red", aura: "Smoke and ash" };
  return { era: "Divine Solar God", colors: "Brilliant gold, pure white", aura: "Solar radiation" };
}

function getMuscularityDescription(level: number): string {
  if (level <= 10) return "lean, noble, athletic build";
  if (level <= 30) return "well-defined powerful muscular physique";
  if (level <= 60) return "massive bodybuilder build, extreme chest";
  if (level <= 90) return "hyper-muscular mass monster, colossal titan";
  return "god-like behemoth, celestial power incarnate";
}

/**
 * Nutzt gemini-3-pro-image-preview für High-Quality Paid API Generierung.
 */
export async function generateUnicornAvatar(level: number, forceAI: boolean = true): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Kein API_KEY gefunden. Nutze Fallback.");
    return getStaticEvolutionImage(level);
  }

  try {
    // Instanz direkt im Call erstellen für aktuellsten Key-Status
    const ai = new GoogleGenAI({ apiKey });
    const muscularity = getMuscularityDescription(level);
    const ctx = getEvolutionContext(level);
    
    const prompt = `MASTERPIECE: High-end concept art of an ANTHROPOMORPHIC UNICORN at Level ${level}/100 of evolution. 
    Physique: ${muscularity}. 
    Style: ${ctx.era} aesthetic. 
    Atmosphere: ${ctx.aura}, ${ctx.colors} color palette. 
    No humans, professional lighting, 8k resolution, cinematic composition.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "1:1",
          imageSize: "1K" 
        } 
      }
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
    console.error(`PAID API ERROR (Lvl ${level}):`, error?.message || error);
    
    // FIX: Trigger re-selection if API key is invalid or lacks necessary permissions
    if (error?.message?.includes("Requested entity was not found.") && typeof window !== 'undefined' && (window as any).aistudio) {
       console.warn("API Key potentially invalid or from non-paid project. Triggering re-selection.");
       (window as any).aistudio.openSelectKey();
    }
    
    // Wenn es ein technischer Fehler ist, geben wir null zurück, damit der Batch das Fallback nutzt
    return null;
  }

  return getStaticEvolutionImage(level);
}