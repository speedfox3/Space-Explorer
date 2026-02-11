export default function SignalQuality({ uncertainty }: { uncertainty: number }) {
  let label = 'Unknown';
  if (uncertainty < 0.3) label = 'Clear';
  else if (uncertainty < 0.6) label = 'Fuzzy';

  return (
    <span>
      Quality: {label} ({uncertainty.toFixed(2)})
    </span>
  );
}