import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const profileController = new ProfileController();

// All routes require authentication
router.use(authMiddleware);

router.get('/', (req, res) => profileController.getProfile(req, res));
router.put('/', (req, res) => profileController.updateProfile(req, res));
router.get('/usage', (req, res) => profileController.getUsage(req, res));

export default router;
