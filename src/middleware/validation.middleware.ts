import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import logger from "../utils/logger";
import { ValidationError } from "../utils/AppError";

/**
 * Middleware to validate request data
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    logger.warn(`Validation errors: ${JSON.stringify(errorMessages)}`);

    // Forward to centralized error handler
    next(new ValidationError(errorMessages));
    return;
  }
  
  next();
};
