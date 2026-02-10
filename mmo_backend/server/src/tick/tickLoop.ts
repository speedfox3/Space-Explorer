import { players } from '../state/gameState.js';
import { resolveScan } from '../actions/scanSignal.js';
import { resolveAnalyzeSignal } from '../actions/resolveAnalyzeSignal.js';


let tick = 0;

export function startTickLoop() {
  setInterval(async () => {
    tick++;
    console.log('Tick', tick);

    for (const player of players.values()) {
      const action = player.currentAction;
      if (!action) continue;

      action.remainingTicks--;

      if (action.remainingTicks > 0) continue;

      switch (action.type) {
        case 'scan_signal':
          await resolveScan(player);
          console.log(`Scan resolved for player ${player.id}`);
          break;
          
         case 'analyze_signal':
  await resolveAnalyzeSignal(player);
  console.log(`Analysis resolved for player ${player.id}`);
  break; 

      }
    }
  }, 1000);
}
