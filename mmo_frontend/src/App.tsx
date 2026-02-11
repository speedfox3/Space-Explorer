import { useState } from 'react';
import { scan } from './api';

export default function App() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [signals, setSignals] = useState<any[]>([]);

  async function handleScan() {
    const results = await scan(x, y);
    setSignals(results);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>2D Exploration</h2>

      <div>
        X: <input type="number" value={x} onChange={e => setX(Number(e.target.value))} />
        Y: <input type="number" value={y} onChange={e => setY(Number(e.target.value))} />
        <button onClick={handleScan}>Scan</button>
      </div>

      <h3>Signals</h3>
      <ul>
        {signals.map((s, i) => (
          <li key={i}>
            {s.objectId} – {s.quality} – Distance: {s.distance}
          </li>
        ))}
      </ul>
    </div>
  );
}