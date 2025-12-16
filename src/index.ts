import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import imagesRoutes from './routes/images';
import connectDB from './config/database';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/images', imagesRoutes);

app.get('/', (_req, res) => res.json({ message: 'PK55 API Server' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

connectDB().then(() => {
  console.log('✅ Connected to the database');
}).catch((err) => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
