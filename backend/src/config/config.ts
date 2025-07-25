import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DEFAULT_RATE_LIMIT = 900000; // 15 minutes in milliseconds
const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW || DEFAULT_RATE_LIMIT.toString(), 10);
const windowMs = rateLimitWindow;

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  database: {
    url: process.env.DATABASE_URL
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
  },
  
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@koosi.io'
  },
  
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    dir: process.env.UPLOAD_DIR || 'uploads'
  },
  
  rateLimit: {
    window: windowMs as number,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  }
};
