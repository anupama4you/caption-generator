import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler.middleware';
import authRoutes from './routes/auth.routes';
import captionRoutes from './routes/caption.routes';
import profileRoutes from './routes/profile.routes';
import subscriptionRoutes from './routes/subscription.routes';
import paymentRoutes from './routes/payment.routes';
import webhookRoutes from './routes/webhook.routes';
import oauthRoutes from './routes/oauth.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Webhook route with raw body (must be before body parser)
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/captions', captionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/payment', paymentRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

export default app;
