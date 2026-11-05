import express from 'express';
import { prisma } from '@repo/db';
import { chatRouter } from './routes/chat.routes.ts';
import { keysRouter } from './routes/keys.routes.ts';
import { projectsRouter } from './routes/projects.routes.ts';
import './workers/usage.worker.ts';
import { authRouter } from './routes/auth.routes.ts';
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin:'http://localhost:3000',
  credentials:true
}))
app.use(cookieParser());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('LLM Gateway API is running!');
});
 
// Mount Routes
app.use('/v1/auth', authRouter);
app.use('/v1/projects', projectsRouter);
app.use('/v1/keys', keysRouter);
app.use('/v1/chat', chatRouter);

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

