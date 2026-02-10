export default function AnalysesList({ analyses }: any) {
  return (
    <>
      <h3>Analyses</h3>
      <ul>
        {analyses.map((a: any, i: number) => (
          <li key={i}>
            {a.signalId} – {(a.accuracy * 100).toFixed(0)}%
          </li>
        ))}
      </ul>
    </>
  );
}