import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';

// Import routes
import quizRoutes from './routes/quizRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import responseRoutes from './routes/responseRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to MongoDB
await connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Quiz Service is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/responses', responseRoutes);

// Basic API info route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Quiz Service API is working',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      quizzes: '/api/quizzes',
      questions: '/api/questions',
      responses: '/api/responses'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Quiz Service running on port ${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🧠 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📝 Quizzes: http://localhost:${PORT}/api/quizzes`);
  console.log(`❓ Questions: http://localhost:${PORT}/api/questions`);
  console.log(`📊 Responses: http://localhost:${PORT}/api/responses`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app; 