import 'dotenv/config';
import app from '../src/app';

// An Express app is itself a (req, res) handler, which is exactly what the
// Vercel Node runtime invokes. Nothing here may call listen().
export default app;
