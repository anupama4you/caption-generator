import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JWTPayload {
  id: string;
  email: string;
  subscriptionTier: string;
}

export class JWTUtil {
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '15m',
    });
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: '7d',
    });
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, config.jwtRefreshSecret) as JWTPayload;
  }
}
