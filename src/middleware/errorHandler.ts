import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: Record<string, { message: string }>;
}

interface ErrorResponse {
  success: boolean;
  error: string;
  stack?: string;
  timestamp: string;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: CustomError = { ...err };
  error.message = err.message;

  // Log error with context
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      statusCode: error.statusCode || 500,
    },
    "Error occurred"
  );

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { name: "CastError", message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { name: "ValidationError", message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors || {})
      .map((val: any) => val.message)
      .join(", ");
    error = { name: "ValidationError", message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { name: "JsonWebTokenError", message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { name: "TokenExpiredError", message, statusCode: 401 };
  }

  // Multer errors (file upload)
  if (err.name === "LIMIT_FILE_SIZE") {
    const message = "File too large";
    error = { name: "LIMIT_FILE_SIZE", message, statusCode: 400 };
  }

  if (err.name === "LIMIT_UNEXPECTED_FILE") {
    const message = "Unexpected file field";
    error = { name: "LIMIT_UNEXPECTED_FILE", message, statusCode: 400 };
  }

  // Syntax errors
  if (err.name === "SyntaxError" && "body" in err) {
    const message = "Invalid JSON";
    error = { name: "SyntaxError", message, statusCode: 400 };
  }

  const response: ErrorResponse = {
    success: false,
    error: error.message || "Server Error",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(error.statusCode || 500).json(response);
};

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export { errorHandler, notFound };
