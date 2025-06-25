import http from 'http';

import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import logger from './utils/logger.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import User from './models/User.js';
import swaggerSpec from './utils/swagger.js';
import { connectDB } from './utils/db.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/property', propertyRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Not Found: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sellthis';

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
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

  socket.on('ping', () => {
    socket.emit('pong');
  });

  socket.on('disconnect', () => {
    logger.info(`WebSocket disconnected: ${socket.id} (user: ${socket.user?.email || 'unknown'})`);
  });
});

const startServer = async () => {
  try {
    await connectDB(MONGO_URI);
    logger.info('MongoDB connected');
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('MongoDB connection error:', err);
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
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

// Export for testing
export { app, server, io };
export default app;
