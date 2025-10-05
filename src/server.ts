import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import dbConnect from './config/database';
import logger from './utils/logger';
import socketHandler from './sockets/socketHandler';
import app from './app';

// Load environment variables
dotenv.config();

const server = http.createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handling
socketHandler(io);

const PORT: number = parseInt(process.env.PORT || '8090', 10);

server.listen(PORT, async () => {
  logger.info(`Server running on port http://localhost:${PORT}`);
  // Connect to MongoDB
  await dbConnect();
  logger.info(`Socket.IO server ready for connections`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, server, io };
