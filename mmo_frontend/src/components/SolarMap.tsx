export default function SolarMap({ signals }: any) {
  if (signals.length === 0) {
    return <p>No signals detected.</p>;
  }

  const mapped = signals.every((s: any) => s.distanceToTarget === 0);

  return (
    <>
      <h3>Solar System</h3>
      <p>
        Exploration status: {mapped ? 'Mapped' : 'In Progress'}
      </p>
    </>
  );
}