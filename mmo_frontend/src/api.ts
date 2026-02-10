export const getState = async (playerId: string) =>
  (await fetch(`/state/${playerId}`)).json();

export const scan = async (playerId: string) =>
  fetch('/actions/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId })
  });

export const analyze = async (playerId: string, signalId: string) =>
  fetch('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, signalId })
  });