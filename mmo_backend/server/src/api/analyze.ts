import { Router, Request, Response } from 'express';
import { getOrCreatePlayer, persistPlayer } from '../state/gameState.js';
import { startAnalyzeSignal } from '../actions/analyzeSignal.js';

export const analyzeRouter = Router();

analyzeRouter.post(
  '/',
  async (req: Request<{}, {}, { playerId: string; signalId: string }>, res: Response) => {
    const { playerId, signalId } = req.body;

    if (!playerId || !signalId) {
      return res.status(400).json({ error: 'playerId and signalId required' });
    }

    const player = await getOrCreatePlayer(playerId);

    try {
      startAnalyzeSignal(player, signalId);
      await persistPlayer(player);
      res.json({ status: 'analysis_started' });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);
