/**
 * Authentication Controller
 */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.utils';

// Lazy initialization to ensure database is connected first
let authService: AuthService;
const getAuthService = () => {
  if (!authService) {
    authService = new AuthService();
  }
  return authService;
};

/**
 * Login endpoint
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Support both username (legacy) and email
    const loginIdentifier = email || req.body.username;

    const result = await getAuthService().login(loginIdentifier, password);
    
    // Send token in body (Bearer pattern)
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      sendError(res, 'INVALID_CREDENTIALS', 'Invalid username or password', 401);
    } else {
      next(error);
    }
  }
};

/**
 * Logout endpoint
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  sendSuccess(res, null, 'Logout successful');
};

/**
 * Get current user
 */
export const me = async (req: Request, res: Response): Promise<void> => {
  sendSuccess(res, { user: req.user });
};
