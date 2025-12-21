import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();
const webhookController = new WebhookController();

// POST /api/webhook/stripe - Stripe webhook endpoint
// Note: This route should NOT use JSON body parser middleware
// The raw body is needed for webhook signature verification
router.post('/stripe', (req, res) =>
  webhookController.handleStripeWebhook(req, res)
);

export default router;
