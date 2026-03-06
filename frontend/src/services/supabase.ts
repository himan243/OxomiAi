import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey || supabaseAnonKey === 'your_anon_public_key_here') {
  console.error("❌ SUPABASE ERROR: You have not set your VITE_SUPABASE_ANON_KEY in the .env file!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
