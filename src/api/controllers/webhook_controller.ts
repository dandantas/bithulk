import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infra/logger/logger';
import { BitbucketEventType, BitbucketPushEventPayload } from '../../types/bitbucket';
import { WebhookService } from '../../domain/services/webhook_service';

export class WebhookController {
  private webhookService: WebhookService;

  constructor() {
    this.webhookService = new WebhookService();
  }

  handleWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const eventType = req.eventType as BitbucketEventType;
      const payload = req.body;

      logger.info(`Processing ${eventType} event`);

      switch (eventType) {
        case 'repo:push':
          await this.handleRepoPush(payload as BitbucketPushEventPayload);
          break;
        
        default:
          logger.info(`Event type ${eventType} is not currently handled`);
      }

      return res.status(200).json({ 
        status: 'success', 
        message: `Webhook received: ${eventType}` 
      });
    } catch (error) {
      next(error);
    }
  };

  private async handleRepoPush(payload: BitbucketPushEventPayload): Promise<void> {
    logger.info(`Processing push from ${payload.actor.display_name} to ${payload.repository.full_name}`);
    
    // Forward to the service for processing
    await this.webhookService.processRepoPush(payload);
  }
} 