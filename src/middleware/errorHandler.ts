import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { AppError, NotFoundError } from "../utils/AppError";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Not found - ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err, message: err.message };
  let statusCode = 500;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
  }

  logger.error({
    message: error.message,
    url: req.originalUrl,
    method: req.method,
    statusCode: statusCode,
    stack: error.stack,
  });

  let clientMessage = "Something went wrong. Please try again later.";
  if (error instanceof AppError && error.isOperational) {
    clientMessage = error.message;
  }

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
    timestamp: new Date().toISOString(),
  });
};
