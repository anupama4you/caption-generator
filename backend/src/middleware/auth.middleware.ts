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
