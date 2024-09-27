export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture the stack trace, excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific Error Types
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication Failed') {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

// Validation Error that carries structured details
export class ValidationError extends AppError {
  public readonly details: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
  constructor(
    details: Array<{ field: string; message: string; value?: unknown }>,
    message: string = 'Validation failed',
  ) {
    super(message, 422, true);
    this.details = details;
  }
}

// Generic HTTP error convenience when you want to specify any status code
export class HttpError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
  ) {
    super(message, statusCode, isOperational);
  }
}
