// docs/js/supabase.js
const SUPABASE_URL = "https://fsudquiewxlktggtkyia.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY_AQUI";

export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
