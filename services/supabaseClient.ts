
import { createClient } from '@supabase/supabase-js';

/**
 * Hilfsfunktion zur Prüfung, ob ein Wert eine gültige Umgebungsvariable ist.
 * Filtert falsy Werte und Platzhalter-Strings aus.
 */
const isValidEnv = (val: any): val is string => {
  return typeof val === 'string' && 
         val.length > 0 && 
         val !== 'undefined' && 
         val !== 'null' && 
         val !== '[object Object]';
};

const getEnvVar = (name: string): string | undefined => {
  try {
    // 1. Check import.meta.env (Vite standard)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const val = (import.meta as any).env[name];
      if (isValidEnv(val)) return val;
    }

    // 2. Check process.env (Vercel/Node standard)
    if (typeof process !== 'undefined' && process.env) {
      const val = (process.env as any)[name];
      if (isValidEnv(val)) return val;
    }
    
    // 3. Fallback auf window._env_
    if (typeof window !== 'undefined' && (window as any)._env_) {
      const val = (window as any)._env_[name];
      if (isValidEnv(val)) return val;
    }
  } catch (e) {
    console.warn(`Fehler beim Zugriff auf Env-Variable ${name}:`, e);
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Initialisiere den Client nur mit validen Daten.
// Falls Keys fehlen, bleibt supabase null und die App nutzt LocalStorage.
let supabaseInstance = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Supabase konnte nicht initialisiert werden:", err);
  }
}

export const supabase = supabaseInstance;
