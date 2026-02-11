
export async function getPlayer(id: string) {
  const res = await fetch(`/player/${id}`);
  return res.json();
}

export async function move(playerId: string, x: number, y: number) {
  const res = await fetch('/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, x, y })
  });
  return res.json();
}
