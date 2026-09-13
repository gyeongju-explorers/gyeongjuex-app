import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import missionsRouter from './routes/missions.js';
import photosRouter from './routes/photos.js';
import placesRouter from './routes/places.js';
import recordRouter from './routes/record.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', placesRouter);
app.use('/api', missionsRouter);
app.use('/api', recordRouter);
app.use('/api', photosRouter);
app.use('/user', usersRouter);

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`server listening on :${port}`);
});
