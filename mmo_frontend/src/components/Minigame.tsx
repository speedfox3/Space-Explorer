import { useState } from 'react';

export default function Minigame({ onClose }: any) {
  const [success, setSuccess] = useState<boolean | null>(null);

  return (
    <div style={{ border: '2px solid #444', padding: 20, marginTop: 20 }}>
      <h3>Signal Analysis Minigame</h3>
      <p>Click when you feel ready.</p>
      <button
        onClick={() => {
          setSuccess(Math.random() > 0.4);
          setTimeout(onClose, 1000);
        }}
      >
        Analyze!
      </button>
      {success !== null && (
        <p>{success ? 'Success!' : 'Poor data acquired'}</p>
      )}
    </div>
  );
}