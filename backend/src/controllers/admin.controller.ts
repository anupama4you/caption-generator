import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

export class AdminController {
  /**
   * GET /api/admin/stats
   * Overview numbers for the dashboard
   */
  async getStats(_req: AuthRequest, res: Response): Promise<Response> {
    try {
      const [
        totalUsers,
        premiumUsers,
        trialUsers,
        freeUsers,
        totalAttempts,
        totalCaptions,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { subscriptionTier: 'PREMIUM' } }),
        prisma.user.count({ where: { subscriptionTier: 'TRIAL' } }),
        prisma.user.count({ where: { subscriptionTier: 'FREE' } }),
        prisma.captionAttempt.count(),
        prisma.caption.count(),
        prisma.user.count({
          where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        }),
      ]);

      // Daily signups for the last 14 days
      const last14Days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const signupCounts = await Promise.all(
        last14Days.map(async (day) => {
          const next = new Date(day);
          next.setDate(next.getDate() + 1);
          const count = await prisma.user.count({
            where: { createdAt: { gte: day, lt: next } },
          });
          return { date: day.toISOString().split('T')[0], count };
        })
      );

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          premiumUsers,
          trialUsers,
          freeUsers,
          totalAttempts,
          totalCaptions,
          newUsersLast30Days: recentUsers,
          signupTrend: signupCounts,
        },
      });
    } catch (error) {
      console.error('Admin getStats error:', error);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  /**
   * GET /api/admin/users?page=1&limit=20&search=&tier=
   */
  async getUsers(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const search = (req.query.search as string)?.trim() || '';
      const tier = req.query.tier as string;

      const where: any = {};
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (tier && ['FREE', 'TRIAL', 'PREMIUM'].includes(tier)) {
        where.subscriptionTier = tier;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            subscriptionTier: true,
            isAdmin: true,
            createdAt: true,
            trialEndsAt: true,
            trialActivated: true,
            stripeCustomerId: true,
            _count: { select: { captionAttempts: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: { users, total, page, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error('Admin getUsers error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  /**
   * PATCH /api/admin/users/:id/tier
   */
  async updateUserTier(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { tier } = req.body;

      if (!['FREE', 'TRIAL', 'PREMIUM'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier. Must be FREE, TRIAL, or PREMIUM' });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { subscriptionTier: tier },
        select: { id: true, email: true, name: true, subscriptionTier: true },
      });

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error('Admin updateUserTier error:', error);
      return res.status(500).json({ error: 'Failed to update user tier' });
    }
  }

  /**
   * DELETE /api/admin/users/:id
   */
  async deleteUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (req.user?.id === id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      await prisma.user.delete({ where: { id } });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Admin deleteUser error:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  /**
   * GET /api/admin/captions?page=1&limit=20&search=
   */
  async getCaptions(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const search = (req.query.search as string)?.trim() || '';

      const where: any = {};
      if (search) {
        where.OR = [
          { contentDescription: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [attempts, total] = await Promise.all([
        prisma.captionAttempt.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            contentFormat: true,
            contentDescription: true,
            niche: true,
            isFavorite: true,
            createdAt: true,
            user: { select: { id: true, email: true, name: true } },
            _count: { select: { captions: true } },
          },
        }),
        prisma.captionAttempt.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: { attempts, total, page, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error('Admin getCaptions error:', error);
      return res.status(500).json({ error: 'Failed to fetch captions' });
    }
  }
}

export const adminController = new AdminController();
