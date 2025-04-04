import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infra/logger/logger';
import { BitbucketEventType, BitbucketPullRequestEventPayload, BitbucketPushEventPayload } from '../../types/bitbucket';
import { WebhookService } from '../../domain/services/webhook_service';
import { WebhookServiceFactory } from '../../domain/factories/webhook_service_factory';

export class WebhookController {
  private webhookService: WebhookService;

  constructor() {
    // Use the factory to get a properly configured service with all dependencies
    this.webhookService = WebhookServiceFactory.create();
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
        case 'pullrequest:created':
          await this.handlePullRequestCreated(payload as BitbucketPullRequestEventPayload);
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

  private async handlePullRequestCreated(payload: BitbucketPullRequestEventPayload): Promise<void> {
    logger.info(`Processing pull request created event from ${payload.actor.display_name} for repository: ${payload.repository.full_name}`);
    await this.webhookService.processPullRequestCreated(payload);
  }

  private async handleRepoPush(payload: BitbucketPushEventPayload): Promise<void> {
    logger.info(`Processing push from ${payload.actor.display_name} to ${payload.repository.full_name}`);
    
    // Forward to the service for processing
    await this.webhookService.processRepoPush(payload);
  }
} 