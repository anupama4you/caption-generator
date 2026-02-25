import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import prisma from '../config/database';
import { JWTUtil } from '../utils/jwt.util';
import bcrypt from 'bcrypt';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class OAuthController {
  // Helper function to create or get user
  private async createOrGetUser(email: string, name?: string): Promise<any> {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create new user
    if (!user) {
      // Generate a random password (won't be used for OAuth logins)
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: hashedPassword,
          subscriptionTier: 'FREE',
        },
      });

      // Create user profile
      await prisma.userProfile.create({
        data: {
          userId: user.id,
        },
      });

      // Create initial usage tracking
      const now = new Date();
      await prisma.usageTracking.create({
        data: {
          userId: user.id,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          captionsGenerated: 0,
          monthlyLimit: 5, // FREE tier limit
        },
      });
    }

    return user;
  }

  // Helper function to generate auth response
  private generateAuthResponse(user: any) {
    const accessToken = JWTUtil.generateAccessToken({
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    });

    const refreshToken = JWTUtil.generateRefreshToken({
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt,
      },
    };
  }

  async googleAuth(req: Request, res: Response): Promise<Response> {
    try {
      const { credential, access_token } = req.body;

      let email: string;
      let name: string | undefined;

      if (credential) {
        // ID token flow (from <GoogleLogin> component)
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          return res.status(400).json({ error: 'Invalid Google token' });
        }
        email = payload.email;
        name = payload.name;
      } else if (access_token) {
        // Access token flow (from useGoogleLogin hook with custom button)
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const userInfo = userInfoResponse.data;
        if (!userInfo.email) {
          return res.status(400).json({ error: 'Could not get email from Google' });
        }
        email = userInfo.email;
        name = userInfo.name;
      } else {
        return res.status(400).json({ error: 'No credential provided' });
      }

      // Create or get user
      const user = await this.createOrGetUser(email, name);

      // Return auth response
      return res.status(200).json(this.generateAuthResponse(user));
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        message: error.message,
      });
    }
  }

  async facebookAuth(req: Request, res: Response): Promise<Response> {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        return res.status(400).json({ error: 'No access token provided' });
      }

      // Verify Facebook token and get user info
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
      );

      const { email, name } = response.data;

      if (!email) {
        return res.status(400).json({
          error: 'Email permission required',
          message: 'Please grant email permission to continue'
        });
      }

      // Create or get user
      const user = await this.createOrGetUser(email, name);

      // Return auth response
      return res.status(200).json(this.generateAuthResponse(user));
    } catch (error: any) {
      console.error('Facebook OAuth error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        message: error.message,
      });
    }
  }

  async tiktokAuth(req: Request, res: Response): Promise<Response> {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
      }

      // Exchange code for access token
      const tokenResponse = await axios.post('https://open-api.tiktok.com/oauth/access_token/', {
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      });

      const { access_token } = tokenResponse.data.data;

      // Get user info
      const userResponse = await axios.get('https://open-api.tiktok.com/oauth/userinfo/', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          fields: 'open_id,union_id,avatar_url,display_name',
        },
      });

      const { open_id, display_name } = userResponse.data.data.user;

      // TikTok doesn't provide email directly, use open_id as identifier
      const email = `${open_id}@tiktok.oauth`;
      const name = display_name || 'TikTok User';

      // Create or get user
      const user = await this.createOrGetUser(email, name);

      // Return auth response
      return res.status(200).json(this.generateAuthResponse(user));
    } catch (error: any) {
      console.error('TikTok OAuth error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        message: error.message,
      });
    }
  }
}
