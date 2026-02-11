
import { useEffect, useState } from 'react';
import React from "react";
import { getPlayer, move } from './api';

const PLAYER_ID = 'player1';

export default function App() {
  const [player, setPlayer] = useState<any>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  async function refresh() {
    const data = await getPlayer(PLAYER_ID);
    setPlayer(data);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!player) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Player Movement</h2>

      <p>Position: ({player.x.toFixed(1)}, {player.y.toFixed(1)})</p>
      <p>Energy: {player.energy.toFixed(1)}</p>

      <div>
        X: <input type="number" value={x} onChange={e => setX(Number(e.target.value))} />
        Y: <input type="number" value={y} onChange={e => setY(Number(e.target.value))} />
        <button onClick={async () => { await move(PLAYER_ID, x, y); refresh(); }}>
          Move
        </button>
      </div>
    </div>
  );
}
