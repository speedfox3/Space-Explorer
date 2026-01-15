
export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SUPABASE_URL = "https://fsudquiewxlktggtkyia.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lp_Kgg0F012kzLDqHfcQvg_vg-pt-uV";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);