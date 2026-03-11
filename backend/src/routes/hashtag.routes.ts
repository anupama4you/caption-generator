import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { hashtagController } from '../controllers/hashtag.controller';

const router = Router();

router.use(authMiddleware);

router.get('/trending', (req, res) => hashtagController.getTrending(req as any, res));

export default router;
