import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if we are using the placeholder configs to fallback to interactive mock data
export const isMockMode = 
  !supabaseUrl || 
  supabaseUrl.includes('your-supabase-project') || 
  !supabaseAnonKey || 
  supabaseAnonKey.includes('placeholder');

if (isMockMode) {
  console.warn('Teacher\'s Desk AI: Operating in Mock Mode (using rich local memory storage). To use live database, update .env file.');
}

export const supabase = createClient(
  isMockMode ? 'https://placeholder.supabase.co' : supabaseUrl,
  isMockMode ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder' : supabaseAnonKey
);
