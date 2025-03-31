import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infra/logger/logger';
import { AppError } from './error_handler';

export const validateWebhookRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Validate headers
    const eventKey = req.headers['x-event-key'] as string;
    
    if (!eventKey) {
      throw new AppError('Missing X-Event-Key header', 400);
    }
    
    // Validate body
    if (!req.body) {
      throw new AppError('Missing request body', 400);
    }
    
    // Check if the body has repository information
    if (!req.body.repository) {
      throw new AppError('Missing repository information in the payload', 400);
    }
    
    logger.info(`Received webhook event: ${eventKey}`);
    
    // Add event type to request for easier access in controllers
    req.eventType = eventKey;
    
    next();
  } catch (error) {
    next(error);
  }
};

// Add custom property to Express Request
declare global {
  namespace Express {
    interface Request {
      eventType?: string;
    }
  }
} 