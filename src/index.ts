import 'dotenv/config';
import app from './app';
import connectDB from './config/database';

const PORT = Number(process.env.PORT) || 3001;

// Local/long-running entry point. The serverless entry point is api/index.ts,
// which exports the same app without ever calling listen().
const startServer = async () => {
  // connectDB reports its own success/failure and never throws:
  // the server still starts so health checks stay reachable.
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

startServer();
