import { supabaseClient } from "./supabase.js";

function bindLogin() {
  const btn = document.getElementById("google-login-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname.replace("login.html", "index.html")
      }
    });

    if (error) {
      console.error(error);
      alert("Error al iniciar sesión con Google.");
    }
  });
}

bindLogin();