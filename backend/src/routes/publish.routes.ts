import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { publishController, uploadMiddleware } from '../controllers/publish.controller';

const router = Router();

router.use(authMiddleware);

// Wrap multer for proper error handling
const handleUpload = (req: any, res: any, next: any) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

router.post('/upload', handleUpload, (req, res) => publishController.uploadMedia(req as any, res));
router.post('/analyze', (req, res) => publishController.analyzeMedia(req as any, res));
router.post('/', (req, res) => publishController.publishPost(req as any, res));
router.get('/history', (req, res) => publishController.getHistory(req as any, res));

export default router;
