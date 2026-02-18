import rateLimit from 'express-rate-limit';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

/**
 * Strict rate limiting for caption generation endpoint
 * Different limits for authenticated vs guest users
 */

// Store for tracking guest generation attempts per session
const guestSessionStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of guestSessionStore.entries()) {
    if (now > value.resetTime) {
      guestSessionStore.delete(key);
    }
  }
}, 3600000); // 1 hour

/**
 * Guest rate limiter - 5 generations per hour per IP
 * This is much stricter than the global API rate limit
 */
export const guestCaptionRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour for guests
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many caption generations. Please sign up for unlimited access.',
    error: 'RATE_LIMIT_EXCEEDED',
    upgrade: true,
  },
  // Only apply to unauthenticated requests
  skip: (req: AuthRequest) => {
    return !!req.user; // Skip rate limit if user is authenticated
  },
  keyGenerator: (req) => {
    // Use IP address as key
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

/**
 * Additional session-based limiting for guests
 * Tracks generations per session to prevent rapid-fire abuse
 */
export const guestSessionLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  // Skip if user is authenticated
  if (req.user) {
    return next();
  }

  const sessionKey = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const sessionData = guestSessionStore.get(sessionKey);

  // Reset window is 1 hour
  const windowMs = 60 * 60 * 1000;

  if (!sessionData || now > sessionData.resetTime) {
    // New session or expired session
    guestSessionStore.set(sessionKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    return next();
  }

  // Check if within limit (5 per hour)
  if (sessionData.count >= 5) {
    return res.status(429).json({
      success: false,
      message: 'You have reached the free trial limit. Sign up to continue generating captions!',
      error: 'GUEST_LIMIT_EXCEEDED',
      upgrade: true,
      resetTime: new Date(sessionData.resetTime).toISOString(),
    });
  }

  // Increment count
  sessionData.count += 1;
  guestSessionStore.set(sessionKey, sessionData);

  return next();
};

/**
 * Authenticated user rate limiter - More generous limits
 * 100 requests per hour for authenticated users
 */
export const authenticatedCaptionRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour for authenticated users
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
  },
  // Only apply to authenticated requests
  skip: (req: AuthRequest) => {
    return !req.user; // Skip if user is NOT authenticated (guests handled separately)
  },
  keyGenerator: (req: AuthRequest) => {
    // Use user ID as key for authenticated users
    return req.user?.id || 'unknown';
  },
});

/**
 * Combined rate limiter for caption generation
 * Applies different limits based on authentication status
 */
export const captionGenerationRateLimit = [
  guestCaptionRateLimit,
  authenticatedCaptionRateLimit,
  guestSessionLimit,
];
