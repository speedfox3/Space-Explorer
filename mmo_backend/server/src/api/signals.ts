import { Router, Request, Response } from 'express';
import { getOrCreatePlayer } from '../state/gameState.js';

export const signalsRouter = Router();

signalsRouter.get('/:playerId', async (req: Request, res: Response) => {
  const player = await getOrCreatePlayer(req.params.playerId);
  res.json(player.signals);
});
