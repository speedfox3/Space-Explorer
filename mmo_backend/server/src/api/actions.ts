import { Router, Request, Response } from 'express';
import { getOrCreatePlayer, persistPlayer } from '../state/gameState.js';
import { startScan } from '../actions/scanSignal.js';

export const actionRouter = Router();

interface ScanRequestBody {
  playerId: string;
}

actionRouter.post(
  '/scan',
  async (req: Request<{}, {}, { playerId: string }>, res: Response) => {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }

    const player = await getOrCreatePlayer(playerId);

    try {
      // 1️⃣ iniciar acción (descuenta fuel en memoria)
      startScan(player);

      // 2️⃣ persistir inmediatamente el nuevo estado
      await persistPlayer(player);

      res.json({ status: 'scan_started', ticks: 5 });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);