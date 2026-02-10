import { useEffect, useState } from 'react';
import { getState, scan, analyze } from './api';
import PlayerStatus from './components/PlayerStatus';
import SignalsList from './components/SignalsList';
import AnalysesList from './components/AnalysesList';
import Minigame from './components/Minigame';
import SolarMap from './components/SolarMap';

const PLAYER_ID = 'player1';

export default function App() {
  const [state, setState] = useState<any>(null);
  const [minigameOpen, setMinigameOpen] = useState(false);

  const refresh = async () => {
    setState(await getState(PLAYER_ID));
  };

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 1000);
    return () => clearInterval(i);
  }, []);

  if (!state) return <div>Loading...</div>;
  const busy = !!state.currentAction;

  return (
    <div style={{ padding: 20 }}>
      <PlayerStatus state={state} />

      <button disabled={busy} onClick={() => scan(PLAYER_ID)}>
        Scan
      </button>

      <SignalsList
        signals={state.signals}
        busy={busy}
        onAnalyze={(id: string) => {
          analyze(PLAYER_ID, id);
          setMinigameOpen(true);
        }}
      />

      <AnalysesList analyses={state.analyses} />
      <SolarMap signals={state.signals} />

      {minigameOpen && (
        <Minigame onClose={() => setMinigameOpen(false)} />
      )}
    </div>
  );
}