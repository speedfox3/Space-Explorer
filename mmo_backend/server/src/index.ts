import express from "express";
import { MemoryPlayerRepository } from "./infrastructure/memory/MemoryPlayerRepository";
import { WorldEngine } from "./world/WorldEngine";

const app = express();
app.use(express.json());

const playerRepo = new MemoryPlayerRepository();
const world = new WorldEngine(playerRepo);

playerRepo.save({
  id: "player1",
  x: 0,
  y: 0
});

app.get("/api/player/:id", (req, res) => {
  const player = playerRepo.getById(req.params.id);
  if (!player) return res.status(404).json({ error: "Not found" });
  res.json(player);
});

app.post("/api/move", (req, res) => {
  const { playerId, dx, dy } = req.body;
  world.enqueueAction({ type: "MOVE", playerId, dx, dy });
  res.json({ ok: true });
});

setInterval(() => {
  world.tick();
}, 1000);

app.listen(3000, () => {
  console.log("API running on port 3000");
});