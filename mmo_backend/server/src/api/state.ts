import { Router, Request, Response } from 'express';
import { getOrCreatePlayer } from '../state/gameState.js';

export const stateRouter = Router();

stateRouter.get('/:playerId', async (req: Request, res: Response) => {
  const { playerId } = req.params;

  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required' });
  }

  const player = await getOrCreatePlayer(playerId);
  res.json(player);
});
