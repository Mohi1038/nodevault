// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';

  logger.error(`${req.method} ${req.path} - ${statusCode} - ${message}`);
  if (!(err instanceof AppError)) {
    logger.error(err.stack || '');
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code: errorCode,
  });
};
