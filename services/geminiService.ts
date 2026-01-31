
import { GoogleGenAI } from "@google/genai";
import { EVOLUTION_STAGES } from "../constants";

// DEINE AKTUALISIERTE SUPABASE URL
const SUPABASE_STORAGE_URL = "https://rsnkmyqbzvwbghfqyjui.supabase.co/storage/v1/object/public/unicorns";

/**
 * Ermittelt das passende Bild aus deinem Supabase-Ordner basierend auf dem Level.
 * Format: level_1.png, level_2.png, etc.
 */
export function getStaticEvolutionImage(level: number): string {
  return `${SUPABASE_STORAGE_URL}/level_${level}.png`;
}

/**
 * Ermittelt die Stufen-Informationen für die UI (Text-Beschreibungen).
 */
export function getEvolutionInfo(level: number) {
  const thresholdLevels = Object.keys(EVOLUTION_STAGES).map(Number).sort((a, b) => b - a);
  for (const l of thresholdLevels) {
    if (level >= l) return EVOLUTION_STAGES[l];
  }
  return EVOLUTION_STAGES[1];
}

/**
 * Definiert den visuellen Stil und die Farbwelt basierend auf dem Level für den KI-Prompt.
 */
function getEvolutionContext(level: number) {
  if (level <= 10) return { era: "Nature Spirits", colors: "Emerald green, earthy brown", aura: "Floating leaves" };
  if (level <= 20) return { era: "Ancient Marble", colors: "Ivory white, pale gold", aura: "Divine white mist" };
  if (level <= 30) return { era: "Bronze Legacy", colors: "Deep bronze, copper", aura: "Heat distortion" };
  if (level <= 40) return { era: "Iron Might", colors: "Gunmetal gray, cold steel blue", aura: "Steam" };
  if (level <= 50) return { era: "Cybernetic Neon", colors: "Electric pink, neon cyan", aura: "Digital glitches" };
  if (level <= 60) return { era: "Lightning Storm", colors: "Electric blue, bright yellow", aura: "Arcing lightning" };
  if (level <= 70) return { era: "Magma Core", colors: "Obsidian black, molten red", aura: "Smoke and ash" };
  if (level <= 80) return { era: "Void Stalker", colors: "Deepest purple, midnight black", aura: "Swirling dark matter" };
  if (level <= 90) return { era: "Cosmic Entity", colors: "Indigo, star-silver", aura: "Nebula clouds" };
  return { era: "Divine Solar God", colors: "Brilliant gold, pure white", aura: "Solar radiation" };
}

/**
 * Anatomische Skalierung für den KI-Prompt.
 */
function getMuscularityDescription(level: number): string {
  if (level <= 10) return "lean, noble, athletic build";
  if (level <= 25) return "well-defined muscular physique";
  if (level <= 45) return "powerful bodybuilder build, massive chest";
  if (level <= 65) return "extreme mass monster, hyper-muscular";
  if (level <= 85) return "colossal titan of muscle";
  return "god-like behemoth, celestial power";
}

/**
 * Generiert ein Einhorn-Avatar. 
 * Falls das KI-Limit erreicht ist (Fehler 429), wird automatisch das Bild aus Supabase geladen.
 */
export async function generateUnicornAvatar(level: number, forceAI: boolean = true): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) return getStaticEvolutionImage(level);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const muscularity = getMuscularityDescription(level);
    const ctx = getEvolutionContext(level);
    
    const prompt = `EPIC ANTHROPOMORPHIC UNICORN EVOLUTION (Level ${level}/100). Physique: ${muscularity}. Era: ${ctx.era}. Colors: ${ctx.colors}. Aura: ${ctx.aura}. NO HUMANS. Masterpiece concept art.`;

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
    // SPEZIFISCHES HANDLING FÜR QUOTA EXCEEDED (429)
    const errorMsg = error?.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      console.warn(`KI-Limit erreicht (429) für Level ${level}. Lade Supabase Asset.`);
      return getStaticEvolutionImage(level);
    }
    console.error(`KI Fehler bei Level ${level}:`, error);
  }

  // Fallback zu deinen Supabase-Assets
  return getStaticEvolutionImage(level);
}
