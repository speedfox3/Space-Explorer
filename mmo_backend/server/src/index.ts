import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { MemoryPlayerRepository } from "./infrastructure/memory/MemoryPlayerRepository";
import { WorldEngine } from "./world/WorldEngine";
import { Universe } from "./domain/models/Universe";

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const repo = new MemoryPlayerRepository();
const universe = new Universe();
const world = new WorldEngine(repo, universe);

repo.save({
  id: "player1",
  x: 0,
  y: 0,
  energy: 100,
  maxEnergy: 100,
  systemId: "solara",
  radarActive: false,
  radarRange: 40
});

wss.on("connection", ws => {
  ws.send(JSON.stringify(world.getState()));
});

function broadcast() {
  const state = JSON.stringify(world.getState());
  wss.clients.forEach(c=>{
    if (c.readyState===1) c.send(state);
  });
}

app.post("/api/move",(req,res)=>{
  world.move(req.body.dx, req.body.dy);
  res.json({ok:true});
});

app.post("/api/radar",(req,res)=>{
  world.toggleRadar();
  res.json({ok:true});
});

app.post("/api/interact",(req,res)=>{
  world.interact();
  res.json({ok:true});
});

setInterval(()=>{
  world.tick();
  broadcast();
},1000);

app.post("/api/travel", (req, res) => {
  const { targetSystemId } = req.body;

  const player = repo.get("player1");
  if (!player) return res.status(404).json({ error: "Player not found" });

  let destination = universe.getSystem(targetSystemId);

  // Si no existe → crear sistema procedural
  if (!destination) {
    const newId = universe.createProceduralSystem(player.systemId);
    player.systemId = newId;
  } else {
    player.systemId = targetSystemId;
  }

  player.x = 0;
  player.y = 0;

  repo.save(player);

  res.json({ ok: true });
});


app.post("/api/resolve", (req, res) => {
  const { objectId, score, maxScore } = req.body;

  world.resolveMinigame(objectId, score, maxScore);

  res.json({ ok: true });
});


app.post("/api/claim", (req, res) => {
  const { objectId, playerId } = req.body;

  if (!objectId || !playerId) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const result = world.claimObject(objectId, playerId);

  if (!result) {
    return res.status(404).json({ error: "Object not found or already claimed" });
  }

  res.json({ ok: true });
});

app.get("/api/claimed/:playerId", (req, res) => {
  const { playerId } = req.params;
  const claimed = world.getClaimedBy(playerId);
  res.json(claimed);
});


server.listen(3000,()=>console.log("Phase 1.7 online"));