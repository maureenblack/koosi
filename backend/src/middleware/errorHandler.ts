import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
    return;
  }

  if (err instanceof PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (err.code) {
      case 'P2002':
        res.status(409).json({
          status: 'error',
          message: 'A record with this value already exists.'
        });
        return;
      case 'P2025':
        res.status(404).json({
          status: 'error',
          message: 'Record not found.'
        });
        return;
      default:
        console.error('Prisma Error:', err);
    }
  }

  // Default error
  console.error('Unhandled Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
