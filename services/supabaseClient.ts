
import { createClient } from '@supabase/supabase-js';

// Fix: Use casting to 'any' for import.meta to avoid TypeScript error about missing 'env' property in some environments
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
