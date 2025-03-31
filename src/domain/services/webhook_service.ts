import { logger } from '../../infra/logger/logger';
import { BitbucketPushEventPayload } from '../../types/bitbucket';

export class WebhookService {
  /**
   * Process a Bitbucket repo:push event
   * @param payload The webhook payload
   */
  async processRepoPush(payload: BitbucketPushEventPayload): Promise<void> {
    try {
      logger.info(`Processing push event for repository: ${payload.repository.full_name}`);
      
      // Extract relevant information
      const { actor, repository, push } = payload;
      
      // Process each change in the push
      for (const change of push.changes) {
        if (!change.new || !change.new.target) {
          logger.warn('Change has no new target information, skipping');
          continue;
        }
        
        const newCommit = change.new.target;
        
        logger.info(`New commit: ${newCommit.hash.substring(0, 7)} by ${actor.display_name}`);
        logger.info(`Commit message: ${newCommit.message}`);
        
        // TODO: In future steps, we'll add:
        // 1. Fetch diff from Bitbucket API
        // 2. Send to OpenAI for analysis
        // 3. Send results to Google Chat
      }
      
      logger.info('Finished processing push event');
    } catch (error) {
      logger.error(`Error processing push event: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
} 