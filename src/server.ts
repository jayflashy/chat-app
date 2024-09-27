import cors from 'cors';
import dotenv from 'dotenv';
import type { Application } from 'express';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

// Import configurations
import dbConnect from './config/database';
import { swaggerUi, swaggerSpec } from './config/swagger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import authRoutes from './modules/auth/auth.routes';
import chatRoutes from './modules/chat/chat.routes';
import userRoutes from './modules/user/user.routes';
import logger from './utils/logger';

// Import routes

// Import socket handlers (this will be created later)
// import socketHandler from './sockets/socketHandler';

const app: Application = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(cors());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/chats', chatRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'App is running',
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO connection handling (commented out until socket handler is created)
// socketHandler(io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || '8090', 10);

server.listen(PORT, async () => {
  logger.info(`Server running on port http://localhost:${PORT}`);
  // Connect to MongoDB
  await dbConnect();
  logger.info(`Socket.IO server ready for connections`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, server, io };
