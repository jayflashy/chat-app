import type { Request, Response, NextFunction } from 'express';

import { AppError, NotFoundError, ValidationError } from '../utils/AppError';
import logger from '../utils/logger';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Not found - ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const error = err;
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

  let clientMessage = 'Something went wrong. Please try again later.';
  if (error instanceof AppError && error.isOperational) {
    clientMessage = error.message;
  }

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
    statusCode: statusCode,
    ...(error instanceof ValidationError ? { details: error.details } : {}),
    timestamp: new Date().toISOString(),
  });
  next();
};
