import axios from 'axios';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY ?? '';
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET ?? '';
const CALLBACK_URL = `${process.env.BACKEND_URL ?? 'http://localhost:5001'}/api/social/callback/tiktok`;

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  openId?: string;
}

export class TikTokService {
  getOAuthUrl(state: string, codeVerifier: string): string {
    // TikTok uses PKCE
    const params = new URLSearchParams({
      client_key: CLIENT_KEY,
      scope: 'user.info.basic,video.upload,video.publish',
      response_type: 'code',
      redirect_uri: CALLBACK_URL,
      state,
      code_challenge: codeVerifier,
      code_challenge_method: 'S256',
    });
    return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<TokenSet> {
    const { data } = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: CALLBACK_URL,
        code_verifier: codeVerifier,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
      openId: data.open_id,
    };
  }

  async getMe(accessToken: string): Promise<{ id: string; name: string; avatar?: string }> {
    const { data } = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { fields: 'open_id,display_name,avatar_url' },
    });
    return {
      id: data.data?.user?.open_id,
      name: data.data?.user?.display_name,
      avatar: data.data?.user?.avatar_url,
    };
  }

  async post(accessToken: string, videoUrl: string, title: string): Promise<string> {
    // Initialize video upload
    const { data: init } = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        post_info: { title: title.slice(0, 2200), privacy_level: 'PUBLIC_TO_EVERYONE', disable_duet: false, disable_comment: false, disable_stitch: false },
        source_info: { source: 'PULL_FROM_URL', video_url: videoUrl },
      },
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' } }
    );

    const publishId = init.data?.publish_id;
    return `https://www.tiktok.com/@me/video/${publishId}`;
  }
}

export const tiktokService = new TikTokService();
