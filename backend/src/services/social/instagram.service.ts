import axios from 'axios';

const APP_ID = process.env.FACEBOOK_APP_ID ?? '';
const APP_SECRET = process.env.FACEBOOK_APP_SECRET ?? '';
const CALLBACK_URL = `${process.env.BACKEND_URL ?? 'http://localhost:5001'}/api/social/callback/instagram`;
const GRAPH_URL = 'https://graph.facebook.com/v18.0';

export interface TokenSet {
  accessToken: string;
  accountId: string;   // Instagram Business Account ID
  accountName: string;
  accountAvatar?: string;
  scope?: string;
}

export class InstagramService {
  getOAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: APP_ID,
      redirect_uri: CALLBACK_URL,
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
      response_type: 'code',
      state,
    });
    return `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
  }

  async exchangeCode(code: string): Promise<TokenSet> {
    // Exchange code for short-lived token
    const { data: shortLived } = await axios.get(`${GRAPH_URL}/oauth/access_token`, {
      params: { client_id: APP_ID, client_secret: APP_SECRET, redirect_uri: CALLBACK_URL, code },
    });

    // Exchange for long-lived token
    const { data: longLived } = await axios.get(`${GRAPH_URL}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: APP_ID,
        client_secret: APP_SECRET,
        fb_exchange_token: shortLived.access_token,
      },
    });

    // Get Instagram Business Account linked to a Facebook Page
    const { data: pages } = await axios.get(`${GRAPH_URL}/me/accounts`, {
      params: { access_token: longLived.access_token, fields: 'id,name,access_token,instagram_business_account{id,name,profile_picture_url}' },
    });

    const page = pages.data?.find((p: any) => p.instagram_business_account);
    if (!page) throw new Error('No Instagram Business Account found. Connect your Instagram account to a Facebook Page first.');

    const igAccount = page.instagram_business_account;

    return {
      accessToken: page.access_token, // Page access token (never expires)
      accountId: igAccount.id,
      accountName: igAccount.name,
      accountAvatar: igAccount.profile_picture_url,
      scope: shortLived.scope,
    };
  }

  async post(pageAccessToken: string, igAccountId: string, caption: string, mediaUrl?: string): Promise<string> {
    if (!mediaUrl) {
      throw new Error('Instagram requires an image or video to post');
    }

    const isVideo = mediaUrl.match(/\.(mp4|mov|avi|m4v)(\?|$)/i);

    let mediaContainerId: string;

    if (isVideo) {
      const { data } = await axios.post(`${GRAPH_URL}/${igAccountId}/media`, null, {
        params: { video_url: mediaUrl, caption, media_type: 'REELS', access_token: pageAccessToken },
      });
      mediaContainerId = data.id;
      // Wait for processing
      await this.waitForVideoProcessing(pageAccessToken, mediaContainerId);
    } else {
      const { data } = await axios.post(`${GRAPH_URL}/${igAccountId}/media`, null, {
        params: { image_url: mediaUrl, caption, access_token: pageAccessToken },
      });
      mediaContainerId = data.id;
    }

    // Publish the container
    const { data: published } = await axios.post(`${GRAPH_URL}/${igAccountId}/media_publish`, null, {
      params: { creation_id: mediaContainerId, access_token: pageAccessToken },
    });

    return `https://www.instagram.com/p/${published.id}`;
  }

  private async waitForVideoProcessing(accessToken: string, containerId: string, maxWaitMs = 30000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const { data } = await axios.get(`${GRAPH_URL}/${containerId}`, {
        params: { fields: 'status_code', access_token: accessToken },
      });
      if (data.status_code === 'FINISHED') return;
      if (data.status_code === 'ERROR') throw new Error('Video processing failed on Instagram');
      await new Promise(r => setTimeout(r, 3000));
    }
    throw new Error('Video processing timed out');
  }
}

export const instagramService = new InstagramService();
