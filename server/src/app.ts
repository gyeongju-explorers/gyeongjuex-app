import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import placesRouter from './routes/places.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', placesRouter);

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`server listening on :${port}`);
});
