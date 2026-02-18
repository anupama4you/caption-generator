import { Router } from 'express';
import { CaptionController } from '../controllers/caption.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { checkCaptionLimit } from '../middleware/usageTracker.middleware';
import { captionGenerationRateLimit } from '../middleware/captionRateLimit.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import {
  generateCaptionSchema,
  saveGuestCaptionsSchema,
  attemptIdParamSchema,
  paginationQuerySchema,
} from '../validators';

const router = Router();
const captionController = new CaptionController();

// Generation endpoint - allow unauthenticated users for trial with strict rate limiting
// Middleware stack:
// 1. optionalAuthMiddleware - Check for JWT (optional)
// 2. captionGenerationRateLimit - Strict rate limits (5/hour for guests, 100/hour for users)
// 3. validateBody - Validate request structure
// 4. checkCaptionLimit - Enforce monthly subscription limits for authenticated users
router.post(
  '/generate',
  optionalAuthMiddleware,
  ...captionGenerationRateLimit,
  validateBody(generateCaptionSchema),
  checkCaptionLimit,
  (req, res) => captionController.generateCaption(req, res)
);

// All other routes require authentication
router.use(authMiddleware);

// Save guest captions after signup
router.post('/save-guest', validateBody(saveGuestCaptionsSchema), (req, res) =>
  captionController.saveGuestCaptions(req, res)
);

// Attempts endpoints
router.get('/attempts', validateQuery(paginationQuerySchema), (req, res) =>
  captionController.getAttempts(req, res)
);
router.get('/attempts/:id', validateParams(attemptIdParamSchema), (req, res) =>
  captionController.getAttemptById(req, res)
);
router.put('/attempts/:id/favorite', validateParams(attemptIdParamSchema), (req, res) =>
  captionController.toggleFavorite(req, res)
);
router.delete('/attempts/:id', validateParams(attemptIdParamSchema), (req, res) =>
  captionController.deleteAttempt(req, res)
);

export default router;
