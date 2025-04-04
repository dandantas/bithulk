import type { NextFunction, Request, Response } from 'express';
import { WebhookServiceFactory } from '../../domain/factories/webhook_service_factory';
import type { WebhookService } from '../../domain/services/webhook_service';
import { logger } from '../../infra/logger/logger';
import type {
  BitbucketEventType,
  BitbucketPullRequestEventPayload,
  BitbucketPushEventPayload,
} from '../../types/bitbucket';

export class WebhookController {
  private webhookService: WebhookService;

  constructor() {
    // Use the factory to get a properly configured service with all dependencies
    this.webhookService = WebhookServiceFactory.create();
  }

  handleWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
    // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
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
        message: `Webhook received: ${eventType}`,
      });
    } catch (error) {
      next(error);
    }
  };

  private async handlePullRequestCreated(payload: BitbucketPullRequestEventPayload): Promise<void> {
    logger.info(
      `Processing pull request created event from ${payload.actor.display_name} for repository: ${payload.repository.full_name}`,
    );
    await this.webhookService.processPullRequestCreated(payload);
  }

  private async handleRepoPush(payload: BitbucketPushEventPayload): Promise<void> {
    logger.info(
      `Processing push from ${payload.actor.display_name} to ${payload.repository.full_name}`,
    );

    // Forward to the service for processing
    await this.webhookService.processRepoPush(payload);
  }
}
