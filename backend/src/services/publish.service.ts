import { twitterService } from './social/twitter.service';
import { linkedinService } from './social/linkedin.service';
import { instagramService } from './social/instagram.service';
import { tiktokService } from './social/tiktok.service';
import { youtubeService } from './social/youtube.service';
import { decryptToken } from './social/token.service';

export interface ConnectedAccount {
  platform: string;
  accountId: string;
  accountName: string;
  accessToken: string;       // encrypted
  refreshToken?: string | null;
}

export interface PublishResultItem {
  platform: string;
  status: 'success' | 'failed' | 'skipped';
  postUrl?: string;
  error?: string;
}

export async function publishToAll(
  platforms: string[],
  caption: string,
  hashtags: string[],
  mediaUrl: string | null,
  accounts: ConnectedAccount[]
): Promise<PublishResultItem[]> {
  const accountMap = new Map(accounts.map(a => [a.platform, a]));
  const text = hashtags.length > 0 ? `${caption}\n\n${hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}` : caption;

  const results = await Promise.allSettled(
    platforms.map(async (platform): Promise<PublishResultItem> => {
      const account = accountMap.get(platform);
      if (!account) return { platform, status: 'skipped', error: 'No connected account' };

      const accessToken = decryptToken(account.accessToken);

      try {
        let postUrl: string;

        switch (platform) {
          case 'twitter': {
            postUrl = await twitterService.post(accessToken, text, mediaUrl ?? undefined);
            break;
          }
          case 'linkedin': {
            postUrl = await linkedinService.post(accessToken, account.accountId, text, mediaUrl ?? undefined);
            break;
          }
          case 'instagram': {
            postUrl = await instagramService.post(accessToken, account.accountId, caption, mediaUrl ?? undefined);
            break;
          }
          case 'tiktok': {
            if (!mediaUrl) throw new Error('TikTok requires a video');
            postUrl = await tiktokService.post(accessToken, mediaUrl, caption.slice(0, 2200));
            break;
          }
          case 'youtube': {
            if (!mediaUrl) throw new Error('YouTube requires a video');
            postUrl = await youtubeService.post(accessToken, caption.slice(0, 100), text, mediaUrl);
            break;
          }
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }

        return { platform, status: 'success', postUrl };
      } catch (err: any) {
        console.error(`Publish to ${platform} failed:`, err?.response?.data ?? err?.message);
        return { platform, status: 'failed', error: err?.response?.data?.error?.message ?? err?.message ?? 'Unknown error' };
      }
    })
  );

  return results.map(r => (r.status === 'fulfilled' ? r.value : { platform: 'unknown', status: 'failed', error: 'Internal error' }));
}
