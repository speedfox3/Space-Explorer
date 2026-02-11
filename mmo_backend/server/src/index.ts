import express from 'express';
import cors from 'cors';
import { createSystem } from './world/universe.js';
import { scanSystem } from './world/scan.js';

const app = express();
app.use(cors());
app.use(express.json());

createSystem('alpha');

app.post('/scan', (req, res) => {
  const { x, y } = req.body;
  const results = scanSystem('alpha', x, y);
  res.json(results);
});

app.listen(3000, () => {
  console.log('World-centric server running on port 3000');
});