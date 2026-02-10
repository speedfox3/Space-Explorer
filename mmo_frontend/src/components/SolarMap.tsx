export default function SolarMap({ signals }: any) {
  return (
    <>
      <h3>Solar System Map (Prototype)</h3>
      <ul>
        {signals.map((s: any) => (
          <li key={s.id}>
            • {s.type} @ unknown coordinates
          </li>
        ))}
      </ul>
    </>
  );
}