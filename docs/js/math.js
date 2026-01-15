// math.js
export function distance(a, b) {
  const ax = Number(a?.x ?? 0);
  const ay = Number(a?.y ?? 0);
  const bx = Number(b?.x ?? 0);
  const by = Number(b?.y ?? 0);
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}
