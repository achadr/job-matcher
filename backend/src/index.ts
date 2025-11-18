import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jobsRouter from './routes/jobs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/jobs', jobsRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - GET /api/jobs/matches`);
  console.log(`  - GET /api/jobs/profile`);
  console.log(`  - GET /api/health`);

  if (!process.env.POLE_EMPLOI_CLIENT_ID || !process.env.POLE_EMPLOI_CLIENT_SECRET) {
    console.log('\nNote: Pôle Emploi API credentials not configured.');
    console.log('Using mock data. Set POLE_EMPLOI_CLIENT_ID and POLE_EMPLOI_CLIENT_SECRET in .env to use real API.');
  }
});
