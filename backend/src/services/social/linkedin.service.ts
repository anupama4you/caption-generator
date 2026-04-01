import axios from 'axios';

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET ?? '';
const CALLBACK_URL = `${process.env.BACKEND_URL ?? 'http://localhost:5001'}/api/social/callback/linkedin`;

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
}

export class LinkedInService {
  getOAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: CALLBACK_URL,
      scope: 'openid profile email w_member_social',
      state,
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }

  async exchangeCode(code: string): Promise<TokenSet> {
    const { data } = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK_URL,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
    };
  }

  async getMe(accessToken: string): Promise<{ id: string; name: string; avatar?: string }> {
    const { data } = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      id: data.sub,
      name: data.name,
      avatar: data.picture,
    };
  }

  async post(accessToken: string, authorUrn: string, text: string, imageUrl?: string): Promise<string> {
    const body: any = {
      author: `urn:li:person:${authorUrn}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
          media: imageUrl ? [await this.uploadImage(accessToken, authorUrn, imageUrl)] : undefined,
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const { data } = await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
    });

    return `https://www.linkedin.com/feed/update/${data.id}`;
  }

  private async uploadImage(accessToken: string, authorUrn: string, imageUrl: string): Promise<any> {
    // Register upload
    const { data: reg } = await axios.post(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${authorUrn}`,
          serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
        },
      },
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    const uploadUrl = reg.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = reg.value.asset;

    // Download and upload image
    const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    await axios.put(uploadUrl, imgResponse.data, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/octet-stream' },
    });

    return { status: 'READY', media: asset, description: { text: '' }, title: { text: '' } };
  }
}

export const linkedinService = new LinkedInService();
