export default function SignalQuality({ uncertainty }: { uncertainty?: number }) {
  const value = uncertainty ?? 1;

  let label = 'Unknown';
  if (value < 0.3) label = 'Clear';
  else if (value < 0.6) label = 'Fuzzy';

  return (
    <span>
      Quality: {label} ({value.toFixed(2)})
    </span>
  );
}
