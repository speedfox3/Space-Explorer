import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://fsudquiewxlktggtkyia.supabase.co";
const SUPABASE_KEY = "sb_publishable_lp_Kgg0F012kzLDqHfcQvg_vg-pt-uV";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

window.loginWithGoogle = async function () {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/Space-Explorer/index.html"
    }
  });

  if (error) {
    alert(error.message);
  }
};
