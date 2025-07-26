import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import env from '../config/env';
import { AppError } from '../utils/AppError';

export const authRoutes = Router();

// Validation schemas
const socialLoginSchema = z.object({
  token: z.string(),
});

const walletLoginSchema = z.object({
  address: z.string(),
});

// OAuth clients
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// Helper functions
const generateToken = (user: { id: string; email: string }) => {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: '7d' });
};

// Routes
authRoutes.post('/social/login', async (req: Request, res: Response) => {
  try {
    const { token } = socialLoginSchema.parse(req.body);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid token', 400);
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: payload.email },
          { googleId: payload.sub },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || 'User',
          googleId: payload.sub,
        },
      });
    }

    const authToken = generateToken({ id: user.id, email: user.email });
    res.json({ token: authToken });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

authRoutes.post('/wallet/connect', async (req: Request, res: Response) => {
  try {
    const { address } = walletLoginSchema.parse(req.body);

    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${address}@wallet.koosi.app`,
          name: `Wallet ${address.slice(0, 6)}`,
          walletAddress: address,
        },
      });
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});


// Get current user
authRoutes.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
