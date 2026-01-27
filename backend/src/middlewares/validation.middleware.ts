/**
 * Validation Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { sendError } from '../utils/response.utils';

/**
 * Validate request body against Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        sendError(res, 'VALIDATION_ERROR', messages.join(', '), 400);
        return;
      }
      next(error);
    }
  };
};

/**
 * Validate query parameters against Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        sendError(res, 'VALIDATION_ERROR', messages.join(', '), 400);
        return;
      }
      next(error);
    }
  };
};
