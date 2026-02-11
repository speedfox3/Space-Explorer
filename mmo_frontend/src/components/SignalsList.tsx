import SignalQuality from './SignalQuality';

export default function SignalsList({ signals, busy, onAnalyze }: any) {
  return (
    <>
      <h3>Signals</h3>
      <ul>
        {signals.map((s: any) => (
          <li key={s.id}>
            {s.type} – <SignalQuality uncertainty={s.uncertainty} />
            <div>Distance: {s.distanceToTarget}</div>
            <button disabled={busy} onClick={() => onAnalyze(s.id)}>
              Analyze
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}