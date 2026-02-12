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
  world.interact(req.body.objectId);
  res.json({ok:true});
});

setInterval(()=>{
  world.tick();
  broadcast();
},1000);

server.listen(3000,()=>console.log("Phase 1.5 system online"));