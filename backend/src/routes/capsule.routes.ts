import { Router } from 'express';
import { z } from 'zod';
import CryptoJS from 'crypto-js';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import env from '../config/env';
import type { AuthRequest } from '../middleware/auth';

export const capsuleRoutes = Router();

// Validation schemas
const createCapsuleSchema = z.object({
  content: z.object({
    type: z.enum(['text', 'audio', 'video']),
    data: z.string(),
  }),
  recipients: z.array(z.string()),
  trigger: z.object({
    type: z.enum(['time', 'event', 'consensus']),
    conditions: z.record(z.any()),
  }),
});

// Helper functions
const encryptContent = (content: string) => {
  return CryptoJS.AES.encrypt(content, env.ENCRYPTION_KEY).toString();
};

const decryptContent = (encryptedContent: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, env.ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Routes
capsuleRoutes.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { content, recipients, trigger } = createCapsuleSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const encryptedContent = encryptContent(JSON.stringify(content));

    const capsule = await prisma.capsule.create({
      data: {
        userId,
        content: encryptedContent,
        triggerType: trigger.type,
        conditions: trigger.conditions,
        trigger: {
          create: {
            type: trigger.type,
            conditions: trigger.conditions,
            status: 'pending',
          },
        },
        recipients: {
          create: recipients.map(email => ({
            email,
            status: 'pending',
          })),
        },
        ...(trigger.type === 'consensus' ? {
          consensus: {
            create: {
              threshold: Math.ceil(recipients.length * 0.66), // 66% consensus required
              members: {
                create: recipients.map(email => ({
                  userId,
                })),
              },
            },
          },
        } : {}),
      },
      include: {
        trigger: true,
        recipients: true,
        consensus: {
          include: {
            members: true,
          },
        },
      },
    });

    res.status(201).json(capsule);
  } catch (error) {
    next(error);
  }
});

capsuleRoutes.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const capsules = await prisma.capsule.findMany({
      where: {
        OR: [
          { userId },
          { recipients: { some: { email: req.user.email } } },
        ],
      },
      include: {
        trigger: true,
        recipients: true,
        consensus: {
          include: {
            members: true,
          },
        },
      },
    });

    res.json(capsules);
  } catch (error) {
    next(error);
  }
});

capsuleRoutes.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const capsule = await prisma.capsule.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { recipients: { some: { email: req.user.email } } },
        ],
      },
      include: {
        trigger: true,
        recipients: true,
        consensus: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!capsule) {
      throw new AppError('Capsule not found', 404);
    }

    // Only decrypt content if capsule is unsealed
    if (capsule.status === 'unsealed') {
      const decryptedContent = decryptContent(capsule.content);
      capsule.content = decryptedContent;
    }

    res.json(capsule);
  } catch (error) {
    next(error);
  }
});

capsuleRoutes.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const capsule = await prisma.capsule.findFirst({
      where: { id, userId },
    });

    if (!capsule) {
      throw new AppError('Capsule not found or unauthorized', 404);
    }

    await prisma.capsule.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
