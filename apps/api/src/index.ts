import express from 'express';
import { prisma } from '@repo/db';
import { chatRouter } from './routes/chat.routes.ts';
import { keysRouter } from './routes/keys.routes.ts';
import './workers/usage.worker.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// Built-in middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('LLM Gateway API is running!');
});
 
// Mount the Core Gateway Route: POST /v1/chat/completions (protected by auth middleware)
app.use('/v1/chat', chatRouter);

// Mount Key Management Routes: POST/GET/DELETE /v1/keys
app.use('/v1/keys', keysRouter);

// DB verification route
app.get('/test-db', async (req, res) => {
  try {
    const users = await prisma.User.all();
    res.json({
      success: true,
      message: 'Prisma & Neon connected successfully!',
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.listen(PORT, async () => {
  console.log(` LLM Gateway running on http://localhost:${PORT}`);
  console.log(` Endpoint ready: POST http://localhost:${PORT}/v1/chat/completions`);
});

