/**
 * JWT Utilities
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthUser } from '../types/api.types';

/**
 * Generate JWT token
 */
export const generateToken = (user: AuthUser): string => {
  const payload = { username: user.username };
  const secret = config.jwt.secret;
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as any };

  return jwt.sign(payload, secret, options);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): AuthUser => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
