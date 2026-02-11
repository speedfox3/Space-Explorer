import express from "express";
import { MemoryPlayerRepository } from "./infrastructure/memory/MemoryPlayerRepository";
import { WorldEngine } from "./world/WorldEngine";

const app = express();
app.use(express.json());

const playerRepo = new MemoryPlayerRepository();
const world = new WorldEngine(playerRepo);

// Dummy player for testing
playerRepo.save({ id: "player1" } as any);

// Endpoints
app.get("/player/:id", (req, res) => {
  const player = playerRepo.getById(req.params.id);
  if (!player) {
    return res.status(404).json({ error: "Player not found" });
  }
  res.json(player);
});

app.post("/move", (req, res) => {
  const { playerId, x, y } = req.body;
  world.enqueueAction({ type: "MOVE", playerId, x, y });
  res.json({ ok: true });
});

// Tick loop
setInterval(() => {
  world.tick();
}, 1000);

app.listen(3000, () => {
  console.log("API running on port 3000");
  console.log("World engine started with 1s tick.");
});
