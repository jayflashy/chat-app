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
import { requestLogger } from "./middleware/requestLogger";
import { swaggerUi, swaggerSpec } from "./config/swagger";

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
app.use(cors());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static("uploads"));

// Swagger API Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes (commented out until routes are created)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/chat', chatRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: App is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-21T12:30:00.000Z
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "App is running",
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO connection handling (commented out until socket handler is created)
// socketHandler(io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || "8090", 10);

server.listen(PORT, async () => {
  logger.info(`Server running on port http://localhost:${PORT}`);
  // Connect to MongoDB
  await dbConnect();
  logger.info(`Socket.IO server ready for connections`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export { app, server, io };
