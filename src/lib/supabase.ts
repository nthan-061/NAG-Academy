import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? '✓' : '✗ MISSING',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '✓' : '✗ MISSING',
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
