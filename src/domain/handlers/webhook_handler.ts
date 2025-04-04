import { logger } from '../../infra/logger/logger';
import type {
  BitbucketEventType,
  BitbucketPullRequestEventPayload,
  BitbucketPushEventPayload,
} from '../../types/bitbucket';
import type { WebhookService } from '../services/webhook_service';

/**
 * Handles webhook events from Bitbucket independently of the web framework
 */
export class WebhookHandler {
  constructor(private webhookService: WebhookService) {}

  /**
   * Handle a Bitbucket webhook event
   * @param eventType The type of Bitbucket event
   * @param payload The webhook payload
   */
  async handleWebhookEvent(eventType: BitbucketEventType, payload: any): Promise<void> {
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
  }

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
