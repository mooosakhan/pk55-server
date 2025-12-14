import 'dotenv/config';
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import bannerRoutes from "./routes/banner";
import { initializeDiscount, scheduleDiscountUpdates } from "./utils/discountScheduler";

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting server...');

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/banner", bannerRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express server!" });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log('📦 Connecting to MongoDB...');
    await connectDB();
    
    console.log('⚡ Initializing services...');
    // Initialize discount on server start
    await initializeDiscount();

    // Start discount scheduler
    scheduleDiscountUpdates();

    app.listen(PORT, () => {
      console.log('');
      console.log('✅ Server is ready!');
      console.log(`🌐 Server running at: http://localhost:${PORT}`);
      console.log(`📡 API endpoints:`);
      console.log(`   - GET  /api/health`);
      console.log(`   - POST /api/auth/login`);
      console.log(`   - POST /api/auth/register`);
      console.log(`   - GET  /api/banner`);
      console.log(`   - GET  /api/banner/image`);
      console.log(`   - PUT  /api/banner`);
      console.log(`   - POST /api/banner/upload`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
