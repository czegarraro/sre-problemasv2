/**
 * Authentication Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';
import { AuthUser } from '../types/api.types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verify JWT token from Authorization header or cookie
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Try to get token from Authorization header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.token) {
      // Fallback to cookie
      token = req.cookies.token;
    }

    if (!token) {
      sendError(res, 'UNAUTHORIZED', 'No token provided', 401);
      return;
    }

    // Verify token
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
  }
};
