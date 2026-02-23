/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Authentication error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Authorization error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Usage limit exceeded error (403)
 */
export class LimitExceededError extends AppError {
  public readonly currentUsage: number;
  public readonly limit: number;
  public readonly remaining: number;
  public readonly upgrade: boolean;

  constructor(
    message: string,
    details: {
      currentUsage: number;
      limit: number;
      remaining: number;
      upgrade?: boolean;
    }
  ) {
    super(message, 403, 'LIMIT_EXCEEDED', details);
    this.currentUsage = details.currentUsage;
    this.limit = details.limit;
    this.remaining = details.remaining;
    this.upgrade = details.upgrade ?? false;
  }
}

/**
 * Payment error (402)
 */
export class PaymentError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 402, 'PAYMENT_ERROR', details);
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(message: string, service?: string) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', { service });
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Type guard to check if error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
