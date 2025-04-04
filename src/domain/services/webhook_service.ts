import { logger } from '../../infra/logger/logger';
import { BitbucketPullRequestEventPayload, BitbucketPushEventPayload } from '../../types/bitbucket';
import { BitbucketService } from './bitbucket_service';
import { ParsedDiff } from '../../types/bitbucket_api';
import { IAIProvider } from './ai_provider';
import { IPromptService } from './prompt_service';
import fs from 'fs';

/**
 * Interface for webhook processing services
 */
export interface IWebhookService {
  processPullRequestCreated(payload: BitbucketPullRequestEventPayload): Promise<void>;
  processRepoPush(payload: BitbucketPushEventPayload): Promise<void>;
}

export class WebhookService implements IWebhookService {
  private bitbucketService: BitbucketService;
  private aiProvider: IAIProvider;
  private promptService: IPromptService;

  constructor(
    bitbucketService: BitbucketService, 
    aiProvider: IAIProvider,
    promptService: IPromptService
  ) {
    this.bitbucketService = bitbucketService;
    this.aiProvider = aiProvider;
    this.promptService = promptService;
  }

  /**
   * Process a Bitbucket pullrequest:created event
   * @param payload The webhook payload
   */
  async processPullRequestCreated(payload: BitbucketPullRequestEventPayload): Promise<void> {
    try {
      const { actor, repository, pullrequest } = payload;
      logger.info(`Processing pull request created event from ${actor.display_name} for repository: ${repository.full_name}`);

      logger.info(`Pull request title: ${pullrequest.title}`);
      logger.info(`Pull request description: ${pullrequest.description}`);
      logger.info(`Pull request state: ${pullrequest.state}`);
      logger.info(`Pull request type: ${pullrequest.type}`);

      // Get PR diffs for analysis
      const diffs = await this.getPullRequestDiffs(repository.full_name, pullrequest.id);
      
      // Skip if no diffs were found
      if (diffs.length === 0) {
        logger.info('No code changes found to analyze');
        return;
      }
      
      const prompt = this.promptService.createPullRequestAnalysisPrompt(
        diffs,
        actor.display_name,
        repository.full_name,
        pullrequest.title,
        pullrequest.description
      );

      fs.writeFileSync('prompt.md', prompt);
      
      // Send to AI for analysis
      logger.info('Sending PR changes to AI for analysis');
      const analysisResult = await this.aiProvider.generateText(prompt, {
        temperature: 0.1,
        max_tokens: 1000
      });

      fs.writeFileSync('analysis_result.md', analysisResult);
      
      // logger.info('AI analysis completed with size: ' + analysisResult.length);

      logger.info('Finished processing pull request event');
    } catch (error) {
      logger.error(`Error processing pull request created event: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Process a Bitbucket repo:push event
   * @param payload The webhook payload
   */
  async processRepoPush(payload: BitbucketPushEventPayload): Promise<void> {
    try {
      logger.info(`Processing push event for repository: ${payload.repository.full_name}`);

      // Extract relevant information
      const { actor, repository, push } = payload;

      const allDiffs: ParsedDiff[] = [];
      // Process each change in the push
      for (const change of push.changes) {
        if (!change.new || !change.new.target) {
          logger.warn('Change has no new target information, skipping');
          continue;
        }

        const newCommit = change.new.target;
        const targetBranch = change.new.name;

        logger.info(`Target branch: ${targetBranch}`);
        // Check if the target branch is a branch that we want to analyze

        logger.info(`New commit: ${newCommit.hash.substring(0, 7)} by ${actor.display_name}`);
        logger.info(`Commit message: ${newCommit.message}`);

        // Fetch diff from Bitbucket API
        const parsedDiffs = await this.getCommitDiffs(repository.full_name, newCommit.hash);
        logger.debug(`Retrieved ${parsedDiffs.length} diffs`);
        allDiffs.push(...parsedDiffs);
      }

      // Skip if no diffs were found
      if (allDiffs.length === 0) {
        logger.info('No code changes found to analyze');
        return;
      }

      // Generate prompt for AI analysis using the prompt service
      const prompt = this.promptService.createCodePushAnalysisPrompt(
        allDiffs,
        actor.display_name,
        repository.full_name,
        push.changes[0].new?.target?.message || 'No commit message'
      );

      // Send to AI for analysis
      logger.info('Sending code changes to AI for analysis');
      const analysisResult = await this.aiProvider.generateText(prompt, {
        temperature: 0.1, // Lower temperature for more focused, deterministic responses
        max_tokens: 1000  // Limit response size
      });

      logger.info('AI analysis completed with size: ' + analysisResult.length);

      // TODO: Send the analysis result to Google Chat
      logger.info('Analysis result should be sent to Google Chat');

      logger.info('Finished processing push event');
    } catch (error) {
      logger.error(`Error processing push event: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get diffs for a specific commit
   */
  private async getCommitDiffs(repository: string, commitHash: string): Promise<ParsedDiff[]> {
    try {
      const rawDiff = await this.bitbucketService.getCommitDiff({
        repository,
        commitHash,
        context: 3 // Include 3 lines of context around changes
      });

      // Parse the raw diff into a more structured format
      return this.bitbucketService.parseDiff(rawDiff);
    } catch (error) {
      logger.error(`Error getting commit diffs: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get diffs for a specific pull request
   */
  private async getPullRequestDiffs(repository: string, pullRequestId: number): Promise<ParsedDiff[]> {
    try {
      const diffs = await this.bitbucketService.getPullRequestDiff(repository, pullRequestId);
      return diffs.flatMap(diff => this.bitbucketService.parseDiff(diff));
    } catch (error) {
      logger.error(`Error getting PR diffs: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
} 