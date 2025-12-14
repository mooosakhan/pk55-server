import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import bannerRoutes from './routes/banner';
import { initializeDiscount, scheduleDiscountUpdates } from './utils/discountScheduler';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/banner', bannerRoutes);

app.get('/', (_req, res) => res.json({ message: 'Hello from Express server!' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const startServer = async () => {
  await connectDB();

  // Start server first
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
  });

  // Run background jobs after server starts
  initializeDiscount().catch(console.error);
  scheduleDiscountUpdates();
};

startServer();
