
const SUPABASE_URL = "https://fsudquiewxlktggtkyia.supabase.co";
const SUPABASE_KEY = "sb_publishable_lp_Kgg0F012kzLDqHfcQvg_vg-pt-uV";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://speedfox3.github.io/Space-Explorer/index.html"
    }
  });

  if (error) {
    console.error("Error login:", error.message);
    alert("Error al iniciar sesión");
  }
}