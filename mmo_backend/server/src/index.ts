import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { MemoryPlayerRepository } from "./infrastructure/memory/MemoryPlayerRepository";
import { WorldEngine } from "./world/WorldEngine";

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const repo = new MemoryPlayerRepository();
const world = new WorldEngine(repo);

repo.save({
  id: "player1",
  x: 0,
  y: 0,
  energy: 100,
  maxEnergy: 100,
  radarActive: false
});

wss.on("connection", ws => {
  const interval = setInterval(() => {
    const state = world.getState("player1");
    ws.send(JSON.stringify(state));
  }, 1000);

  ws.on("close", () => clearInterval(interval));
});

app.post("/api/move", (req, res) => {
  world.enqueueAction({ type: "MOVE", ...req.body });
  res.json({ ok: true });
});

app.post("/api/radar/toggle", (req, res) => {
  world.enqueueAction({ type: "TOGGLE_RADAR", ...req.body });
  res.json({ ok: true });
});

app.post("/api/analyze", (req, res) => {
  world.enqueueAction({ type: "ANALYZE", ...req.body });
  res.json({ ok: true });
});

setInterval(() => world.tick(), 1000);

server.listen(3000, () => console.log("Realtime MMO running on 3000"));