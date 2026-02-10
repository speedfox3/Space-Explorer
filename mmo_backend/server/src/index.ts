import express from 'express';
import cors from 'cors';

import { startTickLoop } from './tick/tickLoop.js';
import { actionRouter } from './api/actions.js';
import { stateRouter } from './api/state.js';
import { analyzeRouter } from './api/analyze.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/actions', actionRouter);
app.use('/state', stateRouter);
app.use('/analyze', analyzeRouter);

startTickLoop(); // 🔥 ESTO ES CLAVE

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
