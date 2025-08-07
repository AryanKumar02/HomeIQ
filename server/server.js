import http from 'http';

import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';

import { generalLimiter } from './middleware/rateLimitMiddleware.js';
import { csrfProtection } from './middleware/csrfMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import analyticsRoutes from './routes/analytics.js';
import healthRoutes from './routes/healthRoutes.js';
import logger from './utils/logger.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import User from './models/User.js';
import swaggerSpec from './utils/swagger.js';
import { connectDB } from './utils/db.js';
import { startScheduledTasks, stopScheduledTasks } from './utils/scheduledTasks.js';
import { emitAnalyticsToSocket } from './services/realTimeAnalytics.js';
import { ensureCurrentMonthSnapshot } from './services/analyticsService.js';
import { addModelValidationHooks } from './middleware/tenantConsistencyMiddleware.js';
import redisClient from './config/redis.js';

// Load environment variables
dotenv.config();

process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

const app = express();

// Trust proxy for Render deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Hide framework details
app.disable('x-powered-by');

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:3000', // Alternative dev port
  process.env.FRONTEND_URL, // Production Vercel URL
  'https://estatelink.live', // Your custom domain frontend
  'https://estate-link-six.vercel.app', // Your Vercel frontend
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, postman, etc)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, allow any localhost origin
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// Enable compression for all responses
app.use(
  compression({
    level: 6, // Compression level 1-9 (6 is good balance)
    threshold: 1024, // Only compress responses over 1KB
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression for all responses by default
      return compression.filter(req, res);
    },
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Global rate limiting
app.use('/api/', generalLimiter);

// CSRF protection for state-changing operations
app.use('/api/', csrfProtection);

// Morgan HTTP logging with Winston
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: message => logger.info(message.trim()),
      },
    }),
  );
}

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/property', propertyRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Not Found: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3001;
const MONGO_URI =
  process.env.DATABASE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/sellthis';

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    // Mirror HTTP CORS behavior for websockets
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', socket => {
  logger.info(`WebSocket connected: ${socket.id} (user: ${socket.user?.email || 'unknown'})`);

  // Join user-specific room for targeted updates
  socket.join(`user:${socket.user._id}`);

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Handle analytics subscription
  socket.on('analytics:subscribe', async () => {
    try {
      // Ensure current month snapshot exists (for future month-over-month comparisons)
      try {
        await ensureCurrentMonthSnapshot(socket.user._id);
      } catch (snapshotError) {
        logger.warn('Failed to auto-create snapshot during subscription:', snapshotError);
      }

      // Send initial analytics data
      await emitAnalyticsToSocket(socket, 'analytics:initial');
      logger.info(`Analytics subscription started for user ${socket.user._id}`);
    } catch (error) {
      logger.error('Error handling analytics subscription:', error);
      socket.emit('analytics:error', {
        message: 'Failed to subscribe to analytics updates',
        timestamp: new Date(),
      });
    }
  });

  // Handle analytics unsubscribe
  socket.on('analytics:unsubscribe', () => {
    logger.info(`Analytics unsubscribed for user ${socket.user._id}`);
  });

  // Handle real-time analytics refresh request
  socket.on('analytics:refresh', async () => {
    try {
      // Ensure current month snapshot exists (for future month-over-month comparisons)
      try {
        await ensureCurrentMonthSnapshot(socket.user._id);
      } catch (snapshotError) {
        logger.warn('Failed to auto-create snapshot during refresh:', snapshotError);
      }

      await emitAnalyticsToSocket(socket, 'analytics:refreshed');
    } catch (error) {
      logger.error('Error refreshing analytics:', error);
      socket.emit('analytics:error', {
        message: 'Failed to refresh analytics',
        timestamp: new Date(),
      });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`WebSocket disconnected: ${socket.id} (user: ${socket.user?.email || 'unknown'})`);
  });
});

// Make io available globally for use in other parts of the app
global.io = io;

const startServer = async () => {
  try {
    await connectDB(MONGO_URI);
    await redisClient.connect();

    // Add model validation hooks for data consistency
    addModelValidationHooks();

    // Start scheduled tasks (only in production/non-test environments)
    if (process.env.NODE_ENV !== 'test') {
      startScheduledTasks();
    }

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Server startup error:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw err;
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Graceful shutdown
const gracefulShutdown = signal => {
  logger.info(`${signal} RECEIVED. Shutting down gracefully`);

  // Stop scheduled tasks
  stopScheduledTasks();

  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
    // Close DB and Redis after HTTP server is closed
    Promise.allSettled([
      // Close MongoDB connection if open
      mongoose.connection && mongoose.connection.readyState !== 0
        ? mongoose.connection.close()
        : Promise.resolve(),
      // Close Redis client if connected
      redisClient && redisClient.isOpen ? redisClient.quit() : Promise.resolve(),
    ]).finally(() => {
      process.exit(0);
    });
  });

  // Force close server after timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export for testing
export { app, server, io };
export default app;
