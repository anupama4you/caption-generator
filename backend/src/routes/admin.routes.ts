import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { adminController } from '../controllers/admin.controller';

const router = Router();

// All admin routes require auth + admin flag
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', (req, res) => adminController.getStats(req as any, res));
router.get('/users', (req, res) => adminController.getUsers(req as any, res));
router.patch('/users/:id/tier', (req, res) => adminController.updateUserTier(req as any, res));
router.delete('/users/:id', (req, res) => adminController.deleteUser(req as any, res));
router.get('/captions', (req, res) => adminController.getCaptions(req as any, res));

export default router;
