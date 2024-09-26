import express, { Application, Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import configurations
import dbConnect from "./config/database";
import { errorHandler, notFound } from "./middleware/errorHandler";
import logger from "./utils/logger";

// Import routes (these will be created later)
// import authRoutes from './routes/auth';
// import userRoutes from './routes/user';
// import chatRoutes from './routes/chat';

// Import socket handlers (this will be created later)
// import socketHandler from './sockets/socketHandler';

const app: Application = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
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
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    } else {
      logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
});

// Static files
app.use("/uploads", express.static("uploads"));

// Routes (commented out until routes are created)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Chat App Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO connection handling (commented out until socket handler is created)
// socketHandler(io);

// Error handling middleware
app.use(notFound);
// app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || "5000", 10);

server.listen(PORT, async () => {
  logger.info(`Server running on port http://localhost:${PORT}`);
  // Connect to MongoDB
  await dbConnect();
  logger.info(`Socket.IO server ready for connections`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export { app, server, io };
