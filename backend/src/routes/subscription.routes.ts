import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const subscriptionController = new SubscriptionController();

// All routes require authentication
router.use(authMiddleware);

// POST /api/subscription/upgrade - Upgrade subscription
router.post('/upgrade', (req, res) => subscriptionController.upgradeSubscription(req, res));

// GET /api/subscription - Get current subscription details
router.get('/', (req, res) => subscriptionController.getSubscription(req, res));

// POST /api/subscription/cancel - Cancel/downgrade subscription
router.post('/cancel', (req, res) => subscriptionController.cancelSubscription(req, res));

export default router;
