import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import prisma from '../config/database';
import { emailService } from '../services/email.service';
import { PasswordUtil } from '../utils/password.util';
import {
  successResponse,
  errorResponse,
} from '../utils/response.util';

export class PasswordResetController {
  /**
   * Request password reset - sends email with reset link
   */
  async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return successResponse(
          res,
          null,
          'If an account with that email exists, we sent a password reset link'
        );
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate any existing tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          used: false,
        },
        data: {
          used: true,
        },
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      // Send reset email
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        resetToken
      );

      if (!emailSent) {
        console.error('Failed to send password reset email to:', user.email);
      }

      return successResponse(
        res,
        null,
        'If an account with that email exists, we sent a password reset link'
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      return errorResponse(res, 'Failed to process password reset request', 500);
    }
  }

  /**
   * Validate reset token
   */
  async validateResetToken(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: { select: { email: true } } },
      });

      if (!resetToken) {
        return errorResponse(res, 'Invalid or expired reset link', 400);
      }

      if (resetToken.used) {
        return errorResponse(res, 'This reset link has already been used', 400);
      }

      if (new Date() > resetToken.expiresAt) {
        return errorResponse(res, 'This reset link has expired', 400);
      }

      return successResponse(res, {
        valid: true,
        email: resetToken.user.email,
      });
    } catch (error) {
      console.error('Validate reset token error:', error);
      return errorResponse(res, 'Failed to validate reset token', 500);
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token, password } = req.body;

      // Find and validate token
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        return errorResponse(res, 'Invalid or expired reset link', 400);
      }

      if (resetToken.used) {
        return errorResponse(res, 'This reset link has already been used', 400);
      }

      if (new Date() > resetToken.expiresAt) {
        return errorResponse(res, 'This reset link has expired', 400);
      }

      // Hash new password
      const hashedPassword = await PasswordUtil.hash(password);

      // Update password and mark token as used
      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        }),
      ]);

      return successResponse(res, null, 'Password has been reset successfully');
    } catch (error) {
      console.error('Reset password error:', error);
      return errorResponse(res, 'Failed to reset password', 500);
    }
  }
}
