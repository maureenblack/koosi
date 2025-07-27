import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { capsuleRoutes } from './routes/capsule.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply rate limiting to API routes
app.use('/api', rateLimit({
  windowMs: config.rateLimit.window,
  max: config.rateLimit.max,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
}) as unknown as express.RequestHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/capsules', capsuleRoutes);

// Routes
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Koosi API' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

export { app };
