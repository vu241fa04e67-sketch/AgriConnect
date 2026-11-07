import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import User from './models/User.js';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/authRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 600 }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'AgriConnect' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handlers
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const port = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // If database is empty, automatically seed initial demo data
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in database. Seeding initial demo data...');
      await seedDatabase();
    }
    app.listen(port, () => console.log(`🚀 AgriConnect API running on port ${port}`));
  })
  .catch((e) => {
    console.error('Database connection failed:', e.message);
    process.exit(1);
  });
