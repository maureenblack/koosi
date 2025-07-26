import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import type { AuthRequest } from '../middleware/auth';

export const triggerRoutes = Router();

// Validation schemas
const updateTriggerSchema = z.object({
  status: z.enum(['pending', 'active', 'completed', 'failed']),
  evidence: z.record(z.any()).optional(),
});

// Routes
triggerRoutes.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const triggers = await prisma.trigger.findMany({
      where: {
        capsule: {
          OR: [
            { userId },
            { recipients: { some: { email: req.user.email } } },
          ],
        },
      },
      include: {
        capsule: {
          include: {
            recipients: true,
          },
        },
      },
    });

    res.json(triggers);
  } catch (error) {
    next(error);
  }
});

triggerRoutes.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { status, evidence } = updateTriggerSchema.parse(req.body);

    const trigger = await prisma.trigger.findFirst({
      where: {
        id,
        capsule: {
          OR: [
            { userId },
            { recipients: { some: { email: req.user.email } } },
          ],
        },
      },
      include: {
        capsule: true,
      },
    });

    if (!trigger) {
      throw new AppError('Trigger not found or unauthorized', 404);
    }

    // Update trigger status
    const updatedTrigger = await prisma.trigger.update({
      where: { id },
      data: {
        status,
        evidence,
        ...(status === 'completed' ? {
          capsule: {
            update: {
              status: 'unsealed',
            },
          },
        } : {}),
      },
      include: {
        capsule: true,
      },
    });

    res.json(updatedTrigger);
  } catch (error) {
    next(error);
  }
});
