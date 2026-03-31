import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { socialController } from '../controllers/social.controller';

const router = Router();

router.use(authMiddleware);

router.get('/connect/:platform', (req, res) => socialController.getConnectUrl(req as any, res));
router.post('/sync', (req, res) => socialController.syncAccounts(req as any, res));
router.get('/accounts', (req, res) => socialController.getAccounts(req as any, res));
router.delete('/accounts/:platform', (req, res) => socialController.disconnect(req as any, res));
router.post('/publish', (req, res) => socialController.publishNow(req as any, res));

export default router;
