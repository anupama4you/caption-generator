import axios from 'axios';
import FormData from 'form-data';

const CLIENT_ID = process.env.TWITTER_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET ?? '';
const CALLBACK_URL = `${process.env.BACKEND_URL ?? process.env.FRONTEND_URL?.replace(':5173', ':5001') ?? 'http://localhost:5001'}/api/social/callback/twitter`;

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
}

export class TwitterService {
  getOAuthUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: CALLBACK_URL,
      scope: 'tweet.read tweet.write users.read offline.access media.write',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `https://twitter.com/i/oauth2/authorize?${params}`;
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<TokenSet> {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const { data } = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK_URL,
        code_verifier: codeVerifier,
      }),
      { headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenSet> {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const { data } = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
      { headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
    };
  }

  async getMe(accessToken: string): Promise<{ id: string; name: string; username: string; profile_image_url?: string }> {
    const { data } = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { 'user.fields': 'profile_image_url' },
    });
    return data.data;
  }

  async post(accessToken: string, text: string, mediaUrl?: string): Promise<string> {
    let mediaId: string | undefined;

    // Upload media first if provided
    if (mediaUrl) {
      try {
        mediaId = await this.uploadMedia(accessToken, mediaUrl);
      } catch {
        // Post without media if upload fails
      }
    }

    const body: any = { text };
    if (mediaId) body.media = { media_ids: [mediaId] };

    const { data } = await axios.post(
      'https://api.twitter.com/2/tweets',
      body,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    const tweetId = data.data?.id;
    // Get username for URL (we'd need to fetch it separately, use placeholder)
    return `https://twitter.com/i/web/status/${tweetId}`;
  }

  private async uploadMedia(accessToken: string, mediaUrl: string): Promise<string> {
    // Download media
    const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const mimeType = response.headers['content-type'] || 'image/jpeg';

    const form = new FormData();
    form.append('media', buffer, { filename: 'media', contentType: mimeType });

    const { data } = await axios.post(
      'https://upload.twitter.com/1.1/media/upload.json',
      form,
      { headers: { Authorization: `Bearer ${accessToken}`, ...form.getHeaders() } }
    );
    return data.media_id_string;
  }
}

export const twitterService = new TwitterService();
