
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

/**
 * Deterministic fallback silhouettes for different evolution stages.
 * These ensure the UI looks great even if the Image API is rate-limited.
 */
const getFallbackUnicorn = (level: number, evolution: any): string => {
  const isStrong = level > 15 || evolution.chest > 40;
  const color = isStrong ? "#a855f7" : "#6366f1";
  const glow = isStrong ? "0 0 20px #a855f7" : "none";
  
  const svg = `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <g transform="translate(100, 100) scale(0.4)">
        <path d="M120,40 C120,40 160,20 180,0 L200,80 L240,100 C240,100 300,120 320,180 C340,240 320,320 280,360 C240,400 160,400 120,360 C80,320 60,240 80,180 C100,120 120,40 120,40" fill="${color}" style="filter: drop-shadow(${glow}); opacity: 0.8"/>
        <path d="M180,0 L200,80" stroke="white" stroke-width="5" stroke-linecap="round"/>
        <circle cx="200" cy="180" r="10" fill="white"/>
      </g>
      <text x="50%" y="85%" text-anchor="middle" fill="${color}" font-family="Oswald" font-weight="bold" font-size="24" style="text-transform: uppercase; letter-spacing: 2px;">
        IRON EVOLUTION: LVL ${level}
      </text>
      <text x="50%" y="92%" text-anchor="middle" fill="#444" font-family="Inter" font-size="12" style="text-transform: uppercase; letter-spacing: 1px;">
        API Quota Limited - Viewing Silhouette
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Helper to implement exponential backoff for API calls.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 4, initialDelay = 3000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      const errorStr = JSON.stringify(error).toUpperCase();
      const isQuotaError = 
        error?.status === 429 || 
        error?.code === 429 ||
        errorStr.includes("429") || 
        errorStr.includes("QUOTA") || 
        errorStr.includes("EXHAUSTED") ||
        errorStr.includes("RATE_LIMIT");

      const isServerError = error?.status >= 500 || errorStr.includes("500") || errorStr.includes("503");

      if (isQuotaError || isServerError) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Gemini API Issue (attempt ${i + 1}/${maxRetries}). Backoff for ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function generateUnicornAvatar(stats: UserStats): Promise<string | null> {
  return withRetry(async () => {
    try {
      const { evolution, level, isStrongStart, gender } = stats;
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const genderTerm = gender === 'female' ? "female" : "male";
      const physiqueTerm = gender === 'female' ? "powerful feminine physique, athletic female build" : "heavy bodybuilding physique, masculine build";
      
      let baseDescription = `A muscular, ${genderTerm} anthropomorphic unicorn standing on two legs like a bodybuilder. ${physiqueTerm}. Dark background, epic lighting, cinematic style. No kitsch, pure iron power.`;
      
      let physicality = "";
      if (isStrongStart || level > 15) {
        physicality = `extremely muscular, vascular ${genderTerm} physique, professional proportions.`;
      } else {
        physicality = `lean but athletic ${genderTerm} physique, beginning muscle definition, slim waist.`;
      }

      let details = "";
      if (evolution.chest > 50) details += " Massive pectoral muscles.";
      if (evolution.arms > 50) details += " Gigantic biceps and triceps.";
      if (evolution.legs > 50) details += " Powerful quad and calf muscles.";
      if (evolution.horn > 50) details += " A glowing, crystalline horn with magical energy sparks.";
      
      if (level >= 100) {
        details = `A god-like ${genderTerm} mythical being, colossal muscles, armor made of starlight and iron, epic celestial aura, the legendary Iron Unicorn.`;
      }

      const fullPrompt = `${baseDescription} This unicorn is ${physicality} ${details} Standing on two legs, aggressive but noble pose. 8k resolution, photorealistic fantasy art.`;

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

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      return null;
    } catch (error: any) {
      throw error;
    }
  }).catch(err => {
    console.warn("API limit reached after retries. Using deterministic silhouette fallback.");
    return getFallbackUnicorn(stats.level, stats.evolution);
  });
}

export async function getUnicornWisdomPrompt(topic: string): Promise<string> {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gib mir einen kurzen, motivierenden und fachlich fundierten Tipp zum Thema ${topic} für die Iron Unicorn Fitness App. Tonalität: Kompetent, nahbar, mit einem Hauch Unicorn-Humor. Maximal 2 Sätze.`,
    });
    return response.text || "Bleib dran, das Horn wächst mit dem Widerstand.";
  }).catch(() => "Ein wahres Iron Unicorn lässt sich von Quota-Limits nicht stoppen. Konsistenz gewinnt immer.");
}
