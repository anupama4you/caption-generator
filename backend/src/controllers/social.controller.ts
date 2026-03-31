import { Response } from 'express';
import { AuthRequest } from '../types';
import { socialService } from '../services/social.service';

export class SocialController {
  /** GET /api/social/connect/:platform  — returns the Zernio OAuth URL */
  async getConnectUrl(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { platform } = req.params;
      const authUrl = await socialService.getConnectUrl(req.user!.id, platform);
      return res.json({ success: true, data: { authUrl } });
    } catch (error) {
      console.error('SocialController.getConnectUrl error:', error);
      return res.status(500).json({ error: 'Failed to get connect URL' });
    }
  }

  /** POST /api/social/sync  — sync connected accounts from Zernio after OAuth */
  async syncAccounts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      await socialService.syncAccounts(req.user!.id);
      const connections = await socialService.getConnections(req.user!.id);
      return res.json({ success: true, data: { connections } });
    } catch (error) {
      console.error('SocialController.syncAccounts error:', error);
      return res.status(500).json({ error: 'Failed to sync accounts' });
    }
  }

  /** GET /api/social/accounts  — list all connected accounts */
  async getAccounts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const connections = await socialService.getConnections(req.user!.id);
      return res.json({ success: true, data: { connections } });
    } catch (error) {
      console.error('SocialController.getAccounts error:', error);
      return res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  }

  /** DELETE /api/social/accounts/:platform  — disconnect a platform */
  async disconnect(req: AuthRequest, res: Response): Promise<Response> {
    try {
      await socialService.disconnect(req.user!.id, req.params.platform);
      return res.json({ success: true });
    } catch (error) {
      console.error('SocialController.disconnect error:', error);
      return res.status(500).json({ error: 'Failed to disconnect account' });
    }
  }

  /** POST /api/social/publish  — publish caption immediately via Zernio (premium only) */
  async publishNow(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (req.user?.subscriptionTier !== 'PREMIUM') {
        return res.status(403).json({ error: 'Publishing requires a Premium subscription.' });
      }

      const { content, platforms } = req.body;
      if (!content || !platforms?.length) {
        return res.status(400).json({ error: 'content and platforms are required' });
      }

      await socialService.publishNow(req.user.id, content, platforms);
      return res.json({ success: true, message: 'Published successfully!' });
    } catch (error: any) {
      console.error('SocialController.publishNow error:', error);
      return res.status(500).json({ error: error.message || 'Failed to publish post' });
    }
  }
}

export const socialController = new SocialController();
