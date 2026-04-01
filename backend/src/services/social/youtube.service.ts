import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
const CALLBACK_URL = `${process.env.BACKEND_URL ?? 'http://localhost:5001'}/api/social/callback/youtube`;

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
}

function getClient(): OAuth2Client {
  return new OAuth2Client(CLIENT_ID, CLIENT_SECRET, CALLBACK_URL);
}

export class YouTubeService {
  getOAuthUrl(state: string): string {
    const client = getClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/userinfo.profile'],
      state,
      prompt: 'consent',
    });
  }

  async exchangeCode(code: string): Promise<TokenSet> {
    const client = getClient();
    const { tokens } = await client.getToken(code);
    return {
      accessToken: tokens.access_token ?? '',
      refreshToken: tokens.refresh_token ?? undefined,
      expiresIn: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : undefined,
      scope: tokens.scope ?? undefined,
    };
  }

  async getMe(accessToken: string): Promise<{ id: string; name: string; avatar?: string }> {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { id: data.id, name: data.name, avatar: data.picture };
  }

  async post(
    accessToken: string,
    title: string,
    description: string,
    videoUrl: string
  ): Promise<string> {
    // Download video
    const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    const videoBuffer = Buffer.from(videoResponse.data);
    const mimeType = videoResponse.headers['content-type'] || 'video/mp4';

    // Upload video to YouTube
    const { data } = await axios.post(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
      this.buildMultipartBody(
        { snippet: { title: title.slice(0, 100), description: description.slice(0, 5000), categoryId: '22' }, status: { privacyStatus: 'public' } },
        videoBuffer,
        mimeType
      ),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/related; boundary=boundary',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return `https://www.youtube.com/watch?v=${data.id}`;
  }

  private buildMultipartBody(metadata: any, video: Buffer, mimeType: string): Buffer {
    const metaStr = JSON.stringify(metadata);
    const boundary = 'boundary';
    const header = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      metaStr,
      '',
      `--${boundary}`,
      `Content-Type: ${mimeType}`,
      '',
      '',
    ].join('\r\n');
    const footer = `\r\n--${boundary}--`;
    return Buffer.concat([Buffer.from(header), video, Buffer.from(footer)]);
  }
}

export const youtubeService = new YouTubeService();
