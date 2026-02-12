import { useEffect, useState } from "react";

interface Player {
  id: string;
  x: number;
  y: number;
}

export default function App() {
  const [player, setPlayer] = useState<Player | null>(null);

  async function fetchPlayer() {
    const res = await fetch("/api/player/player1");
    const data = await res.json();
    setPlayer(data);
  }

  async function move(dx: number, dy: number) {
    await fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: "player1", dx, dy })
    });
  }

  useEffect(() => {
    fetchPlayer();
    const interval = setInterval(fetchPlayer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🚀 Space Explorer Prototype</h1>

      {player && (
        <div>
          <h2>Position: ({player.x}, {player.y})</h2>

          <div style={{ marginTop: 20 }}>
            <button onClick={() => move(0, -1)}>Up</button>
            <button onClick={() => move(-1, 0)}>Left</button>
            <button onClick={() => move(1, 0)}>Right</button>
            <button onClick={() => move(0, 1)}>Down</button>
          </div>
        </div>
      )}
    </div>
  );
}