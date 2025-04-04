import type { NextFunction, Request, Response } from 'express';
import { logger } from '../../infra/logger/logger';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction,
): Response => {
  if (error instanceof AppError) {
    logger.error(`${error.statusCode} - ${error.message}`);
    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  logger.error(`500 - ${error.message}`);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
