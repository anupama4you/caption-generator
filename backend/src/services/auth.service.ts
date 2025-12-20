import prisma from '../config/database';
import { PasswordUtil } from '../utils/password.util';
import { JWTUtil } from '../utils/jwt.util';

export class AuthService {
  async register(email: string, password: string, name: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        subscriptionTier: 'FREE',
      },
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        emojiPreference: true,
      },
    });

    // Generate tokens
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);

      // Get updated user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const accessToken = JWTUtil.generateAccessToken({
        id: user.id,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
      });

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
