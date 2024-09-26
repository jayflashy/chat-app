import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

// 404 Not Found handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404).json({
    message: error.message,
  });
};

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 if status code wasn't set
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Log the error
  logger.error({
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    statusCode,
    stack: err.stack,
  });

  res.status(statusCode).json({
    message: err.message,
    // ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
