import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { cloudinaryService } from '../services/cloudinary.service';
import { visionService } from '../services/vision.service';
import { publishToAll } from '../services/publish.service';

// Multer — memory storage, 100MB limit
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
}).single('media');

export class PublishController {
  /**
   * POST /api/publish/upload
   * Upload media to Cloudinary. Returns URL for vision analysis.
   */
  async uploadMedia(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await cloudinaryService.uploadMedia(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      return res.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.publicId,
          resourceType: result.resourceType,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        },
      });
    } catch (err: any) {
      console.error('uploadMedia error:', err);
      return res.status(500).json({ error: err.message ?? 'Upload failed' });
    }
  }

  /**
   * POST /api/publish/analyze
   * Run GPT-4o Vision on an image URL and return a description.
   * Body: { imageUrl: string }
   */
  async analyzeMedia(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

      const description = await visionService.analyzeImage(imageUrl);
      return res.json({ success: true, data: { description } });
    } catch (err: any) {
      console.error('analyzeMedia error:', err);
      return res.status(500).json({ error: 'Vision analysis failed' });
    }
  }

  /**
   * POST /api/publish
   * Publish caption + media to selected platforms.
   * Body: { caption, hashtags, platforms, mediaUrl?, mediaType?, cloudinaryId? }
   */
  async publishPost(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true, publishTrialUsed: true },
      });

      if (!user) return res.status(404).json({ error: 'User not found' });

      // Free trial enforcement
      if (user.subscriptionTier === 'FREE' && user.publishTrialUsed) {
        return res.status(403).json({
          error: 'PUBLISH_TRIAL_USED',
          message: 'You have used your free publish trial. Upgrade to publish more.',
        });
      }

      const { caption, hashtags = [], platforms, mediaUrl, mediaType, cloudinaryId } = req.body;

      if (!caption || !platforms?.length) {
        return res.status(400).json({ error: 'caption and platforms are required' });
      }

      // Fetch connected accounts for selected platforms
      const accounts = await prisma.socialAccount.findMany({
        where: { userId, platform: { in: platforms } },
        select: { platform: true, accountId: true, accountName: true, accessToken: true, refreshToken: true },
      });

      // Execute publishing
      const results = await publishToAll(platforms, caption, hashtags, mediaUrl ?? null, accounts);

      const anySuccess = results.some(r => r.status === 'success');
      const status = results.every(r => r.status === 'success')
        ? 'published'
        : anySuccess
        ? 'partial'
        : 'failed';

      // Persist publish record
      const post = await prisma.publishPost.create({
        data: {
          userId,
          mediaUrl,
          mediaType,
          cloudinaryId,
          caption,
          hashtags,
          platforms,
          status,
          results: {
            create: results.map(r => ({
              platform: r.platform,
              status: r.status,
              postUrl: r.postUrl,
              error: r.error,
            })),
          },
        },
        include: { results: true },
      });

      // Mark free trial as used if at least one platform succeeded
      if (user.subscriptionTier === 'FREE' && anySuccess) {
        await prisma.user.update({ where: { id: userId }, data: { publishTrialUsed: true } });
      }

      return res.json({ success: true, data: post });
    } catch (err: any) {
      console.error('publishPost error:', err);
      return res.status(500).json({ error: 'Publish failed' });
    }
  }

  /**
   * GET /api/publish/history
   * Paginated publish history for the current user.
   */
  async getHistory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, parseInt(req.query.limit as string) || 10);

      const [posts, total] = await Promise.all([
        prisma.publishPost.findMany({
          where: { userId },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { results: true },
        }),
        prisma.publishPost.count({ where: { userId } }),
      ]);

      return res.json({
        success: true,
        data: { posts, total, page, totalPages: Math.ceil(total / limit) },
      });
    } catch (err: any) {
      console.error('getHistory error:', err);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }
  }
}

export const publishController = new PublishController();
