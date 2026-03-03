import prisma from '../config/database';
import { PasswordUtil } from '../utils/password.util';
import { JWTUtil } from '../utils/jwt.util';

export class AuthService {
  async register(email: string, password: string, name: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await PasswordUtil.hash(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, subscriptionTier: 'FREE' },
    });

    await prisma.userProfile.create({ data: { userId: user.id, emojiPreference: true } });

    const tokenPayload = { id: user.id, email: user.email, subscriptionTier: user.subscriptionTier, isAdmin: user.isAdmin };
    return {
      user: { id: user.id, email: user.email, name: user.name, subscriptionTier: user.subscriptionTier, trialEndsAt: null, trialActivated: false, isAdmin: user.isAdmin },
      accessToken: JWTUtil.generateAccessToken(tokenPayload),
      refreshToken: JWTUtil.generateRefreshToken(tokenPayload),
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    const tokenPayload = { id: user.id, email: user.email, subscriptionTier: user.subscriptionTier, isAdmin: user.isAdmin };
    return {
      user: { id: user.id, email: user.email, name: user.name, subscriptionTier: user.subscriptionTier, trialEndsAt: user.trialEndsAt || null, trialActivated: user.trialActivated || false, isAdmin: user.isAdmin },
      accessToken: JWTUtil.generateAccessToken(tokenPayload),
      refreshToken: JWTUtil.generateRefreshToken(tokenPayload),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) throw new Error('User not found');

      const accessToken = JWTUtil.generateAccessToken({
        id: user.id,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        isAdmin: user.isAdmin,
      });
      return { accessToken };
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier,
      trialEndsAt: user.trialEndsAt || null,
      trialActivated: user.trialActivated || false,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };
  }
}
