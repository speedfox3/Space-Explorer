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

function broadcast() {
  const state = world.getState("player1");
  const data = JSON.stringify(state);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

wss.on("connection", ws => {
  ws.send(JSON.stringify(world.getState("player1")));
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

setInterval(() => {
  world.tick();
  broadcast();
}, 1000);

server.listen(3000, () => console.log("Phase 1 MMO running on 3000"));