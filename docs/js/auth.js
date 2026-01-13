
const SUPABASE_URL = "https://fsudquiewxlktggtkyia.supabase.co";
const SUPABASE_KEY = "sb_publishable_lp_Kgg0F012kzLDqHfcQvg_vg-pt-uV";

const supabase = supabaseJs.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

function loginWithGoogle() {
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/Space-Explorer/index.html"
    }
  });
}
