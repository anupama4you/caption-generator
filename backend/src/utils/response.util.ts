import { Response } from 'express';

/**
 * Standard API response interface
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: unknown;
}

/**
 * Standard success response
 */
export const successResponse = <T>(
  res: Response,
  data?: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Success response with pagination
 */
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  },
  message = 'Success'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

/**
 * Created response (201)
 */
export const createdResponse = <T>(
  res: Response,
  data?: T,
  message = 'Created successfully'
): Response => {
  return successResponse(res, data, message, 201);
};

/**
 * Standard error response
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  code?: string,
  details?: unknown
): Response => {
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  if (code) {
    response.code = code;
  }

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Not found response (404)
 */
export const notFoundResponse = (
  res: Response,
  message = 'Resource not found'
): Response => {
  return errorResponse(res, message, 404, 'NOT_FOUND');
};

/**
 * Unauthorized response (401)
 */
export const unauthorizedResponse = (
  res: Response,
  message = 'Unauthorized'
): Response => {
  return errorResponse(res, message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden response (403)
 */
export const forbiddenResponse = (
  res: Response,
  message = 'Forbidden'
): Response => {
  return errorResponse(res, message, 403, 'FORBIDDEN');
};

/**
 * Validation error response (400)
 */
export const validationErrorResponse = (
  res: Response,
  details: unknown,
  message = 'Validation failed'
): Response => {
  return errorResponse(res, message, 400, 'VALIDATION_ERROR', details);
};

/**
 * Server error response (500)
 */
export const serverErrorResponse = (
  res: Response,
  message = 'Internal server error'
): Response => {
  return errorResponse(res, message, 500, 'INTERNAL_ERROR');
};

/**
 * Limit exceeded response (403)
 */
export const limitExceededResponse = (
  res: Response,
  message: string,
  details?: {
    currentUsage: number;
    limit: number;
    remaining: number;
    upgrade?: boolean;
  }
): Response => {
  return res.status(403).json({
    success: false,
    error: 'Limit exceeded',
    message,
    code: 'LIMIT_EXCEEDED',
    ...details,
  });
};
