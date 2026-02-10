export default function PlayerStatus({ state }: any) {
  return (
    <div>
      <h2>{state.id}</h2>
      <p>Fuel: {state.fuel}</p>
      {state.currentAction && (
        <p>
          {state.currentAction.type} (
          {state.currentAction.remainingTicks})
        </p>
      )}
    </div>
  );
}