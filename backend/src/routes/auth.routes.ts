import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma';
import env from '../config/env';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const authRoutes = Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const emailSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const socialLoginSchema = z.object({
  token: z.string(),
  provider: z.enum(['google', 'github', 'twitter']),
});

// Helper function to generate JWT token
const generateToken = (user: { id: string; email: string }) => {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: '7d' });
};

// Signup route
authRoutes.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.format() });
    } else if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Login route
authRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.format() });
    } else if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Email signup route
authRoutes.post('/email/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = emailSignupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const user = await prisma.user.create({
      data: {
        email,
        password, // Note: In production, hash the password before storing
        name: name || email.split('@')[0],
      },
    });

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

// Email login route
authRoutes.post('/email/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = emailLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) { // Note: In production, use proper password comparison
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Social login route
authRoutes.post('/social/login', async (req: Request, res: Response) => {
  try {
    const { token, provider } = socialLoginSchema.parse(req.body);
    let payload: { email?: string; name?: string; sub?: string } | null = null;

    switch (provider) {
      case 'google':
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: env.GOOGLE_CLIENT_ID,
        });
        const googlePayload = ticket.getPayload();
        if (googlePayload) {
          payload = {
            email: googlePayload.email,
            name: googlePayload.name,
            sub: googlePayload.sub,
          };
        }
        break;

      case 'github':
        // TODO: Implement GitHub OAuth verification
        throw new AppError('GitHub login not implemented yet', 501);

      case 'twitter':
        // TODO: Implement Twitter OAuth verification
        throw new AppError('Twitter login not implemented yet', 501);

      default:
        throw new AppError('Invalid provider', 400);
    }

    if (!payload?.email) {
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
          name: payload.name || payload.email.split('@')[0],
          googleId: provider === 'google' ? payload.sub : undefined,
        },
      });
    }

    const authToken = generateToken({ id: user.id, email: user.email });
    res.json({ token: authToken });
  } catch (error) {
    if (error instanceof Error) {
      res.status(error instanceof AppError ? error.statusCode : 400).json({ error: error.message });
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
