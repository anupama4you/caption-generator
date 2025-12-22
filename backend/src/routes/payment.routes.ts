import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const paymentController = new PaymentController();

// GET /api/payment/pricing - Get pricing from Stripe (public endpoint)
router.get('/pricing', (req, res) =>
  paymentController.getPricing(req, res)
);

// All other routes require authentication
router.use(authMiddleware);

// POST /api/payment/create-checkout-session - Create Stripe checkout session
router.post('/create-checkout-session', (req, res) =>
  paymentController.createCheckoutSession(req, res)
);

// POST /api/payment/verify-session - Verify checkout session (optional)
router.post('/verify-session', (req, res) =>
  paymentController.verifyCheckoutSession(req, res)
);
// POST /api/payment/verify-checkout-session - Alias for verify-session
router.post('/verify-checkout-session', (req, res) =>
  paymentController.verifyCheckoutSession(req, res)
);
// GET /api/payment/verify-session?session_id=... - convenience for success page redirects
router.get('/verify-session', (req, res) =>
  paymentController.verifyCheckoutSession(req as any, res)
);

export default router;
