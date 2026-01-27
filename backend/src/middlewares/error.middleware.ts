/**
 * Error Handling Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';

/**
 * Global error handler
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    sendError(res, 'VALIDATION_ERROR', err.message, 400);
    return;
  }

  if (err.name === 'UnauthorizedError') {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    return;
  }

  // Default error
  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    err.message || 'An unexpected error occurred',
    500
  );
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  sendError(res, 'NOT_FOUND', `Route ${req.originalUrl} not found`, 404);
};
