
import { createClient } from '@supabase/supabase-js';

/**
 * Robust environment variable retrieval.
 * Supports both Vite (import.meta.env) and standard Node-like (process.env) environments.
 */
const getEnvVar = (name: string): string | undefined => {
  try {
    // Check process.env (common in CI/CD and defined in vite.config.ts)
    if (typeof process !== 'undefined' && process.env && (process.env as any)[name]) {
      return (process.env as any)[name];
    }
    // Check import.meta.env (Vite standard)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[name]) {
      return (import.meta as any).env[name];
    }
  } catch (e) {
    // Silently fail if access is restricted
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Only initialize if both URL and Key are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
