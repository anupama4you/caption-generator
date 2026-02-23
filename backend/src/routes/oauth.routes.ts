import { Router } from 'express';
import { OAuthController } from '../controllers/oauth.controller';

const router = Router();
const oauthController = new OAuthController();

// POST /api/oauth/google - Google OAuth authentication
router.post('/google', (req, res) => oauthController.googleAuth(req, res));

// POST /api/oauth/facebook - Facebook OAuth authentication
// Note: Instagram login also uses Facebook OAuth
router.post('/facebook', (req, res) => oauthController.facebookAuth(req, res));

// POST /api/oauth/tiktok - TikTok OAuth authentication
router.post('/tiktok', (req, res) => oauthController.tiktokAuth(req, res));

export default router;
