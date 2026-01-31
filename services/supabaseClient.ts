
import { createClient } from '@supabase/supabase-js';

/**
 * Sicherer Zugriff auf Umgebungsvariablen für verschiedene Plattformen (Vite, Vercel, Node).
 */
const getEnvVar = (name: string): string | undefined => {
  try {
    // 1. Vite / Vercel Define-Ersatz (Wichtig für statische Ersetzung)
    if (name === 'VITE_SUPABASE_URL' && typeof process !== 'undefined' && (process.env as any).VITE_SUPABASE_URL) return (process.env as any).VITE_SUPABASE_URL;
    if (name === 'VITE_SUPABASE_ANON_KEY' && typeof process !== 'undefined' && (process.env as any).VITE_SUPABASE_ANON_KEY) return (process.env as any).VITE_SUPABASE_ANON_KEY;

    // 2. Vite standard (import.meta.env)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[name]) {
      return (import.meta as any).env[name];
    }
    
    // 3. Fallback auf direktes window/global Objekt, falls dort injiziert
    if (typeof window !== 'undefined' && (window as any)._env_ && (window as any)._env_[name]) {
      return (window as any)._env_[name];
    }
  } catch (e) {
    // Falls Zugriff blockiert ist, leise fehlschlagen
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Initialisiere den Client nur, wenn beide Werte vorhanden sind.
// Falls nicht, ist 'supabase' null und die App nutzt das Fallback-Verhalten (localStorage).
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== "undefined" && supabaseAnonKey !== "undefined") 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
