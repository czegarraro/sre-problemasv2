/**
 * Response Utilities
 */
import { Response } from 'express';
import { ApiError, ApiSuccess } from '../types/api.types';

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiSuccess<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: string,
  message: string,
  statusCode: number = 500
): Response => {
  const response: ApiError = {
    error,
    message,
    statusCode,
  };
  return res.status(statusCode).json(response);
};
