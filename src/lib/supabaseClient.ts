import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ycwqhdazopvemlvgfyak.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'MISSING_ANON_KEY'

if (supabaseAnonKey === 'MISSING_ANON_KEY') {
  console.error("Missing Supabase Anon Key. Please add VITE_SUPABASE_ANON_KEY to your .env.local file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
