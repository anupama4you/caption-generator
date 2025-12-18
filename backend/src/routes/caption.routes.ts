import { Router } from 'express';
import { CaptionController } from '../controllers/caption.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkCaptionLimit } from '../middleware/usageTracker.middleware';

const router = Router();
const captionController = new CaptionController();

// All routes require authentication
router.use(authMiddleware);

// Generation endpoint (with usage tracking)
router.post('/generate', checkCaptionLimit, (req, res) =>
  captionController.generateCaption(req, res)
);

// Attempts endpoints
router.get('/attempts', (req, res) => captionController.getAttempts(req, res));
router.get('/attempts/:id', (req, res) => captionController.getAttemptById(req, res));
router.put('/attempts/:id/favorite', (req, res) => captionController.toggleFavorite(req, res));
router.delete('/attempts/:id', (req, res) => captionController.deleteAttempt(req, res));

export default router;
