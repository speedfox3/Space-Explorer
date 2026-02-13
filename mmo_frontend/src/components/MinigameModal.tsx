import { useState } from "react";

export default function MinigameModal({ object, onClose, onResolved }: any) {

  const level = Number(object.level) || 1;
  const digits = 2 + level * 2;

const generateSecret = () => {
  const numbers = ["0","1","2","3","4","5","6","7","8","9"];
  const shuffled = numbers.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, digits).join("");
};

  const [secret] = useState(generateSecret());
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState<string[]>([]);
  const maxAttempts = 3;

  function evaluateGuess(g: string) {
    return g.split("").map((digit, index) => {
      if (digit === secret[index]) return "correct";
      if (secret.includes(digit)) return "present";
      return "absent";
    });
  }

  function submit() {
    if (guess.length !== digits) return;

    const newAttempts = [...attempts, guess];
    setAttempts(newAttempts);

 const result = evaluateGuess(guess);
const score = result.reduce((acc, r) => {
  if (r === "correct") return acc + 2;
  if (r === "present") return acc + 1;
  return acc;
}, 0);

const maxScore = digits * 2;

if (guess === secret) {
  setTimeout(() => onResolved({ score, maxScore }), 600);
  return;
}

    if (newAttempts.length >= maxAttempts) {
      setTimeout(() => onResolved(false), 600);
      return;
    }

    setGuess("");
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Analyze Object (Lvl {level})</h3>
        <p>{digits}-digit code</p>

        <div style={{ marginBottom: 15 }}>
          {attempts.map((att, i) => {
            const result = evaluateGuess(att);
            return (
              <div key={i} style={{ display: "flex", marginBottom: 4 }}>
                {att.split("").map((digit, j) => (
                  <div
                    key={j}
                    style={{
                      ...cellStyle,
                      background:
                        result[j] === "correct"
                          ? "#00aa00"
                          : result[j] === "present"
                          ? "#aa8800"
                          : "#444"
                    }}
                  >
                    {digit}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {attempts.length < maxAttempts && (
          <>
            <input
              value={guess}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= digits) setGuess(val);
              }}
              maxLength={digits}
              style={inputStyle}
            />
            <div style={{ marginTop: 8 }}>
              Attempts: {attempts.length}/{maxAttempts}
            </div>
            <div style={{ marginTop: 10 }}>
              <button onClick={submit}>Submit</button>
              <button onClick={onClose} style={{ marginLeft: 10 }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modal = {
  background: "#111",
  padding: 30,
  border: "2px solid #0f0",
  color: "white",
  width: "90%",
  maxWidth: 600,
  minHeight: 350,
  boxShadow: "0 0 20px #00ff00",
  borderRadius: 8
};

const cellStyle = {
  width: 40,
  height: 40,
  marginRight: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  fontWeight: "bold" as const,
  border: "1px solid #333"
};

const inputStyle = {
  fontSize: 20,
  padding: 8,
  width: "100%",
  textAlign: "center" as const
};
