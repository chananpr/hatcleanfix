import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articlesRouter from './routes/articles.js';
import queuesRouter from './routes/queues.js';
import authRouter from './routes/auth.js';
import uploadsRouter from './routes/uploads.js';
import { healthCheck } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const originsEnv = process.env.FRONTEND_ORIGIN || process.env.CLIENT_ORIGINS || '*';
const originList =
  originsEnv === '*'
    ? '*'
    : originsEnv
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

app.use(
  cors({
    origin: originList === '*' ? '*' : originList,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (req, res) => {
  try {
    await healthCheck();
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/queues', queuesRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await healthCheck();
    console.log('✅ Connected to database');
  } catch (err) {
    console.error('❌ Database connection failed', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

start();
