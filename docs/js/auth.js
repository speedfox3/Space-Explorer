

async function loginWithGoogle() {
  const { error } = await supabaseClient.auth.signInWithOAuth({
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