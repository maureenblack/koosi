import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

export const userRoutes = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  walletAddress: z.string().optional(),
});

// Update profile
userRoutes.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.walletAddress) updateData.walletAddress = validatedData.walletAddress;

    // If changing password, verify current password
    if (validatedData.newPassword) {
      if (!validatedData.currentPassword) {
        throw new AppError('Current password is required', 400);
      }
      const validPassword = await bcrypt.compare(validatedData.currentPassword, user.password);
      if (!validPassword) {
        throw new AppError('Invalid current password', 401);
      }
      updateData.password = await bcrypt.hash(validatedData.newPassword, 10);
    }

    // If changing email, verify it's not taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: updateData.email } });
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        googleId: true,
        githubId: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.format() });
    } else if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
