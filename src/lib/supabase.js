import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://omzlkkcvkjiwgavoardf.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9temxra2N2a2ppd2dhdm9hcmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzUyOTUsImV4cCI6MjA5NTM1MTI5NX0.BmdwTisE-UcWlgjRjuDdL0cuxIfsY99PlwtwpGaKd9s"

console.log("🚀 Supabase inicializado com URL:", SUPABASE_URL)
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)