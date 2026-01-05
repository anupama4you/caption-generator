import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { JWTUtil } from '../utils/jwt.util';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = JWTUtil.verifyAccessToken(token);

    req.user = decoded;
    return next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized', message: 'Token expired' });
    }
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

// Optional auth middleware - allows both authenticated and unauthenticated users
export const optionalAuthMiddleware = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = JWTUtil.verifyAccessToken(token);
      req.user = decoded;
    }
    // If no token or invalid token, req.user remains undefined
    // but we still allow the request to proceed
    next();
  } catch (error) {
    // If token verification fails, just continue without setting req.user
    next();
  }
};
