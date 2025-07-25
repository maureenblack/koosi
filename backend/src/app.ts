import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { capsuleRoutes } from './routes/capsule.routes';
import { triggerRoutes } from './routes/trigger.routes';
import { consensusRoutes } from './routes/consensus.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.window,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/consensus', consensusRoutes);

// Error handling
app.use(errorHandler);

export { app };
