
import { EVOLUTION_STAGES } from "../constants";

// SUPABASE URL für die hochgeladenen Bilder
const SUPABASE_STORAGE_URL = "https://rsnkmyqbzvwbghfqyjui.supabase.co/storage/v1/object/public/unicorns";

/**
 * Gibt den Pfad zum hochgeladenen Level-Asset zurück.
 */
export function getStaticEvolutionImage(level: number): string {
  // Sicherstellen, dass das Level zwischen 1 und 100 liegt
  const safeLevel = Math.max(1, Math.min(100, level));
  return `${SUPABASE_STORAGE_URL}/level_${safeLevel}.png`;
}

/**
 * Holt die Metadaten für das aktuelle Evolutions-Stadium.
 */
export function getEvolutionInfo(level: number) {
  const thresholdLevels = Object.keys(EVOLUTION_STAGES).map(Number).sort((a, b) => b - a);
  for (const l of thresholdLevels) {
    if (level >= l) return EVOLUTION_STAGES[l];
  }
  return EVOLUTION_STAGES[1];
}

/**
 * Veraltet: Früher KI-Generierung, jetzt nur noch ein Wrapper für statische Bilder.
 */
export async function generateUnicornAvatar(level: number): Promise<string | null> {
  // Wir nutzen jetzt nur noch die hochgeladenen Bilder
  return getStaticEvolutionImage(level);
}
