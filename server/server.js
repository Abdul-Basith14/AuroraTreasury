import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { verifyCloudinaryConfig } from './config/cloudinary.js';
import authRoutes from './routes/auth.js';
import groupFundRoutes from './routes/groupFund.js';
import reimbursementRoutes from './routes/reimbursement.js';
import treasurerRoutes from './routes/treasurer.js';
import partyAmountRoutes from './routes/partyAmount.js';
import { startCronJobs } from './utils/cronJobs.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Start Cron Jobs
startCronJobs();

// Verify Cloudinary configuration
verifyCloudinaryConfig();

// Middleware

// CORS Configuration - Allow requests from frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Request Logger Middleware (Development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/groupfund', groupFundRoutes);
app.use('/api/reimbursement', reimbursementRoutes);
app.use('/api/treasurer', treasurerRoutes);
app.use('/api/party-amount', partyAmountRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AuroraTreasury API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      groupFund: '/api/groupfund',
      reimbursement: '/api/reimbursement',
      treasurer: '/api/treasurer',
    },
  });
});

// Health Check Route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`\n📚 Available Routes:`);
  console.log(`   - POST   http://localhost:${PORT}/api/auth/signup`);
  console.log(`   - POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET    http://localhost:${PORT}/api/auth/me`);
  console.log(`   - POST   http://localhost:${PORT}/api/auth/verify`);
  console.log(`   - POST   http://localhost:${PORT}/api/auth/logout`);
  console.log(`   - GET    http://localhost:${PORT}/api/groupfund/my-payments`);
  console.log(`   - POST   http://localhost:${PORT}/api/groupfund/submit-payment`);
  console.log(`   - GET    http://localhost:${PORT}/api/groupfund/settings`);
  console.log(`   - POST   http://localhost:${PORT}/api/reimbursement/request`);
  console.log(`   - GET    http://localhost:${PORT}/api/reimbursement/my-requests`);
  console.log(`   - POST   http://localhost:${PORT}/api/reimbursement/confirm-receipt/:id`);
  console.log(`   - DELETE http://localhost:${PORT}/api/reimbursement/request/:id\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

export default app;
