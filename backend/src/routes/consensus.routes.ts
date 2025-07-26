import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import type { AuthRequest } from '../middleware/auth';

export const consensusRoutes = Router();

// Validation schemas
const voteSchema = z.object({
  vote: z.enum(['approved', 'rejected']),
});

// Routes
consensusRoutes.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const consensusGroups = await prisma.consensusGroup.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        capsule: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json(consensusGroups);
  } catch (error) {
    next(error);
  }
});

consensusRoutes.post('/:groupId/vote', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { vote } = voteSchema.parse(req.body);

    // Check if user is a member of the consensus group
    const membership = await prisma.consensusGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      include: {
        group: {
          include: {
            capsule: {
              include: {
                trigger: true,
              },
            },
            members: true,
          },
        },
      },
    });

    if (!membership) {
      throw new AppError('Not a member of this consensus group', 403);
    }

    if (membership.vote) {
      throw new AppError('Already voted', 400);
    }

    // Record the vote
    await prisma.consensusGroupMember.update({
      where: {
        id: membership.id,
      },
      data: {
        vote,
        votedAt: new Date(),
      },
    });

    // Check if consensus threshold is reached
    const group = membership.group;
    const approvedVotes = group.members.filter(m => m.vote === 'approved').length;
    const rejectedVotes = group.members.filter(m => m.vote === 'rejected').length;
    const totalVotes = approvedVotes + rejectedVotes;

    if (totalVotes >= group.members.length) {
      const consensusReached = approvedVotes >= group.threshold;

      // Update trigger status based on consensus
      await prisma.trigger.update({
        where: {
          capsuleId: group.capsule.id,
        },
        data: {
          status: consensusReached ? 'completed' : 'failed',
          evidence: {
            approvedVotes,
            rejectedVotes,
            threshold: group.threshold,
          },
        },
      });

      // Update capsule status if consensus is reached
      if (consensusReached) {
        await prisma.capsule.update({
          where: {
            id: group.capsule.id,
          },
          data: {
            status: 'unsealed',
          },
        });
      }
    }

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    next(error);
  }
});
