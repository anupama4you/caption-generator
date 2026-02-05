import { Router } from 'express';
import { PasswordResetController } from '../controllers/passwordReset.controller';
import { validateBody } from '../middleware/validate.middleware';
import { forgotPasswordSchema, resetPasswordSchema } from '../validators';

const router = Router();
const passwordResetController = new PasswordResetController();

// POST /api/password-reset/forgot - Request password reset email
router.post('/forgot', validateBody(forgotPasswordSchema), (req, res) =>
  passwordResetController.forgotPassword(req, res)
);

// GET /api/password-reset/validate/:token - Validate reset token
router.get('/validate/:token', (req, res) =>
  passwordResetController.validateResetToken(req, res)
);

// POST /api/password-reset/reset - Reset password with token
router.post('/reset', validateBody(resetPasswordSchema), (req, res) =>
  passwordResetController.resetPassword(req, res)
);

export default router;
