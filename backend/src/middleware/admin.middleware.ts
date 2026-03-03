import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
  }
  return next();
};
