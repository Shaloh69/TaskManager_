import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import taskRoutes from './routes/taskRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Add your production domains
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Development origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/healthyko?', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Healthy Ko OI taka man ka API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TaskManager API',
    version: '1.0.0',
    documentation: {
      endpoints: {
        health: 'GET /health',
        tasks: {
          getAll: `GET ${API_PREFIX}/tasks`,
          getById: `GET ${API_PREFIX}/tasks/:id`,
          getByStatus: `GET ${API_PREFIX}/tasks/status/:status`,
          getStats: `GET ${API_PREFIX}/tasks/stats`,
          create: `POST ${API_PREFIX}/tasks`,
          update: `PUT ${API_PREFIX}/tasks/:id`,
          partialUpdate: `PATCH ${API_PREFIX}/tasks/:id`,
          delete: `DELETE ${API_PREFIX}/tasks/:id`
        }
      },
      queryParams: {
        getAllTasks: {
          status: 'Filter by status (pending, in-progress, completed)',
          search: 'Search in title and description',
          page: 'Page number for pagination (default: 1)',
          limit: 'Number of items per page (default: 10, max: 100)'
        }
      },
      taskSchema: {
        title: 'string (required, 1-100 chars)',
        description: 'string (required, 1-500 chars)',
        status: 'string (pending | in-progress | completed)'
      }
    }
  });
});

// API Routes
app.use(`${API_PREFIX}/tasks`, taskRoutes);

// Handle undefined routes
app.use(notFound);

// Global error handling middleware
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Close database connection
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  });

  // Force close server after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`🚀 TaskManager API Server Started`);
  console.log('🚀 ========================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API Base URL: http://localhost:${PORT}${API_PREFIX}/tasks`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log('🚀 ========================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error('Closing server...');
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Shutting down...');
  process.exit(1);
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;