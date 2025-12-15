import { Router } from 'express';
import { CaptionController } from '../controllers/caption.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkCaptionLimit } from '../middleware/usageTracker.middleware';

const router = Router();
const captionController = new CaptionController();

// All routes require authentication
router.use(authMiddleware);

router.post('/generate', checkCaptionLimit, (req, res) =>
  captionController.generateCaption(req, res)
);
router.get('/', (req, res) => captionController.getCaptions(req, res));
router.get('/:id', (req, res) => captionController.getCaption(req, res));
router.patch('/:id/favorite', (req, res) => captionController.toggleFavorite(req, res));
router.delete('/:id', (req, res) => captionController.deleteCaption(req, res));

export default router;
