import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';

import connectDB from './config/database';
import authRoutes from './routes/auth';
import bannerRoutes from './routes/banner';
import {
  initializeDiscount,
  scheduleDiscountUpdates,
} from './utils/discountScheduler';

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/banner', bannerRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from Express server!' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

const startServer = async (): Promise<void> => {
  try {
    console.log('📦 Connecting to MongoDB...');
    await connectDB();

    // 🚀 Start HTTP server FIRST
    app.listen(PORT, '0.0.0.0', () => {
      console.log('✅ Server started');
      console.log(`🌐 Listening on port ${PORT}`);
    });

    // 🧠 Background jobs (non-blocking)
    initializeDiscount().catch((err: unknown) => {
      console.error('Discount init failed:', err);
    });

    scheduleDiscountUpdates();

  } catch (err: unknown) {
    console.error('❌ Startup error:', err);
    // ❌ NEVER exit process on Railway
  }
};

startServer();
