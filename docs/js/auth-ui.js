import { supabaseClient } from "./supabase.js";

const btn = document.getElementById("google-login-btn");

btn?.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: new URL("index.html", window.location.href).toString(),
    },
  });

  if (error) {
    console.error(error);
    alert("Error al iniciar sesión con Google.");
  }
});
