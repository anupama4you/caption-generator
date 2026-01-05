import { Router } from 'express';
import { CaptionController } from '../controllers/caption.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const captionController = new CaptionController();

// Generation endpoint - allow unauthenticated users for trial
router.post('/generate', optionalAuthMiddleware, (req, res) =>
  captionController.generateCaption(req, res)
);

// All other routes require authentication
router.use(authMiddleware);

// Save guest captions after signup
router.post('/save-guest', (req, res) => captionController.saveGuestCaptions(req, res));

// Attempts endpoints
router.get('/attempts', (req, res) => captionController.getAttempts(req, res));
router.get('/attempts/:id', (req, res) => captionController.getAttemptById(req, res));
router.put('/attempts/:id/favorite', (req, res) => captionController.toggleFavorite(req, res));
router.delete('/attempts/:id', (req, res) => captionController.deleteAttempt(req, res));

export default router;
