import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import imagesRoutes from './routes/images';
import settingsRoutes from './routes/settings';
import connectDB from './config/database';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Declared before the database middleware so they answer even when Mongo is
// unreachable — which is what makes them useful for diagnosing a bad deploy.
app.get('/', (_req, res) => res.json({ message: 'PK55 API Server' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// On Vercel every cold invocation starts with an unconnected Mongoose, so the
// connection cannot be established once at boot the way it is locally.
// connectDB caches its promise, making this a no-op on warm invocations.
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/settings', settingsRoutes);

export default app;
