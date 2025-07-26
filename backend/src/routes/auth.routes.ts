import { Router } from 'express';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { Octokit } from '@octokit/rest';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { prisma } from '../lib/prisma';
import env from '../config/env';
import { AppError } from '../utils/AppError';
import { authenticate } from '../middleware/auth';

export const authRoutes = Router();

// Validation schemas
const socialLoginSchema = z.object({
  provider: z.enum(['google', 'github', 'x']),
  token: z.string(),
});

const walletLoginSchema = z.object({
  walletType: z.enum(['cardano', 'ethereum']),
  address: z.string(),
  signature: z.string(),
});

// OAuth clients
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// Helper functions
const generateToken = (user: { id: string; email: string }) => {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: '7d' });
};

// Routes
authRoutes.post('/social/login', async (req, res, next) => {
  try {
    const { provider, token } = socialLoginSchema.parse(req.body);
    let userData: { id: string; email: string; name: string } | null = null;

    switch (provider) {
      case 'google':
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email) throw new AppError('Invalid token', 400);
        userData = {
          id: payload.sub,
          email: payload.email,
          name: payload.name || '',
        };
        break;

      case 'github':
        const octokit = new Octokit({ auth: token });
        const { data } = await octokit.users.getAuthenticated();
        userData = {
          id: data.id.toString(),
          email: data.email || '',
          name: data.name || '',
        };
        break;

      default:
        throw new AppError('Unsupported provider', 400);
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { googleId: provider === 'google' ? userData.id : undefined },
          { githubId: provider === 'github' ? userData.id : undefined },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          ...(provider === 'google' ? { googleId: userData.id } : {}),
          ...(provider === 'github' ? { githubId: userData.id } : {}),
        },
      });
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/wallet/connect', async (req, res, next) => {
  try {
    const { walletType, address, signature } = walletLoginSchema.parse(req.body);

    // Verify wallet signature here based on walletType
    // This is a placeholder - implement actual wallet signature verification
    const isValidSignature = true;
    if (!isValidSignature) {
      throw new AppError('Invalid wallet signature', 400);
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${address}@wallet.koosi.io`,
          name: `Wallet User ${address.slice(0, 8)}`,
          walletAddress: address,
        },
      });
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// Get current user
authRoutes.get('/me', authenticate, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      walletAddress: true,
      createdAt: true,
    },
  });
  res.json(user);
});
