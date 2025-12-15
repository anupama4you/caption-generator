import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await authService.register(email, password, name);

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'User already exists') {
        return res.status(409).json({ error: error.message });
      }
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Failed to register user' });
    }
  }

  async login(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await authService.login(email, password);

      return res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Failed to login' });
    }
  }

  async refresh(req: Request, res: Response): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Missing refresh token' });
      }

      const result = await authService.refreshToken(refreshToken);

      return res.json(result);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await authService.getMe(req.user.id);

      return res.json(user);
    } catch (error) {
      console.error('Get me error:', error);
      return res.status(500).json({ error: 'Failed to get user' });
    }
  }
}
