import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import bannerRoutes from "./routes/banner";
import { initializeDiscount, scheduleDiscountUpdates } from "./utils/discountScheduler";

const app = express();
const PORT = process.env.PORT || 3001;

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

// Initialize discount on server start
initializeDiscount();

// Start discount scheduler
scheduleDiscountUpdates();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
