
async function checkPlayer() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const { data: player } = await supabaseClient
    .from("players")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!player) {
    window.location.href = "create-character.html";
  } else {
    console.log("Jugador cargado:", player);
  }
}

checkPlayer();

function logout() {
  supabaseClient.auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}



