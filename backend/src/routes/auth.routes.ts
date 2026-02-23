import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators';

const router = Router();
const authController = new AuthController();

router.post('/register', validateBody(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validateBody(loginSchema), (req, res) => authController.login(req, res));
router.post('/refresh', validateBody(refreshTokenSchema), (req, res) => authController.refresh(req, res));
router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));

export default router;
