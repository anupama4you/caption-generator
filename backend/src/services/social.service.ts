import axios from 'axios';
import prisma from '../config/database';
import { config } from '../config/env';

const zernio = axios.create({
  baseURL: 'https://zernio.com/api/v1',
  headers: { Authorization: `Bearer ${config.zernioApiKey}` },
});

// Maps our platform names → Zernio platform names
const PLATFORM_MAP: Record<string, string> = {
  instagram: 'instagram',
  tiktok: 'tiktok',
  facebook: 'facebook',
  linkedin: 'linkedin',
  youtube_shorts: 'youtube',
  youtube_long: 'youtube',
  x: 'twitter',
  pinterest: 'pinterest',
  snapchat: 'snapchat',
};

export class SocialService {
  /** Get or create a Zernio profile for the user. Returns the zernioProfileId. */
  async getOrCreateProfile(userId: string, name: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { zernioProfileId: true },
    });

    if (user?.zernioProfileId) return user.zernioProfileId;

    const res = await zernio.post('/profiles', {
      name,
      description: `Captions4You - ${userId}`,
    });

    const profileId: string = res.data.profile._id;
    await prisma.user.update({ where: { id: userId }, data: { zernioProfileId: profileId } });
    return profileId;
  }

  /** Returns the Zernio OAuth URL for connecting a platform. */
  async getConnectUrl(userId: string, platform: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const profileId = await this.getOrCreateProfile(userId, user?.name ?? 'User');
    const zernioPlatform = PLATFORM_MAP[platform] ?? platform;

    const res = await zernio.get(`/connect/${zernioPlatform}`, {
      params: { profileId },
    });

    return res.data.authUrl;
  }

  /** Fetches all connected accounts from Zernio and saves/updates them in our DB. */
  async syncAccounts(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { zernioProfileId: true },
    });

    if (!user?.zernioProfileId) return;

    const res = await zernio.get('/accounts', {
      params: { profileId: user.zernioProfileId },
    });

    const accounts: any[] = res.data.accounts ?? [];

    for (const account of accounts) {
      await prisma.socialConnection.upsert({
        where: { userId_platform: { userId, platform: account.platform } },
        update: {
          zernioAccountId: account._id,
          displayName: account.username ?? account.name ?? null,
          avatarUrl: account.avatarUrl ?? null,
          isActive: true,
        },
        create: {
          userId,
          platform: account.platform,
          zernioAccountId: account._id,
          displayName: account.username ?? account.name ?? null,
          avatarUrl: account.avatarUrl ?? null,
        },
      });
    }
  }

  /** Returns all active connected social accounts for the user. */
  async getConnections(userId: string) {
    return prisma.socialConnection.findMany({
      where: { userId, isActive: true },
      orderBy: { connectedAt: 'asc' },
    });
  }

  /** Marks a platform connection as inactive (soft disconnect). */
  async disconnect(userId: string, platform: string): Promise<void> {
    await prisma.socialConnection.updateMany({
      where: { userId, platform },
      data: { isActive: false },
    });
  }

  /** Publishes a caption immediately to the selected platforms via Zernio. */
  async publishNow(userId: string, content: string, platforms: string[]): Promise<void> {
    const zernioPlatforms = platforms.map(p => PLATFORM_MAP[p] ?? p);

    const connections = await prisma.socialConnection.findMany({
      where: { userId, platform: { in: zernioPlatforms }, isActive: true },
    });

    if (!connections.length) {
      throw new Error('No connected accounts found for the selected platforms. Connect your accounts first.');
    }

    await zernio.post('/posts', {
      content,
      publishNow: true,
      platforms: connections.map(c => ({
        platform: c.platform,
        accountId: c.zernioAccountId,
      })),
    });
  }
}

export const socialService = new SocialService();
