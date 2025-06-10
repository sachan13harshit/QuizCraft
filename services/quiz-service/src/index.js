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

// Middleware setup
app.use(helmet());

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  methods: ["GET", "PUT", "POST", "DELETE"],
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Quiz Service is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use("/quizzes", quizRoutes); // quiz routes
app.use("/questions", questionRoutes); // question routes
app.use("/responses", responseRoutes); // response routes

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
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

// 👇 Async IIFE to wait for DB before starting server
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('🌍 Current NODE_ENV:', process.env.NODE_ENV);
    });
  } catch (err) {
    console.error('❌ Failed to start server due to DB error:', err);
    process.exit(1);
  }
})(); 